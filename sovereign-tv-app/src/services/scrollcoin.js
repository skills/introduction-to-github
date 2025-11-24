/**
 * ScrollCoin Payment Service
 * 
 * Handles ScrollCoin transactions, payment tiers, and economic infrastructure
 */

import { Router } from 'express';
import { authenticateToken } from './auth.js';
import { getUserBalance, setUserBalance } from '../utils/constants.js';

const scrollCoinRouter = Router();

// Payment tiers configuration
const paymentTiers = {
  free: {
    name: 'Free Tier',
    price: 0,
    scrollCoinPrice: 0,
    benefits: [
      'Basic content access',
      'Limited streaming quality',
      'Community features'
    ],
    contentAccess: 'basic'
  },
  premium: {
    name: 'Premium Tier',
    price: 9.99,
    scrollCoinPrice: 1000,
    benefits: [
      'All Free Tier benefits',
      'HD streaming quality',
      'Legacy of Light full catalog',
      'Early access to new releases',
      'Ad-free experience'
    ],
    contentAccess: 'premium'
  },
  elite: {
    name: 'Elite Tier',
    price: 29.99,
    scrollCoinPrice: 3000,
    benefits: [
      'All Premium Tier benefits',
      '4K streaming quality',
      'Exclusive KUNTA NFT holder content',
      'PDP protocol full access',
      'Community governance rights',
      'Monthly ScrollCoin rewards',
      'Priority support'
    ],
    contentAccess: 'elite'
  }
};

// Mock ScrollCoin transactions
const transactions = [];

// Get ScrollCoin balance
scrollCoinRouter.get('/balance', authenticateToken, (req, res) => {
  const balance = getUserBalance(req.user.username);
  
  res.json({
    username: req.user.username,
    balance,
    currency: 'ScrollCoin',
    symbol: 'SCR',
    lastUpdated: new Date().toISOString()
  });
});

// Get payment tiers
scrollCoinRouter.get('/tiers', (req, res) => {
  res.json({
    tiers: paymentTiers,
    acceptedPayments: ['USD', 'ScrollCoin', 'NFT'],
    message: 'Choose your tier to unlock exclusive OmniVerse content'
  });
});

// Purchase tier with ScrollCoin
scrollCoinRouter.post('/purchase-tier', authenticateToken, async (req, res) => {
  try {
    const { tier, paymentMethod } = req.body;

    if (!tier || !paymentTiers[tier]) {
      return res.status(400).json({ error: 'Invalid tier selection' });
    }

    const selectedTier = paymentTiers[tier];
    
    if (paymentMethod === 'scrollcoin') {
      // Mock balance check
      const currentBalance = getUserBalance(req.user.username);
      
      if (currentBalance < selectedTier.scrollCoinPrice) {
        return res.status(402).json({
          error: 'Insufficient ScrollCoin balance',
          required: selectedTier.scrollCoinPrice,
          current: currentBalance
        });
      }

      // Create transaction record
      const transaction = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'tier_purchase',
        tier,
        amount: selectedTier.scrollCoinPrice,
        currency: 'ScrollCoin',
        status: 'completed',
        timestamp: new Date().toISOString(),
        username: req.user.username
      };

      transactions.push(transaction);

      const newBalance = currentBalance - selectedTier.scrollCoinPrice;
      setUserBalance(req.user.username, newBalance);

      return res.json({
        message: `Successfully upgraded to ${selectedTier.name}`,
        transaction,
        newBalance,
        benefits: selectedTier.benefits
      });
    }

    // Handle other payment methods
    res.json({
      message: 'Payment method not yet implemented',
      tier: selectedTier.name,
      price: selectedTier.price
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Purchase failed', 
      details: error.message 
    });
  }
});

// Get transaction history
scrollCoinRouter.get('/transactions', authenticateToken, (req, res) => {
  const userTransactions = transactions.filter(
    tx => tx.username === req.user.username
  );

  res.json({
    total: userTransactions.length,
    transactions: userTransactions
  });
});

// Transfer ScrollCoin to another user
scrollCoinRouter.post('/transfer', authenticateToken, async (req, res) => {
  try {
    const { recipientAddress, amount, memo } = req.body;

    if (!recipientAddress || !amount) {
      return res.status(400).json({ 
        error: 'Recipient address and amount required' 
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    // Mock balance check
    const currentBalance = getUserBalance(req.user.username);
    
    if (currentBalance < amount) {
      return res.status(402).json({
        error: 'Insufficient balance',
        available: currentBalance,
        requested: amount
      });
    }

    const transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'transfer',
      from: req.user.username,
      to: recipientAddress,
      amount,
      currency: 'ScrollCoin',
      memo: memo || '',
      status: 'completed',
      timestamp: new Date().toISOString(),
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`
    };

    transactions.push(transaction);

    const newBalance = currentBalance - amount;
    setUserBalance(req.user.username, newBalance);

    res.json({
      message: 'Transfer successful',
      transaction,
      newBalance
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Transfer failed', 
      details: error.message 
    });
  }
});

// Get ScrollCoin price and market info
scrollCoinRouter.get('/market', (req, res) => {
  res.json({
    symbol: 'SCR',
    name: 'ScrollCoin',
    price: {
      usd: 0.01,
      change24h: 5.2
    },
    marketCap: 10000000,
    circulatingSupply: 1000000000,
    totalSupply: 10000000000,
    volume24h: 500000,
    description: 'The sovereign currency of the OmniVerse ecosystem',
    contractAddress: process.env.SCROLLCOIN_CONTRACT_ADDRESS || '0x...'
  });
});

// Earn ScrollCoin rewards
scrollCoinRouter.post('/earn', authenticateToken, (req, res) => {
  const { action } = req.body;

  const rewards = {
    daily_login: 10,
    watch_content: 5,
    share_content: 20,
    community_engagement: 15,
    nft_mint: 100
  };

  const rewardAmount = rewards[action] || 0;

  if (rewardAmount === 0) {
    return res.status(400).json({ 
      error: 'Invalid action',
      validActions: Object.keys(rewards)
    });
  }

  const transaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'reward',
    action,
    amount: rewardAmount,
    currency: 'ScrollCoin',
    status: 'completed',
    timestamp: new Date().toISOString(),
    username: req.user.username
  };

  transactions.push(transaction);

  res.json({
    message: `Earned ${rewardAmount} ScrollCoin`,
    transaction,
    action,
    rewardAmount
  });
});

// Get economic statistics
scrollCoinRouter.get('/stats', (req, res) => {
  const totalTransactions = transactions.length;
  const totalVolume = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  
  const transactionTypes = {};
  transactions.forEach(tx => {
    transactionTypes[tx.type] = (transactionTypes[tx.type] || 0) + 1;
  });

  res.json({
    totalTransactions,
    totalVolume,
    transactionTypes,
    currency: 'ScrollCoin',
    economicInfrastructure: 'active'
  });
});

export { scrollCoinRouter };
