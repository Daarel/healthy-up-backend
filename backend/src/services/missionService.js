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

      const [, createdMissions] = await prisma.$transaction([
        prisma.healthProfile.update({
          where: { userId: userId },
          data: { factualBMI: ai_analysis.factual_bmi },
        }),
        prisma.mission.createMany({
          data: newMissions,
        }),
      ]);

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
}

export default MissionService;
