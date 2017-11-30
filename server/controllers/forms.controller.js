import Sequelize from 'sequelize';
import rc from '../../config/redis';
import Form from '../models/form.model'
import FD from '../models/formDefinition.model'
const {in: opIn} = Sequelize.Op;

async function list(req, res, next) {
    try{
        const keys = await rc.scanAsync(0, 'match', 'FFVIds:*', 'count', 10001) //SCAN 0 COUNT 100 MATCH p_*('FFVIds:*');
        let ids = keys[1].map(key =>{
            return key.split(':')[1];
        })
        let forms = await Form.findAll({
            include: [{
                model: FD,
                as: 'definition',
            }],
            where: {
                FormId: {
                    [opIn] : ids
                }
            }
        })
        res.status(200).json(forms);
    }
    catch(err){
        console.log(err);
        res.sendStatus(500);
    }
}

export default {list};