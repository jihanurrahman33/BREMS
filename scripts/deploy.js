const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy RealEstateToken
  console.log("\n1. Deploying RealEstateToken...");
  const RealEstateToken = await ethers.getContractFactory("RealEstateToken");
  const token = await RealEstateToken.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("   RealEstateToken deployed to:", tokenAddress);

  // Deploy RealEstateCrowdfunding
  console.log("\n2. Deploying RealEstateCrowdfunding...");
  const RealEstateCrowdfunding = await ethers.getContractFactory(
    "RealEstateCrowdfunding",
  );
  const crowdfunding = await RealEstateCrowdfunding.deploy();
  await crowdfunding.waitForDeployment();
  const crowdfundingAddress = await crowdfunding.getAddress();
  console.log("   RealEstateCrowdfunding deployed to:", crowdfundingAddress);

  // Link contracts
  console.log("\n3. Linking contracts...");
  const setTokenTx = await crowdfunding.setToken(tokenAddress);
  await setTokenTx.wait();
  console.log("   Token address set in Crowdfunding contract");

  const authorizeTx = await token.authorizeMinter(crowdfundingAddress);
  await authorizeTx.wait();
  console.log("   Crowdfunding contract authorized as minter");

  // Write deployed addresses to frontend .env.local
  console.log("\n4. Updating frontend .env.local...");
  const envContent = [
    `REACT_APP_CONTRACT_ADDRESS=${crowdfundingAddress}`,
    `REACT_APP_TOKEN_ADDRESS=${tokenAddress}`,
    `REACT_APP_NETWORK_ID=31337`,
    `REACT_APP_NETWORK_NAME=localhost`,
    "",
  ].join("\n");

  const frontendEnvPath = path.join(__dirname, "..", "frontend", ".env.local");
  fs.writeFileSync(frontendEnvPath, envContent);
  console.log("   frontend/.env.local updated");

  console.log("\nDeployment complete!");
  console.log("Contract Address:", crowdfundingAddress);
  console.log("Token Address:   ", tokenAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
