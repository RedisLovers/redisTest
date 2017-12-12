import Sequelize from 'sequelize';
import config from './config';

console.log(config.sqlServerConnectionString);
const sequelize = new Sequelize(config.sqlServerConnectionString, {
  pool: {
    max: 10,
    idle: 30000,
    acquire: 30000
  },
  dialectOptions: {
    requestTimeout: 30000 // timeout = 30 seconds
  }
});
sequelize.authenticate().then(() => {
  console.log('Connection has been established successfully.');
})
.catch(err => {
  console.error('Unable to connect to the database:', err);
});

Sequelize.UUIDV4.prototype.toSql = function(){
    return 'UNIQUEIDENTIFIER';
}

export default sequelize;