const axios = require('axios');
const { createResponse } = require('../Utilities/createResponse');

class CountryDAO {
    constructor() {}

    // Fetch country data from restcountries.com
    async getCountry(name) {
        try {
            const response = await axios.get(`https://restcountries.com/v3.1/name/${name}`);
            const data = response.data[0];
            const countryData = {
                name: data.name.common,
                capital: data.capital?.[0] || 'N/A',
                currencies: Object.entries(data.currencies || {}).map(([code, info]) => ({
                    code,
                    name: info.name
                })),
                languages: Object.values(data.languages || {}),
                flag: data.flags.png
            };
            return createResponse(true, countryData);
        } catch (error) {
            return createResponse(false, null, 'Failed to fetch country data');
        }
    }
}

module.exports = CountryDAO;