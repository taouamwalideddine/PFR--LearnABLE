const express = require('express');
const {
    createChild,
    getChildren,
    getChildById,
    updateChild,
    getChildLessons,
    getChildCourses,
    assignLesson,
    removeLesson,
} = require('../controllers/childController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All child routes need protection

router
    .route('/')
    .post(authorize('PARENT', 'EDUCATEUR', 'ADMIN'), createChild)
    .get(getChildren);

router
    .route('/:id')
    .get(getChildById)
    .put(updateChild);

// Lesson assignment routes
router
    .route('/:id/lessons')
    .get(getChildLessons)
    .post(authorize('PARENT', 'EDUCATEUR', 'ADMIN'), assignLesson);

router
    .route('/:id/lessons/:lessonId')
    .delete(authorize('PARENT', 'EDUCATEUR', 'ADMIN'), removeLesson);

router
    .route('/:id/courses')
    .get(getChildCourses);

module.exports = router;
