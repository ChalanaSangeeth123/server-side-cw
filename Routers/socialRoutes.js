const express = require('express');
const router = express.Router();
const LikesDAO = require('../DAO/LikesDAO');
const FollowsDAO = require('../DAO/FollowsDAO');

router.post('/like/:postId', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
  try {
    await LikesDAO.addLike(req.session.user.id, req.params.postId, 'like');
    const counts = await LikesDAO.getLikesCount(req.params.postId);
    res.status(200).json(counts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to like post' });
  }
});

router.post('/dislike/:postId', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
  try {
    await LikesDAO.addLike(req.session.user.id, req.params.postId, 'dislike');
    const counts = await LikesDAO.getLikesCount(req.params.postId);
    res.status(200).json(counts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to dislike post' });
  }
});

router.post('/follow/:userId', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
  try {
    await FollowsDAO.follow(req.session.user.id, req.params.userId);
    res.status(200).json({ message: 'Followed user' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

router.post('/unfollow/:userId', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
  try {
    await FollowsDAO.unfollow(req.session.user.id, req.params.userId);
    res.status(200).json({ message: 'Unfollowed user' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

router.get('/followers/:userId', async (req, res) => {
  try {
    const followers = await FollowsDAO.getFollowers(req.params.userId);
    res.status(200).json(followers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
});

router.get('/following/:userId', async (req, res) => {
  try {
    const following = await FollowsDAO.getFollowing(req.params.userId);
    res.status(200).json(following);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch following' });
  }
});

module.exports = router;