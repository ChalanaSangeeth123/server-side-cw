const pool = require('../Database/SQLCon');
const { createResponse } = require('../Utilities/createResponse');

class APIKeyDAO {
    constructor() {}

    // Create new API key
    async create(id, key) {
        try {
            const result = await new Promise((resolve, reject) => {
                pool.run(
                    'INSERT INTO apikeys (owner, key) VALUES (?, ?)',
                    [id, key],
                    (err) => {
                        if (err) reject(err);
                        resolve();
                    }
                );
            });
            return createResponse(true, key);
        } catch (error) {
            return createResponse(false, null, error);
        }
    }

    // Validate API key and check if active
    async getKey(key) {
        return new Promise((resolve) => {
            pool.get(
                'SELECT * FROM apikeys WHERE key = ? AND is_active = 1',
                [key],
                (err, result) => {
                    if (err) {
                        resolve(createResponse(false, null, err));
                    } else if (!result) {
                        resolve(createResponse(false, null, 'Invalid or inactive key'));
                    } else {
                        resolve(createResponse(true, result));
                    }
                }
            );
        });
    }

    // Increment usage count for tracking
    async incrementUsage(key) {
        return new Promise((resolve, reject) => {
            pool.run(
                'UPDATE apikeys SET usage_count = usage_count + 1 WHERE key = ?',
                [key],
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });
    }
}

module.exports = APIKeyDAO;