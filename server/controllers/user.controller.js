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
function get(req, res) {
  
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
    console.log('Creation started: ' + Date.now());
    console.time('Create user in redis');
    const replies = await rc.multi()
                          .hmset(`user:${newUuid}`, "name", `${newUuid}`, 'createdBy', 'Timur', 'createdAt', new Date(), 'updatedBy', '', 'updatedAt', '')
                          .lpush('users', newUuid)
                          .execAsync();
    console.timeEnd('Create user');

    let job = queue.create('usercreate', {
        id: newUuid,
        name: newUuid,
        createdBy: 'Timur',
        createdAt: null,
        updatedBy: null,
        updatedAt: null
    }).save( function(err){
      if( !err ){
        return res.sendStatus(200);
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
function update(req, res, next) {
  
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
    console.time('GetList');
    const users = await batch.execAsync();
    console.timeEnd('GetList');

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
function remove(req, res, next) {
  
}

export default { load, get, create, update, list, remove };
