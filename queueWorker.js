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
    createdAt: Sequelize.DATE,
    updatedBy: Sequelize.STRING,
    updatedAt: Sequelize.STRING
},
{
    timestamps: false
});


queue.process('usercreate', function(job, done){
    createUser(job.data, done);
});
  
function createUser(user, done) {
    User.create({
        id: user.id,
        name: user.name,
        createdBy: user.createdBy,
        createdAt: user.createdAt || new Date(),
        updatedBy: null,
        updatedAt: null
    })
    .then(res => {
        console.log('Creation finished: ' + Date.now());
            done();
        }
    )
    .catch(err =>{
            console.log('User created');
            done();
        }
    );
}