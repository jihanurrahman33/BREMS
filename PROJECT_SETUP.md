# 🏠 Real Estate Crowdfunding Platform

A blockchain-based real estate crowdfunding platform built with React, Node.js, and Solidity smart contracts.

## 🚀 Quick Start

### Local Development (Currently Running)

The project is currently running locally with the following services:

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Hardhat Node**: http://localhost:8545

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask wallet
- Git

## 📋 Project Structure

```
├── contracts/                 # Smart contracts
│   ├── RealEstateCrowdfunding.sol
│   └── RealEstateToken.sol
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   └── pages/
│   └── .env.local            # Frontend environment variables
├── backend/                   # Node.js backend
│   └── server.js
├── ignition/                  # Hardhat deployment modules
├── test/                      # Contract tests
├── hardhat.config.js         # Hardhat configuration
└── .env                      # Environment variables
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Sepolia Testnet Configuration
SEPOLIA_RPC_URL=https://rpc.sepolia.org
PRIVATE_KEY=your_private_key_without_0x_prefix
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Frontend Environment

Create `frontend/.env.local`:

```env
# For localhost development
REACT_APP_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
REACT_APP_TOKEN_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
REACT_APP_NETWORK_ID=31337
REACT_APP_NETWORK_NAME=localhost

# For Sepolia testnet (update after deployment)
# REACT_APP_CONTRACT_ADDRESS=0x...
# REACT_APP_TOKEN_ADDRESS=0x...
# REACT_APP_NETWORK_ID=11155111
# REACT_APP_NETWORK_NAME=sepolia
```

## 🌐 Deployment to Sepolia Testnet

### Step 1: Get Sepolia ETH

Get test ETH from these faucets:
- https://sepoliafaucet.com/
- https://faucet.sepolia.dev/
- https://sepolia-faucet.pk910.de/

### Step 2: Configure Environment

1. Update `.env` file with your private key and RPC URL
2. Make sure you have Sepolia ETH in your wallet

### Step 3: Deploy Contracts

```bash
# Option 1: Use the automated script
./deploy-sepolia.sh

# Option 2: Manual deployment
npx hardhat run deploy-sepolia.js --network sepolia
```

### Step 4: Update Frontend

After deployment, update `frontend/.env.local` with the new contract addresses and set:
- `REACT_APP_NETWORK_ID=11155111`
- `REACT_APP_NETWORK_NAME=sepolia`

### Step 5: Configure MetaMask

1. Add Sepolia testnet to MetaMask
2. Switch to Sepolia network
3. Import your account with the private key

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Start all services (frontend + backend)
npm run dev

# Start individual services
npm run frontend
npm run backend:dev

# Run contract tests
npx hardhat test

# Compile contracts
npx hardhat compile

# Start local blockchain
npx hardhat node

# Deploy to localhost
npx hardhat run ignition/modules/RealEstateCrowdfunding.js --network localhost

# Deploy to Sepolia
npx hardhat run deploy-sepolia.js --network sepolia
```

## 📱 Features

- **Property Creation**: Create real estate investment opportunities
- **Investment Management**: Invest in properties with ETH
- **Portfolio Tracking**: View your investments and properties
- **Smart Contract Integration**: Secure blockchain transactions
- **Responsive UI**: Modern, mobile-friendly interface

## 🔒 Security Features

- Reentrancy protection
- Access control with OpenZeppelin
- Input validation
- Gas optimization
- Event logging for transparency

## 🧪 Testing

```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/RealEstateCrowdfunding.test.js

# Run tests with gas reporting
REPORT_GAS=true npx hardhat test
```

## 📊 Contract Addresses

### Localhost (Development)
- **RealEstateCrowdfunding**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **RealEstateToken**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`

### Sepolia Testnet
*Update after deployment*

## 🐛 Troubleshooting

### Common Issues

1. **"Failed to create property"**
   - Check if contracts are deployed to the correct network
   - Verify MetaMask is connected to the right network
   - Ensure you have enough ETH for gas fees

2. **"Contract not found"**
   - Contracts may not be deployed to Sepolia
   - Check contract addresses in frontend environment

3. **"Insufficient funds"**
   - You need Sepolia ETH, not mainnet ETH
   - Get test ETH from faucets

4. **Port conflicts**
   - Kill processes using ports 3000, 3001, or 8545
   - Restart the services

### Getting Help

- Check the browser console for errors
- Verify MetaMask network settings
- Ensure environment variables are correct
- Check hardhat node is running for local development

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**Happy Crowdfunding! 🏠💰**
