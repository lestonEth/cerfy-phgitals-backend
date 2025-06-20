const QRCode = require('qrcode');
const CoffeeToken = require('../models/coffeeToken.model');
const Redemption = require('../models/redemption.model');
const User = require('../models/user.model');

class TokenService {
    async getUserTokens(userId) {
        return CoffeeToken.find({ user: userId });
    }

    async redeemToken(tokenId, userId, adminId) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        // Check redemption limit
        if (user.coffee_redemptions >= 3) {
            throw new Error('Maximum redemptions reached (3/3) for this user');
        }

        const token = await CoffeeToken.findOne({
            token_id: tokenId,
            user: userId
        });

        if (!token) throw new Error('Token not found for this user');
        if (token.status !== 'issued') throw new Error('Token already redeemed or expired');

        if (user.coffee_redemptions <= 3) {
            user.coffee_redemptions += 1;
            await user.save();
            return { status: 'success', message: 'Token redeemed successfully', token: token, user: user };
        }

        token.status = 'redeemed';
        token.redeemed_at = new Date();
        token.redeemed_by = adminId; // Track who redeemed it
        await token.save();

        return token;
    }

    async mintToken(userId) {
        // Check if user exists
        console.log('userId', userId);
        const user = await User.findById(userId);
        console.log('user', user);
        if (!user) throw new Error('User not found');

        if (user.coffee_tokens >= 1) {
            throw new Error('Maximum tokens reached (1/1) for this user');
        }

        // Generate unique token ID
        const tokenId = `coffee-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        console.log('tokenId', tokenId);

        // Create token
        const token = new CoffeeToken({
            user: userId,
            token_id: tokenId,
            status: 'issued'
        });
        console.log('token', token);
        await token.save();

        // Update user's token count
        user.coffee_tokens += 1;
        await user.save();
        console.log('user', user);
        return token;
    }

    async generateQRCode(tokenId, userId) {
        const data = JSON.stringify({ tokenId, userId });

        try {
            // Generate QR code as a data URL (base64)
            const qrCodeDataURL = await QRCode.toDataURL(data, {
                width: 200,
                margin: 2
            });

            return qrCodeDataURL;
        } catch (err) {
            console.error('QR Code generation failed:', err);
            throw new Error('Failed to generate QR code');
        }
    }
}

module.exports = new TokenService();