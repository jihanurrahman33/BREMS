# Deployment Guide

This guide will walk you through deploying the Real Estate Crowdfunding Platform to production.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask wallet with test ETH
- Access to Ethereum network (testnet or mainnet)

## 1. Environment Setup

### Create Environment Files

Create a `.env` file in the root directory:

```env
# Network Configuration
NETWORK=localhost  # or sepolia, mainnet
INFURA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY

# Deployment Configuration
PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE
OWNER_ADDRESS=YOUR_WALLET_ADDRESS

# Frontend Configuration
REACT_APP_CONTRACT_ADDRESS=
REACT_APP_TOKEN_ADDRESS=
REACT_APP_NETWORK_ID=11155111  # Sepolia testnet
```

### Install Dependencies

```bash
# Install all dependencies
npm run install-all
```

## 2. Smart Contract Deployment

### Compile Contracts

```bash
npm run compile
```

### Deploy to Local Network

1. Start local Hardhat node:
```bash
npm run node
```

2. In a new terminal, deploy contracts:
```bash
npm run deploy
```

3. Note the deployed contract addresses from the output.

### Deploy to Testnet (Sepolia)

1. Update `.env` with your configuration:
```env
NETWORK=sepolia
INFURA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=YOUR_PRIVATE_KEY
```

2. Deploy contracts:
```bash
npx hardhat ignition deploy ./ignition/modules/RealEstateCrowdfunding.js --network sepolia
```

3. Verify contracts on Etherscan:
```bash
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

## 3. Frontend Configuration

### Update Contract Addresses

Update the contract addresses in `frontend/src/contexts/Web3Context.js`:

```javascript
const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
const TOKEN_ADDRESS = "YOUR_DEPLOYED_TOKEN_ADDRESS";
```

### Environment Variables

Create `.env` file in the frontend directory:

```env
REACT_APP_CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS
REACT_APP_TOKEN_ADDRESS=YOUR_TOKEN_ADDRESS
REACT_APP_NETWORK_ID=11155111
REACT_APP_INFURA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
```

### Build Frontend

```bash
cd frontend
npm run build
```

## 4. Backend Deployment

### Local Development

```bash
cd backend
npm install
npm run dev
```

### Production Deployment

1. Set up environment variables:
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

2. Start the server:
```bash
npm start
```

## 5. Full Stack Deployment

### Using Docker (Recommended)

1. Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_CONTRACT_ADDRESS=${CONTRACT_ADDRESS}
      - REACT_APP_TOKEN_ADDRESS=${TOKEN_ADDRESS}
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
      - backend
```

2. Create `Dockerfile` for frontend:

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

3. Create `Dockerfile` for backend:

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

4. Deploy with Docker:
```bash
docker-compose up -d
```

### Manual Deployment

1. Start backend:
```bash
npm run backend
```

2. Start frontend:
```bash
npm run frontend
```

3. Or run both simultaneously:
```bash
npm run dev
```

## 6. Production Considerations

### Security

- Use HTTPS in production
- Implement rate limiting
- Set up proper CORS configuration
- Use environment variables for sensitive data
- Regular security audits

### Performance

- Enable gzip compression
- Use CDN for static assets
- Implement caching strategies
- Monitor application performance

### Monitoring

- Set up logging (Winston, Morgan)
- Implement health checks
- Monitor blockchain transactions
- Set up error tracking (Sentry)

## 7. Testing

### Smart Contract Tests

```bash
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Integration Tests

```bash
# Test the full stack
npm run dev
# Then run your integration tests
```

## 8. Maintenance

### Regular Tasks

- Monitor contract events
- Update dependencies
- Backup database (if using one)
- Monitor gas prices
- Update contract addresses if redeploying

### Troubleshooting

Common issues and solutions:

1. **Contract deployment fails**
   - Check gas limit
   - Verify network configuration
   - Ensure sufficient ETH balance

2. **Frontend can't connect to contracts**
   - Verify contract addresses
   - Check network configuration
   - Ensure MetaMask is connected to correct network

3. **Backend API errors**
   - Check environment variables
   - Verify port availability
   - Check logs for errors

## 9. Scaling

### Horizontal Scaling

- Use load balancers
- Implement database sharding
- Use microservices architecture
- Implement caching layers

### Blockchain Scaling

- Consider Layer 2 solutions
- Implement batch transactions
- Optimize gas usage
- Use IPFS for data storage

## Support

For issues and questions:
- Check the documentation
- Review the test files
- Open an issue on GitHub
- Contact the development team 