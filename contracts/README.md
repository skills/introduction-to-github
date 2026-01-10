## Sovereignty Seal
**Sovereign Chais owns every yield**

---


# ScrollVerse Smart Contracts

Smart contracts powering the ScrollVerse ecosystem, including data anchoring, governance tokens, and NFT fusion mechanisms.

## Contracts Overview

| Contract | Description | Pattern |
|----------|-------------|---------|
| **AnchorManifest** | Merkle root and IPFS CID anchoring | Standard |
| **MirrorToken** | ERC-20 governance token ($MIRROR) | Standard |
| **MirrorTokenVesting** | Team token vesting with cliff | Standard |
| **PharaohConsciousnessFusion** | NFT Fusion Engine with DAO voting power | UUPS Proxy |

---

## PharaohConsciousnessFusion (PFC)

The Fusion Engine NFT contract for the ScrollVerse ecosystem, providing lineage and community members with enhanced voting power in the DAO.

### Features

| Feature | Description |
|---------|-------------|
| **UUPS Upgradeable** | Future-proof proxy pattern for enhancements |
| **ERC721 Enumerable** | On-chain token enumeration |
| **Tiered Voting Power** | 4-tier governance multiplier system |
| **DAO Integration** | Direct integration with ScrollVerse governance |

### Token Tiers & Voting Power

| Tier | Max Supply | Governance Multiplier | Staking APY |
|------|------------|----------------------|-------------|
| Genesis Sovereign | 8 | 8.88x | 23.88% |
| Eternal Guardian | 80 | 4.44x | 16.44% |
| Legacy Bearer | 800 | 2.22x | 12.22% |
| Wisdom Keeper | 8,000 | 1.11x | 9.11% |

**Total Max Supply:** 8,888 tokens

### Deployment

```bash
# Deploy to local network
npm run deploy:pfc:local

# Deploy to Sepolia testnet
npm run deploy:pfc:sepolia

# Deploy to mainnet
npm run deploy:pfc:mainnet
```

### Contract Addresses

#### Sepolia Testnet
- **Network**: Ethereum Sepolia (Chain ID: 11155111)
- **Proxy Address**: *To be deployed*
- **Implementation Address**: *To be deployed*

---

## AnchorManifest

Smart contract for anchoring metadata manifests in the form of Merkle roots and IPFS CIDs on the Ethereum blockchain.

### Features
# ScrollVerse Ecosystem Smart Contracts

Smart contracts for the ScrollVerse ecosystem including Protocol Registry (Security Layer 2.0) and AnchorManifest.
# ScrollVerse Smart Contracts

Smart contracts powering the ScrollVerse ecosystem - a decentralized governance and NFT platform.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Contracts](#contracts)
3. [ScrollVerse Genesis Sequence](#scrollverse-genesis-sequence)
4. [Installation](#installation)
5. [Deployment](#deployment)
6. [Testing](#testing)

---
Smart contracts powering the ScrollVerse ecosystem, including governance, token management, and metadata anchoring.

## Contracts Overview

### ScrollVerseDAO
Governance contract for the ScrollVerse ecosystem, enabling decentralized decision-making through proposal creation, voting, and execution.

**Key Features:**
- Proposal creation with voting (requires 100,000 MIRROR tokens)
- Quorum-based voting (4% of total supply)
- Timelock-controlled execution for security
- Integration with MirrorToken ($MIRROR) for voting power

### MirrorToken ($MIRROR)
ERC-20 governance token with voting capabilities for the ScrollVerse ecosystem.

**Token Distribution:**
- Treasury & DAO: 40% (400,000,000 tokens)
- Consciousness Fusion Rewards: 35% (350,000,000 tokens)
- Foundational Team: 15% (150,000,000 tokens) - locked in vesting
- Pilot Launch & Liquidity: 10% (100,000,000 tokens)

### AnchorManifest
Smart contract for anchoring metadata manifests in the form of Merkle roots and IPFS CIDs on the Ethereum blockchain.

The ScrollVerse ecosystem consists of interconnected smart contracts that enable decentralized governance, token economics, and NFT-based participation. The system is designed for irreversible decentralization once the Genesis Sequence is complete.

---

## Contracts

### ScrollVerseDAO (Step 1.6 - Final)

**The ultimate governing body of the ScrollVerse ecosystem.**

The `ScrollVerseDAO` contract implements OpenZeppelin's Governor pattern with TimelockController integration, providing:

- Decentralized governance with proposal creation and voting
- Timelock-protected execution for security
- Quorum-based voting (4% of total voting power)
- Integration with $MIRROR Token for voting power
- PFC-NFT holder verification for enhanced participation

### MirrorToken ($MIRROR) (Step 1.4)

**ERC-20 governance token with voting capabilities.**

- Fixed supply: 1,000,000,000 MIRROR tokens
- Token distribution: Treasury (40%), Fusion Rewards (35%), Team Vesting (15%), Liquidity (10%)
- ERC20Votes for governance participation
- ERC20Permit for gasless approvals

### PharaohConsciousnessFusion (PFC-NFT) (Step 1.5)

**Sacred NFT collection for ecosystem participation.**

- Maximum supply: 5,000 NFTs
- Consciousness levels: Awakening → Ascending → Transcendent → Divine → Pharaoh
- ERC721Votes for NFT-based voting
- Integrated with ScrollVerseDAO for governance

### MirrorTokenVesting

**Time-locked vesting contract for team tokens.**

This repository contains the core smart contracts for the ScrollVerse ecosystem:

### ProtocolRegistry (Security Layer 2.0)

The `ProtocolRegistry` contract provides governance-controlled protocol management with:

- **Lifecycle States**: Proposed → Vetted → Approved (with Revoked state)
- **DAO Governance**: `onlyGovernor` modifier for critical operations
- **Metadata Anchoring**: Security review hashes, risk classifications, and audit timestamps
- **Governor Transfer**: Seamless transition from deployer EOA to DAO Timelock Controller

### AnchorManifest

The `AnchorManifest` contract provides immutable on-chain anchoring for off-chain data integrity verification:
- 1-year cliff period
- 2-year linear vesting after cliff
- Multi-beneficiary support

### AnchorManifest

The `AnchorManifest` contract provides immutable on-chain anchoring for off-chain data integrity verification.

### ProtocolRegistry

| Feature | Description |
|---------|-------------|
| **Lifecycle Governance** | Multi-step protocol states (Proposed → Vetted → Approved) |
| **DAO-Gated Operations** | Critical operations require governor approval |
| **Security Metadata** | Store security review hashes, risk classes, and audit timestamps |
| **Governor Transfer** | Transfer control to ScrollVerseDAO Timelock Controller |
| **Reentrancy Protection** | Guards against reentrancy attacks |

### AnchorManifest

| Feature | Description |
|---------|-------------|
| **Merkle Root Anchoring** | Store and verify 32-byte Merkle roots |
| **IPFS CID Storage** | Link off-chain IPFS content to on-chain records |
| **Access Control** | Owner-only functions for administrative operations |
| **Reentrancy Protection** | Guards against reentrancy attacks |
| **Event Logging** | Comprehensive events for manifest lifecycle |

## Contract Addresses

### Sepolia Testnet

| Contract | Address | Status |
|----------|---------|--------|
| ProtocolRegistry | *To be deployed* | Pending |
| AnchorManifest | *To be deployed* | Pending |
### ChRaismas Blueprint Contracts

**New: Part of the ChRaismas celebration ecosystem (December 25, 2025)**

#### RAISEToken ($RAISE)
- ERC-20 token with kindness-based reward mechanics
- 100M total supply (90M circulating, 10M charitable pool)
- Configurable reward rates for community contributions
- Transparent charitable fund distribution

#### ChRaismasNFT
- Sacred NFT collection with embedded utility
- Max supply: 10,000 NFTs across 4 tiers
- Voting rights in ScrollVerse DAOs
- IRL exclusive access and perks
- Sacred geometry and universal frequency attributes

#### HollywoodDAO
- Tokenized creative roles and royalty distribution
- NFT-backed quadratic voting system
- Automated royalty payments via smart contracts
- 5 creative tiers: Directors, Producers, Writers, Cast, Crew

📚 **Full Documentation:** See [chraismas/README.md](../chraismas/README.md)

---

## ScrollVerse Genesis Sequence

The Genesis Sequence establishes the ScrollVerse ecosystem in a series of steps:

| Step | Contract | Status | Description |
|------|----------|--------|-------------|
| 1.1 | TimelockController | ✅ | Timelock for secure execution |
| 1.4 | MirrorToken | ✅ | $MIRROR governance token |
| 1.5 | PharaohConsciousnessFusion | ✅ | PFC-NFT collection |
| 1.6 | ScrollVerseDAO | ✅ | Ultimate governing body |

### Hand-Off Sequence

After deploying ScrollVerseDAO (Step 1.6), the Hand-Off Sequence transfers all administrative roles to the DAO:

1. Grant DAO the Proposer and Executor roles on TimelockController
2. Transfer Treasury and Minter roles to the DAO
3. Renounce deployer admin roles
4. Complete irreversible decentralization

---

## Installation

```bash
cd contracts
npm install
```

## Configuration

1. Copy the environment example file:
```bash
cp .env.example .env
```

2. Configure your `.env` file:
```
DEPLOYER_PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://rpc.sepolia.org
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

## Compilation

```bash
npm run compile
```

## Testing

```bash
npm run test
```

## Deployment

### ProtocolRegistry

```bash
npm run node           # Start local node
npm run deploy:local   # Deploy AnchorManifest to local network
npm run deploy:pfc:local  # Deploy PharaohConsciousnessFusion to local network
# Local Development
npm run deploy:registry:local

# Sepolia Testnet
npm run deploy:registry:sepolia

# Mainnet
npm run deploy:registry:mainnet
```

### AnchorManifest

### Deploy ScrollVerse Genesis Sequence
```bash
npm run deploy:sepolia      # Deploy AnchorManifest
npm run deploy:pfc:sepolia  # Deploy PharaohConsciousnessFusion (UUPS Proxy)
# Deploy all contracts and execute hand-off sequence
npx hardhat run scripts/deploy-scrollverse-dao.js --network sepolia
```

### Individual Contract Deployment
```bash
npm run deploy:mainnet      # Deploy AnchorManifest
npm run deploy:pfc:mainnet  # Deploy PharaohConsciousnessFusion (UUPS Proxy)
# Local Development
npm run deploy:local

# Sepolia Testnet
npm run deploy:sepolia

# Mainnet
npm run deploy:mainnet
```

## Contract Verification

After deployment, verify on Etherscan:

```bash
# For standard contracts
# ProtocolRegistry (no constructor args)
npm run verify:sepolia -- <CONTRACT_ADDRESS>

# AnchorManifest
npm run verify:sepolia -- <CONTRACT_ADDRESS> <OWNER_ADDRESS>

# For UUPS proxy (verify implementation)
npx hardhat verify --network sepolia <IMPLEMENTATION_ADDRESS>
```

## Usage Examples

### PharaohConsciousnessFusion
### ProtocolRegistry

#### Proposing a Protocol
```javascript
const protocolId = await protocolRegistry.proposeProtocol(
  "CHXTOKEN",                                           // name
  "0x...",                                              // protocolAddress
  ethers.keccak256(ethers.toUtf8Bytes("review-v1")),   // securityReviewHash
  2                                                     // riskClass (1-5)
);
```

#### Lifecycle Transitions (Governor Only)
```javascript
await protocolRegistry.vetProtocol(protocolId);     // Proposed → Vetted
await protocolRegistry.approveProtocol(protocolId); // Vetted → Approved
await protocolRegistry.revokeProtocol(protocolId);  // Any → Revoked
```

#### Transferring Governance to DAO
```javascript
// After initial bootstrap, transfer to DAO Timelock
await protocolRegistry.transferGovernor(timelockAddress);
```

### AnchorManifest

#### Anchoring a Manifest
```javascript
// Mint a Genesis Sovereign tier token
await pharaohFusion.mint(recipientAddress, 3); // 3 = GenesisSovereign tier

// Get voting power for an address
const votingPower = await pharaohFusion.getVotingPower(holderAddress);

// Get supply information
const supplyInfo = await pharaohFusion.getSupplyInfo();
```

### AnchorManifest

```javascript
const merkleRoot = ethers.keccak256(ethers.toUtf8Bytes("your-data"));
const ipfsCid = "QmYwAPJzv5CZsnAzt8auVZRn7qWPjSXVEWpRJMuAxFpqhT";

const tx = await anchorManifest.anchorManifest(merkleRoot, ipfsCid);
const receipt = await tx.wait();
```

## Contract ABIs

Contract ABIs are generated in `artifacts/` after compilation:
- `artifacts/src/PharaohConsciousnessFusion.sol/PharaohConsciousnessFusion.json`
- `artifacts/src/AnchorManifest.sol/AnchorManifest.json`
- `artifacts/src/MirrorToken.sol/MirrorToken.json`

## Security Considerations

- **PharaohConsciousnessFusion**: Uses UUPS proxy pattern with owner-only upgrade authorization
- **AnchorManifest**: Uses OpenZeppelin's `Ownable` and `ReentrancyGuard`
- All contracts follow secure development practices and OpenZeppelin standards
const tx = await anchorManifest.anchorManifest(merkleRoot, ipfsCid);
const receipt = await tx.wait();
```

#### Verifying a Manifest
```javascript
const isValid = await anchorManifest.verifyMerkleRoot(manifestId, merkleRoot);
```

## Post-Deployment Steps (ProtocolRegistry)

1. **Bootstrap Native Protocols**: Register critical ScrollVerse protocols (e.g., CHXTOKEN)
2. **Vet & Approve**: Complete lifecycle for initial protocols
3. **Transfer Governance**: Call `transferGovernor()` to transfer control to ScrollVerseDAO Timelock Controller

## Security Considerations

- The ProtocolRegistry uses `onlyGovernor` modifier for DAO-gated operations
- Governor transfer is a one-way operation - ensure the new address is correct
- Both contracts use OpenZeppelin's `ReentrancyGuard` for protection
- Risk classifications (1-5) help categorize protocol security levels
The contract ABIs are generated in `artifacts/src/` after compilation.

## Security Considerations

- The contracts use OpenZeppelin's security libraries
- ScrollVerseDAO uses timelock for delayed execution
- Only the owner can use administrative functions
- All manifest data is immutable once anchored (except through owner update)

## Genesis Proposal

The Genesis Proposal inaugurates ScrollVerseDAO governance and allocates strategic resources:

**Title:** The Genesis Proposal: Incentivizing NFT Fusion and Community Engagement

**Description:**
- Officially recognizes the strategic importance of the Omnisovereign VIII and TECHANGEL Sigil NFT sets
- Allocates $MIRROR from the DAO Treasury for:
  - Initial rewards for early NFT holders and participants in fusion events
  - Community engagement and adoption activities aligned with the ScrollVerse ethos

**Execution:**
Upon successful proposal approval, the DAO Treasury will transfer the allocated $MIRROR to a distribution fund. This action validates the core functions of the DAO: Propose, Vote, Queue, and Execute.

### Submitting the Genesis Proposal

```bash
# Set environment variables
export MIRROR_TOKEN_ADDRESS=0x...
export DAO_ADDRESS=0x...
export DISTRIBUTION_FUND_ADDRESS=0x...
export TREASURY_TRANSFER_AMOUNT=10000000000000000000000000  # 10M MIRROR

# Run the submission script
npx hardhat run scripts/submitGenesisProposal.js --network sepolia
```

## License

MIT License - See [LICENSE](../LICENSE) for details.

---

**OmniTech1™** - Building the future of decentralized governance and data integrity.
**OmniTech1™** - ScrollVerse Ecosystem - Security Layer 2.0
