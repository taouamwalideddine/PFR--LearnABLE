const AppDataSource = require('../config/data-source');

const createCourse = async (req, res) => {
    const { title, description, category, bannerUrl } = req.body;
    try {
        const repo = AppDataSource.getRepository('Course');
        const course = repo.create({ title, description, category, bannerUrl });
        const savedCourse = await repo.save(course);
        res.status(201).json(savedCourse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getCourses = async (req, res) => {
    try {
        const repo = AppDataSource.getRepository('Course');
        const courses = await repo.find({
            order: { createdAt: 'DESC' },
            relations: ['modules']
        });
        res.json(courses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getCourseById = async (req, res) => {
    try {
        const repo = AppDataSource.getRepository('Course');
        const course = await repo.findOne({
            where: { id: req.params.id },
            relations: ['modules', 'modules.lessons', 'children']
        });
        if (!course) return res.status(404).json({ message: 'Course not found' });
        
        // Sort modules and lessons
        if (course.modules) {
            course.modules.sort((a, b) => a.orderIndex - b.orderIndex);
            course.modules.forEach(mod => {
                if (mod.lessons) mod.lessons.sort((a, b) => a.orderIndex - b.orderIndex);
            });
        }
        res.json(course);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateCourse = async (req, res) => {
    const { title, description, category, bannerUrl } = req.body;
    try {
        const repo = AppDataSource.getRepository('Course');
        let course = await repo.findOne({ where: { id: req.params.id } });
        if (!course) return res.status(404).json({ message: 'Course not found' });
        
        course.title = title || course.title;
        course.description = description !== undefined ? description : course.description;
        course.category = category || course.category;
        course.bannerUrl = bannerUrl !== undefined ? bannerUrl : course.bannerUrl;

        const updatedCourse = await repo.save(course);
        res.json(updatedCourse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const repo = AppDataSource.getRepository('Course');
        const course = await repo.findOne({
            where: { id: req.params.id },
            relations: ['children'],
        });
        if (!course) return res.status(404).json({ message: 'Course not found' });
        
        // Detach all children from the course before deleting
        course.children = [];
        await repo.save(course);

        await repo.remove(course);
        res.json({ message: 'Course removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const assignCourse = async (req, res) => {
    try {
        const courseRepo = AppDataSource.getRepository('Course');
        const childRepo = AppDataSource.getRepository('Child');
        const course = await courseRepo.findOne({
            where: { id: req.params.id }
        });
        const child = await childRepo.findOne({ 
            where: { id: req.body.childId },
            relations: ['courses'] // Child is the owner of the relation
        });
        
        if (!course || !child) return res.status(404).json({ message: 'Course or Child not found' });
        
        if (!child.courses) {
            child.courses = [];
        }

        // Prevent duplicate assignment
        if (!child.courses.some(c => c.id === course.id)) {
            child.courses.push(course);
            await childRepo.save(child);
        }
        
        res.json({ message: 'Course assigned successfully', course });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createCourse,
    getCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    assignCourse
};
