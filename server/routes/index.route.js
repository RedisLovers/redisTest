import express from 'express';
import formValueRoutes from './formValue.route';
import formRoutes from './form.route';
// import authRoutes from './auth.route';

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

// mount formValue routes at /form-values
router.use('/form-values', formValueRoutes);
router.use('/forms', formRoutes);


// mount auth routes at /auth
// router.use('/auth', authRoutes);

export default router;
