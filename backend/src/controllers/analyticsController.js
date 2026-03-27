const AppDataSource = require('../config/data-source');

// @desc    Get classroom overview for an educator (all linked children's stats)
// @route   GET /api/analytics/classroom
// @access  Private (EDUCATEUR, PARENT, ADMIN)
const getClassroomOverview = async (req, res) => {
    try {
        const childRepo = AppDataSource.getRepository('Child');
        const progressRepo = AppDataSource.getRepository('Progress');

        // For now, fetch all children belonging to this user
        const children = await childRepo.find({
            where: { parentId: req.user.id },
        });

        const overview = [];

        for (const child of children) {
            // Get aggregated stats
            const stats = await progressRepo
                .createQueryBuilder('p')
                .select('COUNT(p.id)', 'totalAttempted')
                .addSelect('SUM(CASE WHEN p.completed = true THEN 1 ELSE 0 END)', 'totalCompleted')
                .addSelect('AVG(p.successRate)', 'avgSuccess')
                .addSelect('SUM(p.timeSpent)', 'totalTime')
                .where('p.childId = :childId', { childId: child.id })
                .getRawOne();

            // Get category breakdown
            const categoryStats = await progressRepo
                .createQueryBuilder('p')
                .innerJoin('p.activity', 'a')
                .innerJoin('a.lesson', 'l')
                .select('l.category', 'category')
                .addSelect('COUNT(p.id)', 'attempts')
                .addSelect('AVG(p.successRate)', 'avgSuccess')
                .addSelect('SUM(CASE WHEN p.completed = true THEN 1 ELSE 0 END)', 'completed')
                .where('p.childId = :childId', { childId: child.id })
                .groupBy('l.category')
                .getRawMany();

            // Get recent sessions (last 7 days activity count)
            const recentActivity = await progressRepo
                .createQueryBuilder('p')
                .select("TO_CHAR(p.timestamp, 'YYYY-MM-DD')", 'date')
                .addSelect('COUNT(p.id)', 'count')
                .addSelect('AVG(p.successRate)', 'avgSuccess')
                .where('p.childId = :childId', { childId: child.id })
                .andWhere("p.timestamp >= NOW() - INTERVAL '7 days'")
                .groupBy("TO_CHAR(p.timestamp, 'YYYY-MM-DD')")
                .orderBy("TO_CHAR(p.timestamp, 'YYYY-MM-DD')", 'ASC')
                .getRawMany();

            overview.push({
                child: { id: child.id, name: child.name, age: child.age },
                stats: {
                    totalAttempted: parseInt(stats.totalAttempted) || 0,
                    totalCompleted: parseInt(stats.totalCompleted) || 0,
                    avgSuccess: parseFloat(stats.avgSuccess) || 0,
                    totalTimeSeconds: parseInt(stats.totalTime) || 0,
                },
                categoryBreakdown: categoryStats.map(c => ({
                    category: c.category,
                    attempts: parseInt(c.attempts),
                    completed: parseInt(c.completed),
                    avgSuccess: parseFloat(c.avgSuccess) || 0,
                })),
                recentActivity: recentActivity.map(r => ({
                    date: r.date,
                    count: parseInt(r.count),
                    avgSuccess: parseFloat(r.avgSuccess) || 0,
                })),
            });
        }

        res.json(overview);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get deep analytics for a specific child (for IEP reports)
// @route   GET /api/analytics/child/:childId
// @access  Private
const getChildAnalytics = async (req, res) => {
    try {
        const { childId } = req.params;
        const progressRepo = AppDataSource.getRepository('Progress');
        const childRepo = AppDataSource.getRepository('Child');

        const child = await childRepo.findOneBy({ id: childId });
        if (!child) return res.status(404).json({ message: 'Child not found' });

        // Overall stats
        const overall = await progressRepo
            .createQueryBuilder('p')
            .select('COUNT(p.id)', 'totalAttempted')
            .addSelect('SUM(CASE WHEN p.completed = true THEN 1 ELSE 0 END)', 'totalCompleted')
            .addSelect('AVG(p.successRate)', 'avgSuccess')
            .addSelect('SUM(p.timeSpent)', 'totalTime')
            .addSelect('MIN(p.timestamp)', 'firstActivity')
            .addSelect('MAX(p.timestamp)', 'lastActivity')
            .where('p.childId = :childId', { childId })
            .getRawOne();

        // Category breakdown
        const categories = await progressRepo
            .createQueryBuilder('p')
            .innerJoin('p.activity', 'a')
            .innerJoin('a.lesson', 'l')
            .select('l.category', 'category')
            .addSelect('COUNT(p.id)', 'attempts')
            .addSelect('AVG(p.successRate)', 'avgSuccess')
            .addSelect('SUM(CASE WHEN p.completed = true THEN 1 ELSE 0 END)', 'completed')
            .where('p.childId = :childId', { childId })
            .groupBy('l.category')
            .getRawMany();

        // Daily trend (last 30 days)
        const dailyTrend = await progressRepo
            .createQueryBuilder('p')
            .select("TO_CHAR(p.timestamp, 'YYYY-MM-DD')", 'date')
            .addSelect('COUNT(p.id)', 'activitiesCount')
            .addSelect('AVG(p.successRate)', 'avgSuccess')
            .where('p.childId = :childId', { childId })
            .andWhere("p.timestamp >= NOW() - INTERVAL '30 days'")
            .groupBy("TO_CHAR(p.timestamp, 'YYYY-MM-DD')")
            .orderBy("TO_CHAR(p.timestamp, 'YYYY-MM-DD')", 'ASC')
            .getRawMany();

        // Recent lessons completed
        const recentLessons = await progressRepo.find({
            where: { childId, completed: true },
            relations: ['activity', 'activity.lesson'],
            order: { timestamp: 'DESC' },
            take: 10,
        });

        res.json({
            child: { id: child.id, name: child.name, age: child.age },
            overall: {
                totalAttempted: parseInt(overall.totalAttempted) || 0,
                totalCompleted: parseInt(overall.totalCompleted) || 0,
                avgSuccess: parseFloat(overall.avgSuccess) || 0,
                totalTimeSeconds: parseInt(overall.totalTime) || 0,
                firstActivity: overall.firstActivity,
                lastActivity: overall.lastActivity,
            },
            categoryBreakdown: categories.map(c => ({
                category: c.category,
                attempts: parseInt(c.attempts),
                completed: parseInt(c.completed),
                avgSuccess: parseFloat(c.avgSuccess) || 0,
            })),
            dailyTrend: dailyTrend.map(d => ({
                date: d.date,
                activitiesCount: parseInt(d.activitiesCount),
                avgSuccess: parseFloat(d.avgSuccess) || 0,
            })),
            recentLessons: recentLessons.map(p => ({
                lessonTitle: p.activity?.lesson?.title || 'Unknown',
                lessonCategory: p.activity?.lesson?.category || 'N/A',
                successRate: p.successRate,
                completedAt: p.timestamp,
            })),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getClassroomOverview,
    getChildAnalytics,
};
