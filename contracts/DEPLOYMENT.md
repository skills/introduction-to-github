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

**OmniTech1™** - Decentralized Data Integrity
