#!/bin/bash

echo "🚀 Real Estate Crowdfunding - Sepolia Deployment Setup"
echo "======================================================"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Please create a .env file with your Sepolia configuration:"
    echo ""
    echo "SEPOLIA_RPC_URL=https://rpc.sepolia.org"
    echo "PRIVATE_KEY=your_private_key_without_0x_prefix"
    echo "ETHERSCAN_API_KEY=your_etherscan_api_key"
    echo ""
    exit 1
fi

# Check if private key is set
if grep -q "your_private_key_here" .env; then
    echo "❌ Please update your .env file with a real private key!"
    echo "Edit .env file and replace 'your_private_key_here' with your actual private key"
    exit 1
fi

echo "✅ Environment file found"
echo ""

# Deploy to Sepolia
echo "📝 Deploying contracts to Sepolia testnet..."
npx hardhat run deploy-sepolia.js --network sepolia

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Copy the contract addresses from the deployment output above"
    echo "2. Update frontend/.env.local with the new addresses:"
    echo "   REACT_APP_CONTRACT_ADDRESS=0x..."
    echo "   REACT_APP_TOKEN_ADDRESS=0x..."
    echo "   REACT_APP_NETWORK_ID=11155111"
    echo "3. Make sure MetaMask is connected to Sepolia testnet"
    echo "4. Restart the frontend: npm run frontend"
    echo ""
    echo "💡 Get Sepolia ETH from:"
    echo "   - https://sepoliafaucet.com/"
    echo "   - https://faucet.sepolia.dev/"
    echo "   - https://sepolia-faucet.pk910.de/"
else
    echo "❌ Deployment failed!"
    echo "Check your .env configuration and try again"
fi
