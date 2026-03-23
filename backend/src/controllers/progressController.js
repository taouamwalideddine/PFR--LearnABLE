const AppDataSource = require('../config/data-source');

// @desc    Get progress for a specific child
// @route   GET /api/progress/child/:childId
// @access  Private
const getChildProgress = async (req, res) => {
    try {
        const repo = AppDataSource.getRepository('Progress');
        const progressList = await repo.find({
            where: { childId: req.params.childId },
            relations: ['activity', 'activity.lesson'],
            order: { timestamp: 'DESC' },
        });
        res.json(progressList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get aggregate stats for a child
// @route   GET /api/progress/stats/:childId
// @access  Private
const getChildStats = async (req, res) => {
    try {
        const childId = req.params.childId;
        const repo = AppDataSource.getRepository('Progress');

        // Total time spent (sum of timeSpent), count, and average success rate
        const timeAggregation = await repo
            .createQueryBuilder('progress')
            .select('COUNT(progress.id)', 'count')
            .addSelect('SUM(progress.timeSpent)', 'sumTimeSpent')
            .addSelect('AVG(progress.successRate)', 'avgSuccessRate')
            .where('progress.childId = :childId', { childId })
            .getRawOne();

        // Activities completed
        const completedCount = await repo.count({
            where: { childId, completed: true },
        });

        res.json({
            totalActivitiesAttempted: parseInt(timeAggregation.count) || 0,
            totalActivitiesCompleted: completedCount,
            totalTimeSpentSeconds: parseInt(timeAggregation.sumTimeSpent) || 0,
            averageSuccessRate: parseFloat(timeAggregation.avgSuccessRate) || 0,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getChildProgress,
    getChildStats,
};
