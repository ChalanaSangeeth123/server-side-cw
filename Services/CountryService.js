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
}

module.exports = CountryService;