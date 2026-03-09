const express = require('express');
const {
    getChildProgress,
    getChildStats,
} = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/child/:childId', getChildProgress);
router.get('/stats/:childId', getChildStats);

module.exports = router;
