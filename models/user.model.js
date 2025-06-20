// user.model.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    wallet_address: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: v => /^0x[a-fA-F0-9]{40}$/.test(v),
            message: 'Invalid wallet address'
        }
    },
    created_at: { type: Date, default: Date.now },
    username: { type: String },
    coffee_tokens: { type: Number, default: 0 },
    coffee_redemptions: { type: Number, default: 0, max: 3 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' } // Add role field
});

module.exports = mongoose.model('User', UserSchema);