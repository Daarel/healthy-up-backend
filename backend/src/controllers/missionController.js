import MissionService from '../services/missionService.js';

class MissionController {
  /**
   * * @desc    Get Weekly Mission Progress Percentage
   * ! @route   GET /api/v1/missions/progress/weekly
   * ? @access  Private
   */
  static async getWeeklyProgress(req, res) {
    try {
      const userId = req.user.id;

      const progressData = await MissionService.getWeeklyProgress(userId);

      return res.status(200).json({
        status: 'success',
        data: progressData,
      });
    } catch (err) {
      return MissionController.handleServerError(
        err,
        res,
        'Gagal mengambil progress misi mingguan',
      );
    }
  }

  /**
   * * @desc    Generate Quests using AI & Update Profile
   * ! @route   POST /api/v1/missions/generate
   * ? @access  Private
   */
  static async generateMissions(req, res) {
    try {
      const userId = req.user.id;

      const result = await MissionService.generateAndSaveQuests(userId);

      return res.status(201).json({
        status: 'success',
        message: 'Misi selama 7 hari berhasil dibuat oleh AI!',
        data: result,
      });
    } catch (err) {
      if (err.message === 'PROFILE_NOT_FOUND') {
        return res.status(404).json({
          status: 'error',
          message:
            'Profil kesehatan belum diisi. Harap lengkapi profil terlebih dahulu.',
        });
      }

      if (err.message === 'AI_GENERATION_FAILED') {
        return res.status(502).json({
          status: 'error',
          message:
            'Gagal menghubungi server AI untuk membuat misi. Coba beberapa saat lagi.',
        });
      }

      console.error('Terjadi Kesalahan di MissionController:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
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

export default MissionController;
