const { ethers } = require("ethers");

async function testContracts() {
  try {
    console.log("🧪 Testing Sepolia contracts...\n");

    // Use the same RPC as hardhat config
    const provider = new ethers.JsonRpcProvider("https://sepolia.drpc.org");

    const CONTRACT_ADDRESS = "0xe53E7A0377BDAe41d045e8FFB74d54F2dd28A607";
    const TOKEN_ADDRESS = "0x2D1380724794d34bAdb6Ec33D53D850B3A6978F3";

    console.log("Contract addresses:");
    console.log("RealEstateCrowdfunding:", CONTRACT_ADDRESS);
    console.log("RealEstateToken:", TOKEN_ADDRESS);

    // Test if contracts exist by checking code
    console.log("\n🔍 Checking contract code...");

    const crowdfundingCode = await provider.getCode(CONTRACT_ADDRESS);
    const tokenCode = await provider.getCode(TOKEN_ADDRESS);

    console.log("Crowdfunding contract code length:", crowdfundingCode.length);
    console.log("Token contract code length:", tokenCode.length);

    if (crowdfundingCode === "0x" || tokenCode === "0x") {
      console.log("❌ Contracts not found - no code at addresses");
      return;
    }

    console.log("✅ Contracts found - code exists at addresses");

    // Test basic contract calls
    console.log("\n🧪 Testing contract calls...");

    const crowdfundingABI = [
      "function platformFee() external view returns (uint256)",
      "function getTotalProperties() external view returns (uint256)",
    ];

    const tokenABI = [
      "function name() external view returns (string)",
      "function symbol() external view returns (string)",
    ];

    const crowdfundingContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      crowdfundingABI,
      provider
    );
    const tokenContract = new ethers.Contract(
      TOKEN_ADDRESS,
      tokenABI,
      provider
    );

    try {
      const platformFee = await crowdfundingContract.platformFee();
      const totalProperties = await crowdfundingContract.getTotalProperties();
      console.log("✅ Crowdfunding contract working:");
      console.log("  Platform fee:", platformFee.toString(), "%");
      console.log("  Total properties:", totalProperties.toString());
    } catch (error) {
      console.log("❌ Crowdfunding contract error:", error.message);
    }

    try {
      const tokenName = await tokenContract.name();
      const tokenSymbol = await tokenContract.symbol();
      console.log("✅ Token contract working:");
      console.log("  Name:", tokenName);
      console.log("  Symbol:", tokenSymbol);
    } catch (error) {
      console.log("❌ Token contract error:", error.message);
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testContracts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
