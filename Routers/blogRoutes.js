const express = require('express');
const router = express.Router();
const BlogPostDAO = require('../DAO/BlogPostDAO');
const CountryService = require('../Services/CountryService');
const restrictAccess = require('../Middleware/restrictAccess');

router.get('/posts', async (req, res) => {
  try {
    const posts = await BlogPostDAO.getAllPosts();
    // Fetch country data for each post
    const enrichedPosts = await Promise.all(posts.map(async (post) => {
      const countryData = await CountryService.getCountryData(post.country);
      return { ...post, countryData };
    }));
    res.status(200).json(enrichedPosts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

router.post('/posts', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
  const { title, content, country, dateOfVisit } = req.body;
  try {
    const post = await BlogPostDAO.createPost(req.session.user.id, title, content, country, dateOfVisit);
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

router.put('/posts/:id', restrictAccess, async (req, res) => {
  const { title, content, country, dateOfVisit } = req.body;
  try {
    const changes = await BlogPostDAO.updatePost(req.params.id, req.session.user.id, title, content, country, dateOfVisit);
    if (changes) {
      res.status(200).json({ message: 'Post updated' });
    } else {
      res.status(404).json({ error: 'Post not found or unauthorized' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update post' });
  }
});

router.delete('/posts/:id', restrictAccess, async (req, res) => {
  try {
    const changes = await BlogPostDAO.deletePost(req.params.id, req.session.user.id);
    if (changes) {
      res.status(200).json({ message: 'Post deleted' });
    } else {
      res.status(404).json({ error: 'Post not found or unauthorized' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

module.exports = router;