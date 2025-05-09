const LikesDAO = require('../DAOs/LikeDAO');
const { createResponse } = require('../Utilities/createResponse');

class LikesService {
    constructor() {
        this.likesDAO = new LikesDAO();
    }

    async like(req) {
        const userId = req.session.user.id;
        const { postId, type } = req.body;
        if (!postId || !type) {
            return createResponse(false, null, 'Post ID and type are required');
        }
        return await this.likesDAO.like(userId, postId, type);
    }

    async getLikes(req) {
        const { postId } = req.query;
        if (!postId) {
            return createResponse(false, null, 'Post ID is required');
        }
        return await this.likesDAO.getLikes(postId);
    }
}

module.exports = LikesService;