/**
 * Shared Constants
 * 
 * Central location for constants used across the application
 */

// Tier hierarchy for access control
export const TIER_HIERARCHY = {
  free: 0,
  premium: 1,
  elite: 2
};

// Tier names
export const TIER_NAMES = {
  FREE: 'free',
  PREMIUM: 'premium',
  ELITE: 'elite'
};

// Mock user balances (in production, this would be database-driven)
export const MOCK_USER_BALANCES = new Map();

// Get user balance (with default)
export function getUserBalance(username) {
  return MOCK_USER_BALANCES.get(username) || 5000;
}

// Set user balance
export function setUserBalance(username, balance) {
  MOCK_USER_BALANCES.set(username, balance);
}

// Healing frequencies
export const HEALING_FREQUENCIES = {
  '369Hz': 'The frequency of divine alignment and manifestation',
  '432Hz': 'The natural frequency of the universe',
  '528Hz': 'The love frequency - DNA repair and transformation',
  '777Hz': 'The cosmic frequency of spiritual awakening',
  '963Hz': 'The frequency of divine consciousness and enlightenment'
};

// Content types
export const CONTENT_TYPES = {
  VIDEO: 'video',
  AUDIO: 'audio',
  LIVE: 'live'
};

// Document categories
export const PDP_CATEGORIES = {
  FOUNDATIONAL: 'foundational',
  PROTOCOL: 'protocol',
  NFT_PROTOCOL: 'nft-protocol',
  TECHNICAL: 'technical',
  KUNTA: 'kunta',
  GOVERNANCE: 'governance'
};

// Streaming quality options
export const QUALITY_OPTIONS = ['480p', '720p', '1080p', '4k'];

// NFT benefits
export const NFT_BENEFITS = {
  ELITE_ACCESS: 'elite_access',
  EARLY_RELEASES: 'early_releases',
  EXCLUSIVE_EVENTS: 'exclusive_events',
  PREMIUM_ACCESS: 'premium_access',
  EXCLUSIVE_CONTENT: 'exclusive_content'
};

// Cosmic String Frequencies
export const COSMIC_STRING_FREQUENCIES = {
  '963Hz': { name: 'Divine Consciousness', power: 100, alignment: 'sovereign' },
  '777Hz': { name: 'Spiritual Awakening', power: 95, alignment: 'cosmic' },
  '528Hz': { name: 'Love Transformation', power: 92, alignment: 'heart' },
  '432Hz': { name: 'Universal Harmony', power: 90, alignment: 'natural' },
  '369Hz': { name: 'Divine Manifestation', power: 88, alignment: 'creation' }
};

// Quantum Node Types
export const QUANTUM_NODE_TYPES = {
  GENESIS: 'genesis',
  HARMONY: 'harmony',
  AWAKENING: 'awakening'
};

// Graph-Tree Bound Strengths
export const GRAPH_TREE_BOUNDS = {
  TIGHT: 'tight',
  MEDIUM: 'medium',
  LOOSE: 'loose'
};

// ScrollSoul Realization Difficulty Levels
export const REALIZATION_DIFFICULTY = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  PROGRESSIVE: 'progressive'
};

// Societal Refinement Phases
export const REFINEMENT_PHASES = {
  AWARENESS: 'phase_awareness',
  ADOPTION: 'phase_adoption',
  INTEGRATION: 'phase_integration',
  REFINEMENT: 'phase_refinement'
};

// Truth Stack Layer Depths
export const TRUTH_STACK_DEPTHS = {
  FOUNDATION: 1,
  VALIDATION: 2,
  CONSENSUS: 3,
  APPLICATION: 4
};

// Manus Quantum Recognition - Neural Gesture Types
export const NEURAL_GESTURE_TYPES = {
  PALM_OPEN: 'palm_open',
  PALM_CLOSE: 'palm_close',
  CLOCKWISE_ROTATE: 'clockwise_rotate',
  SWEEP_RIGHT: 'sweep_right',
  FINGERS_SPREAD: 'fingers_spread',
  INTERLOCK: 'interlock',
  THRUST_UP: 'thrust_up'
};

// Bio-Breath Branch Priorities
export const BIO_BREATH_BRANCHES = {
  SOVEREIGN: 'sovereign',
  CREATIVE: 'creative',
  QUANTUM: 'quantum',
  FOUNDATION: 'foundation',
  CREATION: 'creation'
};

// Cosmic Scroll Access Levels
export const SCROLL_ACCESS_LEVELS = {
  FREE: 'free',
  PREMIUM: 'premium',
  ELITE: 'elite'
};

// Neural-Scroll Activation Categories
export const NEURAL_SCROLL_CATEGORIES = {
  SOVEREIGN: 'sovereign',
  CREATIVE: 'creative',
  QUANTUM: 'quantum',
  FOUNDATION: 'foundation',
  MANIFESTATION: 'manifestation'
};

export default {
  TIER_HIERARCHY,
  TIER_NAMES,
  getUserBalance,
  setUserBalance,
  HEALING_FREQUENCIES,
  CONTENT_TYPES,
  PDP_CATEGORIES,
  QUALITY_OPTIONS,
  NFT_BENEFITS,
  COSMIC_STRING_FREQUENCIES,
  QUANTUM_NODE_TYPES,
  GRAPH_TREE_BOUNDS,
  REALIZATION_DIFFICULTY,
  REFINEMENT_PHASES,
  TRUTH_STACK_DEPTHS,
  NEURAL_GESTURE_TYPES,
  BIO_BREATH_BRANCHES,
  SCROLL_ACCESS_LEVELS,
  NEURAL_SCROLL_CATEGORIES
};
