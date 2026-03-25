const express = require('express');
const {
    createLesson,
    getLessons,
    getLessonById,
    updateLesson,
    assignLesson,
} = require('../controllers/lessonController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router
    .route('/')
    .get(getLessons)
    .post(authorize('EDUCATEUR', 'ADMIN', 'PARENT'), createLesson);

router
    .route('/:id')
    .get(getLessonById)
    .put(authorize('EDUCATEUR', 'ADMIN', 'PARENT'), updateLesson);

router.post('/:id/assign', authorize('PARENT', 'EDUCATEUR', 'ADMIN'), assignLesson);

module.exports = router;
