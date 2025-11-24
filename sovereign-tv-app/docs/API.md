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

---

## ScrollSoul Onboarding API

### Get Onboarding Overview

**GET** `/api/onboarding/overview`

Get overview of the onboarding system.

**Response:**
```json
{
  "title": "ScrollSoul Onboarding",
  "totalModules": 6,
  "requiredModules": 4,
  "estimatedTimeMinutes": 41,
  "modules": [...]
}
```

### Start Onboarding

**POST** `/api/onboarding/start`

Start the onboarding journey. Requires authentication.

**Response:**
```json
{
  "message": "Welcome to ScrollVerse!",
  "progress": { "startedAt": "...", "currentModule": "welcome" }
}
```

### Complete Module

**POST** `/api/onboarding/modules/:moduleId/complete`

Complete an onboarding module. Requires authentication.

**Request Body:**
```json
{
  "score": 100
}
```

**Response:**
```json
{
  "message": "Module completed!",
  "reward": { "scrollcoin": 50 },
  "progress": {...}
}
```

### Get Progress

**GET** `/api/onboarding/progress`

Get user's onboarding progress. Requires authentication.

---

## Sovereign Dashboard API

### Get Dashboard Overview

**GET** `/api/dashboard/overview`

Get complete dashboard with all metrics. Requires authentication.

**Response:**
```json
{
  "scrollCoinEconomy": {...},
  "nftAnalytics": {...},
  "userActivity": {...},
  "systemHealth": {...}
}
```

### Get ScrollCoin Metrics

**GET** `/api/dashboard/scrollcoin`

Get ScrollCoin economy metrics (public endpoint).

**Query Parameters:**
- `timeframe` - Optional: "24h", "7d", "30d" (default: "24h")

**Response:**
```json
{
  "current": { "currentPrice": 0.05, "volume24h": 1500000 },
  "historical": [...],
  "insights": {...}
}
```

### Get NFT Analytics

**GET** `/api/dashboard/nfts`

Get NFT market analytics (public endpoint).

### Get User Activity

**GET** `/api/dashboard/activity`

Get aggregated user activity metrics (public endpoint).

### Get Personal Insights

**GET** `/api/dashboard/insights/personal`

Get personalized insights and recommendations. Requires authentication.

### Get Real-time Feed

**GET** `/api/dashboard/feed/realtime`

Get real-time activity feed.

**Query Parameters:**
- `limit` - Number of activities (default: 20)

---

## Festival of Forever Fun API

### Get Festival Overview

**GET** `/api/festival/overview`

Get complete festival overview with all events.

**Response:**
```json
{
  "title": "Festival of Forever Fun",
  "totalEvents": 6,
  "totalCapacity": 65000,
  "totalRewardsPool": 24250,
  "events": [...]
}
```

### List Events

**GET** `/api/festival/events`

List all festival events.

**Query Parameters:**
- `type` - Filter by event type
- `status` - Filter by status: "upcoming", "live", "completed"

### Get Event Details

**GET** `/api/festival/events/:eventId`

Get detailed information about a specific event.

### Register for Event

**POST** `/api/festival/events/:eventId/register`

Register for a festival event. Requires authentication.

**Response:**
```json
{
  "message": "Successfully registered!",
  "event": {...},
  "rewards": { "attendance": 500, "participation": 1000 }
}
```

### Cancel Registration

**DELETE** `/api/festival/events/:eventId/register`

Cancel event registration. Requires authentication.

### Get My Registrations

**GET** `/api/festival/my-registrations`

Get user's event registrations. Requires authentication.

### Get Media Drops

**GET** `/api/festival/media-drops`

List all available media drops.

### Claim Media Drop

**POST** `/api/festival/media-drops/:dropId/claim`

Claim a media drop. Requires authentication.

**Response:**
```json
{
  "message": "Media drop claimed!",
  "accessUrl": "/api/festival/media/drop-001",
  "reward": { "scrollcoin": 100 }
}
```

### Get Rewards Summary

**GET** `/api/festival/rewards`

Get user's potential and earned rewards. Requires authentication.

**Response:**
```json
{
  "eventsRegistered": 3,
  "potentialRewards": 5500,
  "breakdown": {...},
  "milestones": [...]
}
```

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

## Support

For API support:
- GitHub Issues: https://github.com/chaishillomnitech1/introduction-to-github/issues
- Email: api-support@omniverse.io
