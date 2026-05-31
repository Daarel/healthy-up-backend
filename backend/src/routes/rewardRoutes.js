import express from 'express';

import RewardController from '../controllers/missionController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, RewardController.getReward);
router.post('/', protect, adminOnly, RewardController.createReward);

export default router;
