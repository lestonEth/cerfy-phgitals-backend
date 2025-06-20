// This is a simulation - integrate with real M-Pesa API in production
exports.simulateMpesaPayment = (amount, phone) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                requestId: `MPESA-${Date.now()}`,
                amount,
                phone,
                message: 'Payment request sent to your phone'
            });
        }, 1);
    });
};
