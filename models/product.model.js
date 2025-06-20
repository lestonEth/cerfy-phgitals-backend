const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['coffee_bag', 'coffee_cup', 'free_coffee']
    },
    description: String,
    price: Number,
    originalPrice: Number,
    image: String,
    features: [String],
    max_claims: { type: Number, default: null } // Only for free coffee
});

module.exports = mongoose.model('Product', ProductSchema);