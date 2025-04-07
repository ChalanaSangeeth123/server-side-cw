const pool = require('../Database/SQLCon');
const { createResponse } = require('../Utilities/createResponse');

class UserDAO {
    constructor() {}

    async create(req) {
        return new Promise((resolve, reject) => {
            pool.run(
                'INSERT INTO users (email, password, fn, sn) VALUES (?, ?, ?, ?)',
                [req.body.email, req.body.password, req.body.fn, req.body.sn],
                (err) => {
                    if (err) reject(err);
                    resolve(createResponse(true, 'User registered'));
                }
            );
        });
    }

    async getByEmail(req) {
        return new Promise((resolve) => {
            pool.get('SELECT * FROM users WHERE email = ?', [req.body.email], (err, row) => {
                if (err) resolve(createResponse(false, null, err));
                resolve(createResponse(true, row || null));
            });
        });
    }

    async getAllUsers() {
        return new Promise((resolve) => {
            pool.all('SELECT id, email, fn, sn FROM users', [], (err, rows) => {
                if (err) resolve(createResponse(false, null, err));
                resolve(createResponse(true, rows));
            });
        });
    }

    async getUserById(id) {
        return new Promise((resolve) => {
            pool.get('SELECT id, email, fn, sn FROM users WHERE id = ?', [id], (err, row) => {
                if (err) resolve(createResponse(false, null, err));
                if (!row) resolve(createResponse(false, null, 'User not found'));
                resolve(createResponse(true, row));
            });
        });
    }
}

module.exports = UserDAO;