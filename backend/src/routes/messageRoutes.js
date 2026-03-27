const express = require('express');
const { sendMessage, getMessages, markAsRead } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', sendMessage);
router.get('/child/:childId', getMessages);
router.patch('/read/:childId', markAsRead);

module.exports = router;
