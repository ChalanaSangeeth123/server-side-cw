const CountryDao = require('../DAOs/CountryDAO');

class CountryService {
    constructor() {
        this.countrydao = new CountryDao();
    }

    async getCountry(name) {
        return await this.countrydao.getCountry(name);
    }
}

module.exports = CountryService;