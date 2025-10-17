const { ethers } = require("hardhat");

async function deployToSepolia() {
  try {
    console.log("🚀 Deploying contracts to Sepolia testnet...\n");

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
    console.log("\n📋 Contract Addresses:");
    console.log("RealEstateCrowdfunding:", crowdfundingAddress);
    console.log("RealEstateToken:", tokenAddress);

    console.log("\n📝 Next steps:");
    console.log("1. Update your frontend .env.local file with these addresses");
    console.log("2. Set REACT_APP_NETWORK_ID=11155111 for Sepolia");
    console.log("3. Make sure MetaMask is connected to Sepolia testnet");
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    if (error.reason) {
      console.error("Reason:", error.reason);
    }
  }
}

deployToSepolia()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
