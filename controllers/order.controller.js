const orderService = require('../services/order.service');
const { simulateMpesaPayment } = require('../services/payment.service');

exports.createOrderFromCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const order = await orderService.createOrderFromCart(userId);

        // For free coffee orders, complete immediately
        const hasFreeCoffee = order.items.some(item =>
            item.product && item.product.type === 'free_coffee'
        );

        if (hasFreeCoffee) {
            const completedOrder = await orderService.completeOrder(order._id, 'FREE');
            return res.json(completedOrder);
        }

        // For paid orders, initiate payment
        res.json({
            order,
            payment: {
                status: 'pending',
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Keep this for backward compatibility if needed
exports.createOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const { items } = req.body;

        const order = await orderService.createOrder(userId, items);

        if (order.items.some(item => item.product.type === 'free_coffee')) {
            await orderService.completeOrder(order._id, 'FREE');
            return res.json(order);
        }

        const mpesaResponse = await simulateMpesaPayment(order.total, req.user.phone);
        res.json({
            order,
            payment: {
                status: 'pending',
                mpesa_request_id: mpesaResponse.requestId
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.completePayment = async (req, res) => {
    try {
        const { orderId, mpesaCode } = req.body;
        const order = await orderService.completeOrder(orderId, mpesaCode);
        res.json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};