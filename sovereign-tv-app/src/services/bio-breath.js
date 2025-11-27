/**
 * Bio-Breath Libraries Service
 * 
 * Implements bio-feedback integration into branch prioritizations and
 * bio-interfaced runtime hooks for dynamic suggestion experiments.
 * 
 * Features:
 * - Bio-feedback signal processing
 * - Branch prioritization based on biometric data
 * - Breath-synchronized runtime hooks
 * - Dynamic step-state management
 * 
 * @author Chais Hill - OmniTech1
 */

import { Router } from 'express';
import { randomUUID } from 'crypto';
import { authenticateToken } from './auth.js';
import { standardLimiter } from '../utils/rate-limiter.js';
import { COSMIC_STRING_FREQUENCIES } from '../utils/constants.js';

const bioBreathRouter = Router();

// Bio-Breath Patterns - breathing patterns for different states
const bioBreathPatterns = new Map([
  ['pattern_sovereign_breath', {
    id: 'pattern_sovereign_breath',
    name: 'Sovereign Breath',
    description: 'Deep diaphragmatic breathing for sovereignty activation',
    inhaleSeconds: 4,
    holdSeconds: 7,
    exhaleSeconds: 8,
    cycleCount: 3,
    frequency: '963Hz',
    branchPriority: 'sovereign',
    effect: 'heightened_awareness',
    status: 'active'
  }],
  ['pattern_creative_flow', {
    id: 'pattern_creative_flow',
    name: 'Creative Flow Breath',
    description: 'Rhythmic breathing for enhanced creative states',
    inhaleSeconds: 5,
    holdSeconds: 2,
    exhaleSeconds: 5,
    cycleCount: 5,
    frequency: '528Hz',
    branchPriority: 'creative',
    effect: 'creative_enhancement',
    status: 'active'
  }],
  ['pattern_quantum_sync', {
    id: 'pattern_quantum_sync',
    name: 'Quantum Synchronization Breath',
    description: 'Alternating nostril breathing for quantum coherence',
    inhaleSeconds: 4,
    holdSeconds: 4,
    exhaleSeconds: 4,
    cycleCount: 7,
    frequency: '777Hz',
    branchPriority: 'quantum',
    effect: 'quantum_alignment',
    status: 'active'
  }],
  ['pattern_grounding', {
    id: 'pattern_grounding',
    name: 'Grounding Earth Breath',
    description: 'Slow, deep breathing for stability and grounding',
    inhaleSeconds: 6,
    holdSeconds: 3,
    exhaleSeconds: 9,
    cycleCount: 4,
    frequency: '432Hz',
    branchPriority: 'foundation',
    effect: 'stability_enhancement',
    status: 'active'
  }],
  ['pattern_manifestation', {
    id: 'pattern_manifestation',
    name: 'Manifestation Breath',
    description: 'Focused breathing for intention manifestation',
    inhaleSeconds: 3,
    holdSeconds: 6,
    exhaleSeconds: 9,
    cycleCount: 6,
    frequency: '369Hz',
    branchPriority: 'creation',
    effect: 'manifestation_power',
    status: 'active'
  }]
]);

// Branch Prioritization Rules - bio-feedback driven branch selection
const branchPrioritizations = new Map([
  ['sovereign', {
    id: 'sovereign',
    name: 'Sovereign Branch',
    priority: 1,
    bioMetricThresholds: {
      heartRateVariability: 80,
      breathCoherence: 0.90,
      skinConductance: 0.3
    },
    requiredFrequency: '963Hz',
    activationCriteria: 'High coherence state with sovereign breath pattern',
    actions: ['unlock_premium', 'enable_advanced_features', 'priority_access']
  }],
  ['creative', {
    id: 'creative',
    name: 'Creative Branch',
    priority: 2,
    bioMetricThresholds: {
      heartRateVariability: 70,
      breathCoherence: 0.80,
      skinConductance: 0.4
    },
    requiredFrequency: '528Hz',
    activationCriteria: 'Relaxed creative state with flow breath',
    actions: ['creative_tools_access', 'inspiration_boost', 'collaborative_mode']
  }],
  ['quantum', {
    id: 'quantum',
    name: 'Quantum Branch',
    priority: 3,
    bioMetricThresholds: {
      heartRateVariability: 75,
      breathCoherence: 0.85,
      skinConductance: 0.35
    },
    requiredFrequency: '777Hz',
    activationCriteria: 'Balanced quantum state with synchronized breathing',
    actions: ['quantum_features', 'dimensional_access', 'enhanced_processing']
  }],
  ['foundation', {
    id: 'foundation',
    name: 'Foundation Branch',
    priority: 4,
    bioMetricThresholds: {
      heartRateVariability: 60,
      breathCoherence: 0.70,
      skinConductance: 0.5
    },
    requiredFrequency: '432Hz',
    activationCriteria: 'Grounded state with earth breath',
    actions: ['base_features', 'stability_mode', 'recovery_support']
  }],
  ['creation', {
    id: 'creation',
    name: 'Creation Branch',
    priority: 5,
    bioMetricThresholds: {
      heartRateVariability: 65,
      breathCoherence: 0.75,
      skinConductance: 0.45
    },
    requiredFrequency: '369Hz',
    activationCriteria: 'Focused manifestation state',
    actions: ['creation_tools', 'intent_amplification', 'goal_setting']
  }]
]);

// Runtime Hooks - bio-interfaced execution hooks
const runtimeHooks = new Map([
  ['hook_breath_start', {
    id: 'hook_breath_start',
    name: 'Breath Cycle Start Hook',
    trigger: 'inhale_begin',
    description: 'Triggers at the start of each breath cycle',
    callbacks: [],
    status: 'active'
  }],
  ['hook_breath_hold', {
    id: 'hook_breath_hold',
    name: 'Breath Hold Hook',
    trigger: 'hold_phase',
    description: 'Triggers during breath hold phase',
    callbacks: [],
    status: 'active'
  }],
  ['hook_breath_release', {
    id: 'hook_breath_release',
    name: 'Breath Release Hook',
    trigger: 'exhale_begin',
    description: 'Triggers at the start of exhale',
    callbacks: [],
    status: 'active'
  }],
  ['hook_cycle_complete', {
    id: 'hook_cycle_complete',
    name: 'Cycle Complete Hook',
    trigger: 'cycle_end',
    description: 'Triggers when a full breath cycle completes',
    callbacks: [],
    status: 'active'
  }],
  ['hook_coherence_shift', {
    id: 'hook_coherence_shift',
    name: 'Coherence Shift Hook',
    trigger: 'coherence_change',
    description: 'Triggers when bio-coherence level changes significantly',
    callbacks: [],
    status: 'active'
  }],
  ['hook_branch_transition', {
    id: 'hook_branch_transition',
    name: 'Branch Transition Hook',
    trigger: 'branch_change',
    description: 'Triggers when branch prioritization changes',
    callbacks: [],
    status: 'active'
  }]
]);

// User Bio-Profiles
const bioProfiles = new Map();

// Active Bio-Sessions
const bioSessions = new Map();

// Step-State Registry
const stepStateRegistry = new Map();

// Bio-Metrics History
const bioMetricsHistory = [];

// ===== Bio-Breath Pattern Endpoints =====

// Get all breath patterns
bioBreathRouter.get('/patterns', (req, res) => {
  const patterns = Array.from(bioBreathPatterns.values());
  
  res.json({
    totalPatterns: patterns.length,
    patterns,
    description: 'Bio-breath patterns for branch prioritization and bio-feedback integration',
    frequencyMapping: Object.fromEntries(
      patterns.map(p => [p.id, { frequency: p.frequency, branchPriority: p.branchPriority }])
    )
  });
});

// Get specific pattern
bioBreathRouter.get('/patterns/:patternId', (req, res) => {
  const { patternId } = req.params;
  const pattern = bioBreathPatterns.get(patternId);

  if (!pattern) {
    return res.status(404).json({ error: 'Breath pattern not found' });
  }

  const totalCycleTime = (pattern.inhaleSeconds + pattern.holdSeconds + pattern.exhaleSeconds) * pattern.cycleCount;
  const frequencyDetails = COSMIC_STRING_FREQUENCIES[pattern.frequency];

  res.json({
    pattern,
    frequencyDetails,
    totalDuration: totalCycleTime,
    linkedBranch: branchPrioritizations.get(pattern.branchPriority)
  });
});

// Create custom breath pattern
bioBreathRouter.post('/patterns', authenticateToken, standardLimiter, (req, res) => {
  const { name, description, inhaleSeconds, holdSeconds, exhaleSeconds, cycleCount, frequency, branchPriority, effect } = req.body;

  if (!name || !inhaleSeconds || !exhaleSeconds) {
    return res.status(400).json({
      error: 'Pattern name, inhale seconds, and exhale seconds are required'
    });
  }

  const validFrequencies = Object.keys(COSMIC_STRING_FREQUENCIES);
  const validBranches = Array.from(branchPrioritizations.keys());

  const patternId = `pattern_${randomUUID().slice(0, 8)}`;
  const newPattern = {
    id: patternId,
    name,
    description: description || 'Custom bio-breath pattern',
    inhaleSeconds: Math.max(1, Math.min(15, inhaleSeconds)),
    holdSeconds: Math.max(0, Math.min(30, holdSeconds || 0)),
    exhaleSeconds: Math.max(1, Math.min(20, exhaleSeconds)),
    cycleCount: Math.max(1, Math.min(20, cycleCount || 3)),
    frequency: validFrequencies.includes(frequency) ? frequency : '432Hz',
    branchPriority: validBranches.includes(branchPriority) ? branchPriority : 'foundation',
    effect: effect || 'custom_effect',
    status: 'active',
    createdBy: req.user.username,
    createdAt: new Date().toISOString()
  };

  bioBreathPatterns.set(patternId, newPattern);

  res.status(201).json({
    message: 'Bio-breath pattern created successfully',
    pattern: newPattern
  });
});

// ===== Branch Prioritization Endpoints =====

// Get all branch prioritizations
bioBreathRouter.get('/branches', (req, res) => {
  const branches = Array.from(branchPrioritizations.values());
  
  res.json({
    totalBranches: branches.length,
    branches: branches.sort((a, b) => a.priority - b.priority),
    description: 'Bio-feedback driven branch prioritization rules'
  });
});

// Get specific branch
bioBreathRouter.get('/branches/:branchId', (req, res) => {
  const { branchId } = req.params;
  const branch = branchPrioritizations.get(branchId);

  if (!branch) {
    return res.status(404).json({ error: 'Branch not found' });
  }

  const linkedPattern = Array.from(bioBreathPatterns.values())
    .find(p => p.branchPriority === branchId);

  res.json({
    branch,
    linkedPattern,
    frequencyDetails: COSMIC_STRING_FREQUENCIES[branch.requiredFrequency]
  });
});

// Evaluate branch based on bio-metrics
bioBreathRouter.post('/branches/evaluate', authenticateToken, standardLimiter, (req, res) => {
  const { heartRateVariability, breathCoherence, skinConductance, currentFrequency } = req.body;

  if (heartRateVariability === undefined || breathCoherence === undefined) {
    return res.status(400).json({
      error: 'Heart rate variability and breath coherence are required'
    });
  }

  const metrics = {
    heartRateVariability: Math.max(0, Math.min(100, heartRateVariability)),
    breathCoherence: Math.max(0, Math.min(1, breathCoherence)),
    skinConductance: Math.max(0, Math.min(1, skinConductance || 0.5))
  };

  // Find matching branch based on thresholds
  const branches = Array.from(branchPrioritizations.values())
    .sort((a, b) => a.priority - b.priority);

  let selectedBranch = null;
  let matchDetails = [];

  for (const branch of branches) {
    const hrvMatch = metrics.heartRateVariability >= branch.bioMetricThresholds.heartRateVariability;
    const coherenceMatch = metrics.breathCoherence >= branch.bioMetricThresholds.breathCoherence;
    const conductanceMatch = metrics.skinConductance <= branch.bioMetricThresholds.skinConductance;
    const frequencyMatch = !currentFrequency || currentFrequency === branch.requiredFrequency;

    const matchScore = (hrvMatch ? 1 : 0) + (coherenceMatch ? 1 : 0) + (conductanceMatch ? 1 : 0) + (frequencyMatch ? 0.5 : 0);

    matchDetails.push({
      branchId: branch.id,
      branchName: branch.name,
      matchScore,
      hrvMatch,
      coherenceMatch,
      conductanceMatch,
      frequencyMatch
    });

    if (hrvMatch && coherenceMatch && conductanceMatch && !selectedBranch) {
      selectedBranch = branch;
    }
  }

  const evaluation = {
    id: `eval_${randomUUID().slice(0, 8)}`,
    inputMetrics: metrics,
    currentFrequency: currentFrequency || 'not_specified',
    selectedBranch: selectedBranch?.id || 'foundation',
    selectedBranchName: selectedBranch?.name || 'Foundation Branch',
    selectedBranchPriority: selectedBranch?.priority || 4,
    availableActions: selectedBranch?.actions || ['base_features'],
    matchDetails: matchDetails.sort((a, b) => b.matchScore - a.matchScore),
    evaluatedBy: req.user.username,
    evaluatedAt: new Date().toISOString()
  };

  // Record metrics history
  bioMetricsHistory.push({
    userId: req.user.username,
    ...metrics,
    selectedBranch: evaluation.selectedBranch,
    timestamp: evaluation.evaluatedAt
  });

  res.json({
    message: 'Branch evaluation complete',
    evaluation
  });
});

// ===== Runtime Hooks Endpoints =====

// Get all runtime hooks
bioBreathRouter.get('/hooks', (req, res) => {
  const hooks = Array.from(runtimeHooks.values()).map(h => ({
    ...h,
    callbackCount: h.callbacks.length
  }));
  
  res.json({
    totalHooks: hooks.length,
    hooks,
    description: 'Bio-interfaced runtime hooks for breath-synchronized execution'
  });
});

// Register callback to a hook
bioBreathRouter.post('/hooks/:hookId/register', authenticateToken, standardLimiter, (req, res) => {
  const { hookId } = req.params;
  const { callbackName, callbackAction, priority } = req.body;

  const hook = runtimeHooks.get(hookId);
  if (!hook) {
    return res.status(404).json({ error: 'Runtime hook not found' });
  }

  if (!callbackName || !callbackAction) {
    return res.status(400).json({
      error: 'Callback name and action are required'
    });
  }

  const callback = {
    id: `cb_${randomUUID().slice(0, 8)}`,
    name: callbackName,
    action: callbackAction,
    priority: priority || 10,
    registeredBy: req.user.username,
    registeredAt: new Date().toISOString(),
    status: 'active'
  };

  hook.callbacks.push(callback);
  hook.callbacks.sort((a, b) => a.priority - b.priority);

  res.status(201).json({
    message: 'Callback registered to hook',
    hookId,
    callback
  });
});

// Trigger a hook (simulate)
bioBreathRouter.post('/hooks/:hookId/trigger', authenticateToken, standardLimiter, (req, res) => {
  const { hookId } = req.params;
  const { context } = req.body;

  const hook = runtimeHooks.get(hookId);
  if (!hook) {
    return res.status(404).json({ error: 'Runtime hook not found' });
  }

  const activeCallbacks = hook.callbacks.filter(cb => cb.status === 'active');
  const executionResults = activeCallbacks.map(cb => ({
    callbackId: cb.id,
    callbackName: cb.name,
    action: cb.action,
    executed: true,
    executedAt: new Date().toISOString()
  }));

  res.json({
    message: `Hook ${hookId} triggered`,
    trigger: hook.trigger,
    context: context || {},
    executionResults,
    totalExecuted: executionResults.length
  });
});

// ===== Bio-Session Endpoints =====

// Start bio-session
bioBreathRouter.post('/sessions/start', authenticateToken, standardLimiter, (req, res) => {
  const { patternId, targetBranch } = req.body;
  const userId = req.user.username;

  const pattern = patternId ? bioBreathPatterns.get(patternId) : null;

  const sessionId = `biosess_${randomUUID()}`;
  const session = {
    id: sessionId,
    userId,
    pattern: pattern?.id || null,
    patternName: pattern?.name || 'Freeform',
    targetBranch: targetBranch || 'foundation',
    currentCycle: 0,
    totalCycles: pattern?.cycleCount || 1,
    currentPhase: 'ready',
    bioMetricsSnapshots: [],
    hooksTriggered: [],
    stepStates: [],
    startedAt: new Date().toISOString(),
    status: 'active'
  };

  bioSessions.set(sessionId, session);

  res.status(201).json({
    message: 'Bio-session started',
    session,
    patternDetails: pattern,
    targetBranchDetails: branchPrioritizations.get(session.targetBranch)
  });
});

// Update session bio-metrics
bioBreathRouter.post('/sessions/:sessionId/update', authenticateToken, standardLimiter, (req, res) => {
  const { sessionId } = req.params;
  const { phase, cycleNumber, bioMetrics } = req.body;

  const session = bioSessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Bio-session not found' });
  }

  if (session.userId !== req.user.username) {
    return res.status(403).json({ error: 'Not authorized for this session' });
  }

  // Update session state
  if (phase) session.currentPhase = phase;
  if (cycleNumber) session.currentCycle = cycleNumber;

  // Record bio-metrics snapshot
  if (bioMetrics) {
    const snapshot = {
      timestamp: new Date().toISOString(),
      phase: session.currentPhase,
      cycle: session.currentCycle,
      ...bioMetrics
    };
    session.bioMetricsSnapshots.push(snapshot);

    // Check for hook triggers
    const phaseHookMap = {
      'inhale': 'hook_breath_start',
      'hold': 'hook_breath_hold',
      'exhale': 'hook_breath_release'
    };

    if (phaseHookMap[phase]) {
      session.hooksTriggered.push({
        hookId: phaseHookMap[phase],
        timestamp: snapshot.timestamp,
        cycle: session.currentCycle
      });
    }
  }

  // Check cycle completion
  if (phase === 'exhale_complete') {
    session.hooksTriggered.push({
      hookId: 'hook_cycle_complete',
      timestamp: new Date().toISOString(),
      cycle: session.currentCycle
    });

    if (session.currentCycle >= session.totalCycles) {
      session.status = 'completing';
    }
  }

  res.json({
    message: 'Session updated',
    session: {
      ...session,
      recentSnapshots: session.bioMetricsSnapshots.slice(-5)
    }
  });
});

// End bio-session
bioBreathRouter.post('/sessions/:sessionId/end', authenticateToken, standardLimiter, (req, res) => {
  const { sessionId } = req.params;

  const session = bioSessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Bio-session not found' });
  }

  if (session.userId !== req.user.username) {
    return res.status(403).json({ error: 'Not authorized for this session' });
  }

  session.status = 'completed';
  session.endedAt = new Date().toISOString();

  // Calculate session summary
  const snapshots = session.bioMetricsSnapshots;
  const avgCoherence = snapshots.length > 0
    ? snapshots.filter(s => s.breathCoherence !== undefined)
      .reduce((sum, s) => sum + s.breathCoherence, 0) / 
      snapshots.filter(s => s.breathCoherence !== undefined).length
    : 0;

  const sessionSummary = {
    sessionId,
    duration: new Date(session.endedAt) - new Date(session.startedAt),
    pattern: session.patternName,
    cyclesCompleted: session.currentCycle,
    totalMetricsSnapshots: snapshots.length,
    averageCoherence: Math.round(avgCoherence * 1000) / 1000,
    hooksTriggered: session.hooksTriggered.length,
    achievedBranch: avgCoherence >= 0.9 ? 'sovereign' : 
      avgCoherence >= 0.8 ? 'creative' :
        avgCoherence >= 0.7 ? 'quantum' : 'foundation'
  };

  res.json({
    message: 'Bio-session completed',
    sessionSummary
  });
});

// ===== Step-State Management =====

// Register step-state
bioBreathRouter.post('/step-states', authenticateToken, standardLimiter, (req, res) => {
  const { name, description, transitionConditions, branchDependency } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Step-state name is required' });
  }

  const stateId = `state_${randomUUID().slice(0, 8)}`;
  const stepState = {
    id: stateId,
    name,
    description: description || 'Custom step-state',
    transitionConditions: transitionConditions || [],
    branchDependency: branchDependency || null,
    activations: 0,
    lastActivated: null,
    createdBy: req.user.username,
    createdAt: new Date().toISOString(),
    status: 'active'
  };

  stepStateRegistry.set(stateId, stepState);

  res.status(201).json({
    message: 'Step-state registered',
    stepState
  });
});

// Get step-states
bioBreathRouter.get('/step-states', (req, res) => {
  const states = Array.from(stepStateRegistry.values());
  
  res.json({
    totalStates: states.length,
    stepStates: states,
    description: 'Bio-interfaced step-states for suggestion experiments'
  });
});

// Activate step-state
bioBreathRouter.post('/step-states/:stateId/activate', authenticateToken, standardLimiter, (req, res) => {
  const { stateId } = req.params;
  const { context, bioMetrics } = req.body;

  const state = stepStateRegistry.get(stateId);
  if (!state) {
    return res.status(404).json({ error: 'Step-state not found' });
  }

  // Check branch dependency if exists
  let branchCheck = { passed: true, message: 'No branch dependency' };
  if (state.branchDependency) {
    const branch = branchPrioritizations.get(state.branchDependency);
    if (branch && bioMetrics) {
      const meetsThresholds = 
        (!bioMetrics.breathCoherence || bioMetrics.breathCoherence >= branch.bioMetricThresholds.breathCoherence);
      branchCheck = {
        passed: meetsThresholds,
        message: meetsThresholds ? 'Branch requirements met' : 'Branch requirements not met'
      };
    }
  }

  state.activations++;
  state.lastActivated = new Date().toISOString();

  res.json({
    message: branchCheck.passed ? 'Step-state activated' : 'Step-state activation conditional',
    stateId,
    stateName: state.name,
    activations: state.activations,
    branchCheck,
    context: context || {},
    activatedAt: state.lastActivated
  });
});

// ===== Statistics and Status =====

bioBreathRouter.get('/stats', (req, res) => {
  const patterns = Array.from(bioBreathPatterns.values());
  const sessions = Array.from(bioSessions.values());
  const states = Array.from(stepStateRegistry.values());

  res.json({
    patterns: {
      total: patterns.length,
      byFrequency: Object.keys(COSMIC_STRING_FREQUENCIES).map(freq => ({
        frequency: freq,
        count: patterns.filter(p => p.frequency === freq).length
      }))
    },
    branches: {
      total: branchPrioritizations.size,
      list: Array.from(branchPrioritizations.keys())
    },
    hooks: {
      total: runtimeHooks.size,
      totalCallbacks: Array.from(runtimeHooks.values())
        .reduce((sum, h) => sum + h.callbacks.length, 0)
    },
    sessions: {
      total: sessions.length,
      active: sessions.filter(s => s.status === 'active').length,
      completed: sessions.filter(s => s.status === 'completed').length
    },
    stepStates: {
      total: states.length,
      totalActivations: states.reduce((sum, s) => sum + s.activations, 0)
    },
    metricsHistory: {
      totalRecorded: bioMetricsHistory.length
    }
  });
});

bioBreathRouter.get('/status', (req, res) => {
  res.json({
    status: 'active',
    service: 'Bio-Breath Libraries',
    version: '1.0.0',
    features: [
      'Bio-Feedback Signal Processing',
      'Branch Prioritization via Biometrics',
      'Breath-Synchronized Runtime Hooks',
      'Dynamic Step-State Management',
      'Custom Breath Pattern Creation',
      'Real-Time Bio-Session Tracking'
    ],
    operationalStatus: 'optimal',
    bioCoherence: 98.5,
    timestamp: new Date().toISOString()
  });
});

export { bioBreathRouter };
