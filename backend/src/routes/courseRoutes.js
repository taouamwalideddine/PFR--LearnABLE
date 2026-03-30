const express = require('express');
const {
    createCourse,
    getCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    assignCourse
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getCourses);
router.get('/:id', getCourseById);


router.post('/', authorize('EDUCATEUR', 'PARENT'), createCourse);
router.put('/:id', authorize('EDUCATEUR', 'PARENT'), updateCourse);
router.delete('/:id', authorize('EDUCATEUR', 'PARENT'), deleteCourse);
router.post('/:id/assign', authorize('PARENT', 'EDUCATEUR'), assignCourse);

module.exports = router;
