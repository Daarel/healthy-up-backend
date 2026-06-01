import express from 'express';

import MissionController from '../controllers/missionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', protect, MissionController.generateMissions);
router.get('/progress/weekly', protect, MissionController.getWeeklyProgress);

router.get('/:id', protect, MissionController.getMissionById);
router.patch('/:id/status', protect, MissionController.updateMissionStatus);

export default router;
