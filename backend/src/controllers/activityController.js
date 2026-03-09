const prisma = require('../utils/prisma');

// @desc    Create activity for a lesson
// @route   POST /api/activities
// @access  Private (Educator/Admin)
const createActivity = async (req, res) => {
    const { title, type, content, lessonId } = req.body;

    try {
        const activity = await prisma.activity.create({
            data: {
                title,
                type,
                content,
                lessonId,
            },
        });

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
        const activities = await prisma.activity.findMany({
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
        const progress = await prisma.progress.create({
            data: {
                childId,
                activityId: req.params.id,
                completed,
                successRate: parseFloat(successRate),
                timeSpent: parseInt(timeSpent),
            },
        });

        // Handle rewards if completion is successful
        if (completed && successRate >= 80) {
            await prisma.reward.create({
                data: {
                    name: 'Activity Master',
                    type: 'STAR',
                    childId,
                    reason: `Completed activity ${req.params.id} with high score`,
                },
            });
        }

        res.status(201).json(progress);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createActivity,
    getActivitiesByLesson,
    submitProgress,
};
