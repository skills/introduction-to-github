# ScrollVerse Smart Contracts

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

The `AnchorManifest` contract provides immutable on-chain anchoring for off-chain data integrity verification. It allows users to:

- Anchor Merkle roots representing data structures
- Store IPFS Content Identifiers (CIDs) for decentralized storage references
- Verify the integrity of off-chain data against on-chain anchors
- Track and enumerate all anchored manifests

## Contract Features

| Feature | Description |
|---------|-------------|
| **Merkle Root Anchoring** | Store and verify 32-byte Merkle roots |
| **IPFS CID Storage** | Link off-chain IPFS content to on-chain records |
| **Access Control** | Owner-only functions for administrative operations |
| **Reentrancy Protection** | Guards against reentrancy attacks |
| **Event Logging** | Comprehensive events for manifest lifecycle |

## Contract Address

### Sepolia Testnet
- **Network**: Ethereum Sepolia Testnet (Chain ID: 11155111)
- **Contract**: AnchorManifest
- **Address**: *To be deployed*
- **Etherscan**: https://sepolia.etherscan.io/address/*CONTRACT_ADDRESS*

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

### Sepolia Testnet
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

**OmniTech1™** - Building the future of decentralized data integrity.
