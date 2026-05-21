const Post = require('../models/Post');
const User = require('../models/User');

const createUserPost = async (req, res) => {
    try {
        const { title, content } = req.body;
        const userId = req.user.id;

        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        const post = await createPost({ title, content, userId });

        res.status(201).json({
            message: 'Post created successfully and sent for admin review',
            post
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateUserPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const userId = req.user.id;
        const isAdmin = req.user.isAdmin;

        if (!title && !content) {
            return res.status(400).json({ error: 'Please provide title or content to update' });
        }

        const updatedPost = await updatePost(id, userId, isAdmin, { title, content });

        res.json({ message: 'Post updated successfully', post: updatedPost });
    } catch (error) {
        if (error.message === 'Post not found') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'Access denied. You can only edit your own posts') {
            return res.status(403).json({ error: error.message });
        }
        if (error.message === 'Cannot edit post. It has already been reviewed by admins') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};

const deleteUserPost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const isAdmin = req.user.isAdmin;

        await deletePost(id, userId, isAdmin);

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        if (error.message === 'Post not found') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'Access denied. You can only delete your own posts') {
            return res.status(403).json({ error: error.message });
        }

        res.status(500).json({ error: error.message });
    }
};

const getApprovedUserPosts = async (req, res) => {
    try {
        const posts = await getPostsByStatus('approved');
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getPendingUserPosts = async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }
        const posts = await getPostsByStatus('pending');
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const moderateUserPost = async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        const { id } = req.params;
        const { status } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Choose approved or rejected' });
        }

        const post = await updatePostStatus(id, status);
        res.json({ message: `Post status successfully updated to ${status}`, post });
    } catch (error) {
        if (error.message === 'Post not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};

const createPost = async (data) => {
    const { title, content, userId } = data;
    return await Post.create({
        title,
        content,
        UserId: userId
    });
};

const updatePost = async (postId, userId, isAdmin, updateData) => {
    const post = await Post.findByPk(postId);
    if (!post) {
        throw new Error('Post not found');
    }

    if (post.UserId !== userId && !isAdmin) {
        throw new Error('Access denied. You can only edit your own posts');
    }

    if (!isAdmin && post.status !== 'pending') {
        throw new Error('Cannot edit post. It has already been reviewed by admins');
    }

    await post.update(updateData);
    return post;
};

const deletePost = async (postId, userId, isAdmin) => {
    const post = await Post.findByPk(postId);
    if (!post) {
        throw new Error('Post not found');
    }

    if (post.UserId !== userId && !isAdmin) {
        throw new Error('Access denied. You can only delete your own posts');
    }

    await post.destroy();
    return true;
};

const getPostsByStatus = async (status) => {
    return await Post.findAll({
        where: { status },
        include: [{ model: User, attributes: ['id', 'name', 'role'] }]
    });
}

const updatePostStatus = async (postId, newStatus) => {
    const post = await Post.findByPk(postId);
    if (!post) {
        throw new Error('Post not found');
    }
    await post.update({ newStatus });
    return post;
}

module.exports = {
    createPost,
    updatePost,
    deletePost,
    getPostsByStatus,
    updatePostStatus,
    createUserPost,
    updateUserPost,
    deleteUserPost,
    getApprovedUserPosts,
    getPendingUserPosts,
    moderateUserPost,
};