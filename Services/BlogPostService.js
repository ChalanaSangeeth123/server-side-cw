const BlogPostDAO = require('../DAOs/BlogPostDAO');

class BlogPostService {
    constructor() {
        this.blogPostDAO = new BlogPostDAO();
    }

    async create(req) {
        const { title, content, country, dateOfVisit } = req.body;
        const userId = req.session.user.id;
        return await this.blogPostDAO.create(userId, title, content, country, dateOfVisit);
    }

    async getAll() {
        return await this.blogPostDAO.getAll();
    }

    async getById(id) {
        return await this.blogPostDAO.getById(id);
    }

    async update(req) {
        const { id, title, content, country, dateOfVisit } = req.body;
        const userId = req.session.user.id;
        return await this.blogPostDAO.update(id, userId, title, content, country, dateOfVisit);
    }

    async delete(req) {
        const { id } = req.body;
        const userId = req.session.user.id;
        return await this.blogPostDAO.delete(id, userId);
    }

    
}

module.exports = BlogPostService;