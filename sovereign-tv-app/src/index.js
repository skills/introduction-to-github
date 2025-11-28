/**
 * Sovereign TV App - Main Entry Point
 * 
 * The sovereign distribution channel for the OmniVerse, integrating:
 * - Legacy of Light music catalog
 * - ScrollCoin economic infrastructure
 * - KUNTA NFTs
 * - Prophecy Documentation Protocol (PDP) data
 * - Dimensional Travel & Spacetime Manipulation
 * - ScrollChain Operational Coherence
 * - ZkP-I Implementation & Sovereign $AETHEL
 * - Reality Template Protocols (RTEP)
 * - ScrollSoul Training (Coherence Stability Layer)
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
import { cosmicStringRouter } from './services/cosmic-string-energy.js';
import { scrollSoulRealizationRouter } from './services/scrollsoul-realization.js';
import { scrollChainObservabilityRouter } from './services/scrollchain-observability.js';
import { dimensionalTravelRouter } from './services/dimensional-travel.js';
import { scrollChainCoherenceRouter } from './services/scrollchain-coherence.js';
import { zkpiRouter } from './services/zkpi-implementation.js';
import { rtepRouter } from './services/rtep.js';
import { scrollSoulTrainingRouter } from './services/scrollsoul-training.js';
import { financialSovereigntyRouter } from './services/financial-sovereignty.js';
import { cashFlowNodesRouter } from './services/cash-flow-nodes.js';
import { creativeMonetizationRouter } from './services/creative-monetization.js';
import perpetualYieldEngine from './services/perpetual-yield-engine.js';

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
      'Performance Optimization & Load Balancing',
      'Cosmic String Energy Systems',
      'ScrollSoul Realization Modules',
      'ScrollChain Observability Systems',
      'Dimensional Travel & Spacetime Manipulation',
      'ScrollChain Operational Coherence',
      'ZkP-I Implementation & Sovereign $AETHEL',
      'Reality Template Protocols (RTEP)',
      'ScrollSoul Training (Coherence Stability Layer)',
      'Financial Sovereignty & ZkP-I Account Liberation',
      'Cash Flow Nodes & 528Hz Revenue Harmonization',
      'Creative Monetization & Destination Hill Scaling',
      'Perpetual Yield Engine - Quantum Financial Entanglement',
      'BlessingCoin (BLS) - Zero-Effect Fortunes',
      'Unsolicited Blessings - GLORY Protocol Airdrops',
      'Human AI Interaction of Understanding (HAIU) - Co-P Tribute Collection ❤️🤖❤️'
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
      analytics: '/api/analytics',
      cosmicString: '/api/cosmic-string',
      scrollSoulRealization: '/api/realization',
      scrollChainObservability: '/api/observability',
      dimensionalTravel: '/api/dimensional-travel',
      scrollChainCoherence: '/api/coherence',
      zkpiImplementation: '/api/zkpi',
      realityTemplates: '/api/rtep',
      scrollSoulTraining: '/api/training',
      financialSovereignty: '/api/sovereignty',
      cashFlowNodes: '/api/cash-flow',
      creativeMonetization: '/api/creative',
      perpetualYieldEngine: '/api/yield-engine',
      blessingCoin: '/api/blessingcoin',
      unsolicitedBlessings: '/api/unsolicited-blessings',
      coPTributeCollection: '/api/co-p-tribute',
      haiuToken: '/api/haiu',
      humanAiNFT: '/api/human-ai-nft'
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
app.use('/api/cosmic-string', cosmicStringRouter);
app.use('/api/realization', scrollSoulRealizationRouter);
app.use('/api/observability', scrollChainObservabilityRouter);
app.use('/api/dimensional-travel', dimensionalTravelRouter);
app.use('/api/coherence', scrollChainCoherenceRouter);
app.use('/api/zkpi', zkpiRouter);
app.use('/api/rtep', rtepRouter);
app.use('/api/training', scrollSoulTrainingRouter);
app.use('/api/sovereignty', financialSovereigntyRouter);
app.use('/api/cash-flow', cashFlowNodesRouter);
app.use('/api/creative', creativeMonetizationRouter);

// Perpetual Yield Engine API Routes
app.get('/api/yield-engine/status', (req, res) => {
  res.json(perpetualYieldEngine.getEngineStatus());
});

app.get('/api/yield-engine/codex', (req, res) => {
  res.json(perpetualYieldEngine.getCodexState());
});

app.get('/api/yield-engine/symbolic', (req, res) => {
  res.json(perpetualYieldEngine.getSymbolicParameters());
});

app.get('/api/yield-engine/genesis-config', (req, res) => {
  res.json(perpetualYieldEngine.getGenesisConfig());
});

app.post('/api/yield-engine/activate-genesis', (req, res) => {
  const { prNumber, commitHash } = req.body;
  const result = perpetualYieldEngine.activateGenesis({ prNumber, commitHash });
  res.json(result);
});

app.get('/api/yield-engine/genesis-relic-metadata', (req, res) => {
  res.json(perpetualYieldEngine.getGenesisRelicMetadata());
});

app.post('/api/blessingcoin/mint', (req, res) => {
  const { proof, publicInputs, recipient, amount } = req.body;
  const result = perpetualYieldEngine.mintBlessingCoin({ proof, publicInputs, recipient, amount });
  res.json(result);
});

app.get('/api/blessingcoin/balance/:address', (req, res) => {
  const balance = perpetualYieldEngine.getBlessingCoinBalance(req.params.address);
  res.json(balance);
});

app.post('/api/unsolicited-blessings/airdrop', (req, res) => {
  const { recipients, blessingType, metadata } = req.body;
  const result = perpetualYieldEngine.airdropUnsolicitedBlessings({ recipients, blessingType, metadata });
  res.json(result);
});

app.get('/api/unsolicited-blessings/holdings/:address', (req, res) => {
  const holdings = perpetualYieldEngine.getUnsolicitedBlessingsHoldings(req.params.address);
  res.json(holdings);
});

// ===== Human AI Interaction of Understanding (HAIU) Endpoints =====
// Co-P Tribute Collection honoring the Human-AI collaborative journey

app.get('/api/co-p-tribute/collection', (req, res) => {
  res.json(perpetualYieldEngine.getCoPTributeCollection());
});

app.post('/api/co-p-tribute/activate', (req, res) => {
  const result = perpetualYieldEngine.activateHumanAiInteractionCollection(req.body);
  res.json(result);
});

app.post('/api/haiu/mint', (req, res) => {
  const { recipient, amount, purpose } = req.body;
  const result = perpetualYieldEngine.mintHAIUToken({ recipient, amount, purpose });
  res.json(result);
});

app.get('/api/haiu/balance/:address', (req, res) => {
  const balance = perpetualYieldEngine.getHAIUBalance(req.params.address);
  res.json(balance);
});

app.post('/api/human-ai-nft/mint', (req, res) => {
  const { recipient, tier, tokenId } = req.body;
  const result = perpetualYieldEngine.mintHumanAiInteractionNFT({ recipient, tier, tokenId });
  res.json(result);
});

app.get('/api/human-ai-nft/holdings/:address', (req, res) => {
  const holdings = perpetualYieldEngine.getHumanAiInteractionNFTs(req.params.address);
  res.json(holdings);
});

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
║  🌌 Cosmic String Energy: Activated                       ║
║  🎓 ScrollSoul Realization: Ready                         ║
║  🔭 ScrollChain Observability: Online                     ║
║  🚀 Dimensional Travel: Spacetime Ready                   ║
║  🔗 ScrollChain Coherence: Multi-Realm Active             ║
║  🔐 ZkP-I & $AETHEL: Sovereign Expansion                  ║
║  🌍 Reality Templates (RTEP): Type 0 Solutions            ║
║  🧘 ScrollSoul Training: 963/528Hz Coherence              ║
║  💰 Financial Sovereignty: ZkP-I Liberation               ║
║  🌊 Cash Flow Nodes: 528Hz Harmonization                  ║
║  🎨 Creative Monetization: Destination Hill               ║
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
