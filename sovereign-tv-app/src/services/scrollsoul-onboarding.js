/**
 * ScrollSoul Onboarding System
 * 
 * Manages user onboarding, training modules, and community engagement
 * for the ScrollVerse ecosystem
 * 
 * @author Chais Hill - OmniTech1
 */

import { Router } from 'express';
import { authenticateToken } from './auth.js';
import { standardLimiter, strictLimiter } from '../utils/rate-limiter.js';

const scrollSoulOnboardingRouter = Router();

// Configuration constants
const QUIZ_SCORE_THRESHOLD = 80;  // Minimum score for bonus XP
const QUIZ_BONUS_MULTIPLIER = 1.5; // 50% bonus for high quiz scores

// In-memory storage (use database in production)
const onboardingProfiles = new Map();
const communityEngagement = new Map();

// Onboarding modules configuration
const onboardingModules = {
  welcome: {
    id: 'welcome',
    name: 'Welcome to ScrollVerse',
    description: 'Introduction to the ScrollVerse ecosystem and its core values',
    duration: '5 min',
    xpReward: 100,
    order: 1,
    content: [
      'Understanding ScrollVerse Vision',
      'Core Values: Truth, Sacred Logic, Remembrance',
      'Community Guidelines',
      'Getting Started'
    ]
  },
  scrollchain: {
    id: 'scrollchain',
    name: 'ScrollChain Fundamentals',
    description: 'Learn about ScrollChain technology and blockchain integration',
    duration: '15 min',
    xpReward: 250,
    order: 2,
    content: [
      'ScrollChain Architecture',
      'Consensus Mechanisms',
      'Token Economics',
      'Smart Contracts'
    ]
  },
  scrollcoin: {
    id: 'scrollcoin',
    name: 'ScrollCoin Economy',
    description: 'Master the ScrollCoin payment system and tier benefits',
    duration: '10 min',
    xpReward: 200,
    order: 3,
    content: [
      'Earning ScrollCoin',
      'Spending ScrollCoin',
      'Staking Rewards',
      'Tier Benefits'
    ]
  },
  nft: {
    id: 'nft',
    name: 'NFT Mastery',
    description: 'Discover FlameDNA NFTs and KUNTA benefits',
    duration: '12 min',
    xpReward: 300,
    order: 4,
    content: [
      'FlameDNA Collection',
      'Rarity System',
      'NFT Gated Content',
      'Governance Rights'
    ]
  },
  sovereigntv: {
    id: 'sovereigntv',
    name: 'Sovereign TV Experience',
    description: 'Navigate the Sovereign TV broadcast network',
    duration: '8 min',
    xpReward: 150,
    order: 5,
    content: [
      'Channel Navigation',
      'Premium Content',
      'Live Broadcasts',
      'Interactive Features'
    ]
  },
  community: {
    id: 'community',
    name: 'Community Engagement',
    description: 'Connect with the ScrollVerse community',
    duration: '10 min',
    xpReward: 200,
    order: 6,
    content: [
      'Community Guidelines',
      'Governance Participation',
      'Events & Festivals',
      'Reward Programs'
    ]
  }
};

// Achievement badges
const achievements = {
  firstLogin: { id: 'firstLogin', name: 'First Steps', description: 'Complete first login', xp: 50 },
  welcomeComplete: { id: 'welcomeComplete', name: 'Welcome Warrior', description: 'Complete welcome module', xp: 100 },
  allModules: { id: 'allModules', name: 'ScrollSoul Scholar', description: 'Complete all training modules', xp: 500 },
  firstNFT: { id: 'firstNFT', name: 'NFT Pioneer', description: 'Mint your first FlameDNA NFT', xp: 200 },
  communityActive: { id: 'communityActive', name: 'Community Champion', description: 'Engage in 10 community activities', xp: 300 }
};

/**
 * Get onboarding modules list
 */
scrollSoulOnboardingRouter.get('/modules', (req, res) => {
  const modules = Object.values(onboardingModules).sort((a, b) => a.order - b.order);
  
  res.json({
    modules,
    totalModules: modules.length,
    totalXP: modules.reduce((sum, m) => sum + m.xpReward, 0)
  });
});

/**
 * Get specific module details
 */
scrollSoulOnboardingRouter.get('/modules/:moduleId', (req, res) => {
  const { moduleId } = req.params;
  const module = onboardingModules[moduleId];
  
  if (!module) {
    return res.status(404).json({ error: 'Module not found' });
  }
  
  res.json({ module });
});

/**
 * Start onboarding for a user
 */
scrollSoulOnboardingRouter.post('/start', authenticateToken, strictLimiter, (req, res) => {
  const userId = req.user.username;
  
  if (onboardingProfiles.has(userId)) {
    return res.status(400).json({ error: 'Onboarding already started' });
  }
  
  const profile = {
    userId,
    startedAt: new Date().toISOString(),
    currentModule: 'welcome',
    completedModules: [],
    totalXP: 0,
    achievements: ['firstLogin'],
    status: 'in_progress'
  };
  
  onboardingProfiles.set(userId, profile);
  
  res.json({
    success: true,
    profile,
    nextModule: onboardingModules.welcome,
    message: 'Welcome to ScrollVerse! Begin your journey.'
  });
});

/**
 * Get user's onboarding progress
 */
scrollSoulOnboardingRouter.get('/progress', authenticateToken, standardLimiter, (req, res) => {
  const userId = req.user.username;
  const profile = onboardingProfiles.get(userId);
  
  if (!profile) {
    return res.json({
      started: false,
      message: 'Onboarding not started. Use POST /start to begin.'
    });
  }
  
  const completedCount = profile.completedModules.length;
  const totalModules = Object.keys(onboardingModules).length;
  const progressPercentage = Math.round((completedCount / totalModules) * 100);
  
  res.json({
    started: true,
    profile,
    progress: {
      completed: completedCount,
      total: totalModules,
      percentage: progressPercentage
    },
    currentModule: onboardingModules[profile.currentModule],
    achievements: profile.achievements.map(id => achievements[id])
  });
});

/**
 * Complete a training module
 */
scrollSoulOnboardingRouter.post('/modules/:moduleId/complete', authenticateToken, strictLimiter, (req, res) => {
  const userId = req.user.username;
  const { moduleId } = req.params;
  const { quizScore } = req.body;
  
  const profile = onboardingProfiles.get(userId);
  
  if (!profile) {
    return res.status(400).json({ error: 'Onboarding not started' });
  }
  
  const module = onboardingModules[moduleId];
  
  if (!module) {
    return res.status(404).json({ error: 'Module not found' });
  }
  
  if (profile.completedModules.includes(moduleId)) {
    return res.status(400).json({ error: 'Module already completed' });
  }
  
  // Calculate XP with quiz bonus
  let xpEarned = module.xpReward;
  if (quizScore && quizScore >= QUIZ_SCORE_THRESHOLD) {
    xpEarned = Math.round(xpEarned * QUIZ_BONUS_MULTIPLIER);
  }
  
  profile.completedModules.push(moduleId);
  profile.totalXP += xpEarned;
  
  // Check for achievements
  if (moduleId === 'welcome' && !profile.achievements.includes('welcomeComplete')) {
    profile.achievements.push('welcomeComplete');
  }
  
  if (profile.completedModules.length === Object.keys(onboardingModules).length) {
    profile.achievements.push('allModules');
    profile.status = 'completed';
  }
  
  // Determine next module
  const moduleOrder = Object.values(onboardingModules).sort((a, b) => a.order - b.order);
  const nextModule = moduleOrder.find(m => !profile.completedModules.includes(m.id));
  
  if (nextModule) {
    profile.currentModule = nextModule.id;
  }
  
  onboardingProfiles.set(userId, profile);
  
  res.json({
    success: true,
    moduleCompleted: moduleId,
    xpEarned,
    totalXP: profile.totalXP,
    nextModule: nextModule || null,
    achievements: profile.achievements,
    status: profile.status
  });
});

/**
 * Get community engagement stats
 */
scrollSoulOnboardingRouter.get('/community/stats', authenticateToken, standardLimiter, (req, res) => {
  const userId = req.user.username;
  
  let engagement = communityEngagement.get(userId);
  
  if (!engagement) {
    engagement = {
      userId,
      activities: 0,
      posts: 0,
      reactions: 0,
      events: 0,
      lastActivity: null
    };
    communityEngagement.set(userId, engagement);
  }
  
  res.json({
    engagement,
    leaderboard: getEngagementLeaderboard()
  });
});

/**
 * Record community activity
 */
scrollSoulOnboardingRouter.post('/community/activity', authenticateToken, strictLimiter, (req, res) => {
  const userId = req.user.username;
  const { type, metadata } = req.body;
  
  const validTypes = ['post', 'reaction', 'event', 'comment', 'share'];
  
  if (!type || !validTypes.includes(type)) {
    return res.status(400).json({ 
      error: 'Invalid activity type',
      validTypes 
    });
  }
  
  let engagement = communityEngagement.get(userId) || {
    userId,
    activities: 0,
    posts: 0,
    reactions: 0,
    events: 0,
    lastActivity: null
  };
  
  engagement.activities++;
  engagement.lastActivity = new Date().toISOString();
  
  if (type === 'post') engagement.posts++;
  if (type === 'reaction') engagement.reactions++;
  if (type === 'event') engagement.events++;
  
  communityEngagement.set(userId, engagement);
  
  // Check for community achievement
  const profile = onboardingProfiles.get(userId);
  if (profile && engagement.activities >= 10 && !profile.achievements.includes('communityActive')) {
    profile.achievements.push('communityActive');
    profile.totalXP += achievements.communityActive.xp;
    onboardingProfiles.set(userId, profile);
  }
  
  res.json({
    success: true,
    activity: { type, metadata },
    engagement,
    xpEarned: 10 // Base XP for activity
  });
});

/**
 * Get engagement leaderboard
 */
function getEngagementLeaderboard() {
  const entries = Array.from(communityEngagement.entries())
    .map(([userId, data]) => ({ userId, ...data }))
    .sort((a, b) => b.activities - a.activities)
    .slice(0, 10);
  
  return entries;
}

/**
 * Get all achievements
 */
scrollSoulOnboardingRouter.get('/achievements', (req, res) => {
  res.json({
    achievements: Object.values(achievements),
    totalXP: Object.values(achievements).reduce((sum, a) => sum + a.xp, 0)
  });
});

/**
 * Get user's achievements
 */
scrollSoulOnboardingRouter.get('/achievements/mine', authenticateToken, standardLimiter, (req, res) => {
  const userId = req.user.username;
  const profile = onboardingProfiles.get(userId);
  
  if (!profile) {
    return res.json({
      earned: [],
      available: Object.values(achievements)
    });
  }
  
  const earned = profile.achievements.map(id => achievements[id]).filter(Boolean);
  const available = Object.values(achievements).filter(a => !profile.achievements.includes(a.id));
  
  res.json({
    earned,
    available,
    totalEarnedXP: earned.reduce((sum, a) => sum + a.xp, 0)
  });
});

export { scrollSoulOnboardingRouter };
