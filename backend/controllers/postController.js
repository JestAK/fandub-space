const Post = require('../models/Post');

const createPost = async (req, res) => {
    try {
        const { title, content, userId } = req.body;
        if (!title || !content || !userId) {
            return res.status(400).json({ error: 'Title, content and userId are required' });
        }

        const post = await Post.create({ title, content, UserId: userId });
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        const [updatedRows] = await Post.update({ title, content }, { where: { id } });
        if (updatedRows === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json({ message: 'Post updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Видалення поста (DELETE) [cite: 158, 159]
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRows = await Post.destroy({ where: { id } });
        if (deletedRows === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json({ message: 'Post deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createPost,
    updatePost,
    deletePost
};