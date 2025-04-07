const pool = require('../Database/SQLCon');
const axios = require('axios');

class CountryDAO {
    constructor() {}

    createResponse(success, data = null, error = null) {
        return {
            success,
            data,
            error: error?.message || error
        };
    }

    async getAll() {
        return new Promise((resolve) => {
            axios.get('https://restcountries.com/v3.1/all')
                .then(response => {
                    const filteredData = response.data.map(country => ({
                        name: country.name.common,
                        currency: country.currencies ? Object.values(country.currencies)[0] : null,
                        capital: country.capital?.[0] || 'N/A',
                        languages: country.languages ? Object.values(country.languages) : [],
                        flag: country.flags.png
                    }));
                    resolve(this.createResponse(true, filteredData));
                })
                .catch(err => {
                    resolve(this.createResponse(false, null, err.message));
                });
        });
    }


    // Optional: If you want to store countries locally, though not required for RestCountries
    async create(req) {
        return new Promise((resolve, reject) => {
            pool.run('INSERT INTO countries (name, currency, capital, languages, flag) VALUES (?, ?, ?, ?, ?)', 
                [...Object.values(req.body)], 
                (err) => {
                    if (err) {
                        reject(this.createResponse(false, null, err));
                    } else {
                        resolve(this.createResponse(true, "Country Inserted"));
                    }
                }
            );
        });
    }
}

module.exports = CountryDAO;