const { ethers } = require("hardhat");

async function deployToSepolia() {
  try {
    console.log("🚀 Deploying contracts to Sepolia testnet...\n");

    // Check if we have a valid private key
    const privateKey = process.env.PRIVATE_KEY;
    if (
      !privateKey ||
      privateKey === "your_private_key_here" ||
      privateKey ===
        "0000000000000000000000000000000000000000000000000000000000000000"
    ) {
      console.log("❌ Please set up your private key in the .env file");
      console.log("1. Open .env file");
      console.log(
        "2. Replace PRIVATE_KEY with your actual private key (without 0x prefix)"
      );
      console.log("3. Make sure you have Sepolia ETH in that wallet");
      console.log("\nExample:");
      console.log(
        "PRIVATE_KEY=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
      );
      return;
    }

    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");

    if (balance < ethers.parseEther("0.01")) {
      console.error(
        "❌ Insufficient balance for deployment. Need at least 0.01 ETH"
      );
      console.log("Get Sepolia ETH from:");
      console.log("- https://sepoliafaucet.com/");
      console.log("- https://faucet.sepolia.dev/");
      console.log("- https://sepolia-faucet.pk910.de/");
      return;
    }

    // Deploy RealEstateCrowdfunding
    console.log("\n📝 Deploying RealEstateCrowdfunding...");
    const RealEstateCrowdfunding = await ethers.getContractFactory(
      "RealEstateCrowdfunding"
    );
    const realEstateCrowdfunding = await RealEstateCrowdfunding.deploy();
    await realEstateCrowdfunding.waitForDeployment();

    const crowdfundingAddress = await realEstateCrowdfunding.getAddress();
    console.log("✅ RealEstateCrowdfunding deployed to:", crowdfundingAddress);

    // Deploy RealEstateToken
    console.log("\n🪙 Deploying RealEstateToken...");
    const RealEstateToken = await ethers.getContractFactory("RealEstateToken");
    const realEstateToken = await RealEstateToken.deploy();
    await realEstateToken.waitForDeployment();

    const tokenAddress = await realEstateToken.getAddress();
    console.log("✅ RealEstateToken deployed to:", tokenAddress);

    // Authorize the crowdfunding contract as a minter
    console.log("\n🔐 Authorizing minter...");
    const authTx = await realEstateToken.authorizeMinter(crowdfundingAddress);
    await authTx.wait();
    console.log("✅ Minter authorized");

    // Test the contracts
    console.log("\n🧪 Testing contracts...");
    const platformFee = await realEstateCrowdfunding.platformFee();
    console.log("Platform fee:", platformFee.toString(), "%");

    const totalProperties = await realEstateCrowdfunding.getTotalProperties();
    console.log("Total properties:", totalProperties.toString());

    console.log("\n🎉 Deployment successful!");
    console.log("\n📋 Contract Addresses for Sepolia:");
    console.log("RealEstateCrowdfunding:", crowdfundingAddress);
    console.log("RealEstateToken:", tokenAddress);

    console.log("\n📝 Next steps:");
    console.log("1. Update frontend/.env.local with these addresses:");
    console.log(`   REACT_APP_CONTRACT_ADDRESS=${crowdfundingAddress}`);
    console.log(`   REACT_APP_TOKEN_ADDRESS=${tokenAddress}`);
    console.log("   REACT_APP_NETWORK_ID=11155111");
    console.log("   REACT_APP_NETWORK_NAME=sepolia");
    console.log("2. Restart the frontend: npm run frontend");
    console.log("3. Make sure MetaMask is connected to Sepolia testnet");
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    if (error.reason) {
      console.error("Reason:", error.reason);
    }
    console.log("\nTroubleshooting:");
    console.log("1. Check your private key in .env file");
    console.log("2. Make sure you have Sepolia ETH");
    console.log("3. Verify RPC URL is working");
  }
}

deployToSepolia()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
