const createResponse = (success, data = null, error = null) => {
    return {
        success,
        data,
        error: error?.message || error
    };
};

module.exports = { createResponse };