const express = require('express')
const dotenv = require('dotenv');
dotenv.config();
const sequelize = require('./config/database');
const userController = require('./controllers/userController');
const postController = require('./controllers/postController');
const rateLimit = require("express-rate-limit");
const {authMiddleware} = require("./middlewares");
const passport = require('./config/passport');
const app = express()
const port = 3000

app.use(express.json());
app.use(passport.initialize());

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many login attempts, please try again later' }
});

sequelize.sync({ alter: true }).then(() => {
    console.log("Tables created / DB Synced");
}).catch(err => {
    console.error("Connection error:", err);
});

app.post('/register', userController.registerUser);
app.post('/login', loginLimiter, userController.loginUser);
app.get('/profile', authMiddleware, userController.getUserProfile);
app.post('/refresh-token', userController.refreshToken);
app.post('/logout', userController.logoutUser);
app.post('/profile/update', authMiddleware, userController.updateUserProfile);
app.post('/profile/delete', authMiddleware, userController.deleteUserProfile);
app.post('/profile/change-password', authMiddleware, userController.changeUserPassword);

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/login?error=google_failed` }),
    userController.googleAuthCallback
);

app.post('/posts', authMiddleware, postController.createUserPost);
app.get('/posts', postController.getApprovedUserPosts);
app.put('/posts/:id', authMiddleware, postController.updateUserPost);
app.delete('/posts/:id', authMiddleware, postController.deleteUserPost);

app.get('/admin/posts/pending', authMiddleware, postController.getPendingUserPosts);
app.put('/admin/posts/:id/moderate', authMiddleware, postController.moderateUserPost);

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})
