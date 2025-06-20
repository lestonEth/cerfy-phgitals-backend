const Memory = require('../models/memory.model');
const mongoose = require('mongoose');
const UserMemory = require('../models/userMemory.model');
const { generateQR } = require('../services/qr.service');
const upload = require('../utils/fileUpload');
const WhatsAppService = require('../services/whatsapp.service');
const fs = require('fs');
const { ethers } = require('ethers');
const { CONTRACT_ADDRESS, CONTRACT_ABI } = require('../utils/contract');

if (!CONTRACT_ADDRESS) {
    throw new Error("NEXT_PUBLIC_CONTRACT_ADDRESS environment variable is required");
}

// Initialize provider and signer
const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);


// Add this middleware to your routes
exports.uploadMemoryImage = upload.single('image');
exports.createMemory = async (req, res) => {
    const { title, description, is_redeemable, max_mints, image_url } = req.body;
    const creator_wallet = req.user.sub;


    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    try {
        // const qr_code = await generateQR(creator_wallet);

        const memory = await Memory.create({
            creator_wallet,
            title,
            description,
            image_url,
            is_redeemable: is_redeemable !== false,
            max_mints: max_mints || 1
        });

        // Then generate QR code with the memory ID
        const qr = await generateQR(memory._id.toString());

        // Update memory with QR code
        memory.qr_code = qr.content;
        memory.qr_image = qr.image;
        await memory.save();

        console.log("Memory created with image URL:", image_url);
        res.json(memory);
    } catch (err) {
        console.error('Create memory error:', err);

        // Clean up uploaded file if there was an error
        if (req.file) {
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting uploaded file:', unlinkErr);
            });
        }

        res.status(500).json({ error: 'Memory creation failed' });
    }
};

exports.returnUserTokenId = async (req, res) => {
    const wallet_address = req.user.sub.toLowerCase();
    try {
        console.log(wallet_address)
        const userMemory = await UserMemory.findOne({ owner_wallet: wallet_address });
        console.log(userMemory)
        if (!userMemory) {
            return res.status(404).json({ error: 'No token ID found' });
        }
        res.json({
            tokenId: userMemory.token_id,
            status: userMemory.status,
            tx_hash: userMemory.tx_hash,
            status: userMemory.status,
            redemption_count: userMemory.redemption_count,
            max_redemptions: userMemory.max_redemptions,
        });
    } catch (err) {
        console.error('Error fetching token ID:', err);
        res.status(500).json({ error: 'Failed to retrieve token ID' });
    }
};

exports.redeemMemory = async (req, res) => {
    const { minter_wallet, token_id, contract_address } = req.body; // Get memory_id from body
    const creator_wallet = req.user.sub;

    console.log('Creator:', creator_wallet);
    console.log('Minter:', minter_wallet);
    console.log('Token ID:', token_id);
    console.log('Contract Address:', contract_address);

    try {
        // 1. Verify memory belongs to creator
        const memory = await Memory.findOne({
            contract_address: contract_address,
            creator_wallet: creator_wallet
        });

        console.log(memory)


        if (!memory) {
            return res.status(404).json({
                error: 'Memory not found or not owned by you'
            });
        }

        // find mint record and check if it is already redeemed
        const mintRecord = await UserMemory.findOne({
            token_id: token_id,
            owner_wallet: minter_wallet.toLowerCase(),
            status: 'redeemed'
        });

        if (mintRecord && mintRecord.status === 'redeemed' && mintRecord.redemption_count >= memory.max_mints) {
            return res.status(400).json({
                error: 'Token already redeemed'
            });
        }

        // 2. Find and update mint record
        const updated = await UserMemory.updateOne(
            {
                token_id: token_id,
                owner_wallet: minter_wallet.toLowerCase(), // Ensure case match
                status: 'minted',
                $expr: { $lt: ["$redemption_count", "$max_redemptions"] } // Check redemption count
            },
            {
                $set: {
                    status: 'redeemed',
                    redeemed_at: new Date(),
                },
                $inc: { redemption_count: 1 } // Increment redemption count
            }
        )

        console.log("Updated:", updated)

        if (!updated) {
            return res.status(400).json({
                error: 'No mint record found or already redeemed',
                details: {
                    token_id: token_id,
                    minter_wallet: minter_wallet,
                    status: 'minted'
                }
            });
        }

        const io = req.app.get('socketio');
        if (!io) {
            console.error('Socket.io instance not available');
            // Still return success since the DB operation succeeded
            return res.json({
                success: true,
                token_id,
                status: 'redeemed',
                redemption_count: updated.redemption_count
            });
        }

        // 4. Emit redemption event
        io.to(minter_wallet.toLowerCase()).emit('token-redeemed', {
            tokenId: token_id,
            redemptionCount: updated.redemption_count,
            maxRedemptions: updated.max_redemptions,
            timestamp: new Date().toISOString()
        })

        res.json({
            success: true,
            token_id: token_id,
            status: 'redeemed',
            redemption_count: updated.redemption_count,
            max_redemptions: updated.max_redemptions
        });
    } catch (err) {
        console.error('Redeem error:', err);
        res.status(500).json({
            error: 'Redemption failed',
            details: err.message
        });
    }
};

// Get all memories minted by current user
exports.getUserMemories = async (req, res) => {
    const wallet_address = req.user.sub;

    try {
        const memories = await UserMemory.find({ owner_wallet: wallet_address })
            .populate('memory_id', 'title description image_url is_redeemable')
            .sort({ minted_at: -1 });

        res.json(memories.map(m => ({
            id: m.memory_id._id,
            title: m.memory_id.title,
            description: m.memory_id.description,
            image_url: m.memory_id.image_url,
            status: m.status,
            minted_at: m.minted_at,
            redeemed_at: m.redeemed_at
        })));
    } catch (err) {
        console.error('Get user memories error:', err);
        res.status(500).json({ error: 'Failed to fetch memories' });
    }
};

// Get all memories created by current user
exports.getCreatedMemories = async (req, res) => {
    const creator_wallet = req.user.sub;

    try {
        const memories = await Memory.find({ creator_wallet })
            .sort({ created_at: -1 });

        // Get mint counts for each memory
        const memoriesWithStats = await Promise.all(
            memories.map(async memory => {
                const stats = await UserMemory.aggregate([
                    { $match: { memory_id: memory._id } },
                    {
                        $group: {
                            _id: '$status',
                            count: { $sum: 1 }
                        }
                    }
                ]);

                return {
                    ...memory.toObject(),
                    stats: stats.reduce((acc, curr) => {
                        acc[curr._id] = curr.count;
                        return acc;
                    }, {})
                };
            })
        );

        res.json(memoriesWithStats);
    } catch (err) {
        console.error('Get created memories error:', err);
        res.status(500).json({ error: 'Failed to fetch created memories' });
    }
};

// Get memory details
exports.getMemoryDetails = async (req, res) => {
    const { id } = req.params;
    const wallet_address = req.user.sub;

    try {
        const memory = await Memory.findById(id);
        if (!memory) {
            return res.status(404).json({ error: 'Memory not found' });
        }

        // Check if user has minted this memory
        const userMemory = await UserMemory.findOne({
            memory_id: id,
            owner_wallet: wallet_address
        });

        res.json({
            ...memory.toObject(),
            user_status: userMemory ? userMemory.status : null
        });
    } catch (err) {
        console.error('Get memory error:', err);
        res.status(500).json({ error: 'Failed to fetch memory' });
    }
};

exports.getMemoryMinters = async (req, res) => {
    const { id } = req.params;
    const creator_wallet = req.user.sub;

    try {
        const memory = await Memory.findOne({
            _id: id,
            creator_wallet
        });

        if (!memory) {
            return res.status(404).json({ error: 'Memory not found' });
        }

        const minters = await UserMemory.find({ memory_id: id })
            .populate('owner_wallet', 'wallet_address -_id');

        res.json(minters);
    } catch (err) {
        console.error('Get minters error:', err);
        res.status(500).json({ error: 'Failed to fetch minters' });
    }
};

// // call the create memory function to create a default memory
async function createDefaultMemory() {
    if (await Memory.findOne({ contract_address: CONTRACT_ADDRESS })) {
        return;
    }
    const memory = await Memory.create({
        creator_wallet: '0x39Da87AC552B85Ee8d0bD9bF1a542897223012D1',
        title: 'Project Mocha',
        contract_address: CONTRACT_ADDRESS,
        description: 'Project Mocha is a project that is built on the Ethereum blockchain.',
        image_url: 'https://i.ibb.co/0r00000/mocha.png',
        is_redeemable: true,
        max_mints: Number(await contract.mintLimit()),
        qr_code: 'http://192.168.100.100:3000',
    });
    console.log(memory)
}

// Only call createDefaultMemory after the connection is established
// mongoose.connection.on('connected', () => {
//     createDefaultMemory().catch(console.error);
// });