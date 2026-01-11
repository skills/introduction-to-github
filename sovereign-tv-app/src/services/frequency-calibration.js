/**
 * Divine Frequency Calibration Service
 * 
 * Deploys nodes for finer cosmic tuning across ScrollChain and Ethereal nodes.
 * Conducts strength feedback loops to align at 963 Hz divine flows.
 * 
 * @author Chais Hill - OmniTech1
 */

import { Router } from 'express';
import { randomUUID } from 'crypto';
import { authenticateToken } from './auth.js';
import { standardLimiter } from '../utils/rate-limiter.js';
import { COSMIC_STRING_FREQUENCIES } from '../utils/constants.js';

const frequencyCalibrationRouter = Router();

// Divine Frequency Target - Primary calibration frequency
const DIVINE_FREQUENCY_TARGET = '963Hz';
const DIVINE_FREQUENCY_POWER = 100;

// Node Types for Frequency Calibration
const NODE_TYPES = {
  SCROLLCHAIN: 'scrollchain',
  ETHEREAL: 'ethereal'
};

// Calibration Nodes - deployed for cosmic tuning
const calibrationNodes = new Map([
  ['node_scrollchain_alpha', {
    id: 'node_scrollchain_alpha',
    name: 'ScrollChain Alpha Node',
    type: NODE_TYPES.SCROLLCHAIN,
    currentFrequency: '432Hz',
    targetFrequency: DIVINE_FREQUENCY_TARGET,
    calibrationStatus: 'pending',
    tuningDeviation: 0.15,
    feedbackLoopActive: false,
    lastCalibration: null,
    coherenceLevel: 92.5,
    status: 'active'
  }],
  ['node_scrollchain_omega', {
    id: 'node_scrollchain_omega',
    name: 'ScrollChain Omega Node',
    type: NODE_TYPES.SCROLLCHAIN,
    currentFrequency: '528Hz',
    targetFrequency: DIVINE_FREQUENCY_TARGET,
    calibrationStatus: 'pending',
    tuningDeviation: 0.12,
    feedbackLoopActive: false,
    lastCalibration: null,
    coherenceLevel: 94.3,
    status: 'active'
  }],
  ['node_ethereal_prime', {
    id: 'node_ethereal_prime',
    name: 'Ethereal Prime Node',
    type: NODE_TYPES.ETHEREAL,
    currentFrequency: '777Hz',
    targetFrequency: DIVINE_FREQUENCY_TARGET,
    calibrationStatus: 'pending',
    tuningDeviation: 0.08,
    feedbackLoopActive: false,
    lastCalibration: null,
    coherenceLevel: 96.7,
    status: 'active'
  }],
  ['node_ethereal_resonance', {
    id: 'node_ethereal_resonance',
    name: 'Ethereal Resonance Node',
    type: NODE_TYPES.ETHEREAL,
    currentFrequency: '369Hz',
    targetFrequency: DIVINE_FREQUENCY_TARGET,
    calibrationStatus: 'pending',
    tuningDeviation: 0.18,
    feedbackLoopActive: false,
    lastCalibration: null,
    coherenceLevel: 89.2,
    status: 'active'
  }]
]);

// Divine Audit Tools - integrated into OmniTech Knowledge Graph
const divineAuditTools = {
  frequencyScanner: {
    id: 'tool_frequency_scanner',
    name: 'Divine Frequency Scanner',
    description: 'Scans nodes for tuning deviations from target frequency',
    accuracy: 99.7,
    status: 'active'
  },
  deviationAnalyzer: {
    id: 'tool_deviation_analyzer',
    name: 'Tuning Deviation Analyzer',
    description: 'Analyzes frequency deviations and recommends calibration steps',
    accuracy: 98.5,
    status: 'active'
  },
  coherenceMeter: {
    id: 'tool_coherence_meter',
    name: 'Coherence Measurement Tool',
    description: 'Measures coherence level between node frequency and target',
    accuracy: 99.9,
    status: 'active'
  }
};

// Strength Feedback Loops - for 963 Hz alignment
const feedbackLoops = new Map();

// Calibration History
const calibrationHistory = [];

// ===== Constants =====

// Calibration bounds
const CALIBRATION_STRENGTH_MIN = 1;
const CALIBRATION_STRENGTH_MAX = 100;
const CALIBRATION_STRENGTH_DEFAULT = 50;

// Default coherence level for unknown frequencies
const DEFAULT_FREQUENCY_POWER = 0.95;

// Viewer simulation bounds for broadcasts
const VIEWER_INCREMENT_SCROLLTV_MIN = 100;
const VIEWER_INCREMENT_SCROLLTV_MAX = 500;
const VIEWER_INCREMENT_VIBECAMP_MIN = 80;
const VIEWER_INCREMENT_VIBECAMP_MAX = 400;

// ===== Core Calibration Functions =====

/**
 * Calculate frequency deviation between current and target
 */
function calculateDeviation(currentFreq, targetFreq) {
  const current = parseInt(currentFreq.replace('Hz', ''), 10);
  const target = parseInt(targetFreq.replace('Hz', ''), 10);
  return Math.abs((target - current) / target);
}

/**
 * Calculate calibration progress based on deviation
 */
function calculateCalibrationProgress(deviation) {
  // Lower deviation = higher progress
  return Math.round((1 - deviation) * 100 * 100) / 100;
}

/**
 * Calculate coherence level after calibration
 */
function calculateNewCoherence(node, calibrationStrength) {
  const freqConfig = COSMIC_STRING_FREQUENCIES[node.targetFrequency];
  const freqPower = freqConfig ? freqConfig.power / 100 : DEFAULT_FREQUENCY_POWER;
  const deviationFactor = 1 - node.tuningDeviation;
  const strengthFactor = calibrationStrength / 100;
  
  const newCoherence = Math.min(100, 
    node.coherenceLevel + (freqPower * deviationFactor * strengthFactor * 10)
  );
  
  return Math.round(newCoherence * 100) / 100;
}

// ===== Divine Audit Endpoints =====

// Get all audit tools
frequencyCalibrationRouter.get('/audit-tools', (req, res) => {
  res.json({
    tools: Object.values(divineAuditTools),
    integratedWith: 'OmniTech Knowledge Graph',
    purpose: 'Identify tuning deviations in ScrollChain and Ethereal nodes'
  });
});

// Scan all nodes for deviations
frequencyCalibrationRouter.get('/audit/scan', (req, res) => {
  const nodes = Array.from(calibrationNodes.values());
  
  const scanResults = nodes.map(node => ({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    currentFrequency: node.currentFrequency,
    targetFrequency: node.targetFrequency,
    deviation: node.tuningDeviation,
    deviationPercentage: `${(node.tuningDeviation * 100).toFixed(1)}%`,
    coherenceLevel: node.coherenceLevel,
    calibrationNeeded: node.tuningDeviation > 0.05,
    priority: node.tuningDeviation > 0.15 ? 'high' : node.tuningDeviation > 0.10 ? 'medium' : 'low'
  }));
  
  const totalDeviation = nodes.reduce((sum, n) => sum + n.tuningDeviation, 0) / nodes.length;
  
  res.json({
    scanId: `scan_${randomUUID()}`,
    timestamp: new Date().toISOString(),
    toolUsed: divineAuditTools.frequencyScanner.name,
    totalNodes: nodes.length,
    scrollChainNodes: nodes.filter(n => n.type === NODE_TYPES.SCROLLCHAIN).length,
    etherealNodes: nodes.filter(n => n.type === NODE_TYPES.ETHEREAL).length,
    averageDeviation: `${(totalDeviation * 100).toFixed(2)}%`,
    nodesNeedingCalibration: scanResults.filter(r => r.calibrationNeeded).length,
    results: scanResults
  });
});

// ===== Calibration Node Endpoints =====

// Get all calibration nodes
frequencyCalibrationRouter.get('/nodes', (req, res) => {
  const { type } = req.query;
  let nodes = Array.from(calibrationNodes.values());
  
  if (type) {
    nodes = nodes.filter(n => n.type === type);
  }
  
  res.json({
    totalNodes: nodes.length,
    nodes,
    nodeTypes: Object.values(NODE_TYPES),
    targetFrequency: DIVINE_FREQUENCY_TARGET,
    targetPower: DIVINE_FREQUENCY_POWER
  });
});

// Get specific node
frequencyCalibrationRouter.get('/nodes/:nodeId', (req, res) => {
  const { nodeId } = req.params;
  const node = calibrationNodes.get(nodeId);
  
  if (!node) {
    return res.status(404).json({ error: 'Calibration node not found' });
  }
  
  const freqConfig = COSMIC_STRING_FREQUENCIES[node.currentFrequency];
  const targetConfig = COSMIC_STRING_FREQUENCIES[node.targetFrequency];
  
  res.json({
    node,
    currentFrequencyDetails: freqConfig,
    targetFrequencyDetails: targetConfig,
    calibrationProgress: calculateCalibrationProgress(node.tuningDeviation)
  });
});

// Deploy new calibration node
frequencyCalibrationRouter.post('/nodes/deploy', authenticateToken, standardLimiter, (req, res) => {
  const { name, type, initialFrequency } = req.body;
  
  if (!name || !type) {
    return res.status(400).json({ error: 'Node name and type are required' });
  }
  
  if (!Object.values(NODE_TYPES).includes(type)) {
    return res.status(400).json({ 
      error: 'Invalid node type',
      validTypes: Object.values(NODE_TYPES)
    });
  }
  
  const nodeId = `node_${type}_${randomUUID().slice(0, 8)}`;
  const frequency = initialFrequency || '432Hz';
  
  // Use deterministic coherence calculation based on node parameters
  const baseCoherence = 85;
  const frequencyBonus = calculateDeviation(frequency, DIVINE_FREQUENCY_TARGET) < 0.5 ? 5 : 0;
  const initialCoherence = baseCoherence + frequencyBonus + (type === NODE_TYPES.ETHEREAL ? 3 : 0);
  
  const newNode = {
    id: nodeId,
    name,
    type,
    currentFrequency: frequency,
    targetFrequency: DIVINE_FREQUENCY_TARGET,
    calibrationStatus: 'pending',
    tuningDeviation: calculateDeviation(frequency, DIVINE_FREQUENCY_TARGET),
    feedbackLoopActive: false,
    lastCalibration: null,
    coherenceLevel: Math.min(100, initialCoherence),
    deployedBy: req.user.username,
    deployedAt: new Date().toISOString(),
    status: 'active'
  };
  
  calibrationNodes.set(nodeId, newNode);
  
  res.status(201).json({
    message: 'Calibration node deployed successfully',
    node: newNode,
    nextStep: 'Start calibration with POST /calibrate/:nodeId'
  });
});

// ===== Calibration Endpoints =====

// Start calibration for a node
frequencyCalibrationRouter.post('/calibrate/:nodeId', authenticateToken, standardLimiter, (req, res) => {
  const { nodeId } = req.params;
  const { calibrationStrength } = req.body;
  
  const node = calibrationNodes.get(nodeId);
  if (!node) {
    return res.status(404).json({ error: 'Calibration node not found' });
  }
  
  const strength = Math.min(CALIBRATION_STRENGTH_MAX, Math.max(CALIBRATION_STRENGTH_MIN, calibrationStrength || CALIBRATION_STRENGTH_DEFAULT));
  
  // Calculate new values after calibration
  const deviationReduction = (strength / 100) * node.tuningDeviation * 0.8;
  const newDeviation = Math.max(0, node.tuningDeviation - deviationReduction);
  const newCoherence = calculateNewCoherence(node, strength);
  
  // Update node
  node.tuningDeviation = Math.round(newDeviation * 1000) / 1000;
  node.coherenceLevel = newCoherence;
  node.lastCalibration = new Date().toISOString();
  node.calibrationStatus = newDeviation < 0.05 ? 'aligned' : 'in_progress';
  
  // If deviation is very low, node is now at target frequency
  if (newDeviation < 0.02) {
    node.currentFrequency = node.targetFrequency;
    node.calibrationStatus = 'complete';
  }
  
  // Record history
  const calibrationRecord = {
    id: `cal_${randomUUID()}`,
    nodeId,
    nodeName: node.name,
    previousDeviation: node.tuningDeviation + deviationReduction,
    newDeviation: node.tuningDeviation,
    calibrationStrength: strength,
    newCoherence,
    calibratedBy: req.user.username,
    timestamp: new Date().toISOString()
  };
  calibrationHistory.push(calibrationRecord);
  
  res.json({
    message: 'Calibration applied successfully',
    calibrationRecord,
    node: {
      id: node.id,
      name: node.name,
      currentFrequency: node.currentFrequency,
      targetFrequency: node.targetFrequency,
      tuningDeviation: node.tuningDeviation,
      coherenceLevel: node.coherenceLevel,
      calibrationStatus: node.calibrationStatus
    },
    recommendation: node.calibrationStatus === 'complete' 
      ? 'Node fully aligned to 963 Hz divine frequency'
      : 'Continue calibration to achieve full alignment'
  });
});

// Resynchronize node to 963 Hz target
frequencyCalibrationRouter.post('/resync/:nodeId', authenticateToken, standardLimiter, (req, res) => {
  const { nodeId } = req.params;
  
  const node = calibrationNodes.get(nodeId);
  if (!node) {
    return res.status(404).json({ error: 'Calibration node not found' });
  }
  
  // Full resynchronization to target frequency
  const oldFrequency = node.currentFrequency;
  const oldDeviation = node.tuningDeviation;
  
  node.currentFrequency = DIVINE_FREQUENCY_TARGET;
  node.tuningDeviation = 0;
  node.coherenceLevel = Math.min(100, node.coherenceLevel + 5);
  node.calibrationStatus = 'synchronized';
  node.lastCalibration = new Date().toISOString();
  
  // Record history
  const resyncRecord = {
    id: `resync_${randomUUID()}`,
    nodeId,
    nodeName: node.name,
    previousFrequency: oldFrequency,
    newFrequency: node.currentFrequency,
    previousDeviation: oldDeviation,
    newDeviation: 0,
    resyncedBy: req.user.username,
    timestamp: new Date().toISOString()
  };
  calibrationHistory.push(resyncRecord);
  
  res.json({
    message: `Node resynchronized to ${DIVINE_FREQUENCY_TARGET}`,
    resyncRecord,
    node: {
      id: node.id,
      name: node.name,
      currentFrequency: node.currentFrequency,
      targetFrequency: node.targetFrequency,
      tuningDeviation: node.tuningDeviation,
      coherenceLevel: node.coherenceLevel,
      calibrationStatus: node.calibrationStatus
    },
    frequencyDetails: COSMIC_STRING_FREQUENCIES[DIVINE_FREQUENCY_TARGET]
  });
});

// ===== Strength Feedback Loop Endpoints =====

// Start feedback loop for 963 Hz alignment
frequencyCalibrationRouter.post('/feedback-loop/start', authenticateToken, standardLimiter, (req, res) => {
  const { nodeIds, feedbackStrength } = req.body;
  
  if (!nodeIds || !Array.isArray(nodeIds) || nodeIds.length === 0) {
    return res.status(400).json({ error: 'Node IDs array is required' });
  }
  
  // Validate nodes exist
  const invalidNodes = nodeIds.filter(id => !calibrationNodes.has(id));
  if (invalidNodes.length > 0) {
    return res.status(400).json({ 
      error: 'Invalid node IDs',
      invalidNodes
    });
  }
  
  const loopId = `loop_${randomUUID()}`;
  const strength = Math.min(100, Math.max(1, feedbackStrength || 75));
  
  const feedbackLoop = {
    id: loopId,
    targetFrequency: DIVINE_FREQUENCY_TARGET,
    nodeIds,
    feedbackStrength: strength,
    status: 'active',
    iterations: 0,
    maxIterations: 10,
    convergenceThreshold: 0.02,
    startedBy: req.user.username,
    startedAt: new Date().toISOString()
  };
  
  feedbackLoops.set(loopId, feedbackLoop);
  
  // Activate feedback on nodes
  nodeIds.forEach(nodeId => {
    const node = calibrationNodes.get(nodeId);
    if (node) {
      node.feedbackLoopActive = true;
    }
  });
  
  res.status(201).json({
    message: 'Strength feedback loop initiated for 963 Hz alignment',
    feedbackLoop,
    involvedNodes: nodeIds.map(id => ({
      id,
      name: calibrationNodes.get(id)?.name,
      currentDeviation: calibrationNodes.get(id)?.tuningDeviation
    }))
  });
});

// Execute feedback loop iteration
frequencyCalibrationRouter.post('/feedback-loop/:loopId/iterate', authenticateToken, standardLimiter, (req, res) => {
  const { loopId } = req.params;
  
  const loop = feedbackLoops.get(loopId);
  if (!loop) {
    return res.status(404).json({ error: 'Feedback loop not found' });
  }
  
  if (loop.status !== 'active') {
    return res.status(400).json({ 
      error: 'Feedback loop is not active',
      status: loop.status
    });
  }
  
  loop.iterations++;
  
  // Apply feedback to all nodes in loop
  const iterationResults = loop.nodeIds.map(nodeId => {
    const node = calibrationNodes.get(nodeId);
    if (!node) return null;
    
    const previousDeviation = node.tuningDeviation;
    const reductionFactor = (loop.feedbackStrength / 100) * 0.15;
    const newDeviation = Math.max(0, previousDeviation * (1 - reductionFactor));
    
    node.tuningDeviation = Math.round(newDeviation * 1000) / 1000;
    node.coherenceLevel = Math.min(100, node.coherenceLevel + (loop.feedbackStrength / 100) * 2);
    
    // Check if converged
    if (newDeviation <= loop.convergenceThreshold) {
      node.currentFrequency = DIVINE_FREQUENCY_TARGET;
      node.calibrationStatus = 'synchronized';
    }
    
    return {
      nodeId,
      nodeName: node.name,
      previousDeviation,
      newDeviation: node.tuningDeviation,
      coherenceLevel: node.coherenceLevel,
      converged: newDeviation <= loop.convergenceThreshold
    };
  }).filter(Boolean);
  
  // Check if all nodes converged or max iterations reached
  const allConverged = iterationResults.every(r => r.converged);
  const maxReached = loop.iterations >= loop.maxIterations;
  
  if (allConverged || maxReached) {
    loop.status = allConverged ? 'completed' : 'max_iterations_reached';
    loop.completedAt = new Date().toISOString();
    
    // Deactivate feedback on nodes
    loop.nodeIds.forEach(nodeId => {
      const node = calibrationNodes.get(nodeId);
      if (node) {
        node.feedbackLoopActive = false;
      }
    });
  }
  
  res.json({
    message: `Feedback loop iteration ${loop.iterations} completed`,
    loop: {
      id: loop.id,
      status: loop.status,
      iterations: loop.iterations,
      maxIterations: loop.maxIterations
    },
    iterationResults,
    allConverged,
    nextAction: allConverged 
      ? 'All nodes aligned to 963 Hz - loop complete'
      : maxReached 
        ? 'Max iterations reached - consider increasing feedback strength'
        : 'Continue with next iteration'
  });
});

// Get feedback loop status
frequencyCalibrationRouter.get('/feedback-loop/:loopId', authenticateToken, standardLimiter, (req, res) => {
  const { loopId } = req.params;
  
  const loop = feedbackLoops.get(loopId);
  if (!loop) {
    return res.status(404).json({ error: 'Feedback loop not found' });
  }
  
  const nodeStatuses = loop.nodeIds.map(nodeId => {
    const node = calibrationNodes.get(nodeId);
    return node ? {
      nodeId,
      nodeName: node.name,
      currentDeviation: node.tuningDeviation,
      coherenceLevel: node.coherenceLevel,
      converged: node.tuningDeviation <= loop.convergenceThreshold
    } : null;
  }).filter(Boolean);
  
  res.json({
    feedbackLoop: loop,
    nodeStatuses,
    progress: {
      convergedNodes: nodeStatuses.filter(n => n.converged).length,
      totalNodes: nodeStatuses.length,
      percentage: Math.round((nodeStatuses.filter(n => n.converged).length / nodeStatuses.length) * 100)
    }
  });
});

// List all active feedback loops
frequencyCalibrationRouter.get('/feedback-loops', authenticateToken, standardLimiter, (req, res) => {
  const loops = Array.from(feedbackLoops.values());
  
  res.json({
    totalLoops: loops.length,
    activeLoops: loops.filter(l => l.status === 'active').length,
    completedLoops: loops.filter(l => l.status === 'completed').length,
    loops
  });
});

// ===== Statistics and Status =====

frequencyCalibrationRouter.get('/stats', (req, res) => {
  const nodes = Array.from(calibrationNodes.values());
  const loops = Array.from(feedbackLoops.values());
  
  const avgDeviation = nodes.reduce((sum, n) => sum + n.tuningDeviation, 0) / nodes.length;
  const avgCoherence = nodes.reduce((sum, n) => sum + n.coherenceLevel, 0) / nodes.length;
  
  res.json({
    calibrationNodes: {
      total: nodes.length,
      scrollChain: nodes.filter(n => n.type === NODE_TYPES.SCROLLCHAIN).length,
      ethereal: nodes.filter(n => n.type === NODE_TYPES.ETHEREAL).length,
      synchronized: nodes.filter(n => n.calibrationStatus === 'synchronized').length,
      pending: nodes.filter(n => n.calibrationStatus === 'pending').length
    },
    deviation: {
      average: `${(avgDeviation * 100).toFixed(2)}%`,
      nodesAboveThreshold: nodes.filter(n => n.tuningDeviation > 0.05).length
    },
    coherence: {
      average: Math.round(avgCoherence * 100) / 100,
      optimal: nodes.filter(n => n.coherenceLevel >= 95).length
    },
    feedbackLoops: {
      total: loops.length,
      active: loops.filter(l => l.status === 'active').length,
      completed: loops.filter(l => l.status === 'completed').length
    },
    calibrationHistory: {
      totalRecords: calibrationHistory.length
    },
    targetFrequency: {
      frequency: DIVINE_FREQUENCY_TARGET,
      details: COSMIC_STRING_FREQUENCIES[DIVINE_FREQUENCY_TARGET]
    }
  });
});

frequencyCalibrationRouter.get('/status', (req, res) => {
  res.json({
    status: 'active',
    service: 'Divine Frequency Calibration',
    version: '1.0.0',
    targetFrequency: DIVINE_FREQUENCY_TARGET,
    features: [
      'ScrollChain and Ethereal node deployment',
      'Divine audit tools integrated with OmniTech Knowledge Graph',
      'Tuning deviation detection and analysis',
      'Node resynchronization to 963 Hz',
      'Strength feedback loops for alignment',
      'Calibration history tracking'
    ],
    timestamp: new Date().toISOString()
  });
});

frequencyCalibrationRouter.get('/history', authenticateToken, standardLimiter, (req, res) => {
  const { limit } = req.query;
  const maxLimit = Math.min(parseInt(limit) || 50, 100);
  
  res.json({
    totalRecords: calibrationHistory.length,
    records: calibrationHistory.slice(-maxLimit).reverse()
  });
});

export { frequencyCalibrationRouter };
