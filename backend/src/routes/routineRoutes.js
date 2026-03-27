const express = require('express');
const {
    getRoutines,
    getChildRoutines,
    getRoutineById,
    createRoutine,
    assignRoutine,
    addRoutineStep,
    deleteRoutine,
    deleteRoutineStep,
} = require('../controllers/routineController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getRoutines);
router.get('/child/:childId', getChildRoutines);
router.get('/:id', getRoutineById);

// Only authorized adults can build routines
router.post('/', authorize('PARENT', 'EDUCATEUR', 'ADMIN'), createRoutine);
router.post('/:id/assign', authorize('PARENT', 'EDUCATEUR', 'ADMIN'), assignRoutine);
router.post('/:id/steps', authorize('PARENT', 'EDUCATEUR', 'ADMIN'), addRoutineStep);
router.delete('/:id', authorize('PARENT', 'EDUCATEUR', 'ADMIN'), deleteRoutine);
router.delete('/steps/:stepId', authorize('PARENT', 'EDUCATEUR', 'ADMIN'), deleteRoutineStep);

module.exports = router;
