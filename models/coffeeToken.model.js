const mongoose = require('mongoose');

const CoffeeTokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token_id: { type: String, required: true, unique: true },
    status: {
        type: String,
        enum: ['issued', 'redeemed', 'expired'],
        default: 'issued'
    },
    created_at: { type: Date, default: Date.now },
    redeemed_at: Date
});

module.exports = mongoose.model('CoffeeToken', CoffeeTokenSchema);