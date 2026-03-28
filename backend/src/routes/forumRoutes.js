const express = require('express');
const { createPost, getPosts, getPostById, deletePost, addComment, deleteComment } = require('../controllers/forumController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect);

router.route('/posts').get(getPosts).post(createPost);
router.route('/posts/:id').get(getPostById).delete(deletePost);
router.route('/posts/:id/comments').post(addComment);
router.route('/comments/:id').delete(deleteComment);

module.exports = router;
