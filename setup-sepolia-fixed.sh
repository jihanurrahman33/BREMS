#!/bin/bash

echo "🔧 Sepolia Testnet Setup - Fixed RPC Issues"
echo "=========================================="
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Creating .env file..."
    cat > .env << 'EOF'
# Sepolia Testnet Configuration
SEPOLIA_RPC_URL=https://sepolia.drpc.org
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
EOF
    echo "✅ Created .env file"
fi

# Check if private key is set
if grep -q "your_private_key_here" .env; then
    echo ""
    echo "⚠️  IMPORTANT: You need to set up your private key!"
    echo ""
    echo "1. Open .env file"
    echo "2. Replace 'your_private_key_here' with your actual private key"
    echo "3. Make sure you have Sepolia ETH in that wallet"
    echo ""
    echo "Example .env file:"
    echo "SEPOLIA_RPC_URL=https://sepolia.drpc.org"
    echo "PRIVATE_KEY=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
    echo "ETHERSCAN_API_KEY=your_etherscan_api_key"
    echo ""
    echo "💡 Get Sepolia ETH from:"
    echo "   - https://sepoliafaucet.com/"
    echo "   - https://faucet.sepolia.dev/"
    echo "   - https://sepolia-faucet.pk910.de/"
    echo ""
    echo "After updating .env, run: npx hardhat run deploy-sepolia-improved.js --network sepolia"
    exit 1
fi

echo "✅ Environment file configured"
echo "✅ Using optimized RPC endpoint (sepolia.drpc.org)"
echo ""

# Test RPC connection first
echo "🔍 Testing RPC connection..."
node test-rpc.js

echo ""
echo "📝 Deploying contracts to Sepolia testnet..."
npx hardhat run deploy-sepolia-improved.js --network sepolia

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Copy the contract addresses from above"
    echo "2. Update frontend/.env.local:"
    echo "   REACT_APP_CONTRACT_ADDRESS=0x..."
    echo "   REACT_APP_TOKEN_ADDRESS=0x..."
    echo "   REACT_APP_NETWORK_ID=11155111"
    echo "   REACT_APP_NETWORK_NAME=sepolia"
    echo "3. Restart frontend: npm run frontend"
    echo "4. Switch MetaMask to Sepolia testnet"
else
    echo "❌ Deployment failed!"
    echo "Check your .env configuration and try again"
fi
