const { In } = require('typeorm');
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
    const courseId = req.params.id;
    console.log(`[NUCLEAR DELETE] Initiating for course: ${courseId}`);
    
    try {
        const moduleRepo = AppDataSource.getRepository('Module');
        const lessonRepo = AppDataSource.getRepository('Lesson');
        const activityRepo = AppDataSource.getRepository('Activity');
        const progressRepo = AppDataSource.getRepository('Progress');
        const routineStepRepo = AppDataSource.getRepository('RoutineStep');
        const courseRepo = AppDataSource.getRepository('Course');

        // Bypassing TypeORM's complex joins (tablePath bug) with manual ID fetching
        
        // 1. Get Module IDs
        const modules = await moduleRepo.find({ where: { courseId: courseId } });
        const moduleIds = modules.map(m => m.id);
        
        let lessonIds = [];
        if (moduleIds.length > 0) {
            const lessons = await lessonRepo.find({ where: { moduleId: In(moduleIds) } });
            lessonIds = lessons.map(l => l.id);
        }

        let activityIds = [];
        if (lessonIds.length > 0) {
            const activities = await activityRepo.find({ where: { lessonId: In(lessonIds) } });
            activityIds = activities.map(a => a.id);
        }

        console.log(`[NUCLEAR DELETE] IDs collected - Modules: ${moduleIds.length}, Lessons: ${lessonIds.length}, Activities: ${activityIds.length}`);

        // 2. Clear Junction Tables with Raw SQL (Bypasses all TypeORM relation logic)
        console.log('[NUCLEAR DELETE] Clearing child_courses junction...');
        await AppDataSource.query(`DELETE FROM child_courses WHERE "courseId" = $1`, [courseId]);

        if (lessonIds.length > 0) {
            console.log('[NUCLEAR DELETE] Clearing child_lessons junction...');
            // Need to handle multiple IDs in Raw SQL
            const lessonPlaceholder = lessonIds.map((_, i) => `$${i + 1}`).join(',');
            await AppDataSource.query(`DELETE FROM child_lessons WHERE "lessonId" IN (${lessonPlaceholder})`, lessonIds);
        }

        // 3. Clear Dependent Progress Records
        if (activityIds.length > 0) {
            console.log('[NUCLEAR DELETE] Deleting progress records...');
            await progressRepo.delete({ activityId: In(activityIds) });
        }

        // 4. Nullify Routine Steps
        if (lessonIds.length > 0) {
            console.log('[NUCLEAR DELETE] Unlinking routine steps...');
            await routineStepRepo.update({ linkedLessonId: In(lessonIds) }, { linkedLessonId: null, type: 'CUSTOM' });
        }

        // 5. Delete Core Entities in order
        if (activityIds.length > 0) {
            console.log('[NUCLEAR DELETE] Deleting activities...');
            await activityRepo.delete({ id: In(activityIds) });
        }

        if (lessonIds.length > 0) {
            console.log('[NUCLEAR DELETE] Deleting lessons...');
            await lessonRepo.delete({ id: In(lessonIds) });
        }

        if (moduleIds.length > 0) {
            console.log('[NUCLEAR DELETE] Deleting modules...');
            await moduleRepo.delete({ id: In(moduleIds) });
        }

        console.log('[NUCLEAR DELETE] Deleting course entity...');
        await courseRepo.delete(courseId);

        console.log('[NUCLEAR DELETE] COMPLETED SUCCESSFULLY.');
        res.json({ message: 'Course and all related records removed successfully' });
    } catch (error) {
        console.error('[NUCLEAR DELETE] FAILED:', error);
        res.status(500).json({ 
            message: 'Server error during deletion', 
            details: error.message,
            stack: error.stack
        });
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
