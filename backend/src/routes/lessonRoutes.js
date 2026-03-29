const express = require('express');
const {
    createLesson,
    getLessons,
    getLessonById,
    updateLesson,
    assignLesson,
    deleteLesson,
} = require('../controllers/lessonController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router
    .route('/')
    .get(getLessons)
    .post(authorize('EDUCATEUR', 'PARENT'), createLesson);

router
    .route('/:id')
    .get(getLessonById)
    .put(authorize('EDUCATEUR', 'PARENT'), updateLesson)
    .delete(authorize('EDUCATEUR', 'PARENT'), deleteLesson);

router.post('/:id/assign', authorize('PARENT', 'EDUCATEUR'), assignLesson);

module.exports = router;
