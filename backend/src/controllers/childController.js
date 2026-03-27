const AppDataSource = require('../config/data-source');

// @desc    Create a new child profile
// @route   POST /api/children
// @access  Private (Parent/Educator/Admin)
const createChild = async (req, res) => {
    const { name, age, learningPace, difficultyLevel } = req.body;

    try {
        const repo = AppDataSource.getRepository('Child');
        const newChild = repo.create({
            name,
            age: parseInt(age),
            learningPace,
            difficultyLevel: parseInt(difficultyLevel) || 1,
            parentId: req.user.id,
        });

        const child = await repo.save(newChild);
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
        const repo = AppDataSource.getRepository('Child');
        const children = await repo.find({
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
        const repo = AppDataSource.getRepository('Child');
        const child = await repo.findOneBy({ id: req.params.id });

        if (!child) {
            return res.status(404).json({ message: 'Child not found' });
        }

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
        const repo = AppDataSource.getRepository('Child');
        const child = await repo.findOneBy({ id: req.params.id });

        if (!child) {
            return res.status(404).json({ message: 'Child not found' });
        }

        if (child.parentId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await repo.update(req.params.id, req.body);
        const updatedChild = await repo.findOneBy({ id: req.params.id });

        res.json(updatedChild);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all lessons assigned to a child
// @route   GET /api/children/:id/lessons
// @access  Private
const getChildLessons = async (req, res) => {
    try {
        const repo = AppDataSource.getRepository('Child');
        const child = await repo.findOne({
            where: { id: req.params.id },
            relations: ['lessons'], // Fetch the many-to-many relation data
        });

        if (!child) {
            return res.status(404).json({ message: 'Child not found' });
        }

        if (child.parentId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(child.lessons);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving lessons' });
    }
};

// @desc    Get all courses assigned to a child
// @route   GET /api/children/:id/courses
// @access  Private
const getChildCourses = async (req, res) => {
    try {
        const repo = AppDataSource.getRepository('Child');
        const child = await repo.findOne({
            where: { id: req.params.id },
            relations: ['courses', 'courses.modules', 'courses.modules.lessons'],
        });

        if (!child) return res.status(404).json({ message: 'Child not found' });
        if (child.parentId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (child.courses) {
            child.courses.forEach(course => {
                if (course.modules) {
                    course.modules.sort((a, b) => a.orderIndex - b.orderIndex);
                    course.modules.forEach(mod => {
                        if (mod.lessons) mod.lessons.sort((a, b) => a.orderIndex - b.orderIndex);
                    });
                }
            });
        }

        res.json(child.courses || []);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving courses' });
    }
};

// @desc    Assign a lesson to a child
// @route   POST /api/children/:id/lessons
// @access  Private
const assignLesson = async (req, res) => {
    const { lessonId } = req.body;
    try {
        const repo = AppDataSource.getRepository('Child');
        const lessonRepo = AppDataSource.getRepository('Lesson');

        const child = await repo.findOne({
            where: { id: req.params.id },
            relations: ['lessons'],
        });

        if (!child) return res.status(404).json({ message: 'Child not found' });
        if (child.parentId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const lesson = await lessonRepo.findOneBy({ id: lessonId });
        if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

        // Check if already assigned
        const isAssigned = child.lessons.some(l => l.id === lessonId);
        if (isAssigned) {
            return res.status(400).json({ message: 'Lesson is already assigned to this child' });
        }

        child.lessons.push(lesson);
        await repo.save(child);

        res.status(201).json({ message: 'Lesson assigned successfully', child });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error assigning lesson' });
    }
};

// @desc    Remove a lesson from a child
// @route   DELETE /api/children/:id/lessons/:lessonId
// @access  Private
const removeLesson = async (req, res) => {
    const { id, lessonId } = req.params;
    try {
        const repo = AppDataSource.getRepository('Child');

        const child = await repo.findOne({
            where: { id },
            relations: ['lessons'],
        });

        if (!child) return res.status(404).json({ message: 'Child not found' });
        if (child.parentId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        child.lessons = child.lessons.filter(l => l.id !== lessonId);
        await repo.save(child);

        res.json({ message: 'Lesson removed successfully', child });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error removing lesson' });
    }
};

// @desc    Delete a child profile
// @route   DELETE /api/children/:id
// @access  Private (Parent/Admin)
const deleteChild = async (req, res) => {
    try {
        const repo = AppDataSource.getRepository('Child');
        const child = await repo.findOneBy({ id: req.params.id });

        if (!child) return res.status(404).json({ message: 'Child not found' });
        if (child.parentId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await repo.remove(child);
        res.json({ message: 'Child profile deleted successfully' });
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
    deleteChild,
    getChildLessons,
    getChildCourses,
    assignLesson,
    removeLesson,
};
