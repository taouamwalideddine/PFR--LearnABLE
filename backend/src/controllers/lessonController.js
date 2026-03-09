const prisma = require('../utils/prisma');

// @desc    Create a new lesson
// @route   POST /api/lessons
// @access  Private (Educator/Admin)
const createLesson = async (req, res) => {
    const { title, category, description, difficulty } = req.body;

    try {
        const lesson = await prisma.lesson.create({
            data: {
                title,
                category,
                description,
                difficulty: parseInt(difficulty) || 1,
            },
        });

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
        const lessons = await prisma.lesson.findMany({
            include: { activities: true },
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
        const lesson = await prisma.lesson.findUnique({
            where: { id: req.params.id },
            include: { activities: true },
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
        const lesson = await prisma.lesson.update({
            where: { id: req.params.id },
            data: req.body,
        });
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
        const updatedChild = await prisma.child.update({
            where: { id: childId },
            data: {
                lessons: {
                    connect: { id: req.params.id },
                },
            },
        });
        res.json({ message: 'Lesson assigned successfully', childId: updatedChild.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createLesson,
    getLessons,
    getLessonById,
    updateLesson,
    assignLesson,
};
