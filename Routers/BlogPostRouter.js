const express = require('express');
const router = express.Router();
const BlogPostService = require('../Services/BlogPostService');
const checkSession = require('../Middleware/SessionAuth/SessionAuth');

const blogPostService = new BlogPostService();

router.post('/', checkSession, async (req, res) => {
    const result = await blogPostService.create(req);
    res.json(result);
});

router.get('/', async (req, res) => {
    const result = await blogPostService.getAll();
    res.json(result);
});

router.get('/:id', async (req, res) => {
    const result = await blogPostService.getById(req.params.id);
    res.json(result);
});

router.put('/', checkSession, async (req, res) => {
    const result = await blogPostService.update(req);
    res.json(result);
});

router.delete('/', checkSession, async (req, res) => {
    const result = await blogPostService.delete(req);
    res.json(result);
});

router.get('/search', async (req, res) => {
    const { q, type } = req.query;
    const result = await blogPostService.search(q, type);
    res.json(result);
});

module.exports = router;