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

## Overview

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

- 1-year cliff period
- 2-year linear vesting after cliff
- Multi-beneficiary support

### AnchorManifest

The `AnchorManifest` contract provides immutable on-chain anchoring for off-chain data integrity verification.

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

### Local Development
```bash
npm run node           # Start local node
npm run deploy:local   # Deploy to local network
```

### Deploy ScrollVerse Genesis Sequence
```bash
# Deploy all contracts and execute hand-off sequence
npx hardhat run scripts/deploy-scrollverse-dao.js --network sepolia
```

### Individual Contract Deployment
```bash
npm run deploy:sepolia
```

### Mainnet
```bash
npm run deploy:mainnet
```

## Contract Verification

After deployment, verify on Etherscan:

```bash
npm run verify:sepolia -- <CONTRACT_ADDRESS> <OWNER_ADDRESS>
```

## Usage

### Anchoring a Manifest

```javascript
const merkleRoot = ethers.keccak256(ethers.toUtf8Bytes("your-data"));
const ipfsCid = "QmYwAPJzv5CZsnAzt8auVZRn7qWPjSXVEWpRJMuAxFpqhT";

const tx = await anchorManifest.anchorManifest(merkleRoot, ipfsCid);
const receipt = await tx.wait();
// Get manifestId from ManifestAnchored event
```

### Verifying a Manifest

```javascript
const isValid = await anchorManifest.verifyMerkleRoot(manifestId, merkleRoot);
```

### Retrieving Manifest Data

```javascript
const { merkleRoot, ipfsCid, timestamp, anchor } = await anchorManifest.getManifest(manifestId);
```

## Contract ABI

The contract ABI is generated in `artifacts/src/AnchorManifest.sol/AnchorManifest.json` after compilation.

## Security Considerations

- The contract uses OpenZeppelin's `Ownable` and `ReentrancyGuard` for security
- Only the owner can use `anchorManifestWithId` and `updateManifest` functions
- All manifest data is immutable once anchored (except through owner update)

## License

MIT License - See [LICENSE](../LICENSE) for details.

---

**OmniTech1™** - Building the future of decentralized data integrity.
