const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Starting IPFS Flow Verification...");

  // 1. Deploy Contract
  console.log("\n1. Deploying RealEstateCrowdfunding contract...");
  const RealEstateCrowdfunding = await ethers.getContractFactory("RealEstateCrowdfunding");
  const contract = await RealEstateCrowdfunding.deploy();
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log("   ✅ Contract deployed to:", contractAddress);

  // 2. Create Property with IPFS Hash
  console.log("\n2. Creating property with IPFS hash...");
  const [owner] = await ethers.getSigners();
  
  const title = "Test IPFS Property";
  const description = "Testing IPFS storage integration";
  const ipfsHash = "QmTest123456789";
  const location = "Test City";
  const totalValue = ethers.parseEther("100");
  const minInvestment = ethers.parseEther("0.1");
  const maxInvestment = ethers.parseEther("10");
  const targetFunding = ethers.parseEther("50");
  const deadline = Math.floor(Date.now() / 1000) + 86400; // 1 day from now

  const tx = await contract.createProperty(
    title,
    description,
    ipfsHash,
    location,
    totalValue,
    minInvestment,
    maxInvestment,
    targetFunding,
    deadline
  );
  await tx.wait();
  console.log("   ✅ Property created");

  // 3. Retrieve Property and Verify IPFS Hash
  // 3. Retrieve Property and Verify IPFS Hash
  console.log("\n3. Verifying stored IPFS hash...");
  const propertyId = 1;
  const property = await contract.properties(propertyId);
  
  // Note: Return values are: id, owner, title, description, ipfsHash, location, ...
  // Based on the struct and return tuple order
  const storedIpfsHash = property[4]; // Index 4 based on our change
  
  console.log("   Expected Hash:", ipfsHash);
  console.log("   Stored Hash:  ", storedIpfsHash);

  if (storedIpfsHash === ipfsHash) {
    console.log("   ✅ SUCCESS: IPFS hash matches!");
  } else {
    console.error("   ❌ FAILURE: IPFS hash mismatch!");
    process.exit(1);
  }

  console.log("\n🎉 Verification Complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
