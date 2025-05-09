const express = require('express');
const router = express.Router();
const LikesDAO = require('../DAOs/LikeDAO');
const FollowsDAO = require('../DAOs/FollowsDAO');

router.post('/like/:postId', async (req, res, next) => {
    if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
    try {
        await LikesDAO.addLike(req.session.user.id, req.params.postId, 'like');
        const counts = await LikesDAO.getLikesCount(req.params.postId);
        res.status(200).json(counts);
    } catch (err) {
        next(err);
    }
});

router.post('/dislike/:postId', async (req, res, next) => {
    if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
    try {
        await LikesDAO.addLike(req.session.user.id, req.params.postId, 'dislike');
        const counts = await LikesDAO.getLikesCount(req.params.postId);
        res.status(200).json(counts);
    } catch (err) {
        next(err);
    }
});

router.post('/follow/:userId', async (req, res, next) => {
    if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
    try {
        await FollowsDAO.follow(req.session.user.id, req.params.userId);
        res.status(200).json({ message: 'Followed user' });
    } catch (err) {
        next(err);
    }
});

router.post('/unfollow/:userId', async (req, res, next) => {
    if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
    try {
        await FollowsDAO.unfollow(req.session.user.id, req.params.userId);
        res.status(200).json({ message: 'Unfollowed user' });
    } catch (err) {
        next(err);
    }
});

router.get('/followers/:userId', async (req, res, next) => {
    try {
        const followers = await FollowsDAO.getFollowers(req.params.userId);
        res.status(200).json(followers);
    } catch (err) {
        next(err);
    }
});

router.get('/following/:userId', async (req, res, next) => {
    try {
        const following = await FollowsDAO.getFollowing(req.params.userId);
        res.status(200).json(following);
    } catch (err) {
        next(err);
    }
});

module.exports = router;