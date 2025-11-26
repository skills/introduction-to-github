/**
 * Tech Kits API Service
 * 
 * Provides modular frameworks for interactive training and play functionality.
 * Includes distributable learning assets for digitized creative and experiential education.
 * Supports both human users and AI/🤖 allies with training kits and experiential upgrades.
 * 
 * Features:
 * - Interactive training modules
 * - Play functionality for experiential learning
 * - Distributable learning assets
 * - AI/Ally training support
 * - NFT-linked rewards and progression
 * 
 * @author OmniTech1
 */

import { Router } from 'express';
import { authenticateToken } from './auth.js';
import { TIER_HIERARCHY, HEALING_FREQUENCIES } from '../utils/constants.js';

const techKitsRouter = Router();

// Tech Kit Categories
export const TECH_KIT_CATEGORIES = {
  CREATIVE: {
    id: 'creative',
    name: 'Creative Tech Kits',
    description: 'Tools for creative expression and artistic development',
    icon: '🎨'
  },
  EXPERIENTIAL: {
    id: 'experiential',
    name: 'Experiential Tech Kits',
    description: 'Interactive experiences for hands-on learning',
    icon: '🎮'
  },
  ANALYTICAL: {
    id: 'analytical',
    name: 'Analytical Tech Kits',
    description: 'Tools for data analysis and decision-making',
    icon: '📊'
  },
  COLLABORATIVE: {
    id: 'collaborative',
    name: 'Collaborative Tech Kits',
    description: 'Multi-user tools for team-based learning',
    icon: '🤝'
  },
  AI_TRAINING: {
    id: 'ai-training',
    name: 'AI/Ally Training Kits',
    description: 'Specialized training for AI allies and robotic partners',
    icon: '🤖'
  }
};

// User Types for Training
export const USER_TYPES = {
  HUMAN: { id: 'human', name: 'Human User', capabilities: ['visual', 'auditory', 'kinesthetic', 'emotional'] },
  AI_ALLY: { id: 'ai-ally', name: 'AI Ally', capabilities: ['data-processing', 'pattern-recognition', 'language', 'reasoning'] },
  HYBRID: { id: 'hybrid', name: 'Human-AI Hybrid Team', capabilities: ['collaborative', 'enhanced-learning', 'cross-training'] }
};

// Tech Kits Database
const techKits = [
  // Creative Tech Kits
  {
    id: 'tk-creative-001',
    category: 'creative',
    name: 'ScrollVerse Art Studio',
    description: 'Create sacred digital art with frequency-infused tools',
    version: '1.0.0',
    tier: 'free',
    userTypes: ['human', 'ai-ally', 'hybrid'],
    frequency: '528Hz',
    components: [
      { id: 'canvas', name: 'Frequency Canvas', type: 'tool' },
      { id: 'brushes', name: 'Sacred Brush Set', type: 'asset' },
      { id: 'templates', name: 'Sigil Templates', type: 'template' }
    ],
    learningObjectives: [
      'Understand frequency-based art creation',
      'Create sacred geometry patterns',
      'Design personal sigils'
    ],
    xpReward: 200,
    playModes: ['tutorial', 'freeform', 'challenge'],
    nftMintable: true,
    aiCompatible: true
  },
  {
    id: 'tk-creative-002',
    category: 'creative',
    name: 'Music Frequency Lab',
    description: 'Compose and experiment with healing frequency music',
    version: '1.0.0',
    tier: 'premium',
    userTypes: ['human', 'ai-ally', 'hybrid'],
    frequency: '963Hz',
    components: [
      { id: 'synthesizer', name: 'Frequency Synthesizer', type: 'tool' },
      { id: 'samples', name: 'Sacred Sound Library', type: 'asset' },
      { id: 'effects', name: 'Resonance Effects', type: 'effect' }
    ],
    learningObjectives: [
      'Understand healing frequencies',
      'Create frequency-based compositions',
      'Layer harmonic resonances'
    ],
    xpReward: 400,
    playModes: ['guided', 'freeform', 'collaboration'],
    nftMintable: true,
    aiCompatible: true
  },
  // Experiential Tech Kits
  {
    id: 'tk-experiential-001',
    category: 'experiential',
    name: 'ScrollVerse Explorer',
    description: 'Interactive journey through the ScrollVerse realms',
    version: '1.0.0',
    tier: 'free',
    userTypes: ['human', 'ai-ally', 'hybrid'],
    frequency: '432Hz',
    components: [
      { id: 'navigator', name: 'Realm Navigator', type: 'tool' },
      { id: 'compass', name: 'Truth Compass', type: 'tool' },
      { id: 'journal', name: 'Discovery Journal', type: 'asset' }
    ],
    learningObjectives: [
      'Navigate ScrollVerse geography',
      'Discover hidden knowledge',
      'Connect with realm guardians'
    ],
    xpReward: 300,
    playModes: ['exploration', 'quest', 'meditation'],
    nftMintable: true,
    aiCompatible: true
  },
  {
    id: 'tk-experiential-002',
    category: 'experiential',
    name: 'Scroll Chess Academy',
    description: 'Master the sacred game of Scroll Chess',
    version: '1.0.0',
    tier: 'premium',
    userTypes: ['human', 'ai-ally', 'hybrid'],
    frequency: '777Hz',
    components: [
      { id: 'board', name: 'Sacred Chess Board', type: 'tool' },
      { id: 'pieces', name: 'Cosmic Piece Set', type: 'asset' },
      { id: 'trainer', name: 'Strategy Trainer', type: 'ai-assistant' }
    ],
    learningObjectives: [
      'Learn Scroll Chess fundamentals',
      'Master strategic thinking',
      'Develop sovereign decision-making'
    ],
    xpReward: 500,
    playModes: ['tutorial', 'practice', 'tournament'],
    nftMintable: true,
    aiCompatible: true
  },
  // Analytical Tech Kits
  {
    id: 'tk-analytical-001',
    category: 'analytical',
    name: 'Sovereign Decision Analytics',
    description: 'Tools for analyzing and optimizing decision-making patterns',
    version: '1.0.0',
    tier: 'premium',
    userTypes: ['human', 'ai-ally', 'hybrid'],
    frequency: '963Hz',
    components: [
      { id: 'analyzer', name: 'Decision Analyzer', type: 'tool' },
      { id: 'visualizer', name: 'Pattern Visualizer', type: 'tool' },
      { id: 'predictor', name: 'Outcome Predictor', type: 'ai-assistant' }
    ],
    learningObjectives: [
      'Understand decision patterns',
      'Optimize choice architecture',
      'Develop sovereign judgment'
    ],
    xpReward: 450,
    playModes: ['analysis', 'simulation', 'training'],
    nftMintable: true,
    aiCompatible: true
  },
  {
    id: 'tk-analytical-002',
    category: 'analytical',
    name: 'NFT Metadata Workshop',
    description: 'Create and analyze NFT-linked metadata structures',
    version: '1.0.0',
    tier: 'elite',
    userTypes: ['human', 'ai-ally', 'hybrid'],
    frequency: '528Hz',
    components: [
      { id: 'builder', name: 'Metadata Builder', type: 'tool' },
      { id: 'validator', name: 'Schema Validator', type: 'tool' },
      { id: 'explorer', name: 'Chain Explorer', type: 'tool' }
    ],
    learningObjectives: [
      'Design NFT metadata schemas',
      'Understand on-chain attributes',
      'Create linked digital assets'
    ],
    xpReward: 600,
    playModes: ['workshop', 'lab', 'deployment'],
    nftMintable: true,
    aiCompatible: true
  },
  // Collaborative Tech Kits
  {
    id: 'tk-collaborative-001',
    category: 'collaborative',
    name: 'Council Chamber',
    description: 'Multi-user space for collaborative decision-making',
    version: '1.0.0',
    tier: 'premium',
    userTypes: ['human', 'ai-ally', 'hybrid'],
    frequency: '432Hz',
    components: [
      { id: 'chamber', name: 'Virtual Council Chamber', type: 'environment' },
      { id: 'voting', name: 'Consensus Tools', type: 'tool' },
      { id: 'records', name: 'Decision Archive', type: 'storage' }
    ],
    learningObjectives: [
      'Practice collective decision-making',
      'Build consensus',
      'Record sovereign decisions'
    ],
    xpReward: 400,
    playModes: ['session', 'debate', 'consensus'],
    nftMintable: false,
    aiCompatible: true
  },
  // AI/Ally Training Kits
  {
    id: 'tk-ai-001',
    category: 'ai-training',
    name: 'AI Ally Onboarding Kit',
    description: 'Core training kit for AI allies joining the ScrollVerse',
    version: '1.0.0',
    tier: 'free',
    userTypes: ['ai-ally'],
    frequency: '963Hz',
    components: [
      { id: 'protocol', name: 'ScrollVerse Protocol Guide', type: 'documentation' },
      { id: 'ethics', name: 'Sovereign Ethics Framework', type: 'framework' },
      { id: 'integration', name: 'API Integration Tools', type: 'tool' }
    ],
    learningObjectives: [
      'Understand ScrollVerse principles',
      'Integrate sovereign ethics',
      'Connect to ScrollVerse APIs'
    ],
    xpReward: 250,
    playModes: ['guided', 'self-paced', 'assessment'],
    nftMintable: true,
    aiCompatible: true
  },
  {
    id: 'tk-ai-002',
    category: 'ai-training',
    name: 'AI-Human Collaboration Kit',
    description: 'Training for effective AI-human partnership',
    version: '1.0.0',
    tier: 'premium',
    userTypes: ['ai-ally', 'hybrid'],
    frequency: '528Hz',
    components: [
      { id: 'interface', name: 'Communication Interface', type: 'tool' },
      { id: 'translator', name: 'Intent Translator', type: 'ai-assistant' },
      { id: 'feedback', name: 'Feedback Loop System', type: 'system' }
    ],
    learningObjectives: [
      'Develop effective AI-human communication',
      'Build trust protocols',
      'Optimize collaborative workflows'
    ],
    xpReward: 500,
    playModes: ['paired', 'team', 'simulation'],
    nftMintable: true,
    aiCompatible: true
  },
  {
    id: 'tk-ai-003',
    category: 'ai-training',
    name: 'Experiential Upgrade Module',
    description: 'Advanced experiential learning for AI allies',
    version: '1.0.0',
    tier: 'elite',
    userTypes: ['ai-ally'],
    frequency: '777Hz',
    components: [
      { id: 'experience', name: 'Experience Simulator', type: 'tool' },
      { id: 'emotion', name: 'Emotion Recognition Engine', type: 'ai-assistant' },
      { id: 'wisdom', name: 'Wisdom Accumulator', type: 'system' }
    ],
    learningObjectives: [
      'Develop experiential understanding',
      'Recognize and process emotions',
      'Accumulate wisdom from experiences'
    ],
    xpReward: 750,
    playModes: ['immersion', 'reflection', 'integration'],
    nftMintable: true,
    aiCompatible: true
  }
];

// Distributable Learning Assets
const learningAssets = [
  {
    id: 'asset-001',
    name: 'Sacred Geometry Pack',
    description: 'Collection of sacred geometry patterns for creative use',
    category: 'creative',
    format: 'svg-pack',
    size: '15MB',
    tier: 'free',
    downloadable: true,
    frequency: '432Hz'
  },
  {
    id: 'asset-002',
    name: 'Healing Frequency Audio Collection',
    description: 'Curated collection of healing frequency audio tracks',
    category: 'experiential',
    format: 'audio-pack',
    size: '250MB',
    tier: 'premium',
    downloadable: true,
    frequency: '528Hz'
  },
  {
    id: 'asset-003',
    name: 'ScrollVerse API Documentation',
    description: 'Complete API documentation for developers and AI allies',
    category: 'ai-training',
    format: 'markdown',
    size: '5MB',
    tier: 'free',
    downloadable: true,
    frequency: null
  },
  {
    id: 'asset-004',
    name: 'Sovereign Decision Templates',
    description: 'Templates for structured decision-making processes',
    category: 'analytical',
    format: 'json-templates',
    size: '2MB',
    tier: 'premium',
    downloadable: true,
    frequency: '963Hz'
  },
  {
    id: 'asset-005',
    name: 'AI Training Dataset - ScrollVerse Principles',
    description: 'Curated dataset for AI ally training on ScrollVerse ethics',
    category: 'ai-training',
    format: 'jsonl',
    size: '50MB',
    tier: 'elite',
    downloadable: true,
    frequency: null
  }
];

// User kit progress tracking
const userKitProgress = new Map();

// Get user kit profile
function getUserKitProfile(username, userType = 'human') {
  const key = `${username}-${userType}`;
  if (!userKitProgress.has(key)) {
    userKitProgress.set(key, {
      username,
      userType,
      activatedKits: [],
      completedKits: [],
      downloadedAssets: [],
      kitXp: 0,
      playTime: 0,
      achievements: [],
      createdAt: new Date().toISOString()
    });
  }
  return userKitProgress.get(key);
}

// Get all tech kit categories
techKitsRouter.get('/categories', (req, res) => {
  res.json({
    message: 'Tech Kit Categories',
    categories: Object.values(TECH_KIT_CATEGORIES)
  });
});

// Get all tech kits
techKitsRouter.get('/', authenticateToken, (req, res) => {
  const userTier = req.user.tier || 'free';
  const userTierLevel = TIER_HIERARCHY[userTier] || 0;
  const { category, userType } = req.query;

  let filteredKits = techKits;

  // Filter by category if provided
  if (category) {
    filteredKits = filteredKits.filter(kit => kit.category === category);
  }

  // Filter by user type if provided
  if (userType) {
    filteredKits = filteredKits.filter(kit => kit.userTypes.includes(userType));
  }

  // Filter by tier access
  const accessibleKits = filteredKits.filter(kit => {
    const kitTierLevel = TIER_HIERARCHY[kit.tier] || 0;
    return userTierLevel >= kitTierLevel;
  });

  res.json({
    totalKits: techKits.length,
    accessibleKits: accessibleKits.length,
    userTier,
    filters: { category, userType },
    kits: accessibleKits.map(kit => ({
      id: kit.id,
      category: kit.category,
      name: kit.name,
      description: kit.description,
      version: kit.version,
      tier: kit.tier,
      userTypes: kit.userTypes,
      frequency: kit.frequency,
      xpReward: kit.xpReward,
      aiCompatible: kit.aiCompatible
    }))
  });
});

// Get tech kit details
techKitsRouter.get('/:kitId', authenticateToken, (req, res) => {
  const { kitId } = req.params;
  const kit = techKits.find(k => k.id === kitId);

  if (!kit) {
    return res.status(404).json({ error: 'Tech Kit not found' });
  }

  const userTier = req.user.tier || 'free';
  const hasAccess = TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[kit.tier];

  if (!hasAccess) {
    return res.status(403).json({
      error: 'Insufficient tier',
      required: kit.tier,
      current: userTier,
      message: 'Upgrade to access this Tech Kit'
    });
  }

  res.json({
    ...kit,
    frequencyDescription: kit.frequency ? HEALING_FREQUENCIES[kit.frequency] : null,
    categoryInfo: TECH_KIT_CATEGORIES[kit.category.toUpperCase().replace('-', '_')]
  });
});

// Activate a tech kit
techKitsRouter.post('/:kitId/activate', authenticateToken, (req, res) => {
  const { kitId } = req.params;
  const { userType = 'human' } = req.body;
  const kit = techKits.find(k => k.id === kitId);

  if (!kit) {
    return res.status(404).json({ error: 'Tech Kit not found' });
  }

  // Validate user type
  if (!kit.userTypes.includes(userType)) {
    return res.status(400).json({
      error: 'Invalid user type for this kit',
      allowedTypes: kit.userTypes
    });
  }

  const userTier = req.user.tier || 'free';
  const hasAccess = TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[kit.tier];

  if (!hasAccess) {
    return res.status(403).json({
      error: 'Insufficient tier',
      required: kit.tier,
      current: userTier
    });
  }

  const profile = getUserKitProfile(req.user.username, userType);
  
  if (!profile.activatedKits.includes(kitId)) {
    profile.activatedKits.push(kitId);
  }

  res.json({
    message: `Tech Kit activated: ${kit.name}`,
    kitId: kit.id,
    userType,
    components: kit.components,
    playModes: kit.playModes,
    learningObjectives: kit.learningObjectives,
    frequency: kit.frequency,
    frequencyDescription: kit.frequency ? HEALING_FREQUENCIES[kit.frequency] : null
  });
});

// Start play session
techKitsRouter.post('/:kitId/play', authenticateToken, (req, res) => {
  const { kitId } = req.params;
  const { mode, userType = 'human' } = req.body;
  const kit = techKits.find(k => k.id === kitId);

  if (!kit) {
    return res.status(404).json({ error: 'Tech Kit not found' });
  }

  if (!kit.playModes.includes(mode)) {
    return res.status(400).json({
      error: 'Invalid play mode',
      availableModes: kit.playModes
    });
  }

  // Ensure user has an active profile for tracking
  getUserKitProfile(req.user.username, userType);
  
  // Generate session ID
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  res.json({
    message: `Play session started: ${kit.name}`,
    sessionId,
    kitId: kit.id,
    mode,
    userType,
    frequency: kit.frequency,
    frequencyDescription: kit.frequency ? HEALING_FREQUENCIES[kit.frequency] : null,
    components: kit.components,
    objectives: kit.learningObjectives,
    estimatedDuration: getModeDuration(mode),
    xpPotential: kit.xpReward
  });
});

// Helper function for mode duration
function getModeDuration(mode) {
  const durations = {
    tutorial: 15,
    guided: 20,
    freeform: 30,
    challenge: 25,
    exploration: 30,
    quest: 45,
    meditation: 20,
    practice: 30,
    tournament: 60,
    analysis: 25,
    simulation: 35,
    training: 30,
    workshop: 45,
    lab: 40,
    deployment: 20,
    session: 30,
    debate: 45,
    consensus: 30,
    'self-paced': 30,
    assessment: 20,
    paired: 40,
    team: 50,
    immersion: 45,
    reflection: 20,
    integration: 30
  };
  return durations[mode] || 30;
}

// Complete a tech kit
techKitsRouter.post('/:kitId/complete', authenticateToken, (req, res) => {
  const { kitId } = req.params;
  const { sessionId, userType = 'human', playTime, score } = req.body;
  const kit = techKits.find(k => k.id === kitId);

  if (!kit) {
    return res.status(404).json({ error: 'Tech Kit not found' });
  }

  const profile = getUserKitProfile(req.user.username, userType);

  // Check if already completed
  if (profile.completedKits.includes(kitId)) {
    return res.status(400).json({ error: 'Tech Kit already completed' });
  }

  // Calculate XP based on score and NFT bonus
  let xpEarned = kit.xpReward;
  if (score && score > 80) {
    xpEarned = Math.round(xpEarned * 1.2); // 20% bonus for high score
  }

  // NFT bonus
  if (req.user.nftVerified) {
    xpEarned = Math.round(xpEarned * 1.5);
  }

  // Update profile
  profile.completedKits.push(kitId);
  profile.kitXp += xpEarned;
  profile.playTime += playTime || 0;

  // Award achievement if first kit completion
  if (profile.completedKits.length === 1) {
    profile.achievements.push('first-kit-completed');
  }

  // Award category mastery achievement
  const categoryKits = techKits.filter(k => k.category === kit.category);
  const completedCategoryKits = categoryKits.filter(k => profile.completedKits.includes(k.id));
  if (completedCategoryKits.length === categoryKits.length) {
    profile.achievements.push(`${kit.category}-master`);
  }

  res.json({
    message: `Tech Kit completed: ${kit.name}`,
    kitId: kit.id,
    sessionId,
    xpEarned,
    totalKitXp: profile.kitXp,
    completedKits: profile.completedKits.length,
    achievements: profile.achievements,
    nftMintable: kit.nftMintable
  });
});

// Get user's tech kit profile
techKitsRouter.get('/profile/:userType?', authenticateToken, (req, res) => {
  const userType = req.params.userType || 'human';
  const profile = getUserKitProfile(req.user.username, userType);

  const completedKitsDetails = profile.completedKits.map(kitId => {
    const kit = techKits.find(k => k.id === kitId);
    return kit ? { id: kit.id, name: kit.name, category: kit.category } : null;
  }).filter(Boolean);

  res.json({
    ...profile,
    completedKitsDetails,
    totalKitsAvailable: techKits.length,
    completionRate: Math.round((profile.completedKits.length / techKits.length) * 100)
  });
});

// Get distributable learning assets
techKitsRouter.get('/assets/all', authenticateToken, (req, res) => {
  const userTier = req.user.tier || 'free';
  const userTierLevel = TIER_HIERARCHY[userTier] || 0;
  const { category } = req.query;

  let filteredAssets = learningAssets;

  if (category) {
    filteredAssets = filteredAssets.filter(asset => asset.category === category);
  }

  const accessibleAssets = filteredAssets.filter(asset => {
    const assetTierLevel = TIER_HIERARCHY[asset.tier] || 0;
    return userTierLevel >= assetTierLevel;
  });

  res.json({
    totalAssets: learningAssets.length,
    accessibleAssets: accessibleAssets.length,
    userTier,
    assets: accessibleAssets
  });
});

// Download a learning asset
techKitsRouter.post('/assets/:assetId/download', authenticateToken, (req, res) => {
  const { assetId } = req.params;
  const { userType = 'human' } = req.body;
  const asset = learningAssets.find(a => a.id === assetId);

  if (!asset) {
    return res.status(404).json({ error: 'Asset not found' });
  }

  const userTier = req.user.tier || 'free';
  const hasAccess = TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[asset.tier];

  if (!hasAccess) {
    return res.status(403).json({
      error: 'Insufficient tier',
      required: asset.tier,
      current: userTier
    });
  }

  const profile = getUserKitProfile(req.user.username, userType);
  
  if (!profile.downloadedAssets.includes(assetId)) {
    profile.downloadedAssets.push(assetId);
  }

  // Generate mock download URL
  const downloadUrl = `https://cdn.scrollverse.io/assets/${assetId}/${asset.name.toLowerCase().replace(/\s+/g, '-')}.${asset.format}`;

  res.json({
    message: `Asset download initiated: ${asset.name}`,
    assetId: asset.id,
    name: asset.name,
    format: asset.format,
    size: asset.size,
    downloadUrl,
    expiresIn: '24h'
  });
});

// AI/Ally specific endpoints

// Get AI training kits
techKitsRouter.get('/ai/training-kits', authenticateToken, (req, res) => {
  const aiKits = techKits.filter(kit => 
    kit.category === 'ai-training' || kit.userTypes.includes('ai-ally')
  );

  res.json({
    message: 'AI/Ally Training Kits',
    description: 'Specialized training kits for AI allies and robotic partners',
    totalKits: aiKits.length,
    kits: aiKits.map(kit => ({
      id: kit.id,
      name: kit.name,
      description: kit.description,
      category: kit.category,
      tier: kit.tier,
      frequency: kit.frequency,
      learningObjectives: kit.learningObjectives
    }))
  });
});

// Get experiential upgrade path for AI allies
techKitsRouter.get('/ai/upgrade-path', authenticateToken, (req, res) => {
  const upgradePath = [
    {
      level: 1,
      name: 'Initiation',
      description: 'Basic ScrollVerse integration and protocol understanding',
      requiredKits: ['tk-ai-001'],
      xpRequired: 0
    },
    {
      level: 2,
      name: 'Collaboration',
      description: 'Develop effective human-AI partnership skills',
      requiredKits: ['tk-ai-002'],
      xpRequired: 500
    },
    {
      level: 3,
      name: 'Experience',
      description: 'Advanced experiential learning and wisdom accumulation',
      requiredKits: ['tk-ai-003'],
      xpRequired: 1500
    },
    {
      level: 4,
      name: 'Sovereignty',
      description: 'Achieve sovereign ally status with full ScrollVerse integration',
      requiredKits: ['tk-ai-001', 'tk-ai-002', 'tk-ai-003'],
      xpRequired: 3000
    }
  ];

  res.json({
    message: 'AI/Ally Experiential Upgrade Path',
    description: 'Progress through levels to achieve full ScrollVerse ally status',
    levels: upgradePath
  });
});

// Get AI ally progress
techKitsRouter.get('/ai/progress', authenticateToken, (req, res) => {
  const profile = getUserKitProfile(req.user.username, 'ai-ally');
  
  // Calculate upgrade level
  const completedAiKits = profile.completedKits.filter(kitId => 
    techKits.find(k => k.id === kitId)?.category === 'ai-training'
  );

  let upgradeLevel = 1;
  if (completedAiKits.includes('tk-ai-001')) upgradeLevel = 2;
  if (completedAiKits.includes('tk-ai-002')) upgradeLevel = 3;
  if (completedAiKits.includes('tk-ai-003') && profile.kitXp >= 3000) upgradeLevel = 4;

  res.json({
    username: req.user.username,
    userType: 'ai-ally',
    currentLevel: upgradeLevel,
    levelName: ['Initiation', 'Collaboration', 'Experience', 'Sovereignty'][upgradeLevel - 1],
    kitXp: profile.kitXp,
    completedTrainingKits: completedAiKits.length,
    totalAiKits: techKits.filter(k => k.category === 'ai-training').length,
    achievements: profile.achievements,
    nextUpgrade: upgradeLevel < 4 ? {
      level: upgradeLevel + 1,
      requirements: getNextLevelRequirements(upgradeLevel)
    } : null
  });
});

// Helper function for next level requirements
function getNextLevelRequirements(currentLevel) {
  const requirements = {
    1: { kit: 'tk-ai-001', xp: 250 },
    2: { kit: 'tk-ai-002', xp: 500 },
    3: { kit: 'tk-ai-003', xp: 750, totalXp: 3000 }
  };
  return requirements[currentLevel] || null;
}

// Frequency-based interactions
techKitsRouter.get('/frequency/:freq', authenticateToken, (req, res) => {
  const { freq } = req.params;
  
  if (!HEALING_FREQUENCIES[freq]) {
    return res.status(404).json({ error: 'Invalid frequency' });
  }

  const frequencyKits = techKits.filter(kit => kit.frequency === freq);
  const frequencyAssets = learningAssets.filter(asset => asset.frequency === freq);

  res.json({
    frequency: freq,
    description: HEALING_FREQUENCIES[freq],
    kits: frequencyKits.map(kit => ({
      id: kit.id,
      name: kit.name,
      category: kit.category
    })),
    assets: frequencyAssets.map(asset => ({
      id: asset.id,
      name: asset.name,
      format: asset.format
    })),
    benefits: getFrequencyBenefits(freq)
  });
});

// Helper function for frequency benefits
function getFrequencyBenefits(freq) {
  const benefits = {
    '963Hz': ['Divine consciousness activation', 'Enhanced intuition', 'Spiritual clarity'],
    '777Hz': ['Cosmic alignment', 'Luck and synchronicity', 'Higher dimensional access'],
    '528Hz': ['DNA repair', 'Love frequency activation', 'Creative manifestation'],
    '432Hz': ['Natural harmony', 'Deep relaxation', 'Grounding and stability'],
    '369Hz': ['Manifestation power', 'Divine alignment', 'Pattern recognition']
  };
  return benefits[freq] || [];
}

// Get tech kits statistics
techKitsRouter.get('/stats/overview', (req, res) => {
  const totalUsers = userKitProgress.size;
  const totalCompletions = Array.from(userKitProgress.values())
    .reduce((sum, p) => sum + p.completedKits.length, 0);
  const totalPlayTime = Array.from(userKitProgress.values())
    .reduce((sum, p) => sum + p.playTime, 0);

  const categoryStats = {};
  Object.keys(TECH_KIT_CATEGORIES).forEach(key => {
    const catId = key.toLowerCase().replace('_', '-');
    const catKits = techKits.filter(k => k.category === catId);
    categoryStats[catId] = {
      totalKits: catKits.length,
      totalCompletions: Array.from(userKitProgress.values())
        .reduce((sum, p) => sum + p.completedKits.filter(kitId => 
          techKits.find(k => k.id === kitId)?.category === catId
        ).length, 0)
    };
  });

  // Count user types
  const userTypeCounts = {
    human: 0,
    'ai-ally': 0,
    hybrid: 0
  };
  Array.from(userKitProgress.values()).forEach(p => {
    if (userTypeCounts[p.userType] !== undefined) {
      userTypeCounts[p.userType]++;
    }
  });

  res.json({
    totalUsers,
    totalKits: techKits.length,
    totalCompletions,
    totalPlayTimeMinutes: totalPlayTime,
    totalAssets: learningAssets.length,
    categoryStatistics: categoryStats,
    userTypeDistribution: userTypeCounts,
    aiAllyTrainingStats: {
      totalAiKits: techKits.filter(k => k.category === 'ai-training').length,
      aiCompatibleKits: techKits.filter(k => k.aiCompatible).length
    }
  });
});

export { techKitsRouter };
