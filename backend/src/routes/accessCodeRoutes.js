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

router.post('/generate', authorize('PARENT'), generateCode);
router.post('/redeem', authorize('EDUCATEUR'), redeemCode);
router.get('/links/:childId', authorize('PARENT'), getChildLinks);
router.delete('/links/:linkId', authorize('PARENT'), revokeAccess);
router.get('/my-students', authorize('EDUCATEUR'), getMyStudents);

module.exports = router;
