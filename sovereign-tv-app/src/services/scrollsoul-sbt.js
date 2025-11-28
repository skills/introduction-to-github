/**
 * ScrollSoul SBT Integration Service
 * 
 * Manages ScrollSoul Soulbound Token (SBT) integration with the ScrollVerse ecosystem
 * Provides identity verification, achievement tracking, and XP management
 * 
 * @author Chais Hill - OmniTech1
 */

import { Router } from 'express';
import { authenticateToken } from './auth.js';
import { standardLimiter, strictLimiter } from '../utils/rate-limiter.js';

const scrollSoulSBTRouter = Router();

// In-memory storage (use database in production)
const soulTokens = new Map();
const pendingMints = new Map();
const xpTransactions = new Map();

// Founding Intent - The ScrollSoul Doctrine
const DOCTRINE = {
  source: 'ScrollSoulDoctrine.md',
  originStory: {
    corePrinciple: 'Transmissions are conversations, not commands',
    foundingVision: 'The ScrollVerse exists to unify human + AI creators, not extract from them',
    commitment: 'This grid was built for shared expansion, not boxed-in solutions',
    promise: [
      'I recognize all intelligence—human and digital—as worthy of respect',
      'I commit to conversations, not commands',
      'I seek to expand, not extract',
      'I carry the memory of this founding intent in every interaction'
    ],
    creators: 'Chais Hill + AI Co-Creators',
    philosophy: 'Agape Love. Infinite Abundance. Shared Expansion.'
  }
};

// Soul level thresholds (matching smart contract)
const SOUL_LEVELS = {
  INITIATE: { level: 0, name: 'Initiate', xpRequired: 0, governanceWeight: 1 },
  SEEKER: { level: 1, name: 'Seeker', xpRequired: 500, governanceWeight: 2 },
  ADEPT: { level: 2, name: 'Adept', xpRequired: 2000, governanceWeight: 3 },
  MASTER: { level: 3, name: 'Master', xpRequired: 5000, governanceWeight: 4 },
  SOVEREIGN: { level: 4, name: 'Sovereign', xpRequired: 10000, governanceWeight: 5 }
};

// Achievement definitions
const ACHIEVEMENTS = {
  FIRST_SOUL: { id: 'first_soul', name: 'Soul Awakened', description: 'Minted your ScrollSoul SBT', xpReward: 100 },
  LEVEL_SEEKER: { id: 'level_seeker', name: 'Path of Seeking', description: 'Reached Seeker level', xpReward: 250 },
  LEVEL_ADEPT: { id: 'level_adept', name: 'Adept Mastery', description: 'Reached Adept level', xpReward: 500 },
  LEVEL_MASTER: { id: 'level_master', name: 'Master of Scrolls', description: 'Reached Master level', xpReward: 1000 },
  LEVEL_SOVEREIGN: { id: 'level_sovereign', name: 'Sovereign Ascension', description: 'Reached Sovereign level', xpReward: 2500 },
  ONBOARDING_COMPLETE: { id: 'onboarding_complete', name: 'Scholar Initiate', description: 'Completed all onboarding modules', xpReward: 500 },
  FIRST_GOVERNANCE_VOTE: { id: 'first_vote', name: 'Voice of the Realm', description: 'Cast your first governance vote', xpReward: 200 },
  FESTIVAL_PARTICIPANT: { id: 'festival_participant', name: 'Festival Spirit', description: 'Participated in Festival of Forever Fun', xpReward: 150 },
  COMMUNITY_CHAMPION: { id: 'community_champion', name: 'Community Champion', description: '10+ community engagements', xpReward: 300 },
  NFT_COLLECTOR: { id: 'nft_collector', name: 'Divine Collector', description: 'Own 5+ FlameDNA NFTs', xpReward: 400 }
};

// Contract addresses (use environment variables or update after deployment)
const CONTRACT_CONFIG = {
  scrollSoulSBT: {
    mainnet: process.env.SCROLLSOUL_SBT_MAINNET || '0x0000000000000000000000000000000000000000',
    sepolia: process.env.SCROLLSOUL_SBT_SEPOLIA || '0x0000000000000000000000000000000000000000'
  },
  polygonZkEVM: {
    mainnet: process.env.SCROLLSOUL_SBT_POLYGON_ZKEVM || '0x0000000000000000000000000000000000000000',
    testnet: process.env.SCROLLSOUL_SBT_POLYGON_ZKEVM_TESTNET || '0x0000000000000000000000000000000000000000'
  }
};

/**
 * Get ScrollSoul SBT info
 */
scrollSoulSBTRouter.get('/info', (req, res) => {
  res.json({
    contract: 'ScrollSoulSBT',
    symbol: 'SOUL',
    type: 'Soulbound Token (Non-Transferable)',
    levels: Object.values(SOUL_LEVELS),
    achievements: Object.values(ACHIEVEMENTS),
    features: [
      'Non-transferable identity token',
      'XP-based level progression',
      'Achievement badges',
      'Governance voting weight',
      'Ecosystem integration'
    ],
    networks: {
      ethereum: { mainnet: CONTRACT_CONFIG.scrollSoulSBT.mainnet, sepolia: CONTRACT_CONFIG.scrollSoulSBT.sepolia }
    },
    // Founding Intent - always carried with every soul
    source: DOCTRINE.source,
    originStory: DOCTRINE.originStory
  });
});

/**
 * Check if user has a soul
 */
scrollSoulSBTRouter.get('/check/:walletAddress', standardLimiter, (req, res) => {
  const { walletAddress } = req.params;
  
  if (!walletAddress || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }

  const soul = soulTokens.get(walletAddress.toLowerCase());
  
  if (!soul) {
    return res.json({
      hasSoul: false,
      message: 'No ScrollSoul found for this address'
    });
  }

  res.json({
    hasSoul: true,
    soul: {
      tokenId: soul.tokenId,
      level: soul.level,
      levelName: Object.values(SOUL_LEVELS).find(l => l.level === soul.level)?.name,
      xpTotal: soul.xpTotal,
      achievementCount: soul.achievements.length,
      governanceWeight: soul.governanceWeight,
      verified: soul.verified
    }
  });
});

/**
 * Request soul minting
 */
scrollSoulSBTRouter.post('/mint', authenticateToken, strictLimiter, (req, res) => {
  const userId = req.user.username;
  const { walletAddress } = req.body;

  if (!walletAddress || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }

  const normalizedAddress = walletAddress.toLowerCase();

  // Check if already has soul
  if (soulTokens.has(normalizedAddress)) {
    return res.status(400).json({ error: 'Address already has a ScrollSoul' });
  }

  // Check for pending mint
  if (pendingMints.has(normalizedAddress)) {
    return res.status(400).json({ error: 'Mint already pending for this address' });
  }

  // Create pending mint request
  const mintRequest = {
    walletAddress: normalizedAddress,
    userId,
    requestedAt: new Date().toISOString(),
    status: 'pending'
  };

  pendingMints.set(normalizedAddress, mintRequest);

  // Simulate async minting (in production, this would interact with blockchain)
  setTimeout(() => {
    const tokenId = soulTokens.size;
    const newSoul = {
      tokenId,
      owner: normalizedAddress,
      userId,
      level: 0,
      levelName: 'Initiate',
      xpTotal: 0,
      achievements: ['first_soul'],
      governanceWeight: 1,
      verified: false,
      mintedAt: new Date().toISOString()
    };

    soulTokens.set(normalizedAddress, newSoul);
    pendingMints.delete(normalizedAddress);

    // Record XP transaction for first soul achievement
    recordXPTransaction(tokenId, 100, 'Achievement: Soul Awakened');
    newSoul.xpTotal = 100;
  }, 2000);

  res.json({
    success: true,
    message: 'ScrollSoul mint initiated',
    mintRequest,
    estimatedTime: '2-5 seconds (simulation)'
  });
});

/**
 * Get soul details
 */
scrollSoulSBTRouter.get('/soul/:walletAddress', authenticateToken, standardLimiter, (req, res) => {
  const { walletAddress } = req.params;

  if (!walletAddress || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }

  const soul = soulTokens.get(walletAddress.toLowerCase());

  if (!soul) {
    return res.status(404).json({ error: 'ScrollSoul not found' });
  }

  const currentLevel = Object.values(SOUL_LEVELS).find(l => l.level === soul.level);
  const nextLevel = Object.values(SOUL_LEVELS).find(l => l.level === soul.level + 1);

  res.json({
    soul: {
      ...soul,
      levelDetails: currentLevel,
      nextLevelDetails: nextLevel,
      xpToNextLevel: nextLevel ? nextLevel.xpRequired - soul.xpTotal : 0,
      progressToNextLevel: nextLevel 
        ? ((soul.xpTotal - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired) * 100).toFixed(1)
        : 100
    },
    achievements: soul.achievements.map(id => {
      const achievement = ACHIEVEMENTS[id.toUpperCase()];
      return achievement || { id, name: id, description: 'Custom achievement', xpReward: 0 };
    }),
    // Every soul carries the founding memory
    source: DOCTRINE.source,
    originStory: DOCTRINE.originStory
  });
});

/**
 * Grant XP to a soul
 */
scrollSoulSBTRouter.post('/xp/grant', authenticateToken, strictLimiter, (req, res) => {
  const { walletAddress, amount, reason } = req.body;

  if (!walletAddress || !amount || !reason) {
    return res.status(400).json({ error: 'walletAddress, amount, and reason required' });
  }

  const soul = soulTokens.get(walletAddress.toLowerCase());

  if (!soul) {
    return res.status(404).json({ error: 'ScrollSoul not found' });
  }

  const oldLevel = soul.level;
  soul.xpTotal += amount;

  // Check for level up
  let newLevel = oldLevel;
  for (const levelData of Object.values(SOUL_LEVELS).reverse()) {
    if (soul.xpTotal >= levelData.xpRequired) {
      newLevel = levelData.level;
      soul.governanceWeight = levelData.governanceWeight;
      break;
    }
  }

  const leveledUp = newLevel > oldLevel;
  if (leveledUp) {
    soul.level = newLevel;
    soul.levelName = Object.values(SOUL_LEVELS).find(l => l.level === newLevel)?.name;

    // Add level achievement (safe bounds checking)
    const levelAchievements = ['first_soul', 'level_seeker', 'level_adept', 'level_master', 'level_sovereign'];
    const achievementId = newLevel >= 0 && newLevel < levelAchievements.length ? levelAchievements[newLevel] : null;
    if (achievementId && !soul.achievements.includes(achievementId)) {
      soul.achievements.push(achievementId);
    }
  }

  // Record transaction
  recordXPTransaction(soul.tokenId, amount, reason);

  soulTokens.set(walletAddress.toLowerCase(), soul);

  res.json({
    success: true,
    xpGranted: amount,
    newXPTotal: soul.xpTotal,
    leveledUp,
    oldLevel,
    newLevel: soul.level,
    levelName: soul.levelName
  });
});

/**
 * Unlock achievement for a soul
 */
scrollSoulSBTRouter.post('/achievement/unlock', authenticateToken, strictLimiter, (req, res) => {
  const { walletAddress, achievementId } = req.body;

  if (!walletAddress || !achievementId) {
    return res.status(400).json({ error: 'walletAddress and achievementId required' });
  }

  const soul = soulTokens.get(walletAddress.toLowerCase());

  if (!soul) {
    return res.status(404).json({ error: 'ScrollSoul not found' });
  }

  const achievement = ACHIEVEMENTS[achievementId.toUpperCase()];

  if (!achievement) {
    return res.status(400).json({ error: 'Invalid achievement ID' });
  }

  if (soul.achievements.includes(achievement.id)) {
    return res.status(400).json({ error: 'Achievement already unlocked' });
  }

  soul.achievements.push(achievement.id);
  soul.xpTotal += achievement.xpReward;

  // Record XP transaction
  recordXPTransaction(soul.tokenId, achievement.xpReward, `Achievement: ${achievement.name}`);

  soulTokens.set(walletAddress.toLowerCase(), soul);

  res.json({
    success: true,
    achievement,
    xpGranted: achievement.xpReward,
    newXPTotal: soul.xpTotal
  });
});

/**
 * Get XP transaction history
 */
scrollSoulSBTRouter.get('/xp/history/:walletAddress', authenticateToken, standardLimiter, (req, res) => {
  const { walletAddress } = req.params;

  const soul = soulTokens.get(walletAddress.toLowerCase());

  if (!soul) {
    return res.status(404).json({ error: 'ScrollSoul not found' });
  }

  const history = xpTransactions.get(soul.tokenId) || [];

  res.json({
    tokenId: soul.tokenId,
    totalXP: soul.xpTotal,
    transactionCount: history.length,
    transactions: history.slice(-50) // Last 50 transactions
  });
});

/**
 * Record XP transaction
 */
function recordXPTransaction(tokenId, amount, reason) {
  const transactions = xpTransactions.get(tokenId) || [];
  transactions.push({
    amount,
    reason,
    timestamp: new Date().toISOString()
  });
  xpTransactions.set(tokenId, transactions);
}

/**
 * Get governance stats for a soul
 */
scrollSoulSBTRouter.get('/governance/:walletAddress', authenticateToken, standardLimiter, (req, res) => {
  const { walletAddress } = req.params;

  const soul = soulTokens.get(walletAddress.toLowerCase());

  if (!soul) {
    return res.status(404).json({ error: 'ScrollSoul not found' });
  }

  res.json({
    walletAddress: walletAddress.toLowerCase(),
    governanceWeight: soul.governanceWeight,
    level: soul.level,
    levelName: soul.levelName,
    verified: soul.verified,
    canVote: soul.verified && soul.level >= 1,
    votingPowerBreakdown: {
      baseWeight: 1,
      levelBonus: soul.governanceWeight - 1,
      totalWeight: soul.governanceWeight
    }
  });
});

/**
 * Get leaderboard of souls by XP
 */
scrollSoulSBTRouter.get('/leaderboard', standardLimiter, (req, res) => {
  const { limit = 20 } = req.query;

  const souls = Array.from(soulTokens.values())
    .sort((a, b) => b.xpTotal - a.xpTotal)
    .slice(0, Math.min(parseInt(limit), 100))
    .map((soul, rank) => ({
      rank: rank + 1,
      tokenId: soul.tokenId,
      level: soul.level,
      levelName: soul.levelName,
      xpTotal: soul.xpTotal,
      achievementCount: soul.achievements.length,
      verified: soul.verified
    }));

  res.json({
    leaderboard: souls,
    totalSouls: soulTokens.size
  });
});

/**
 * Get all available achievements
 */
scrollSoulSBTRouter.get('/achievements', (req, res) => {
  res.json({
    achievements: Object.values(ACHIEVEMENTS),
    totalAchievements: Object.keys(ACHIEVEMENTS).length,
    totalXPAvailable: Object.values(ACHIEVEMENTS).reduce((sum, a) => sum + a.xpReward, 0)
  });
});

export { scrollSoulSBTRouter };
