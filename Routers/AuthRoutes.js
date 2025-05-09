const express = require('express');
const router = express.Router();
const UserService = require('../Services/UserService');
const APIKey = require('../Services/ApiKeyService');

router.post('/register', async (req, res) => {
    const userService = new UserService();
    const result = await userService.create(req);
    res.json(result);
});

router.post('/login', async (req, res) => {
    const userService = new UserService();
    const result = await userService.authenticate(req);
    res.json(result);
});

router.post('/getapikey', async (req, res) => {
    const apikeyservice = new APIKey();
    const result = await apikeyservice.create(req); // Fixed typo from 'data' to 'result'
    res.json(result);
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.status(200).json({ message: 'Logged out' });
});

router.get('/me', (req, res) => {
    if (req.session.user) {
        res.status(200).json({ user: req.session.user });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

module.exports = router;