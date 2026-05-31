import prisma from '../lib/prisma.js';

class RewardService {
  static async getActiveRewards() {
    const rewards = await prisma.reward.findMany({
      where: { isActive: true },
      orderBy: { pointsCost: 'asc' },
    });

    return rewards;
  }

  static async createReward(rewardData) {
    const newReward = await prisma.reward.create({
      data: {
        name: rewardData.name,
        pointsCost: rewardData.pointsCost,
        stockQuantity: rewardData.stockQuantity,
        isActive: rewardData.isActive,
      },
    });

    return newReward;
  }
}

export default RewardService;