const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment to local network...");

  // 1. Deploy RealEstateToken
  console.log("\n1. Deploying RealEstateToken...");
  const RealEstateToken = await ethers.getContractFactory("RealEstateToken");
  const initialSupply = ethers.parseEther("1000000"); // 1M tokens
  const token = await RealEstateToken.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("   ✅ RealEstateToken deployed to:", tokenAddress);

  // 2. Deploy RealEstateCrowdfunding
  console.log("\n2. Deploying RealEstateCrowdfunding...");
  const RealEstateCrowdfunding = await ethers.getContractFactory("RealEstateCrowdfunding");
  const crowdfunding = await RealEstateCrowdfunding.deploy();
  await crowdfunding.waitForDeployment();
  const crowdfundingAddress = await crowdfunding.getAddress();
  console.log("   ✅ RealEstateCrowdfunding deployed to:", crowdfundingAddress);

  // 3. Save addresses/ABI to frontend
  console.log("\n3. Updating frontend configuration...");
  
  // Note: We are not updating the .env file directly as it might be complex to parse/write safely in one go.
  // Instead, we will print the values clearly for the user or manual update, 
  // and we will try to update Web3Context.js directly in the next step via tool if needed,
  // or rely on the user to copy them. 
  // However, for this automated flow, I will just print them and I will use the tool to update Web3Context.js myself.
  
  console.log("\nCopy these values to your frontend configuration (or I will do it for you):");
  console.log("CONTRACT_ADDRESS:", crowdfundingAddress);
  console.log("TOKEN_ADDRESS:", tokenAddress);

  return { crowdfundingAddress, tokenAddress };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
