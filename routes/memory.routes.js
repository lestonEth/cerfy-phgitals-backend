const express = require('express');
const {
    createMemory,
    returnUserTokenId,
    redeemMemory,
    getMemoryDetails,
    getUserMemories,
    getMemoryMinters,
    getCreatedMemories,
    uploadMemoryImage
} = require('../controllers/memory.controller');
const { authenticate } = require('../utils/middleware');

const router = express.Router();

/**
 * @swagger
 * /memory:
 *   post:
 *     summary: Create a memory
 *     tags: [Memory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               is_redeemable:
 *                 type: boolean
 *               max_mints:
 *                 type: integer
 *               image_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Memory created
 */
router.post(
    '/',
    authenticate,
    createMemory
);

/**
 * @swagger
 * /memory/tokenId:
 *   get:
 *     summary: Get user's token ID for memory
 *     tags: [Memory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token ID info
 */
router.get('/tokenId', authenticate, returnUserTokenId);

/**
 * @swagger
 * /memory/redeem:
 *   patch:
 *     summary: Redeem a memory
 *     tags: [Memory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               minter_wallet:
 *                 type: string
 *               token_id:
 *                 type: string
 *               contract_address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Memory redeemed
 */
router.patch('/redeem', authenticate, redeemMemory);

/**
 * @swagger
 * /memory/user:
 *   get:
 *     summary: Get all memories minted by current user
 *     tags: [Memory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user memories
 */
router.get('/user', authenticate, getUserMemories);

/**
 * @swagger
 * /memory/created:
 *   get:
 *     summary: Get all memories created by current user
 *     tags: [Memory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of created memories
 */
router.get('/created', authenticate, getCreatedMemories);

/**
 * @swagger
 * /memory/{id}:
 *   get:
 *     summary: Get memory details
 *     tags: [Memory]
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
 *         description: Memory details
 */
router.get('/:id', authenticate, getMemoryDetails);

/**
 * @swagger
 * /memory/{id}/minters:
 *   get:
 *     summary: Get all minters for a memory
 *     tags: [Memory]
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
 *         description: List of minters
 */
router.get('/:id/minters', authenticate, getMemoryMinters);

module.exports = router;