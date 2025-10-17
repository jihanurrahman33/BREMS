# Real Estate Crowdfunding Platform

A decentralized real estate crowdfunding platform built on Ethereum that allows users to invest in real estate properties through fractional ownership using smart contracts.

## 🏗️ Features

- **Property Listing**: Property owners can list their real estate for crowdfunding
- **Fractional Investment**: Investors can invest in properties with small amounts
- **Smart Contract Security**: All transactions are secured by blockchain technology
- **Transparent Funding**: Real-time tracking of funding progress
- **Token Rewards**: Platform token (RECT) for governance and rewards
- **Modern UI**: Beautiful React frontend with Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask wallet extension

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd real-estate-crowdfunding
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   npm run install-frontend
   ```

4. **Compile smart contracts**
   ```bash
   npm run compile
   ```

5. **Start local blockchain**
   ```bash
   npm run node
   ```

6. **Deploy contracts** (in a new terminal)
   ```bash
   npm run deploy
   ```

7. **Start frontend** (in a new terminal)
   ```bash
   npm run frontend
   ```

8. **Open your browser**
   Navigate to `http://localhost:3000`

## 📋 Smart Contracts

### RealEstateCrowdfunding.sol
Main contract that handles:
- Property creation and management
- Investment processing
- Funding distribution
- Platform fee collection

### RealEstateToken.sol
ERC20 token for platform governance and rewards.

## 🎯 Usage

### For Property Owners
1. Connect your MetaMask wallet
2. Navigate to "Create Property"
3. Fill in property details and funding requirements
4. Submit the transaction
5. Monitor funding progress
6. Complete property once funded

### For Investors
1. Connect your MetaMask wallet
2. Browse available properties
3. Review property details and investment terms
4. Invest in properties within the specified limits
5. Track your investment portfolio
6. Withdraw returns when properties are completed

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run tests with gas reporting:
```bash
REPORT_GAS=true npm test
```

## 📁 Project Structure

```
real-estate-crowdfunding/
├── contracts/                 # Smart contracts
│   ├── RealEstateCrowdfunding.sol
│   └── RealEstateToken.sol
├── frontend/                  # React application
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── contexts/         # React contexts
│   │   └── utils/            # Utility functions
│   └── public/               # Static assets
├── test/                     # Contract tests
├── ignition/                 # Deployment scripts
└── hardhat.config.js         # Hardhat configuration
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
PRIVATE_KEY=your_private_key_here
INFURA_URL=your_infura_url_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### Contract Addresses
After deployment, update the contract addresses in `frontend/src/contexts/Web3Context.js`:
```javascript
const CONTRACT_ADDRESS = "your_deployed_contract_address";
const TOKEN_ADDRESS = "your_deployed_token_address";
```

## 🛡️ Security

- All smart contracts are built with OpenZeppelin libraries
- Reentrancy protection implemented
- Access control for admin functions
- Comprehensive test coverage
- Gas optimization

## 📈 Roadmap

- [ ] Property image uploads
- [ ] Advanced filtering and search
- [ ] Mobile app development
- [ ] Integration with real estate APIs
- [ ] Secondary market for property tokens
- [ ] DAO governance implementation
- [ ] Cross-chain compatibility

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This is a demonstration project. For production use, additional security audits and legal compliance should be implemented.
