const { ethers } = require("hardhat");
const accountsConfig = require("./accounts-config");

async function main() {
  console.log("🚀 Deploying contracts with new accounts...\n");

  // Get the first account as deployer
  const deployerAccount = accountsConfig.accounts[0];
  const deployer = new ethers.Wallet(
    deployerAccount.privateKey,
    ethers.provider
  );

  console.log(`Deploying with account: ${deployerAccount.name}`);
  console.log(`Address: ${deployer.address}\n`);

  // Deploy RealEstateToken
  console.log("📝 Deploying RealEstateToken...");
  const RealEstateToken = await ethers.getContractFactory(
    "RealEstateToken",
    deployer
  );
  const token = await RealEstateToken.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log(`✅ RealEstateToken deployed to: ${tokenAddress}`);

  // Deploy RealEstateCrowdfunding
  console.log("\n🏠 Deploying RealEstateCrowdfunding...");
  const RealEstateCrowdfunding = await ethers.getContractFactory(
    "RealEstateCrowdfunding",
    deployer
  );
  const crowdfunding = await RealEstateCrowdfunding.deploy(tokenAddress);
  await crowdfunding.waitForDeployment();
  const crowdfundingAddress = await crowdfunding.getAddress();
  console.log(`✅ RealEstateCrowdfunding deployed to: ${crowdfundingAddress}`);

  // Transfer some tokens to the crowdfunding contract
  console.log("\n💰 Transferring tokens to crowdfunding contract...");
  const transferTx = await token.transfer(
    crowdfundingAddress,
    ethers.parseEther("1000000")
  );
  await transferTx.wait();
  console.log("✅ Transferred 1,000,000 tokens to crowdfunding contract");

  // Distribute some tokens to other accounts for testing
  console.log("\n🎁 Distributing tokens to test accounts...");
  for (let i = 1; i < accountsConfig.accounts.length; i++) {
    const account = accountsConfig.accounts[i];
    const recipient = new ethers.Wallet(account.privateKey, ethers.provider);
    const transferTx = await token.transfer(
      recipient.address,
      ethers.parseEther("10000")
    );
    await transferTx.wait();
    console.log(
      `✅ Sent 10,000 tokens to ${account.name}: ${recipient.address}`
    );
  }

  console.log("\n📋 Deployment Summary:");
  console.log(`Token Contract: ${tokenAddress}`);
  console.log(`Crowdfunding Contract: ${crowdfundingAddress}`);
  console.log(`Deployer: ${deployer.address}`);

  console.log("\n💡 Next Steps:");
  console.log(
    "1. Update your frontend configuration with these contract addresses"
  );
  console.log("2. Import the private keys into MetaMask for testing");
  console.log("3. Connect MetaMask to localhost:8545 (Hardhat Network)");
  console.log("4. Start testing your real estate crowdfunding platform!");

  // Save deployment info to a file
  const deploymentInfo = {
    tokenAddress,
    crowdfundingAddress,
    deployer: deployer.address,
    accounts: accountsConfig.accounts,
    network: "localhost",
    timestamp: new Date().toISOString(),
  };

  const fs = require("fs");
  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n📄 Deployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
