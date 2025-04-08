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

    async getAllUsers() {
        try {
            return new Promise((resolve, reject) => {
                pool.all('SELECT id, email, fn, sn FROM users', [], (err, rows) => {
                    if(err) {
                        reject(err)
                    }
                    resolve(createResponse(true, rows))
                })
            })
        } catch(ex) {
            console.error(ex)
            return this.createResponse(false, null, ex)
        }
    }

    async getUserById(id) {
        try {
            return new Promise((resolve, reject) => {
                pool.get('SELECT id, email, fn, sn FROM users WHERE id = ?', [id], (err, row) => {
                    if(err) {
                        reject(err)
                    }
                    if(!row) {
                        resolve(this.createResponse(false, null, 'User not found'))
                    } else {
                        resolve(this.createResponse(true, row))
                    }
                })
            })
        } catch(ex) {
            console.error(ex)
            return this.createResponse(false, null, ex)
        }
    }
}


module.exports = UserDAO;