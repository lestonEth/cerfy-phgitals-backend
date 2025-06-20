const twilio = require('twilio');
const logger = require('../utils/logger');

class WhatsAppService {
    constructor() {
        this.client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
        this.senderNumber = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;
    }

    /**
     * Send QR code to user via WhatsApp
     * @param {string} phoneNumber - Recipient's phone number (with country code)
     * @param {string} memoryTitle - Title of the memory
     * @param {string} qrImageUrl - URL of the QR code image
     * @returns {Promise<boolean>} - Whether the message was sent successfully
     */
    async sendQRCode(phoneNumber, memoryTitle, qrImageUrl) {
        try {
            logger.debug(`Attempting to send QR code to ${phoneNumber} for memory: ${memoryTitle}`);

            const formattedNumber = this.formatPhoneNumber(phoneNumber);
            logger.verbose(`Formatted phone number: ${formattedNumber}`);

            const message = await this.client.messages.create({
                body: `Here's your QR code for "${memoryTitle}" memory!`,
                from: this.senderNumber,
                to: formattedNumber,
                mediaUrl: [qrImageUrl]
            });

            logger.info(`WhatsApp message sent successfully to ${formattedNumber}, message SID: ${message.sid}`);
            return true;
        } catch (error) {
            logger.error(`Failed to send WhatsApp message to ${phoneNumber}:`, {
                error: error.message,
                stack: error.stack,
                memoryTitle,
                qrImageUrl
            });
            return false;
        }
    }

    /**
     * Format phone number for WhatsApp
     * @param {string} phoneNumber 
     * @returns {string}
     */
    formatPhoneNumber(phoneNumber) {
        // Remove any existing 'whatsapp:' prefix and whitespace
        const cleaned = phoneNumber.replace(/^whatsapp:|\s+/g, '');

        // Add the whatsapp: prefix if not present
        return cleaned.startsWith('+') ? `whatsapp:${cleaned}` : `whatsapp:+${cleaned}`;
    }
}

module.exports = new WhatsAppService();