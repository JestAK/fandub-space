const User = require('../models/User');
const Post = require('../models/Post');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({ include: Post });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createUser = async (req, res) => {
    try {
        const { name, role } = req.body;

        if (!name || !role) {
            return res.status(400).json({ error: 'Name and role are required' });
        }

        const allowedRoles = ['actor', 'translator', 'sound'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                error: `Invalid role. Allowed roles are: ${allowedRoles.join(', ')}`
            });
        }

        const user = await User.create({ name, role });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id, { include: Post });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAllUsers,
    createUser,
    getUserById
};