import express from 'express';

import HealthProfileController from '../controllers/healthProfileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use('/', protect);
router
  .route('/')
  .get(HealthProfileController.getMyProfile)
  .post(HealthProfileController.createProfile);

router.use('/calories-logs', protect);
router
  .route('/calories-logs')
  .get(HealthProfileController.getCalorieLog)
  .post(HealthProfileController.createCalorieLog);

router.use('/weight-logs', protect);
router
  .route('/weight-logs')
  .get(HealthProfileController.getWeightLog)
  .post(HealthProfileController.createWeightLog);

export default router;
