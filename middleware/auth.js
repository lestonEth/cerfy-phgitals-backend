const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { JWT_CONFIG } = require('../config/auth');

exports.authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log('authHeader', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Authentication required');
        return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_CONFIG.secret);
        const user = await User.findOne({ wallet_address: decoded.sub });
        console.log('user', user);

        if (!user) {
            console.log('User not found');
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log('error', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};