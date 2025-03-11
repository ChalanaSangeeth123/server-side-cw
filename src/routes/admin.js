const express = require('express');
const router = express.Router();
const ApiKey = require('../models/apiKey');

// Create API Key Route
router.post('/api-keys', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const apiKey = await ApiKey.create(name);
        res.status(201).json({
            message: 'API key created successfully',
            apiKey: apiKey.key_value
        });
    } catch (error) {
        console.error('Error creating API key:', error);
        res.status(500).json({ error: 'Error creating API key' });
    }
});

module.exports = router;
