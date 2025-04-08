const pool = require('../Database/SQLCon');
const { createResponse } = require('../Utilities/createResponse');
const { generateHash } = require('../Utilities/bcryptUtil');

class UserDAO {
    constructor() {}

    // Create new user with hashed password
    async create(req) {
        const { email, password, fn, sn } = req.body;
        const hashedPassword = await generateHash(password);
        return new Promise((resolve, reject) => {
            pool.run(
                'INSERT INTO users (email, password, fn, sn) VALUES (?, ?, ?, ?)',
                [email, hashedPassword, fn, sn],
                (err) => {
                    if (err) reject(err);
                    resolve(createResponse(true, 'User created'));
                }
            );
        });
    }

    // Get user by email
    async getByEmail(email) {
        return new Promise((resolve, reject) => {
            pool.get(
                'SELECT * FROM users WHERE email = ?',
                [email],
                (err, row) => {
                    if (err) reject(err);
                    resolve(createResponse(true, row));
                }
            );
        });
    }
}

module.exports = UserDAO;