const ApiKeyService = require('../../services/apikeyservice');

const apikeyMiddleware = async (req, res, next) => {
    // Get the key from the headers
    const key = req.header('X-API-Key');
    
    // For testing purposes, you can temporarily bypass auth
    // REMOVE THIS FOR PRODUCTION
    if (process.env.NODE_ENV === 'development' && !key) {
        console.log('WARNING: Development mode - bypassing API key authentication');
        return next();
    }
    
    if (!key) {
        return res.status(401).json({
            success: false,
            error: 'API Key Missing',
            timestamp: new Date().toISOString()
        });
    }
    
    const apiKeyService = new ApiKeyService();
    
    try {
        const data = await apiKeyService.validatekey(key);
        if (!data.success) {
            return res.status(403).json({
                success: false,
                error: 'Invalid API key',
                timestamp: new Date().toISOString()
            });
        }
        
        req.key = data.data;
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Authentication error',
            timestamp: new Date().toISOString()
        });
    }
};

module.exports = apikeyMiddleware;