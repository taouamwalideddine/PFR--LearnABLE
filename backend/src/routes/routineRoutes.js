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


router.post('/', authorize('PARENT', 'EDUCATEUR'), createRoutine);
router.post('/:id/assign', authorize('PARENT', 'EDUCATEUR'), assignRoutine);
router.post('/:id/steps', authorize('PARENT', 'EDUCATEUR'), addRoutineStep);
router.delete('/:id', authorize('PARENT', 'EDUCATEUR'), deleteRoutine);
router.delete('/steps/:stepId', authorize('PARENT', 'EDUCATEUR'), deleteRoutineStep);

module.exports = router;
