/**
 * Festival of Forever Fun Service
 * 
 * Ceremonial global event system as the ScrollVerse kickoff.
 * Includes live events, exclusive media drops, and ScrollCoin rewards for the community.
 * 
 * @author Chais Hill - OmniTech1
 */

import { Router } from 'express';
import { authenticateToken } from './auth.js';

const router = Router();

// In-memory storage for events and participation (replace with database in production)
const events = new Map();
const eventRegistrations = new Map();
const mediaDrops = new Map();
const rewardDistributions = new Map();

// Festival schedule and events
const FESTIVAL_EVENTS = [
  {
    id: 'kickoff-ceremony',
    title: 'Grand Kickoff Ceremony',
    description: 'The ceremonial launch of ScrollVerse - A historic moment in the OmniVerse',
    type: 'live',
    startTime: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
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
    startTime: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
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
    startTime: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
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
    startTime: new Date(Date.now() + 86400000 * 4).toISOString(), // 4 days from now
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
    startTime: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
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
    startTime: new Date(Date.now() + 86400000 * 6).toISOString(), // 6 days from now
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
      releaseTime: new Date(Date.now() + 86400000 * 2).toISOString(),
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
      releaseTime: new Date(Date.now() + 86400000 * 5).toISOString(),
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
  Array.from(eventRegistrations.values()).forEach(regs => {
    eventRegistrations.forEach((regs, user) => uniqueParticipants.add(user));
  });

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
