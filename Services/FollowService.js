const FollowDAO = require('../DAOs/FollowsDAO');
const { createResponse } = require('../Utilities/createResponse');

class FollowService {
    constructor() {
        this.followDAO = new FollowDAO();
    }

    async follow(req) {
        const followerId = req.session.user.id;
        const { followingId } = req.body;
        if (!followingId) {
            return createResponse(false, null, 'Following ID is required');
        }
        return await this.followDAO.follow(followerId, followingId);
    }

    async unfollow(req) {
        const followerId = req.session.user.id;
        const { followingId } = req.body;
        if (!followingId) {
            return createResponse(false, null, 'Following ID is required');
        }
        return await this.followDAO.unfollow(followerId, followingId);
    }

    async getFeed(req) {
        const userId = req.session.user.id;
        return await this.followDAO.getFeed(userId);
    }

    async getFollowers(req) {
        const userId = req.session.user.id;
        return await this.followDAO.getFollowers(userId);
    }

    async getFollowing(req) {
        const userId = req.session.user.id;
        return await this.followDAO.getFollowing(userId);
    }
}

module.exports = FollowService;