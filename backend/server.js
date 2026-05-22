const express = require('express')
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const morgan = require('morgan');
const helmet = require("helmet");
const upload = require('./config/multer');
const sequelize = require('./config/database');
const passport = require('./config/passport');
const { swaggerUi, specs } = require('./config/swagger');
const userController = require('./controllers/userController');
const postController = require('./controllers/postController');
const systemController = require('./controllers/systemController');
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require('express-validator');
const { authMiddleware, responseTimeMiddleware, errorHandlerMiddleware, cacheMiddleware} = require("./middlewares");
const app = express()
const port = 3000

app.use(express.json());
app.use(passport.initialize());
app.use(morgan('dev'));
app.use(responseTimeMiddleware);
app.use(helmet());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));
const allowedOrigins = ['http://localhost:8080', 'https://fandub-space-1.onrender.com', 'http://localhost:3000', 'https://fandub-space.onrender.com'];

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

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, confirmedPassword, name, role]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmedPassword:
 *                 type: string
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [actor, translator, sound]
 *     responses:
 *       201:
 *         description: User registered
 *       400:
 *         description: Validation error
 */
app.post(
    '/register',
    body('email').isEmail().withMessage('Invalid email format. Please enter a valid address (e.g., user@example.com)'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('confirmedPassword').notEmpty().withMessage('Please confirm your password'),
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
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 */
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
/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Unauthorized
 */
app.get('/profile', authMiddleware, userController.getUserProfile);
/**
 * @swagger
 * /refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access token
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid token
 */
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
/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged out
 *       400:
 *         description: Validation error
 */
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
/**
 * @swagger
 * /profile/update:
 *   post:
 *     summary: Update user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [actor, translator, sound]
 *     responses:
 *       200:
 *         description: Profile updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
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
/**
 * @swagger
 * /profile/delete:
 *   post:
 *     summary: Delete current user account
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted
 *       401:
 *         description: Unauthorized
 */
app.post('/profile/delete', authMiddleware, userController.deleteUserProfile);
/**
 * @swagger
 * /profile/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword, confirmedNewPassword]
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmedNewPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
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

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Redirect to Google OAuth
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect to Google
 */
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect after Google auth
 *       401:
 *         description: Authentication failed
 */
app.get('/auth/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/login?error=google_failed` }),
    userController.googleAuthCallback
);

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Post created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
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
/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all approved posts (cached)
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: List of approved posts
 */
app.get('/posts', cacheMiddleware, postController.getApprovedUserPosts);
/**
 * @swagger
 * /posts-non-opt:
 *   get:
 *     summary: Get all approved posts (no cache)
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: List of approved posts
 */
app.get('/posts-non-opt', postController.getApprovedUserPosts);
/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
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
/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post deleted
 *       401:
 *         description: Unauthorized
 */
app.delete('/posts/:id', authMiddleware, postController.deleteUserPost);

/**
 * @swagger
 * /admin/posts/pending:
 *   get:
 *     summary: Get pending posts (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending posts
 *       401:
 *         description: Unauthorized
 */
app.get('/admin/posts/pending', authMiddleware, postController.getPendingUserPosts);
/**
 * @swagger
 * /admin/posts/{id}/moderate:
 *   put:
 *     summary: Moderate a post (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post moderated
 *       401:
 *         description: Unauthorized
 */
app.put('/admin/posts/:id/moderate', authMiddleware, postController.moderateUserPost);

/**
 * @swagger
 * /status:
 *   get:
 *     summary: Get server status
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is running
 */
app.get('/status', systemController.getStatus);
/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload a single file
 *     tags: [System]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded
 */
app.post('/upload', upload.single('file'), systemController.uploadSingleFile);
/**
 * @swagger
 * /upload-multiple:
 *   post:
 *     summary: Upload multiple files (max 5)
 *     tags: [System]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Files uploaded
 */
app.post('/upload-multiple', upload.array('files', 5), systemController.uploadMultipleFiles);

app.use(errorHandlerMiddleware);

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})
