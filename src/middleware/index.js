// src/middleware/index.js
const AuthMiddleware = require('./auth');
const ValidationMiddleware = require('./validation');

module.exports = {
    AuthMiddleware,
    ValidationMiddleware
};