# Blockchain Real Estate Crowdfunding System (BREMS)

A decentralized real estate crowdfunding platform on Ethereum. Users tokenize properties, invest fractionally via smart contracts, and earn RECT token rewards.

## Table of Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Smart Contracts](#smart-contracts)
- [Available Scripts](#available-scripts)
- [Testing](#testing)
- [Deploying to Sepolia Testnet](#deploying-to-sepolia-testnet)
- [Environment Variables](#environment-variables)
- [Frontend Pages](#frontend-pages)
- [Backend API](#backend-api)
- [License](#license)

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────────┐
│  React App   │────▶│  Express API │     │  Ethereum Network    │
│  (frontend/) │     │  (backend/)  │     │  (Hardhat / Sepolia) │
└──────┬───────┘     └──────────────┘     └──────────┬───────────┘
       │                                             │
       │         Smart Contracts (contracts/)        │
       └─────────────────────────────────────────────┘
                          │
                    ┌─────┴─────┐
                    │   IPFS    │
                    │ (Pinata)  │
                    └───────────┘
```

- **Smart Contracts** — Solidity contracts compiled and deployed via Hardhat.
- **Frontend** — React 18 with ethers.js, Tailwind CSS, and React Router.
- **Backend** — Express.js REST API with rate limiting and security middleware.
- **IPFS** — Property images pinned to IPFS through Pinata (optional; works with mock hashes in dev).

## Prerequisites

| Tool | Version |
|------|---------|
| [Node.js](https://nodejs.org/) | >= 18 |
| [npm](https://www.npmjs.com/) | >= 9 |
| [MetaMask](https://metamask.io/) | Browser extension |
| [Git](https://git-scm.com/) | Any recent version |

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/jihanurrahman33/BREMS.git
cd BREMS
npm run install:all
```

This installs root, frontend, and backend dependencies in one command.

### 2. Start the local blockchain

```bash
npm run node
```

This starts a Hardhat node at `http://127.0.0.1:8545` (chain ID `31337`) and prints 20 test accounts with private keys. **Keep this terminal running.**

### 3. Deploy contracts

Open a **new terminal** in the project root:

```bash
npm run deploy
```

This deploys `RealEstateToken` and `RealEstateCrowdfunding` to the local node, links them together, and writes the contract addresses to `frontend/.env.local` automatically.

### 4. Start the app

```bash
npm run dev
```

This starts both the backend (port 3001) and the frontend (port 3000) concurrently.

Open [http://localhost:3000](http://localhost:3000).

### 5. Connect MetaMask

1. Open MetaMask and add a custom network:

   | Field | Value |
   |-------|-------|
   | Network Name | Hardhat Local |
   | RPC URL | `http://127.0.0.1:8545` |
   | Chain ID | `31337` |
   | Currency Symbol | ETH |

2. Import a test account: copy any private key printed by `npm run node` and import it into MetaMask.

3. Click **Connect Wallet** in the app.

4. **If you restart the Hardhat node**, reset your MetaMask account nonce: Settings > Advanced > Clear activity tab data.

You now have 10,000 test ETH to create properties and invest.

## Project Structure

```
├── contracts/                # Solidity smart contracts
│   ├── RealEstateCrowdfunding.sol
│   └── RealEstateToken.sol
├── scripts/                  # Deployment scripts
│   └── deploy.js
├── test/                     # Contract test suites
│   ├── RealEstateCrowdfunding.test.js
│   └── TokenIntegration.test.js
├── ignition/                 # Hardhat Ignition module (alternative deploy)
│   └── modules/
│       └── RealEstateCrowdfunding.js
├── backend/                  # Express.js API
│   ├── package.json
│   └── server.js
├── frontend/                 # React application
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js
│       ├── index.js
│       ├── index.css
│       ├── components/
│       │   └── Navbar.js
│       ├── contexts/
│       │   └── Web3Context.js   # Wallet & contract interactions
│       ├── pages/
│       │   ├── Home.js
│       │   ├── Properties.js
│       │   ├── PropertyDetail.js
│       │   ├── CreateProperty.js
│       │   ├── MyInvestments.js
│       │   └── MyProperties.js
│       └── utils/
│           └── ipfs.js          # Pinata IPFS upload helper
├── .env.example              # Environment variable template
├── .gitignore
├── hardhat.config.js
├── package.json
└── README.md                 # This file
```

## Smart Contracts

### RealEstateCrowdfunding.sol

The core platform contract:

- **Property creation** — List properties with title, description, images (IPFS hash), location, funding target, and investment limits.
- **Investment** — Users invest ETH within min/max bounds. Properties auto-close when fully funded.
- **Completion & distribution** — Property owners complete funded properties; funds transfer to owner minus a platform fee (default 2%).
- **Withdrawal** — Investors withdraw returns after property completion.
- **Security** — OpenZeppelin `ReentrancyGuard` and `Ownable` access control.

### RealEstateToken.sol (RECT)

An ERC20 reward token:

- 1,000,000 RECT initial supply.
- Investors receive **1,000 RECT per ETH** invested.
- Authorized minter pattern — only the crowdfunding contract can mint rewards.
- Pausable transfers for emergency scenarios.

## Available Scripts

Run from the project root:

| Command | Description |
|---------|-------------|
| `npm run install:all` | Install all dependencies (root + frontend + backend) |
| `npm run node` | Start local Hardhat blockchain node |
| `npm run compile` | Compile smart contracts |
| `npm run deploy` | Deploy contracts to local network |
| `npm run deploy:sepolia` | Deploy contracts to Sepolia testnet |
| `npm test` | Run smart contract tests |
| `npm run dev` | Start backend + frontend concurrently |
| `npm run frontend` | Start frontend only |
| `npm run backend` | Start backend only |
| `npm run backend:dev` | Start backend with hot reload |
| `npm run build` | Build frontend for production |

## Testing

```bash
npm test
```

Runs the full test suite against an in-memory Hardhat network:

- **RealEstateCrowdfunding.test.js** — Property creation, investment flows, completion, withdrawal, platform fee management.
- **TokenIntegration.test.js** — Token minting on investment, event emissions.

## Deploying to Sepolia Testnet

1. Copy `.env.example` to `.env` and fill in your values:

   ```bash
   cp .env.example .env
   ```

   ```env
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
   PRIVATE_KEY=your_wallet_private_key_without_0x
   ETHERSCAN_API_KEY=your_etherscan_api_key
   ```

2. Ensure your wallet has Sepolia ETH (use a [faucet](https://sepoliafaucet.com/)).

3. Deploy:

   ```bash
   npm run deploy:sepolia
   ```

4. Update `frontend/.env.local` with the printed contract addresses and set `REACT_APP_NETWORK_ID=11155111`.

## Environment Variables

### Root `.env` (for contract deployment)

| Variable | Required | Description |
|----------|----------|-------------|
| `SEPOLIA_RPC_URL` | For testnet | Sepolia RPC endpoint |
| `PRIVATE_KEY` | For testnet | Deployer wallet private key |
| `ETHERSCAN_API_KEY` | No | For contract verification |

### Frontend `frontend/.env.local` (auto-generated by deploy script)

| Variable | Description |
|----------|-------------|
| `REACT_APP_CONTRACT_ADDRESS` | Crowdfunding contract address |
| `REACT_APP_TOKEN_ADDRESS` | RECT token contract address |
| `REACT_APP_NETWORK_ID` | `31337` (local) or `11155111` (Sepolia) |
| `REACT_APP_NETWORK_NAME` | `localhost` or `sepolia` |
| `REACT_APP_PINATA_JWT` | (Optional) Pinata JWT for IPFS uploads |

## Frontend Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page with platform stats and features |
| `/properties` | Properties | Browse, search, and filter listed properties |
| `/properties/:id` | Property Detail | View details, invest, or complete a property |
| `/create-property` | Create Property | List a new property with image upload |
| `/my-investments` | My Investments | Portfolio dashboard of your investments |
| `/my-properties` | My Properties | Manage properties you've listed |

## Backend API

Base URL: `http://localhost:3001/api`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/properties` | GET | List properties (query: `status`, `search`, `limit`, `offset`) |
| `/properties/:id` | GET | Get property by ID |
| `/investments/:address` | GET | Get investments for a wallet address |
| `/user-properties/:address` | GET | Get properties owned by a wallet address |
| `/stats` | GET | Platform statistics |
| `/activities` | GET | Recent platform activities |

## License

MIT
