const { v4: uuidv4 } = require('uuid');
const APIKeyDAO = require('../DAOs/APIKeyDAO');

class APIKeyService {
    constructor() {
        this.apikeydao = new APIKeyDAO();
    }

    async create(req) {
        const key = uuidv4();
        return await this.apikeydao.create(req.session.user.id, key);
    }

    async validatekey(key) {
        const result = await this.apikeydao.getKey(key);
        if (result.success) {
            await this.apikeydao.updateUsage(key);
        }
        return result;
    }

    async getUserKeys(userId) {
        return await this.apikeydao.getKeysByUser(userId);
    }

    async revokeKey(key, userId) {
        return await this.apikeydao.updateKeyStatus(key, userId, 0);
    }
}

module.exports = APIKeyService;