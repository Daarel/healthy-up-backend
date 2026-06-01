import axios from 'axios';

import prisma from '../lib/prisma.js';

class MissionService {
  static async getWeeklyProgress(userId) {
    const curr = new Date();
    const day = curr.getDay();

    const diffToMonday = curr.getDate() - day + (day === 0 ? -6 : 1);

    const startDate = new Date(curr.setDate(diffToMonday));
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    const [totalMissions, completedMissions] = await prisma.$transaction([
      prisma.mission.count({
        where: {
          userId: userId,
          scheduledDate: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.mission.count({
        where: {
          userId: userId,
          scheduledDate: {
            gte: startDate,
            lte: endDate,
          },
          status: 'completed',
        },
      }),
    ]);

    let percentage = 0;
    if (totalMissions > 0) {
      percentage = Math.round((completedMissions / totalMissions) * 100);
    }

    return {
      percentage,
      completedMissions,
      totalMissions,
      period: {
        start: startDate,
        end: endDate,
      },
    };
  }

  static async generateAndSaveQuests(userId) {
    const profile = await prisma.healthProfile.findUnique({
      where: { userId: userId },
      include: {
        user: { select: { username: true } },
      },
    });

    if (!profile) throw new Error('PROFILE_NOT_FOUND');

    let targetLoss = Number(profile.weightKg) - Number(profile.goalWeight);
    if (targetLoss < 0) targetLoss = 0;

    const aiPayload = {
      Name: profile.user.username,
      Target_Weight_Loss: targetLoss,
      Height: Number(profile.heightCm) / 100,
      Weight: Number(profile.weightKg),
      Gender: profile.gender === 'male' ? 'Male' : 'Female',
      Age: profile.age,
    };

    try {
      const aiResponse = await axios.post(
        'https://dkarnnd-ai-healthyup.hf.space/api/generate_quests',
        aiPayload,
      );

      const { ai_analysis, gamification_data } = aiResponse.data;
      const today = new Date();
      const newMissions = [];

      gamification_data.schedule.forEach((dayData) => {
        const missionDate = new Date(today);
        missionDate.setDate(today.getDate() + (dayData.day - 1));
        missionDate.setHours(0, 0, 0, 0);

        dayData.quests.forEach((quest) => {
          let categoryEnum = 'physical';

          const aiCategory = quest.category.toLowerCase();

          if (aiCategory.includes('nutrisi') || aiCategory.includes('makan')) {
            categoryEnum = 'nutrition';
          } else if (
            aiCategory.includes('kebiasaan') ||
            aiCategory.includes('habit') ||
            aiCategory.includes('mental')
          ) {
            categoryEnum = 'mental';
          } else if (
            aiCategory.includes('olahraga') ||
            aiCategory.includes('fisik')
          ) {
            categoryEnum = 'physical';
          }

          newMissions.push({
            userId: userId,
            title: quest.quest_name,
            description: quest.description,
            category: categoryEnum,
            difficultyScore: 1,
            caloriesImpact: 0,
            scheduledDate: missionDate,
            xpReward: quest.xp_reward,
            pointsReward: Math.floor(quest.xp_reward / 2),
          });
        });
      });

      const [, createdMissions] = await prisma.$transaction(
        [
          prisma.healthProfile.update({
            where: { userId: userId },
            data: { factualBMI: ai_analysis.factual_bmi },
          }),
          prisma.mission.createMany({
            data: newMissions,
          }),
        ],
        {
          maxWait: 15000,
          timeout: 30000,
        },
      );

      return {
        ai_analysis,
        total_quests_generated: createdMissions.count,
        gamification_data,
      };
    } catch (error) {
      console.error(
        'AI Service Error:',
        error?.response?.data || error.message,
      );
      throw new Error('AI_GENERATION_FAILED', { cause: error });
    }
  }

  static async getMissionById(missionId, userId) {
    const mission = await prisma.mission.findFirst({
      where: {
        id: missionId,
        userId: userId,
      },
    });

    if (!mission) throw new Error('MISSION_NOT_FOUND');
    return mission;
  }

  static async updateMissionStatus(
    missionId,
    userId,
    newStatus,
    proofImagePath,
  ) {
    const mission = await prisma.mission.findFirst({
      where: { id: missionId, userId: userId },
    });

    if (!mission) throw new Error('MISSION_NOT_FOUND');

    if (mission.status === 'completed' && newStatus === 'completed') {
      throw new Error('MISSION_ALREADY_COMPLETED');
    }

    if (newStatus === 'completed') {
      const [updatedMission, updatedUser] = await prisma.$transaction([
        prisma.mission.update({
          where: { id: missionId },
          data: {
            status: 'completed',
            completedAt: new Date(),
            proofImagePath: proofImagePath || mission.proofImagePath,
          },
        }),
        prisma.user.update({
          where: { id: userId },
          data: {
            experiencePoints: { increment: mission.xpReward },
            rewardPoints: { increment: mission.pointsReward },
          },
          select: { experiencePoints: true, rewardPoints: true },
        }),
      ]);

      return { mission: updatedMission, userStats: updatedUser };
    }

    const updatedMission = await prisma.mission.update({
      where: { id: missionId },
      data: {
        status: newStatus,
        proofImagePath: proofImagePath || mission.proofImagePath,
      },
    });

    return { mission: updatedMission, userStats: null };
  }

  static async verifyMission(missionId, verificationStatus, rejectionReason) {
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
    });

    if (!mission) throw new Error('MISSION_NOT_FOUND');
    if (mission.verificationStatus !== 'pending') {
      throw new Error('MISSION_ALREADY_VERIFIED');
    }

    return await prisma.$transaction(async (tx) => {
      if (verificationStatus === 'approved') {
        const approvedMission = await tx.mission.update({
          where: { id: missionId },
          data: { verificationStatus: 'approved' },
        });
        return approvedMission;
      }

      if (verificationStatus === 'rejected') {
        const rejectedMission = await tx.mission.update({
          where: { id: missionId },
          data: {
            status: 'failed', // Gagalkan misi
            verificationStatus: 'rejected',
            rejectionReason: rejectionReason || null,
          },
        });

        if (mission.status === 'completed') {
          await tx.user.update({
            where: { id: mission.userId },
            data: {
              experiencePoints: { decrement: mission.xpReward },
              rewardPoints: { decrement: mission.pointsReward },
            },
          });
        }
        return rejectedMission;
      }
    });
  }

  static async getUserMissions(userId, filterDate) {
    let dateFilter = {};
    
    if (filterDate) {
      const startOfDay = new Date(filterDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(filterDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      dateFilter = {
        scheduledDate: {
          gte: startOfDay,
          lte: endOfDay,
        }
      };
    }

    const missions = await prisma.mission.findMany({
      where: {
        userId: userId,
        ...dateFilter,
      },
      orderBy: { scheduledDate: 'asc' },
    });

    return missions;
  }
}

export default MissionService;
