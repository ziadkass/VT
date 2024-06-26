const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function authMiddleware(req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) {
        console.log('No token provided');
        return res.status(401).send('Access denied. No token provided.');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            console.log('User not found for token');
            return res.status(401).send('Invalid token.');
        }
        req.user = user;
        next();
    } catch (ex) {
        console.log('Invalid token:', ex.message);
        res.status(400).send('Invalid token.');
    }
}

async function adminMiddleware(req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) {
        console.log('No token provided');
        return res.status(401).send('Access denied. No token provided.');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            console.log('User not found for token');
            return res.status(401).send('Invalid token.');
        }

        if (user.role === 'admin') {
            req.user = user;
            next();
        } else {
            console.log('User is not an admin');
            res.status(403).send('Access denied. Admins only.');
        }
    } catch (err) {
        console.log('Invalid token:', err.message);
        res.status(400).send('Invalid token.');
    }
}

module.exports = { authMiddleware, adminMiddleware };
