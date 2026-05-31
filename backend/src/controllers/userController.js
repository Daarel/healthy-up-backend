import { z } from 'zod';

import {
  getAllUsersSchema,
  updateProfilePictureSchema, // Pastikan ini sudah dibuat di schemas/userSchema.js
} from '../schemas/userSchema.js';
import UserService from '../services/userService.js';

class UserController {
  /**
   * * @desc    Get User Information
   * ! @route   GET /api/v1/users/profile
   * ? @access  Private
   */
  static async getUserProfile(req, res) {
    try {
      const userId = req.user.id;
      const userProfile = await UserService.getUserProfile(userId);

      return res.status(200).json({
        status: 'success',
        data: { user: userProfile },
      });
    } catch (err) {
      if (err.message === 'USER_NOT_FOUND') {
        return res.status(404).json({
          status: 'error',
          message: 'Pengguna tidak ditemukan',
        });
      }
      return UserController.handleServerError(
        err,
        res,
        'Terjadi kesalahan saat mengambil profil',
      );
    }
  }

  /**
   * * @desc    DELETE User Information
   * ! @route   DELETE /api/v1/users/profile
   * ? @access  Private
   */
  static async deleteProfile(req, res) {
    try {
      const userId = req.user.id;
      await UserService.deleteUserProfile(userId);

      res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
      });

      return res.status(200).json({
        status: 'success',
        message: 'Akun dan seluruh data Anda telah dihapus secara permanen.',
        action: 'redirect_to_login',
      });
    } catch (err) {
      return UserController.handleServerError(
        err,
        res,
        'Terjadi kesalahan saat menghapus akun',
      );
    }
  }

  /**
   * * @desc    Get All User Information
   * ! @route   GET /api/v1/users/all-users
   * ? @access  Admin
   */
  static async getAllUsers(req, res) {
    try {
      const { page, limit } = getAllUsersSchema.parse(req.query);

      const result = await UserService.getAllUsersWithPagination(page, limit);

      return res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (err) {
      if (err instanceof z.ZodError)
        return UserController.handleZodError(err, res);
      return UserController.handleServerError(err, res);
    }
  }

  /**
   * * @desc    Update User Profile Picture
   * ! @route   PATCH /api/v1/users/profile/picture
   * ? @access  Private
   */
  static async updatePicture(req, res) {
    try {
      const userId = req.user.id;
      const { imageUrl } = updateProfilePictureSchema.parse(req.body);

      const updatedUser = await UserService.updateProfilePicture(
        userId,
        imageUrl,
      );

      return res.status(200).json({
        status: 'success',
        message: 'Foto profil berhasil diperbarui',
        data: { user: updatedUser },
      });
    } catch (err) {
      if (err instanceof z.ZodError)
        return UserController.handleZodError(err, res);
      return UserController.handleServerError(
        err,
        res,
        'Gagal memperbarui foto profil',
      );
    }
  }

  /**
   * * @desc    Level Up User and Update Title
   * ! @route   POST /api/v1/users/level-up
   * ? @access  Private
   */
  static async levelUp(req, res) {
    try {
      const userId = req.user.id;
      const updatedUser = await UserService.processLevelUp(userId);

      return res.status(200).json({
        status: 'success',
        message: `Selamat! Anda berhasil naik ke Level ${updatedUser.level}`,
        data: { user: updatedUser },
      });
    } catch (err) {
      if (err.message === 'USER_NOT_FOUND') {
        return res
          .status(404)
          .json({ status: 'error', message: 'Pengguna tidak ditemukan' });
      }
      if (err.message === 'INSUFFICIENT_EXP') {
        return res.status(400).json({
          status: 'error',
          message: 'EXP Anda belum cukup untuk naik level',
        });
      }
      return UserController.handleServerError(
        err,
        res,
        'Gagal memproses kenaikan level',
      );
    }
  }

  // helper methods
  static handleZodError(err, res) {
    const validationIssues = err.issues || err.errors || [];
    return res.status(400).json({
      status: 'fail',
      errors: validationIssues.map((e) => ({
        field: e.path[0] || 'payload',
        message: e.message,
      })),
    });
  }

  static handleServerError(err, res) {
    console.error('Terjadi Kesalahan di Controller:', err);

    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
}

export default UserController;
