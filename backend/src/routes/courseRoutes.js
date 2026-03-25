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

// Educator/Admin only routes
router.post('/', authorize('EDUCATEUR', 'ADMIN'), createCourse);
router.put('/:id', authorize('EDUCATEUR', 'ADMIN'), updateCourse);
router.delete('/:id', authorize('EDUCATEUR', 'ADMIN'), deleteCourse);

module.exports = router;
