#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🚀 Setting up Real Estate Crowdfunding Platform...\n");

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split(".")[0]);

if (majorVersion < 16) {
  console.error("❌ Node.js version 16 or higher is required");
  console.error(`Current version: ${nodeVersion}`);
  process.exit(1);
}

console.log(`✅ Node.js version: ${nodeVersion}`);

// Install dependencies
console.log("\n📦 Installing dependencies...");
try {
  execSync("npm install", { stdio: "inherit" });
  console.log("✅ Root dependencies installed");
} catch (error) {
  console.error("❌ Failed to install root dependencies");
  process.exit(1);
}

// Install frontend dependencies
console.log("\n🎨 Installing frontend dependencies...");
try {
  execSync("cd frontend && npm install", { stdio: "inherit" });
  console.log("✅ Frontend dependencies installed");
} catch (error) {
  console.error("❌ Failed to install frontend dependencies");
  process.exit(1);
}

// Install backend dependencies
console.log("\n🔧 Installing backend dependencies...");
try {
  execSync("cd backend && npm install", { stdio: "inherit" });
  console.log("✅ Backend dependencies installed");
} catch (error) {
  console.error("❌ Failed to install backend dependencies");
  process.exit(1);
}

// Compile contracts
console.log("\n📋 Compiling smart contracts...");
try {
  execSync("npx hardhat compile", { stdio: "inherit" });
  console.log("✅ Smart contracts compiled");
} catch (error) {
  console.error("❌ Failed to compile smart contracts");
  process.exit(1);
}

// Create .env files if they don't exist
console.log("\n⚙️  Setting up environment files...");

const rootEnvPath = path.join(__dirname, "..", ".env");
const frontendEnvPath = path.join(__dirname, "..", "frontend", ".env");
const backendEnvPath = path.join(__dirname, "..", "backend", ".env");

const rootEnvContent = `# Network Configuration
NETWORK=localhost
INFURA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY

# Deployment Configuration
PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE
OWNER_ADDRESS=YOUR_WALLET_ADDRESS

# Frontend Configuration
REACT_APP_CONTRACT_ADDRESS=
REACT_APP_TOKEN_ADDRESS=
REACT_APP_NETWORK_ID=31337
`;

const frontendEnvContent = `REACT_APP_CONTRACT_ADDRESS=
REACT_APP_TOKEN_ADDRESS=
REACT_APP_NETWORK_ID=31337
REACT_APP_INFURA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
`;

const backendEnvContent = `NODE_ENV=development
PORT=3001
`;

if (!fs.existsSync(rootEnvPath)) {
  fs.writeFileSync(rootEnvPath, rootEnvContent);
  console.log("✅ Created .env file in root directory");
}

if (!fs.existsSync(frontendEnvPath)) {
  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  console.log("✅ Created .env file in frontend directory");
}

if (!fs.existsSync(backendEnvPath)) {
  fs.writeFileSync(backendEnvPath, backendEnvContent);
  console.log("✅ Created .env file in backend directory");
}

console.log("\n🎉 Setup completed successfully!");
console.log("\n📋 Next steps:");
console.log("1. Update the .env files with your configuration");
console.log("2. Start local blockchain: npm run node");
console.log("3. Deploy contracts: npm run deploy");
console.log("4. Start the application: npm run dev");
console.log("\n📖 For more information, see README.md and DEPLOYMENT.md");
