/**
 * ScrollSoul Onboarding Service
 * 
 * Immersive introduction to the ScrollVerse ecosystem for new sovereigns.
 * Includes educational modules about ScrollCoin, NFTs, and community engagement.
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
