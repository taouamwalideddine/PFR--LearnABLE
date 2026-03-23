const express = require('express');
const router = express.Router();
const { getChildRewards } = require('../controllers/rewardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/child/:childId', protect, getChildRewards);

module.exports = router;
