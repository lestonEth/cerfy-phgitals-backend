require('dotenv').config();
const { initializeEventListeners, resetMintCount } = require('./services/blockchainEvents');

// Create separate servers
const app = require('./app');
const socketServer = require('http').createServer();

const API_PORT = process.env.PORT || 5000;
const SOCKET_PORT = process.env.SOCKET_PORT || 3002;

// Initialize Socket.io server
const io = require('socket.io')(socketServer, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"]
    },
    transports: ['websocket']
});

// Import and initialize socket logic
require('./sockets')(io);

app.set('socketio', io);

// Start servers
const startServers = async () => {
    try {
        // resetMintCount();

        // Start API server
        app.listen(API_PORT, () => {
            console.log(`API Server running on port ${API_PORT}`);
            initializeEventListeners();
        });

        // Start Socket.io server
        socketServer.listen(SOCKET_PORT, () => {
            console.log(`WebSocket Server running on port ${SOCKET_PORT}`);
        });

    } catch (error) {
        console.error('Failed to start servers:', error);
        process.exit(1);
    }
};

startServers();