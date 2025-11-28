/**
 * Festival of Forever Fun Service
 * 
 * Manages events, media rewards, and community incentives
 * for the ScrollVerse ecosystem
 * 
 * @author Chais Hill - OmniTech1
 */

import { Router } from 'express';
import { authenticateToken } from './auth.js';
import { standardLimiter, strictLimiter } from '../utils/rate-limiter.js';

const festivalRouter = Router();

// In-memory storage (use database in production)
const festivalEvents = new Map();
const userParticipation = new Map();
const mediaRewards = new Map();
const communityIncentives = new Map();

// Festival configuration
const festivalConfig = {
  name: 'Festival of Forever Fun',
  tagline: 'Celebrate the ScrollVerse - Infinite Joy, Boundless Rewards',
  season: 'Season 1 - Genesis',
  startDate: '2025-01-01',
  endDate: '2025-03-31',
  totalRewardPool: 10000000, // ScrollCoin
  categories: ['Music', 'Art', 'Gaming', 'Education', 'Community', 'Special']
};

// Pre-configured events
const scheduledEvents = [
  {
    id: 'EVT-001',
    name: 'Genesis Launch Party',
    category: 'Special',
    description: 'Celebrate the official ScrollVerse ecosystem launch',
    startTime: '2025-01-01T00:00:00Z',
    endTime: '2025-01-01T23:59:59Z',
    rewards: { scrollCoin: 1000, xp: 500, badge: 'Genesis Pioneer' },
    maxParticipants: 10000,
    status: 'upcoming'
  },
  {
    id: 'EVT-002',
    name: 'Legacy of Light Concert Series',
    category: 'Music',
    description: 'Live streaming music events featuring the Legacy of Light catalog',
    startTime: '2025-01-15T20:00:00Z',
    endTime: '2025-01-15T23:00:00Z',
    rewards: { scrollCoin: 500, xp: 250, badge: 'Music Lover' },
    maxParticipants: 5000,
    status: 'upcoming'
  },
  {
    id: 'EVT-003',
    name: 'NFT Art Gallery Opening',
    category: 'Art',
    description: 'Virtual gallery showcasing FlameDNA and community art',
    startTime: '2025-01-20T18:00:00Z',
    endTime: '2025-01-20T22:00:00Z',
    rewards: { scrollCoin: 750, xp: 350, badge: 'Art Enthusiast' },
    maxParticipants: 3000,
    status: 'upcoming'
  },
  {
    id: 'EVT-004',
    name: 'ScrollChain Gaming Tournament',
    category: 'Gaming',
    description: 'Competitive gaming with ScrollCoin prizes',
    startTime: '2025-02-01T15:00:00Z',
    endTime: '2025-02-01T21:00:00Z',
    rewards: { scrollCoin: 2000, xp: 1000, badge: 'Gaming Champion' },
    maxParticipants: 1000,
    status: 'upcoming'
  },
  {
    id: 'EVT-005',
    name: 'Community Governance Summit',
    category: 'Community',
    description: 'Participate in shaping the future of ScrollVerse',
    startTime: '2025-02-15T16:00:00Z',
    endTime: '2025-02-15T20:00:00Z',
    rewards: { scrollCoin: 1500, xp: 750, badge: 'Governance Advocate' },
    maxParticipants: 2000,
    status: 'upcoming'
  }
];

// Initialize events
scheduledEvents.forEach(event => {
  festivalEvents.set(event.id, { ...event, participants: [], currentParticipants: 0 });
});

// Media reward tiers
const mediaRewardTiers = {
  bronze: { minViews: 100, scrollCoin: 10, xp: 50 },
  silver: { minViews: 500, scrollCoin: 50, xp: 150 },
  gold: { minViews: 1000, scrollCoin: 100, xp: 300 },
  platinum: { minViews: 5000, scrollCoin: 500, xp: 750 },
  diamond: { minViews: 10000, scrollCoin: 1000, xp: 1500 }
};

// Community incentive programs
const incentivePrograms = {
  referral: {
    name: 'ScrollSoul Referral',
    description: 'Earn rewards for bringing new members to ScrollVerse',
    rewardPerReferral: { scrollCoin: 100, xp: 50 },
    maxReferrals: 100
  },
  contentCreator: {
    name: 'Creator Rewards',
    description: 'Earn from your content engagement',
    rewardPerEngagement: { scrollCoin: 1, xp: 1 },
    maxDaily: 1000
  },
  staking: {
    name: 'Festival Staking Bonus',
    description: 'Extra rewards for staking during the festival',
    bonusMultiplier: 1.5,
    minStake: 1000
  },
  dailyLogin: {
    name: 'Daily Festival Check-in',
    description: 'Earn rewards for daily participation',
    rewards: [
      { day: 1, scrollCoin: 10, xp: 10 },
      { day: 7, scrollCoin: 100, xp: 100 },
      { day: 30, scrollCoin: 500, xp: 500 }
    ]
  }
};

/**
 * Get festival overview
 */
festivalRouter.get('/overview', (req, res) => {
  const upcomingEvents = Array.from(festivalEvents.values())
    .filter(e => e.status === 'upcoming')
    .slice(0, 5);
  
  res.json({
    festival: festivalConfig,
    upcomingEvents,
    incentivePrograms: Object.keys(incentivePrograms),
    mediaRewardTiers: Object.keys(mediaRewardTiers),
    stats: {
      totalEvents: festivalEvents.size,
      totalParticipants: Array.from(festivalEvents.values())
        .reduce((sum, e) => sum + e.currentParticipants, 0),
      rewardsDistributed: 0 // Track actual distributions
    }
  });
});

/**
 * Get all festival events
 */
festivalRouter.get('/events', (req, res) => {
  const { category, status } = req.query;
  
  let events = Array.from(festivalEvents.values());
  
  if (category) {
    events = events.filter(e => e.category.toLowerCase() === category.toLowerCase());
  }
  
  if (status) {
    events = events.filter(e => e.status === status);
  }
  
  res.json({
    events,
    categories: festivalConfig.categories,
    total: events.length
  });
});

/**
 * Get specific event details
 */
festivalRouter.get('/events/:eventId', (req, res) => {
  const { eventId } = req.params;
  const event = festivalEvents.get(eventId);
  
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  
  res.json({
    event,
    spotsRemaining: event.maxParticipants - event.currentParticipants
  });
});

/**
 * Register for an event
 */
festivalRouter.post('/events/:eventId/register', authenticateToken, strictLimiter, (req, res) => {
  const userId = req.user.username;
  const { eventId } = req.params;
  
  const event = festivalEvents.get(eventId);
  
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  
  if (event.participants.includes(userId)) {
    return res.status(400).json({ error: 'Already registered for this event' });
  }
  
  if (event.currentParticipants >= event.maxParticipants) {
    return res.status(400).json({ error: 'Event is full' });
  }
  
  event.participants.push(userId);
  event.currentParticipants++;
  festivalEvents.set(eventId, event);
  
  // Track user participation
  let userEvents = userParticipation.get(userId) || [];
  userEvents.push({
    eventId,
    registeredAt: new Date().toISOString(),
    status: 'registered'
  });
  userParticipation.set(userId, userEvents);
  
  res.json({
    success: true,
    message: `Registered for ${event.name}`,
    event: {
      id: event.id,
      name: event.name,
      startTime: event.startTime,
      rewards: event.rewards
    },
    spotsRemaining: event.maxParticipants - event.currentParticipants
  });
});

/**
 * Get user's festival participation
 */
festivalRouter.get('/participation', authenticateToken, standardLimiter, (req, res) => {
  const userId = req.user.username;
  
  const participation = userParticipation.get(userId) || [];
  const rewards = mediaRewards.get(userId) || { total: 0, history: [] };
  
  res.json({
    userId,
    registeredEvents: participation,
    totalEventsJoined: participation.length,
    rewards,
    incentives: getUserIncentives(userId)
  });
});

/**
 * Get user incentive progress
 */
function getUserIncentives(userId) {
  const incentives = communityIncentives.get(userId) || {
    referrals: 0,
    contentEngagements: 0,
    stakingBonus: 0,
    loginStreak: 0,
    lastLogin: null
  };
  
  return incentives;
}

/**
 * Claim media reward
 */
festivalRouter.post('/rewards/media/claim', authenticateToken, strictLimiter, (req, res) => {
  const userId = req.user.username;
  const { contentId, views } = req.body;
  
  if (!contentId || !views) {
    return res.status(400).json({ error: 'Content ID and views required' });
  }
  
  // Determine reward tier (check from highest to lowest)
  const tierOrder = ['diamond', 'platinum', 'gold', 'silver', 'bronze'];
  let tier = null;
  
  for (const tierName of tierOrder) {
    const tierData = mediaRewardTiers[tierName];
    if (views >= tierData.minViews) {
      tier = { name: tierName, ...tierData };
      break;
    }
  }
  
  if (!tier) {
    return res.status(400).json({ 
      error: 'Views threshold not met',
      minRequired: mediaRewardTiers.bronze.minViews 
    });
  }
  
  // Record reward
  let userRewards = mediaRewards.get(userId) || { total: 0, history: [] };
  userRewards.total += tier.scrollCoin;
  userRewards.history.push({
    contentId,
    views,
    tier: tier.name,
    scrollCoin: tier.scrollCoin,
    xp: tier.xp,
    claimedAt: new Date().toISOString()
  });
  mediaRewards.set(userId, userRewards);
  
  res.json({
    success: true,
    reward: {
      tier: tier.name,
      scrollCoin: tier.scrollCoin,
      xp: tier.xp
    },
    totalRewards: userRewards.total
  });
});

/**
 * Record referral
 */
festivalRouter.post('/incentives/referral', authenticateToken, strictLimiter, (req, res) => {
  const userId = req.user.username;
  const { referredUserId } = req.body;
  
  if (!referredUserId) {
    return res.status(400).json({ error: 'Referred user ID required' });
  }
  
  let incentives = communityIncentives.get(userId) || {
    referrals: 0,
    contentEngagements: 0,
    stakingBonus: 0,
    loginStreak: 0,
    lastLogin: null
  };
  
  if (incentives.referrals >= incentivePrograms.referral.maxReferrals) {
    return res.status(400).json({ error: 'Maximum referrals reached' });
  }
  
  incentives.referrals++;
  communityIncentives.set(userId, incentives);
  
  const reward = incentivePrograms.referral.rewardPerReferral;
  
  res.json({
    success: true,
    referralCount: incentives.referrals,
    reward,
    remainingReferrals: incentivePrograms.referral.maxReferrals - incentives.referrals
  });
});

/**
 * Daily check-in
 */
festivalRouter.post('/incentives/checkin', authenticateToken, strictLimiter, (req, res) => {
  const userId = req.user.username;
  
  let incentives = communityIncentives.get(userId) || {
    referrals: 0,
    contentEngagements: 0,
    stakingBonus: 0,
    loginStreak: 0,
    lastLogin: null
  };
  
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  if (incentives.lastLogin === today) {
    return res.status(400).json({ error: 'Already checked in today' });
  }
  
  // Check if streak continues
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  if (incentives.lastLogin === yesterdayStr) {
    incentives.loginStreak++;
  } else {
    incentives.loginStreak = 1;
  }
  
  incentives.lastLogin = today;
  communityIncentives.set(userId, incentives);
  
  // Determine reward based on streak
  let reward = { scrollCoin: 10, xp: 10 }; // Base reward
  
  for (const milestone of incentivePrograms.dailyLogin.rewards) {
    if (incentives.loginStreak >= milestone.day) {
      reward = { scrollCoin: milestone.scrollCoin, xp: milestone.xp };
    }
  }
  
  res.json({
    success: true,
    streak: incentives.loginStreak,
    reward,
    nextMilestone: getNextMilestone(incentives.loginStreak)
  });
});

/**
 * Get next login milestone
 */
function getNextMilestone(currentStreak) {
  const milestones = incentivePrograms.dailyLogin.rewards;
  for (const milestone of milestones) {
    if (currentStreak < milestone.day) {
      return { day: milestone.day, daysRemaining: milestone.day - currentStreak };
    }
  }
  return null;
}

/**
 * Get leaderboard
 */
festivalRouter.get('/leaderboard', standardLimiter, (req, res) => {
  const { type } = req.query;
  
  if (type === 'events') {
    // Event participation leaderboard
    const entries = Array.from(userParticipation.entries())
      .map(([userId, events]) => ({ userId, eventsJoined: events.length }))
      .sort((a, b) => b.eventsJoined - a.eventsJoined)
      .slice(0, 20);
    
    return res.json({ type: 'events', leaderboard: entries });
  }
  
  if (type === 'rewards') {
    // Rewards leaderboard
    const entries = Array.from(mediaRewards.entries())
      .map(([userId, data]) => ({ userId, totalRewards: data.total }))
      .sort((a, b) => b.totalRewards - a.totalRewards)
      .slice(0, 20);
    
    return res.json({ type: 'rewards', leaderboard: entries });
  }
  
  // Default: Combined leaderboard
  const combined = Array.from(userParticipation.entries())
    .map(([userId, events]) => {
      const rewards = mediaRewards.get(userId) || { total: 0 };
      const incentives = communityIncentives.get(userId) || { loginStreak: 0 };
      return {
        userId,
        eventsJoined: events.length,
        totalRewards: rewards.total,
        loginStreak: incentives.loginStreak,
        score: events.length * 100 + rewards.total + incentives.loginStreak * 10
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
  
  res.json({ type: 'combined', leaderboard: combined });
});

/**
 * Get incentive programs
 */
festivalRouter.get('/incentives', (req, res) => {
  res.json({
    programs: incentivePrograms,
    mediaRewardTiers
  });
});

export { festivalRouter };
