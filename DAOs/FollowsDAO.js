const pool = require('../Database/SQLCon');
const { createResponse } = require('../Utilities/createResponse');

class FollowDAO {
    constructor() {}

    // Follow a user
    async follow(followerId, followingId) {
        try {
            if (followerId === followingId) {
                throw new Error('Cannot follow yourself');
            }
            await new Promise((resolve, reject) => {
                pool.run(
                    'INSERT OR IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)',
                    [followerId, followingId],
                    (err) => {
                        if (err) reject(err);
                        resolve();
                    }
                );
            });
            return createResponse(true, 'Followed successfully');
        } catch (error) {
            return createResponse(false, null, error.message);
        }
    }

    // Unfollow a user
    async unfollow(followerId, followingId) {
        try {
            await new Promise((resolve, reject) => {
                pool.run(
                    'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
                    [followerId, followingId],
                    function (err) {
                        if (err) reject(err);
                        if (this.changes === 0) reject(new Error('Not following this user'));
                        resolve();
                    }
                );
            });
            return createResponse(true, 'Unfollowed successfully');
        } catch (error) {
            return createResponse(false, null, error.message);
        }
    }

    // Get feed (posts from followed users)
    async getFeed(userId) {
        return new Promise((resolve, reject) => {
            pool.all(
                'SELECT bp.*, u.fn AS username FROM blog_posts bp JOIN follows f ON bp.user_id = f.following_id JOIN users u ON bp.user_id = u.id WHERE f.follower_id = ? ORDER BY bp.created_at DESC',
                [userId],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(createResponse(true, rows));
                }
            );
        });
    }

    // Get list of followers
    async getFollowers(userId) {
        console.log('Fetching followers for user:', userId); // Debug log
        return new Promise((resolve, reject) => {
            pool.all(
                'SELECT u.id, u.fn FROM users u JOIN follows f ON u.id = f.follower_id WHERE f.following_id = ?',
                [userId],
                (err, rows) => {
                    if (err) {
                        console.error('Followers error:', err); // Debug log
                        reject(err);
                    }
                    console.log('Followers rows:', rows); // Debug log
                    resolve(createResponse(true, rows));
                }
            );
        });
    }

    // Get list of users being followed
    async getFollowing(userId) {
        return new Promise((resolve, reject) => {
            pool.all(
                'SELECT u.id, u.fn FROM users u JOIN follows f ON u.id = f.following_id WHERE f.follower_id = ?',
                [userId],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(createResponse(true, rows));
                }
            );
        });
    }
}

module.exports = FollowDAO;