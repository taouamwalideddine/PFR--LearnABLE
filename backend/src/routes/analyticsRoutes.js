const express = require('express');
const {
    getClassroomOverview,
    getChildAnalytics,
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/classroom', authorize('PARENT', 'EDUCATEUR', 'ADMIN'), getClassroomOverview);
router.get('/child/:childId', authorize('PARENT', 'EDUCATEUR', 'ADMIN'), getChildAnalytics);

module.exports = router;
