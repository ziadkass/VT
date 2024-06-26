const jwt = require('jsonwebtoken');

function generateAuthToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

module.exports = { generateAuthToken };
