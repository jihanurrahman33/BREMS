const { ethers } = require("ethers");

async function testRpcEndpoints() {
  const rpcUrls = [
    "https://rpc.sepolia.org",
    "https://sepolia.gateway.tenderly.co",
    "https://ethereum-sepolia.publicnode.com",
    "https://sepolia.drpc.org",
    "https://sepolia.infura.io/v3/YOUR_INFURA_KEY", // Replace with actual key
  ];

  console.log("🔍 Testing Sepolia RPC endpoints...\n");

  for (let i = 0; i < rpcUrls.length; i++) {
    const url = rpcUrls[i];
    console.log(`Testing ${i + 1}/${rpcUrls.length}: ${url}`);

    try {
      const provider = new ethers.JsonRpcProvider(url);
      const startTime = Date.now();

      // Test basic connection
      const blockNumber = await provider.getBlockNumber();
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      console.log(
        `✅ SUCCESS - Block: ${blockNumber}, Response time: ${responseTime}ms`
      );

      // Test gas price
      try {
        const gasPrice = await provider.getGasPrice();
        console.log(
          `   Gas price: ${ethers.formatUnits(gasPrice, "gwei")} gwei`
        );
      } catch (gasError) {
        console.log(`   ⚠️  Gas price check failed: ${gasError.message}`);
      }
    } catch (error) {
      console.log(`❌ FAILED - ${error.message}`);
    }

    console.log(""); // Empty line for readability
  }

  console.log("💡 Recommendation:");
  console.log(
    "Use the RPC URL with the fastest response time and lowest gas price"
  );
  console.log("Update SEPOLIA_RPC_URL in your .env file with the best option");
}

testRpcEndpoints()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
