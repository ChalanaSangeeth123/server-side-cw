const pool = require('../Database/SQLCon');
const { createResponse } = require('../Utilities/createResponse');

class BlogPostDAO {
    constructor() {}

    async create(userId, title, content, country, dateOfVisit, capital, currency, languages, flag) {
        try {
            const result = await new Promise((resolve, reject) => {
                pool.run(
                    'INSERT INTO blog_posts (user_id, title, content, country, date_of_visit, capital, currency, languages, flag) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [userId, title, content, country, dateOfVisit, capital, currency, languages, flag],
                    (err) => {
                        if (err) reject(err);
                        resolve();
                    }
                );
            });
            return createResponse(true, 'Post created');
        } catch (error) {
            return createResponse(false, null, error.message);
        }
    }

    async getAll(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        return new Promise((resolve, reject) => {
            pool.all(
                'SELECT bp.*, u.fn, u.sn FROM blog_posts bp JOIN users u ON bp.user_id = u.id ORDER BY bp.created_at DESC LIMIT ? OFFSET ?',
                [limit, offset],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(createResponse(true, rows));
                }
            );
        });
    }

    async getById(id) {
        return new Promise((resolve, reject) => {
            pool.get('SELECT * FROM blog_posts WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                resolve(createResponse(true, row));
            });
        });
    }

    async update(id, userId, title, content, country, dateOfVisit, capital, currency, languages, flag) {
        try {
            const result = await new Promise((resolve, reject) => {
                pool.run(
                    'UPDATE blog_posts SET title = ?, content = ?, country = ?, date_of_visit = ?, capital = ?, currency = ?, languages = ?, flag = ? WHERE id = ? AND user_id = ?',
                    [title, content, country, dateOfVisit, capital, currency, languages, flag, id, userId],
                    function (err) {
                        if (err) reject(err);
                        if (this.changes === 0) reject(new Error('Post not found or not authorized'));
                        resolve();
                    }
                );
            });
            return createResponse(true, 'Post updated');
        } catch (error) {
            return createResponse(false, null, error.message);
        }
    }

    async delete(id, userId) {
        return new Promise((resolve, reject) => {
            pool.run(
                'DELETE FROM blog_posts WHERE id = ? AND user_id = ?',
                [id, userId],
                function (err) {
                    if (err) reject(err);
                    if (this.changes === 0) reject(new Error('Post not found or not authorized'));
                    resolve(createResponse(true, 'Post deleted'));
                }
            );
        });
    }

    async search(query, type) {
        let sql = 'SELECT bp.*, u.fn, u.sn FROM blog_posts bp JOIN users u ON bp.user_id = u.id WHERE 1=1';
        const params = [];
        if (type === 'country') {
            sql += ' AND bp.country LIKE ?';
            params.push(`%${query}%`);
        } else if (type === 'username') {
            sql += ' AND u.fn LIKE ? OR u.sn LIKE ?';
            params.push(`%${query}%`, `%${query}%`);
        }
        return new Promise((resolve, reject) => {
            pool.all(sql + ' ORDER BY bp.created_at DESC', params, (err, rows) => {
                if (err) reject(err);
                resolve(createResponse(true, rows));
            });
        });
    }
}

module.exports = BlogPostDAO;