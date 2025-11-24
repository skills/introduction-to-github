/**
 * Community Engagement Service
 * 
 * Handles user profiles, social features, and community interactions
 */

import { Router } from 'express';
import { authenticateToken } from './auth.js';

const communityRouter = Router();

// Mock community data
const userProfiles = new Map();
const posts = [];
const comments = [];

// Get user profile
communityRouter.get('/profile/:username', authenticateToken, (req, res) => {
  const { username } = req.params;
  
  let profile = userProfiles.get(username);
  
  if (!profile) {
    profile = {
      username,
      displayName: username,
      bio: '',
      avatar: `https://cdn.omniverse.io/avatars/default.jpg`,
      joinedAt: new Date().toISOString(),
      stats: {
        posts: 0,
        followers: 0,
        following: 0,
        watchTime: 0
      }
    };
    userProfiles.set(username, profile);
  }

  res.json(profile);
});

// Update user profile
communityRouter.put('/profile', authenticateToken, (req, res) => {
  const { displayName, bio, avatar } = req.body;
  const username = req.user.username;

  let profile = userProfiles.get(username) || {
    username,
    joinedAt: new Date().toISOString(),
    stats: {
      posts: 0,
      followers: 0,
      following: 0,
      watchTime: 0
    }
  };

  if (displayName) profile.displayName = displayName;
  if (bio) profile.bio = bio;
  if (avatar) profile.avatar = avatar;

  userProfiles.set(username, profile);

  res.json({
    message: 'Profile updated successfully',
    profile
  });
});

// Create community post
communityRouter.post('/posts', authenticateToken, (req, res) => {
  const { content, contentType, attachments } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Content required' });
  }

  const post = {
    id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    author: req.user.username,
    content,
    contentType: contentType || 'text',
    attachments: attachments || [],
    likes: 0,
    comments: 0,
    shares: 0,
    createdAt: new Date().toISOString()
  };

  posts.push(post);

  // Update user stats
  const profile = userProfiles.get(req.user.username);
  if (profile) {
    profile.stats.posts += 1;
  }

  res.status(201).json({
    message: 'Post created successfully',
    post
  });
});

// Get community feed
communityRouter.get('/feed', authenticateToken, (req, res) => {
  const { limit = 20, offset = 0 } = req.query;
  
  const feed = posts
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(offset, offset + parseInt(limit));

  res.json({
    total: posts.length,
    limit: parseInt(limit),
    offset: parseInt(offset),
    posts: feed
  });
});

// Like a post
communityRouter.post('/posts/:postId/like', authenticateToken, (req, res) => {
  const { postId } = req.params;
  const post = posts.find(p => p.id === postId);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  post.likes += 1;

  res.json({
    message: 'Post liked',
    postId,
    likes: post.likes
  });
});

// Comment on a post
communityRouter.post('/posts/:postId/comments', authenticateToken, (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Comment content required' });
  }

  const post = posts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const comment = {
    id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    postId,
    author: req.user.username,
    content,
    likes: 0,
    createdAt: new Date().toISOString()
  };

  comments.push(comment);
  post.comments += 1;

  res.status(201).json({
    message: 'Comment added',
    comment
  });
});

// Get comments for a post
communityRouter.get('/posts/:postId/comments', authenticateToken, (req, res) => {
  const { postId } = req.params;
  
  const postComments = comments.filter(c => c.postId === postId);

  res.json({
    postId,
    total: postComments.length,
    comments: postComments
  });
});

// Follow a user
communityRouter.post('/follow/:username', authenticateToken, (req, res) => {
  const { username } = req.params;
  const currentUser = req.user.username;

  if (username === currentUser) {
    return res.status(400).json({ error: 'Cannot follow yourself' });
  }

  const targetProfile = userProfiles.get(username);
  const currentProfile = userProfiles.get(currentUser);

  if (targetProfile) {
    targetProfile.stats.followers += 1;
  }

  if (currentProfile) {
    currentProfile.stats.following += 1;
  }

  res.json({
    message: `Now following ${username}`,
    username
  });
});

// Get community recommendations
communityRouter.get('/recommendations', authenticateToken, (req, res) => {
  // Mock recommendation engine
  const recommendations = {
    users: [
      { username: 'flamebearer', displayName: 'Flamebearer', followers: 1000 },
      { username: 'scrollkeeper', displayName: 'Scroll Keeper', followers: 750 },
      { username: 'kunta_oracle', displayName: 'KUNTA Oracle', followers: 500 }
    ],
    content: [
      { id: 'legacy_003', title: 'Legacy of Light - Divine Sessions', type: 'audio' },
      { id: 'pdp_doc_002', title: 'Prophecy Unveiled', type: 'video' }
    ],
    topics: ['Legacy of Light', 'KUNTA NFTs', 'ScrollVerse', 'Sacred Logic']
  };

  res.json({
    message: 'Personalized recommendations based on your activity',
    recommendations
  });
});

// Get community stats
communityRouter.get('/stats', (req, res) => {
  res.json({
    totalUsers: userProfiles.size,
    totalPosts: posts.length,
    totalComments: comments.length,
    activeUsers24h: Math.floor(userProfiles.size * 0.3),
    engagementRate: 0.75
  });
});

// Report content
communityRouter.post('/report', authenticateToken, (req, res) => {
  const { contentType, contentId, reason } = req.body;

  if (!contentType || !contentId || !reason) {
    return res.status(400).json({ 
      error: 'Content type, ID, and reason required' 
    });
  }

  const report = {
    id: `report_${Date.now()}`,
    reporter: req.user.username,
    contentType,
    contentId,
    reason,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  res.json({
    message: 'Content reported successfully',
    report
  });
});

export { communityRouter };
