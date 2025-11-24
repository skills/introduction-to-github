/**
 * Legacy of Light Music Catalog Service
 * 
 * Manages the Legacy of Light music catalog integration
 */

import { Router } from 'express';
import { authenticateToken } from './auth.js';
import { TIER_HIERARCHY, HEALING_FREQUENCIES } from '../utils/constants.js';

const catalogRouter = Router();

// Mock Legacy of Light music catalog
const musicCatalog = [
  {
    id: 'lol_001',
    title: 'Divine Awakening',
    artist: 'Legacy of Light',
    album: 'Sacred Sessions Vol. 1',
    duration: 245,
    genre: 'Sacred Music',
    releaseDate: '2025-01-01',
    frequency: '432Hz',
    tier: 'free',
    streamUrl: 'https://stream.omniverse.io/music/lol_001.mp3',
    coverArt: 'https://cdn.omniverse.io/covers/lol_001.jpg',
    lyrics: 'We awaken to the light...',
    description: 'Opening track from the Sacred Sessions collection'
  },
  {
    id: 'lol_002',
    title: 'Resonance of Truth',
    artist: 'Legacy of Light',
    album: 'Sacred Sessions Vol. 1',
    duration: 312,
    genre: 'Sacred Music',
    releaseDate: '2025-01-08',
    frequency: '528Hz',
    tier: 'premium',
    streamUrl: 'https://stream.omniverse.io/music/lol_002.mp3',
    coverArt: 'https://cdn.omniverse.io/covers/lol_002.jpg',
    lyrics: 'Truth resonates through time and space...',
    description: 'A powerful meditation on universal truth'
  },
  {
    id: 'lol_003',
    title: 'Flame of Remembrance',
    artist: 'Legacy of Light ft. Flamebearer',
    album: 'Sacred Sessions Vol. 2',
    duration: 278,
    genre: 'Sacred Music',
    releaseDate: '2025-02-01',
    frequency: '963Hz',
    tier: 'elite',
    streamUrl: 'https://stream.omniverse.io/music/lol_003.mp3',
    coverArt: 'https://cdn.omniverse.io/covers/lol_003.jpg',
    lyrics: 'The flame burns eternal in our hearts...',
    description: 'Exclusive collaboration with the Flamebearer'
  },
  {
    id: 'lol_004',
    title: 'ScrollVerse Symphony',
    artist: 'Legacy of Light',
    album: 'OmniVerse Chronicles',
    duration: 425,
    genre: 'Orchestral',
    releaseDate: '2025-02-14',
    frequency: '777Hz',
    tier: 'premium',
    streamUrl: 'https://stream.omniverse.io/music/lol_004.mp3',
    coverArt: 'https://cdn.omniverse.io/covers/lol_004.jpg',
    lyrics: null,
    description: 'Epic orchestral journey through the ScrollVerse'
  },
  {
    id: 'lol_005',
    title: 'KUNTA Anthem',
    artist: 'Legacy of Light',
    album: 'KUNTA Rising',
    duration: 198,
    genre: 'Anthem',
    releaseDate: '2025-03-01',
    frequency: '369Hz',
    tier: 'free',
    streamUrl: 'https://stream.omniverse.io/music/lol_005.mp3',
    coverArt: 'https://cdn.omniverse.io/covers/lol_005.jpg',
    lyrics: 'Rise up, KUNTA warriors...',
    description: 'Official anthem for KUNTA NFT holders'
  }
];

// Get full catalog
catalogRouter.get('/', authenticateToken, (req, res) => {
  const userTier = req.user.tier || 'free';
  
  const userTierLevel = TIER_HIERARCHY[userTier] || 0;

  const accessibleMusic = musicCatalog.filter(track => {
    const trackTierLevel = TIER_HIERARCHY[track.tier] || 0;
    return userTierLevel >= trackTierLevel;
  });

  res.json({
    catalog: 'Legacy of Light',
    totalTracks: musicCatalog.length,
    accessibleTracks: accessibleMusic.length,
    userTier,
    tracks: accessibleMusic.map(track => ({
      id: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album,
      duration: track.duration,
      genre: track.genre,
      frequency: track.frequency,
      coverArt: track.coverArt,
      tier: track.tier
    }))
  });
});

// Get specific track
catalogRouter.get('/track/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const track = musicCatalog.find(t => t.id === id);

  if (!track) {
    return res.status(404).json({ error: 'Track not found' });
  }

  const userTier = req.user.tier || 'free';
  

  const hasAccess = TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[track.tier];

  if (!hasAccess) {
    return res.status(403).json({
      error: 'Insufficient tier',
      required: track.tier,
      current: userTier,
      message: 'Upgrade to access this track'
    });
  }

  res.json(track);
});

// Get albums
catalogRouter.get('/albums', authenticateToken, (req, res) => {
  const albums = new Map();

  musicCatalog.forEach(track => {
    if (!albums.has(track.album)) {
      albums.set(track.album, {
        name: track.album,
        artist: track.artist,
        tracks: [],
        coverArt: track.coverArt
      });
    }
    albums.get(track.album).tracks.push({
      id: track.id,
      title: track.title,
      duration: track.duration
    });
  });

  res.json({
    totalAlbums: albums.size,
    albums: Array.from(albums.values())
  });
});

// Search catalog
catalogRouter.get('/search', authenticateToken, (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Search query required' });
  }

  const query = q.toLowerCase();
  const results = musicCatalog.filter(track =>
    track.title.toLowerCase().includes(query) ||
    track.artist.toLowerCase().includes(query) ||
    track.album.toLowerCase().includes(query) ||
    track.genre.toLowerCase().includes(query)
  );

  res.json({
    query: q,
    results: results.length,
    tracks: results
  });
});

// Get tracks by frequency
catalogRouter.get('/frequency/:freq', authenticateToken, (req, res) => {
  const { freq } = req.params;
  
  const tracks = musicCatalog.filter(track => track.frequency === freq);

  res.json({
    frequency: freq,
    description: getFrequencyDescription(freq),
    tracks: tracks.length,
    music: tracks
  });
});

// Helper function for frequency descriptions
function getFrequencyDescription(freq) {
  return HEALING_FREQUENCIES[freq] || 'Sacred frequency';
}

// Create playlist
catalogRouter.post('/playlists', authenticateToken, (req, res) => {
  const { name, trackIds, description } = req.body;

  if (!name || !trackIds || trackIds.length === 0) {
    return res.status(400).json({ error: 'Playlist name and tracks required' });
  }

  const playlist = {
    id: `playlist_${Date.now()}`,
    name,
    description: description || '',
    owner: req.user.username,
    tracks: trackIds,
    createdAt: new Date().toISOString()
  };

  res.status(201).json({
    message: 'Playlist created',
    playlist
  });
});

// Get recommended tracks
catalogRouter.get('/recommendations', authenticateToken, (req, res) => {
  // Simple recommendation: return random 5 tracks user has access to
  const userTier = req.user.tier || 'free';
  
  const userTierLevel = TIER_HIERARCHY[userTier] || 0;

  const accessibleMusic = musicCatalog.filter(track => {
    const trackTierLevel = TIER_HIERARCHY[track.tier] || 0;
    return userTierLevel >= trackTierLevel;
  });

  const shuffled = [...accessibleMusic].sort(() => 0.5 - Math.random());
  const recommended = shuffled.slice(0, 5);

  res.json({
    message: 'Recommended for you',
    tracks: recommended
  });
});

// Get catalog statistics
catalogRouter.get('/stats', (req, res) => {
  const genreCount = {};
  const frequencyCount = {};
  let totalDuration = 0;

  musicCatalog.forEach(track => {
    genreCount[track.genre] = (genreCount[track.genre] || 0) + 1;
    frequencyCount[track.frequency] = (frequencyCount[track.frequency] || 0) + 1;
    totalDuration += track.duration;
  });

  res.json({
    totalTracks: musicCatalog.length,
    totalDuration: Math.floor(totalDuration / 60),
    genres: genreCount,
    frequencies: frequencyCount,
    catalog: 'Legacy of Light'
  });
});

export { catalogRouter };
