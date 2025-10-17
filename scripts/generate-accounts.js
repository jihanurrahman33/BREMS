const { ethers } = require("hardhat");

async function main() {
  console.log("🔑 Generating new Ethereum accounts for development...\n");

  // Generate 5 new accounts
  for (let i = 0; i < 5; i++) {
    const wallet = ethers.Wallet.createRandom();

    console.log(`Account ${i + 1}:`);
    console.log(`  Address: ${wallet.address}`);
    console.log(`  Private Key: ${wallet.privateKey}`);
    console.log(`  Mnemonic: ${wallet.mnemonic?.phrase || "N/A"}`);
    console.log("");
  }

  console.log("💡 Instructions:");
  console.log("1. Copy these private keys to a secure location");
  console.log("2. Import them into MetaMask for testing");
  console.log(
    "3. Use these accounts for your real estate crowdfunding platform"
  );
  console.log("4. NEVER share these private keys or use them on mainnet!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
