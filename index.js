const express = require('express');
const userService = require('./src/controllers/userController'); // Import controller

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON

// Default route for testing
app.get('/', (req, res) => {
    res.send("Server is running!");
});

// User routes
app.get('/users', userService.getUsers);
app.get('/users/:id', userService.getUserById);
app.post('/users', userService.createUser);
app.put('/users/:id', userService.updateUser);
app.delete('/users/:id', userService.deleteUser);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
