# 🚀 ScrollVerse Ecosystem Deployment Guide

This guide provides comprehensive instructions for deploying and activating the full ScrollVerse ecosystem.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Component Deployment](#component-deployment)
4. [Payment Integration](#payment-integration)
5. [NFT Minting Setup](#nft-minting-setup)
6. [Unified Launch](#unified-launch)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Overview

The ScrollVerse ecosystem consists of four primary components:

| Component | Description | Technology |
|-----------|-------------|------------|
| **Sovereign TV** | Live broadcast platform with global CDN | Node.js, Express |
| **FlameDNA NFT** | ERC-721 NFT collection | Solidity, Hardhat |
| **Payment Gateway** | Stripe & PayPal integration | Node.js |
| **ScrollVerse Portfolio** | Web interface with minting UI | Flask, Python |

---

## Prerequisites

### System Requirements

- Node.js 18+
- Python 3.11+
- npm or yarn
- Git

### Environment Variables

Create `.env` files for each component:

#### Sovereign TV (`sovereign-tv-app/.env`)
```env
PORT=3000
NODE_ENV=production
JWT_SECRET=your-jwt-secret
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLIC_KEY=pk_live_xxx
PAYPAL_CLIENT_ID=xxx
PAYPAL_CLIENT_SECRET=xxx
```

#### FlameDNA NFT (`flamedna-nft/.env`)
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/xxx
MAINNET_RPC_URL=https://mainnet.infura.io/v3/xxx
PRIVATE_KEY=your-deployer-private-key
ETHERSCAN_API_KEY=xxx
BASE_URI=ipfs://QmScrollVerseFlameDNA/
```

---

## Component Deployment

### 1. Sovereign TV Deployment

```bash
cd sovereign-tv-app

# Install dependencies
npm ci

# Run tests
npm test

# Build
npm run build

# Start production server
npm start
```

#### CI/CD Pipeline

The Sovereign TV deployment is automated via GitHub Actions:

- **Trigger**: Push to `main` branch or manual dispatch
- **Stages**: Lint → Test → Build → Deploy Staging → Deploy Production
- **CDN Regions**: US-East, US-West, EU-Central, Asia-East, Africa-South, LATAM-South

### 2. FlameDNA NFT Deployment

```bash
cd flamedna-nft

# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to Testnet
npm run deploy:testnet

# Deploy to Mainnet (after thorough testing)
npm run deploy:mainnet
```

#### Contract Verification

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> "<OWNER_ADDRESS>" "<BASE_URI>"
```

### 3. ScrollVerse Portfolio Deployment

```bash
cd scrollverse-portfolio

# Install dependencies
pip install -r requirements.txt

# Run development server
python app.py

# Production deployment with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

---

## Payment Integration

### Stripe Setup

1. **Create Stripe Account**: Sign up at [stripe.com](https://stripe.com)

2. **Get API Keys**: Dashboard → Developers → API Keys

3. **Configure Webhooks**:
   - Endpoint: `https://your-domain.com/api/payments/webhook/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.failed`

4. **Test with Test Mode**: Use `pk_test_` and `sk_test_` keys first

### PayPal Setup

1. **Create PayPal Developer Account**: [developer.paypal.com](https://developer.paypal.com)

2. **Create App**: Dashboard → My Apps & Credentials → Create App

3. **Get Credentials**: Copy Client ID and Secret

4. **Configure Webhooks**:
   - Endpoint: `https://your-domain.com/api/payments/webhook/paypal`
   - Events: `PAYMENT.CAPTURE.COMPLETED`

### PCI Compliance

The payment system is designed for **PCI-DSS SAQ-A** compliance:

- ✅ No card data stored on server
- ✅ Tokenized card processing via Stripe/PayPal
- ✅ TLS 1.3 encryption for all communications
- ✅ Secure webhook verification

---

## NFT Minting Setup

### FlameDNA Contract Features

| Feature | Description |
|---------|-------------|
| **Max Supply** | 10,000 tokens |
| **Mint Price** | 0.05 ETH |
| **Rarity System** | Common (50%), Rare (30%), Epic (13%), Legendary (6%), Divine (1%) |
| **Batch Minting** | Up to 10 tokens per transaction |

### Integration with ScrollVerse

1. **Deploy Contract**: Get contract address from deployment
2. **Update Environment**: Add contract address to Sovereign TV config
3. **Configure Portfolio**: Update minting interface with contract details

### Minting Flow

```
User → Portfolio UI → MetaMask → FlameDNA Contract → Token Minted
                                       ↓
                             Sovereign TV NFT Gating
```

---

## Unified Launch

### GitHub Actions Workflow

Trigger the unified ecosystem launch:

1. Go to **Actions** tab in GitHub
2. Select **ScrollVerse Ecosystem Launch**
3. Click **Run workflow**
4. Choose components and environment
5. Monitor deployment progress

### Manual Launch Sequence

```bash
# Phase 1: Infrastructure
./scripts/verify-dependencies.sh

# Phase 2: Deploy Components
cd sovereign-tv-app && npm start &
cd flamedna-nft && npm run deploy:mainnet
cd scrollverse-portfolio && gunicorn -w 4 app:app &

# Phase 3: Verify Integration
curl http://localhost:3000/health
curl http://localhost:5000/api/health

# Phase 4: Activate Production
./scripts/enable-production.sh
```

---

## Monitoring & Maintenance

### Health Checks

| Endpoint | Component | Expected Response |
|----------|-----------|-------------------|
| `/health` | Sovereign TV | `{"status": "operational"}` |
| `/api/health` | Portfolio | `{"status": "operational"}` |
| `/api/payments/compliance` | Payment Gateway | PCI compliance status |

### Metrics & Analytics

Access analytics dashboard:
- **Endpoint**: `/api/analytics/dashboard`
- **Metrics**: User engagement, revenue, content performance

### Broadcast Network Status

Check broadcast network:
- **Endpoint**: `/api/broadcast/status`
- **Coverage**: 99.5% global
- **Dominance**: 98.5% ScrollVerse

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Payment failed | Check Stripe/PayPal webhook logs |
| NFT minting error | Verify contract deployed and funded |
| CDN latency | Check edge server status |
| Auth failures | Verify JWT secret configuration |

---

## Security Considerations

1. **Never commit secrets** - Use environment variables
2. **Rotate keys regularly** - Update API keys quarterly
3. **Monitor for anomalies** - Set up alerting
4. **Keep dependencies updated** - Run `npm audit` regularly

---

## Support

- **GitHub Issues**: [introduction-to-github/issues](https://github.com/chaishillomnitech1/introduction-to-github/issues)
- **Documentation**: See `/docs` folder in each component
- **Email**: support@omniverse.io

---

**Created by Chais Hill - OmniTech1**

*"Truth is Currency. Sacred Logic is Code. Remembrance is the Gateway."*
