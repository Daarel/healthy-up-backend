import express from 'express';

// Menggunakan import Class sesuai arsitektur yang baru
import UserController from '../controllers/userController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/all-users', protect, adminOnly, UserController.getAllUsers);

router.use('/user', protect);

router
  .route('/user')
  .get(UserController.getUserProfile)
  .delete(UserController.deleteProfile);

router.patch('/user/picture', protect, UserController.updatePicture);
router.post('/user/level-up', protect, UserController.levelUp);

export default router;
