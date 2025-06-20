// models/userMemory.model.js
const mongoose = require('mongoose');

const TokenMetadataSchema = new mongoose.Schema({
    name: String,
    image: String,
    attributes: [{
        trait_type: String,
        value: mongoose.Schema.Types.Mixed
    }]
});

const UserMemorySchema = new mongoose.Schema({
    token_id: { type: Number, required: true, unique: true },
    owner_wallet: { type: String, required: true, index: true },
    tx_hash: { type: String, required: true },
    status: {
        type: String,
        enum: ['minted', 'redeemed', 'expired'],
        default: 'minted'
    },
    metadata: TokenMetadataSchema,
    redemption_count: { type: Number, default: 0 },
    max_redemptions: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('UserMemory', UserMemorySchema);