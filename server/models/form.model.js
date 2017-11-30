import Sequelize from 'sequelize';
import sequelize from '../../config/sequelize';
import FD from './formDefinition.model';

const Form = sequelize.define('Form', {
    FormId: { type: Sequelize.UUIDV4, primaryKey: true},
    FormDefinitionId: Sequelize.UUIDV4
},
{
    timestamps: false,
    freezeTableName: true,
    schema: 'iep'
});

Form.belongsTo(FD, {as: 'definition', foreignKey: 'FormDefinitionId'});
FD.hasOne(Form, {foreignKey: 'FormDefinitionId'})

export default Form;