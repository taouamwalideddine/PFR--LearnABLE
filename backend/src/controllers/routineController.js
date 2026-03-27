const AppDataSource = require('../config/data-source');

// @desc    Get all routines for a specific child
// @route   GET /api/routines/child/:childId
// @access  Private
const getChildRoutines = async (req, res) => {
    try {
        const repo = AppDataSource.getRepository('Child');
        const child = await repo.findOne({
            where: { id: req.params.childId },
            relations: ['routines', 'routines.steps'],
        });

        if (!child) return res.status(404).json({ message: 'Child not found' });

        const routines = child.routines || [];
        // Sort steps inside each routine by orderIndex
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

// @desc    Get all routines managed by adult
// @route   GET /api/routines
// @access  Private
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

// @desc    Create a new routine
// @route   POST /api/routines
// @access  Private
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

// @desc    Get routine by ID
// @route   GET /api/routines/:id
// @access  Private
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

// @desc    Add a step to a routine
// @route   POST /api/routines/:id/steps
// @access  Private
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

// @desc    Delete routine
// @route   DELETE /api/routines/:id
// @access  Private
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

// @desc    Delete routine step
// @route   DELETE /api/routines/steps/:stepId
// @access  Private
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

// @desc    Assign routine to child
// @route   POST /api/routines/:id/assign
// @access  Private
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
