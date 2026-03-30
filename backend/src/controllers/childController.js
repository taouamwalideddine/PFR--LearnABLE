const AppDataSource = require('../config/data-source');

const isAuthorizedForChild = async (userId, userRole, childId) => {

    const childRepo = AppDataSource.getRepository('Child');
    const child = await childRepo.findOneBy({ id: childId });
    if (!child) return false;

    if (child.parentId === userId) return true;

    if (userRole === 'EDUCATEUR') {
        const linkRepo = AppDataSource.getRepository('EducatorChild');
        const link = await linkRepo.findOne({
            where: { educatorId: userId, childId },
        });
        return !!link;
    }

    return false;
};

// @desc create a new child profile
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

const getChildren = async (req, res) => {
    try {
        if (req.user.role === 'EDUCATEUR') {
            const linkRepo = AppDataSource.getRepository('EducatorChild');
            const links = await linkRepo.find({
                where: { educatorId: req.user.id },
                relations: ['child'],
            });
            return res.json(links.map(l => l.child).filter(Boolean));
        }

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

// @desc get single child profile
const getChildById = async (req, res) => {
    try {
        const repo = AppDataSource.getRepository('Child');
        const child = await repo.findOneBy({ id: req.params.id });

        if (!child) {
            return res.status(404).json({ message: 'Child not found' });
        }

        const authorized = await isAuthorizedForChild(req.user.id, req.user.role, req.params.id);
        if (!authorized) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(child);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc update child profile
const updateChild = async (req, res) => {
    try {
        const repo = AppDataSource.getRepository('Child');
        const child = await repo.findOneBy({ id: req.params.id });

        if (!child) {
            return res.status(404).json({ message: 'Child not found' });
        }

        if (child.parentId !== req.user.id) {
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

// @desc get all lessons assigned to a child
const getChildLessons = async (req, res) => {
    try {
        const repo = AppDataSource.getRepository('Child');
        const child = await repo.findOne({
            where: { id: req.params.id },
            relations: ['lessons'],
        });

        if (!child) {
            return res.status(404).json({ message: 'Child not found' });
        }

        const authorized = await isAuthorizedForChild(req.user.id, req.user.role, req.params.id);
        if (!authorized) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(child.lessons);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving lessons' });
    }
};

// @desc get all courses assigned to a child
const getChildCourses = async (req, res) => {
    try {
        const repo = AppDataSource.getRepository('Child');
        const child = await repo.findOne({
            where: { id: req.params.id },
            relations: ['courses', 'courses.modules', 'courses.modules.lessons'],
        });

        if (!child) return res.status(404).json({ message: 'Child not found' });

        const authorized = await isAuthorizedForChild(req.user.id, req.user.role, req.params.id);
        if (!authorized) {
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

// @desc assign a lesson to a child
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

        const authorized = await isAuthorizedForChild(req.user.id, req.user.role, req.params.id);
        if (!authorized) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const lesson = await lessonRepo.findOneBy({ id: lessonId });
        if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

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

// @desc remove a lesson from a child
const removeLesson = async (req, res) => {
    const { id, lessonId } = req.params;
    try {
        const repo = AppDataSource.getRepository('Child');

        const child = await repo.findOne({
            where: { id },
            relations: ['lessons'],
        });

        if (!child) return res.status(404).json({ message: 'Child not found' });

        const authorized = await isAuthorizedForChild(req.user.id, req.user.role, id);
        if (!authorized) {
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

// @desc delete a child profile
const deleteChild = async (req, res) => {
    try {
        const repo = AppDataSource.getRepository('Child');
        const child = await repo.findOne({
            where: { id: req.params.id },
            relations: ['lessons', 'courses', 'routines'],
        });

        if (!child) return res.status(404).json({ message: 'Child not found' });
        if (child.parentId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        child.lessons = [];
        child.courses = [];
        if (child.routines) child.routines = [];
        await repo.save(child);

        await AppDataSource.getRepository('Progress').delete({ childId: req.params.id });
        await AppDataSource.getRepository('Reward').delete({ childId: req.params.id });
        await AppDataSource.getRepository('AccessCode').delete({ childId: req.params.id });
        await AppDataSource.getRepository('EducatorChild').delete({ childId: req.params.id });
        await AppDataSource.getRepository('Message').delete({ childId: req.params.id });

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
