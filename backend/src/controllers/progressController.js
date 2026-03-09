const prisma = require('../utils/prisma');

// @desc    Get progress for a specific child
// @route   GET /api/progress/child/:childId
// @access  Private
const getChildProgress = async (req, res) => {
    try {
        const progressList = await prisma.progress.findMany({
            where: { childId: req.params.childId },
            include: {
                activity: {
                    include: {
                        lesson: true,
                    },
                },
            },
            orderBy: { timestamp: 'desc' },
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

        // Total time spent (sum of timeSpent)
        const timeAggregation = await prisma.progress.aggregate({
            where: { childId },
            _sum: { timeSpent: true },
            _count: { id: true },
            _avg: { successRate: true },
        });

        // Activities completed
        const completedCount = await prisma.progress.count({
            where: { childId, completed: true },
        });

        res.json({
            totalActivitiesAttempted: timeAggregation._count.id || 0,
            totalActivitiesCompleted: completedCount,
            totalTimeSpentSeconds: timeAggregation._sum.timeSpent || 0,
            averageSuccessRate: timeAggregation._avg.successRate || 0,
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
