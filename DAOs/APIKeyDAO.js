const pool = require('../Database/SQLCon');

class APIKeyDAO {
    constructor() {}

    createResponse(success, data = null, error = null) {
        return {
            success,
            data,
            error: error?.message || error
        };
    }

    async create(userId, key) {
        try {
            const result = await pool.run(
                'INSERT INTO apikeys (key, user_id, name, is_active) VALUES (?, ?, ?, 1)',
                [key, userId, `Key for user ${userId}`]
            );
            return this.createResponse(true, { key, userId });
        } catch (error) {
            return this.createResponse(false, null, error);
        }
    }

    async getKey(key) {
        return new Promise((resolve) => {
            pool.get('SELECT * FROM apikeys WHERE key = ? AND is_active = 1', [key], (err, result) => {
                if (err) resolve(this.createResponse(false, null, err));
                if (!result) resolve(this.createResponse(false, null, 'Invalid or inactive key'));
                resolve(this.createResponse(true, result));
            });
        });
    }

    async getKeysByUser(userId) {
        return new Promise((resolve) => {
            pool.all('SELECT key, name, created_at, last_used, usage_count FROM apikeys WHERE user_id = ? AND is_active = 1', [userId], (err, rows) => {
                if (err) resolve(this.createResponse(false, null, err));
                resolve(this.createResponse(true, rows));
            });
        });
    }

    async updateKeyStatus(key, userId, isActive) {
        return new Promise((resolve) => {
            pool.run('UPDATE apikeys SET is_active = ? WHERE key = ? AND user_id = ?', [isActive, key, userId], (err) => {
                if (err) resolve(this.createResponse(false, null, err));
                resolve(this.createResponse(true, 'Key status updated'));
            });
        });
    }

    async updateUsage(key) {
        return new Promise((resolve) => {
            pool.run(
                'UPDATE apikeys SET usage_count = usage_count + 1, last_used = ? WHERE key = ?',
                [new Date().toISOString(), key],
                (err) => {
                    if (err) resolve(this.createResponse(false, null, err));
                    resolve(this.createResponse(true));
                }
            );
        });
    }
}

module.exports = APIKeyDAO;