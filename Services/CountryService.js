const CountryDAO = require('../DAOs/CountryDAO');

class CountryService {
    constructor() {
        this.countryDAO = new CountryDAO();
    }

    async getAll() {
        try {
            const results = await this.countryDAO.getAll();
            if (results.error === 'No Countries Found') {
                return results.error;
            }
            return results.data;
        } catch (ex) {
            console.error(ex);
            throw ex;
        }
    }

    async create(req) {
        try {
            const result = await this.countryDAO.create(req);
            return result;
        } catch (ex) {
            console.error(ex);
            throw ex;
        }
    }


async getByName(name) {
    const results = await this.countryDAO.getAll();
    if (!results.success) throw new Error(results.error);
    const country = results.data.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (!country) throw new Error('Country not found');
    return country;
}
}
module.exports = CountryService;