import bluebird from 'bluebird';
import redis from 'redis';

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const redisClient = redis.createClient();

redisClient.on("error", function (err) {
  console.log("Error " + err);
});

export default  redisClient;