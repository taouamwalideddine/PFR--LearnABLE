const express = require('express');
const {
    createActivity,
    getActivitiesByLesson,
    submitProgress,
    updateActivity,
    deleteActivity
} = require('../controllers/activityController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', authorize('EDUCATEUR', 'PARENT'), createActivity);
router.get('/lesson/:lessonId', getActivitiesByLesson);
router.post('/:id/progress', submitProgress);
router.put('/:id', authorize('EDUCATEUR', 'PARENT'), updateActivity);
router.delete('/:id', authorize('EDUCATEUR', 'PARENT'), deleteActivity);

module.exports = router;
