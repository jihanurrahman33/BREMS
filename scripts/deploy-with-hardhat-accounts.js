const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying contracts with Hardhat pre-funded accounts...\n");

  // Get the signers (pre-funded accounts from Hardhat)
  const [
    deployer,
    propertyOwner1,
    propertyOwner2,
    investor1,
    investor2,
    investor3,
  ] = await ethers.getSigners();

  console.log(`Deploying with account: ${deployer.address}`);
  console.log(
    `Balance: ${ethers.formatEther(
      await ethers.provider.getBalance(deployer.address)
    )} ETH\n`
  );

  // Deploy RealEstateToken
  console.log("📝 Deploying RealEstateToken...");
  const RealEstateToken = await ethers.getContractFactory("RealEstateToken");
  const token = await RealEstateToken.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log(`✅ RealEstateToken deployed to: ${tokenAddress}`);

  // Deploy RealEstateCrowdfunding
  console.log("\n🏠 Deploying RealEstateCrowdfunding...");
  const RealEstateCrowdfunding = await ethers.getContractFactory(
    "RealEstateCrowdfunding"
  );
  const crowdfunding = await RealEstateCrowdfunding.deploy(tokenAddress, {});
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
  const testAccounts = [
    propertyOwner1,
    propertyOwner2,
    investor1,
    investor2,
    investor3,
  ];
  const accountNames = [
    "Property Owner 1",
    "Property Owner 2",
    "Investor 1",
    "Investor 2",
    "Investor 3",
  ];

  for (let i = 0; i < testAccounts.length; i++) {
    const account = testAccounts[i];
    const transferTx = await token.transfer(
      account.address,
      ethers.parseEther("10000")
    );
    await transferTx.wait();
    console.log(
      `✅ Sent 10,000 tokens to ${accountNames[i]}: ${account.address}`
    );
  }

  console.log("\n📋 Deployment Summary:");
  console.log(`Token Contract: ${tokenAddress}`);
  console.log(`Crowdfunding Contract: ${crowdfundingAddress}`);
  console.log(`Deployer: ${deployer.address}`);

  console.log("\n🔑 Hardhat Account Private Keys:");
  console.log("Account #0 (Deployer):", await deployer.getAddress());
  console.log(
    "Account #1 (Property Owner 1):",
    await propertyOwner1.getAddress()
  );
  console.log(
    "Account #2 (Property Owner 2):",
    await propertyOwner2.getAddress()
  );
  console.log("Account #3 (Investor 1):", await investor1.getAddress());
  console.log("Account #4 (Investor 2):", await investor2.getAddress());
  console.log("Account #5 (Investor 3):", await investor3.getAddress());

  console.log("\n💡 Next Steps:");
  console.log("1. Copy the contract addresses above");
  console.log(
    "2. Import Hardhat private keys into MetaMask (see hardhat.config.js)"
  );
  console.log("3. Connect MetaMask to localhost:8545 (Hardhat Network)");
  console.log("4. Update your frontend with the new contract addresses");
  console.log("5. Start testing your real estate crowdfunding platform!");

  // Save deployment info to a file
  const deploymentInfo = {
    tokenAddress,
    crowdfundingAddress,
    deployer: await deployer.getAddress(),
    accounts: {
      deployer: await deployer.getAddress(),
      propertyOwner1: await propertyOwner1.getAddress(),
      propertyOwner2: await propertyOwner2.getAddress(),
      investor1: await investor1.getAddress(),
      investor2: await investor2.getAddress(),
      investor3: await investor3.getAddress(),
    },
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
