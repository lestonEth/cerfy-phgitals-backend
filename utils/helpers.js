const crypto = require('crypto');

exports.generateTokenId = () => {
    return `MOCHA-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
};

exports.validatePhone = (phone) => {
    // Kenyan phone validation
    const regex = /^(\+254|0)?[17]\d{8}$/;
    return regex.test(phone.replace(/\s+/g, ''));
};