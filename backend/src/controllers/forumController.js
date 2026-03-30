const AppDataSource = require('../config/data-source');

// @desc create a post
const createPost = async (req, res) => {
    try {
        const { title, content, category } = req.body;
        const repo = AppDataSource.getRepository('Post');
        const post = repo.create({ title, content, category, authorId: req.user.id });
        const saved = await repo.save(post);
        res.status(201).json(saved);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc get all posts
const getPosts = async (req, res) => {
    try {
        const repo = AppDataSource.getRepository('Post');
        const posts = await repo.find({
            relations: ['author', 'comments'],
            order: { createdAt: 'DESC' },
        });
        res.json(posts.map(p => ({
            id: p.id,
            title: p.title,
            content: p.content,
            category: p.category,
            isReported: p.isReported,
            authorEmail: p.author?.email,
            authorId: p.authorId,
            commentCount: p.comments?.length || 0,
            createdAt: p.createdAt,
        })));
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc get single post with comments
const getPostById = async (req, res) => {
    try {
        const repo = AppDataSource.getRepository('Post');
        const post = await repo.findOne({
            where: { id: req.params.id },
            relations: ['author', 'comments', 'comments.author'],
        });
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (post.comments) post.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            ...post,
            authorEmail: post.author?.email,
            comments: post.comments?.map(c => ({
                id: c.id,
                content: c.content,
                authorEmail: c.author?.email,
                authorId: c.authorId,
                createdAt: c.createdAt,
            })) || [],
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc delete a post
const deletePost = async (req, res) => {
    try {
        const repo = AppDataSource.getRepository('Post');
        const commentRepo = AppDataSource.getRepository('Comment');
        const post = await repo.findOneBy({ id: req.params.id });
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.authorId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        await commentRepo.delete({ postId: req.params.id });
        await repo.remove(post);
        res.json({ message: 'Post deleted' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc add a comment to a post
const addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const repo = AppDataSource.getRepository('Comment');
        const comment = repo.create({ content, authorId: req.user.id, postId: req.params.id });
        const saved = await repo.save(comment);
        res.status(201).json(saved);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc delete a comment
const deleteComment = async (req, res) => {
    try {
        const repo = AppDataSource.getRepository('Comment');
        const comment = await repo.findOneBy({ id: req.params.id });
        if (!comment) return res.status(404).json({ message: 'Comment not found' });
        if (comment.authorId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        await repo.remove(comment);
        res.json({ message: 'Comment deleted' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createPost, getPosts, getPostById, deletePost, addComment, deleteComment };
