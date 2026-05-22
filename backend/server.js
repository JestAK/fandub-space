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
const { body, validationResult } = require('express-validator');
const { authMiddleware, responseTimeMiddleware, errorHandlerMiddleware, cacheMiddleware} = require("./middlewares");
const passport = require('./config/passport');
const helmet = require("helmet");
const app = express()
const port = 3000

app.use(express.json());
app.use(passport.initialize());
app.use(morgan('dev'));
app.use(responseTimeMiddleware);
app.use(helmet());
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

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 20,
    message: { error: 'Too many attempts, please try again later' }
});
app.use(limiter);

sequelize.sync({ alter: true }).then(() => {
    console.log("Tables created / DB Synced");
}).catch(err => {
    console.error("Connection error:", err);
});

app.post(
    '/register',
    body('email').isEmail().withMessage('Invalid email format. Please enter a valid address (e.g., user@example.com)'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('name').notEmpty().withMessage('Name is required'),
    body('role').isIn(['actor', 'translator', 'sound']).withMessage('Invalid role. Allowed roles are: actor, translator, sound'),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        userController.registerUser(req, res);
    }
);
app.post(
    '/login',
    body('email').isEmail().withMessage('Invalid email format. Please enter a valid address (e.g., user@example.com)'),
    body('password').notEmpty().withMessage('Please enter your password'),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        userController.loginUser(req, res);
    }
);
app.get('/profile', authMiddleware, userController.getUserProfile);
app.post(
    '/refresh-token',
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        userController.refreshToken(req, res);
    }
);
app.post(
    '/logout',
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        userController.logoutUser(req, res);
    }
);
app.post(
    '/profile/update',
    authMiddleware,
    body('name').optional().notEmpty().withMessage('Name cannot be empty if provided'),
    body('role').optional().isIn(['actor', 'translator', 'sound']).withMessage('Invalid role. Allowed roles are: actor, translator, sound'),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        userController.updateUserProfile(req, res);
    }
);
app.post('/profile/delete', authMiddleware, userController.deleteUserProfile);
app.post(
    '/profile/change-password',
    authMiddleware,
    body('oldPassword').notEmpty().withMessage('Old password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
    body('confirmedNewPassword').notEmpty().withMessage('Confirmation password is required'),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        userController.changeUserPassword(req, res);
    }
);

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/login?error=google_failed` }),
    userController.googleAuthCallback
);

app.post(
    '/posts',
    authMiddleware,
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        postController.createUserPost(req, res);
    }
);
app.get('/posts', cacheMiddleware, postController.getApprovedUserPosts);
app.get('/posts-non-opt', postController.getApprovedUserPosts);
app.put(
    '/posts/:id',
    authMiddleware,
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        postController.updateUserPost(req, res);
    }
);
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
