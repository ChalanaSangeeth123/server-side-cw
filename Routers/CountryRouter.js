const express = require('express');
const router = express.Router();
const CountryService = require('../services/countryservice');
const apikeyMiddleware = require('../middleware/apiauth/apiauthmiddleware');

const countryService = new CountryService();

// Route for getting all countries
router.get('/', apikeyMiddleware, async (req, res) => {
    try {
        console.log('Processing /api/countries request...');
        const countries = await countryService.getAll();
        console.log('Sending', countries.length, 'countries');
        
        res.json({
            success: true,
            data: countries,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Route error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch countries',
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;