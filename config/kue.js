import kue from 'kue';
import config from './config';

const queue = kue.createQueue({
    redis: config.redisConnectionString
});

export default queue;