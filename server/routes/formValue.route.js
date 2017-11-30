import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import formValuesCtrl from '../controllers/formValues.controller';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/form-values - Get list of users */
  // .get(faormValuesCtrl.list)

  /** POST /api/form-values - Create new user */
  // .post(faormValuesCtrl.create);

router.route('/:formId')
  /** GET /api/form-values/:formId - Get user */
  .get(formValuesCtrl.get)

router.route('/:fieldId') /** PUT /api/form-values/:formId - Update user */
  .put(formValuesCtrl.update)

  /** DELETE /api/form-values/:formId - Delete user */
  // .delete(faormValuesCtrl.remove);

/** Load user when API with userId route parameter is hit */
// router.param('userId', faormValuesCtrl.load);

export default router;
