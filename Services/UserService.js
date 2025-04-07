const UserDAO = require('../DAOs/UserDAO');
const { generateHash, verify } = require('../Utilities/bcryptUtil');
const { validate } = require('email-validator');

class UserService {
    constructor() {
        this.userdao = new UserDAO();
    }

    async create(req) {
        try {
            const { email, password, fn, sn } = req.body;
            if (!validate(email)) return this.userdao.createResponse(false, null, 'Invalid email format');
            if (password.length < 8) return this.userdao.createResponse(false, null, 'Password must be at least 8 characters');
            if (!fn || !sn) return this.userdao.createResponse(false, null, 'First and last names are required');

            const existingUser = await this.userdao.getByEmail({ body: { email } });
            if (existingUser.success && existingUser.data) {
                return this.userdao.createResponse(false, null, 'Email already registered');
            }

            req.body.password = await generateHash(password);
            return await this.userdao.create(req);
        } catch (ex) {
            return this.userdao.createResponse(false, null, ex.message);
        }
    }

    async authenticate(req) {
        try {
            const result = await this.userdao.getByEmail(req);
            if (!result.success || !result.data) {
                return this.userdao.createResponse(false, null, 'User not found');
            }
            const isMatch = await verify(req.body.password, result.data.password);
            if (isMatch) {
                req.session.user = { id: result.data.id, email: result.data.email, name: result.data.fn };
                req.session.isAuthenticated = true;
                return this.userdao.createResponse(true, { id: result.data.id, email: result.data.email });
            }
            return this.userdao.createResponse(false, null, 'Invalid password');
        } catch (ex) {
            return this.userdao.createResponse(false, null, ex.message);
        }
    }

    async getAllUsers() {
        return await this.userdao.getAllUsers();
    }

    async getUserById(id) {
        return await this.userdao.getUserById(id);
    }
}

module.exports = UserService;