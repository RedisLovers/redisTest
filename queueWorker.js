import kue from 'kue';
import Sequelize from 'sequelize';
import config from './config/config';

const queue = kue.createQueue({
    redis: config.redisConnectionString
});
console.log(config.sqlServerConnectionString);
const sequelize = new Sequelize(config.sqlServerConnectionString);
sequelize.authenticate().then(() => {
  console.log('Connection has been established successfully.');
})
.catch(err => {
  console.error('Unable to connect to the database:', err);
});
const FFV = sequelize.define('FormFieldValue', {
    FormFieldValueId: { type: Sequelize.UUIDV1, primaryKey: true},
    FormId: Sequelize.STRING,
    FormFieldDefinitionId: Sequelize.STRING,
    ValueString: Sequelize.STRING,//Actually a DATE, but STRING prevents conflicts with SQL server DATETIME
},
{
    timestamps: false,
    freezeTableName: true,
    schema: 'iep'
});

queue.process('FFV:update', function(job, done){
    updateFFV(job.data, done);
});

function updateFFV(val, done){
    console.time('Update FFV');
    const id = val.FormFieldValueId;
    delete val.FormFieldValueId;
    FFV.update({...val},
    {where: {FormFieldValueId: id}}
    )
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