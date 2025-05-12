const express = require('express');
const router = express.Router();
const LikesService = require('../Services/LikesService');
const checkSession = require('../Middleware/SessionAuth/SessionAuth');

const likesService = new LikesService();

router.post('/like', checkSession, async (req, res) => {
    console.log('Like request received:', req.body); // Debug
    const result = await likesService.like(req);
    res.json(result);
});

router.get('/', async (req, res) => {
    console.log('Get likes request received:', req.query); // Debug
    const result = await likesService.getLikes(req);
    res.json(result);
});

module.exports = router;