const prisma = require('../utils/prisma');

// @desc    Create a new child profile
// @route   POST /api/children
// @access  Private (Parent/Educator/Admin)
const createChild = async (req, res) => {
    const { name, age, sensoryPreferences, learningPace, difficultyLevel } = req.body;

    try {
        const child = await prisma.child.create({
            data: {
                name,
                age: parseInt(age),
                sensoryPreferences,
                learningPace,
                difficultyLevel: parseInt(difficultyLevel) || 1,
                parentId: req.user.id,
            },
        });

        res.status(201).json(child);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all children for the logged in user
// @route   GET /api/children
// @access  Private
const getChildren = async (req, res) => {
    try {
        const children = await prisma.child.findMany({
            where: { parentId: req.user.id },
        });
        res.json(children);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single child profile
// @route   GET /api/children/:id
// @access  Private
const getChildById = async (req, res) => {
    try {
        const child = await prisma.child.findUnique({
            where: { id: req.params.id },
        });

        if (!child) {
            return res.status(404).json({ message: 'Child not found' });
        }

        // Check if user is parent or admin
        if (child.parentId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(child);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update child profile
// @route   PUT /api/children/:id
// @access  Private
const updateChild = async (req, res) => {
    try {
        const child = await prisma.child.findUnique({
            where: { id: req.params.id },
        });

        if (!child) {
            return res.status(404).json({ message: 'Child not found' });
        }

        if (child.parentId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updatedChild = await prisma.child.update({
            where: { id: req.params.id },
            data: req.body,
        });

        res.json(updatedChild);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createChild,
    getChildren,
    getChildById,
    updateChild,
};
