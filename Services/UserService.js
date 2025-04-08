const UserDAO = require('../DAOs/UserDAO');
const { generateHash, verify } = require('../Utilities/bcryptUtil');
const { createResponse } = require('../Utilities/createResponse');

class UserService {
    constructor() {
        this.userdao = new UserDAO();
    }

    // Register new user
    async create(req) {
        try {
            const { email, password, fn, sn } = req.body;
            if (!email || !password || !fn || !sn) {
                return createResponse(false, null, 'All fields are required');
            }
            const existingUser = await this.userdao.getByEmail(email);
            if (existingUser.data) {
                return createResponse(false, null, 'Email already exists');
            }
            return await this.userdao.create(req);
        } catch (ex) {
            console.error(ex);
            return createResponse(false, null, ex);
        }
    }

    // Authenticate user and create session
    async authenticate(req) {
        try {
            const { email, password } = req.body;
            const result = await this.userdao.getByEmail(email);
            if (!result.data) {
                return createResponse(false, null, 'User not found');
            }
            const isMatch = await verify(password, result.data.password);
            if (!isMatch) {
                return createResponse(false, null, 'Invalid credentials');
            }
            req.session.user = {
                id: result.data.id,
                email: result.data.email,
                name: result.data.fn
            };
            req.session.isAuthenticated = true;
            return createResponse(true, 'Login successful');
        } catch (ex) {
            console.error(ex);
            return createResponse(false, null, ex);
        }
    }
}

module.exports = UserService;