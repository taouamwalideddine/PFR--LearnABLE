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
            relations: ['modules', 'modules.lessons']
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
        const course = await repo.findOne({ where: { id: req.params.id } });
        if (!course) return res.status(404).json({ message: 'Course not found' });
        
        await repo.remove(course);
        res.json({ message: 'Course removed' });
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
    deleteCourse
};
