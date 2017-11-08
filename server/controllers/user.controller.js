import rc from '../../config/redis';
import uuid from 'uuid';
import kue from 'kue';
const queue = kue.createQueue();

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
    console.time('Get one user from redis');
    const user = await rc.hgetallAsync(`user:${req.params.id}`);
    console.timeEnd('Get one user from redis');
    res.status(200).json(user);
  }
  catch(err){
    res.sendStatus(500);
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
    console.log(req.body)
    console.time("Update one record in redis");
    const results = await rc.batch()
                      .hmset(`user:${req.params.id}`, 'name', req.body.name, 'updatedBy', 'Timur', 'updatedAt', new Date())
                      .hgetall(`user:${req.params.id}`)
                      .execAsync();
    console.timeEnd("Update one record in redis");
    const user = results[1];
    const job = queue.create('userupdate', user).save( function(err){
      if( !err ){
        return res.status(200).json(user);
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
