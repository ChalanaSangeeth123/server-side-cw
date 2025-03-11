const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../database.sqlite'));


class ApiKey {
    // Create a new API Key
    static async create(name) {
        const id = uuidv4();
        const key = uuidv4();

        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO api_keys (id, key_value, name) VALUES (?, ?, ?)',
                [id, key, name],
                (err) => {
                    if (err) reject(err);
                    else resolve({ id, key, name });
                }
            );
        });
    }

    // Validate an API Key
    static async validate(key) {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM api_keys WHERE key_value = ? AND is_active = 1',
                [key],
                (err, row) => {
                    if (err) reject(err);
                    else {
                        if (row) {
                            db.run(
                                'UPDATE api_keys SET last_used = CURRENT_TIMESTAMP WHERE key_value = ?',
                                [key]
                            );
                        }
                        resolve(row);
                    }
                }
            );
        });
    }
}

module.exports = ApiKey;
