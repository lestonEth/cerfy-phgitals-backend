require('dotenv').config();

module.exports = {
    JWT_CONFIG: {
        secret: process.env.JWT_SECRET,
        expiresIn: '7d'
    }
};