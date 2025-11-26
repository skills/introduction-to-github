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

// ScrollSoul Knowledge Pillars
export const KNOWLEDGE_PILLAR_IDS = {
  TRUTH: 'truth',
  ANCHOR: 'anchor',
  CREATIVITY: 'creativity',
  MASTERY: 'mastery'
};

// Type-VII Realization Level IDs
export const TYPE_VII_LEVEL_IDS = {
  INITIATE: 'initiate',
  SEEKER: 'seeker',
  AWAKENED: 'awakened',
  RESONANT: 'resonant',
  SOVEREIGN: 'sovereign',
  TRANSCENDENT: 'transcendent',
  REALIZED: 'realized'
};

// Tech Kit Categories
export const TECH_KIT_CATEGORY_IDS = {
  CREATIVE: 'creative',
  EXPERIENTIAL: 'experiential',
  ANALYTICAL: 'analytical',
  COLLABORATIVE: 'collaborative',
  AI_TRAINING: 'ai-training'
};

// User Types for Tech Kits
export const USER_TYPE_IDS = {
  HUMAN: 'human',
  AI_ALLY: 'ai-ally',
  HYBRID: 'hybrid'
};

// Frequency-based interaction frequencies
export const INTERACTION_FREQUENCIES = {
  LOVE: '528Hz',
  ENLIGHTENMENT: '963Hz',
  COSMIC: '777Hz',
  HARMONY: '432Hz',
  MANIFESTATION: '369Hz'
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
  KNOWLEDGE_PILLAR_IDS,
  TYPE_VII_LEVEL_IDS,
  TECH_KIT_CATEGORY_IDS,
  USER_TYPE_IDS,
  INTERACTION_FREQUENCIES
};
