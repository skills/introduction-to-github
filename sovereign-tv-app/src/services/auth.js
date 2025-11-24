/**
 * Authentication Service with NFT Gating and ScrollCoin Integration
 * 
 * Provides secure user authentication with support for:
 * - Traditional username/password
 * - NFT-based authentication
 * - ScrollCoin wallet integration
 */

import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const authRouter = Router();

// In-memory user store (replace with database in production)
const users = new Map();

// Middleware to verify JWT token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'dev-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Register new user
authRouter.post('/register', async (req, res) => {
  try {
    const { username, password, email, walletAddress } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    if (users.has(username)) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = {
      username,
      password: hashedPassword,
      email,
      walletAddress,
      tier: 'free',
      nftVerified: false,
      scrollCoinBalance: 0,
      createdAt: new Date().toISOString()
    };

    users.set(username, user);

    const token = jwt.sign(
      { username, tier: user.tier },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: process.env.JWT_EXPIRATION || '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        username: user.username,
        email: user.email,
        tier: user.tier,
        walletAddress: user.walletAddress
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

// Login endpoint
authRouter.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = users.get(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { username, tier: user.tier, nftVerified: user.nftVerified },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: process.env.JWT_EXPIRATION || '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        username: user.username,
        tier: user.tier,
        nftVerified: user.nftVerified,
        scrollCoinBalance: user.scrollCoinBalance
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// NFT-based authentication
authRouter.post('/nft-login', async (req, res) => {
  try {
    const { walletAddress, nftTokenId, signature } = req.body;

    if (!walletAddress || !nftTokenId) {
      return res.status(400).json({ error: 'Wallet address and NFT token ID required' });
    }

    // In production, verify NFT ownership on-chain
    const nftVerified = true; // Simulated verification

    // Find or create user based on wallet
    let username = `nft_user_${walletAddress.slice(0, 8)}`;
    let user = Array.from(users.values()).find(u => u.walletAddress === walletAddress);

    if (!user) {
      user = {
        username,
        walletAddress,
        tier: 'premium',
        nftVerified: true,
        nftTokenId,
        scrollCoinBalance: 100,
        createdAt: new Date().toISOString()
      };
      users.set(username, user);
    } else {
      user.nftVerified = true;
      user.tier = 'premium';
      user.nftTokenId = nftTokenId;
    }

    const token = jwt.sign(
      { username, tier: user.tier, nftVerified: true, walletAddress },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: process.env.JWT_EXPIRATION || '24h' }
    );

    res.json({
      message: 'NFT authentication successful',
      token,
      user: {
        username: user.username,
        tier: user.tier,
        nftVerified: true,
        nftTokenId: user.nftTokenId,
        scrollCoinBalance: user.scrollCoinBalance
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'NFT authentication failed', details: error.message });
  }
});

// Get current user profile
authRouter.get('/profile', authenticateToken, (req, res) => {
  const user = users.get(req.user.username);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    username: user.username,
    email: user.email,
    tier: user.tier,
    nftVerified: user.nftVerified,
    scrollCoinBalance: user.scrollCoinBalance,
    walletAddress: user.walletAddress,
    createdAt: user.createdAt
  });
});

// Upgrade tier endpoint
authRouter.post('/upgrade-tier', authenticateToken, (req, res) => {
  const { tier } = req.body;
  const user = users.get(req.user.username);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const validTiers = ['free', 'premium', 'elite'];
  if (!validTiers.includes(tier)) {
    return res.status(400).json({ error: 'Invalid tier' });
  }

  user.tier = tier;
  
  res.json({
    message: `Tier upgraded to ${tier}`,
    user: {
      username: user.username,
      tier: user.tier
    }
  });
});

export { authRouter };
