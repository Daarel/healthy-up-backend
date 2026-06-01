import express from 'express';

import MissionController from '../controllers/missionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', protect, MissionController.generateMissions);
router.get('/progress/weekly', protect, MissionController.getWeeklyProgress);

export default router;