const pool = require('../Database/SQLCon')
 class APIKeyDAO{
    constructor(){

    }
    createResponse(success, data = null, error = null){
        return{
            success,
            data,
            error:error?.message | error
        }
    }
    async create(id, key)
    {
        try{
            const result = await pool.run('insert into apikeys (key, name ) values(?, ?)', [key, id]) 
            return this.createResponse(true, key)
        }catch(error){
            return this.createResponse(false, error)
        }
    }
    async getKey(key)
    {
        return new Promise((resolve, reject) =>{
            pool.get('select * from apikeys where key = ? and is_active = 1',[key], (err, result) =>{
                if(err){
                    resolve(this.createResponse(false, null, err.message))
                }
                if(!result){
                    resolve(this.createResponse(false, null,))
                }
                resolve(this.createResponse(true, result))
            })
        })
           
    }
 }
module.exports = APIKeyDAO