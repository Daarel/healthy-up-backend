import { z } from 'zod';

import { createRewardSchema } from '../schemas/rewardSchema.js';
import RewardService from '../services/rewardService.js';

class RewardController {
  /**
   * * @desc    Get All Active Rewards
   * ! @route   GET /api/v1/rewards
   * ? @access  Private
   */
  static async getRewards(req, res) {
    try {
      const rewards = await RewardService.getActiveRewards();

      return res.status(200).json({
        status: 'success',
        data: { rewards },
      });
    } catch (err) {
      return RewardController.handleServerError(
        err,
        res,
        'Gagal mengambil daftar reward',
      );
    }
  }

  /**
   * * @desc    Create New Reward Catalog
   * ! @route   POST /api/v1/rewards
   * ? @access  Private (Admin Only)
   */
  static async createReward(req, res) {
    try {
      const validatedData = createRewardSchema.parse(req.body);
      const newReward = await RewardService.createReward(validatedData);

      return res.status(201).json({
        status: 'success',
        message: 'Katalog reward baru berhasil ditambahkan!',
        data: { reward: newReward },
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return RewardController.handleZodError(err, res);
      }
      return RewardController.handleServerError(
        err,
        res,
        'Gagal membuat reward baru',
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

export default RewardController
