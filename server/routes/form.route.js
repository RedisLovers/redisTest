import express from 'express';
import formsCtrl from '../controllers/forms.controller';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  .get(formsCtrl.list)

export default router;
