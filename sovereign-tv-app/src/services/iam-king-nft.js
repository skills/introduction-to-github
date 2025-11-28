/**
 * Iam King NFT Integration Service
 * 
 * Integrates the "Iam 👑 King" NFT collection on Polygon zkEVM with Sovereign TV
 * Provides tier-based access control, governance integration, and premium benefits
 * 
 * @author Chais Hill - OmniTech1
 */

import { Router } from 'express';
import { authenticateToken } from './auth.js';
import { standardLimiter, strictLimiter } from '../utils/rate-limiter.js';

const iamKingRouter = Router();

// In-memory storage (use database in production)
const kingNFTs = new Map();
const tierHolders = new Map();
const accessLogs = new Map();

// Tier configuration (matching smart contract)
const TIERS = {
  BARON: {
    id: 0,
    name: 'Baron',
    price: '50 POL',
    priceWei: '50000000000000000000',
    maxSupply: 2000,
    votingPower: 1,
    benefits: ['basic_streaming', 'community_access'],
    color: '#CD7F32' // Bronze
  },
  DUKE: {
    id: 1,
    name: 'Duke',
    price: '100 POL',
    priceWei: '100000000000000000000',
    maxSupply: 1500,
    votingPower: 3,
    benefits: ['basic_streaming', 'community_access', 'exclusive_content', 'early_access'],
    color: '#C0C0C0' // Silver
  },
  PRINCE: {
    id: 2,
    name: 'Prince',
    price: '250 POL',
    priceWei: '250000000000000000000',
    maxSupply: 1000,
    votingPower: 5,
    benefits: ['basic_streaming', 'community_access', 'exclusive_content', 'early_access', 'live_events', 'governance_voice'],
    color: '#FFD700' // Gold
  },
  KING: {
    id: 3,
    name: 'King',
    price: '500 POL',
    priceWei: '500000000000000000000',
    maxSupply: 400,
    votingPower: 10,
    benefits: ['basic_streaming', 'community_access', 'exclusive_content', 'early_access', 'live_events', 'governance_voice', 'vip_events', 'revenue_share'],
    color: '#E5E4E2' // Platinum
  },
  EMPEROR: {
    id: 4,
    name: 'Emperor',
    price: '1000 POL',
    priceWei: '1000000000000000000000',
    maxSupply: 100,
    votingPower: 25,
    benefits: ['basic_streaming', 'community_access', 'exclusive_content', 'early_access', 'live_events', 'governance_voice', 'vip_events', 'revenue_share', 'founder_access', 'advisory_council'],
    color: '#B9F2FF' // Diamond
  }
};

// Benefit descriptions
const BENEFIT_DESCRIPTIONS = {
  basic_streaming: { name: 'Basic Streaming', description: 'Access to Sovereign TV basic content library' },
  community_access: { name: 'Community Access', description: 'Join exclusive ScrollVerse community channels' },
  exclusive_content: { name: 'Exclusive Content', description: 'Watch premium and behind-the-scenes content' },
  early_access: { name: 'Early Access', description: 'Get early access to new releases and features' },
  live_events: { name: 'Live Events', description: 'Attend virtual live events and concerts' },
  governance_voice: { name: 'Governance Voice', description: 'Participate in community governance proposals' },
  vip_events: { name: 'VIP Events', description: 'Access to exclusive VIP-only events' },
  revenue_share: { name: 'Revenue Share', description: 'Earn a share of platform revenue' },
  founder_access: { name: 'Founder Access', description: 'Direct communication with founding team' },
  advisory_council: { name: 'Advisory Council', description: 'Seat on the ScrollVerse Advisory Council' }
};

// Contract addresses
const CONTRACT_CONFIG = {
  polygonZkEVM: {
    mainnet: {
      chainId: 1101,
      rpcUrl: 'https://zkevm-rpc.com',
      contract: null // Set after deployment
    },
    testnet: {
      chainId: 2442,
      rpcUrl: 'https://rpc.cardona.zkevm-rpc.com',
      contract: null // Set after deployment
    }
  }
};

// Minted counts (track supply)
const mintedCounts = {
  BARON: 0,
  DUKE: 0,
  PRINCE: 0,
  KING: 0,
  EMPEROR: 0
};

/**
 * Get collection info
 */
iamKingRouter.get('/info', (req, res) => {
  res.json({
    collection: 'Iam 👑 King',
    symbol: 'KING',
    network: 'Polygon zkEVM',
    maxSupply: 5000,
    tiers: Object.values(TIERS).map(tier => ({
      ...tier,
      minted: mintedCounts[tier.name.toUpperCase()],
      remaining: tier.maxSupply - mintedCounts[tier.name.toUpperCase()]
    })),
    benefits: BENEFIT_DESCRIPTIONS,
    features: [
      'Tiered membership system',
      'Sovereign TV premium access',
      'Governance voting power',
      'Revenue sharing for higher tiers',
      'Upgradeable tiers'
    ],
    contracts: CONTRACT_CONFIG
  });
});

/**
 * Get tier details
 */
iamKingRouter.get('/tiers', (req, res) => {
  const tierDetails = Object.entries(TIERS).map(([key, tier]) => ({
    key,
    ...tier,
    minted: mintedCounts[key],
    remaining: tier.maxSupply - mintedCounts[key],
    benefitDetails: tier.benefits.map(b => BENEFIT_DESCRIPTIONS[b])
  }));

  res.json({
    tiers: tierDetails,
    totalMinted: Object.values(mintedCounts).reduce((a, b) => a + b, 0),
    totalSupply: 5000
  });
});

/**
 * Check holdings for a wallet
 */
iamKingRouter.get('/holdings/:walletAddress', standardLimiter, (req, res) => {
  const { walletAddress } = req.params;

  if (!walletAddress || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }

  const normalizedAddress = walletAddress.toLowerCase();
  const holdings = [];

  for (const [tokenId, nft] of kingNFTs.entries()) {
    if (nft.owner.toLowerCase() === normalizedAddress) {
      holdings.push({
        tokenId,
        tier: nft.tier,
        tierDetails: TIERS[nft.tier.toUpperCase()],
        mintedAt: nft.mintedAt
      });
    }
  }

  // Calculate total voting power
  const totalVotingPower = holdings.reduce((sum, h) => sum + TIERS[h.tier.toUpperCase()].votingPower, 0);

  // Get all unique benefits
  const allBenefits = new Set();
  holdings.forEach(h => {
    TIERS[h.tier.toUpperCase()].benefits.forEach(b => allBenefits.add(b));
  });

  // Calculate highest tier (safe with empty array check)
  let highestTier = null;
  if (holdings.length > 0) {
    highestTier = holdings.reduce((max, h) => {
      return TIERS[h.tier.toUpperCase()].id > TIERS[max.tier.toUpperCase()].id ? h : max;
    }, holdings[0]).tier;
  }

  res.json({
    walletAddress: normalizedAddress,
    holdings,
    totalTokens: holdings.length,
    totalVotingPower,
    benefits: Array.from(allBenefits).map(b => BENEFIT_DESCRIPTIONS[b]),
    highestTier
  });
});

/**
 * Verify access to a specific benefit
 */
iamKingRouter.post('/verify-access', authenticateToken, standardLimiter, (req, res) => {
  const { walletAddress, benefit } = req.body;

  if (!walletAddress || !benefit) {
    return res.status(400).json({ error: 'walletAddress and benefit required' });
  }

  if (!BENEFIT_DESCRIPTIONS[benefit]) {
    return res.status(400).json({ error: 'Invalid benefit type', validBenefits: Object.keys(BENEFIT_DESCRIPTIONS) });
  }

  const normalizedAddress = walletAddress.toLowerCase();
  let hasAccess = false;
  let grantingToken = null;

  for (const [tokenId, nft] of kingNFTs.entries()) {
    if (nft.owner.toLowerCase() === normalizedAddress) {
      const tierBenefits = TIERS[nft.tier.toUpperCase()].benefits;
      if (tierBenefits.includes(benefit)) {
        hasAccess = true;
        grantingToken = { tokenId, tier: nft.tier };
        break;
      }
    }
  }

  // Log access check
  const logs = accessLogs.get(normalizedAddress) || [];
  logs.push({
    benefit,
    hasAccess,
    timestamp: new Date().toISOString()
  });
  accessLogs.set(normalizedAddress, logs.slice(-100)); // Keep last 100 logs

  res.json({
    walletAddress: normalizedAddress,
    benefit,
    benefitDetails: BENEFIT_DESCRIPTIONS[benefit],
    hasAccess,
    grantingToken
  });
});

/**
 * Request mint (simulated - in production connects to blockchain)
 */
iamKingRouter.post('/mint', authenticateToken, strictLimiter, (req, res) => {
  const userId = req.user.username;
  const { walletAddress, tier } = req.body;

  if (!walletAddress || !tier) {
    return res.status(400).json({ error: 'walletAddress and tier required' });
  }

  const tierKey = tier.toUpperCase();
  if (!TIERS[tierKey]) {
    return res.status(400).json({ error: 'Invalid tier', validTiers: Object.keys(TIERS) });
  }

  const tierData = TIERS[tierKey];

  // Check supply
  if (mintedCounts[tierKey] >= tierData.maxSupply) {
    return res.status(400).json({ error: `${tierData.name} tier is sold out` });
  }

  // Simulate minting
  const tokenId = kingNFTs.size;
  const newNFT = {
    tokenId,
    owner: walletAddress.toLowerCase(),
    userId,
    tier: tierData.name,
    mintedAt: new Date().toISOString(),
    benefits: tierData.benefits,
    votingPower: tierData.votingPower
  };

  kingNFTs.set(tokenId, newNFT);
  mintedCounts[tierKey]++;

  // Track holder
  const holders = tierHolders.get(tierKey) || [];
  holders.push(walletAddress.toLowerCase());
  tierHolders.set(tierKey, holders);

  res.json({
    success: true,
    message: `Successfully minted ${tierData.name} tier "Iam 👑 King" NFT`,
    nft: newNFT,
    price: tierData.price,
    remainingSupply: tierData.maxSupply - mintedCounts[tierKey]
  });
});

/**
 * Request tier upgrade
 */
iamKingRouter.post('/upgrade', authenticateToken, strictLimiter, (req, res) => {
  const { walletAddress, tokenId, newTier } = req.body;

  if (!walletAddress || tokenId === undefined || !newTier) {
    return res.status(400).json({ error: 'walletAddress, tokenId, and newTier required' });
  }

  const nft = kingNFTs.get(tokenId);

  if (!nft) {
    return res.status(404).json({ error: 'NFT not found' });
  }

  if (nft.owner.toLowerCase() !== walletAddress.toLowerCase()) {
    return res.status(403).json({ error: 'Not the owner of this NFT' });
  }

  const currentTierKey = nft.tier.toUpperCase();
  const newTierKey = newTier.toUpperCase();

  if (!TIERS[newTierKey]) {
    return res.status(400).json({ error: 'Invalid tier', validTiers: Object.keys(TIERS) });
  }

  if (TIERS[newTierKey].id <= TIERS[currentTierKey].id) {
    return res.status(400).json({ error: 'Can only upgrade to a higher tier' });
  }

  // Check new tier supply
  if (mintedCounts[newTierKey] >= TIERS[newTierKey].maxSupply) {
    return res.status(400).json({ error: `${TIERS[newTierKey].name} tier is sold out` });
  }

  // Calculate upgrade cost
  const currentPrice = parseInt(TIERS[currentTierKey].priceWei);
  const newPrice = parseInt(TIERS[newTierKey].priceWei);
  const upgradeCost = newPrice - currentPrice;

  // Simulate upgrade
  mintedCounts[currentTierKey]--;
  mintedCounts[newTierKey]++;

  nft.tier = TIERS[newTierKey].name;
  nft.benefits = TIERS[newTierKey].benefits;
  nft.votingPower = TIERS[newTierKey].votingPower;
  nft.upgradedAt = new Date().toISOString();

  kingNFTs.set(tokenId, nft);

  res.json({
    success: true,
    message: `Successfully upgraded to ${TIERS[newTierKey].name} tier`,
    upgradeCost: `${upgradeCost / 1e18} POL`,
    nft,
    newBenefits: TIERS[newTierKey].benefits.map(b => BENEFIT_DESCRIPTIONS[b])
  });
});

/**
 * Get governance stats for Sovereign TV integration
 */
iamKingRouter.get('/governance/:walletAddress', authenticateToken, standardLimiter, (req, res) => {
  const { walletAddress } = req.params;
  const normalizedAddress = walletAddress.toLowerCase();

  let totalVotingPower = 0;
  const tokens = [];

  for (const [tokenId, nft] of kingNFTs.entries()) {
    if (nft.owner.toLowerCase() === normalizedAddress) {
      totalVotingPower += nft.votingPower;
      tokens.push({
        tokenId,
        tier: nft.tier,
        votingPower: nft.votingPower
      });
    }
  }

  res.json({
    walletAddress: normalizedAddress,
    totalVotingPower,
    tokens,
    canVote: totalVotingPower > 0,
    votingTier: totalVotingPower >= 25 ? 'Elite' 
      : totalVotingPower >= 10 ? 'Premium'
      : totalVotingPower >= 5 ? 'Standard'
      : totalVotingPower > 0 ? 'Basic'
      : 'None'
  });
});

/**
 * Sovereign TV content access check
 */
iamKingRouter.post('/sovereign-tv/access', authenticateToken, standardLimiter, (req, res) => {
  const { walletAddress, contentType } = req.body;

  if (!walletAddress || !contentType) {
    return res.status(400).json({ error: 'walletAddress and contentType required' });
  }

  // Map content types to required benefits
  const contentBenefitMap = {
    'basic': 'basic_streaming',
    'exclusive': 'exclusive_content',
    'early_release': 'early_access',
    'live': 'live_events',
    'vip': 'vip_events',
    'founder': 'founder_access'
  };

  const requiredBenefit = contentBenefitMap[contentType];

  if (!requiredBenefit) {
    return res.status(400).json({ 
      error: 'Invalid content type',
      validTypes: Object.keys(contentBenefitMap)
    });
  }

  const normalizedAddress = walletAddress.toLowerCase();
  let hasAccess = false;
  let accessTier = null;

  for (const [, nft] of kingNFTs.entries()) {
    if (nft.owner.toLowerCase() === normalizedAddress) {
      if (nft.benefits.includes(requiredBenefit)) {
        hasAccess = true;
        accessTier = nft.tier;
        break;
      }
    }
  }

  res.json({
    walletAddress: normalizedAddress,
    contentType,
    requiredBenefit,
    hasAccess,
    accessTier,
    message: hasAccess 
      ? `Access granted via ${accessTier} tier`
      : 'Access denied - upgrade your tier for this content'
  });
});

/**
 * Get collection stats
 */
iamKingRouter.get('/stats', (req, res) => {
  const totalMinted = Object.values(mintedCounts).reduce((a, b) => a + b, 0);
  const totalVotingPower = Array.from(kingNFTs.values()).reduce((sum, nft) => sum + nft.votingPower, 0);
  const uniqueHolders = new Set(Array.from(kingNFTs.values()).map(nft => nft.owner)).size;

  res.json({
    totalMinted,
    totalSupply: 5000,
    percentMinted: ((totalMinted / 5000) * 100).toFixed(2) + '%',
    uniqueHolders,
    totalVotingPower,
    tierBreakdown: Object.entries(TIERS).map(([key, tier]) => ({
      tier: tier.name,
      minted: mintedCounts[key],
      maxSupply: tier.maxSupply,
      remaining: tier.maxSupply - mintedCounts[key],
      percentSold: ((mintedCounts[key] / tier.maxSupply) * 100).toFixed(2) + '%'
    }))
  });
});

export { iamKingRouter };
