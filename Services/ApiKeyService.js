
const {v4: uuidv4} = require('uuid')
const API = require('../DAOs/APIKeyDAO')

class APIKey{

    constructor(){
        this.apikeydao = new API()
    }
    async create(req)
    {
        const key = uuidv4()
        return await this.apikeydao.create(req.body.owner, key)
    }
    async validatekey(key){
        const result = await this.apikeydao.getKey(key)
        //console.log(result)
        return result
    }
}
module.exports = APIKey