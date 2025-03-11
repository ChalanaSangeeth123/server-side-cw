const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class ApiKey {
    // Create a new API Key
    static async create(name) {
        const id = uuidv4();
        const key = uuidv4();

        try {
            await db.query(
                'INSERT INTO api_keys (id, key_value, name) VALUES (?, ?, ?)',
                [id, key, name]
            );
            return { id, key_value: key, name };
        } catch (error) {
            throw new Error('Error creating API key: ' + error.message);
        }
    }

    // Validate an API Key
    static async validate(key) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM api_keys WHERE key_value = ? AND is_active = 1',
                [key]
            );
            
            if (rows.length > 0) {
                await db.query('UPDATE api_keys SET last_used = CURRENT_TIMESTAMP WHERE key_value = ?', [key]);
                return rows[0];  // Return API Key record
            }
            return null;  // Key is not valid
        } catch (error) {
            throw new Error('Error validating API key: ' + error.message);
        }
    }
}

module.exports = ApiKey;
