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
      }
    };
  }
}

export default MissionService;