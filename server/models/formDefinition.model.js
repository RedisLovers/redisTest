import Sequelize from 'sequelize';
import sequelize from '../../config/sequelize';
import Form from './form.model';

const FD = sequelize.define('FormDefinition', {
    FormDefinitionId: { type: Sequelize.UUIDV4, primaryKey: true},
    Name: Sequelize.STRING,
},
{
    timestamps: false,
    freezeTableName: true,
    schema: 'iep'
});

export default FD;