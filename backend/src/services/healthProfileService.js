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

  static async getCalorieLog(userId) {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const [
      dailyBurned,
      weeklyBurned,
      dailyIntake,
      weeklyIntake,
      healthProfile,
    ] = await Promise.all([
      prisma.mission.aggregate({
        _sum: { caloriesImpact: true },
        where: {
          userId,
          category: 'physical',
          status: 'completed',
          completedAt: { gte: startOfToday },
        },
      }),

      prisma.mission.aggregate({
        _sum: { caloriesImpact: true },
        where: {
          userId,
          category: 'physical',
          status: 'completed',
          completedAt: { gte: startOfWeek },
        },
      }),

      prisma.calorieLog.aggregate({
        _sum: { calories: true },
        where: {
          userId,
          loggedAt: { gte: startOfToday },
        },
      }),

      prisma.calorieLog.aggregate({
        _sum: { calories: true },
        where: {
          userId,
          loggedAt: { gte: startOfWeek },
        },
      }),

      prisma.healthProfile.findUnique({
        where: { userId },
        select: { goalWeight: true },
      }),
    ]);

    return {
      caloriesBurned: {
        today: dailyBurned._sum.caloriesImpact || 0,
        weekly: weeklyBurned._sum.caloriesImpact || 0,
      },
      caloriesIntake: {
        today: dailyIntake._sum.calories || 0,
        weekly: weeklyIntake._sum.calories || 0,
      },
      profile: healthProfile,
    };
  }

  static async createCalorieLog(userId, calories) {
    const newCalorieLog = await prisma.calorieLog.create({
      data: {
        userId,
        calories,
      },
    });

    return newCalorieLog;
  }

  static async getWeightLogs(userId, range) {
    const endDate = new Date();
    const startDate = new Date();

    if (range === 'week') {
      startDate.setDate(endDate.getDate() - 6);
    } else if (range === 'month') {
      startDate.setDate(endDate.getDate() - 29);
    }

    const rawLogs = await prisma.weightLog.findMany({
      where: {
        userId: userId,
        loggedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { loggedAt: 'asc' },
    });

    const logMap = {};
    rawLogs.forEach((log) => {
      const dateString = log.loggedAt.toISOString().split('T')[0];
      logMap[dateString] = log.weight;
    });

    const filledLogs = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0];

      filledLogs.push({
        date: dateString,
        weight: logMap[dateString] || 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return filledLogs;
  }

  static async createWeightLogAndUpdateProfile(userId, weight) {
    const [newWeightLog, updatedHealthProfile] = await prisma.$transaction([
      prisma.weightLog.create({
        data: { userId, weight },
      }),
      prisma.healthProfile.update({
        where: { userId },
        data: { weightKg: weight },
      }),
    ]);

    return { newWeightLog, updatedHealthProfile };
  }
}

export default HealthProfileService;
