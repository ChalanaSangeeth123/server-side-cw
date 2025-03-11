// src/middleware/validation.js
class ValidationMiddleware {
    static validateUser(req, res, next) {
        const { name, email, password } = req.body;
        const errors = [];

        if (!name || name.length < 2) {
            errors.push('Name must be at least 2 characters long');
        }

        if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            errors.push('Valid email address is required');
        }

        if (!password || password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        next();
    }
}

module.exports = ValidationMiddleware;