const jwt = require('jsonwebtoken');

module.exports = (io) => {
    // Authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            const err = new Error('Authentication error');
            err.data = { code: 'NO_TOKEN' };
            return next(err);
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                err.data = { code: 'INVALID_TOKEN' };
                return next(err);
            }

            socket.user = {
                walletAddress: decoded.address?.toLowerCase(), // Normalize address
                userId: decoded.userId
            };
            next();
        });
    });

    io.on('connection', (socket) => {
        console.log(`New client connected: ${socket.id}`);

        // Error handler for this socket
        const handleError = (error) => {
            console.error(`Socket error (${socket.id}):`, error);
            socket.emit('error', {
                message: error.message,
                code: error.data?.code || 'SOCKET_ERROR'
            });
        };

        // Subscribe to wallet address room
        socket.on('subscribe', (walletAddress) => {
            try {
                if (!walletAddress) {
                    throw new Error('Wallet address required');
                }

                const normalizedAddress = walletAddress.toLowerCase();

                if (socket.user.walletAddress !== normalizedAddress) {
                    throw new Error('Unauthorized subscription attempt');
                }

                socket.join(normalizedAddress);
                socket.emit('subscribed', {
                    walletAddress: normalizedAddress,
                    timestamp: new Date().toISOString()
                });

                console.log(`Client ${socket.id} subscribed to ${normalizedAddress}`);

            } catch (error) {
                handleError(error);
                socket.disconnect(true);
            }
        });

        socket.on('disconnect', (reason) => {
            console.log(`Client disconnected (${socket.id}):`, reason);
        });

        socket.on('error', handleError);
    });

    return io; // Return io instance instead of using global
};