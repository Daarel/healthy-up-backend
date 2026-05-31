import express from 'express';

import RewardController from '../controllers/rewardController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(protect, RewardController.getRewards)
  .post(protect, adminOnly, RewardController.createReward);

export default router;
