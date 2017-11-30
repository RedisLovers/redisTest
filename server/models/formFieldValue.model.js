import Sequelize from 'sequelize';
import sequelize from '../../config/sequelize';

const FFV = sequelize.define('FormFieldValue', {
    FormFieldValueId: { type: Sequelize.UUIDV4, primaryKey: true},
    FormId: Sequelize.STRING,
    FormFieldDefinitionId: Sequelize.STRING,
    ValueString: Sequelize.STRING,
},
{
    hasTrigger: true,
    timestamps: false,
    freezeTableName: true,
    schema: 'iep'
});

export default FFV;