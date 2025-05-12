const pool = require('../Database/SQLCon');
const { createResponse } = require('../Utilities/createResponse');

class LikesDAO {
    constructor() {}

    async like(userId, postId, type) {
        try {
            if (type !== 'like' && type !== 'dislike') {
                throw new Error('Type must be "like" or "dislike"');
            }

            // Verify blog_post_id exists
            const postExists = await new Promise((resolve, reject) => {
                pool.get(
                    'SELECT id FROM blog_posts WHERE id = ?',
                    [postId],
                    (err, row) => {
                        if (err) reject(err);
                        resolve(!!row);
                    }
                );
            });
            if (!postExists) {
                throw new Error('Post does not exist');
            }

            // Check existing vote
            const existingVote = await new Promise((resolve, reject) => {
                pool.get(
                    'SELECT type FROM likes WHERE user_id = ? AND blog_post_id = ?',
                    [userId, postId],
                    (err, row) => {
                        if (err) reject(err);
                        resolve(row);
                    }
                );
            });

            if (existingVote && existingVote.type === type) {
                // Same type, remove vote
                await new Promise((resolve, reject) => {
                    pool.run(
                        'DELETE FROM likes WHERE user_id = ? AND blog_post_id = ?',
                        [userId, postId],
                        (err) => {
                            if (err) reject(err);
                            resolve();
                        }
                    );
                });
                return createResponse(true, 'Vote removed');
            }

            // Insert or replace vote
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
            return createResponse(true, 'Vote recorded');
        } catch (error) {
            return createResponse(false, null, error.message);
        }
    }

    async getLikes(postId) {
        try {
            const rows = await new Promise((resolve, reject) => {
                pool.all(
                    'SELECT type, COUNT(*) as count FROM likes WHERE blog_post_id = ? GROUP BY type',
                    [postId],
                    (err, rows) => {
                        if (err) reject(err);
                        resolve(rows);
                    }
                );
            });
            const likes = rows.find(r => r.type === 'like')?.count || 0;
            const dislikes = rows.find(r => r.type === 'dislike')?.count || 0;
            return createResponse(true, { likes, dislikes });
        } catch (error) {
            return createResponse(false, null, error.message);
        }
    }
}

module.exports = LikesDAO;