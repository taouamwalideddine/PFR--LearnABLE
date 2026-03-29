const AppDataSource = require('../config/data-source');

// @desc    Create a new lesson
// @route   POST /api/lessons
// @access  Private (Educator/Admin)
const createLesson = async (req, res) => {
    const { title, category, description, difficulty, moduleId, orderIndex } = req.body;

    try {
        const repo = AppDataSource.getRepository('Lesson');
        const newLesson = repo.create({
            title,
            category,
            description,
            difficulty: parseInt(difficulty) || 1,
            moduleId: moduleId || null,
            orderIndex: orderIndex !== undefined ? parseInt(orderIndex) : 0,
        });

        const lesson = await repo.save(newLesson);
        res.status(201).json(lesson);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all lessons
// @route   GET /api/lessons
// @access  Private
const getLessons = async (req, res) => {
    try {
        const repo = AppDataSource.getRepository('Lesson');
        const lessons = await repo.find({
            relations: ['activities'],
        });
        res.json(lessons);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get lesson by ID
// @route   GET /api/lessons/:id
// @access  Private
const getLessonById = async (req, res) => {
    try {
        const repo = AppDataSource.getRepository('Lesson');
        const lesson = await repo.findOne({
            where: { id: req.params.id },
            relations: ['activities', 'module', 'module.course'],
        });

        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        res.json(lesson);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update lesson
// @route   PUT /api/lessons/:id
// @access  Private (Educator/Admin)
const updateLesson = async (req, res) => {
    try {
        const repo = AppDataSource.getRepository('Lesson');
        await repo.update(req.params.id, req.body);
        const lesson = await repo.findOneBy({ id: req.params.id });
        res.json(lesson);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Assign lesson to child
// @route   POST /api/lessons/:id/assign
// @access  Private (Parent/Educator/Admin)
const assignLesson = async (req, res) => {
    const { childId } = req.body;
    try {
        const childRepo = AppDataSource.getRepository('Child');
        const child = await childRepo.findOne({
            where: { id: childId },
            relations: ['lessons'],
        });

        if (!child) {
            return res.status(404).json({ message: 'Child not found' });
        }

        const lessonRepo = AppDataSource.getRepository('Lesson');
        const lesson = await lessonRepo.findOneBy({ id: req.params.id });

        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        child.lessons.push(lesson);
        const updatedChild = await childRepo.save(child);

        res.json({ message: 'Lesson assigned successfully', childId: updatedChild.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a lesson
// @route   DELETE /api/lessons/:id
// @access  Private (Educator/Admin)
const deleteLesson = async (req, res) => {
    try {
        const repo = AppDataSource.getRepository('Lesson');
        const activityRepo = AppDataSource.getRepository('Activity');
        const progressRepo = AppDataSource.getRepository('Progress');
        const routineStepRepo = AppDataSource.getRepository('RoutineStep');

        const lesson = await repo.findOne({
            where: { id: req.params.id },
            relations: ['activities'],
        });

        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        const activityIds = lesson.activities?.map(a => a.id) || [];

        // 1. Clear Lesson-Child Junction Table (child_lessons) using raw SQL
        console.log(`[NUCLEAR DELETE] Clearing child_lessons junction for lesson: ${lesson.id}`);
        await AppDataSource.query(`DELETE FROM child_lessons WHERE "lessonId" = $1`, [lesson.id]);

        // 2. Delete Progress records for activities in this lesson
        if (activityIds.length > 0) {
            await progressRepo.delete({ activityId: require('typeorm').In(activityIds) });
        }

        // 3. Nullify RoutineStep links
        await routineStepRepo.update(
            { linkedLessonId: lesson.id },
            { linkedLessonId: null, type: 'CUSTOM' }
        );

        // 4. Delete Activities
        if (activityIds.length > 0) {
            await activityRepo.delete({ id: require('typeorm').In(activityIds) });
        }

        // 5. Finally, delete the lesson itself
        await repo.delete(lesson.id);

        res.json({ message: 'Lesson and all related data removed successfully' });
    } catch (error) {
        console.error('Error deleting lesson:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

module.exports = {
    createLesson,
    getLessons,
    getLessonById,
    updateLesson,
    assignLesson,
    deleteLesson,
};
