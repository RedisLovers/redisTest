import kue from 'kue';
import config from './config/config';
import FFV from './server/models/formFieldValue.model'
const queue = kue.createQueue({
    redis: config.redisConnectionString
});

kue.Job.range(0, -1, 'desc', (err, jobs) => {
    jobs.forEach(job => {
        job.remove();
    })
});

queue.process('FFV:update', function(job, done){
    updateFFV(job.data, done);
});

function updateFFV(val, done){
    console.time('Update FFV');
    const id = val.FormFieldValueId;
    console.log(val);
    delete val.FormFieldValueId;
    FFV.update({...val},
        {where: {FormFieldValueId: id}
    })
    .then(res => {
        console.timeEnd('Update FFV');
            done();
        }
    )
    .catch(err =>{
            console.log(err);
            done();
        }
    );
}