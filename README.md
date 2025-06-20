# Memories Backend API

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-blue)

A blockchain-integrated backend for minting and redeeming digital memory tokens using wallet authentication and QR codes.

## Features

- 🔐 Wallet-based authentication using Sign-In with Ethereum (SIWE)
- 🖼️ QR code generation for each memory token
- 📱 Mint/Redeem system with on-chain verification
- 📊 Creator dashboard to track token minters
- 🔗 Smart contract integration (Ethereum/Polygon compatible)

## Tech Stack

- Backend: Node.js, Express
- Database: MongoDB
- Authentication: JWT, Ethers.js
- QR Generation: QRCode.js
- Blockchain: Ethereum (via Ethers.js)

## API Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| /auth/nonce | GET | Get nonce for signing | No |
| /auth/login | POST | Wallet login (verify signature) | No |
| /memories | POST | Create new memory | Yes |
| /memories/:id/minters | GET | List all minters for a memory | Yes |

## Getting Started

### Prerequisites

- Node.js 18.x
- MongoDB 6.x+
- Ethereum wallet (MetaMask, etc.)
- npm/yarn

### Installation

1. Clone the repository:
   git clone https://github.com/yourusername/memories-backend.git
   cd memories-backend

2. Install dependencies:
   npm install

3. Create .env file:
   MONGO_URI=mongodb://localhost:27017/memories
   JWT_SECRET=your_strong_secret_here
   PORT=5000

4. Start the server:
   npm start

   For development:
   npm run dev

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| MONGO_URI | Yes | MongoDB connection string | mongodb://localhost:27017/memories |
| JWT_SECRET | Yes | Secret for JWT signing | complexsecret123! |
| PORT | No | Server port | 5000 |


## Authentication Flow

1. Frontend requests nonce from /auth/nonce
2. User signs message containing nonce with wallet
3. Frontend sends signature to /auth/login
4. Backend verifies signature and returns JWT

sequenceDiagram
  Frontend->>Backend: GET /auth/nonce
  Backend->>Frontend: Nonce
  Frontend->>Wallet: Sign message (nonce+domain)
  Wallet->>Frontend: Signature
  Frontend->>Backend: POST /auth/login {message, signature, address}
  Backend->>Backend: Verify signature
  Backend->>Frontend: JWT Token

## Deployment

### Local Development
npm run dev

### Production (PM2)
npm install -g pm2
pm2 start src/server.js --name memories-api

### Docker
docker build -t memories-api .
docker run -p 5000:5000 --env-file .env memories-api

## Testing

Run automated tests (coming soon):
npm test

## Contributing

1. Fork the project
2. Create your feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m 'Add some amazing feature')
4. Push to the branch (git push origin feature/amazing-feature)
5. Open a Pull Request

## License

Distributed under the MIT License. See LICENSE for more information.

## Contact

Your Name - [@leston](https://twitter.com/leston) - your.email@example.com

Project Link: [https://github.com/lestonEth/memories-backend](https://github.com/lestonEth/memories-backend)# cerfy-phgitals-backend
# cerfy-phgitals-backend
# cerfy-phgitals-backend
# cerfy-phgitals-backend
# cerfy-phgitals-backend
# cerfy-phgitals-backend
