const express = require('express');
const {
    generateCode,
    redeemCode,
    getChildLinks,
    revokeAccess,
    getMyStudents,
} = require('../controllers/accessCodeController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/generate', authorize('PARENT', 'ADMIN'), generateCode);
router.post('/redeem', authorize('EDUCATEUR', 'ADMIN'), redeemCode);
router.get('/links/:childId', authorize('PARENT', 'ADMIN'), getChildLinks);
router.delete('/links/:linkId', authorize('PARENT', 'ADMIN'), revokeAccess);
router.get('/my-students', authorize('EDUCATEUR', 'ADMIN'), getMyStudents);

module.exports = router;
