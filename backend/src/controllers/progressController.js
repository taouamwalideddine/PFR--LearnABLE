const AppDataSource = require('../config/data-source');

// @desc get progress for a specific child
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

// @desc get aggregate stats for a child
const getChildStats = async (req, res) => {
    try {
        const childId = req.params.childId;
        const repo = AppDataSource.getRepository('Progress');

        const timeAggregation = await repo
            .createQueryBuilder('progress')
            .select('COUNT(progress.id)', 'count')
            .addSelect('SUM(progress.timeSpent)', 'sumTimeSpent')
            .addSelect('AVG(progress.successRate)', 'avgSuccessRate')
            .where('progress.childId = :childId', { childId })
            .getRawOne();

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

// @desc get classroom-wide analytics for logs
const getClassroomAnalytics = async (req, res) => {
    try {
        const childRepo = AppDataSource.getRepository('Child');
        const progressRepo = AppDataSource.getRepository('Progress');

        let children = [];

        if (req.user.role === 'EDUCATEUR') {
            const linkRepo = AppDataSource.getRepository('EducatorChild');
            const links = await linkRepo.find({
                where: { educatorId: req.user.id },
                relations: ['child'],
            });
            children = links.map(l => l.child).filter(Boolean);
        } else {
            children = await childRepo.find({
                where: { parentId: req.user.id },
            });
        }

        const results = [];
        for (const child of children) {
            const stats = await progressRepo
                .createQueryBuilder('p')
                .select('COUNT(p.id)', 'totalAttempted')
                .addSelect('SUM(CASE WHEN p.completed = true THEN 1 ELSE 0 END)', 'totalCompleted')
                .addSelect('AVG(p.successRate)', 'avgSuccess')
                .addSelect('SUM(p.timeSpent)', 'totalTime')
                .where('p.childId = :childId', { childId: child.id })
                .getRawOne();

            results.push({
                childId: child.id,
                childName: child.name,
                childAge: child.age,
                totalAttempted: parseInt(stats.totalAttempted) || 0,
                totalCompleted: parseInt(stats.totalCompleted) || 0,
                avgSuccess: parseFloat(stats.avgSuccess) || 0,
                totalTimeSeconds: parseInt(stats.totalTime) || 0,
            });
        }

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc get success rate broken down by lesson category for a child
const getCategoryBreakdown = async (req, res) => {
    try {
        const progressRepo = AppDataSource.getRepository('Progress');
        const rows = await progressRepo
            .createQueryBuilder('p')
            .innerJoin('p.activity', 'a')
            .innerJoin('a.lesson', 'l')
            .select('l.category', 'category')
            .addSelect('COUNT(p.id)', 'count')
            .addSelect('AVG(p.successRate)', 'avgSuccess')
            .where('p.childId = :childId', { childId: req.params.childId })
            .groupBy('l.category')
            .getRawMany();

        res.json(rows.map(r => ({
            category: r.category,
            count: parseInt(r.count) || 0,
            avgSuccess: parseFloat(r.avgSuccess) || 0,
        })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getChildProgress,
    getChildStats,
    getClassroomAnalytics,
    getCategoryBreakdown,
};
