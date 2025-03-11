const ApiKey = require('../models/apiKey');

class ApiKeyController {
    static async createApiKey(req, res) {
        try {
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ error: 'Name is required' });
            }

            const apiKey = await ApiKey.create(name);
            res.status(201).json({
                message: 'API key created successfully',
                apiKey: apiKey.key_value // ✅ Use key_value
            });
        } catch (error) {
            console.error('Error creating API key:', error);
            res.status(500).json({ error: 'Error creating API key' });
        }
    }
}


module.exports = ApiKeyController;
