const pool = require('../Database/SQLCon');
const { createResponse } = require('../Utilities/createResponse');

class LikesDAO {
    constructor() {}

    // Like or dislike a post
    async like(userId, postId, type) {
        try {
            if (type !== 'like' && type !== 'dislike') {
                throw new Error('Type must be "like" or "dislike"');
            }
            await new Promise((resolve, reject) => {
                pool.run(
                    'INSERT OR REPLACE INTO likes (user_id, blog_post_id, type) VALUES (?, ?, ?)',
                    [userId, postId, type],
                    (err) => {
                        if (err) reject(err);
                        resolve();
                    }
                );
            });
            return createResponse(true, 'Like updated');
        } catch (error) {
            return createResponse(false, null, error.message);
        }
    }

    // Get total likes and dislikes for a post
    async getLikes(postId) {
        return new Promise((resolve, reject) => {
            pool.all(
                'SELECT type, COUNT(*) as count FROM likes WHERE blog_post_id = ? GROUP BY type',
                [postId],
                (err, rows) => {
                    if (err) reject(err);
                    const likes = rows.find(r => r.type === 'like')?.count || 0;
                    const dislikes = rows.find(r => r.type === 'dislike')?.count || 0;
                    resolve(createResponse(true, { likes, dislikes }));
                }
            );
        });
    }
}

module.exports = LikesDAO;