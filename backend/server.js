const express = require('express')
const sequelize = require('./config/database');
const userController = require('./controllers/userController');
const postController = require('./controllers/postController');
const app = express()
const port = 3000

app.use(express.json());

sequelize.sync({ alter: true }).then(() => {
    console.log("Tables created / DB Synced");
}).catch(err => {
    console.error("Connection error:", err);
});

app.get('/users', userController.getAllUsers);
app.post('/users', userController.createUser);

app.post('/posts', postController.createPost);
app.put('/posts/:id', postController.updatePost);
app.delete('/posts/:id', postController.deletePost);

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})
