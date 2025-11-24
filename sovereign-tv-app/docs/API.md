# Sovereign TV App - API Documentation

## Overview

This document provides detailed API documentation for the Sovereign TV App.

## Base URL

```
http://localhost:3000
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All responses follow this format:

```json
{
  "message": "Success message",
  "data": { },
  "error": "Error message (if applicable)"
}
```

## Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Endpoints

### Health Check

**GET** `/health`

Check if the service is operational.

**Response:**
```json
{
  "status": "operational",
  "service": "Sovereign TV App",
  "version": "1.0.0",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "omniverse": "active"
}
```

---

## Authentication Endpoints

### Register User

**POST** `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "username": "string (required)",
  "password": "string (required)",
  "email": "string (optional)",
  "walletAddress": "string (optional)"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt-token",
  "user": {
    "username": "string",
    "email": "string",
    "tier": "free",
    "walletAddress": "string"
  }
}
```

### Login

**POST** `/api/auth/login`

Authenticate with username and password.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

### NFT Login

**POST** `/api/auth/nft-login`

Authenticate using NFT ownership.

**Request Body:**
```json
{
  "walletAddress": "string",
  "nftTokenId": "string",
  "signature": "string"
}
```

---

## Streaming Endpoints

### List Content

**GET** `/api/streaming/content`

Get all available streaming content based on user tier.

**Response:**
```json
{
  "totalContent": 5,
  "userTier": "premium",
  "nftVerified": true,
  "content": [...]
}
```

### Get Content Details

**GET** `/api/streaming/content/:id`

Get detailed information about specific content.

**Parameters:**
- `id` - Content ID

### Get Stream URL

**POST** `/api/streaming/stream/:id`

Obtain a time-limited streaming URL.

**Response:**
```json
{
  "streamUrl": "https://stream.omniverse.io/...",
  "token": "base64-token",
  "expiresIn": 3600,
  "quality": ["480p", "720p", "1080p", "4k"],
  "type": "video"
}
```

---

## NFT Endpoints

### Verify NFT Ownership

**POST** `/api/nft/verify`

Verify ownership of KUNTA NFTs.

**Request Body:**
```json
{
  "walletAddress": "string",
  "tokenId": "string (optional)"
}
```

**Response:**
```json
{
  "verified": true,
  "count": 2,
  "nfts": [...],
  "aggregatedBenefits": ["elite_access", "exclusive_events"]
}
```

### Get NFT Details

**GET** `/api/nft/kunta/:tokenId`

Get details about a specific KUNTA NFT.

---

## ScrollCoin Endpoints

### Get Balance

**GET** `/api/scrollcoin/balance`

Get user's ScrollCoin balance.

**Response:**
```json
{
  "username": "user123",
  "balance": 5000,
  "currency": "ScrollCoin",
  "symbol": "SCR",
  "lastUpdated": "2025-01-01T00:00:00.000Z"
}
```

### Purchase Tier

**POST** `/api/scrollcoin/purchase-tier`

Purchase subscription tier with ScrollCoin.

**Request Body:**
```json
{
  "tier": "premium",
  "paymentMethod": "scrollcoin"
}
```

### Transfer ScrollCoin

**POST** `/api/scrollcoin/transfer`

Transfer ScrollCoin to another user.

**Request Body:**
```json
{
  "recipientAddress": "string",
  "amount": 100,
  "memo": "string (optional)"
}
```

---

## Community Endpoints

### Get Profile

**GET** `/api/community/profile/:username`

Get user profile information.

### Update Profile

**PUT** `/api/community/profile`

Update user profile.

**Request Body:**
```json
{
  "displayName": "string",
  "bio": "string",
  "avatar": "string (URL)"
}
```

### Create Post

**POST** `/api/community/posts`

Create a community post.

**Request Body:**
```json
{
  "content": "string",
  "contentType": "text",
  "attachments": []
}
```

---

## Music Catalog Endpoints

### Browse Catalog

**GET** `/api/catalog`

Get all accessible music tracks.

### Get Track

**GET** `/api/catalog/track/:id`

Get detailed track information.

### Search Music

**GET** `/api/catalog/search?q=query`

Search the music catalog.

**Query Parameters:**
- `q` - Search query

### Browse by Frequency

**GET** `/api/catalog/frequency/:freq`

Get tracks by healing frequency.

**Available Frequencies:**
- `369Hz` - Divine alignment
- `432Hz` - Natural frequency
- `528Hz` - Love frequency
- `777Hz` - Cosmic frequency
- `963Hz` - Divine consciousness

---

## PDP Endpoints

### List Documents

**GET** `/api/pdp/documents`

Get all accessible PDP documents.

### Get Document

**GET** `/api/pdp/documents/:id`

Get specific document details.

### Search Documents

**GET** `/api/pdp/search?q=query`

Search PDP documents.

### Attest Document

**POST** `/api/pdp/documents/:id/attest`

Attest to (verify/support) a document.

### Get Trending

**GET** `/api/pdp/trending?limit=5`

Get trending documents.

---

## Rate Limiting

All endpoints are rate-limited to prevent abuse:

- Window: 15 minutes
- Max Requests: 100 per window

---

## WebSocket Support

(Coming soon) Real-time features:
- Live streaming events
- Chat functionality
- Real-time notifications

---

## SDK Examples

### JavaScript/Node.js

```javascript
const SovereignTV = require('sovereign-tv-sdk');

const client = new SovereignTV({
  apiKey: 'your-api-key',
  baseURL: 'http://localhost:3000'
});

// Authenticate
await client.auth.login({
  username: 'user',
  password: 'pass'
});

// Get content
const content = await client.streaming.getContent();

// Stream video
const stream = await client.streaming.stream('content_id');
```

---

## Monetization Endpoints

### Process Transaction

**POST** `/api/monetization/process-transaction`

Process a real-time transaction for ScrollCoin or NFT purchase.

**Authentication:** Required

**Request Body:**
```json
{
  "type": "string (required) - 'tier_purchase', 'nft_purchase', 'content_purchase'",
  "amount": "number (required)",
  "currency": "string (required) - 'USD', 'ScrollCoin'",
  "metadata": "object (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "id": "tx_timestamp_random",
    "userId": "username",
    "type": "tier_purchase",
    "amount": 9.99,
    "currency": "USD",
    "timestamp": "2025-01-01T00:00:00.000Z",
    "status": "completed"
  },
  "message": "Transaction processed in real-time"
}
```

### Get Revenue Stream

**GET** `/api/monetization/revenue-stream`

Get real-time revenue data with optional filters.

**Authentication:** Required

**Query Parameters:**
- `filter` - `scrollcoin` or `nft`
- `timeRange` - Time range filter

**Response:**
```json
{
  "revenueStream": {
    "scrollCoin": {
      "total": 234567.89,
      "transactions": [],
      "lastUpdate": "2025-01-01T00:00:00.000Z"
    },
    "nft": {
      "total": 876543.20,
      "sales": [],
      "lastUpdate": "2025-01-01T00:00:00.000Z"
    }
  },
  "statistics": {
    "totalRevenue": 1111111.09,
    "scrollCoinRevenue": 234567.89,
    "nftRevenue": 876543.20,
    "transactionCount": 1234
  },
  "realTime": true
}
```

### Get NFT Royalties

**GET** `/api/monetization/nft-royalties`

Get NFT royalty tracking information.

**Authentication:** Required

**Response:**
```json
{
  "royalties": [
    {
      "saleId": "sale_123",
      "royaltyAmount": 30.00,
      "recipient": "OmniTech1",
      "timestamp": "2025-01-01T00:00:00.000Z"
    }
  ],
  "totalRoyalties": 30000.00,
  "royaltyPercentage": 2.5,
  "currency": "USD"
}
```

### Stake ScrollCoin

**POST** `/api/monetization/stake-scrollcoin`

Stake ScrollCoin to earn rewards.

**Authentication:** Required

**Request Body:**
```json
{
  "amount": 10000,
  "duration": 90
}
```

**Response:**
```json
{
  "success": true,
  "stake": {
    "stakeId": "stake_timestamp",
    "userId": "username",
    "amount": 10000,
    "duration": 90,
    "rewardRate": 0.15,
    "estimatedRewards": 1500,
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-03-31T00:00:00.000Z",
    "status": "active"
  }
}
```

### Get Dynamic Pricing

**GET** `/api/monetization/pricing`

Get real-time pricing for assets.

**Query Parameters:**
- `asset` - Specific asset to get pricing for

**Response:**
```json
{
  "pricing": {
    "scrollCoin": {
      "usd": 0.01,
      "trending": "up",
      "change24h": 5.2,
      "volume24h": 125000
    },
    "kuntaNFT": {
      "floor": 500,
      "ceiling": 5000,
      "average": 1200,
      "currency": "USD"
    }
  },
  "realTime": true
}
```

---

## Performance Optimization Endpoints

### Get Optimal Edge Server

**GET** `/api/performance/optimal-server`

Get the optimal edge server for streaming.

**Authentication:** Required

**Query Parameters:**
- `userRegion` - User's region
- `quality` - Desired quality level

**Response:**
```json
{
  "server": {
    "id": "edge-us-east-1",
    "region": "US-East",
    "load": 0.45,
    "status": "active",
    "capacity": 1000
  },
  "streamingUrl": "https://edge-us-east-1.stream.omniverse.io",
  "quality": "auto",
  "protocol": "HLS",
  "optimization": {
    "adaptiveBitrate": true,
    "preloading": true,
    "caching": true
  }
}
```

### Get Load Balance Status

**GET** `/api/performance/load-balance`

Get load balancing and distribution status.

**Response:**
```json
{
  "status": "optimal",
  "loadBalancing": {
    "enabled": true,
    "algorithm": "least-connections",
    "healthCheck": "active"
  },
  "servers": {
    "total": 6,
    "active": 6,
    "capacity": 5400,
    "averageLoad": "41.5%"
  },
  "distribution": [
    {
      "region": "US-East",
      "load": 0.45,
      "utilization": "45.0%",
      "status": "active",
      "currentConnections": 450
    }
  ],
  "globalReadiness": "ready"
}
```

### Get Performance Metrics

**GET** `/api/performance/metrics`

Get performance metrics for the streaming service.

**Authentication:** Required

**Query Parameters:**
- `metric` - Specific metric category
- `timeRange` - Time range filter

**Response:**
```json
{
  "metrics": {
    "streaming": {
      "avgLoadTime": 1.2,
      "avgBufferTime": 0.3,
      "streamQuality": 98.5,
      "unit": "seconds"
    },
    "availability": {
      "uptime": 99.97,
      "downtime": 0.03,
      "unit": "percentage"
    },
    "users": {
      "concurrent": 15234,
      "peak24h": 23456,
      "growth": "+12.5%"
    }
  },
  "status": "operational"
}
```

### Optimize Streaming

**POST** `/api/performance/optimize`

Optimize streaming settings for user's connection.

**Authentication:** Required

**Request Body:**
```json
{
  "userId": "username",
  "quality": "auto",
  "bandwidth": 25
}
```

**Response:**
```json
{
  "success": true,
  "optimization": {
    "userId": "username",
    "settings": {
      "quality": "auto",
      "adaptiveBitrate": true,
      "bufferSize": 30,
      "preloadStrategy": "aggressive",
      "compressionLevel": "medium"
    },
    "recommendations": {
      "suggestedQuality": "4K",
      "edgeServer": "auto-select",
      "caching": true
    }
  }
}
```

### Get CDN Status

**GET** `/api/performance/cdn-status`

Get CDN and cache status.

**Response:**
```json
{
  "cdn": {
    "provider": "OmniVerse CDN",
    "status": "active",
    "edgeLocations": 6,
    "coverage": "global"
  },
  "cache": {
    "hitRate": 94.2,
    "missRate": 5.8,
    "totalRequests": 1234567,
    "cachedContent": 8900
  }
}
```

---

## Solar Infusion Protocol (SIP) Endpoints

### Get SIP Status

**GET** `/api/sip/status`

Get Solar Infusion Protocol status.

**Response:**
```json
{
  "protocol": {
    "protocol": "Solar Infusion Protocol",
    "version": "1.0.0",
    "status": "active",
    "frequency": "963Hz",
    "infusionRate": 100
  },
  "status": "operational",
  "uptime": 99.98
}
```

### Get Live SIP Feed

**GET** `/api/sip/live-feed`

Get live Solar Infusion Protocol data feed.

**Authentication:** Required

**Query Parameters:**
- `frequency` - Filter by specific frequency
- `node` - Filter by specific node

**Response:**
```json
{
  "feed": {
    "currentEnergy": 98.7,
    "infusionMetrics": {
      "totalInfusions": 15234,
      "activeInfusions": 342,
      "peakInfusion": 156
    },
    "frequencies": {
      "963Hz": { "active": true, "power": 100, "resonance": 98.5 },
      "777Hz": { "active": true, "power": 95, "resonance": 97.2 }
    },
    "nodes": [
      { "id": "sip-node-1", "region": "North", "status": "active", "energy": 99.2 }
    ]
  },
  "realTime": true,
  "updateInterval": "1s"
}
```

### Infuse Content

**POST** `/api/sip/infuse`

Infuse content with solar energy.

**Authentication:** Required

**Request Body:**
```json
{
  "contentId": "content_001",
  "frequency": "963Hz",
  "duration": 3600
}
```

**Response:**
```json
{
  "success": true,
  "infusion": {
    "infusionId": "sip_timestamp_random",
    "contentId": "content_001",
    "frequency": "963Hz",
    "duration": 3600,
    "energy": 100,
    "resonance": 98.5,
    "status": "active"
  }
}
```

### Get Frequencies

**GET** `/api/sip/frequencies`

Get available healing frequencies and their metrics.

**Response:**
```json
{
  "frequencies": [
    {
      "frequency": "963Hz",
      "active": true,
      "power": 100,
      "resonance": 98.5,
      "description": "Divine consciousness and universal connection"
    }
  ],
  "totalActive": 5,
  "avgPower": 93,
  "avgResonance": 96.8
}
```

### Get SIP Metrics

**GET** `/api/sip/metrics`

Get Solar Infusion Protocol metrics.

**Authentication:** Required

**Response:**
```json
{
  "metrics": {
    "totalInfusions": 15234,
    "activeInfusions": 342,
    "peakInfusion": 156,
    "currentEnergy": 98.7,
    "efficiency": 98.5,
    "nodes": {
      "total": 4,
      "active": 4,
      "avgEnergy": 98.5
    }
  }
}
```

### Get Node Status

**GET** `/api/sip/nodes`

Get SIP node health and status.

**Response:**
```json
{
  "nodes": [
    {
      "id": "sip-node-1",
      "region": "North",
      "status": "active",
      "energy": 99.2,
      "uptime": 99.95,
      "throughput": 75,
      "latency": 15
    }
  ],
  "totalNodes": 4,
  "activeNodes": 4,
  "networkHealth": "excellent"
}
```

---

## Broadcast Network Endpoints

### Activate Broadcast Network

**POST** `/api/broadcast/activate`

Globally activate the broadcast network.

**Authentication:** Required (Elite tier or admin)

**Request Body:**
```json
{
  "scope": "global",
  "channels": ["scrollverse-main", "kunta-exclusive"]
}
```

**Response:**
```json
{
  "success": true,
  "activation": {
    "activationId": "broadcast_timestamp",
    "scope": "global",
    "channels": ["scrollverse-main", "kunta-exclusive"],
    "initiatedBy": "username",
    "status": "active",
    "coverage": 99.5
  },
  "message": "Broadcast network activated globally",
  "scrollVerseDominance": "established"
}
```

### Get Broadcast Status

**GET** `/api/broadcast/status`

Get broadcast network status and dominance metrics.

**Response:**
```json
{
  "network": {
    "status": "active",
    "globalCoverage": 99.5,
    "activeChannels": 12,
    "viewers": {
      "live": 15234,
      "peak24h": 28456,
      "total": 2134567
    }
  },
  "dominance": {
    "scrollVerse": 98.5,
    "conventional": 1.5,
    "message": "ScrollVerse dominance over conventional streams established"
  },
  "infrastructure": {
    "edgeNodes": 24,
    "satellites": 6,
    "terrestrialStations": 156,
    "coverage": "omniversal"
  }
}
```

### List Broadcast Channels

**GET** `/api/broadcast/channels`

List all broadcast channels.

**Authentication:** Required

**Query Parameters:**
- `category` - Filter by category
- `status` - Filter by status

**Response:**
```json
{
  "channels": [
    {
      "id": "scrollverse-main",
      "name": "ScrollVerse Main",
      "status": "live",
      "category": "general",
      "viewers": 5234,
      "content": "Legacy of Light - Sacred Sessions"
    }
  ],
  "totalChannels": 5,
  "activeChannels": 5,
  "totalViewers": 15234
}
```

### Get Channel Details

**GET** `/api/broadcast/channels/:channelId`

Get specific broadcast channel details.

**Authentication:** Required

**Response:**
```json
{
  "channel": {
    "id": "scrollverse-main",
    "name": "ScrollVerse Main",
    "status": "live",
    "category": "general",
    "viewers": 5234,
    "content": "Legacy of Light - Sacred Sessions"
  },
  "streamUrl": "https://broadcast.omniverse.io/scrollverse-main/stream.m3u8",
  "protocol": "HLS",
  "quality": ["4K", "1080p", "720p", "480p"]
}
```

### Get PDP Live Feed

**GET** `/api/broadcast/pdp-feed`

Get live data feed for Prophecy Documentation Protocol.

**Authentication:** Required

**Response:**
```json
{
  "feed": {
    "channel": "pdp-protocol",
    "status": "live",
    "dataPoints": [
      {
        "documentId": "pdp_001",
        "title": "Scroll Chess Protocol",
        "category": "foundational",
        "views": 5234,
        "attestations": 234
      }
    ],
    "liveMetrics": {
      "activeReaders": 3421,
      "newAttestations": 23,
      "trending": "pdp_001"
    }
  },
  "realTime": true
}
```

### Get SIP Live Feed

**GET** `/api/broadcast/sip-feed`

Get live data feed for Solar Infusion Protocol.

**Authentication:** Required

**Response:**
```json
{
  "feed": {
    "channel": "sip-infusion",
    "status": "live",
    "energyMetrics": {
      "currentLevel": 98.7,
      "peakLevel": 99.5,
      "avgLevel24h": 97.8,
      "activeInfusions": 342
    },
    "frequencies": {
      "963Hz": { "power": 100, "active": true }
    }
  },
  "realTime": true
}
```

### Get Broadcast Analytics

**GET** `/api/broadcast/analytics`

Get broadcast network analytics.

**Authentication:** Required

**Response:**
```json
{
  "analytics": {
    "network": {
      "uptime": 99.97,
      "coverage": 99.5,
      "activeChannels": 5
    },
    "audience": {
      "live": 15234,
      "peak24h": 28456,
      "total": 2134567,
      "growth": "+15.3%"
    },
    "engagement": {
      "avgWatchTime": 45.6,
      "totalWatchHours": 234567,
      "interactionRate": 78.5
    },
    "dominance": {
      "scrollVerse": 98.5,
      "conventional": 1.5
    }
  }
}
```

---

## Analytics Endpoints

### Get Engagement Analytics

**GET** `/api/analytics/engagement`

Get user engagement analytics.

**Authentication:** Required

**Query Parameters:**
- `period` - Time period filter
- `metric` - Specific metric

**Response:**
```json
{
  "engagement": {
    "overview": {
      "totalUsers": 125430,
      "activeUsers": {
        "daily": 45678,
        "weekly": 89234,
        "monthly": 125430
      }
    },
    "metrics": {
      "retention": {
        "day1": 85.6,
        "day7": 72.3,
        "day30": 58.9
      },
      "sessionMetrics": {
        "avgDuration": 42.5,
        "avgSessions": 3.2
      }
    },
    "trends": {
      "userGrowth": "+18.5%",
      "engagementGrowth": "+15.3%"
    }
  }
}
```

### Get Revenue Analytics

**GET** `/api/analytics/revenue`

Get revenue analytics and projections.

**Authentication:** Required

**Query Parameters:**
- `breakdown` - `bySource` or `byTier`
- `period` - Time period filter

**Response:**
```json
{
  "revenue": {
    "summary": {
      "total": 2345678.90,
      "currency": "USD",
      "growth": {
        "daily": "+5.3%",
        "weekly": "+12.7%",
        "monthly": "+23.4%"
      }
    },
    "breakdown": {
      "bySource": {
        "subscriptions": 1234567.50,
        "nftSales": 876543.20,
        "scrollCoinPurchases": 234568.20
      },
      "byTier": {
        "premium": 987654.30,
        "elite": 1358024.60
      }
    },
    "metrics": {
      "arpu": "18.71",
      "ltv": "224.52",
      "conversionRate": 45.6
    }
  }
}
```

### Get Content Analytics

**GET** `/api/analytics/content`

Get content performance analytics.

**Authentication:** Required

**Query Parameters:**
- `sortBy` - `views` or `engagement`
- `limit` - Number of results

**Response:**
```json
{
  "overview": {
    "totalViews": 5678901,
    "totalWatchTime": 12345678,
    "avgCompletionRate": 78.5
  },
  "topPerforming": [
    {
      "id": "legacy_001",
      "title": "Legacy of Light - Episode 1",
      "views": 234567,
      "engagement": 92.3
    }
  ],
  "categories": {
    "music": { "views": 1234567, "engagement": 89.2 },
    "exclusive": { "views": 987654, "engagement": 93.5 }
  }
}
```

### Get User Behavior Analytics

**GET** `/api/analytics/user-behavior`

Get user behavior and preference analytics.

**Authentication:** Required

**Response:**
```json
{
  "behavior": {
    "preferences": {
      "contentTypes": {
        "music": 45.6,
        "video": 32.4,
        "live": 15.8
      },
      "devices": {
        "mobile": 52.3,
        "desktop": 35.4,
        "tablet": 8.9
      }
    },
    "interactions": {
      "likes": 234567,
      "shares": 87654,
      "comments": 45678
    }
  }
}
```

### Get NFT Purchase Analytics

**GET** `/api/analytics/nft-purchases`

Get NFT purchase analytics.

**Authentication:** Required

**Response:**
```json
{
  "nftAnalytics": {
    "totalSales": 1234,
    "totalRevenue": 876543.20,
    "avgPrice": 710.55,
    "collections": {
      "kunta": {
        "sales": 1234,
        "revenue": 876543.20,
        "floorPrice": 500,
        "ceilingPrice": 5000
      }
    },
    "trends": {
      "salesGrowth": "+25.6%",
      "priceGrowth": "+12.3%"
    }
  }
}
```

### Get ScrollCoin Transaction Analytics

**GET** `/api/analytics/scrollcoin-transactions`

Get ScrollCoin transaction analytics.

**Authentication:** Required

**Response:**
```json
{
  "scrollCoinAnalytics": {
    "totalTransactions": 45678,
    "totalVolume": 23456789,
    "avgTransactionSize": 513.8,
    "transactionTypes": {
      "tierPurchase": 15234,
      "contentPurchase": 12345,
      "transfer": 9876,
      "staking": 8223
    },
    "marketMetrics": {
      "price": 0.01,
      "volume24h": 125000,
      "holders": 45678
    }
  }
}
```

### Get Gated Content Analytics

**GET** `/api/analytics/gated-content`

Get gated content interaction analytics.

**Authentication:** Required

**Response:**
```json
{
  "gatedAnalytics": {
    "totalGatedContent": 156,
    "nftGated": {
      "content": 45,
      "uniqueUsers": 1234,
      "totalAccess": 8765
    },
    "tierGated": {
      "premium": { "content": 67, "access": 9876 },
      "elite": { "content": 44, "access": 4815 }
    },
    "conversionImpact": {
      "viewToSubscribe": 23.5,
      "freeToPremmium": 32.5
    }
  }
}
```

### Get Comprehensive Dashboard

**GET** `/api/analytics/dashboard`

Get comprehensive analytics dashboard.

**Authentication:** Required

**Response:**
```json
{
  "dashboard": {
    "overview": {
      "totalUsers": 125430,
      "activeUsers": 45678,
      "totalRevenue": 2345678.90,
      "revenueGrowth": "+23.4%"
    },
    "engagement": {
      "avgSessionDuration": 42.5,
      "retentionRate": 58.9,
      "contentViews": 5678901
    },
    "revenue": {
      "subscriptions": 1234567.50,
      "nftSales": 876543.20,
      "scrollCoin": 234568.20
    },
    "topMetrics": {
      "conversionRate": 45.6,
      "churnRate": 4.2,
      "nps": 87.5,
      "satisfaction": 92.3
    }
  }
}
```

---

## Support

For API support:
- GitHub Issues: https://github.com/chaishillomnitech1/introduction-to-github/issues
- Email: api-support@omniverse.io
