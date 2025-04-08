const pool = require('../Database/SQLCon');

class CountryDAO {
    constructor() {}

    createResponse(success, data = null, error = null) {
        return { success, data, error: error?.message || error };
    }

    async getAll() {
        return new Promise((resolve, reject) => {
            pool.all('SELECT * FROM countries', [], (err, rows) => {
                if (err) {
                    console.error('DB fetch error:', err.message);
                    reject(this.createResponse(false, null, err.message));
                } else if (rows.length === 0) {
                    console.log('No countries in database');
                    reject(this.createResponse(false, null, 'No countries found'));
                } else {
                    const formattedData = rows.map(row => ({
                        name: row.name,
                        currency: JSON.parse(row.currency || '{}'),
                        capital: row.capital,
                        languages: JSON.parse(row.languages || '[]'),
                        flag: row.flag
                    }));
                    resolve(this.createResponse(true, formattedData));
                }
            });
        });
    }

    async getByName(name) {
        return new Promise((resolve, reject) => {
            pool.get('SELECT * FROM countries WHERE name = ?', [name], (err, row) => {
                if (err) {
                    reject(this.createResponse(false, null, err.message));
                } else if (!row) {
                    reject(this.createResponse(false, null, 'Country not found'));
                } else {
                    const formattedData = {
                        name: row.name,
                        currency: JSON.parse(row.currency || '{}'),
                        capital: row.capital,
                        languages: JSON.parse(row.languages || '[]'),
                        flag: row.flag
                    };
                    resolve(this.createResponse(true, formattedData));
                }
            });
        });
    }

    async create(req) {
        return new Promise((resolve, reject) => {
            const { name, currency, capital, languages, flag } = req.body;
            if (!name || !currency || !capital || !languages || !flag) {
                reject(this.createResponse(false, null, 'Missing required country fields'));
                return;
            }
            pool.run(
                'INSERT INTO countries (name, currency, capital, languages, flag) VALUES (?, ?, ?, ?, ?)',
                [name, JSON.stringify(currency), capital, JSON.stringify(languages), flag],
                (err) => {
                    if (err) {
                        console.error('Insert error:', err.message);
                        reject(this.createResponse(false, null, err.message));
                    } else {
                        resolve(this.createResponse(true, "Country Inserted"));
                    }
                }
            );
        });
    }
}

module.exports = CountryDAO;