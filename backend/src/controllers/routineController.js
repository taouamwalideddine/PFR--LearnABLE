const AppDataSource = require('../config/data-source');

// @desc get all routines for a specific child
const getChildRoutines = async (req, res) => {
    try {
        const repo = AppDataSource.getRepository('Child');
        const child = await repo.findOne({
            where: { id: req.params.childId },
            relations: ['routines', 'routines.steps'],
        });

        if (!child) return res.status(404).json({ message: 'Child not found' });

        const routines = child.routines || [];
        routines.forEach(r => {
            if (r.steps) {
                r.steps.sort((a, b) => a.orderIndex - b.orderIndex);
            }
        });

        res.json(routines);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc get all routines managed by adult
const getRoutines = async (req, res) => {
    try {
        const repo = AppDataSource.getRepository('Routine');
        const routines = await repo.find({
            where: { creatorId: req.user.id },
            relations: ['children'],
            order: { createdAt: 'DESC' },
        });
        res.json(routines);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc create a new routine
const createRoutine = async (req, res) => {
    const { title, description, category, isActive } = req.body;
    try {
        const repo = AppDataSource.getRepository('Routine');
        const newRoutine = repo.create({
            title,
            description,
            category: category || 'DAILY',
            creatorId: req.user.id,
            isActive: isActive || false,
        });

        const routine = await repo.save(newRoutine);
        res.status(201).json(routine);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc get routine by ID
const getRoutineById = async (req, res) => {
    try {
        const repo = AppDataSource.getRepository('Routine');
        const routine = await repo.findOne({
            where: { id: req.params.id },
            relations: ['steps'],
        });
        if (!routine) return res.status(404).json({ message: 'Routine not found' });
        
        res.json(routine);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc add a step to a routine
const addRoutineStep = async (req, res) => {
    const { title, description, imageUrl, durationMinutes, orderIndex, type, linkedLessonId } = req.body;
    try {
        const routineRepo = AppDataSource.getRepository('Routine');
        const stepRepo = AppDataSource.getRepository('RoutineStep');

        const routine = await routineRepo.findOneBy({ id: req.params.id });
        if (!routine) return res.status(404).json({ message: 'Routine not found' });

        const step = stepRepo.create({
            title,
            description,
            imageUrl,
            durationMinutes: durationMinutes ? parseInt(durationMinutes) : null,
            orderIndex: orderIndex !== undefined ? parseInt(orderIndex) : 0,
            type: type || 'CUSTOM',
            linkedLessonId: linkedLessonId || null,
            routineId: routine.id
        });

        const newStep = await stepRepo.save(step);
        res.status(201).json(newStep);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc delete routine
const deleteRoutine = async (req, res) => {
    try {
        const repo = AppDataSource.getRepository('Routine');
        await repo.delete(req.params.id);
        res.json({ message: 'Routine removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc delete routine step
const deleteRoutineStep = async (req, res) => {
    try {
        const stepRepo = AppDataSource.getRepository('RoutineStep');
        await stepRepo.delete(req.params.stepId);
        res.json({ message: 'Step removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc assign routine to child
const assignRoutine = async (req, res) => {
    const { childId } = req.body;
    try {
        const childRepo = AppDataSource.getRepository('Child');
        const child = await childRepo.findOne({
            where: { id: childId },
            relations: ['routines']
        });
        if (!child) return res.status(404).json({ message: 'Child not found' });

        const routineRepo = AppDataSource.getRepository('Routine');
        const routine = await routineRepo.findOneBy({ id: req.params.id });
        if (!routine) return res.status(404).json({ message: 'Routine not found' });

        if (!child.routines) child.routines = [];
        if (!child.routines.find(r => r.id === routine.id)) {
            child.routines.push(routine);
            await childRepo.save(child);
        }

        res.json({ message: 'Routine assigned successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getRoutines,
    getChildRoutines,
    getRoutineById,
    createRoutine,
    assignRoutine,
    addRoutineStep,
    deleteRoutine,
    deleteRoutineStep,
};
