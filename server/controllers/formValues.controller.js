import Promise from 'bluebird';
import rc from '../../config/redis';
import uuid from 'uuid';
import queue from '../../config/kue';
import FFV from '../models/formFieldValue.model';

/**
 * Load user and append to req.
 */
function load(req, res, next, id) {
}

/**
 * Get user
 * @returns {User}
 */
async function get(req, res) {
  try{

    const ffvids = await rc.smembersAsync(`FFVIds:${req.params.formId}`);
    let batch = rc.batch();
    ffvids.forEach(id=>{
      batch.hgetall(`FFV:${id}`);
    });
    const redisValues = await batch.execAsync();
    let FFD_Ops = [];
    let FFDs = {};
    redisValues.forEach(val => {
      let op = rc.hgetallAsync(`FFD:${val.FormFieldDefinitionId}`).then(def => {
        FFDs[def.FormFieldDefinitionId] = def;
      });
      FFD_Ops.push(op);
    })

    await Promise.all(FFD_Ops);
    const sqlValues = await FFV.findAll({
      where: {
        formId: `${req.params.formId}`
      }
    });

    let responseObj = {
      redis: redisValues,
      mssql: sqlValues,
      formFieldDefinitions: FFDs
    }


    res.status(200).json(responseObj);
  }
  catch(err){
    res.status(500).json(err);
  }
}

async function updateRedis(value){
  return new Promise(async (resolve, reject) => {
    console.time("Update one record in redis");
    console.log(value);
    try{
      const results = await rc.hmsetAsync(`FFV:${value.FormFieldValueId}`, value);
    }
    catch(err){
      reject(err);
    }
    console.timeEnd("Update one record in redis");
    const job = queue.create('FFV:update', value).removeOnComplete( true ).save( function(err){
      if( !err ){
        resolve()
      }
      reject(err)
    });
  });
}

async function updateRedisMultiple(values) {
  console.time("Update multiple records in redis");
  return new Promise(async (resolve, reject) => {
    Promise.map(values, (value) => {
      return rc.hmsetAsync(`FFV:${value.FormFieldValueId}`, value);
    }).then(() => {
      console.timeEnd("Update multiple records in redis");
      const job = queue.create('FFV:updateMultiple', values)
        .removeOnComplete(true)
        .save(function(err) {
          console.log('saved', err);
          if( !err ) {
            resolve();
          }
          reject(err);
        });
    }).catch((err) => {
      reject(err);
    });
  });
}

async function updateSql(value){
  return FFV.update({ValueString: value.ValueString},{
    where: {
      FormFieldValueId: value.FormFieldValueId
    }
  })
}

async function updateSqlMultiple(values) {
  return Promise.map(values, (value) => {
    return FFV.update({ValueString: value.ValueString}, {
      where: {
        FormFieldValueId: value.FormFieldValueId
      }
    });
  });
}

async function update(req, res, next) {
  try{
    const value = req.body.value;
    if(req.body.isRedis){
      await updateRedis(value)
    }
    else{
      await updateSql(value)
    }
    res.sendStatus(200);
  }
  catch(err){
    console.log(err);
    res.sendStatus(500).json(err);
  }
}

async function updateMultiple(req, res, next) {
  try {
    const values = req.body.values;
    if (req.body.isRedis) {
      await updateRedisMultiple(values)
    }
    else {
      await updateSqlMultiple(values)
    }
    console.log('done');
    res.sendStatus(200);
  }
  catch (err) {
    console.log(err);
    res.sendStatus(500).json(err);
  }
}

export default { load, get, update, updateMultiple };
