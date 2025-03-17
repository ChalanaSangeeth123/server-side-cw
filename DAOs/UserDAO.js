const pool = require('../Database/SQLCon')
const {createResponse} = require('../Utilities/createResponse')

class UserDAO{

    
    constructor(){

    }
    createResponse(success, data = null, error = null) {
        return {
            success,
            data,
            error: error?.message || error
        };
    }
    async create(req){
       return new Promise((resolve, reject) =>{
         pool.run('insert into users (email, password, fn, sn) values (?,?,?,?)', [...Object.values(req.body)], (err, rows) =>{
            if(err)
            {
                reject(err)
            }
            resolve(createResponse(true, 'Record Inserted'))
         })
       })
    }
    async getByEmail(req){
       try{
            return new Promise((resolve, reject) =>{
                pool.get('select * from users where email = (?)', [req.body.email], (err, rows)=>{
                    if(err){
                        reject(err)
                    }
                    resolve(createResponse(true, rows))
                })
            })
       }catch(ex)
       {
            console.error(ex)
       }
    }
}

module.exports = UserDAO;