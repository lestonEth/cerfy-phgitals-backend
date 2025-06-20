const authService = require('../services/auth.service');

exports.login = async (req, res) => {
    try {
        const { address } = req.body;
        const result = await authService.login(address);
        res.json(result);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

exports.updatePhone = async (req, res) => {
    try {
        const user = await authService.updateUserPhone(req.user._id, req.body.phone);
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};