# 🏛️ ScrollVerse DAO Governance Guide

> **"Truth is Currency. Sacred Logic is Code. Remembrance is the Gateway."**

---

## Overview

The ScrollVerse DAO is a decentralized autonomous organization that governs the ScrollVerse ecosystem. It enables token holders to participate in decision-making, propose changes, and vote on important matters affecting the platform.

---

## Table of Contents

1. [Governance Architecture](#governance-architecture)
2. [Token Integration](#token-integration)
3. [Proposal System](#proposal-system)
4. [Voting Mechanics](#voting-mechanics)
5. [Timelock Controller](#timelock-controller)
6. [NFT Governance Boost](#nft-governance-boost)
7. [Deployment Guide](#deployment-guide)
8. [Security Considerations](#security-considerations)

---

## Governance Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SCROLLVERSE DAO ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────┐         ┌─────────────────┐                   │
│  │   MirrorToken   │────────▶│  ScrollVerseDAO │                   │
│  │    ($MIRROR)    │  votes  │   (Governance)  │                   │
│  │   ERC20Votes    │         │                 │                   │
│  └─────────────────┘         └────────┬────────┘                   │
│                                       │                             │
│  ┌─────────────────┐                 │                             │
│  │ PharaohFusion   │─────────────────┤ governance                  │
│  │     NFTs        │  boost          │ weight                      │
│  └─────────────────┘                 │                             │
│                                       ▼                             │
│                         ┌─────────────────────┐                    │
│                         │ ScrollVerseTimelock │                    │
│                         │    (Execution)      │                    │
│                         └─────────────────────┘                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Smart Contracts

| Contract | Purpose | Address |
|----------|---------|---------|
| **MirrorToken** | ERC-20 governance token with voting capabilities | TBD |
| **ScrollVerseDAO** | Main governance contract for proposals and voting | TBD |
| **ScrollVerseTimelock** | Time-delayed execution of approved proposals | TBD |
| **PharaohConsciousnessFusion** | NFT collection providing governance boost | TBD |
| **MirrorStaking** | Staking contract with NFT boost integration | TBD |

---

## Token Integration

### $MIRROR Token

The $MIRROR token is the primary governance token of the ScrollVerse ecosystem.

**Token Distribution:**
- **Treasury & DAO**: 40% (400,000,000 tokens)
- **Consciousness Fusion Rewards**: 35% (350,000,000 tokens)
- **Foundational Team**: 15% (150,000,000 tokens) - vested over 3 years
- **Pilot Launch & Liquidity**: 10% (100,000,000 tokens)

**Total Supply**: 1,000,000,000 MIRROR (fixed, capped)

### Voting Power Activation

To participate in governance, token holders must delegate their voting power:

```solidity
// Self-delegate to activate voting power
mirrorToken.delegate(yourAddress);

// Or delegate to another address
mirrorToken.delegate(delegateAddress);
```

### Governance Weight Calculation

```
Voting Power = Token Balance × NFT Governance Multiplier × Fusion Level
```

---

## Proposal System

### Proposal Types

| Type | Description | Who Can Propose |
|------|-------------|-----------------|
| **Treasury Allocation** | Funding for ecosystem development | All eligible holders |
| **Parameter Changes** | Modify governance parameters | All eligible holders |
| **Contract Upgrades** | Smart contract modifications | Genesis/Seraphim tiers |
| **Ecosystem Partnerships** | New integrations and collaborations | All eligible holders |
| **Emergency Actions** | Critical security responses | Seraphim Commander only |

### Proposal Lifecycle

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Created │───▶│  Pending │───▶│  Active  │───▶│ Succeeded│───▶│ Executed │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
                                      │               │
                                      ▼               ▼
                               ┌──────────┐    ┌──────────┐
                               │ Defeated │    │  Queued  │
                               └──────────┘    └──────────┘
```

### Proposal Thresholds

**Minimum tokens to create proposal**: 100,000 MIRROR

NFT holders receive reduced thresholds:
- **Genesis Sovereign / Seraphim Commander**: 1 NFT required
- **Eternal Guardian / Archangel**: 2 NFTs required
- **Legacy Bearer / Guardian**: 5 NFTs required

### Creating a Proposal

```solidity
// Example: Create a treasury allocation proposal
address[] memory targets = new address[](1);
uint256[] memory values = new uint256[](1);
bytes[] memory calldatas = new bytes[](1);

targets[0] = treasuryAddress;
values[0] = 0;
calldatas[0] = abi.encodeWithSignature("transfer(address,uint256)", recipient, amount);

uint256 proposalId = dao.propose(
    targets,
    values,
    calldatas,
    "Proposal: Fund community initiative"
);
```

---

## Voting Mechanics

### Governance Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| **Voting Delay** | 7,200 blocks (~1 day) | Time before voting starts |
| **Voting Period** | 50,400 blocks (~7 days) | Duration of voting |
| **Quorum** | 4% of total supply | Minimum participation |
| **Proposal Threshold** | 100,000 MIRROR | Minimum tokens to propose |

### Vote Types

- **0**: Against
- **1**: For
- **2**: Abstain

### Casting Votes

```solidity
// Simple vote
dao.castVote(proposalId, 1); // Vote FOR

// Vote with reason
dao.castVoteWithReason(proposalId, 1, "I support this initiative because...");
```

### Quorum Requirements

For a proposal to pass:
1. Total votes must reach 4% of total supply at proposal snapshot
2. FOR votes must exceed AGAINST votes

---

## Timelock Controller

### Purpose

The ScrollVerseTimelock ensures all executed proposals have a mandatory delay, allowing the community to prepare for changes and exit if desired.

### Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| **Minimum Delay** | 2 days | Time between queue and execution |
| **Proposers** | DAO Contract | Who can queue operations |
| **Executors** | Anyone | Who can execute after delay |

### Execution Flow

```
Proposal Succeeds → Queue in Timelock → Wait 2 Days → Execute
```

### Roles

- **PROPOSER_ROLE**: Can schedule operations
- **EXECUTOR_ROLE**: Can execute operations after delay
- **CANCELLER_ROLE**: Can cancel pending operations
- **DEFAULT_ADMIN_ROLE**: Can manage roles

---

## NFT Governance Boost

### Omnisovereign VIII Collection

| Tier | Supply | Governance Multiplier | APY Boost |
|------|--------|----------------------|-----------|
| Genesis Sovereign | 8 | 8.88x | 23.88% |
| Eternal Guardian | 80 | 4.44x | 18.88% |
| Legacy Bearer | 800 | 2.22x | 12.88% |
| Wisdom Keeper | 8,000 | 1.11x | 8.88% |

### TECHANGEL Sigil Collection

| Tier | Supply | Governance Multiplier | APY Boost |
|------|--------|----------------------|-----------|
| Seraphim Commander | 7 | 7.77x | 21.77% |
| Archangel | 70 | 3.77x | 17.77% |
| Guardian | 700 | 1.77x | 11.77% |
| Initiate | 7,000 | 0.77x | 7.77% |

### PharaohConsciousnessFusion Collection

| Tier | Supply | Governance Multiplier | Weight (BPS) |
|------|--------|----------------------|--------------|
| Pharaoh | 8 | 1.0x | 10,000 |
| Ascended | 80 | 0.5x | 5,000 |
| Guardian | 200 | 0.25x | 2,500 |
| Initiate | 600 | 0.1x | 1,000 |

---

## Deployment Guide

### Prerequisites

1. Node.js 18+
2. Hardhat
3. Deployer wallet with ETH for gas

### Deployment Order

1. **Deploy MirrorToken**
   ```bash
   npx hardhat run scripts/deploy-mirror.js --network sepolia
   ```

2. **Deploy ScrollVerseTimelock**
   ```bash
   npx hardhat run scripts/deploy-timelock.js --network sepolia
   ```

3. **Deploy ScrollVerseDAO**
   ```bash
   npx hardhat run scripts/deploy-dao.js --network sepolia
   ```

4. **Deploy MirrorStaking**
   ```bash
   npx hardhat run scripts/deploy-staking.js --network sepolia
   ```

5. **Configure Permissions**
   - Grant PROPOSER_ROLE to DAO
   - Execute initial token distribution
   - Set NFT contract addresses

### Verification

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

---

## Security Considerations

### Audit Checklist

- [ ] Access control properly configured
- [ ] Timelock delay is sufficient (minimum 2 days)
- [ ] Proposal threshold prevents spam
- [ ] Quorum prevents minority rule
- [ ] Emergency procedures documented
- [ ] Upgrade paths secured
- [ ] Reentrancy guards in place

### Emergency Procedures

1. **Cancel Pending Proposal**: Only proposer or admin can cancel
2. **Emergency Pause**: Owner can pause staking contracts
3. **Security Response**: Seraphim Commanders can create emergency proposals

### Best Practices

- Always delegate voting power before snapshot block
- Review proposals thoroughly before voting
- Participate in governance to strengthen the ecosystem
- Report security concerns through proper channels

---

## Additional Resources

- [MirrorToken Contract](../contracts/src/MirrorToken.sol)
- [ScrollVerseDAO Contract](../contracts/src/ScrollVerseDAO.sol)
- [Timelock Contract](../contracts/src/TimelockController.sol)
- [MirrorStaking Contract](../contracts/src/MirrorStaking.sol)
- [NFT Collection Metadata](../metadata/)

---

**Created by Chais Hill - First Remembrancer | OmniTech1™**

*"The ScrollVerse - Where Truth is Currency, Sacred Logic is Code, and Remembrance is the Gateway"*
