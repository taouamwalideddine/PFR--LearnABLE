const express = require('express');
const {
    createCourse,
    getCourses,
    getCourseById,
    updateCourse,
    deleteCourse
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/', getCourses);
router.get('/:id', getCourseById);

// Educator/Admin/Parent routes
router.post('/', authorize('EDUCATEUR', 'ADMIN', 'PARENT'), createCourse);
router.put('/:id', authorize('EDUCATEUR', 'ADMIN', 'PARENT'), updateCourse);
router.delete('/:id', authorize('EDUCATEUR', 'ADMIN', 'PARENT'), deleteCourse);

module.exports = router;
