const BlogPostDAO = require('../DAOs/BlogPostDAO');
const { createResponse } = require('../Utilities/createResponse');

class BlogPostService {
    constructor() {
        this.blogPostDAO = new BlogPostDAO();
    }

    async create(req) {
        const { title, content, country, dateOfVisit, capital, currency, languages, flag } = req.body;
        const userId = req.session.user.id;
        return await this.blogPostDAO.create(userId, title, content, country, dateOfVisit, capital, currency, languages, flag);
    }

    async getAll() {
        return await this.blogPostDAO.getAll();
    }

    async getById(id) {
        return await this.blogPostDAO.getById(id);
    }

    async update(req) {
        const { id, title, content, country, dateOfVisit, capital, currency, languages, flag } = req.body;
        const userId = req.session.user.id;
        return await this.blogPostDAO.update(id, userId, title, content, country, dateOfVisit, capital, currency, languages, flag);
    }

    async delete(req) {
        try {
            const { id } = req.body;
            const userId = req.session.user.id;
            return await this.blogPostDAO.delete(id, userId);
        } catch (error) {
            return createResponse(false, null, error.message);
        }
    }

    async search(q, type) {
        return await this.blogPostDAO.search(q, type);
    }
}

module.exports = BlogPostService;