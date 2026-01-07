# Service Tracking - Real-Time Lightworker Contribution System

## Overview

The Service Tracking system provides blockchain-based infrastructure for quantifying, auditing, and rewarding lightworker contributions to the ScrollVerse ecosystem in real-time with complete transparency.

## Purpose

Service Tracking creates a verifiable, immutable record of:
- **Community Contributions**: Uploads, content creation, moderation
- **Attunements**: Energy work, healing sessions, spiritual guidance
- **Community Service**: Teaching, mentoring, support activities
- **DAO Participation**: Governance, proposals, voting
- **Economic Activity**: Transactions, staking, liquidity provision

## Core Components

### 1. Contribution Tracking Infrastructure

```javascript
// ServiceTracker.js - Core tracking system
class ServiceTracker {
  constructor(blockchainProvider) {
    this.provider = blockchainProvider;
    this.metricsEngine = new MetricsEngine();
    this.rewardCalculator = new RewardCalculator();
  }
  
  /**
   * Record a service contribution on-chain
   */
  async recordContribution(contribution) {
    const validatedData = await this.validateContribution(contribution);
    
    const record = {
      contributorAddress: validatedData.address,
      contributionType: validatedData.type,
      timestamp: Date.now(),
      impactScore: this.calculateImpact(validatedData),
      verificationHash: this.generateHash(validatedData),
      metadata: validatedData.metadata
    };
    
    // Store on blockchain for immutability
    const txHash = await this.storeOnChain(record);
    
    // Update real-time metrics
    await this.metricsEngine.updateMetrics(record);
    
    // Calculate and distribute rewards
    await this.processRewards(record);
    
    return {
      recordId: txHash,
      impactScore: record.impactScore,
      rewardsEarned: await this.rewardCalculator.estimate(record)
    };
  }
  
  /**
   * Calculate impact score based on contribution type and quality
   */
  calculateImpact(contribution) {
    const baseScore = this.getBaseScore(contribution.type);
    const qualityMultiplier = this.assessQuality(contribution);
    const timeliness = this.getTimelinessBonus(contribution);
    const communityBonus = this.getCommunityReactions(contribution);
    
    return baseScore * qualityMultiplier * (1 + timeliness + communityBonus);
  }
}
```

### 2. Smart Contract Architecture

```solidity
// LightworkerServiceRegistry.sol
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title LightworkerServiceRegistry
 * @notice On-chain registry for tracking and rewarding lightworker contributions
 */
contract LightworkerServiceRegistry is Ownable, ReentrancyGuard {
    
    struct ServiceRecord {
        address lightworker;
        ServiceType serviceType;
        uint256 timestamp;
        uint256 impactScore;
        bytes32 verificationHash;
        bool verified;
        uint256 rewardAmount;
    }
    
    enum ServiceType {
        CONTENT_CREATION,
        HEALING_SESSION,
        COMMUNITY_MODERATION,
        TEACHING,
        GOVERNANCE_PARTICIPATION,
        TECHNICAL_CONTRIBUTION,
        ATTUNEMENT_SESSION,
        EVENT_HOSTING
    }
    
    mapping(address => ServiceRecord[]) public serviceHistory;
    mapping(address => uint256) public totalImpactScore;
    mapping(address => uint256) public totalRewardsEarned;
    
    event ServiceRecorded(
        address indexed lightworker,
        ServiceType indexed serviceType,
        uint256 impactScore,
        uint256 timestamp
    );
    
    event RewardDistributed(
        address indexed lightworker,
        uint256 amount,
        uint256 totalEarned
    );
    
    /**
     * @notice Record a new service contribution
     */
    function recordService(
        address lightworker,
        ServiceType serviceType,
        uint256 impactScore,
        bytes32 verificationHash
    ) external onlyOwner returns (uint256) {
        ServiceRecord memory newRecord = ServiceRecord({
            lightworker: lightworker,
            serviceType: serviceType,
            timestamp: block.timestamp,
            impactScore: impactScore,
            verificationHash: verificationHash,
            verified: false,
            rewardAmount: 0
        });
        
        serviceHistory[lightworker].push(newRecord);
        totalImpactScore[lightworker] += impactScore;
        
        emit ServiceRecorded(lightworker, serviceType, impactScore, block.timestamp);
        
        return serviceHistory[lightworker].length - 1;
    }
    
    /**
     * @notice Get lightworker's complete service history
     */
    function getServiceHistory(address lightworker) 
        external 
        view 
        returns (ServiceRecord[] memory) 
    {
        return serviceHistory[lightworker];
    }
    
    /**
     * @notice Calculate real-time ranking
     */
    function getLightworkerRank(address lightworker) 
        external 
        view 
        returns (uint256 rank, uint256 score) 
    {
        score = totalImpactScore[lightworker];
        // Rank calculation logic would compare against all lightworkers
        return (rank, score);
    }
}
```

## Contribution Types & Scoring

### Content Creation (Base Score: 10-100)
- **Blog Posts**: 50 points
- **Video Content**: 75 points
- **Artwork/NFTs**: 100 points
- **Documentation**: 40 points
- **Tutorials**: 60 points

### Healing & Attunements (Base Score: 25-200)
- **Individual Session**: 50 points
- **Group Healing**: 150 points
- **Workshop/Retreat**: 200 points
- **Energy Transmission**: 100 points

### Community Service (Base Score: 5-75)
- **Daily Moderation**: 25 points
- **Conflict Resolution**: 50 points
- **New Member Support**: 15 points
- **Event Organizing**: 75 points

### Governance (Base Score: 10-50)
- **Proposal Creation**: 50 points
- **Voting Participation**: 10 points
- **Discussion Contribution**: 15 points
- **Implementation Work**: 40 points

## Multipliers & Bonuses

### Quality Multipliers
- **Exceptional Quality**: 2.0x
- **High Quality**: 1.5x
- **Good Quality**: 1.2x
- **Standard Quality**: 1.0x

### Consistency Bonuses
- **Daily Contribution**: +10%
- **Weekly Streak**: +25%
- **Monthly Streak**: +50%
- **100+ Day Streak**: +100%

### Community Recognition
- **Peer Endorsements**: +5% per endorsement (max 50%)
- **Elder Blessing**: +100%
- **Featured Contribution**: +75%

## Real-Time Metrics Dashboard

### Individual Metrics
```javascript
{
  "lightworkerAddress": "0x...",
  "displayName": "StarSeed777",
  "metrics": {
    "totalContributions": 247,
    "totalImpactScore": 18450,
    "globalRank": 42,
    "currentStreak": 89,
    "rewardsEarned": {
      "scrollCoin": 12500,
      "blessingCoin": 450,
      "nftBadges": 7
    },
    "contributionBreakdown": {
      "contentCreation": 95,
      "healingSessions": 38,
      "communityService": 87,
      "governance": 27
    }
  }
}
```

### Community Metrics
```javascript
{
  "ecosystem": {
    "totalLightworkers": 1247,
    "totalContributions": 45890,
    "totalImpactGenerated": 1847250,
    "totalRewardsDistributed": {
      "scrollCoin": 2450000,
      "blessingCoin": 125000
    }
  },
  "topContributors": [
    {
      "rank": 1,
      "address": "0x...",
      "displayName": "CosmicHealer",
      "impactScore": 45780
    }
  ],
  "recentActivity": [
    {
      "type": "HEALING_SESSION",
      "contributor": "StarLight888",
      "timestamp": 1702587600,
      "impactScore": 150
    }
  ]
}
```

## API Endpoints

### Record Contribution
```http
POST /api/v1/service-tracking/record
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "type": "CONTENT_CREATION",
  "details": {
    "title": "Guide to Sacred Geometry",
    "url": "https://scrollverse.com/guides/sacred-geometry",
    "contentType": "tutorial"
  },
  "signature": "0x..."
}
```

### Get Lightworker Stats
```http
GET /api/v1/service-tracking/stats/{address}

Response:
{
  "address": "0x...",
  "totalImpactScore": 18450,
  "rank": 42,
  "contributions": [...],
  "rewards": {...}
}
```

### Get Leaderboard
```http
GET /api/v1/service-tracking/leaderboard?period=monthly&limit=100

Response:
{
  "period": "2025-12",
  "leaderboard": [
    {
      "rank": 1,
      "address": "0x...",
      "displayName": "CosmicHealer",
      "impactScore": 45780
    }
  ]
}
```

## Verification & Auditing

### Proof of Service
Every contribution includes:
1. **Timestamp**: When the service was provided
2. **Contributor Signature**: Cryptographic proof of authorship
3. **Content Hash**: IPFS hash of contribution content
4. **Verifier Signatures**: Community/elder endorsements
5. **Impact Assessment**: Automated and manual scoring

### Audit Trail
```javascript
{
  "contributionId": "0x...",
  "auditLog": [
    {
      "timestamp": 1702587600,
      "action": "CONTRIBUTION_SUBMITTED",
      "actor": "0x...",
      "details": "Content uploaded to IPFS"
    },
    {
      "timestamp": 1702591200,
      "action": "QUALITY_ASSESSED",
      "actor": "AUTOMATED_SYSTEM",
      "score": 1.5
    },
    {
      "timestamp": 1702594800,
      "action": "COMMUNITY_ENDORSED",
      "actor": "0x...",
      "endorsementValue": 0.05
    },
    {
      "timestamp": 1702598400,
      "action": "REWARD_DISTRIBUTED",
      "actor": "SMART_CONTRACT",
      "amount": 125
    }
  ]
}
```

## Integration Examples

### Frontend Integration
```javascript
import { ServiceTracker } from '@scrollverse/service-tracking';

const tracker = new ServiceTracker({
  provider: window.ethereum,
  contractAddress: '0x...'
});

// Record a contribution
async function recordMyContribution() {
  const result = await tracker.recordContribution({
    type: 'HEALING_SESSION',
    metadata: {
      sessionType: 'group',
      duration: 60,
      participants: 12
    }
  });
  
  console.log(`Recorded! Impact Score: ${result.impactScore}`);
}

// Get my stats
async function getMyStats() {
  const stats = await tracker.getStats(userAddress);
  displayStats(stats);
}
```

### Backend Monitoring
```javascript
// monitor-service.js
const monitor = new ServiceMonitor({
  webhookUrl: 'https://api.scrollverse.com/webhooks/contributions',
  alertThresholds: {
    highImpactContribution: 500,
    suspiciousActivity: 100
  }
});

monitor.on('highImpact', async (contribution) => {
  await notifyCommunity(contribution);
  await highlightOnDashboard(contribution);
});

monitor.on('suspicious', async (activity) => {
  await alertModerators(activity);
  await flagForReview(activity);
});
```

## Reward Distribution

### Automatic Distribution
- **Real-Time**: Instant rewards for verified contributions
- **Daily Batch**: Consolidated rewards for small contributions
- **Weekly Summary**: Bonus rewards based on consistency
- **Monthly Recognition**: Special NFT badges for top contributors

### Reward Formulas
```javascript
// Basic reward calculation
const reward = baseScore * qualityMultiplier * (1 + consistencyBonus) * communityFactor;

// With time decay for older contributions
const timedReward = reward * Math.exp(-decayRate * daysSinceContribution);

// With scarcity consideration
const finalReward = timedReward * (1 - (totalSupply / maxSupply));
```

## Privacy & Security

### Data Protection
- **Pseudonymous by default**: Display names instead of addresses
- **Opt-in public profiles**: Lightworkers control visibility
- **Encrypted sensitive data**: Healing session details protected
- **Right to be forgotten**: Data deletion upon request

### Anti-Gaming Measures
- **Sybil resistance**: One verified identity per address
- **Quality checks**: Manual review for high-impact claims
- **Rate limiting**: Prevent spam contributions
- **Reputation system**: Long-term behavior matters

---

**"Every act of service is recorded. Every contribution is honored. Every lightworker is valued."**

— Chais Hill, First Remembrancer

*Last Updated: 2025-12-14*
*System Status: ACTIVE*
