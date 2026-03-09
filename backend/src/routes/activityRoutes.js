const express = require('express');
const {
    createActivity,
    getActivitiesByLesson,
    submitProgress,
} = require('../controllers/activityController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', authorize('EDUCATEUR', 'ADMIN'), createActivity);
router.get('/lesson/:lessonId', getActivitiesByLesson);
router.post('/:id/progress', submitProgress);

module.exports = router;
