const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

class CartService {
    async getCart(userId) {
        return Cart.findOne({ user: userId }).populate('items.product');
    }

    async addToCart(userId, productId, quantity = 1) {
        const product = await Product.findById(productId);
        if (!product) throw new Error('Product not found');

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({
                user: userId,
                items: [{ product: productId, quantity }]
            });
        } else {
            const existingItemIndex = cart.items.findIndex(
                item => item.product.toString() === productId
            );

            if (existingItemIndex > -1) {
                cart.items[existingItemIndex].quantity += quantity;
            } else {
                cart.items.push({ product: productId, quantity });
            }
        }

        cart.updated_at = new Date();
        await cart.save();
        return cart.populate('items.product');
    }

    async updateCartItem(userId, productId, quantity) {
        if (quantity < 1) {
            return this.removeFromCart(userId, productId);
        }

        const cart = await Cart.findOne({ user: userId });
        if (!cart) throw new Error('Cart not found');

        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
            cart.updated_at = new Date();
            await cart.save();
            return cart.populate('items.product');
        }

        throw new Error('Item not found in cart');
    }

    async removeFromCart(userId, productId) {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) throw new Error('Cart not found');

        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );

        cart.updated_at = new Date();
        await cart.save();
        return cart.populate('items.product');
    }

    async clearCart(userId) {
        const cart = await Cart.findOneAndUpdate(
            { user: userId },
            { items: [], updated_at: new Date() },
            { new: true }
        ).populate('items.product');

        return cart || { user: userId, items: [], updated_at: new Date() };
    }
}

module.exports = new CartService();