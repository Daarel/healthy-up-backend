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
