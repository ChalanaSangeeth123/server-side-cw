const CountryDAO = require('../DAOs/CountryDAO');
const axios = require('axios');

class CountryService {
    constructor() {
        
    }

    async fetchFromRestCountries() {
        try {
            console.log('Fetching from RestCountries API...');
            const response = await axios.get('https://restcountries.com/v3.1/all');
            console.log('API response received, processing...');
            const filteredData = response.data.map(country => ({
                name: country.name.common,
                currency: country.currencies ? Object.values(country.currencies)[0] : null,
                capital: country.capital ? country.capital[0] : null,
                languages: country.languages ? Object.values(country.languages) : [],
                flag: country.flags.png
            }));
            console.log('Filtered', filteredData.length, 'countries');
            return filteredData;
        } catch (error) {
            console.error('RestCountries fetch failed:', error.message);
            throw new Error('Failed to fetch from RestCountries: ' + error.message);
        }
    }

    async getAll() {
        try {
            console.log('Getting all countries directly from API...');
            const countries = await this.fetchFromRestCountries();
            return countries;
        } catch (ex) {
            console.error('getAll error:', ex.message);
            throw ex;
        }
    }

   /*ync getByName(name) {
        try {
            const localCountry = await this.countryDAO.getByName(name);
            if (localCountry.error === 'Country not found') {
                const remoteData = await this.fetchFromRestCountries();
                const country = remoteData.find(c => c.name.toLowerCase() === name.toLowerCase());
                if (country) {
                    // Optionally store in DB (uncomment if required)
                    // await this.countryDAO.create({ body: country });
                    return country;
                }
                throw new Error('Country not found');
            }
            return localCountry.data;
        } catch (ex) {
            throw ex;
        }
    }

    async create(req) {
        try {
            const result = await this.countryDAO.create(req);
            return result;
        } catch (ex) {
            throw ex;
        }
    }*/
}

module.exports = CountryService;