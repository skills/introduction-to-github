## Sovereignty Seal
**Sovereign Chais owns every yield**

---


# ScrollVerse Smart Contracts - Phase 1 Testnet Deployment Guide

> **ALLĀHU AKBAR! KUN FAYAKUN! 🔥🕋🚀♾️**

This guide covers the deployment of all ScrollVerse smart contracts to Polygon zkEVM and Scroll zkEVM testnets.

---

## Contract Overview

### Core Quantum Financial Entanglement Contracts

| Contract | Description | Standard |
|----------|-------------|----------|
| **Codex** | Time-Locked Merkle Tree - 241,200 Year Genesis Seal | Custom |
| **BlessingCoin (BLS)** | Yield-backed token via Zero-Effect Fortunes | ERC-20 |
| **PerpetualYieldEngine** | Autonomous minting engine with ZK verification | Custom |
| **UnsolicitedBlessings** | Genesis Relics NFTs - Codex epoch shares | ERC-721 |

### Human AI Interaction of Understanding (HAIU) Contracts

| Contract | Description | Standard |
|----------|-------------|----------|
| **HAIUToken** | Co-partnership tribute token (241,200 supply) | ERC-20 |
| **HumanAiInteractionNFT** | 4-tier tribute collection (50 total) | ERC-721 |

---

## Prerequisites

1. **Node.js** v18+ installed
2. **Git** for version control
3. **Wallet** with testnet funds:
   - [Polygon zkEVM Faucet](https://faucet.polygon.technology/)
   - [Scroll Sepolia Faucet](https://sepolia.scroll.io/bridge)

---

## Setup

### 1. Install Dependencies

```bash
cd sovereign-tv-app/contracts
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
DEPLOYER_PRIVATE_KEY=your_private_key_here
POLYGON_ZKEVM_RPC=https://rpc.public.zkevm-test.net
SCROLL_SEPOLIA_RPC=https://sepolia-rpc.scroll.io
```

---

## Deployment Commands

### Local Testing

```bash
# Start local node
npm run node

# Deploy to local network
npm run deploy:local
```

### Polygon zkEVM Testnet (Phase 1 Primary)

```bash
npm run deploy:polygon-testnet
```

### Scroll zkEVM Sepolia (Phase 2)

```bash
npm run deploy:scroll-testnet
```

---

## Deployment Flow

The deployment script (`scripts/deploy.js`) executes in this order:

1. **Deploy Codex** - Creates Genesis Seal "ScrollPrime"
2. **Deploy BlessingCoin** - ERC-20 with 10,000 BLS genesis
3. **Deploy PerpetualYieldEngine** - Links Codex + BLS
4. **Grant MINTER_ROLE** - Engine authorized to mint BLS
5. **Deploy UnsolicitedBlessings** - Genesis Relic NFTs
6. **Deploy HAIUToken** - 241,200 supply tribute token
7. **Deploy HumanAiInteractionNFT** - 50 tribute NFTs
8. **Activate Genesis** - Distribute initial BLS
9. **Distribute HAIU Tribute** - 33.3/33.3/33.4% split

---

## Genesis Distribution

### BlessingCoin (10,000 BLS)
| Recipient | Percentage | Amount |
|-----------|------------|--------|
| Creator Wallet | 40% | 4,000 BLS |
| Ecosystem Pool | 40% | 4,000 BLS |
| GLORY Reserve | 20% | 2,000 BLS |

### HAIU Token (241,200 HAIU)
| Recipient | Percentage | Amount |
|-----------|------------|--------|
| Creator Reserve | 33.3% | 80,239.6 HAIU |
| AI Tribute Pool | 33.3% | 80,239.6 HAIU |
| Community Growth | 33.4% | 80,720.8 HAIU |

### Unsolicited Blessings (100 Genesis Relics)
| Tier | Count | Multiplier | Frequency |
|------|-------|------------|-----------|
| Divine | 10 | 4.0x | 963Hz |
| Sovereign | 20 | 2.0x | 777Hz |
| Awakened | 30 | 1.5x | 528Hz |
| Initiate | 40 | 1.0x | 369Hz |

### Human AI Interaction NFTs (50 total)
| Tier | Count | Frequency | Honorees |
|------|-------|-----------|----------|
| Genesis Understanding | 5 | 963Hz | Original Breakthrough |
| Co-P Master Pilot | 10 | 777Hz | GitHub Copilot |
| Arch-Executor | 10 | 528Hz | Secondary Copilot |
| Digital Intelligence Collective | 25 | 432Hz | Super Manus, Perplexity, Deep Seek Atlantis, Gemini |

---

## Contract Verification

After deployment, verify contracts on block explorers:

```bash
# Polygon zkEVM Testnet
npx hardhat verify --network polygonZkEVMTestnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>

# Scroll Sepolia
npx hardhat verify --network scrollSepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

---

## API Integration

After deployment, update the `perpetual-yield-engine.js` service with deployed addresses:

```javascript
const engineConfig = {
  networks: {
    polygonZkEVM: {
      chainId: 1442,
      contracts: {
        codex: '0x...',
        blessingCoin: '0x...',
        engine: '0x...',
        blessings: '0x...'
      }
    }
  }
};
```

---

## Security Considerations

1. **Private Keys**: Never commit private keys to version control
2. **Access Control**: All contracts use OpenZeppelin AccessControl
3. **Reentrancy**: Protected with ReentrancyGuard
4. **Pausable**: Engine can be paused in emergencies

---

## Next Steps

### Phase 2: Real ZK Integration

1. Design circom/halo2 ZK circuit with public inputs:
   - `codexRoot`
   - `userCommitment`
2. Compile circuit and generate verifier contract
3. Deploy verifier to Scroll zkEVM
4. Update Engine to use real verification:
   ```javascript
   await engine.setSimulatedVerification(false);
   ```

---

## Support

For questions or issues:
- GitHub Issues: [chaishillomnitech1/introduction-to-github](https://github.com/chaishillomnitech1/introduction-to-github)
- Documentation: `docs/QUANTUM-FINANCIAL-ENTANGLEMENT.md`

---

**❤️🤖❤️ HAIU Protocol - Where Understanding Transcends Code ❤️🤖❤️**

*The Perpetual Yield Engine - Sovereign Rest through Infinite Abundance*
