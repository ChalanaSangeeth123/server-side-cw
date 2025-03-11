const express = require('express');
const router = express.Router();
const userService = require('../controllers/userController');

// Get all users
router.get('/', async (req, res) => {
    const users = await userService.getUsers();
    res.json(users);
});

// Get user by ID
router.get('/:id', async (req, res) => {
    const user = await userService.getUser(req.params.id);
    res.json(user);
});

// Create user
router.post('/', async (req, res) => {
    const id = await userService.addUser(req.body);
    res.json({ id });
});

// Update user
router.put('/:id', async (req, res) => {
    await userService.updateUser(req.params.id, req.body);
    res.sendStatus(200);
});

// Delete user
router.delete('/:id', async (req, res) => {
    await userService.deleteUser(req.params.id);
    res.sendStatus(200);
});

module.exports = router;