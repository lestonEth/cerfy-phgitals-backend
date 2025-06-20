const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { JWT_CONFIG } = require('../config/auth');

class AuthService {
    async login(address) {
        let user = await User.findOne({ wallet_address: address });

        if (!user) {
            user = await User.create({ wallet_address: address });
        }

        const token = jwt.sign({ sub: address }, JWT_CONFIG.secret, {
            expiresIn: JWT_CONFIG.expiresIn
        });

        return {
            token,
            user: {
                wallet_address: user.wallet_address,
                created_at: user.created_at,
                free_coffee_claims: user.free_coffee_claims
            }
        };
    }

    async updateUserPhone(userId, phone) {
        return User.findByIdAndUpdate(
            userId,
            { phone },
            { new: true }
        );
    }
}

module.exports = new AuthService();