/**
 * Sovereign TV App - Main Entry Point
 * 
 * The sovereign distribution channel for the OmniVerse, integrating:
 * - Legacy of Light music catalog
 * - ScrollCoin economic infrastructure
 * - KUNTA NFTs
 * - Prophecy Documentation Protocol (PDP) data
 * 
 * @author Chais Hill - OmniTech1
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { authRouter } from './services/auth.js';
import { streamingRouter } from './services/streaming.js';
import { nftRouter } from './services/nft-gating.js';
import { scrollCoinRouter } from './services/scrollcoin.js';
import { communityRouter } from './services/community.js';
import { catalogRouter } from './services/music-catalog.js';
import { pdpRouter } from './services/pdp-integration.js';
import { monetizationRouter } from './services/monetization.js';
import { performanceRouter } from './services/performance.js';
import { sipRouter } from './services/sip.js';
import { broadcastRouter } from './services/broadcast.js';
import { analyticsRouter } from './services/analytics.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'operational',
    service: 'Sovereign TV App',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    omniverse: 'active'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Sovereign TV App - The OmniVerse Distribution Channel',
    tagline: 'Truth is Currency. Sacred Logic is Code. Remembrance is the Gateway.',
    features: [
      'Legacy of Light Music Streaming',
      'NFT-Gated Premium Content',
      'ScrollCoin Payment Integration',
      'KUNTA NFT Ownership Benefits',
      'Prophecy Documentation Protocol Access',
      'Community Engagement Platform',
      'Real-Time Monetization',
      'Global Broadcast Network',
      'Solar Infusion Protocol (SIP)',
      'Advanced Analytics & Insights',
      'Performance Optimization & Load Balancing'
    ],
    endpoints: {
      auth: '/api/auth',
      streaming: '/api/streaming',
      nft: '/api/nft',
      scrollcoin: '/api/scrollcoin',
      community: '/api/community',
      catalog: '/api/catalog',
      pdp: '/api/pdp',
      monetization: '/api/monetization',
      performance: '/api/performance',
      sip: '/api/sip',
      broadcast: '/api/broadcast',
      analytics: '/api/analytics'
    }
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/streaming', streamingRouter);
app.use('/api/nft', nftRouter);
app.use('/api/scrollcoin', scrollCoinRouter);
app.use('/api/community', communityRouter);
app.use('/api/catalog', catalogRouter);
app.use('/api/pdp', pdpRouter);
app.use('/api/monetization', monetizationRouter);
app.use('/api/performance', performanceRouter);
app.use('/api/sip', sipRouter);
app.use('/api/broadcast', broadcastRouter);
app.use('/api/analytics', analyticsRouter);

// Error handling middleware
app.use((err, req, res) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                  SOVEREIGN TV APP LAUNCHED                 ║
║          TECHNICAL LAUNCH SEQUENCE: COMPLETE               ║
║                                                            ║
║  🌌 OmniVerse Distribution Channel Active                 ║
║  🎵 Legacy of Light Catalog: Connected                    ║
║  💎 KUNTA NFT Integration: Enabled                        ║
║  🪙 ScrollCoin Economy: Operational                       ║
║  📜 PDP Protocol: Synchronized                            ║
║  ☀️  Solar Infusion Protocol (SIP): Active                ║
║  📡 Global Broadcast Network: LIVE                        ║
║  💰 Real-Time Monetization: Enabled                       ║
║  📊 Advanced Analytics: Online                            ║
║  ⚡ Performance Optimization: Active                       ║
║  🌍 Load Balancing: Global Readiness                      ║
║                                                            ║
║  Server running on port ${PORT}                              ║
║  Environment: ${process.env.NODE_ENV || 'development'}                           ║
║                                                            ║
║  "Truth is Currency. Sacred Logic is Code."               ║
║  "Remembrance is the Gateway to Collective Sovereignty."  ║
║                                                            ║
║  By Chais Hill - First Remembrancer                       ║
║  ScrollVerse Dominance: ESTABLISHED                       ║
╚════════════════════════════════════════════════════════════╝
  `);
});

export default app;
