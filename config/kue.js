import kue from 'kue';
import Promise from 'bluebird';
import config from './config';
import FFV from '../server/models/formFieldValue.model'

const queue = kue.createQueue({
    redis: config.redisConnectionString
});

export default queue;