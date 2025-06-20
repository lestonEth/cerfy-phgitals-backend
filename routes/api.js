const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Controllers
const productController = require('../controllers/product.controller');
const orderController = require('../controllers/order.controller');
const tokenController = require('../controllers/token.controller');
const authController = require('../controllers/auth.controller');
const cartController = require('../controllers/cart.controller');
const statsController = require('../controllers/stats.controller');

// Public routes
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Wallet login (verify signature)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *                 example: "0x123..."
 *     responses:
 *       200:
 *         description: JWT token and user info
 *       401:
 *         description: Invalid login
 */
router.post('/auth/login', authController.login);
/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 */
router.get('/products', productController.getProducts);
/**
 * @swagger
 * /tokens/{tokenId}/redeem:
 *   post:
 *     summary: Redeem a token
 *     tags: [Tokens]
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *     responses:
 *       200:
 *         description: Token redeemed
 *       400:
 *         description: Error
 */
router.post('/tokens/:tokenId/redeem', tokenController.redeemToken);


// Protected routes
router.use(authenticate);

// Add these to your protected routes
/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get current user info
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User info
 */
router.get('/user', tokenController.getUser);

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get user cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart info
 */
router.get('/cart', cartController.getCart);
/**
 * @swagger
 * /cart/add:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Updated cart
 */
router.post('/cart/add', cartController.addToCart);
/**
 * @swagger
 * /cart/update:
 *   put:
 *     summary: Update cart item
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Updated cart
 */
router.put('/cart/update', cartController.updateCartItem);
/**
 * @swagger
 * /cart/remove:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated cart
 */
router.delete('/cart/remove', cartController.removeFromCart);
/**
 * @swagger
 * /cart/checkout:
 *   post:
 *     summary: Checkout cart and create order
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order created
 */
router.post('/cart/checkout', orderController.createOrderFromCart);


/**
 * @swagger
 * /users/phone:
 *   put:
 *     summary: Update user phone
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated user
 */
router.put('/users/phone', authController.updatePhone);
/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Order created
 */
router.post('/orders', orderController.createOrder);
/**
 * @swagger
 * /orders/complete:
 *   post:
 *     summary: Complete payment for order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *               mpesaCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment completed
 */
router.post('/orders/complete', orderController.completePayment);

/**
 * @swagger
 * /tokens/mint:
 *   post:
 *     summary: Mint a new token
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token minted
 */
router.post('/tokens/mint', tokenController.mintToken);
/**
 * @swagger
 * /tokens:
 *   get:
 *     summary: Get user tokens
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tokens
 */
router.get('/tokens', tokenController.getUserTokens);
/**
 * @swagger
 * /tokens/{tokenId}/qrcode:
 *   get:
 *     summary: Generate QR code for token
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: QR code generated
 */
router.get('/tokens/:tokenId/qrcode', tokenController.generateQRCode);

// Admin routes
/**
 * @swagger
 * /products/seed:
 *   post:
 *     summary: Seed products (admin)
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Products seeded
 */
router.post('/products/seed', productController.seedProducts);

/**
 * @swagger
 * /stats/overview:
 *   get:
 *     summary: Get dashboard stats overview
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats overview
 */
router.get('/stats/overview', statsController.fetchStats);

/**
 * @swagger
 * /stats/sales:
 *   get:
 *     summary: Get monthly sales data
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly sales data
 */
router.get('/stats/sales', statsController.fetchSalesData);

/**
 * @swagger
 * /stats/top-products:
 *   get:
 *     summary: Get top 5 products by sales
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top products
 */
router.get('/stats/top-products', statsController.fetchTopProducts);

/**
 * @swagger
 * /stats/blockchain:
 *   get:
 *     summary: Get blockchain stats
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Blockchain stats
 */
router.get('/stats/blockchain', statsController.fetchBlockChainStats);

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: Premium Coffee Bags
 *         type:
 *           type: string
 *           example: coffee_bag
 *         description:
 *           type: string
 *           example: Artisan roasted coffee beans from the finest plantations.
 *         price:
 *           type: number
 *           example: 24.99
 *         originalPrice:
 *           type: number
 *           example: 29.99
 *         image:
 *           type: string
 *           example: "☕"
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Single Origin", "Medium Roast", "250g Package"]
 *         max_claims:
 *           type: integer
 *           example: 3
 */

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created
 *       400:
 *         description: Invalid input
 */
router.post('/products', productController.createProduct);
/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product found
 *       404:
 *         description: Product not found
 */
router.get('/products/:id', productController.getProductById);
/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Product not found
 */
router.put('/products/:id', productController.updateProduct);
/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted
 *       404:
 *         description: Product not found
 */
router.delete('/products/:id', productController.deleteProduct);

module.exports = router;