const express = require('express');
const {
    createModule,
    updateModule,
    deleteModule
} = require('../controllers/moduleController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Educator/Admin only routes
router.post('/', authorize('EDUCATEUR', 'ADMIN'), createModule);
router.put('/:id', authorize('EDUCATEUR', 'ADMIN'), updateModule);
router.delete('/:id', authorize('EDUCATEUR', 'ADMIN'), deleteModule);

module.exports = router;
