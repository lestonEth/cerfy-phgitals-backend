const Order = require('../models/order.model');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const CoffeeToken = require('../models/coffeeToken.model');
const Cart = require('../models/cart.model');
const { generateTokenId } = require('../utils/helpers');

class OrderService {
    async createOrderFromCart(userId) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart || cart.items.length === 0) throw new Error('Cart is empty');

        let total = 0;
        const orderItems = [];

        for (const item of cart.items) {
            const product = item.product;

            // Check free coffee claim limit
            if (product.type === 'free_coffee') {
                if (user.free_coffee_claims + item.quantity > 3) {
                    throw new Error('Exceeded maximum free coffee claims');
                }
            }

            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                price: product.price
            });

            total += product.price * item.quantity;
        }

        const order = new Order({
            user: userId,
            items: orderItems,
            total,
            status: 'pending'
        });

        await order.save();

        // Create coffee tokens for free claims
        if (orderItems.some(item => item.product.type === 'free_coffee')) {
            await this.generateCoffeeTokens(userId, order);
        }

        // Clear the cart after order creation
        await Cart.findOneAndUpdate(
            { user: userId },
            { items: [], updated_at: new Date() }
        );

        return order;
    }

    async generateCoffeeTokens(userId, order) {
        const user = await User.findById(userId);
        const freeCoffeeItems = order.items.filter(item => item.product.type === 'free_coffee');

        if (!freeCoffeeItems.length) return;

        const tokens = [];
        let totalClaims = 0;

        for (const item of freeCoffeeItems) {
            totalClaims += item.quantity;
            for (let i = 0; i < item.quantity; i++) {
                tokens.push({
                    user: userId,
                    token_id: generateTokenId(),
                    status: 'issued'
                });
            }
        }

        await CoffeeToken.insertMany(tokens);

        // Update user's claim count
        user.free_coffee_claims += totalClaims;
        await user.save();
    }

    async completeOrder(orderId, mpesaCode) {
        const order = await Order.findByIdAndUpdate(
            orderId,
            { status: 'completed', mpesa_code: mpesaCode },
            { new: true }
        ).populate('items.product');

        return order;
    }

    // Keep this for backward compatibility if needed
    async createOrder(userId, items) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        let total = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) throw new Error(`Product not found: ${item.productId}`);

            if (product.type === 'free_coffee') {
                if (user.free_coffee_claims + item.quantity > 3) {
                    throw new Error('Exceeded maximum free coffee claims');
                }
            }

            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                price: product.price
            });

            total += product.price * item.quantity;
        }

        const order = new Order({
            user: userId,
            items: orderItems,
            total,
            status: 'pending'
        });

        await order.save();

        if (orderItems.some(item => item.product.type === 'free_coffee')) {
            await this.generateCoffeeTokens(userId, order);
        }

        return order;
    }
}

module.exports = new OrderService();