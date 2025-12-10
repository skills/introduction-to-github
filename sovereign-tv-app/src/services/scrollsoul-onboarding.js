/**
 * ScrollSoul Onboarding Service
 * 
 * Immersive introduction to the ScrollVerse ecosystem for new sovereigns.
 * Includes educational modules about ScrollCoin, NFTs, and community engagement.
 * ScrollSoul Onboarding System
 * 
 * Manages user onboarding, training modules, and community engagement
 * for the ScrollVerse ecosystem
 * 
 * @author Chais Hill - OmniTech1
 */

import { Router } from 'express';
import { authenticateToken } from './auth.js';

const router = Router();

// In-memory storage for onboarding progress (replace with database in production)
const onboardingProgress = new Map();

// Educational modules structure
const ONBOARDING_MODULES = [
  {
    id: 'welcome',
    title: 'Welcome to ScrollVerse',
    description: 'Introduction to the sovereign ecosystem',
    duration: 5,
    topics: [
      'What is ScrollVerse?',
      'Your journey as a Sovereign',
      'The OmniVerse vision',
      'Community principles'
    ],
    requiredForCompletion: true
  },
  {
    id: 'scrollcoin',
    title: 'ScrollCoin Economy',
    description: 'Understanding the ScrollCoin payment system',
    duration: 10,
    topics: [
      'What is ScrollCoin?',
      'How to earn ScrollCoin',
      'Payment tiers and benefits',
      'ScrollCoin marketplace',
      'Rewards and incentives'
    ],
    requiredForCompletion: true
  },
  {
    id: 'nfts',
    title: 'KUNTA NFTs & Digital Assets',
    description: 'Introduction to NFT ownership and benefits',
    duration: 8,
    topics: [
      'Understanding NFTs',
      'KUNTA Genesis Collection',
      'NFT benefits and privileges',
      'How to acquire NFTs',
      'NFT-gated content access'
    ],
    requiredForCompletion: true
  },
  {
    id: 'community',
    title: 'Community Engagement Pathways',
    description: 'Connect with fellow Sovereigns',
    duration: 7,
    topics: [
      'Community features',
      'Social interactions',
      'Governance participation',
      'Events and gatherings',
      'Building your reputation'
    ],
    requiredForCompletion: true
  },
  {
    id: 'streaming',
    title: 'Content & Streaming',
    description: 'Accessing the Legacy of Light catalog',
    duration: 5,
    topics: [
      'Music catalog overview',
      'Healing frequencies',
      'Video content access',
      'Creating playlists',
      'Premium content'
    ],
    requiredForCompletion: false
  },
  {
    id: 'pdp',
    title: 'Prophecy Documentation Protocol',
    description: 'Sacred documentation and archives',
    duration: 6,
    topics: [
      'What is PDP?',
      'Accessing documents',
      'Document attestation',
      'Contributing to the codex',
      'Governance through documentation'
    ],
    requiredForCompletion: false
  }
];

// Get onboarding overview
router.get('/overview', (req, res) => {
  const totalModules = ONBOARDING_MODULES.length;
  const requiredModules = ONBOARDING_MODULES.filter(m => m.requiredForCompletion).length;
  const estimatedTime = ONBOARDING_MODULES.reduce((sum, m) => sum + m.duration, 0);

  res.json({
    title: 'ScrollSoul Onboarding',
    description: 'Your immersive journey into the ScrollVerse ecosystem',
    totalModules,
    requiredModules,
    optionalModules: totalModules - requiredModules,
    estimatedTimeMinutes: estimatedTime,
    benefits: [
      'Deep understanding of ScrollVerse ecosystem',
      'Unlock all platform features',
      'Bonus ScrollCoin rewards',
      'Special "Awakened Sovereign" badge',
      'Priority community support'
    ],
    modules: ONBOARDING_MODULES.map(m => ({
      id: m.id,
      title: m.title,
      description: m.description,
      duration: m.duration,
      required: m.requiredForCompletion
    }))
  });
});

// Get all onboarding modules
router.get('/modules', (req, res) => {
  res.json({
    modules: ONBOARDING_MODULES
  });
});

// Get specific module details
router.get('/modules/:moduleId', (req, res) => {
  const { moduleId } = req.params;
  const module = ONBOARDING_MODULES.find(m => m.id === moduleId);

  if (!module) {
    return res.status(404).json({ error: 'Module not found' });
  }

  res.json({
    module,
    content: {
      introduction: `Welcome to the ${module.title} module!`,
      learningObjectives: module.topics,
      practicalExercises: [
        'Interactive quiz',
        'Hands-on demonstration',
        'Community discussion'
      ],
      resources: [
        'Official documentation',
        'Video tutorials',
        'Community guides'
      ]
    }
  });
});

// Get user's onboarding progress (requires authentication)
router.get('/progress', authenticateToken, (req, res) => {
  const username = req.user.username;
  const progress = onboardingProgress.get(username) || {
    startedAt: new Date().toISOString(),
    completedModules: [],
    currentModule: null,
    isCompleted: false,
    rewardsEarned: []
  };

  const completionPercentage = Math.round(
    (progress.completedModules.length / ONBOARDING_MODULES.filter(m => m.requiredForCompletion).length) * 100
  );

  res.json({
    username,
    progress,
    completionPercentage,
    nextModule: getNextModule(progress.completedModules),
    totalModules: ONBOARDING_MODULES.length,
    completedModules: progress.completedModules.length
  });
});

// Start onboarding (requires authentication)
router.post('/start', authenticateToken, (req, res) => {
  const username = req.user.username;
  
  if (onboardingProgress.has(username)) {
    return res.json({
      message: 'Onboarding already started',
      progress: onboardingProgress.get(username)
    });
  }

  const newProgress = {
    startedAt: new Date().toISOString(),
    completedModules: [],
    currentModule: 'welcome',
    isCompleted: false,
    rewardsEarned: []
  };

  onboardingProgress.set(username, newProgress);

  res.json({
    message: 'Welcome to ScrollVerse! Your onboarding journey begins now.',
    progress: newProgress,
    firstModule: ONBOARDING_MODULES[0]
  });
});

// Complete a module (requires authentication)
router.post('/modules/:moduleId/complete', authenticateToken, (req, res) => {
  const username = req.user.username;
  const { moduleId } = req.params;
  const { score } = req.body;

  const module = ONBOARDING_MODULES.find(m => m.id === moduleId);
  if (!module) {
    return res.status(404).json({ error: 'Module not found' });
  }

  const progress = onboardingProgress.get(username) || {
    startedAt: new Date().toISOString(),
    completedModules: [],
    currentModule: null,
    isCompleted: false,
    rewardsEarned: []
  };

  // Check if already completed
  if (progress.completedModules.some(m => m.moduleId === moduleId)) {
    return res.json({
      message: 'Module already completed',
      progress
    });
  }

  // Add to completed modules
  progress.completedModules.push({
    moduleId,
    completedAt: new Date().toISOString(),
    score: score || 100
  });

  // Award ScrollCoin rewards
  const reward = module.requiredForCompletion ? 50 : 25;
  progress.rewardsEarned.push({
    type: 'scrollcoin',
    amount: reward,
    reason: `Completed ${module.title}`,
    timestamp: new Date().toISOString()
  });

  // Check if onboarding is complete
  const requiredModulesCompleted = progress.completedModules.filter(m => {
    const mod = ONBOARDING_MODULES.find(om => om.id === m.moduleId);
    return mod && mod.requiredForCompletion;
  }).length;

  const totalRequired = ONBOARDING_MODULES.filter(m => m.requiredForCompletion).length;
  
  if (requiredModulesCompleted === totalRequired && !progress.isCompleted) {
    progress.isCompleted = true;
    progress.completedAt = new Date().toISOString();
    
    // Bonus completion reward
    progress.rewardsEarned.push({
      type: 'scrollcoin',
      amount: 200,
      reason: 'Completed ScrollSoul Onboarding',
      timestamp: new Date().toISOString()
    });
    
    progress.rewardsEarned.push({
      type: 'badge',
      name: 'Awakened Sovereign',
      description: 'Completed the ScrollSoul Onboarding journey',
      timestamp: new Date().toISOString()
    });
  }

  // Update current module to next one
  progress.currentModule = getNextModule(progress.completedModules);

  onboardingProgress.set(username, progress);

  res.json({
    message: `Module "${module.title}" completed successfully!`,
    reward: {
      scrollcoin: reward,
      message: `You earned ${reward} ScrollCoin!`
    },
    progress,
    nextModule: progress.currentModule ? ONBOARDING_MODULES.find(m => m.id === progress.currentModule) : null,
    onboardingComplete: progress.isCompleted
  });
});

// Skip optional module (requires authentication)
router.post('/modules/:moduleId/skip', authenticateToken, (req, res) => {
  const username = req.user.username;
  const { moduleId } = req.params;

  const module = ONBOARDING_MODULES.find(m => m.id === moduleId);
  if (!module) {
    return res.status(404).json({ error: 'Module not found' });
  }

  if (module.requiredForCompletion) {
    return res.status(400).json({ 
      error: 'Cannot skip required module',
      module: module.title
    });
  }

  const progress = onboardingProgress.get(username);
  if (progress) {
    progress.currentModule = getNextModule(progress.completedModules, moduleId);
    onboardingProgress.set(username, progress);
  }

  res.json({
    message: `Skipped optional module: ${module.title}`,
    nextModule: progress?.currentModule
  });
});

// Get onboarding statistics (public)
router.get('/stats', (req, res) => {
  const totalUsers = onboardingProgress.size;
  const completedUsers = Array.from(onboardingProgress.values()).filter(p => p.isCompleted).length;
  const averageCompletion = totalUsers > 0 
    ? Array.from(onboardingProgress.values()).reduce((sum, p) => sum + p.completedModules.length, 0) / totalUsers 
    : 0;

  res.json({
    totalUsers,
    completedUsers,
    completionRate: totalUsers > 0 ? Math.round((completedUsers / totalUsers) * 100) : 0,
    averageModulesCompleted: Math.round(averageCompletion * 10) / 10,
    totalModules: ONBOARDING_MODULES.length,
    activeOnboarding: totalUsers - completedUsers
  });
});

// Helper function to get next module
function getNextModule(completedModules, skipModule = null) {
  const completedIds = completedModules.map(m => m.moduleId);
  if (skipModule) completedIds.push(skipModule);
  
  for (const module of ONBOARDING_MODULES) {
    if (!completedIds.includes(module.id)) {
      return module.id;
    }
  }
  return null;
}

export { router as onboardingRouter };
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
