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
