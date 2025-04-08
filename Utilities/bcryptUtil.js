const bcrypt = require('bcrypt');

const saltRounds = 10;

// Generate password hash
const generateHash = async (string) => {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedpassword = await bcrypt.hash(string, salt);
    return hashedpassword;
};

// Verify password
const verify = async (formpassword, dbpassword) => {
    try {
        const isMatch = await bcrypt.compare(formpassword, dbpassword);
        return isMatch;
    } catch (ex) {
        console.error(ex);
        return false;
    }
};

module.exports = { generateHash, verify };