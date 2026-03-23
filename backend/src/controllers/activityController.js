const AppDataSource = require('../config/data-source');

// @desc    Create activity for a lesson
// @route   POST /api/activities
// @access  Private (Educator/Admin)
const createActivity = async (req, res) => {
    const { title, type, content, lessonId } = req.body;

    try {
        const repo = AppDataSource.getRepository('Activity');
        const newActivity = repo.create({
            title,
            type,
            content,
            lessonId,
        });

        const activity = await repo.save(newActivity);
        res.status(201).json(activity);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get activities for a lesson
// @route   GET /api/activities/lesson/:lessonId
// @access  Private
const getActivitiesByLesson = async (req, res) => {
    try {
        const repo = AppDataSource.getRepository('Activity');
        const activities = await repo.find({
            where: { lessonId: req.params.lessonId },
        });
        res.json(activities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Submit activity progress
// @route   POST /api/activities/:id/progress
// @access  Private (Child/Parent/Educator)
const submitProgress = async (req, res) => {
    const { childId, completed, successRate, timeSpent } = req.body;

    try {
        const progressRepo = AppDataSource.getRepository('Progress');
        const newProgress = progressRepo.create({
            childId,
            activityId: req.params.id,
            completed,
            successRate: parseFloat(successRate),
            timeSpent: parseInt(timeSpent),
        });

        const progress = await progressRepo.save(newProgress);

        // Handle rewards if completion is successful
        if (completed && successRate >= 80) {
            const rewardRepo = AppDataSource.getRepository('Reward');
            const newReward = rewardRepo.create({
                name: 'Activity Master',
                type: 'STAR',
                childId,
                reason: `Completed activity ${req.params.id} with high score`,
            });
            await rewardRepo.save(newReward);
        }

        res.status(201).json(progress);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update activity
// @route   PUT /api/activities/:id
// @access  Private (Educator/Admin)
const updateActivity = async (req, res) => {
    const { title, type, content } = req.body;

    try {
        const repo = AppDataSource.getRepository('Activity');
        const activity = await repo.findOne({ where: { id: req.params.id } });

        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        activity.title = title || activity.title;
        activity.type = type || activity.type;
        activity.content = content || activity.content;

        const updated = await repo.save(activity);
        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete activity
// @route   DELETE /api/activities/:id
// @access  Private (Educator/Admin)
const deleteActivity = async (req, res) => {
    try {
        const repo = AppDataSource.getRepository('Activity');
        const progressRepo = AppDataSource.getRepository('Progress');
        
        const activity = await repo.findOne({ where: { id: req.params.id } });

        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        // Clear associated progress records to avoid FK constraint violations
        await progressRepo.delete({ activityId: activity.id });

        await repo.remove(activity);
        res.json({ message: 'Activity removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createActivity,
    getActivitiesByLesson,
    submitProgress,
    updateActivity,
    deleteActivity,
};
