import express from 'express';

import HealthProfileController from '../controllers/healthProfileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, HealthProfileController.createProfile);
router.get(
  '/calories-summary',
  protect,
  HealthProfileController.getCaloriesSummary,
);

router.use('/weight-logs', protect);
router
  .route('/weight-logs')
  .get(HealthProfileController.getWeightLog)
  .post(HealthProfileController.createWeightLog);

export default router;
