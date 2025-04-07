const checkSession = (req, res, next) => {
    if (!req.session.isAuthenticated) {
        return res.status(401).json({ message: 'Unauthorized: Please log in' });
    }
    next();
};

module.exports = checkSession;