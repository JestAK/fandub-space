const dotenv = require('dotenv');
dotenv.config();
const User = require('../models/User');
const Post = require('../models/Post');
const RefreshToken = require('../models/RefreshToken');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;


const registerUser = async (req, res) => {
    try {
        const { email, password, confirmedPassword, name, role } = req.body;

        if (password !== confirmedPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await createUser({ email, password: hashedPassword, name, role, isAdmin: false});
        const userResponse = user.toJSON();
        delete userResponse.password;
        res.status(201).json(userResponse);
    } catch (error) {
        if (error.message === 'User with this email already exists') {
            return res.status(400).json({ error: error.message });
        }

        console.error("Registration Error:", error);
        res.status(500).json({ error: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, email: user.email, isAdmin: user.isAdmin }, ACCESS_SECRET, { expiresIn: '1h' });

        const refreshToken = jwt.sign(
            { id: user.id },
            REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);

        await RefreshToken.create({
            token: refreshToken,
            expiresAt: expiryDate,
            UserId: user.id
        });

        res.json({ token, refreshToken });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: error.message });
    }
}

const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId, { include: Post });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userResponse = user.toJSON();
        delete userResponse.password;
        res.json(userResponse);
    } catch (error) {
        console.error("Profile Retrieval Error:", error);
        res.status(500).json({ error: error.message });
    }
}

const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        const storedToken = await RefreshToken.findOne({ where: { token: refreshToken } });
        if (!storedToken) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }

        if (new Date() > storedToken.expiresAt) {
            await storedToken.destroy();
            return res.status(401).json({ error: 'Refresh token expired' });
        }

        const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const newAccessToken = jwt.sign({ id: user.id, email: user.email, isAdmin: user.isAdmin }, ACCESS_SECRET, { expiresIn: '1h' });

        res.json({ token: newAccessToken });
    } catch (error) {
        console.error("Refresh Token Error:", error);
        res.status(500).json({ error: error.message });
    }
}

const logoutUser = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        await RefreshToken.destroy({ where: { token: refreshToken } });
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({ error: error.message });
    }
}

const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, role } = req.body;

        const fieldsToUpdate = {};

        if (name) {
            fieldsToUpdate.name = name;
        }

        if (role) {
            fieldsToUpdate.role = role;
        }

        if (Object.keys(fieldsToUpdate).length === 0) {
            return res.status(400).json({ error: 'Please provide name or role to update' });
        }

        const updatedUser = await updateUser(userId, fieldsToUpdate);

        res.json({ message: 'Profile updated successfully', user: updatedUser });

    } catch (error) {
        console.error("Update User Error:", error);

        if (error.message === 'User not found') {
            return res.status(404).json({ error: error.message });
        }

        res.status(500).json({ error: error.message });
    }
};

const deleteUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        await deleteUser(userId);

        res.json({ message: 'User account and all associated data deleted successfully' });

    } catch (error) {
        console.error("Delete User Error:", error);

        if (error.message === 'User not found') {
            return res.status(404).json({ error: error.message });
        }

        res.status(500).json({ error: error.message });
    }
}

const changeUserPassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword, confirmedNewPassword } = req.body;

        if (newPassword !== confirmedNewPassword) {
            return res.status(400).json({ error: 'New passwords do not match' });
        }

        if (oldPassword === newPassword) {
            return res.status(400).json({ error: 'New password cannot be the same as the old password' });
        }

        await changePassword(userId, oldPassword, newPassword);

        res.json({ message: 'Password changed successfully' });

    } catch (error) {
        console.error("Change Password Error:", error);

        if (error.message === 'User not found') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'Incorrect old password') {
            return res.status(400).json({ error: error.message });
        }

        res.status(500).json({ error: error.message });
    }
};

const googleAuthCallback = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }

        const accessToken = jwt.sign(
            { id: req.user.id, email: req.user.email, isAdmin: req.user.isAdmin },
            ACCESS_SECRET,
            { expiresIn: '15m' }
        );

        const refreshTokenValue = jwt.sign(
            { id: req.user.id },
            REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        await RefreshToken.create({
            token: refreshTokenValue,
            UserId: req.user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        res.redirect(`${process.env.FRONTEND_URL}/login?token=${accessToken}&refreshToken=${refreshTokenValue}`);
    } catch (error) {
        res.redirect(`${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(error.message)}`);
    }
};

const changePassword = async (userId, oldPassword, newPassword) => {
    const user = await User.findByPk(userId);
    if (!user) {
        throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
        throw new Error('Incorrect old password');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await user.update({ password: hashedNewPassword });

    return true;
};

const deleteUser = async (userId) => {
    const user = await User.findByPk(userId);
    if (!user) {
        throw new Error('User not found');
    }

    await user.destroy();

    return true;
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({ include: Post });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createUser = async (data) => {
    const { email, password, name, role, isAdmin } = data;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
        throw new Error('User with this email already exists');
    }

    return await User.create({
        name,
        role,
        email,
        password,
        isAdmin
    });
};

const getUserById = async (req, res) => {
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

const updateUser = async (userId, updateData) => {
    const user = await User.findByPk(userId);
    if (!user) {
        throw new Error('User not found');
    }

    await user.update(updateData);

    const plainUser = user.toJSON();
    delete plainUser.password;

    return plainUser;
}

module.exports = {
    getAllUsers,
    createUser,
    getUserById,
    registerUser,
    loginUser,
    getUserProfile,
    refreshToken,
    logoutUser,
    updateUserProfile,
    deleteUserProfile,
    changeUserPassword,
    googleAuthCallback,
};