// redemption.model.js
const mongoose = require('mongoose');

const RedemptionSchema = new mongoose.Schema({
    token: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CoffeeToken',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    admin: {  // Add admin reference
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    redeemed_at: { type: Date, default: Date.now },
    location: String
});

module.exports = mongoose.model('Redemption', RedemptionSchema);