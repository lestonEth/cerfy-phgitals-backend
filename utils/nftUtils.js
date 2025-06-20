// utils/nftUtils.js
exports.getRarityFromTokenId = (tokenId) => {
    // Simple deterministic rarity based on token ID
    const raritySeed = tokenId % 100;
    if (raritySeed < 2) return 'Legendary';
    if (raritySeed < 10) return 'Epic';
    if (raritySeed < 30) return 'Rare';
    return 'Common';
};

exports.generateTokenMetadata = (tokenId, qrCode) => {
    const rarity = exports.getRarityFromTokenId(tokenId);

    // Determine max redemptions based on rarity
    const maxRedemptions = {
        Legendary: 10,
        Epic: 5,
        Rare: 3,
        Common: 1
    }[rarity];

    return {
        name: `Coffee Token #${tokenId}`,
        description: `A premium coffee NFT with ${rarity} rarity`,
        image: `https://your-cdn.com/coffee-${rarity.toLowerCase()}.png`,
        qr_code: qrCode,
        attributes: [
            { trait_type: 'Rarity', value: rarity },
            { trait_type: 'MaxRedemptions', value: maxRedemptions }
        ]
    };
};