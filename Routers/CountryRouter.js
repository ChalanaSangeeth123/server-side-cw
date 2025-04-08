const express = require('express');
const router = express.Router();
const CountryService = require('../Services/CountryService');
const APIKey = require('../Services/ApiKeyService');

const countryService = new CountryService();
const apiKeyService = new APIKey();

// Get country data by name
router.get('/:name', async (req, res) => {
    const { name } = req.params;
    const { apiKey } = req.query;

    if (!apiKey) {
        return res.status(401).json(createResponse(false, null, 'API key required'));
    }

    const validationResult = await apiKeyService.validatekey(apiKey);
    if (!validationResult.success) {
        return res.status(401).json(createResponse(false, null, 'Invalid or inactive API key'));
    }

    const result = await countryService.getCountry(name);
    if (result.success) {
        res.json(result);
    } else {
        res.status(500).json(result);
    }
});

module.exports = router;