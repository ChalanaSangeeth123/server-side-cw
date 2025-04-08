const express = require('express');
const router = express.Router();
const CountryService = require('../Services/CountryService');

const countryService = new CountryService();

// Get country data by name
router.get('/:name', async (req, res) => {
    const result = await countryService.getCountry(req.params.name);
    if (result.success) {
        res.json(result);
    } else {
        res.status(500).json(result);
    }
});

module.exports = router;