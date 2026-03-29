const express = require('express');
const {
    createChild,
    getChildren,
    getChildById,
    updateChild,
    deleteChild,
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
    .post(authorize('PARENT'), createChild)
    .get(getChildren);

router
    .route('/:id')
    .get(getChildById)
    .put(updateChild)
    .delete(authorize('PARENT'), deleteChild);

// Lesson assignment routes
router
    .route('/:id/lessons')
    .get(getChildLessons)
    .post(authorize('PARENT', 'EDUCATEUR'), assignLesson);

router
    .route('/:id/lessons/:lessonId')
    .delete(authorize('PARENT', 'EDUCATEUR'), removeLesson);

router
    .route('/:id/courses')
    .get(getChildCourses);

module.exports = router;
