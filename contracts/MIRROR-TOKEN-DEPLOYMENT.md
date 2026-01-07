# $MIRROR Token Deployment Guide

## 44:Omni Genesis Sequence - ScrollVerse Economic Foundation

This document provides step-by-step instructions for deploying the $MIRROR token (ERC-20 Votes) contract, establishing the currency for the ScrollVerse digital ecosystem.

## Token Specifications

| Property | Value |
|----------|-------|
| **Name** | Mirror Token |
| **Symbol** | MIRROR |
| **Decimals** | 18 |
| **Total Supply** | 1,000,000,000 (1 Billion) |
| **Supply Type** | Fixed/Capped |

### Token Features

- **ERC20Votes**: Governance voting power delegation
- **ERC20Permit**: Gasless approval signatures (EIP-2612)
- **ERC20Capped**: Fixed supply ceiling - no additional minting
- **Ownable**: Access-controlled administrative functions

### Token Distribution

| Allocation | Percentage | Amount |
|------------|------------|--------|
| Treasury & DAO | 40% | 400,000,000 MIRROR |
| Consciousness Fusion Rewards | 35% | 350,000,000 MIRROR |
| Foundational Team (Vesting) | 15% | 150,000,000 MIRROR |
| Pilot Launch & Liquidity | 10% | 100,000,000 MIRROR |

## Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **ETH** for gas fees (Sepolia testnet or Mainnet)
4. **Etherscan API Key** for contract verification
5. **RPC URL** (e.g., from Alchemy, Infura, or public RPC)

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

```bash
# Wallet Configuration
DEPLOYER_PRIVATE_KEY=your_wallet_private_key_without_0x

# Network Configuration
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Verification
ETHERSCAN_API_KEY=your_etherscan_api_key
```

> ⚠️ **Security**: Never commit your `.env` file or share your private key!

## Deployment Process

### Phase 1: Deploy MirrorToken Contract

#### Compile the Contract

```bash
npm run compile
```

#### Run Tests (Recommended)

```bash
npm run test
```

#### Deploy to Sepolia Testnet

```bash
npm run deploy:mirror:sepolia
```

#### Deploy to Mainnet

```bash
npm run deploy:mirror:mainnet
```

The deployment script will output:
- Contract address
- Token specifications
- Allocation amounts
- Verification instructions

### Phase 2: Execute Initial Distribution

After deployment, the contract holds no tokens. Execute the initial distribution to mint and allocate the full supply.

#### Option A: Temporary Holding Mode (Recommended for Genesis)

Mint all tokens to a single temporary holding address for controlled distribution:

```bash
# Set the deployed contract address and holding address
export MIRROR_TOKEN_ADDRESS=0xYourDeployedContractAddress
export TEMPORARY_HOLDING_ADDRESS=0xYourTemporaryHoldingAddress

# Execute distribution
npm run distribute:mirror:sepolia
```

This approach:
- Mints 1 billion tokens to a single address
- Allows for controlled, staged distribution
- Provides flexibility for governance decisions

#### Option B: Multi-Address Direct Distribution

Distribute tokens directly to final allocation addresses:

```bash
# Set the deployed contract address
export MIRROR_TOKEN_ADDRESS=0xYourDeployedContractAddress

# Set allocation addresses
export TREASURY_ADDRESS=0xYourTreasuryAddress
export FUSION_REWARDS_ADDRESS=0xYourFusionRewardsAddress
export TEAM_VESTING_ADDRESS=0xYourTeamVestingContractAddress
export LIQUIDITY_ADDRESS=0xYourLiquidityAddress

# Execute distribution
npm run distribute:mirror:sepolia
```

### Phase 3: Verify on Etherscan

After deployment, verify the contract source code:

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <OWNER_ADDRESS>
```

Example:
```bash
npx hardhat verify --network sepolia 0x1234...abcd 0xYourDeployerAddress
```

## Post-Deployment Checklist

- [ ] Contract deployed successfully
- [ ] Initial distribution executed
- [ ] Contract verified on Etherscan
- [ ] Deployment info saved to `deployments/` directory
- [ ] Distribution info saved to `deployments/` directory
- [ ] Allocation addresses documented
- [ ] Team vesting contract set up (if using multi-address mode)

## Contract Functions

### Owner Functions

```solidity
// Execute initial token distribution (can only be called once)
function executeInitialDistribution(
    address _treasuryAddress,
    address _fusionRewardsAddress,
    address _teamVestingAddress,
    address _liquidityAddress
) external onlyOwner
```

### Governance Functions

```solidity
// Delegate voting power
function delegateVotingPower(address delegatee) external

// Get current voting power
function getVotingPower(address account) external view returns (uint256)

// Get historical voting power
function getPastVotingPower(address account, uint256 blockNumber) external view returns (uint256)
```

### View Functions

```solidity
// Check if supply has reached cap
function isSupplyCapped() external view returns (bool)

// Get all allocation addresses
function getAllocationAddresses() external view returns (
    address treasury,
    address fusionRewards,
    address teamVesting,
    address liquidity
)

// Get all allocation amounts
function getAllocationAmounts() external pure returns (
    uint256 treasuryAmount,
    uint256 fusionRewardsAmount,
    uint256 teamAmount,
    uint256 liquidityAmount
)
```

## Interacting with the Contract

### Using Hardhat Console

```bash
npx hardhat console --network sepolia
```

```javascript
// Connect to deployed contract
const MirrorToken = await ethers.getContractFactory("MirrorToken");
const mirror = MirrorToken.attach("0xYourContractAddress");

// Check basic info
console.log("Name:", await mirror.name());
console.log("Total Supply:", ethers.formatEther(await mirror.totalSupply()));

// Check voting power
console.log("Voting Power:", ethers.formatEther(await mirror.getVotes("0xYourAddress")));

// Delegate voting power to yourself
await mirror.delegate("0xYourAddress");
```

### Using Ethers.js

```javascript
const { ethers } = require("ethers");
const abi = require("./artifacts/src/MirrorToken.sol/MirrorToken.json").abi;

const provider = new ethers.JsonRpcProvider("YOUR_RPC_URL");
const signer = new ethers.Wallet("YOUR_PRIVATE_KEY", provider);
const contract = new ethers.Contract("CONTRACT_ADDRESS", abi, signer);

// Read data
const totalSupply = await contract.totalSupply();
console.log("Total Supply:", ethers.formatEther(totalSupply));

// Transfer tokens
await contract.transfer("0xRecipient", ethers.parseEther("1000"));

// Delegate voting power
await contract.delegate("0xDelegatee");
```

## Troubleshooting

### Common Issues

1. **Insufficient funds**: Ensure your wallet has enough ETH for gas
2. **Network issues**: Try a different RPC provider
3. **Verification fails**: Wait a few minutes after deployment before verifying
4. **Distribution reverts**: Check that you are the contract owner
5. **Already distributed**: Initial distribution can only be executed once

### Getting Test ETH

- [Sepolia PoW Faucet](https://sepolia-faucet.pk910.de/)
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)

## Gas Estimates

| Function | Estimated Gas |
|----------|---------------|
| Deploy | ~2,500,000 |
| executeInitialDistribution | ~300,000 |
| transfer | ~65,000 |
| delegate | ~100,000 |
| approve | ~46,000 |

## Security Considerations

- The contract uses OpenZeppelin's audited implementations
- Fixed supply prevents inflation attacks
- ERC20Votes uses checkpointing for historical vote queries
- Owner functions are protected by Ownable access control
- Reentrancy protection not needed for standard ERC20 operations

## Contract Addresses

### Sepolia Testnet
- **Network**: Ethereum Sepolia Testnet (Chain ID: 11155111)
- **Contract**: MirrorToken ($MIRROR)
- **Address**: *Deployed via 44:Omni Genesis Sequence*
- **Etherscan**: https://sepolia.etherscan.io/address/*CONTRACT_ADDRESS*

### Mainnet
- **Network**: Ethereum Mainnet (Chain ID: 1)
- **Contract**: MirrorToken ($MIRROR)
- **Address**: *To be deployed*
- **Etherscan**: https://etherscan.io/address/*CONTRACT_ADDRESS*

---

## 44:Omni Genesis Sequence

The $MIRROR token deployment establishes the economic foundation of the ScrollVerse digital ecosystem:

- **Governance**: ERC20Votes enables decentralized decision-making
- **Staking**: Token holders can stake for ecosystem participation
- **Financial Flows**: Native currency for all ScrollVerse transactions

Once deployed, $MIRROR becomes the bedrock of ScrollVerse's economic system.

---

**OmniTech1™** - Building the ScrollVerse Future
