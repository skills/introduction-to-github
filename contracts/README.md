# ScrollVerse Ecosystem Smart Contracts

Smart contracts for the ScrollVerse ecosystem including Protocol Registry (Security Layer 2.0) and AnchorManifest.

## Overview

This repository contains the core smart contracts for the ScrollVerse ecosystem:

### ProtocolRegistry (Security Layer 2.0)

The `ProtocolRegistry` contract provides governance-controlled protocol management with:

- **Lifecycle States**: Proposed → Vetted → Approved (with Revoked state)
- **DAO Governance**: `onlyGovernor` modifier for critical operations
- **Metadata Anchoring**: Security review hashes, risk classifications, and audit timestamps
- **Governor Transfer**: Seamless transition from deployer EOA to DAO Timelock Controller

### AnchorManifest

The `AnchorManifest` contract provides immutable on-chain anchoring for off-chain data integrity verification:

- Anchor Merkle roots representing data structures
- Store IPFS Content Identifiers (CIDs) for decentralized storage references
- Verify the integrity of off-chain data against on-chain anchors
- Track and enumerate all anchored manifests

## Contract Features

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
# Local Development
npm run deploy:registry:local

# Sepolia Testnet
npm run deploy:registry:sepolia

# Mainnet
npm run deploy:registry:mainnet
```

### AnchorManifest

```bash
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
# ProtocolRegistry (no constructor args)
npm run verify:sepolia -- <CONTRACT_ADDRESS>

# AnchorManifest
npm run verify:sepolia -- <CONTRACT_ADDRESS> <OWNER_ADDRESS>
```

## Usage

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
const merkleRoot = ethers.keccak256(ethers.toUtf8Bytes("your-data"));
const ipfsCid = "QmYwAPJzv5CZsnAzt8auVZRn7qWPjSXVEWpRJMuAxFpqhT";

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

## License

MIT License - See [LICENSE](../LICENSE) for details.

---

**OmniTech1™** - ScrollVerse Ecosystem - Security Layer 2.0
