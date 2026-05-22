const express = require('express')
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const morgan = require('morgan');
const upload = require('./config/multer');
const sequelize = require('./config/database');
const userController = require('./controllers/userController');
const postController = require('./controllers/postController');
const systemController = require('./controllers/systemController');
const rateLimit = require("express-rate-limit");
const { authMiddleware, responseTimeMiddleware, errorHandlerMiddleware } = require("./middlewares");
const passport = require('./config/passport');
const app = express()
const port = 3000

app.use(express.json());
app.use(passport.initialize());
app.use(morgan('dev'));
app.use(responseTimeMiddleware);
const allowedOrigins = ['http://localhost:8080', 'https://fandub-space-1.onrender.com'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Blocked by CORS'));
        }
    },
    credentials: true
}));

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

app.get('/status', systemController.getStatus);
app.post('/upload', upload.single('file'), systemController.uploadSingleFile);
app.post('/upload-multiple', upload.array('files', 5), systemController.uploadMultipleFiles);

app.use(errorHandlerMiddleware);

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})
