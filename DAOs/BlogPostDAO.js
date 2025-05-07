const db = require('../SQLCon');

class BlogPostDAO {
    static async getAllPosts() {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM blog_posts', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static async createPost(userId, title, content, country, dateOfVisit) {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO blog_posts (user_id, title, content, country, date_of_visit) VALUES (?, ?, ?, ?, ?)',
                [userId, title, content, country, dateOfVisit],
                function (err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, userId, title, content, country, dateOfVisit });
                }
            );
        });
    }

    static async getPostById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM blog_posts WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static async updatePost(postId, userId, title, content, country, dateOfVisit) {
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE blog_posts SET title = ?, content = ?, country = ?, date_of_visit = ? WHERE id = ? AND user_id = ?',
                [title, content, country, dateOfVisit, postId, userId],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                }
            );
        });
    }

    static async deletePost(postId, userId) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM blog_posts WHERE id = ? AND user_id = ?', [postId, userId], function (err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }
}

module.exports = BlogPostDAO;