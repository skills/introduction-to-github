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
 * - Manus Quantum Recognition (Neural Glovework)
 * - Bio-Breath Libraries (Bio-Feedback Prioritization)
 * - Cosmic Scroll Libraries (AI-Assisted Creative Modules)
 * - Neural-Scroll Activation (Bio-Interfaced Runtime Hooks)
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
import { manusQuantumRouter } from './services/manus-quantum.js';
import { bioBreathRouter } from './services/bio-breath.js';
import { cosmicScrollRouter } from './services/cosmic-scroll.js';
import { neuralScrollRouter } from './services/neural-scroll.js';
import { paymentRouter } from './services/payment-gateway.js';
import { scrollSoulOnboardingRouter } from './services/scrollsoul-onboarding.js';
import { sovereignDashboardRouter } from './services/sovereign-dashboard.js';
import { festivalRouter } from './services/festival-forever-fun.js';
import { scrollSoulSBTRouter } from './services/scrollsoul-sbt.js';
import { iamKingRouter } from './services/iam-king-nft.js';

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
      'Manus Quantum Recognition (Neural Glovework)',
      'Bio-Breath Libraries (Bio-Feedback Prioritization)',
      'Cosmic Scroll Libraries (AI-Assisted Creative Modules)',
      'Neural-Scroll Activation (Bio-Interfaced Runtime Hooks)',
      'FlameDNA NFT Minting (ERC-721)',
      'Stripe & PayPal Payment Gateway',
      'PCI-DSS Compliant Transactions',
      'ScrollSoul Onboarding System',
      'Sovereign Dashboard with Real-Time Metrics',
      'Festival of Forever Fun Events & Rewards',
      'ScrollSoul SBT (Soulbound Token Identity)',
      'Iam 👑 King NFT on Polygon zkEVM'
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
      manusQuantum: '/api/manus-quantum',
      bioBreath: '/api/bio-breath',
      cosmicScroll: '/api/cosmic-scroll',
      neuralScroll: '/api/neural-scroll',
      payments: '/api/payments',
      onboarding: '/api/onboarding',
      dashboard: '/api/dashboard',
      festival: '/api/festival',
      scrollSoulSBT: '/api/sbt',
      iamKing: '/api/iam-king'
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
app.use('/api/manus-quantum', manusQuantumRouter);
app.use('/api/bio-breath', bioBreathRouter);
app.use('/api/cosmic-scroll', cosmicScrollRouter);
app.use('/api/neural-scroll', neuralScrollRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/onboarding', scrollSoulOnboardingRouter);
app.use('/api/dashboard', sovereignDashboardRouter);
app.use('/api/festival', festivalRouter);
app.use('/api/sbt', scrollSoulSBTRouter);
app.use('/api/iam-king', iamKingRouter);

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
║  🧤 Manus Quantum Recognition: Neural Glovework           ║
║  🌬️ Bio-Breath Libraries: Bio-Feedback Active             ║
║  📜 Cosmic Scroll Libraries: AI-Assisted Modules          ║
║  🧠 Neural-Scroll Activation: Runtime Hooks               ║
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
