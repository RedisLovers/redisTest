import kue from 'kue';
import Sequelize from 'sequelize';
import config from './config/config';

const queue = kue.createQueue();
const sequelize = new Sequelize(config.sqlServerConnectionString);
sequelize.authenticate().then(() => {
  console.log('Connection has been established successfully.');
})
.catch(err => {
  console.error('Unable to connect to the database:', err);
});

const User = sequelize.define('User', {
    id: { type: Sequelize.UUIDV1, primaryKey: true},
    name: Sequelize.STRING,
    createdBy: Sequelize.STRING,
    createdAt: Sequelize.STRING,//Actually a DATE, but STRING prevents conflicts with SQL server DATETIME
    updatedBy: Sequelize.STRING,
    updatedAt: Sequelize.STRING //Actually a DATE, but STRING prevents conflicts with SQL server DATETIME
},
{
    timestamps: false,
    freezeTableName: true
});

queue.process('userupdate', function(job, done){
    updateUser(job.data, done);
});

queue.process('usercreate', function(job, done){
    createUser(job.data, done);
});
queue.process('userdelete', function(job, done){
    deleteUser(job.data, done);
});
  
function createUser(user, done) {
    console.time('Create single user');
    User.create({
        id: user.id,
        name: user.name,
        createdBy: user.createdBy,
        createdAt: user.createdAt || new Date(Date.now()).toISOString(),
        updatedBy: null,
        updatedAt: user.updatedAt || new Date(Date.now()).toISOString(),
    })
    .then(res => {
        console.timeEnd('Create single user');
            done();
        }
    )
    .catch(err =>{
            console.log(err);
            done();
        }
    );
}

function deleteUser(id, done){
    console.time('Delete single user');
    User.destroy({where: {id: id}})
    .then(res => {
        console.timeEnd('Delete single user');
            done();
        }
    )
    .catch(err =>{
            console.log(err);
            done();
        }
    );
}

function updateUser(user, done){
    console.time('Update single user');
    User.update({
        name: user.name,
        updatedBy: "Timur",
        updatedAt: new Date(Date.now()).toISOString(),
    },
    {where: {id: user.id}}
    )
    .then(res => {
        console.timeEnd('Update single user');
            done();
        }
    )
    .catch(err =>{
            console.log(err);
            done();
        }
    );
}