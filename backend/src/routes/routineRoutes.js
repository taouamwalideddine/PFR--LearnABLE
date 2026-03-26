const express = require('express');
const {
    getChildRoutines,
    createRoutine,
    addRoutineStep,
    deleteRoutine,
    deleteRoutineStep,
} = require('../controllers/routineController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/child/:childId', getChildRoutines);

// Only authorized adults can build routines
router.post('/', authorize('PARENT', 'EDUCATEUR', 'ADMIN'), createRoutine);
router.post('/:id/steps', authorize('PARENT', 'EDUCATEUR', 'ADMIN'), addRoutineStep);
router.delete('/:id', authorize('PARENT', 'EDUCATEUR', 'ADMIN'), deleteRoutine);
router.delete('/steps/:stepId', authorize('PARENT', 'EDUCATEUR', 'ADMIN'), deleteRoutineStep);

module.exports = router;
