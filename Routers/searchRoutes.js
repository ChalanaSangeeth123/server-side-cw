const express = require('express');
const router = express.Router();
const BlogPostDAO = require('../DAO/BlogPostDAO');
const CountryService = require('../Services/CountryService');

router.get('/country/:country', async (req, res) => {
  try {
    const posts = await BlogPostDAO.getPostsByCountry(req.params.country);
    const enrichedPosts = await Promise.all(posts.map(async (post) => {
      const countryData = await CountryService.getCountryData(post.country);
      return { ...post, countryData };
    }));
    res.status(200).json(enrichedPosts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to search posts' });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await BlogPostDAO.getPostsByUser(req.params.userId);
    const enrichedPosts = await Promise.all(posts.map(async (post) => {
      const countryData = await CountryService.getCountryData(post.country);
      return { ...post, countryData };
    }));
    res.status(200).json(enrichedPosts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to search posts' });
  }
});

module.exports = router;