/**
 * ScrollSoul Educational Modules Service
 * 
 * Provides Type-VII realization educational modules based on knowledge pillars:
 * - Truth
 * - Anchor
 * - Creativity
 * - Mastery
 * 
 * These modules serve as entry points for contributors joining the ScrollSoul community.
 * Integrates NFT-linked metadata, sovereign decision analytics, and frequency-based
 * interactions (528 Hz and 963 Hz).
 * 
 * @author OmniTech1
 */

import { Router } from 'express';
import { authenticateToken } from './auth.js';
import { TIER_HIERARCHY, HEALING_FREQUENCIES } from '../utils/constants.js';
import { standardLimiter } from '../utils/rate-limiter.js';

const scrollSoulRouter = Router();

// Knowledge Pillars - Core educational foundations
export const KNOWLEDGE_PILLARS = {
  TRUTH: {
    id: 'truth',
    name: 'Truth',
    description: 'The foundation of all knowledge - seeking and embodying universal truth',
    frequency: '963Hz',
    symbol: '🔱',
    modules: ['truth-awakening', 'truth-recognition', 'truth-embodiment']
  },
  ANCHOR: {
    id: 'anchor',
    name: 'Anchor',
    description: 'Grounding in purpose and maintaining stability through transformation',
    frequency: '432Hz',
    symbol: '⚓',
    modules: ['anchor-foundation', 'anchor-stability', 'anchor-sovereignty']
  },
  CREATIVITY: {
    id: 'creativity',
    name: 'Creativity',
    description: 'Channeling divine inspiration to manifest new realities',
    frequency: '528Hz',
    symbol: '🎨',
    modules: ['creativity-spark', 'creativity-flow', 'creativity-mastery']
  },
  MASTERY: {
    id: 'mastery',
    name: 'Mastery',
    description: 'Achieving excellence through dedicated practice and integration',
    frequency: '777Hz',
    symbol: '👑',
    modules: ['mastery-initiation', 'mastery-progression', 'mastery-transcendence']
  }
};

// Type-VII Realization Levels
export const TYPE_VII_LEVELS = {
  INITIATE: { level: 1, name: 'Initiate', xpRequired: 0 },
  SEEKER: { level: 2, name: 'Seeker', xpRequired: 1000 },
  AWAKENED: { level: 3, name: 'Awakened', xpRequired: 5000 },
  RESONANT: { level: 4, name: 'Resonant', xpRequired: 15000 },
  SOVEREIGN: { level: 5, name: 'Sovereign', xpRequired: 50000 },
  TRANSCENDENT: { level: 6, name: 'Transcendent', xpRequired: 150000 },
  REALIZED: { level: 7, name: 'Type-VII Realized', xpRequired: 500000 }
};

// Educational Modules for ScrollSoul community
const educationalModules = [
  // Truth Pillar Modules
  {
    id: 'truth-awakening',
    pillar: 'truth',
    title: 'Truth Awakening',
    description: 'Begin your journey by recognizing the nature of truth in all things',
    frequency: '963Hz',
    tier: 'free',
    duration: 30,
    xpReward: 250,
    lessons: [
      { id: 'ta-01', title: 'What is Truth?', duration: 10 },
      { id: 'ta-02', title: 'Recognizing Illusion', duration: 10 },
      { id: 'ta-03', title: 'Embodying Authenticity', duration: 10 }
    ],
    nftBonus: { type: 'kunta', multiplier: 1.5 },
    assessmentType: 'reflection'
  },
  {
    id: 'truth-recognition',
    pillar: 'truth',
    title: 'Truth Recognition',
    description: 'Develop the ability to discern truth in complex situations',
    frequency: '963Hz',
    tier: 'premium',
    duration: 45,
    xpReward: 500,
    lessons: [
      { id: 'tr-01', title: 'Patterns of Deception', duration: 15 },
      { id: 'tr-02', title: 'Intuitive Truth Sensing', duration: 15 },
      { id: 'tr-03', title: 'Truth in Relationships', duration: 15 }
    ],
    nftBonus: { type: 'kunta', multiplier: 1.75 },
    assessmentType: 'scenario'
  },
  {
    id: 'truth-embodiment',
    pillar: 'truth',
    title: 'Truth Embodiment',
    description: 'Become a living expression of universal truth',
    frequency: '963Hz',
    tier: 'elite',
    duration: 60,
    xpReward: 1000,
    lessons: [
      { id: 'te-01', title: 'Truth as Identity', duration: 20 },
      { id: 'te-02', title: 'Speaking Truth to Power', duration: 20 },
      { id: 'te-03', title: 'Truth Transmission', duration: 20 }
    ],
    nftBonus: { type: 'kunta', multiplier: 2.0 },
    assessmentType: 'demonstration'
  },
  // Anchor Pillar Modules
  {
    id: 'anchor-foundation',
    pillar: 'anchor',
    title: 'Anchor Foundation',
    description: 'Establish your grounding in purpose and stability',
    frequency: '432Hz',
    tier: 'free',
    duration: 30,
    xpReward: 250,
    lessons: [
      { id: 'af-01', title: 'Finding Your Center', duration: 10 },
      { id: 'af-02', title: 'Roots of Purpose', duration: 10 },
      { id: 'af-03', title: 'Stability in Chaos', duration: 10 }
    ],
    nftBonus: { type: 'kunta', multiplier: 1.5 },
    assessmentType: 'practice'
  },
  {
    id: 'anchor-stability',
    pillar: 'anchor',
    title: 'Anchor Stability',
    description: 'Maintain equilibrium through life\'s transformations',
    frequency: '432Hz',
    tier: 'premium',
    duration: 45,
    xpReward: 500,
    lessons: [
      { id: 'as-01', title: 'Weathering Storms', duration: 15 },
      { id: 'as-02', title: 'Flexible Strength', duration: 15 },
      { id: 'as-03', title: 'Inner Sanctuary', duration: 15 }
    ],
    nftBonus: { type: 'kunta', multiplier: 1.75 },
    assessmentType: 'scenario'
  },
  {
    id: 'anchor-sovereignty',
    pillar: 'anchor',
    title: 'Anchor Sovereignty',
    description: 'Achieve self-sovereignty through complete grounding',
    frequency: '432Hz',
    tier: 'elite',
    duration: 60,
    xpReward: 1000,
    lessons: [
      { id: 'asov-01', title: 'Sovereign Self', duration: 20 },
      { id: 'asov-02', title: 'Boundary Mastery', duration: 20 },
      { id: 'asov-03', title: 'Anchoring Others', duration: 20 }
    ],
    nftBonus: { type: 'kunta', multiplier: 2.0 },
    assessmentType: 'demonstration'
  },
  // Creativity Pillar Modules
  {
    id: 'creativity-spark',
    pillar: 'creativity',
    title: 'Creativity Spark',
    description: 'Ignite your creative potential and divine inspiration',
    frequency: '528Hz',
    tier: 'free',
    duration: 30,
    xpReward: 250,
    lessons: [
      { id: 'cs-01', title: 'The Creative Source', duration: 10 },
      { id: 'cs-02', title: 'Removing Blocks', duration: 10 },
      { id: 'cs-03', title: 'First Expressions', duration: 10 }
    ],
    nftBonus: { type: 'kunta', multiplier: 1.5 },
    assessmentType: 'creation'
  },
  {
    id: 'creativity-flow',
    pillar: 'creativity',
    title: 'Creativity Flow',
    description: 'Enter sustained creative flow states at will',
    frequency: '528Hz',
    tier: 'premium',
    duration: 45,
    xpReward: 500,
    lessons: [
      { id: 'cf-01', title: 'Flow State Mechanics', duration: 15 },
      { id: 'cf-02', title: 'Channeling Inspiration', duration: 15 },
      { id: 'cf-03', title: 'Collaborative Creation', duration: 15 }
    ],
    nftBonus: { type: 'kunta', multiplier: 1.75 },
    assessmentType: 'creation'
  },
  {
    id: 'creativity-mastery',
    pillar: 'creativity',
    title: 'Creativity Mastery',
    description: 'Master the art of manifesting new realities',
    frequency: '528Hz',
    tier: 'elite',
    duration: 60,
    xpReward: 1000,
    lessons: [
      { id: 'cm-01', title: 'Reality Crafting', duration: 20 },
      { id: 'cm-02', title: 'Multi-dimensional Creation', duration: 20 },
      { id: 'cm-03', title: 'Legacy Building', duration: 20 }
    ],
    nftBonus: { type: 'kunta', multiplier: 2.0 },
    assessmentType: 'masterpiece'
  },
  // Mastery Pillar Modules
  {
    id: 'mastery-initiation',
    pillar: 'mastery',
    title: 'Mastery Initiation',
    description: 'Begin the path to excellence and integration',
    frequency: '777Hz',
    tier: 'free',
    duration: 30,
    xpReward: 250,
    lessons: [
      { id: 'mi-01', title: 'The Path of Mastery', duration: 10 },
      { id: 'mi-02', title: 'Deliberate Practice', duration: 10 },
      { id: 'mi-03', title: 'Embracing Challenge', duration: 10 }
    ],
    nftBonus: { type: 'kunta', multiplier: 1.5 },
    assessmentType: 'practice'
  },
  {
    id: 'mastery-progression',
    pillar: 'mastery',
    title: 'Mastery Progression',
    description: 'Accelerate your growth through advanced techniques',
    frequency: '777Hz',
    tier: 'premium',
    duration: 45,
    xpReward: 500,
    lessons: [
      { id: 'mp-01', title: 'Skill Integration', duration: 15 },
      { id: 'mp-02', title: 'Teaching Others', duration: 15 },
      { id: 'mp-03', title: 'Breaking Plateaus', duration: 15 }
    ],
    nftBonus: { type: 'kunta', multiplier: 1.75 },
    assessmentType: 'demonstration'
  },
  {
    id: 'mastery-transcendence',
    pillar: 'mastery',
    title: 'Mastery Transcendence',
    description: 'Transcend limitations and achieve Type-VII realization',
    frequency: '777Hz',
    tier: 'elite',
    duration: 60,
    xpReward: 1000,
    lessons: [
      { id: 'mt-01', title: 'Beyond Excellence', duration: 20 },
      { id: 'mt-02', title: 'Innovation & Creation', duration: 20 },
      { id: 'mt-03', title: 'Type-VII Realization', duration: 20 }
    ],
    nftBonus: { type: 'kunta', multiplier: 2.0 },
    assessmentType: 'transcendence'
  }
];

// User progress tracking (in-memory for demo)
const userProgress = new Map();

// Get user's ScrollSoul profile
function getScrollSoulProfile(username) {
  if (!userProgress.has(username)) {
    userProgress.set(username, {
      username,
      xp: 0,
      level: TYPE_VII_LEVELS.INITIATE,
      completedModules: [],
      pillarProgress: {
        truth: 0,
        anchor: 0,
        creativity: 0,
        mastery: 0
      },
      currentFrequency: '432Hz',
      badges: [],
      createdAt: new Date().toISOString()
    });
  }
  return userProgress.get(username);
}

// Calculate user level from XP
function calculateLevel(xp) {
  const levels = Object.values(TYPE_VII_LEVELS).sort((a, b) => b.xpRequired - a.xpRequired);
  for (const level of levels) {
    if (xp >= level.xpRequired) {
      return level;
    }
  }
  return TYPE_VII_LEVELS.INITIATE;
}

// Get all knowledge pillars
scrollSoulRouter.get('/pillars', (req, res) => {
  res.json({
    message: 'Knowledge Pillars of ScrollSoul',
    description: 'The four foundational pillars for Type-VII realization',
    pillars: Object.values(KNOWLEDGE_PILLARS).map(pillar => ({
      ...pillar,
      frequencyDescription: HEALING_FREQUENCIES[pillar.frequency]
    }))
  });
});

// Get Type-VII levels information
scrollSoulRouter.get('/levels', (req, res) => {
  res.json({
    message: 'Type-VII Realization Levels',
    description: 'Progress through seven levels of spiritual and knowledge mastery',
    levels: Object.values(TYPE_VII_LEVELS)
  });
});

// Get all educational modules
scrollSoulRouter.get('/modules', authenticateToken, standardLimiter, (req, res) => {
  const userTier = req.user.tier || 'free';
  const userTierLevel = TIER_HIERARCHY[userTier] || 0;

  const accessibleModules = educationalModules.filter(module => {
    const moduleTierLevel = TIER_HIERARCHY[module.tier] || 0;
    return userTierLevel >= moduleTierLevel;
  });

  res.json({
    totalModules: educationalModules.length,
    accessibleModules: accessibleModules.length,
    userTier,
    modules: accessibleModules.map(m => ({
      id: m.id,
      pillar: m.pillar,
      title: m.title,
      description: m.description,
      frequency: m.frequency,
      tier: m.tier,
      duration: m.duration,
      xpReward: m.xpReward,
      lessonCount: m.lessons.length
    }))
  });
});

// Get modules by pillar
scrollSoulRouter.get('/modules/pillar/:pillarId', authenticateToken, standardLimiter, (req, res) => {
  const { pillarId } = req.params;
  const pillar = KNOWLEDGE_PILLARS[pillarId.toUpperCase()];

  if (!pillar) {
    return res.status(404).json({ error: 'Pillar not found' });
  }

  const userTier = req.user.tier || 'free';
  const userTierLevel = TIER_HIERARCHY[userTier] || 0;

  const pillarModules = educationalModules.filter(m => m.pillar === pillarId.toLowerCase());
  const accessibleModules = pillarModules.filter(module => {
    const moduleTierLevel = TIER_HIERARCHY[module.tier] || 0;
    return userTierLevel >= moduleTierLevel;
  });

  res.json({
    pillar: pillar,
    frequencyDescription: HEALING_FREQUENCIES[pillar.frequency],
    totalModules: pillarModules.length,
    accessibleModules: accessibleModules.length,
    modules: accessibleModules
  });
});

// Get specific module details
scrollSoulRouter.get('/modules/:moduleId', authenticateToken, standardLimiter, (req, res) => {
  const { moduleId } = req.params;
  const module = educationalModules.find(m => m.id === moduleId);

  if (!module) {
    return res.status(404).json({ error: 'Module not found' });
  }

  const userTier = req.user.tier || 'free';
  const hasAccess = TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[module.tier];

  if (!hasAccess) {
    return res.status(403).json({
      error: 'Insufficient tier',
      required: module.tier,
      current: userTier,
      message: 'Upgrade to access this module'
    });
  }

  res.json({
    ...module,
    frequencyDescription: HEALING_FREQUENCIES[module.frequency],
    pillarInfo: KNOWLEDGE_PILLARS[module.pillar.toUpperCase()]
  });
});

// Get user's ScrollSoul profile and progress
scrollSoulRouter.get('/profile', authenticateToken, standardLimiter, (req, res) => {
  const profile = getScrollSoulProfile(req.user.username);
  const currentLevel = calculateLevel(profile.xp);
  
  // Calculate next level progress
  const levels = Object.values(TYPE_VII_LEVELS).sort((a, b) => a.xpRequired - b.xpRequired);
  const currentLevelIndex = levels.findIndex(l => l.name === currentLevel.name);
  const nextLevel = levels[currentLevelIndex + 1];
  
  let progressToNextLevel = 100;
  if (nextLevel) {
    const xpInCurrentLevel = profile.xp - currentLevel.xpRequired;
    const xpNeededForNext = nextLevel.xpRequired - currentLevel.xpRequired;
    progressToNextLevel = Math.round((xpInCurrentLevel / xpNeededForNext) * 100);
  }

  res.json({
    ...profile,
    level: currentLevel,
    nextLevel: nextLevel || null,
    progressToNextLevel,
    moduleCompletionRate: Math.round((profile.completedModules.length / educationalModules.length) * 100)
  });
});

// Start a module (enroll)
scrollSoulRouter.post('/modules/:moduleId/start', authenticateToken, standardLimiter, (req, res) => {
  const { moduleId } = req.params;
  const module = educationalModules.find(m => m.id === moduleId);

  if (!module) {
    return res.status(404).json({ error: 'Module not found' });
  }

  const userTier = req.user.tier || 'free';
  const hasAccess = TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[module.tier];

  if (!hasAccess) {
    return res.status(403).json({
      error: 'Insufficient tier',
      required: module.tier,
      current: userTier
    });
  }

  const profile = getScrollSoulProfile(req.user.username);
  
  // Set current frequency to module's frequency
  profile.currentFrequency = module.frequency;

  res.json({
    message: `Started module: ${module.title}`,
    moduleId: module.id,
    frequency: module.frequency,
    frequencyDescription: HEALING_FREQUENCIES[module.frequency],
    lessons: module.lessons,
    estimatedDuration: module.duration,
    xpReward: module.xpReward,
    nftBonus: module.nftBonus
  });
});

// Complete a module
scrollSoulRouter.post('/modules/:moduleId/complete', authenticateToken, standardLimiter, (req, res) => {
  const { moduleId } = req.params;
  const { assessmentScore } = req.body;
  const module = educationalModules.find(m => m.id === moduleId);

  if (!module) {
    return res.status(404).json({ error: 'Module not found' });
  }

  const profile = getScrollSoulProfile(req.user.username);
  
  // Check if already completed
  if (profile.completedModules.includes(moduleId)) {
    return res.status(400).json({ error: 'Module already completed' });
  }

  // Calculate XP with NFT bonus
  let xpEarned = module.xpReward;
  let nftBonusApplied = false;
  
  // Check for NFT bonus (simplified - in production would verify NFT ownership)
  if (req.user.nftVerified && module.nftBonus) {
    xpEarned = Math.round(xpEarned * module.nftBonus.multiplier);
    nftBonusApplied = true;
  }

  // Update profile
  profile.xp += xpEarned;
  profile.completedModules.push(moduleId);
  profile.pillarProgress[module.pillar] += 1;
  profile.level = calculateLevel(profile.xp);

  // Award badge if pillar completed
  const pillarModules = educationalModules.filter(m => m.pillar === module.pillar);
  const completedPillarModules = pillarModules.filter(m => profile.completedModules.includes(m.id));
  
  let badgeEarned = null;
  if (completedPillarModules.length === pillarModules.length) {
    const pillarBadge = `${module.pillar}-master`;
    if (!profile.badges.includes(pillarBadge)) {
      profile.badges.push(pillarBadge);
      badgeEarned = pillarBadge;
    }
  }

  res.json({
    message: `Module completed: ${module.title}`,
    moduleId: module.id,
    xpEarned,
    nftBonusApplied,
    totalXp: profile.xp,
    newLevel: profile.level,
    pillarProgress: profile.pillarProgress[module.pillar],
    badgeEarned,
    assessmentScore: assessmentScore || 'not provided'
  });
});

// Get frequency-based content
scrollSoulRouter.get('/frequency/:freq', authenticateToken, standardLimiter, (req, res) => {
  const { freq } = req.params;
  
  if (!HEALING_FREQUENCIES[freq]) {
    return res.status(404).json({ error: 'Invalid frequency' });
  }

  const frequencyModules = educationalModules.filter(m => m.frequency === freq);
  const relatedPillar = Object.values(KNOWLEDGE_PILLARS).find(p => p.frequency === freq);

  res.json({
    frequency: freq,
    description: HEALING_FREQUENCIES[freq],
    pillar: relatedPillar,
    moduleCount: frequencyModules.length,
    modules: frequencyModules.map(m => ({
      id: m.id,
      title: m.title,
      description: m.description,
      tier: m.tier
    })),
    benefits: getFrequencyBenefits(freq)
  });
});

// Helper function for frequency benefits
function getFrequencyBenefits(freq) {
  const benefits = {
    '963Hz': ['Divine consciousness activation', 'Pineal gland stimulation', 'Spiritual enlightenment'],
    '777Hz': ['Cosmic alignment', 'Spiritual awakening', 'Higher dimensional access'],
    '528Hz': ['DNA repair', 'Love frequency activation', 'Transformation and miracles'],
    '432Hz': ['Natural harmony', 'Stress reduction', 'Deep relaxation'],
    '369Hz': ['Manifestation power', 'Divine alignment', 'Universal truth access']
  };
  return benefits[freq] || [];
}

// Get sovereign decision analytics
scrollSoulRouter.get('/analytics/decisions', authenticateToken, standardLimiter, (req, res) => {
  const profile = getScrollSoulProfile(req.user.username);
  
  // Calculate decision patterns (mock analytics)
  const completedByPillar = {
    truth: profile.completedModules.filter(m => educationalModules.find(em => em.id === m)?.pillar === 'truth').length,
    anchor: profile.completedModules.filter(m => educationalModules.find(em => em.id === m)?.pillar === 'anchor').length,
    creativity: profile.completedModules.filter(m => educationalModules.find(em => em.id === m)?.pillar === 'creativity').length,
    mastery: profile.completedModules.filter(m => educationalModules.find(em => em.id === m)?.pillar === 'mastery').length
  };

  const dominantPillar = Object.entries(completedByPillar).sort((a, b) => b[1] - a[1])[0];
  
  res.json({
    message: 'Sovereign Decision Analytics',
    username: req.user.username,
    totalDecisions: profile.completedModules.length,
    pillarDistribution: completedByPillar,
    dominantPillar: dominantPillar ? { name: dominantPillar[0], count: dominantPillar[1] } : null,
    currentLevel: profile.level,
    decisionQuality: calculateDecisionQuality(profile),
    recommendations: generateRecommendations(profile, completedByPillar)
  });
});

// Helper function to calculate decision quality
function calculateDecisionQuality(profile) {
  const baseQuality = 50;
  const levelBonus = profile.level?.level * 5 || 0;
  const completionBonus = Math.min(profile.completedModules.length * 2, 30);
  const balanceBonus = calculateBalanceBonus(profile.pillarProgress);
  
  return Math.min(baseQuality + levelBonus + completionBonus + balanceBonus, 100);
}

// Calculate balance bonus for even pillar distribution
function calculateBalanceBonus(pillarProgress) {
  const values = Object.values(pillarProgress);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
  return Math.max(0, 20 - variance * 2);
}

// Generate personalized recommendations
function generateRecommendations(profile, completedByPillar) {
  const recommendations = [];
  
  // Find weakest pillar
  const weakest = Object.entries(completedByPillar).sort((a, b) => a[1] - b[1])[0];
  if (weakest && weakest[1] < 2) {
    const pillarModules = educationalModules.filter(m => m.pillar === weakest[0] && !profile.completedModules.includes(m.id));
    if (pillarModules.length > 0) {
      recommendations.push({
        type: 'balance',
        message: `Strengthen your ${weakest[0]} pillar`,
        suggestedModule: pillarModules[0].id
      });
    }
  }

  // Suggest next level path
  const nextLevelModules = educationalModules.filter(m => !profile.completedModules.includes(m.id)).slice(0, 2);
  nextLevelModules.forEach(m => {
    recommendations.push({
      type: 'progression',
      message: `Continue with ${m.title}`,
      suggestedModule: m.id
    });
  });

  return recommendations;
}

// Get NFT-linked metadata for modules
scrollSoulRouter.get('/nft-metadata/:moduleId', authenticateToken, standardLimiter, (req, res) => {
  const { moduleId } = req.params;
  const module = educationalModules.find(m => m.id === moduleId);

  if (!module) {
    return res.status(404).json({ error: 'Module not found' });
  }

  const profile = getScrollSoulProfile(req.user.username);
  const isCompleted = profile.completedModules.includes(moduleId);

  res.json({
    moduleId,
    title: module.title,
    pillar: module.pillar,
    frequency: module.frequency,
    nftMetadata: {
      name: `ScrollSoul: ${module.title} Completion`,
      description: `Proof of completion for ${module.title} in the ${module.pillar} pillar`,
      attributes: [
        { trait_type: 'Pillar', value: module.pillar },
        { trait_type: 'Frequency', value: module.frequency },
        { trait_type: 'XP Earned', value: module.xpReward },
        { trait_type: 'Tier Required', value: module.tier },
        { trait_type: 'Assessment Type', value: module.assessmentType }
      ],
      image: `ipfs://scrollsoul/${module.pillar}/${moduleId}.png`,
      external_url: `https://scrollverse.com/education/${moduleId}`
    },
    completionStatus: isCompleted,
    mintable: isCompleted,
    nftBonus: module.nftBonus
  });
});

// Community leaderboard
scrollSoulRouter.get('/leaderboard', (req, res) => {
  const profiles = Array.from(userProgress.values())
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 10)
    .map((p, index) => ({
      rank: index + 1,
      username: p.username,
      xp: p.xp,
      level: calculateLevel(p.xp),
      completedModules: p.completedModules.length,
      badges: p.badges.length
    }));

  res.json({
    message: 'ScrollSoul Community Leaderboard',
    topContributors: profiles,
    totalCommunityXp: Array.from(userProgress.values()).reduce((sum, p) => sum + p.xp, 0)
  });
});

// Get statistics
scrollSoulRouter.get('/stats', (req, res) => {
  const totalProfiles = userProgress.size;
  const totalXp = Array.from(userProgress.values()).reduce((sum, p) => sum + p.xp, 0);
  const totalCompletions = Array.from(userProgress.values()).reduce((sum, p) => sum + p.completedModules.length, 0);

  const pillarStats = {};
  Object.keys(KNOWLEDGE_PILLARS).forEach(key => {
    const pillarId = key.toLowerCase();
    const pillarModules = educationalModules.filter(m => m.pillar === pillarId);
    pillarStats[pillarId] = {
      totalModules: pillarModules.length,
      totalCompletions: Array.from(userProgress.values()).reduce((sum, p) => sum + p.pillarProgress[pillarId], 0)
    };
  });

  res.json({
    totalLearners: totalProfiles,
    totalXpEarned: totalXp,
    totalModuleCompletions: totalCompletions,
    totalModules: educationalModules.length,
    pillarStatistics: pillarStats,
    type7Realizations: Array.from(userProgress.values()).filter(p => calculateLevel(p.xp).level === 7).length
  });
});

export { scrollSoulRouter };
