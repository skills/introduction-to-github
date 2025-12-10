# FlameDNA NFT

ERC-721 NFT Collection for the ScrollVerse Ecosystem.

## Overview

FlameDNA NFTs grant holders access to:
- Exclusive ScrollVerse content
- Sovereign TV premium features
- Community governance rights
- Rarity-based benefits

## Rarity Distribution

| Rarity | Probability | Benefits |
|--------|-------------|----------|
| Common | 50% | Basic access |
| Rare | 30% | Premium streaming |
| Epic | 13% | Early access + Premium |
| Legendary | 6% | All Premium + Governance |
| Divine | 1% | All benefits + Exclusive |

## Setup

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm test
```

## Deployment

### Testnet (Sepolia)

```bash
# Set up environment
cp .env.example .env
# Edit .env with your keys

# Deploy to Sepolia
npm run deploy:testnet
```

### Mainnet

```bash
# Ensure thorough testing is complete
npm test

# Deploy to Mainnet
npm run deploy:mainnet
```

## Contract Interaction

### Minting

```javascript
// Single mint (0.05 ETH)
await flameDNA.mint({ value: ethers.parseEther("0.05") });

// Batch mint (up to 10)
await flameDNA.batchMint(5, { value: ethers.parseEther("0.25") });
```

### Checking Rarity

```javascript
const rarity = await flameDNA.tokenRarity(tokenId);
console.log(`Token ${tokenId} rarity: ${rarity}`);
```

## Integration with ScrollVerse

The FlameDNA contract integrates with:
- **Sovereign TV App**: NFT verification for premium access
- **ScrollVerse Portfolio**: Front-end minting interface
- **Payment Gateway**: ETH payments for minting

## Security

- Pausable for emergency stops
- Owner-controlled minting for airdrops
- Reentrancy protection via OpenZeppelin
- Input validation on all functions

## License

MIT - Chais Hill / OmniTech1
# FlameDNA NFT Collection

Production-ready ERC-721 smart contracts for the FlameDNA NFT collection with OpenSea integration.

## Contracts

### PromiseLandNFT
Main collection contract with tiered minting (Genesis, Founding Supporter, Public).

**Features:**
- ERC-721 with Enumerable, URIStorage, and Royalty extensions
- Three-tier minting system with allowlists
- Configurable mint prices per tier
- ERC-2981 royalty support (OpenSea compatible)
- ReentrancyGuard protection
- Owner minting for airdrops/reserves

### FlameDNAGenesis
Soulbound Genesis collection for founding members.

**Features:**
- Soulbound (non-transferable) tokens
- DNA metadata (frequency, element, tier)
- Sacred frequency validation (369Hz, 432Hz, 528Hz, 777Hz, 963Hz)
- Element types (Fire, Water, Earth, Air, Ether)
- Batch minting for airdrops

## Networks

| Network | Chain ID | RPC |
|---------|----------|-----|
| Scroll Sepolia (Testnet) | 534351 | https://sepolia-rpc.scroll.io/ |
| Scroll Mainnet | 534352 | https://rpc.scroll.io/ |
| Ethereum Sepolia | 11155111 | https://sepolia.infura.io/v3/... |
| Ethereum Mainnet | 1 | https://mainnet.infura.io/v3/... |

## Deployment

### Prerequisites
```bash
npm install
cp .env.example .env
# Edit .env with your configuration
```

### Scroll Testnet
```bash
npm run deploy:scroll-testnet
```

### Scroll Mainnet / Ethereum Mainnet
```bash
npm run deploy:scroll-mainnet
# or
npm run deploy:mainnet
```

### Verify Contract
```bash
npx hardhat verify --network scrollSepolia CONTRACT_ADDRESS "PromiseLand NFT" "PROMISE" "ipfs://..." "ipfs://..." "0x..." 500
```

## Testing
```bash
npm test
npm run test:coverage
```

## OpenSea Integration

### Contract-Level Metadata
Set `contractURI()` to return a JSON file with collection metadata:
```json
{
  "name": "PromiseLand NFT Collection",
  "description": "...",
  "image": "ipfs://...",
  "seller_fee_basis_points": 500,
  "fee_recipient": "0x..."
}
```

### Token Metadata
Each token URI returns OpenSea-compatible metadata:
```json
{
  "name": "PromiseLand Genesis #1",
  "description": "...",
  "image": "ipfs://...",
  "attributes": [
    {"trait_type": "Tier", "value": "Genesis"},
    {"trait_type": "Frequency", "value": "963Hz"}
  ]
}
```

## Subscription Tiers

| Tier | Max Supply | Mint Price | ScrollCoin/mo | NFT Discount |
|------|------------|------------|---------------|--------------|
| Genesis | 1,000 | 0.1 ETH | 2,000 SCR | 50% |
| Founding Supporter | 3,000 | 0.05 ETH | 500 SCR | 25% |
| Public | 6,000 | 0.03 ETH | 100 SCR | 10% |

## Security

- All contracts use OpenZeppelin's audited implementations
- ReentrancyGuard on all mint and withdraw functions
- Ownable access control for admin functions
- No external calls in critical paths

## License

MIT License - See [LICENSE](LICENSE)

## Author

Chais Hill - OmniTech1
