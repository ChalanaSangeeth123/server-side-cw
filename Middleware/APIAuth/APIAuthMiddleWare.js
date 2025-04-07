const APIKeyService = require('../../Services/ApiKeyService');

const apikeyMiddleware = async (req, res, next) => {
    const key = req.header('X-API-Key');
    if (!key) {
        return res.status(401).json({ error: 'API Key Missing' });
    }

    const apikeyService = new APIKeyService();
    try {
        const data = await apikeyService.validatekey(key);
        if (!data.success) {
            return res.status(403).json({ error: 'Invalid or inactive API key' });
        }
        req.key = data.data;
        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = apikeyMiddleware;