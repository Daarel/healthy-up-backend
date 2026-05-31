import { z } from 'zod';

import {
  claimRewardSchema,
  createRewardSchema,
  getMyRewardsQuerySchema,
  useCouponSchema,
} from '../schemas/rewardSchema.js';
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

  /**
   * * @desc    Claim / Redeem a Reward
   * ! @route   POST /api/v1/rewards/claim
   * ? @access  Private
   */
  static async claimReward(req, res) {
    try {
      const { rewardId } = claimRewardSchema.parse(req.body);
      const userId = req.user.id;

      const { userReward, remainingPoints } = await RewardService.claimReward(
        userId,
        rewardId,
      );

      return res.status(201).json({
        status: 'success',
        message: `Berhasil menukarkan kupon: ${userReward.reward.name}`,
        data: {
          redemptionCode: userReward.redemptionCode,
          remainingPoints,
        },
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return RewardController.handleZodError(err, res);
      }

      if (err.message === 'REWARD_NOT_FOUND') {
        return res
          .status(404)
          .json({ status: 'error', message: 'Kupon tidak ditemukan' });
      }
      if (err.message === 'REWARD_OUT_OF_STOCK') {
        return res.status(400).json({
          status: 'error',
          message: 'Maaf, kupon ini sudah habis atau tidak aktif',
        });
      }
      if (err.message === 'INSUFFICIENT_POINTS') {
        return res.status(400).json({
          status: 'error',
          message: 'Poin Anda tidak cukup untuk menukarkan kupon ini',
        });
      }

      return RewardController.handleServerError(
        err,
        res,
        'Gagal memproses klaim kupon',
      );
    }
  }

  // Tambahkan di dalam kelas RewardController

  /**
   * * @desc    Use/Verify Coupon at Physical Store
   * ! @route   POST /api/v1/rewards/verify
   * ? @access  Private (Bisa untuk Admin Toko atau User langsung)
   */
  static async verifyAndUseCoupon(req, res) {
    try {
      const { redemptionCode } = useCouponSchema.parse(req.body);

      const { rewardName, username } =
        await RewardService.useCouponAtStore(redemptionCode);

      return res.status(200).json({
        status: 'success',
        message: 'Kupon berhasil diverifikasi dan dihanguskan!',
        data: {
          rewardName,
          username,
          redemptionCode,
        },
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return RewardController.handleZodError(err, res);
      }

      if (err.message === 'INVALID_CODE') {
        return res.status(404).json({
          status: 'error',
          message: 'Kode kupon tidak valid atau tidak ditemukan',
        });
      }
      if (err.message === 'COUPON_ALREADY_USED') {
        return res.status(400).json({
          status: 'error',
          message: 'Kupon ini sudah pernah digunakan sebelumnya!',
        });
      }

      return RewardController.handleServerError(
        err,
        res,
        'Gagal memverifikasi kupon',
      );
    }
  }

  /**
   * * @desc    Get User's Claimed Rewards (My Coupons)
   * ! @route   GET /api/v1/rewards/my-rewards
   * ? @access  Private
   */
  static async getMyRewards(req, res) {
    try {
      const { status } = getMyRewardsQuerySchema.parse(req.query);
      const userId = req.user.id;

      const myRewards = await RewardService.getUserRewards(userId, status);

      return res.status(200).json({
        status: 'success',
        data: {
          total: myRewards.length,
          myRewards,
        },
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return RewardController.handleZodError(err, res);
      }
      return RewardController.handleServerError(
        err,
        res,
        'Gagal mengambil daftar kupon Anda',
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

export default RewardController;
