import { z } from 'zod';

import {
  createHealthProfileSchema,
  createWeightLogsSchema,
} from '../schemas/healthProfileSchema.js';
import HealthProfileService from '../services/healthProfileService.js';

class HealthProfileController {
  /**
   * * @desc    Add Health Profile Data User
   * ! @route   POST /api/v1/health-profiles/
   * ? @access  Private
   */
  static async createProfile(req, res) {
    try {
      const validatedData = createHealthProfileSchema.parse(req.body);
      const userId = req.user.id;

      const newProfile = await HealthProfileService.createProfile(
        userId,
        validatedData,
      );

      return res.status(201).json({
        status: 'success',
        message: 'Profil kesehatan berhasil disimpan',
        data: { profile: newProfile },
      });
    } catch (err) {
      if (err instanceof z.ZodError)
        return HealthProfileController.handleZodError(err, res);

      if (err.message === 'PROFILE_ALREADY_EXISTS') {
        return res.status(400).json({
          status: 'error',
          message: 'Profil kesehatan untuk pengguna ini sudah ada',
        });
      }

      return HealthProfileController.handleServerError(
        err,
        res,
        'Error at createProfile',
      );
    }
  }

  /**
   * * @desc    Get User Calories Data
   * ! @route   GET /api/v1/health-profiles/calories-summary
   * ? @access  Private
   */
  static async getCaloriesSummary(req, res) {
    try {
      const userId = req.user.id;
      const summaryData = await HealthProfileService.getCaloriesSummary(userId);

      return res.status(200).json({
        status: 'success',
        data: summaryData,
      });
    } catch (err) {
      return HealthProfileController.handleServerError(
        err,
        res,
        'Gagal mengambil data dashboard summary',
      );
    }
  }

  /**
   * * @desc    Get User Daily Weight Loss
   * ! @route   GET /api/v1/health-profiles/weight-logs
   * ? @access  Private
   */
  static async getWeightLog(req, res) {
    try {
      const userId = req.user.id;
      const weightLogs = await HealthProfileService.getWeightLogs(userId);

      return res.status(200).json({
        status: 'success',
        data: { weightLogs },
      });
    } catch (err) {
      return HealthProfileController.handleServerError(
        err,
        res,
        'Gagal fetch weight logs',
      );
    }
  }

  /**
   * * @desc    Add User Daily Weight Loss
   * ! @route   POST /api/v1/health-profiles/weight-logs
   * ? @access  Private
   */
  static async createWeightLog(req, res) {
    try {
      const { weight } = createWeightLogsSchema.parse(req.body);
      const userId = req.user.id;

      const { newWeightLog, updatedHealthProfile } =
        await HealthProfileService.createWeightLogAndUpdateProfile(
          userId,
          weight,
        );

      return res.status(201).json({
        status: 'success',
        message:
          'Berat badan berhasil dicatat dan profil kesehatan telah diperbarui!',
        data: {
          weightLog: newWeightLog,
          currentWeight: updatedHealthProfile.weight,
        },
      });
    } catch (err) {
      if (err instanceof z.ZodError)
        return HealthProfileController.handleZodError(err, res);

      if (err.code === 'P2025') {
        return res.status(404).json({
          status: 'error',
          message: 'Profil kesehatan belum dibuat untuk pengguna ini.',
        });
      }

      return HealthProfileController.handleServerError(
        err,
        res,
        'Error creating weight log',
      );
    }
  }

  // --- Helper Methods ---
  static handleZodError(err, res) {
    return res.status(400).json({
      status: 'fail',
      errors: err.errors.map((e) => ({
        field: e.path[0],
        message: e.message,
      })),
    });
  }

  static handleServerError(err, res, contextMsg = 'Internal server error') {
    console.error(`HealthProfileController Error (${contextMsg}):`, err);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server saat memproses permintaan.',
    });
  }
}

export default HealthProfileController;
