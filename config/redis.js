import bluebird from 'bluebird';
import redis from 'redis';
import config from './config';

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const redisClient = redis.createClient(config.redisConnectionString);
redisClient.on("connect", function () {
    console.log("Successfully connected to Redis");
});
redisClient.on("error", function (err) {
  console.log("Error " + err);
});

export default redisClient;