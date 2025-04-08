const CountryDAO = require('../DAOs/CountryDao');

class CountryService {
    constructor() {
        this.countrydao = new CountryDAO();
    }

    async getCountry(name) {
        return await this.countrydao.getCountry(name);
    }
}

module.exports = CountryService;