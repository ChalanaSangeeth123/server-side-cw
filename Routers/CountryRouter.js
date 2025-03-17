const express = require('express');
const router = express.Router();
const CountryService = require('../Services/CountryService');
const apikeyMiddleware = require('../Middleware/APIAuth/APIAuthMiddleWare');
const checkSession = require('../Middleware/SessionAuth/SessionAuth');

const countryService = new CountryService();

router.get('/countries', 
    apikeyMiddleware,
    checkSession,
    async (req, res) => {
        try {
            const countries = await countryService.getAll();
            res.json({
                success: true,
                data: countries,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
);

router.post('/countries', 
    apikeyMiddleware,
    checkSession,
    async (req, res) => {
        try {
            const result = await countryService.create(req);
            res.json({
                success: true,
                data: result,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
);

module.exports = router;