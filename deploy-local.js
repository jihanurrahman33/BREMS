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

  // 2.5 Link contracts
  console.log("\n2.5 Linking contracts...");
  // Set token address in crowdfunding contract
  try {
    const setTokenTx = await crowdfunding.setToken(tokenAddress);
    await setTokenTx.wait();
    console.log("   ✅ Token address set in Crowdfunding contract");
  } catch (error) {
    console.error("   ❌ Failed to set token address:", error.message);
  }
  
  // Authorize crowdfunding contract to mint tokens
  try {
    const authorizeTx = await token.authorizeMinter(crowdfundingAddress);
    await authorizeTx.wait();
    console.log("   ✅ Crowdfunding contract authorized as minter");
  } catch (error) {
    console.error("   ❌ Failed to authorize minter:", error.message);
  }

  // 3. Save addresses/ABI to frontend
  console.log("\n3. Updating frontend configuration...");
  
  // Note: We are not updating the .env file directly as it might be complex to parse/write safely in one go.
  // Instead, we will print the values clearly for the user or manual update, 
  // and we will try to update Web3Context.js directly in the next step via tool if needed,
  // or rely on the user to copy them. 
  // However, for this automated flow, I will just print them and I will use the tool to update Web3Context.js myself.
  
  // 3. Save addresses to frontend
  console.log("\n3. Updating frontend configuration...");
  const frontendConfigPath = path.join(__dirname, "frontend/src/contexts/Web3Context.js");
  
  if (fs.existsSync(frontendConfigPath)) {
    let configContent = fs.readFileSync(frontendConfigPath, "utf8");
    
    // Replace CONTRACT_ADDRESS
    configContent = configContent.replace(
      /const CONTRACT_ADDRESS = "0x[a-fA-F0-9]{40}";/,
      `const CONTRACT_ADDRESS = "${crowdfundingAddress}";`
    );
    
    // Replace TOKEN_ADDRESS
    configContent = configContent.replace(
      /const TOKEN_ADDRESS = "0x[a-fA-F0-9]{40}";/,
      `const TOKEN_ADDRESS = "${tokenAddress}";`
    );
    
    fs.writeFileSync(frontendConfigPath, configContent);
    console.log("   ✅ Web3Context.js updated with new addresses");
  } else {
    console.error("   ❌ Web3Context.js not found at:", frontendConfigPath);
  }

  console.log("\nDeployment complete! 🚀");
  console.log("1. Ensure 'npx hardhat node' is running in a separate terminal.");
  console.log("2. Frontend config has been updated automatically.");
  console.log("3. Restart your frontend (if running) to pick up changes.");

  return { crowdfundingAddress, tokenAddress };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
