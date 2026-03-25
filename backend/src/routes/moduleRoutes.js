const express = require('express');
const {
    createModule,
    updateModule,
    deleteModule
} = require('../controllers/moduleController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Educator/Admin/Parent routes
router.post('/', authorize('EDUCATEUR', 'ADMIN', 'PARENT'), createModule);
router.put('/:id', authorize('EDUCATEUR', 'ADMIN', 'PARENT'), updateModule);
router.delete('/:id', authorize('EDUCATEUR', 'ADMIN', 'PARENT'), deleteModule);

module.exports = router;
