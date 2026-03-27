const express = require('express');
const {
    getChildProgress,
    getChildStats,
    getClassroomAnalytics,
    getCategoryBreakdown,
} = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/classroom', getClassroomAnalytics);
router.get('/categories/:childId', getCategoryBreakdown);
router.get('/child/:childId', getChildProgress);
router.get('/stats/:childId', getChildStats);

module.exports = router;
