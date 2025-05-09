const express = require('express');
const router = express.Router();
const BlogPostDAO = require('../DAOs/BlogPostDAO'); // Changed from './server-side/DAOs/BlogPostDAO'
const CountryService = require('../Services/CountryService');

router.get('/country/:country', async (req, res, next) => {
    try {
        const posts = await BlogPostDAO.getPostsByCountry(req.params.country);
        const enrichedPosts = await Promise.all(posts.map(async (post) => {
            const countryData = await CountryService.getCountryData(post.country);
            return { ...post, countryData };
        }));
        res.status(200).json(enrichedPosts);
    } catch (err) {
        next(err);
    }
});

router.get('/user/:userId', async (req, res, next) => {
    try {
        const posts = await BlogPostDAO.getPostsByUser(req.params.userId);
        const enrichedPosts = await Promise.all(posts.map(async (post) => {
            const countryData = await CountryService.getCountryData(post.country);
            return { ...post, countryData };
        }));
        res.status(200).json(enrichedPosts);
    } catch (err) {
        next(err);
    }
});

module.exports = router;