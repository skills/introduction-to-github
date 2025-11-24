/**
 * Streaming Service
 * 
 * Handles video and audio streaming with tier-based access control
 */

import { Router } from 'express';
import { authenticateToken } from './auth.js';

const streamingRouter = Router();

// Mock streaming content database
const streamingContent = [
  {
    id: 'legacy_001',
    title: 'Legacy of Light - Episode 1',
    type: 'video',
    category: 'music',
    duration: 3600,
    tier: 'free',
    nftGated: false,
    description: 'Introduction to the Legacy of Light music catalog',
    streamUrl: 'https://stream.omniverse.io/legacy_001.m3u8',
    thumbnail: 'https://cdn.omniverse.io/thumbnails/legacy_001.jpg'
  },
  {
    id: 'legacy_002',
    title: 'Legacy of Light - Sacred Sessions',
    type: 'audio',
    category: 'music',
    duration: 7200,
    tier: 'premium',
    nftGated: false,
    description: 'Exclusive sacred music sessions',
    streamUrl: 'https://stream.omniverse.io/legacy_002.m3u8',
    thumbnail: 'https://cdn.omniverse.io/thumbnails/legacy_002.jpg'
  },
  {
    id: 'kunta_exclusive_001',
    title: 'KUNTA NFT Exclusive - The Awakening',
    type: 'video',
    category: 'exclusive',
    duration: 5400,
    tier: 'elite',
    nftGated: true,
    requiredNFT: 'KUNTA',
    description: 'Exclusive content for KUNTA NFT holders',
    streamUrl: 'https://stream.omniverse.io/kunta_001.m3u8',
    thumbnail: 'https://cdn.omniverse.io/thumbnails/kunta_001.jpg'
  },
  {
    id: 'pdp_doc_001',
    title: 'Prophecy Documentation - The Beginning',
    type: 'video',
    category: 'documentation',
    duration: 4500,
    tier: 'premium',
    nftGated: false,
    description: 'Prophecy Documentation Protocol introduction',
    streamUrl: 'https://stream.omniverse.io/pdp_001.m3u8',
    thumbnail: 'https://cdn.omniverse.io/thumbnails/pdp_001.jpg'
  },
  {
    id: 'omniverse_live_001',
    title: 'OmniVerse Live Stream',
    type: 'live',
    category: 'live',
    tier: 'free',
    nftGated: false,
    description: 'Live community events and broadcasts',
    streamUrl: 'https://stream.omniverse.io/live/main.m3u8',
    thumbnail: 'https://cdn.omniverse.io/thumbnails/live.jpg'
  }
];

// Get all available content based on user tier
streamingRouter.get('/content', authenticateToken, (req, res) => {
  const userTier = req.user.tier || 'free';
  const nftVerified = req.user.nftVerified || false;

  const tierHierarchy = { free: 0, premium: 1, elite: 2 };
  const userTierLevel = tierHierarchy[userTier] || 0;

  const availableContent = streamingContent.filter(content => {
    const contentTierLevel = tierHierarchy[content.tier] || 0;
    const tierCheck = userTierLevel >= contentTierLevel;
    const nftCheck = !content.nftGated || nftVerified;
    
    return tierCheck && nftCheck;
  });

  res.json({
    totalContent: availableContent.length,
    userTier,
    nftVerified,
    content: availableContent.map(c => ({
      id: c.id,
      title: c.title,
      type: c.type,
      category: c.category,
      duration: c.duration,
      description: c.description,
      thumbnail: c.thumbnail,
      tier: c.tier,
      nftGated: c.nftGated
    }))
  });
});

// Get specific content details
streamingRouter.get('/content/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const content = streamingContent.find(c => c.id === id);

  if (!content) {
    return res.status(404).json({ error: 'Content not found' });
  }

  const userTier = req.user.tier || 'free';
  const nftVerified = req.user.nftVerified || false;
  const tierHierarchy = { free: 0, premium: 1, elite: 2 };

  // Check access permissions
  const hasRequiredTier = tierHierarchy[userTier] >= tierHierarchy[content.tier];
  const hasNFTAccess = !content.nftGated || nftVerified;

  if (!hasRequiredTier) {
    return res.status(403).json({
      error: 'Insufficient tier',
      required: content.tier,
      current: userTier,
      message: 'Upgrade your tier to access this content'
    });
  }

  if (!hasNFTAccess) {
    return res.status(403).json({
      error: 'NFT verification required',
      requiredNFT: content.requiredNFT,
      message: 'This content requires a verified NFT'
    });
  }

  res.json({
    ...content,
    accessGranted: true,
    streamUrl: content.streamUrl
  });
});

// Get stream URL for playback
streamingRouter.post('/stream/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const content = streamingContent.find(c => c.id === id);

  if (!content) {
    return res.status(404).json({ error: 'Content not found' });
  }

  const userTier = req.user.tier || 'free';
  const nftVerified = req.user.nftVerified || false;
  const tierHierarchy = { free: 0, premium: 1, elite: 2 };

  const hasRequiredTier = tierHierarchy[userTier] >= tierHierarchy[content.tier];
  const hasNFTAccess = !content.nftGated || nftVerified;

  if (!hasRequiredTier || !hasNFTAccess) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Generate time-limited streaming token
  const streamToken = Buffer.from(JSON.stringify({
    contentId: id,
    userId: req.user.username,
    timestamp: Date.now(),
    expires: Date.now() + (3600 * 1000) // 1 hour
  })).toString('base64');

  res.json({
    streamUrl: content.streamUrl,
    token: streamToken,
    expiresIn: 3600,
    quality: ['480p', '720p', '1080p', '4k'],
    type: content.type
  });
});

// Get content by category
streamingRouter.get('/category/:category', authenticateToken, (req, res) => {
  const { category } = req.params;
  const userTier = req.user.tier || 'free';
  const nftVerified = req.user.nftVerified || false;
  const tierHierarchy = { free: 0, premium: 1, elite: 2 };
  const userTierLevel = tierHierarchy[userTier] || 0;

  const categoryContent = streamingContent
    .filter(content => {
      const matchesCategory = content.category === category;
      const contentTierLevel = tierHierarchy[content.tier] || 0;
      const tierCheck = userTierLevel >= contentTierLevel;
      const nftCheck = !content.nftGated || nftVerified;
      
      return matchesCategory && tierCheck && nftCheck;
    });

  res.json({
    category,
    count: categoryContent.length,
    content: categoryContent
  });
});

// Search content
streamingRouter.get('/search', authenticateToken, (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Search query required' });
  }

  const searchQuery = q.toLowerCase();
  const results = streamingContent.filter(content => 
    content.title.toLowerCase().includes(searchQuery) ||
    content.description.toLowerCase().includes(searchQuery)
  );

  res.json({
    query: q,
    results: results.length,
    content: results
  });
});

export { streamingRouter };
