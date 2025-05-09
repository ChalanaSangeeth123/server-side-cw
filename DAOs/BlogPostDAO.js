const pool = require('../Database/SQLCon');
const { createResponse } = require('../Utilities/createResponse');

class BlogPostDAO {
    constructor() {}

    async create(userId, title, content, country, dateOfVisit) {
        try {
            const result = await new Promise((resolve, reject) => {
                pool.run(
                    'INSERT INTO blog_posts (user_id, title, content, country, date_of_visit) VALUES (?, ?, ?, ?, ?)',
                    [userId, title, content, country, dateOfVisit],
                    (err) => {
                        if (err) reject(err);
                        resolve();
                    }
                );
            });
            return createResponse(true, 'Post created');
        } catch (error) {
            return createResponse(false, null, error);
        }
    }

    async getAll() {
        return new Promise((resolve, reject) => {
            pool.all('SELECT * FROM blog_posts ORDER BY created_at DESC', [], (err, rows) => {
                if (err) reject(err);
                resolve(createResponse(true, rows));
            });
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

    async update(id, userId, title, content, country, dateOfVisit) {
        try {
            const result = await new Promise((resolve, reject) => {
                pool.run(
                    'UPDATE blog_posts SET title = ?, content = ?, country = ?, date_of_visit = ? WHERE id = ? AND user_id = ?',
                    [title, content, country, dateOfVisit, id, userId],
                    function (err) {
                        if (err) reject(err);
                        if (this.changes === 0) reject(new Error('Post not found or not authorized'));
                        resolve();
                    }
                );
            });
            return createResponse(true, 'Post updated');
        } catch (error) {
            return createResponse(false, null, error);
        }
    }

    async delete(id, userId) {
        return new Promise((resolve, reject) => {
            pool.run(
                'DELETE FROM blog_posts WHERE id = ? AND user_id = ?',
                [id, userId],
                (err) => {
                    if (err) reject(err);
                    resolve(createResponse(true, 'Post deleted'));
                }
            );
        });
    }

    async search(query, type) {
        let sql = 'SELECT * FROM blog_posts WHERE 1=1';
        const params = [];
        if (type === 'country') {
            sql += ' AND country LIKE ?';
            params.push(`%${query}%`);
        } else if (type === 'username') {
            sql += ' AND user_id IN (SELECT id FROM users WHERE fn LIKE ?)';
            params.push(`%${query}%`);
        }
        return new Promise((resolve, reject) => {
            pool.all(sql + ' ORDER BY created_at DESC', params, (err, rows) => {
                if (err) reject(err);
                resolve(createResponse(true, rows));
            });
        });
    }
}

module.exports = BlogPostDAO;