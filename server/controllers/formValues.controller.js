import rc from '../../config/redis';
import uuid from 'uuid';
import queue from '../../config/kue';

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
    console.time("Get values");
    const ffvids = await rc.smembersAsync(`FFVIds:${req.params.formId}`);
    let batch = rc.batch();
    ffvids.forEach(id=>{
      batch.hgetall(`FFV:${id}`);
    });
    const values = await batch.execAsync();
    let FFDs = [];
    values.forEach(val => {
      let op = rc.hgetallAsync(`FFD:${val.FormFieldDefinitionId}`).then(def => {
        val.formDefinition = def;
      });
      FFDs.push(op);
    })
    await Promise.all(FFDs);
    console.timeEnd("Get values");
    res.status(200).json(values);
  }
  catch(err){
    res.status(500).json(err);
  }
}

/**
 * Create new user
 * @property {string} req.body.username - The username of user.
 * @property {string} req.body.mobileNumber - The mobileNumber of user.
 * @returns {User}
 */
async function create(req, res, next) {
  const newUuid = uuid.v1();
  try{
    console.time('Create user in redis');
    const replies = await rc.multi()
                          .hmset(`user:${newUuid}`, 'id', newUuid, "name", req.body.name, 'createdBy', 'Timur', 'createdAt', new Date(), 'updatedBy', '', 'updatedAt', '')
                          .lpush('users', newUuid)
                          .execAsync();
    console.timeEnd('Create user in redis');

    const user = {
        id: newUuid,
        name: req.body.name,
        createdBy: 'Timur',
        createdAt: null,
        updatedBy: null,
        updatedAt: null
    }
    const job = queue.create('usercreate', user).save( function(err){
      if( !err ){
        return res.status(200).json(user);
      }
      res.sendStatus(500);
    });

  }
  catch(err){
    res.sendStatus(500);
  }

}

/**
 * Update existing user
 * @property {string} req.body.username - The username of user.
 * @property {string} req.body.mobileNumber - The mobileNumber of user.
 * @returns {User}
 */
async function update(req, res, next) {
  try{
    console.time("Update one record in redis");
    const results = await rc.hmsetAsync(`FFV:${req.params.formId}`, req.body);
    console.timeEnd("Update one record in redis");
    const job = queue.create('FFV:update', req.body).save( function(err){
      if( !err ){
        return res.sendStatus(200);
      }
      res.sendStatus(500);
    });
  }
  catch(err){
    res.sendStatus(500).json(err);;
  }
}

/**
 * Get user list.
 * @property {number} req.query.skip - Number of users to be skipped.
 * @property {number} req.query.limit - Limit number of users to be returned.
 * @returns {User[]}
 */
async function list(req, res, next) {
  try{
    const ids = await rc.lrangeAsync('users', 0, 50);
    let batch = rc.batch();
    ids.forEach(function(id) {
      batch = batch.hgetall(`user:${id}`);
    });
    console.time('Get List of users from redis');
    const users = await batch.execAsync();
    console.timeEnd('Get List of users from redis');

    res.status(200).json(users);
  }
  catch(err){
    res.sendStatus(500);
  }


}

/**
 * Delete user.
 * @returns {User}
 */
async function remove(req, res, next) {
  try{
    const id = req.params.id;
    console.time('Delete user from redis');
    const replies = await rc.multi()
                          .del(`user:${id}`)
                          .lrem('users', 0, id)
                          .execAsync();
    console.timeEnd('Delete user from redis');
    const job = queue.create('userdelete', id).save( function(err){
      if( !err ){
        return res.sendStatus(204);
      }
      res.sendStatus(500);
    });
  }
  catch(err){
    res.sendStatus(500);
  }
}

export default { load, get, create, update, list, remove };
