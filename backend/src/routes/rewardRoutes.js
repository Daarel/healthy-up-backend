import express from 'express';

import RewardController from '../controllers/rewardController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(protect, RewardController.getRewards)
  .post(protect, adminOnly, RewardController.createReward);

router.route('/:id').delete(protect, adminOnly, RewardController.deleteReward);

router.patch(
  '/:id/toggle',
  protect,
  adminOnly,
  RewardController.toggleRewardStatus,
);

router.get('/my-rewards', protect, RewardController.getMyRewards);
router.post('/claim', protect, RewardController.claimReward);
router.post('/verify', protect, RewardController.verifyAndUseCoupon);

export default router;
