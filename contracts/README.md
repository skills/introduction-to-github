# AnchorManifest Smart Contract

Smart contract for anchoring metadata manifests in the form of Merkle roots and IPFS CIDs on the Ethereum blockchain.

## Overview

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

The contract ABI is generated in `artifacts/src/AnchorManifest.sol/AnchorManifest.json` after compilation.

## Security Considerations

- The contract uses OpenZeppelin's `Ownable` and `ReentrancyGuard` for security
- Only the owner can use `anchorManifestWithId` and `updateManifest` functions
- All manifest data is immutable once anchored (except through owner update)

## License

MIT License - See [LICENSE](../LICENSE) for details.

---

**OmniTech1™** - Building the future of decentralized data integrity.
