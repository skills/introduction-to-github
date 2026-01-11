# AnchorManifest Deployment Guide

This document provides step-by-step instructions for deploying the AnchorManifest contract to the Sepolia testnet.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Sepolia ETH** for gas fees (get from [Sepolia Faucet](https://sepoliafaucet.com/))
4. **Etherscan API Key** for contract verification
5. **RPC URL** for Sepolia (e.g., from Alchemy, Infura, or public RPC)

## Setup

### 1. Install Dependencies

```bash
cd contracts
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:
```
DEPLOYER_PRIVATE_KEY=your_wallet_private_key_without_0x
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
ETHERSCAN_API_KEY=your_etherscan_api_key
```

> ⚠️ **Security**: Never commit your `.env` file or share your private key!

## Deployment Steps

### Step 1: Compile the Contract

```bash
npm run compile
```

Expected output:
```
Compiled 1 Solidity file successfully
```

### Step 2: Run Tests (Optional but Recommended)

```bash
npm run test
```

### Step 3: Deploy to Sepolia

```bash
npm run deploy:sepolia
```

The script will output:
- Contract address
- Owner address
- Transaction hash
- Etherscan link

Example output:
```
============================================================
AnchorManifest Deployment Script
============================================================

Deployer address: 0x...
Deployer balance: 0.1 ETH
Network: sepolia (Chain ID: 11155111)

------------------------------------------------------------
Deploying AnchorManifest contract...
------------------------------------------------------------

✅ AnchorManifest deployed successfully!
Contract address: 0x...

============================================================
DEPLOYMENT SUMMARY
============================================================

Network: sepolia (Chain ID: 11155111)
Contract: AnchorManifest
Address: 0x...
Owner: 0x...

View on Sepolia Etherscan:
https://sepolia.etherscan.io/address/0x...
```

### Step 4: Verify on Etherscan

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <OWNER_ADDRESS>
```

Replace:
- `<CONTRACT_ADDRESS>` with your deployed contract address
- `<OWNER_ADDRESS>` with your deployer wallet address

## Post-Deployment

### Update Repository Documentation

After deployment, update the following files with the contract address:

1. **contracts/README.md** - Update the contract address section
2. **contracts/deployments/sepolia-11155111.json** - Automatically created by deploy script

### Example Deployment Record

```json
{
  "network": "sepolia",
  "chainId": "11155111",
  "contract": "AnchorManifest",
  "address": "0x...",
  "owner": "0x...",
  "deployedAt": "2024-01-01T00:00:00.000Z",
  "deployer": "0x...",
  "constructorArgs": ["0x..."],
  "verified": true,
  "etherscanUrl": "https://sepolia.etherscan.io/address/0x..."
}
```

## Interacting with the Contract

### Using Hardhat Console

```bash
npx hardhat console --network sepolia
```

```javascript
const AnchorManifest = await ethers.getContractFactory("AnchorManifest");
const contract = AnchorManifest.attach("0x..."); // deployed address

// Anchor a manifest
const merkleRoot = ethers.keccak256(ethers.toUtf8Bytes("my-data"));
const ipfsCid = "QmYwAPJzv5CZsnAzt8auVZRn7qWPjSXVEWpRJMuAxFpqhT";
const tx = await contract.anchorManifest(merkleRoot, ipfsCid);
await tx.wait();
```

### Using Ethers.js

```javascript
const { ethers } = require("ethers");
const abi = require("./artifacts/src/AnchorManifest.sol/AnchorManifest.json").abi;

const provider = new ethers.JsonRpcProvider("YOUR_SEPOLIA_RPC_URL");
const signer = new ethers.Wallet("YOUR_PRIVATE_KEY", provider);
const contract = new ethers.Contract("CONTRACT_ADDRESS", abi, signer);

// Read manifest count
const count = await contract.totalManifests();
console.log("Total manifests:", count.toString());
```

## Troubleshooting

### Common Issues

1. **Insufficient funds**: Ensure your wallet has enough Sepolia ETH for gas
2. **Network issues**: Try a different RPC provider
3. **Verification fails**: Wait a few minutes after deployment before verifying

### Getting Sepolia ETH

- [Sepolia PoW Faucet](https://sepolia-faucet.pk910.de/)
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)

## Gas Estimates

| Function | Estimated Gas |
|----------|---------------|
| Deploy | ~600,000 |
| anchorManifest | ~80,000 |
| updateManifest | ~50,000 |

---

# ScrollVerse Genesis Sequence - TimelockController Deployment

## Phase 1, Step 1.1: TimelockController Deployment

This section provides instructions for deploying the TimelockController contract as part of the ScrollVerse Genesis Sequence.

### Overview

The TimelockController deployment creates the foundation for the ScrollVerse ecosystem's governance structure:

| Component | Description |
|-----------|-------------|
| **TimelockController** | OpenZeppelin's timelocked governance controller |
| **ScrollVerseDAO** | DAO contract serving as proposer and executor |
| **Minimum Delay** | 48 hours (172800 seconds) |

### Security Configuration

- **Proposer Role**: ScrollVerseDAO (sole proposer)
- **Executor Role**: ScrollVerseDAO (sole executor)
- **Canceller Role**: ScrollVerseDAO (granted with proposer)
- **Admin Role**: Deployer (temporary, should be renounced)

### Deployment Commands

#### Local Development

```bash
npm run deploy:timelock:local
```

#### Sepolia Testnet

```bash
npm run deploy:timelock:sepolia
```

#### Mainnet

```bash
npm run deploy:timelock:mainnet
```

### Deployment Output

The script will deploy two contracts:

1. **ScrollVerseDAO** - DAO governance contract
2. **TimelockController** - Timelocked controller with 48-hour delay

Example output:
```
======================================================================
ScrollVerse Genesis Sequence - Phase 1, Step 1.1
TimelockController Deployment
======================================================================

Step 1: Deploying ScrollVerseDAO contract...
✅ ScrollVerseDAO deployed successfully!
ScrollVerseDAO address: 0x...

Step 2: Deploying TimelockController...
TimelockController Configuration:
  - Minimum delay: 172800 seconds (48 hours)
  - Proposer: 0x... (ScrollVerseDAO)
  - Executor: 0x... (ScrollVerseDAO)
  - Admin: 0x... (temporary)

✅ TimelockController deployed successfully!
TimelockController address: 0x...

Step 3: Linking ScrollVerseDAO to TimelockController...
✅ ScrollVerseDAO linked to TimelockController!

Role Assignments (ScrollVerseDAO):
  - PROPOSER_ROLE: ✅ Granted
  - EXECUTOR_ROLE: ✅ Granted
  - CANCELLER_ROLE: ✅ Granted

======================================================================
ScrollVerse Genesis Sequence - Phase 1, Step 1.1 COMPLETE
======================================================================
```

### Contract Verification

After deployment, verify both contracts on Etherscan:

```bash
# Verify ScrollVerseDAO
npx hardhat verify --network sepolia <DAO_ADDRESS> <OWNER_ADDRESS>

# Verify TimelockController
npx hardhat verify --network sepolia <TIMELOCK_ADDRESS> 172800 "[<DAO_ADDRESS>]" "[<DAO_ADDRESS>]" <ADMIN_ADDRESS>
```

### Post-Deployment Security

⚠️ **Important**: After initial setup is complete, the admin role should be renounced to ensure true decentralization. This can be done through a timelocked proposal.

### Deployment Record

The deployment script automatically saves deployment info to:
- `./deployments/timelock-<network>-<chainId>.json`

Example:
```json
{
  "phase": "Phase 1",
  "step": "Step 1.1",
  "name": "ScrollVerse Genesis Sequence - TimelockController Deployment",
  "network": "sepolia",
  "chainId": "11155111",
  "contracts": {
    "ScrollVerseDAO": {
      "address": "0x...",
      "owner": "0x..."
    },
    "TimelockController": {
      "address": "0x...",
      "minDelay": 172800,
      "minDelayHours": 48,
      "proposers": ["0x..."],
      "executors": ["0x..."]
    }
  },
  "deployedAt": "2024-01-01T00:00:00.000Z",
  "deployer": "0x..."
}
```

### Gas Estimates (TimelockController)

| Contract/Function | Estimated Gas |
|-------------------|---------------|
| ScrollVerseDAO Deploy | ~500,000 |
| TimelockController Deploy | ~1,500,000 |
| setTimelockController | ~50,000 |

---

**OmniTech1™** - Decentralized Data Integrity

---

# MirrorTokenVesting Deployment Guide

This section provides instructions for deploying the MirrorTokenVesting contract to secure the Foundational Team's $MIRROR token allocation.

## Vesting Specifications

- **Contract:** MirrorTokenVesting.sol
- **Token Vesting Supply:** 150,000,000 $MIRROR tokens
- **Cliff Period:** 1 year (tokens are locked)
- **Vesting Period:** 2 years (linear release after cliff)
- **Total Duration:** 3 years

## Deployment Process

### Part A: Vesting Contract Deployment

Deploy the vesting contract and configure beneficiaries:

```bash
# Set the MIRROR token address (after MirrorToken is deployed)
export MIRROR_TOKEN_ADDRESS=0x...

# Deploy the vesting contract
npm run deploy:vesting:sepolia
```

Or run directly:
```bash
npx hardhat run scripts/deploy-vesting.js --network sepolia
```

**Before deployment, update the beneficiary configuration in `scripts/deploy-vesting.js`:**

```javascript
const TEAM_BENEFICIARIES = [
  {
    name: "Team Member 1",
    address: "0x...", // Replace with actual wallet address
    allocation: ethers.parseEther("50000000"), // 50M tokens
  },
  // Add more beneficiaries...
];
```

The script will:
1. Deploy the MirrorTokenVesting contract
2. Add all configured beneficiaries with their allocations
3. Finalize the allocations (preventing further modifications)

### Part B: Token Transfer to Vesting Contract

After deployment, transfer the 150M tokens to the vesting contract:

```bash
# Set both environment variables
export MIRROR_TOKEN_ADDRESS=0x...
export VESTING_CONTRACT_ADDRESS=0x...  # From Part A output

# Run the transfer script
npx hardhat run scripts/transfer-to-vesting.js --network sepolia
```

This locks the team's token supply in the vesting contract.

## Vesting Schedule

After deployment:

| Period | Duration | Token Availability |
|--------|----------|-------------------|
| Cliff | Year 0-1 | 0% (fully locked) |
| Vesting | Year 1-3 | Linear unlock (0-100%) |
| Complete | After Year 3 | 100% claimable |

## Beneficiary Actions

After the cliff period, beneficiaries can claim their vested tokens:

```javascript
// Connect to the vesting contract
const vestingContract = await ethers.getContractAt(
  "MirrorTokenVesting",
  "VESTING_CONTRACT_ADDRESS"
);

// Check claimable amount
const claimable = await vestingContract.getClaimableAmount(beneficiaryAddress);

// Claim vested tokens (as beneficiary)
await vestingContract.claim();
```

## View Functions

Check vesting status:

```javascript
// Get vesting schedule status
const status = await vestingContract.getVestingScheduleStatus();
console.log("Cliff Reached:", status.isCliffReached);
console.log("Vesting Complete:", status.isVestingComplete);
console.log("Percentage Vested:", status.percentageVested.toString() + "%");

// Get beneficiary info
const info = await vestingContract.getBeneficiaryVestingInfo(beneficiaryAddress);
console.log("Total Allocation:", ethers.formatEther(info.totalAllocation));
console.log("Vested Amount:", ethers.formatEther(info.vestedAmount));
console.log("Claimable:", ethers.formatEther(info.claimableAmount));
```

## Verification

After deployment, verify the contracts on Etherscan:

```bash
# Verify vesting contract
npx hardhat verify --network sepolia <VESTING_CONTRACT_ADDRESS> <MIRROR_TOKEN_ADDRESS> <OWNER_ADDRESS>
```

## Gas Estimates

| Function | Estimated Gas |
|----------|---------------|
| Deploy | ~1,200,000 |
| addBeneficiary | ~100,000 |
| addBeneficiariesBatch (10) | ~600,000 |
| finalize | ~50,000 |
| claim | ~80,000 |
| emergencyWithdraw | ~60,000 |

## Security Considerations

1. **Finalization is permanent** - Once finalized, no more beneficiaries can be added
2. **Vesting start is immutable** - Set at contract deployment time
3. **Emergency withdrawal** - Only owner can use in emergency situations
4. **ReentrancyGuard** - Protects against reentrancy attacks

---

**OmniTech1™** - ScrollVerse Ecosystem
