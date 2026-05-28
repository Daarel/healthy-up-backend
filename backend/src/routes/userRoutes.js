import express from 'express';

import {
  deleteProfile,
  getAllUsers,
  getUserProfile,
} from '../controllers/userController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/all-users', adminOnly, getAllUsers);
router.use('/user', protect);
router.route('/user').get(getUserProfile).delete(deleteProfile);

export default router;
