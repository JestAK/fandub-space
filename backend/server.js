const express = require('express')
const sequelize = require('./config/database');
const userController = require('./controllers/userController');
const postController = require('./controllers/postController');
const rateLimit = require("express-rate-limit");
const {authMiddleware} = require("./middlewares");
const app = express()
const port = 3000

app.use(express.json());

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

// app.post('/posts', postController.createPost);
// app.put('/posts/:id', postController.updatePost);
// app.delete('/posts/:id', postController.deletePost);

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})
