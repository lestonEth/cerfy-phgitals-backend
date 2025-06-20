const { ethers } = require('ethers');
const { CONTRACT_ADDRESS, CONTRACT_ABI } = require('../utils/contract');
const Memory = require('../models/memory.model');
const UserMemory = require('../models/userMemory.model');
const User = require('../models/user.model');

if (!CONTRACT_ADDRESS) {
    throw new Error("CONTRACT_ADDRESS environment variable is required");
}

// Initialize provider and signer
const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

const handleTokenMint = async (from, to, tokenId) => {
    try {
        console.log(`Token minted: ID ${tokenId} from ${from} to ${to}`);

        // Check if this token is already in our database
        const existingMint = await UserMemory.findOne({ token_id: tokenId.toString() });
        if (existingMint) {
            console.log(`Token ${tokenId} already exists in database`);
            return;
        }

        // Get token URI from contract
        const tokenURI = await contract.tokenURI(tokenId);

        // Find or create the user
        const user = await User.findOneAndUpdate(
            { wallet_address: to.toLowerCase() },
            { $setOnInsert: { wallet_address: to.toLowerCase(), created_at: new Date() } },
            { upsert: true, new: true }
        );

        // Find the Memory (contract) associated with this token
        // Note: You might need to adjust this based on how tokens relate to Memories
        const memory = await Memory.findOne({ contract_address: CONTRACT_ADDRESS });

        if (!memory) {
            throw new Error(`No Memory found for contract ${CONTRACT_ADDRESS}`);
        }

        // Create the user memory record
        const userMemory = await UserMemory.create({
            memory_id: memory._id,
            user_id: user._id,
            owner_wallet: to.toLowerCase(),
            token_id: tokenId.toString(),
            tx_hash: `minted-from-event-${tokenId}`,
            status: 'minted',
            token_uri: tokenURI
        });

        // Update mint count in Memory
        await Memory.updateOne(
            { _id: memory._id },
            { $inc: { current_mints: 1 } }
        );

        console.log(`Successfully recorded mint of token ${tokenId} for user ${to}`);
    } catch (err) {
        console.error('Error handling token mint:', err);
    }
};

const initializeEventListeners = () => {
    try {
        // Listen for Transfer events (mints when from is zero address)
        contract.on('Transfer', (from, to, tokenId, event) => {
            console.log('Transfer event:', { from, to, tokenId });
            if (from === ethers.ZeroAddress) {
                console.log('New token mint detected:', tokenId.toString());
                handleTokenMint(from, to, tokenId);
            }
        });

        console.log('Blockchain event listeners initialized');
    } catch (err) {
        console.error('Failed to initialize event listeners:', err);
    }
};

const resetMintCount = async () => {
    console.log('Resetting mint count');
    try {
        const tx = await contract.resetMintCount('0x51617C8A8d784602fbD34b265f773E6A98AE1Fb9');
        await tx.wait();
        console.log('Mint count reset successfully for wallet address: 0x51617C8A8d784602fbD34b265f773E6A98AE1Fb9');

    } catch (err) {
        console.error('Failed to reset mint count:', err);
    }
};

// Cleanup listeners on process exit
process.on('SIGINT', () => {
    contract.removeAllListeners();
    process.exit();
});

process.on('SIGTERM', () => {
    contract.removeAllListeners();
    process.exit();
});

module.exports = {
    initializeEventListeners,
    resetMintCount
};