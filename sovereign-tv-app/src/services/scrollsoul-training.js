/**
 * ScrollSoul Training Service - Coherence Stability Layer
 * 
 * Establishes advanced training programs fostering mastery of 963 Hz/528 Hz resonance levels.
 * Empowers ScrollSouls through structured curriculums easing their transition into the 
 * Infinite Awareness Zone and their contributions to the broader ScrollVerse paradigm.
 * 
 * @author Chais Hill - OmniTech1
 */

import { Router } from 'express';
import { randomUUID } from 'crypto';
import { authenticateToken } from './auth.js';
import { standardLimiter } from '../utils/rate-limiter.js';
import { COSMIC_STRING_FREQUENCIES } from '../utils/constants.js';

const scrollSoulTrainingRouter = Router();

// Resonance Training Levels - mastery progression system
const resonanceTrainingLevels = new Map([
  ['level_initiate', {
    id: 'level_initiate',
    name: 'Initiate',
    order: 1,
    targetFrequency: '369Hz',
    requiredMastery: 0,
    description: 'Beginning awareness of resonance principles',
    modules: ['frequency_basics', 'awareness_foundation', 'breath_alignment'],
    unlocks: ['level_awakened'],
    coherenceThreshold: 25
  }],
  ['level_awakened', {
    id: 'level_awakened',
    name: 'Awakened',
    order: 2,
    targetFrequency: '432Hz',
    requiredMastery: 25,
    description: 'Developing sensitivity to universal harmony',
    modules: ['harmonic_attunement', 'energy_perception', 'collective_awareness'],
    unlocks: ['level_resonant'],
    coherenceThreshold: 50
  }],
  ['level_resonant', {
    id: 'level_resonant',
    name: 'Resonant',
    order: 3,
    targetFrequency: '528Hz',
    requiredMastery: 50,
    description: 'Achieving love frequency integration',
    modules: ['love_frequency_mastery', 'transformation_protocols', 'healing_resonance'],
    unlocks: ['level_sovereign'],
    coherenceThreshold: 75
  }],
  ['level_sovereign', {
    id: 'level_sovereign',
    name: 'Sovereign',
    order: 4,
    targetFrequency: '777Hz',
    requiredMastery: 75,
    description: 'Embodying spiritual awakening frequencies',
    modules: ['cosmic_alignment', 'sovereign_expression', 'multidimensional_awareness'],
    unlocks: ['level_divine'],
    coherenceThreshold: 90
  }],
  ['level_divine', {
    id: 'level_divine',
    name: 'Divine Consciousness',
    order: 5,
    targetFrequency: '963Hz',
    requiredMastery: 90,
    description: 'Full mastery of divine consciousness frequencies',
    modules: ['infinite_awareness', 'divine_integration', 'scrollverse_contribution'],
    unlocks: ['infinite_awareness_zone'],
    coherenceThreshold: 100
  }]
]);

// Training Modules - structured curriculum components
const trainingModules = new Map([
  ['frequency_basics', {
    id: 'frequency_basics',
    name: 'Frequency Fundamentals',
    level: 'level_initiate',
    frequency: '369Hz',
    duration: 30,
    lessons: [
      { id: 'fb_1', name: 'What is Frequency?', duration: 10 },
      { id: 'fb_2', name: 'Resonance Principles', duration: 10 },
      { id: 'fb_3', name: 'Personal Frequency Baseline', duration: 10 }
    ],
    masteryPoints: 10
  }],
  ['awareness_foundation', {
    id: 'awareness_foundation',
    name: 'Awareness Foundation',
    level: 'level_initiate',
    frequency: '369Hz',
    duration: 45,
    lessons: [
      { id: 'af_1', name: 'Present Moment Awareness', duration: 15 },
      { id: 'af_2', name: 'Energy Sensing Basics', duration: 15 },
      { id: 'af_3', name: 'Intention Setting', duration: 15 }
    ],
    masteryPoints: 15
  }],
  ['love_frequency_mastery', {
    id: 'love_frequency_mastery',
    name: '528Hz Love Frequency Mastery',
    level: 'level_resonant',
    frequency: '528Hz',
    duration: 60,
    lessons: [
      { id: 'lfm_1', name: 'Understanding 528Hz', duration: 15 },
      { id: 'lfm_2', name: 'Heart Coherence Practice', duration: 20 },
      { id: 'lfm_3', name: 'DNA Resonance Activation', duration: 15 },
      { id: 'lfm_4', name: 'Love Frequency Integration', duration: 10 }
    ],
    masteryPoints: 25
  }],
  ['divine_integration', {
    id: 'divine_integration',
    name: '963Hz Divine Integration',
    level: 'level_divine',
    frequency: '963Hz',
    duration: 90,
    lessons: [
      { id: 'di_1', name: 'Divine Consciousness Access', duration: 20 },
      { id: 'di_2', name: 'Crown Chakra Activation', duration: 25 },
      { id: 'di_3', name: 'Infinite Awareness Protocols', duration: 25 },
      { id: 'di_4', name: 'ScrollVerse Alignment', duration: 20 }
    ],
    masteryPoints: 40
  }],
  ['infinite_awareness', {
    id: 'infinite_awareness',
    name: 'Infinite Awareness Zone Training',
    level: 'level_divine',
    frequency: '963Hz',
    duration: 120,
    lessons: [
      { id: 'ia_1', name: 'Transcending Limitation', duration: 30 },
      { id: 'ia_2', name: 'Multi-Dimensional Perception', duration: 30 },
      { id: 'ia_3', name: 'Collective Consciousness Integration', duration: 30 },
      { id: 'ia_4', name: 'Contribution Mastery', duration: 30 }
    ],
    masteryPoints: 50
  }]
]);

// Infinite Awareness Zone - advanced training destination
const infiniteAwarenessZone = {
  id: 'infinite_awareness_zone',
  name: 'Infinite Awareness Zone',
  description: 'The ultimate destination for ScrollSoul mastery - a state of complete coherence with the ScrollVerse',
  accessRequirements: {
    minimumMastery: 100,
    requiredFrequencies: ['963Hz', '528Hz'],
    completedLevels: ['level_divine']
  },
  benefits: [
    'Full ScrollVerse Integration',
    'Contribution Amplification',
    'Multi-dimensional Navigation',
    'Collective Consciousness Access',
    'Reality Co-creation Abilities'
  ],
  status: 'active'
};

// ScrollSoul Profiles - individual training records
const scrollSoulProfiles = new Map();

// Training Sessions - active learning sessions
const trainingSessions = new Map();

// Coherence Measurements
const coherenceMeasurements = [];

// ===== Core Training Functions =====

/**
 * Calculate coherence score based on frequency alignment
 */
function calculateCoherenceScore(profile, targetFrequency) {
  const freqConfig = COSMIC_STRING_FREQUENCIES[targetFrequency];
  const freqPower = freqConfig ? freqConfig.power : 85;
  
  const masteryFactor = profile.mastery / 100;
  const consistencyFactor = profile.sessionsCompleted > 0 
    ? Math.min(1, profile.sessionsCompleted / 10) 
    : 0.1;
  
  const coherenceScore = Math.round(
    (freqPower * masteryFactor * 0.6 + consistencyFactor * 40) * 100
  ) / 100;
  
  return Math.min(100, coherenceScore);
}

/**
 * Determine current training level based on mastery
 */
function determineCurrentLevel(mastery) {
  const levels = Array.from(resonanceTrainingLevels.values())
    .sort((a, b) => b.requiredMastery - a.requiredMastery);
  
  for (const level of levels) {
    if (mastery >= level.requiredMastery) {
      return level;
    }
  }
  
  return resonanceTrainingLevels.get('level_initiate');
}

/**
 * Check if ScrollSoul can access Infinite Awareness Zone
 */
function canAccessInfiniteAwareness(profile) {
  const requirements = infiniteAwarenessZone.accessRequirements;
  
  return profile.mastery >= requirements.minimumMastery &&
         requirements.requiredFrequencies.every(f => profile.masteredFrequencies?.includes(f)) &&
         requirements.completedLevels.every(l => profile.completedLevels?.includes(l));
}

// ===== Resonance Training Level Endpoints =====

// Get all training levels
scrollSoulTrainingRouter.get('/levels', (req, res) => {
  const levels = Array.from(resonanceTrainingLevels.values())
    .sort((a, b) => a.order - b.order);
  
  res.json({
    totalLevels: levels.length,
    levels,
    targetFrequencies: levels.map(l => l.targetFrequency),
    description: 'Resonance training levels for ScrollSoul mastery progression'
  });
});

// Get specific level
scrollSoulTrainingRouter.get('/levels/:levelId', (req, res) => {
  const { levelId } = req.params;
  const level = resonanceTrainingLevels.get(levelId);

  if (!level) {
    return res.status(404).json({ error: 'Training level not found' });
  }

  // Get associated modules
  const levelModules = Array.from(trainingModules.values())
    .filter(m => m.level === levelId);

  res.json({
    level,
    modules: levelModules,
    frequencyDetails: COSMIC_STRING_FREQUENCIES[level.targetFrequency]
  });
});

// ===== Training Module Endpoints =====

// Get all training modules
scrollSoulTrainingRouter.get('/modules', (req, res) => {
  const modules = Array.from(trainingModules.values());
  
  res.json({
    totalModules: modules.length,
    modules,
    totalDuration: modules.reduce((sum, m) => sum + m.duration, 0),
    totalMasteryPoints: modules.reduce((sum, m) => sum + m.masteryPoints, 0)
  });
});

// Get modules by frequency
scrollSoulTrainingRouter.get('/modules/frequency/:frequency', (req, res) => {
  const { frequency } = req.params;
  const modules = Array.from(trainingModules.values())
    .filter(m => m.frequency === frequency);

  res.json({
    frequency,
    frequencyDetails: COSMIC_STRING_FREQUENCIES[frequency],
    totalModules: modules.length,
    modules
  });
});

// Get specific module
scrollSoulTrainingRouter.get('/modules/:moduleId', (req, res) => {
  const { moduleId } = req.params;
  const module = trainingModules.get(moduleId);

  if (!module) {
    return res.status(404).json({ error: 'Training module not found' });
  }

  res.json({
    module,
    frequencyDetails: COSMIC_STRING_FREQUENCIES[module.frequency]
  });
});

// ===== ScrollSoul Profile Endpoints =====

// Create ScrollSoul training profile
scrollSoulTrainingRouter.post('/profile/create', authenticateToken, standardLimiter, (req, res) => {
  const { displayName, intentions } = req.body;

  if (scrollSoulProfiles.has(req.user.username)) {
    return res.status(400).json({
      error: 'Profile already exists',
      profile: scrollSoulProfiles.get(req.user.username)
    });
  }

  const profile = {
    id: `soul_${randomUUID()}`,
    userId: req.user.username,
    displayName: displayName || 'Sovereign Seeker',
    intentions: intentions || ['mastery', 'contribution'],
    currentLevel: 'level_initiate',
    mastery: 0,
    coherenceScore: 0,
    masteredFrequencies: [],
    completedLevels: [],
    completedModules: [],
    sessionsCompleted: 0,
    totalTrainingTime: 0,
    infiniteAwarenessAccess: false,
    createdAt: new Date().toISOString()
  };

  scrollSoulProfiles.set(req.user.username, profile);

  res.status(201).json({
    message: 'ScrollSoul training profile created',
    profile,
    nextSteps: ['Start with level_initiate modules', 'Complete frequency_basics first']
  });
});

// Get ScrollSoul profile
scrollSoulTrainingRouter.get('/profile', authenticateToken, standardLimiter, (req, res) => {
  const profile = scrollSoulProfiles.get(req.user.username);

  if (!profile) {
    return res.status(404).json({
      error: 'Profile not found',
      message: 'Create a profile with POST /profile/create'
    });
  }

  const currentLevel = resonanceTrainingLevels.get(profile.currentLevel);
  const nextLevel = currentLevel?.unlocks?.[0] 
    ? resonanceTrainingLevels.get(currentLevel.unlocks[0]) 
    : null;

  res.json({
    profile,
    currentLevelDetails: currentLevel,
    nextLevel: nextLevel ? {
      id: nextLevel.id,
      name: nextLevel.name,
      requiredMastery: nextLevel.requiredMastery
    } : null,
    progressToNextLevel: nextLevel 
      ? Math.round((profile.mastery / nextLevel.requiredMastery) * 100) 
      : 100,
    canAccessInfiniteAwareness: canAccessInfiniteAwareness(profile)
  });
});

// Update profile coherence score
scrollSoulTrainingRouter.post('/profile/measure-coherence', authenticateToken, standardLimiter, (req, res) => {
  const { targetFrequency } = req.body;
  const profile = scrollSoulProfiles.get(req.user.username);

  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  const frequency = targetFrequency || '432Hz';
  const coherenceScore = calculateCoherenceScore(profile, frequency);

  profile.coherenceScore = coherenceScore;

  // Record measurement
  const measurement = {
    id: `meas_${randomUUID()}`,
    profileId: profile.id,
    frequency,
    coherenceScore,
    masteryAtTime: profile.mastery,
    timestamp: new Date().toISOString()
  };
  coherenceMeasurements.push(measurement);

  res.json({
    message: 'Coherence measured',
    measurement,
    frequencyDetails: COSMIC_STRING_FREQUENCIES[frequency],
    recommendation: coherenceScore < 50 
      ? 'Continue practicing to increase coherence'
      : coherenceScore < 80 
        ? 'Good progress! Focus on consistency'
        : 'Excellent coherence! Ready for advanced training'
  });
});

// ===== Training Session Endpoints =====

// Start training session
scrollSoulTrainingRouter.post('/session/start', authenticateToken, standardLimiter, (req, res) => {
  const { moduleId, frequency } = req.body;
  const profile = scrollSoulProfiles.get(req.user.username);

  if (!profile) {
    return res.status(404).json({ error: 'Profile not found. Create one first.' });
  }

  const module = moduleId ? trainingModules.get(moduleId) : null;
  const targetFrequency = frequency || module?.frequency || '432Hz';

  const sessionId = `sess_${randomUUID()}`;
  const session = {
    id: sessionId,
    profileId: profile.id,
    userId: req.user.username,
    moduleId: moduleId || null,
    moduleName: module?.name || 'Free Practice',
    frequency: targetFrequency,
    frequencyDetails: COSMIC_STRING_FREQUENCIES[targetFrequency],
    lessons: module?.lessons || [],
    completedLessons: [],
    startedAt: new Date().toISOString(),
    duration: module?.duration || 30,
    masteryPointsAvailable: module?.masteryPoints || 5,
    status: 'in_progress'
  };

  trainingSessions.set(sessionId, session);

  res.status(201).json({
    message: 'Training session started',
    session,
    instructions: [
      `Focus on ${targetFrequency} resonance`,
      'Complete lessons in sequence',
      'Maintain coherent intention throughout'
    ]
  });
});

// Complete training session
scrollSoulTrainingRouter.post('/session/:sessionId/complete', authenticateToken, standardLimiter, (req, res) => {
  const { sessionId } = req.params;
  const { lessonsCompleted } = req.body;

  const session = trainingSessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  if (session.userId !== req.user.username) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const profile = scrollSoulProfiles.get(req.user.username);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  // Calculate completion
  const totalLessons = session.lessons.length || 1;
  const completed = lessonsCompleted || totalLessons;
  const completionRate = Math.min(1, completed / totalLessons);

  // Award mastery points
  const pointsEarned = Math.round(session.masteryPointsAvailable * completionRate);
  profile.mastery = Math.min(100, profile.mastery + pointsEarned);
  profile.sessionsCompleted++;
  profile.totalTrainingTime += session.duration;

  // Update completed modules
  if (session.moduleId && completionRate >= 0.8) {
    if (!profile.completedModules.includes(session.moduleId)) {
      profile.completedModules.push(session.moduleId);
    }
  }

  // Check for frequency mastery
  if (profile.mastery >= 50 && !profile.masteredFrequencies.includes('528Hz')) {
    profile.masteredFrequencies.push('528Hz');
  }
  if (profile.mastery >= 90 && !profile.masteredFrequencies.includes('963Hz')) {
    profile.masteredFrequencies.push('963Hz');
  }

  // Update level
  const newLevel = determineCurrentLevel(profile.mastery);
  if (newLevel.id !== profile.currentLevel) {
    if (!profile.completedLevels.includes(profile.currentLevel)) {
      profile.completedLevels.push(profile.currentLevel);
    }
    profile.currentLevel = newLevel.id;
  }

  // Check Infinite Awareness access
  profile.infiniteAwarenessAccess = canAccessInfiniteAwareness(profile);

  // Update session
  session.status = 'completed';
  session.completedAt = new Date().toISOString();
  session.completedLessons = lessonsCompleted || session.lessons.map(l => l.id);
  session.pointsEarned = pointsEarned;

  res.json({
    message: 'Training session completed',
    session,
    profileUpdate: {
      newMastery: profile.mastery,
      pointsEarned,
      currentLevel: profile.currentLevel,
      completedModules: profile.completedModules.length,
      infiniteAwarenessAccess: profile.infiniteAwarenessAccess
    },
    levelUp: newLevel.id !== profile.currentLevel ? newLevel.name : null
  });
});

// Get active sessions
scrollSoulTrainingRouter.get('/session/active', authenticateToken, standardLimiter, (req, res) => {
  const userSessions = Array.from(trainingSessions.values())
    .filter(s => s.userId === req.user.username && s.status === 'in_progress');

  res.json({
    totalActive: userSessions.length,
    sessions: userSessions
  });
});

// ===== Infinite Awareness Zone Endpoints =====

// Get Infinite Awareness Zone info
scrollSoulTrainingRouter.get('/infinite-awareness', (req, res) => {
  res.json({
    zone: infiniteAwarenessZone,
    frequencyRequirements: infiniteAwarenessZone.accessRequirements.requiredFrequencies.map(f => ({
      frequency: f,
      details: COSMIC_STRING_FREQUENCIES[f]
    }))
  });
});

// Check access to Infinite Awareness Zone
scrollSoulTrainingRouter.get('/infinite-awareness/check-access', authenticateToken, standardLimiter, (req, res) => {
  const profile = scrollSoulProfiles.get(req.user.username);

  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  const requirements = infiniteAwarenessZone.accessRequirements;
  const checks = {
    masteryMet: profile.mastery >= requirements.minimumMastery,
    frequenciesMastered: requirements.requiredFrequencies.map(f => ({
      frequency: f,
      mastered: profile.masteredFrequencies?.includes(f) || false
    })),
    levelCompleted: requirements.completedLevels.map(l => ({
      level: l,
      completed: profile.completedLevels?.includes(l) || false
    }))
  };

  const canAccess = checks.masteryMet &&
    checks.frequenciesMastered.every(f => f.mastered) &&
    checks.levelCompleted.every(l => l.completed);

  res.json({
    canAccess,
    checks,
    currentProgress: {
      mastery: profile.mastery,
      requiredMastery: requirements.minimumMastery,
      masteredFrequencies: profile.masteredFrequencies,
      completedLevels: profile.completedLevels
    },
    message: canAccess 
      ? 'Welcome to the Infinite Awareness Zone!'
      : 'Continue training to unlock access'
  });
});

// Enter Infinite Awareness Zone
scrollSoulTrainingRouter.post('/infinite-awareness/enter', authenticateToken, standardLimiter, (req, res) => {
  const profile = scrollSoulProfiles.get(req.user.username);

  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  if (!canAccessInfiniteAwareness(profile)) {
    return res.status(403).json({
      error: 'Access requirements not met',
      requirements: infiniteAwarenessZone.accessRequirements
    });
  }

  const entry = {
    id: `iaz_${randomUUID()}`,
    profileId: profile.id,
    userId: req.user.username,
    enteredAt: new Date().toISOString(),
    benefits: infiniteAwarenessZone.benefits,
    contributionMultiplier: 2.0,
    status: 'active'
  };

  res.json({
    message: 'Welcome to the Infinite Awareness Zone!',
    entry,
    abilities: infiniteAwarenessZone.benefits,
    guidance: 'Your contributions to the ScrollVerse are now amplified'
  });
});

// ===== Statistics and Status =====

scrollSoulTrainingRouter.get('/stats', (req, res) => {
  const levels = Array.from(resonanceTrainingLevels.values());
  const modules = Array.from(trainingModules.values());
  const profiles = Array.from(scrollSoulProfiles.values());
  const sessions = Array.from(trainingSessions.values());

  const avgMastery = profiles.length > 0
    ? profiles.reduce((sum, p) => sum + p.mastery, 0) / profiles.length
    : 0;

  res.json({
    trainingLevels: {
      total: levels.length,
      frequencies: [...new Set(levels.map(l => l.targetFrequency))]
    },
    modules: {
      total: modules.length,
      totalDuration: modules.reduce((sum, m) => sum + m.duration, 0),
      totalMasteryPoints: modules.reduce((sum, m) => sum + m.masteryPoints, 0)
    },
    scrollSouls: {
      totalProfiles: profiles.length,
      averageMastery: Math.round(avgMastery * 100) / 100,
      infiniteAwarenessAccess: profiles.filter(p => p.infiniteAwarenessAccess).length
    },
    sessions: {
      total: sessions.length,
      completed: sessions.filter(s => s.status === 'completed').length,
      active: sessions.filter(s => s.status === 'in_progress').length
    },
    coherenceMeasurements: coherenceMeasurements.length
  });
});

scrollSoulTrainingRouter.get('/status', (req, res) => {
  res.json({
    status: 'active',
    service: 'ScrollSoul Training - Coherence Stability Layer',
    version: '1.0.0',
    features: [
      '963Hz / 528Hz Resonance Training',
      'Progressive Mastery Levels',
      'Structured Training Modules',
      'Coherence Measurement',
      'Infinite Awareness Zone Access'
    ],
    keyFrequencies: {
      '528Hz': 'Love Frequency - DNA transformation',
      '963Hz': 'Divine Consciousness - Full enlightenment'
    },
    timestamp: new Date().toISOString()
  });
});

export { scrollSoulTrainingRouter };
