import Sequelize from 'sequelize';
import config from './config';

console.log(config.sqlServerConnectionString);
const sequelize = new Sequelize(config.sqlServerConnectionString);
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