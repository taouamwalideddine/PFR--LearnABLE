const express = require('express');
const {
    createModule,
    updateModule,
    deleteModule
} = require('../controllers/moduleController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);


router.post('/', authorize('EDUCATEUR', 'PARENT'), createModule);
router.put('/:id', authorize('EDUCATEUR', 'PARENT'), updateModule);
router.delete('/:id', authorize('EDUCATEUR', 'PARENT'), deleteModule);

module.exports = router;
