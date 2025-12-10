/**
 * Festival of Forever Fun Service
 * 
 * Ceremonial global event system as the ScrollVerse kickoff.
 * Includes live events, exclusive media drops, and ScrollCoin rewards for the community.
 * Manages events, media rewards, and community incentives
 * for the ScrollVerse ecosystem
 * 
 * @author Chais Hill - OmniTech1
 */

import { Router } from 'express';
import { authenticateToken } from './auth.js';

const router = Router();

// Constants
const MS_PER_DAY = 86400000; // Milliseconds in one day

// In-memory storage for events and participation (replace with database in production)
const events = new Map();
const eventRegistrations = new Map();
const mediaDrops = new Map();
// Note: rewardDistributions could be used for tracking claimed rewards in future enhancement

// Festival schedule and events
const FESTIVAL_EVENTS = [
  {
    id: 'kickoff-ceremony',
    title: 'Grand Kickoff Ceremony',
    description: 'The ceremonial launch of ScrollVerse - A historic moment in the OmniVerse',
    type: 'live',
    startTime: new Date(Date.now() + MS_PER_DAY).toISOString(), // 1 day from now
    duration: 120, // minutes
    capacity: 10000,
    registered: 0,
    rewards: {
      attendance: 500,
      participation: 1000
    },
    features: [
      'Live address from Chais Hill',
      'ScrollVerse vision presentation',
      'Exclusive music premiere',
      'Community Q&A session',
      'Surprise announcements'
    ],
    status: 'upcoming'
  },
  {
    id: 'music-premiere',
    title: 'Legacy of Light - World Premiere',
    description: 'First-ever live performance of the complete Legacy of Light collection',
    type: 'live',
    startTime: new Date(Date.now() + MS_PER_DAY * 2).toISOString(), // 2 days from now
    duration: 180,
    capacity: 5000,
    registered: 0,
    rewards: {
      attendance: 300,
      participation: 500
    },
    features: [
      'All healing frequencies performed live',
      'Behind-the-scenes stories',
      'Exclusive track variations',
      'Limited NFT drops',
      'Community sing-along'
    ],
    status: 'upcoming'
  },
  {
    id: 'nft-reveal',
    title: 'KUNTA Genesis Mega Reveal',
    description: 'Unveiling the complete KUNTA Genesis collection with special benefits',
    type: 'live',
    startTime: new Date(Date.now() + MS_PER_DAY * 3).toISOString(), // 3 days from now
    duration: 90,
    capacity: 8000,
    registered: 0,
    rewards: {
      attendance: 400,
      participation: 800
    },
    features: [
      'Full collection showcase',
      'Rarity reveals',
      'Utility demonstrations',
      'Limited minting opportunity',
      'Holder benefits announcement'
    ],
    status: 'upcoming'
  },
  {
    id: 'scrollcoin-giveaway',
    title: 'ScrollCoin Mega Giveaway',
    description: 'Massive community rewards distribution event',
    type: 'live',
    startTime: new Date(Date.now() + MS_PER_DAY * 4).toISOString(), // 4 days from now
    duration: 60,
    capacity: 15000,
    registered: 0,
    rewards: {
      attendance: 200,
      participation: 1500,
      luckyDraw: 10000
    },
    features: [
      'Random ScrollCoin drops',
      'Community challenges',
      'Trivia competitions',
      'Instant rewards',
      'Grand prize drawing'
    ],
    status: 'upcoming'
  },
  {
    id: 'community-summit',
    title: 'Sovereign Community Summit',
    description: 'Shape the future of ScrollVerse through collective governance',
    type: 'live',
    startTime: new Date(Date.now() + MS_PER_DAY * 5).toISOString(), // 5 days from now
    duration: 150,
    capacity: 7000,
    registered: 0,
    rewards: {
      attendance: 350,
      participation: 700,
      voting: 500
    },
    features: [
      'Governance proposals discussion',
      'Community voting session',
      'Roadmap unveiling',
      'Working group formation',
      'Leadership elections'
    ],
    status: 'upcoming'
  },
  {
    id: 'closing-celebration',
    title: 'Forever Fun Grand Finale',
    description: 'Epic celebration wrapping up the festival with surprises',
    type: 'live',
    startTime: new Date(Date.now() + MS_PER_DAY * 6).toISOString(), // 6 days from now
    duration: 240,
    capacity: 20000,
    registered: 0,
    rewards: {
      attendance: 1000,
      participation: 2000,
      fullFestival: 5000
    },
    features: [
      'Best moments recap',
      'Community awards',
      'Surprise guest appearances',
      'Exclusive media premiere',
      'Future announcements',
      'Global dance party'
    ],
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
FESTIVAL_EVENTS.forEach(event => {
  events.set(event.id, { ...event, registrations: [] });
});

// Get festival overview
router.get('/overview', (req, res) => {
  const totalEvents = FESTIVAL_EVENTS.length;
  const totalRewards = FESTIVAL_EVENTS.reduce((sum, e) => 
    sum + e.rewards.attendance + e.rewards.participation + (e.rewards.luckyDraw || 0) + (e.rewards.fullFestival || 0), 0
  );
  const totalCapacity = FESTIVAL_EVENTS.reduce((sum, e) => sum + e.capacity, 0);
  const totalRegistered = Array.from(events.values()).reduce((sum, e) => sum + e.registrations.length, 0);

  res.json({
    title: 'Festival of Forever Fun',
    subtitle: 'The ScrollVerse Grand Kickoff Celebration',
    description: 'A week-long ceremonial global event marking the birth of a new era',
    startDate: FESTIVAL_EVENTS[0].startTime,
    endDate: FESTIVAL_EVENTS[FESTIVAL_EVENTS.length - 1].startTime,
    totalEvents,
    totalCapacity,
    totalRegistered,
    registrationProgress: Math.round((totalRegistered / totalCapacity) * 100),
    totalRewardsPool: totalRewards,
    benefits: [
      'Exclusive access to live events',
      'Limited edition NFT drops',
      'Massive ScrollCoin rewards',
      'Community governance participation',
      'Networking with fellow Sovereigns',
      'Early access to new features',
      'Special festival badges and achievements'
    ],
    events: FESTIVAL_EVENTS.map(e => ({
      id: e.id,
      title: e.title,
      startTime: e.startTime,
      duration: e.duration,
      capacity: e.capacity,
      registered: events.get(e.id)?.registrations.length || 0,
      status: e.status
    }))
  });
});

// Get all festival events
router.get('/events', (req, res) => {
  const { type, status } = req.query;

  let filteredEvents = FESTIVAL_EVENTS;

  if (type) {
    filteredEvents = filteredEvents.filter(e => e.type === type);
  }

  if (status) {
    filteredEvents = filteredEvents.filter(e => e.status === status);
  }

  res.json({
    events: filteredEvents.map(e => ({
      ...e,
      registered: events.get(e.id)?.registrations.length || 0,
      spotsRemaining: e.capacity - (events.get(e.id)?.registrations.length || 0)
    })),
    totalEvents: filteredEvents.length
  });
});

// Get specific event details
router.get('/events/:eventId', (req, res) => {
  const { eventId } = req.params;
  const event = FESTIVAL_EVENTS.find(e => e.id === eventId);

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const eventData = events.get(eventId);
  const registered = eventData?.registrations.length || 0;

  res.json({
    ...event,
    registered,
    spotsRemaining: event.capacity - registered,
    registrationOpen: event.status === 'upcoming',
    streamingUrl: event.status === 'live' ? '/api/streaming/live/' + eventId : null,
    agenda: generateEventAgenda(event),
    speakers: event.id === 'kickoff-ceremony' ? [
      { name: 'Chais Hill', title: 'First Remembrancer & Founder' }
    ] : []
  });
});

// Register for an event (requires authentication)
router.post('/events/:eventId/register', authenticateToken, (req, res) => {
  const { eventId } = req.params;
  const username = req.user.username;

  const eventInfo = FESTIVAL_EVENTS.find(e => e.id === eventId);
  if (!eventInfo) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const event = events.get(eventId);
  const registered = event.registrations.length;

  // Check capacity
  if (registered >= eventInfo.capacity) {
    return res.status(400).json({ 
      error: 'Event is at full capacity',
      waitlist: true 
    });
  }

  // Check if already registered
  if (event.registrations.includes(username)) {
    return res.json({
      message: 'Already registered for this event',
      event: eventInfo.title
    });
  }

  // Register user
  event.registrations.push(username);
  events.set(eventId, event);

  // Track registration for user
  if (!eventRegistrations.has(username)) {
    eventRegistrations.set(username, []);
  }
  eventRegistrations.get(username).push({
    eventId,
    registeredAt: new Date().toISOString()
  });

  res.json({
    message: `Successfully registered for ${eventInfo.title}!`,
    event: {
      id: eventInfo.id,
      title: eventInfo.title,
      startTime: eventInfo.startTime,
      duration: eventInfo.duration
    },
    rewards: {
      attendance: eventInfo.rewards.attendance,
      participation: eventInfo.rewards.participation,
      total: eventInfo.rewards.attendance + eventInfo.rewards.participation
    },
    confirmation: {
      registrationNumber: registered + 1,
      reminderSet: true
    }
  });
});

// Cancel event registration (requires authentication)
router.delete('/events/:eventId/register', authenticateToken, (req, res) => {
  const { eventId } = req.params;
  const username = req.user.username;

  const event = events.get(eventId);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const index = event.registrations.indexOf(username);
  if (index === -1) {
    return res.status(400).json({ error: 'Not registered for this event' });
  }

  // Remove registration
  event.registrations.splice(index, 1);
  events.set(eventId, event);

  // Update user registrations
  const userRegs = eventRegistrations.get(username) || [];
  const regIndex = userRegs.findIndex(r => r.eventId === eventId);
  if (regIndex !== -1) {
    userRegs.splice(regIndex, 1);
    eventRegistrations.set(username, userRegs);
  }

  res.json({
    message: 'Registration cancelled successfully',
    eventId
  });
});

// Get user's event registrations (requires authentication)
router.get('/my-registrations', authenticateToken, (req, res) => {
  const username = req.user.username;
  const userRegs = eventRegistrations.get(username) || [];

  const registeredEvents = userRegs.map(reg => {
    const eventInfo = FESTIVAL_EVENTS.find(e => e.id === reg.eventId);
    return {
      ...eventInfo,
      registeredAt: reg.registeredAt
    };
  });

  res.json({
    registrations: registeredEvents,
    totalEvents: registeredEvents.length,
    upcomingEvents: registeredEvents.filter(e => new Date(e.startTime) > new Date()).length
  });
});

// Get media drops
router.get('/media-drops', (req, res) => {
  const drops = [
    {
      id: 'drop-001',
      title: 'Exclusive Festival Opening Track',
      type: 'audio',
      description: 'Never-before-heard healing frequency composition',
      releaseTime: FESTIVAL_EVENTS[0].startTime,
      availability: 'limited',
      count: 1000,
      claimed: 234,
      claimRequirement: 'Attend kickoff ceremony'
    },
    {
      id: 'drop-002',
      title: 'Behind-the-Scenes Documentary',
      type: 'video',
      description: 'The making of ScrollVerse - 30-minute exclusive',
      releaseTime: new Date(Date.now() + MS_PER_DAY * 2).toISOString(),
      availability: 'limited',
      count: 5000,
      claimed: 0,
      claimRequirement: 'Register for any 2 events'
    },
    {
      id: 'drop-003',
      title: 'Festival Commemorative NFT',
      type: 'nft',
      description: 'Limited edition NFT marking your participation',
      releaseTime: FESTIVAL_EVENTS[FESTIVAL_EVENTS.length - 1].startTime,
      availability: 'limited',
      count: 10000,
      claimed: 0,
      claimRequirement: 'Attend 3+ events'
    },
    {
      id: 'drop-004',
      title: 'ScrollVerse Constitution Draft',
      type: 'document',
      description: 'First public release of governance framework',
      releaseTime: new Date(Date.now() + MS_PER_DAY * 5).toISOString(),
      availability: 'unlimited',
      claimRequirement: 'Attend community summit'
    }
  ];

  res.json({
    drops,
    totalDrops: drops.length,
    upcomingDrops: drops.filter(d => new Date(d.releaseTime) > new Date()).length
  });
});

// Claim media drop (requires authentication)
router.post('/media-drops/:dropId/claim', authenticateToken, (req, res) => {
  const { dropId } = req.params;
  const username = req.user.username;

  // Simplified claim logic - in production, verify requirements
  if (!mediaDrops.has(username)) {
    mediaDrops.set(username, []);
  }

  const userDrops = mediaDrops.get(username);
  if (userDrops.includes(dropId)) {
    return res.status(400).json({ error: 'Already claimed this drop' });
  }

  userDrops.push(dropId);
  mediaDrops.set(username, userDrops);

  res.json({
    message: 'Media drop claimed successfully!',
    dropId,
    accessUrl: `/api/festival/media/${dropId}`,
    reward: {
      scrollcoin: 100,
      message: 'Bonus 100 ScrollCoin for claiming!'
    }
  });
});

// Get reward distributions
router.get('/rewards', authenticateToken, (req, res) => {
  const username = req.user.username;
  const userRegs = eventRegistrations.get(username) || [];

  const potentialRewards = userRegs.reduce((sum, reg) => {
    const event = FESTIVAL_EVENTS.find(e => e.id === reg.eventId);
    return sum + (event ? event.rewards.attendance + event.rewards.participation : 0);
  }, 0);

  // Check for full festival bonus
  const fullFestivalBonus = userRegs.length === FESTIVAL_EVENTS.length ? 5000 : 0;

  res.json({
    username,
    eventsRegistered: userRegs.length,
    potentialRewards: potentialRewards + fullFestivalBonus,
    breakdown: {
      eventAttendance: potentialRewards,
      fullFestivalBonus,
      mediaDrops: (mediaDrops.get(username) || []).length * 100
    },
    milestones: [
      { events: 3, bonus: 500, achieved: userRegs.length >= 3 },
      { events: 5, bonus: 1000, achieved: userRegs.length >= 5 },
      { events: 6, bonus: 5000, achieved: userRegs.length >= 6 }
    ],
    nextMilestone: getNextMilestone(userRegs.length)
  });
});

// Get festival statistics
router.get('/stats', (req, res) => {
  const totalRegistrations = Array.from(events.values()).reduce((sum, e) => sum + e.registrations.length, 0);
  const uniqueParticipants = new Set();
  // Count unique users who have registered for any event
  eventRegistrations.forEach((regs, user) => uniqueParticipants.add(user));

  res.json({
    totalEvents: FESTIVAL_EVENTS.length,
    totalRegistrations,
    uniqueParticipants: uniqueParticipants.size,
    averageRegistrationsPerEvent: Math.round(totalRegistrations / FESTIVAL_EVENTS.length),
    mostPopularEvent: getMostPopularEvent(),
    mediaDropsClaimed: Array.from(mediaDrops.values()).flat().length,
    rewardsDistributed: totalRegistrations * 500, // Simplified calculation
    communityEngagement: calculateEngagementScore()
  });
});

// Helper functions

function generateEventAgenda(event) {
  const agendaItems = [];
  const itemDuration = event.duration / event.features.length;
  
  let currentTime = new Date(event.startTime);
  
  event.features.forEach(feature => {
    agendaItems.push({
      time: currentTime.toISOString(),
      activity: feature,
      duration: itemDuration
    });
    currentTime = new Date(currentTime.getTime() + itemDuration * 60000);
  });
  
  return agendaItems;
}

function getMostPopularEvent() {
  let maxRegistrations = 0;
  let popularEvent = null;
  
  FESTIVAL_EVENTS.forEach(event => {
    const eventData = events.get(event.id);
    const registered = eventData?.registrations.length || 0;
    if (registered > maxRegistrations) {
      maxRegistrations = registered;
      popularEvent = event.title;
    }
  });
  
  return { title: popularEvent, registrations: maxRegistrations };
}

function calculateEngagementScore() {
  const totalCapacity = FESTIVAL_EVENTS.reduce((sum, e) => sum + e.capacity, 0);
  const totalRegistered = Array.from(events.values()).reduce((sum, e) => sum + e.registrations.length, 0);
  return Math.round((totalRegistered / totalCapacity) * 100);
}

function getNextMilestone(currentEvents) {
  const milestones = [
    { events: 3, bonus: 500 },
    { events: 5, bonus: 1000 },
    { events: 6, bonus: 5000 }
  ];
  
  for (const milestone of milestones) {
    if (currentEvents < milestone.events) {
      return milestone;
    }
  }
  
  return null;
}

export { router as festivalRouter };
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
