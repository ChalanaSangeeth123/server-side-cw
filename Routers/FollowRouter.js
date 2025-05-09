const express = require('express');
const router = express.Router();
const FollowService = require('../Services/FollowService');
const checkSession = require('../Middleware/SessionAuth/SessionAuth');

const followService = new FollowService();

router.post('/follow', checkSession, async (req, res) => {
    const result = await followService.follow(req);
    res.json(result);
});

router.delete('/unfollow', checkSession, async (req, res) => {
    const result = await followService.unfollow(req);
    res.json(result);
});

router.get('/feed', checkSession, async (req, res) => {
    const result = await followService.getFeed(req);
    res.json(result);
});

router.get('/followers', checkSession, async (req, res) => {
    const result = await followService.getFollowers(req);
    res.json(result);
});

router.get('/following', checkSession, async (req, res) => {
    const result = await followService.getFollowing(req);
    res.json(result);
});

module.exports = router;