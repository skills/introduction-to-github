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

| Feature | Description |
|---------|-------------|
| **Merkle Root Anchoring** | Store and verify 32-byte Merkle roots |
| **IPFS CID Storage** | Link off-chain IPFS content to on-chain records |
| **Access Control** | Owner-only functions for administrative operations |
| **Reentrancy Protection** | Guards against reentrancy attacks |
| **Event Logging** | Comprehensive events for manifest lifecycle |

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
npm run deploy:local   # Deploy AnchorManifest to local network
npm run deploy:pfc:local  # Deploy PharaohConsciousnessFusion to local network
```

### Sepolia Testnet
```bash
npm run deploy:sepolia      # Deploy AnchorManifest
npm run deploy:pfc:sepolia  # Deploy PharaohConsciousnessFusion (UUPS Proxy)
```

### Mainnet
```bash
npm run deploy:mainnet      # Deploy AnchorManifest
npm run deploy:pfc:mainnet  # Deploy PharaohConsciousnessFusion (UUPS Proxy)
```

## Contract Verification

After deployment, verify on Etherscan:

```bash
# For standard contracts
npm run verify:sepolia -- <CONTRACT_ADDRESS> <OWNER_ADDRESS>

# For UUPS proxy (verify implementation)
npx hardhat verify --network sepolia <IMPLEMENTATION_ADDRESS>
```

## Usage Examples

### PharaohConsciousnessFusion

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

## License

MIT License - See [LICENSE](../LICENSE) for details.

---

**OmniTech1™** - Building the future of decentralized governance and data integrity.
