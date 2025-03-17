const UserDAO = require('../DAOs/UserDAO');
const { generateHash, verify } = require('../Utilities/bcryptUtil');

class UserService {
    constructor() {
        this.userdao = new UserDAO();
    }

    async create(req) {
        try {
            const { email, password, fn, sn } = req.body;
            if (!email || !password || !fn || !sn) {
                return this.userdao.createResponse(false, null, 'Missing required fields');
            }

            // Check if email exists
            const existingUser = await this.userdao.getByEmail({ body: { email } });
            if (existingUser.success && existingUser.data) {
                return this.userdao.createResponse(false, null, 'Email already registered');
            }

            req.body.password = await generateHash(password);
            const result = await this.userdao.create(req);
            return result;
        } catch (ex) {
            console.error(ex);
            if (ex.code === 'SQLITE_CONSTRAINT') {
                return this.userdao.createResponse(false, null, 'Email already registered');
            }
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
                req.session.user = {
                    id: result.data.id,
                    email: result.data.email,
                    name: result.data.fn
                };
                req.session.isAuthenticated = true;
                return this.userdao.createResponse(true, req.session.user);
            }
            return this.userdao.createResponse(false, null, 'Invalid password');
        } catch (ex) {
            console.error(ex);
            return this.userdao.createResponse(false, null, ex.message);
        }
    }
}

module.exports = UserService;