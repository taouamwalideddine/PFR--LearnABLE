const express = require('express');
const {
    createChild,
    getChildren,
    getChildById,
    updateChild,
} = require('../controllers/childController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All child routes need protection

router
    .route('/')
    .post(authorize('PARENT', 'EDUCATEUR', 'ADMIN'), createChild)
    .get(getChildren);

router
    .route('/:id')
    .get(getChildById)
    .put(updateChild);

module.exports = router;
