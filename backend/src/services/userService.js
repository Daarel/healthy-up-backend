import prisma from '../lib/prisma.js';

class UserService {
  static async getUserProfile(userId) {
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        email: true,
        rankTitle: true,
        level: true,
        experiencePoints: true,
        rewardPoints: true,
        streakCount: true,
        profilePicture: true,
        badges: true,
      },
    });

    if (!userProfile) throw new Error('USER_NOT_FOUND');
    return userProfile;
  }

  static async deleteUserProfile(userId) {
    await prisma.user.delete({
      where: { id: userId },
    });
    return true;
  }

  static async getAllUsersWithPagination(page, limit) {
    const skip = (page - 1) * limit;

    const [users, totalData] = await prisma.$transaction([
      prisma.user.findMany({
        skip: skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          rankTitle: true,
          level: true,
          streakCount: true,
          createdAt: true,
        },
      }),
      prisma.user.count(),
    ]);

    const totalPages = Math.ceil(totalData / limit);

    return {
      users,
      pagination: {
        totalData,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  }

  static async updateProfilePicture(userId, photoProfile) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profilePicture: photoProfile },
      select: { id: true, username: true, profilePicture: true },
    });

    return updatedUser;
  }

  static async processLevelUp(userId) {
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        level: true,
        rankTitle: true,
        experiencePoints: true,
        badges: true,
      },
    });

    if (currentUser.level >= 30) {
      throw new Error('MAX_LEVEL_REACHED');
    }

    if (!currentUser) throw new Error('USER_NOT_FOUND');

    const expRequired = currentUser.level * 1000;

    if (currentUser.experiencePoints < expRequired) {
      throw new Error('INSUFFICIENT_EXP');
    }

    const newLevel = currentUser.level + 1;
    const remainingExp = currentUser.experiencePoints - expRequired;
    let newTitle = currentUser.rankTitle;

    if (newLevel >= 25) newTitle = 'legenda';
    else if (newLevel >= 20) newTitle = 'master_vitalitas';
    else if (newLevel >= 15) newTitle = 'kesatria_bugar';
    else if (newLevel >= 10) newTitle = 'pejuang_sehat';
    else if (newLevel >= 5) newTitle = 'penggerak';

    let updatedBadges = [...currentUser.badges];

    if (newLevel === 10 && !updatedBadges.includes('LEVEL_10')) {
      updatedBadges.push('LEVEL_10');
    }
    if (newLevel === 20 && !updatedBadges.includes('LEVEL_20')) {
      updatedBadges.push('LEVEL_20');
    }
    if (newLevel === 30 && !updatedBadges.includes('LEVEL_30')) {
      updatedBadges.push('LEVEL_30');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        level: newLevel,
        rankTitle: newTitle,
        experiencePoints: remainingExp,
        badges: updatedBadges,
      },
      select: {
        id: true,
        username: true,
        level: true,
        rankTitle: true,
        experiencePoints: true,
        badges: true,
      },
    });

    return updatedUser;
  }
}

export default UserService;
