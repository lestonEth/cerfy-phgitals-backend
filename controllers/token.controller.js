const tokenService = require('../services/token.service');
const User = require('../models/user.model');

exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUserTokens = async (req, res) => {
    try {
        const tokens = await tokenService.getUserTokens(req.user._id);
        res.json(tokens);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.mintToken = async (req, res) => {
    try {
        console.log('req.user', req.user);
        const token = await tokenService.mintToken(req.user._id);
        console.log('token', token);
        res.json(token);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


exports.redeemToken = async (req, res) => {
    console.log('req.user', req.user);
    try {
        console.log('req.params.tokenId', req.params.tokenId);
        console.log('req.body.data.userId', req.body.data.userId);
        console.log('req.body.adminId', req.body);
        const token = await tokenService.redeemToken(
            req.params.tokenId,
            req.body.data.userId,
        );
        res.json(token);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.generateQRCode = async (req, res) => {
    try {
        const qrCode = await tokenService.generateQRCode(req.params.tokenId, req.user._id);
        res.json({ qrCode });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};