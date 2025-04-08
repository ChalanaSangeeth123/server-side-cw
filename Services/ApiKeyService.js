const APIKeyDAO = require('../DAOs/APIKeyDAO');
const { v4: uuidv4 } = require('uuid');

class APIKey {
    constructor() {
        this.apikeydao = new APIKeyDAO();
    }

    // Generate and store new API key
    async create(req) {
        const key = uuidv4();
        return await this.apikeydao.create(req.session.user.id, key);
    }

    // Validate API key
    async validatekey(key) {
        const result = await this.apikeydao.getKey(key);
        if (result.success) {
            await this.apikeydao.incrementUsage(key); // Track usage
        }
        return result;
    }
}

module.exports = APIKey;