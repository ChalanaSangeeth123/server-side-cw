const { v4: uuidv4 } = require('uuid');
const APIKeyDAO = require('../DAOs/APIKeyDAO');

class APIKey {
    constructor() {
        this.apikeydao = new APIKeyDAO();
    }

    async create(req) {
        const key = uuidv4();
        return await this.apikeydao.create(req.body.owner, key);
    }

    async validatekey(key) {
        const result = await this.apikeydao.getKey(key);
        if (result.success) {
            await this.apikeydao.updateUsage(key); // Track usage
        }
        return result;
    }

    async getUserKeys(userId) {
        return await this.apikeydao.getKeysByUser(userId);
    }

    async revokeKey(key) {
        return await this.apikeydao.revokeKey(key);
    }
}

module.exports = APIKey;