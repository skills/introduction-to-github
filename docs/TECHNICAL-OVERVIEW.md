# 🔧 ScrollVerse Technical Overview

> **Comprehensive Technical Documentation for Developers and Auditors**

---

## Executive Summary

The ScrollVerse ecosystem is a comprehensive Web3 platform combining decentralized governance, DeFi primitives, NFT collections, and streaming services. This document provides a technical overview of all smart contracts, architecture decisions, and integration patterns.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Smart Contract Suite](#smart-contract-suite)
3. [Token Economics](#token-economics)
4. [Governance System](#governance-system)
5. [Staking Mechanisms](#staking-mechanisms)
6. [NFT Contracts](#nft-contracts)
7. [Security Model](#security-model)
8. [Deployment Procedures](#deployment-procedures)
9. [Audit Considerations](#audit-considerations)

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SCROLLVERSE SYSTEM ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                          FRONTEND LAYER                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│   │
│  │  │ Sovereign TV│  │  Portfolio  │  │  Governance │  │   Staking   ││   │
│  │  │   (React)   │  │   (Flask)   │  │    (React)  │  │   (React)   ││   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘│   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                          API LAYER                                   │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│   │
│  │  │   Auth API  │  │ Streaming   │  │   NFT API   │  │ Payment API ││   │
│  │  │   (JWT)     │  │    API      │  │             │  │  (Stripe)   ││   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘│   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       BLOCKCHAIN LAYER                               │   │
│  │                                                                      │   │
│  │   ┌──────────────────────────────────────────────────────────────┐ │   │
│  │   │                    ETHEREUM MAINNET                           │ │   │
│  │   │                                                               │ │   │
│  │   │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐│ │   │
│  │   │  │MirrorToken │ │ScrollVerse │ │  Timelock  │ │   Mirror   ││ │   │
│  │   │  │  (ERC-20)  │ │    DAO     │ │ Controller │ │  Staking   ││ │   │
│  │   │  └────────────┘ └────────────┘ └────────────┘ └────────────┘│ │   │
│  │   │                                                               │ │   │
│  │   │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐│ │   │
│  │   │  │Omnisov VIII│ │ TECHANGEL  │ │  Pharaoh   │ │  Vesting   ││ │   │
│  │   │  │  (ERC-721) │ │  (ERC-721) │ │  (ERC-721) │ │  Contract  ││ │   │
│  │   │  └────────────┘ └────────────┘ └────────────┘ └────────────┘│ │   │
│  │   │                                                               │ │   │
│  │   └──────────────────────────────────────────────────────────────┘ │   │
│  │                              │                                      │   │
│  │                    ┌─────────┴─────────┐                           │   │
│  │                    │   LayerZero OFT   │                           │   │
│  │                    └─────────┬─────────┘                           │   │
│  │                              │                                      │   │
│  │   ┌──────────────────────────┼───────────────────────────────────┐ │   │
│  │   │                          │                                    │ │   │
│  │   │  ┌─────────┐  ┌─────────┴─────────┐  ┌─────────┐  ┌─────────┐│ │   │
│  │   │  │ Polygon │  │     Optimism      │  │   Base  │  │Arbitrum ││ │   │
│  │   │  └─────────┘  └───────────────────┘  └─────────┘  └─────────┘│ │   │
│  │   │                    L2 NETWORKS                                │ │   │
│  │   └──────────────────────────────────────────────────────────────┘ │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Smart Contracts | Solidity 0.8.20 | On-chain logic |
| Contract Framework | Hardhat | Development & testing |
| Base Contracts | OpenZeppelin v5.x | Security standards |
| Frontend | React/Next.js | User interfaces |
| Backend | Node.js/Express | API services |
| Database | PostgreSQL | Off-chain data |
| IPFS | Pinata/Infura | Metadata storage |
| RPC | Alchemy/Infura | Blockchain access |

---

## Smart Contract Suite

### Contract Inventory

| Contract | File | Purpose | Dependencies |
|----------|------|---------|--------------|
| MirrorToken | `MirrorToken.sol` | ERC-20 governance token | ERC20, ERC20Votes, ERC20Capped |
| MirrorTokenVesting | `MirrorTokenVesting.sol` | Team token vesting | SafeERC20, Ownable |
| ScrollVerseDAO | `ScrollVerseDAO.sol` | Governance | ERC20Votes, Ownable |
| ScrollVerseTimelock | `TimelockController.sol` | Execution delay | TimelockController |
| MirrorStaking | `MirrorStaking.sol` | Token staking | SafeERC20, Pausable |
| PharaohConsciousnessFusion | `PharaohConsciousnessFusion.sol` | NFT collection | ERC721Enumerable |
| AnchorManifest | `AnchorManifest.sol` | Metadata anchoring | Ownable |

### Contract Relationships

```
MirrorToken ──────────────────┐
     │                        │
     │ voting power           │ tokens
     ▼                        ▼
ScrollVerseDAO ───────▶ ScrollVerseTimelock
     │                        │
     │ governance             │ execution
     ▼                        ▼
MirrorStaking ◀───────── Treasury
     │
     │ boost
     ▼
PharaohConsciousnessFusion
```

---

## Token Economics

### MirrorToken Contract

**File**: `contracts/src/MirrorToken.sol`

**Inheritance Chain**:
```
ERC20 → ERC20Capped → ERC20Permit → ERC20Votes → Ownable
```

**Key Constants**:
```solidity
uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;
uint256 public constant TREASURY_DAO_ALLOCATION = 400_000_000 * 10**18;
uint256 public constant FUSION_REWARDS_ALLOCATION = 350_000_000 * 10**18;
uint256 public constant TEAM_ALLOCATION = 150_000_000 * 10**18;
uint256 public constant LIQUIDITY_ALLOCATION = 100_000_000 * 10**18;
```

**Key Functions**:
```solidity
function executeInitialDistribution(
    address _treasuryAddress,
    address _fusionRewardsAddress,
    address _teamVestingAddress,
    address _liquidityAddress
) external onlyOwner;

function delegateVotingPower(address delegatee) external;
function getVotingPower(address account) external view returns (uint256);
function getPastVotingPower(address account, uint256 blockNumber) external view returns (uint256);
```

### Vesting Contract

**File**: `contracts/src/MirrorTokenVesting.sol`

**Schedule**:
- Cliff: 1 year
- Vesting: 2 years (linear after cliff)
- Total: 3 years

**Key Functions**:
```solidity
function addBeneficiary(address _beneficiary, uint256 _allocation) external onlyOwner;
function addBeneficiariesBatch(address[] calldata _beneficiaries, uint256[] calldata _allocations) external onlyOwner;
function claim() external nonReentrant;
function getVestedAmount(address _beneficiary) external view returns (uint256);
function getClaimableAmount(address _beneficiary) external view returns (uint256);
```

---

## Governance System

### ScrollVerseDAO Contract

**File**: `contracts/src/ScrollVerseDAO.sol`

**Configuration Parameters**:
```solidity
uint256 public constant DEFAULT_VOTING_DELAY = 7200;        // ~1 day
uint256 public constant DEFAULT_VOTING_PERIOD = 50400;      // ~7 days
uint256 public constant DEFAULT_PROPOSAL_THRESHOLD = 100_000 * 10**18;
uint256 public constant DEFAULT_QUORUM_BPS = 400;           // 4%
```

**Proposal Lifecycle**:
```
create → Pending → Active → Succeeded/Defeated → Executed/Expired
                     ↓
                  Canceled
```

**State Enum**:
```solidity
enum ProposalState {
    Pending,    // 0
    Active,     // 1
    Canceled,   // 2
    Defeated,   // 3
    Succeeded,  // 4
    Queued,     // 5
    Expired,    // 6
    Executed    // 7
}
```

**Key Functions**:
```solidity
function propose(
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    string memory description
) external returns (uint256);

function castVote(uint256 proposalId, uint8 support) external;
function castVoteWithReason(uint256 proposalId, uint8 support, string calldata reason) external;
function cancel(uint256 proposalId) external;
function execute(uint256 proposalId) external payable;
function state(uint256 proposalId) public view returns (ProposalState);
```

### Timelock Controller

**File**: `contracts/src/TimelockController.sol`

**Inherits**: `@openzeppelin/contracts/governance/TimelockController.sol`

**Roles**:
- `PROPOSER_ROLE`: Can schedule operations
- `EXECUTOR_ROLE`: Can execute operations
- `CANCELLER_ROLE`: Can cancel operations
- `DEFAULT_ADMIN_ROLE`: Can manage roles

---

## Staking Mechanisms

### MirrorStaking Contract

**File**: `contracts/src/MirrorStaking.sol`

**Constants**:
```solidity
uint256 public constant BASE_REWARD_RATE = 800;         // 8% APY in BPS
uint256 public constant BPS_DENOMINATOR = 10000;
uint256 public constant SECONDS_PER_YEAR = 365 days;
uint256 public constant MIN_STAKE_AMOUNT = 1 * 10**18;  // 1 MIRROR
```

**Lock Periods**:
```solidity
// Index 0: 30 days, 25% bonus (2500 BPS)
// Index 1: 90 days, 50% bonus (5000 BPS)
// Index 2: 180 days, 100% bonus (10000 BPS)
// Index 3: 365 days, 200% bonus (20000 BPS)
```

**Reward Calculation**:
```solidity
Base Reward = (stakeAmount * BASE_REWARD_RATE * duration) / (SECONDS_PER_YEAR * BPS_DENOMINATOR)
Lock Bonus = Base Reward * lockBonusBps / BPS_DENOMINATOR
NFT Boost = Base Reward * nftBoostMultiplier / BPS_DENOMINATOR
Total Reward = Base Reward + Lock Bonus + NFT Boost
```

**Key Functions**:
```solidity
function stake(uint256 amount, uint256 lockPeriodIndex) external;
function unstake() external;
function claimRewards() external;
function emergencyWithdraw() external;
function pendingRewards(address user) external view returns (uint256);
function calculateAPY(uint256 lockPeriodIndex, bool hasNft, uint256 nftCount) external view returns (uint256);
```

---

## NFT Contracts

### PharaohConsciousnessFusion

**File**: `contracts/src/PharaohConsciousnessFusion.sol`

**Inheritance**:
```
ERC721 → ERC721Enumerable → ERC721URIStorage → ERC721Pausable → Ownable → ReentrancyGuard
```

**Tier System**:
```solidity
enum Tier { None, Initiate, Guardian, Ascended, Pharaoh }

// Supply limits
uint256 public constant PHARAOH_SUPPLY = 8;
uint256 public constant ASCENDED_SUPPLY = 80;
uint256 public constant GUARDIAN_SUPPLY = 200;
uint256 public constant INITIATE_SUPPLY = 600;

// Governance weights (basis points)
uint256 public constant PHARAOH_WEIGHT = 10000;   // 1x boost
uint256 public constant ASCENDED_WEIGHT = 5000;   // 0.5x boost
uint256 public constant GUARDIAN_WEIGHT = 2500;   // 0.25x boost
uint256 public constant INITIATE_WEIGHT = 1000;   // 0.1x boost
```

**Key Functions**:
```solidity
function mint(address to, Tier tier, string calldata consciousnessSignature, string calldata tokenURI) external onlyOwner;
function batchMint(address[] calldata recipients, Tier[] calldata tiers, string[] calldata signatures, string[] calldata tokenURIs) external onlyOwner;
function publicMint(Tier tier, string calldata consciousnessSignature) external payable;
function stake(uint256 tokenId) external;  // Only staking contract
function unstake(uint256 tokenId) external;  // Only staking contract
function getGovernanceWeight(address holder) external view returns (uint256);
function upgradeFusionLevel(uint256 tokenId) external;
```

---

## Security Model

### Access Control Matrix

| Function | Owner | User | Staking | DAO |
|----------|-------|------|---------|-----|
| Initial Distribution | ✅ | ❌ | ❌ | ❌ |
| Create Proposal | ❌ | ✅* | ❌ | ❌ |
| Vote | ❌ | ✅ | ❌ | ❌ |
| Execute Proposal | ❌ | ❌ | ❌ | ✅ |
| Add Rewards | ✅ | ❌ | ❌ | ❌ |
| Emergency Pause | ✅ | ❌ | ❌ | ❌ |
| Stake/Unstake | ❌ | ✅ | ❌ | ❌ |
| Mint NFT | ✅ | ✅** | ❌ | ❌ |

*Requires meeting proposal threshold
**Requires public mint enabled or whitelist

### Security Patterns Used

1. **ReentrancyGuard**: All state-changing functions
2. **SafeERC20**: All token transfers
3. **Pausable**: Emergency stop capability
4. **Access Control**: Role-based permissions
5. **Checks-Effects-Interactions**: State changes before external calls

### Known Considerations

1. **Voting Power Delegation**: Users must delegate before snapshot block
2. **Lock Period Enforcement**: Early unstaking is blocked, not penalized
3. **NFT Staking**: Staked NFTs cannot be transferred
4. **Timelock Delay**: Minimum 2 days for governance execution

---

## Deployment Procedures

### Deployment Order

1. **MirrorToken**
   - Deploy with owner address
   - Record contract address

2. **MirrorTokenVesting**
   - Deploy with MirrorToken address and owner
   - Add beneficiaries
   - Finalize allocations

3. **ScrollVerseTimelock**
   - Deploy with min delay (172800 seconds = 2 days)
   - Proposers: [DAO address (to be set)]
   - Executors: [address(0)] (anyone can execute)
   - Admin: owner address

4. **ScrollVerseDAO**
   - Deploy with MirrorToken, Timelock, and owner
   - Grant PROPOSER_ROLE to DAO

5. **MirrorStaking**
   - Deploy with MirrorToken as both staking and reward token
   - Add rewards to pool

6. **PharaohConsciousnessFusion**
   - Deploy with owner and base URI
   - Set staking contract address
   - Set DAO contract address

7. **Execute Initial Distribution**
   - Call MirrorToken.executeInitialDistribution()
   - Verify all balances

### Verification Commands

```bash
# Verify MirrorToken
npx hardhat verify --network sepolia <MIRROR_ADDRESS> <OWNER_ADDRESS>

# Verify DAO
npx hardhat verify --network sepolia <DAO_ADDRESS> <MIRROR_ADDRESS> <TIMELOCK_ADDRESS> <OWNER_ADDRESS>

# Verify Staking
npx hardhat verify --network sepolia <STAKING_ADDRESS> <MIRROR_ADDRESS> <MIRROR_ADDRESS> <OWNER_ADDRESS>
```

---

## Audit Considerations

### High Priority Items

1. **Token Distribution Logic**
   - Verify allocation percentages
   - Check for arithmetic overflow
   - Ensure single execution

2. **Governance Security**
   - Quorum calculation
   - Proposal threshold enforcement
   - Vote counting accuracy

3. **Staking Rewards**
   - Reward calculation accuracy
   - Sufficient reward pool
   - Emergency withdrawal safety

4. **NFT Minting**
   - Supply limit enforcement
   - Tier distribution accuracy
   - Payment handling

### Testing Requirements

| Category | Minimum Coverage |
|----------|-----------------|
| Unit Tests | 90% |
| Integration Tests | 80% |
| Fuzz Testing | Critical paths |
| Invariant Tests | Core properties |

### Gas Optimization Notes

- Batch operations use arrays efficiently
- State variables are packed where possible
- Events use indexed parameters judiciously
- View functions minimize storage reads

---

## Appendix

### Contract Addresses (To Be Updated)

| Contract | Sepolia | Mainnet |
|----------|---------|---------|
| MirrorToken | TBD | TBD |
| MirrorTokenVesting | TBD | TBD |
| ScrollVerseDAO | TBD | TBD |
| ScrollVerseTimelock | TBD | TBD |
| MirrorStaking | TBD | TBD |
| PharaohConsciousnessFusion | TBD | TBD |

### External Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| @openzeppelin/contracts | 5.x | Base contracts |
| hardhat | 2.19.x | Development |
| @nomicfoundation/hardhat-toolbox | 4.x | Testing tools |

### Contact Information

- **Security Issues**: security@omniverse.io
- **Technical Questions**: dev@omniverse.io
- **GitHub**: github.com/chaishillomnitech1/introduction-to-github

---

**Created by Chais Hill - First Remembrancer | OmniTech1™**

*Last Updated: December 2025*
