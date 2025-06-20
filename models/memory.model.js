const mongoose = require('mongoose');

const MemorySchema = new mongoose.Schema({
    creator_wallet: {
        type: String,
        required: true,
        ref: 'User'
    },
    contract_address: {
        type: String,
        required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: false },
    qr_code: { type: String, required: false, unique: true },
    image_url: { type: String, required: false },
    is_redeemable: { type: Boolean, default: true },
    max_mints: { type: Number, default: 1 },
    current_mints: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['active', 'expired'],
        default: 'active'
    },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Memory', MemorySchema);