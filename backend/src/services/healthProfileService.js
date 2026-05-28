import prisma from '../lib/prisma.js';

class HealthProfileService {
  static async createProfile(userId, profileData) {
    const profileExists = await prisma.healthProfile.findUnique({
      where: { userId },
    });

    if (profileExists) {
      throw new Error('PROFILE_ALREADY_EXISTS');
    }

    const newProfile = await prisma.healthProfile.create({
      data: {
        userId,
        ...profileData,
      },
    });

    return newProfile;
  }

  static async getCaloriesSummary(userId) {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const [dailyPhysical, weeklyPhysical, healthProfile] = await Promise.all([
      // Kalori terbakar hari ini
      prisma.mission.aggregate({
        _sum: { caloriesImpact: true },
        where: {
          userId,
          category: 'physical',
          status: 'completed',
          completedAt: { gte: startOfToday },
        },
      }),

      // Kalori terbakar minggu ini
      prisma.mission.aggregate({
        _sum: { caloriesImpact: true },
        where: {
          userId,
          category: 'physical',
          status: 'completed',
          completedAt: { gte: startOfWeek },
        },
      }),

      prisma.healthProfile.findUnique({
        where: { userId },
        select: { goalWeight: true },
      }),
    ]);

    const burnedToday = dailyPhysical._sum.caloriesImpact || 0;
    const burnedWeekly = weeklyPhysical._sum.caloriesImpact || 0;

    return {
      calories: { burnedToday, burnedWeekly },
      profile: healthProfile,
    };
  }

  static async getWeightLogs(userId) {
    const weightLogs = await prisma.weightLog.findMany({
      where: { userId },
      orderBy: { loggedAt: 'desc' },
      select: {
        id: true,
        weight: true,
        loggedAt: true,
      },
    });

    return weightLogs;
  }

  static async createWeightLogAndUpdateProfile(userId, weight) {
    const [newWeightLog, updatedHealthProfile] = await prisma.$transaction([
      prisma.weightLog.create({
        data: { userId, weight },
      }),
      prisma.healthProfile.update({
        where: { userId },
        data: { weight },
      }),
    ]);

    return { newWeightLog, updatedHealthProfile };
  }
}

export default HealthProfileService;
