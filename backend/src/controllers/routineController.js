const AppDataSource = require('../config/data-source');

// @desc    Get all routines for a specific child
// @route   GET /api/routines/child/:childId
// @access  Private
const getChildRoutines = async (req, res) => {
    try {
        const repo = AppDataSource.getRepository('Routine');
        const routines = await repo.find({
            where: { childId: req.params.childId },
            relations: ['steps'],
            order: { createdAt: 'ASC' },
        });

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

// @desc    Create a new routine
// @route   POST /api/routines
// @access  Private
const createRoutine = async (req, res) => {
    const { title, description, category, childId, isActive } = req.body;
    try {
        const repo = AppDataSource.getRepository('Routine');
        const newRoutine = repo.create({
            title,
            description,
            category: category || 'DAILY',
            childId,
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

module.exports = {
    getChildRoutines,
    createRoutine,
    addRoutineStep,
    deleteRoutine,
    deleteRoutineStep,
};
