const BlogPostDAO = require('../DAOs/BlogPostDAO'); // Changed from '../DAO/BlogPostDAO'

module.exports = async (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    const post = await BlogPostDAO.getPostById(req.params.id);
    if (!post || post.user_id !== req.session.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    next();
};