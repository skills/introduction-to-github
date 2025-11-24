/**
 * Sovereign Dashboard Service
 * 
 * Live metrics for ScrollCoin economy, NFT analytics, and real-time user activity.
 * Equips sovereigns with actionable insights for decision-making and participation.
 * 
 * @author Chais Hill - OmniTech1
 */

import { Router } from 'express';
import { authenticateToken } from './auth.js';

const router = Router();

// In-memory storage for metrics (replace with database/analytics service in production)
const metricsData = {
  scrollCoinEconomy: {
    totalSupply: 10000000000,
    circulatingSupply: 2500000000,
    marketCap: 125000000,
    currentPrice: 0.05,
    priceChange24h: 3.2,
    volume24h: 1500000,
    holders: 15847,
    transactions24h: 3421
  },
  nftAnalytics: {
    totalNFTs: 10000,
    totalHolders: 3245,
    floorPrice: 0.5,
    volumeAllTime: 8500000,
    volume24h: 125000,
    sales24h: 47,
    averagePrice: 2.3,
    topCollections: [
      {
        name: 'KUNTA Genesis',
        items: 2,
        floorPrice: 5.0,
        volume24h: 45000,
        holders: 2
      }
    ]
  },
  userActivity: {
    activeUsers24h: 1842,
    newUsers24h: 127,
    totalUsers: 15847,
    onlineNow: 234,
    streamingNow: 89,
    communityPosts24h: 456,
    transactions24h: 3421
  }
};

// Real-time activity feed
const activityFeed = [];

// Get complete dashboard overview
router.get('/overview', authenticateToken, (req, res) => {
  const overview = {
    timestamp: new Date().toISOString(),
    scrollCoinEconomy: metricsData.scrollCoinEconomy,
    nftAnalytics: metricsData.nftAnalytics,
    userActivity: metricsData.userActivity,
    systemHealth: {
      status: 'operational',
      uptime: '99.98%',
      responseTime: '45ms',
      activeServices: 7
    }
  };

  res.json(overview);
});

// Get ScrollCoin economy metrics
router.get('/scrollcoin', (req, res) => {
  const { timeframe = '24h' } = req.query;
  
  // Generate historical data based on timeframe
  const historicalData = generateHistoricalData(
    metricsData.scrollCoinEconomy.currentPrice,
    timeframe
  );

  res.json({
    current: metricsData.scrollCoinEconomy,
    historical: historicalData,
    insights: {
      trend: metricsData.scrollCoinEconomy.priceChange24h > 0 ? 'bullish' : 'bearish',
      recommendation: metricsData.scrollCoinEconomy.priceChange24h > 2 ? 'Consider acquiring' : 'Monitor closely',
      nextMilestone: {
        target: 'Reach 3M circulating supply',
        progress: (metricsData.scrollCoinEconomy.circulatingSupply / 3000000000) * 100
      }
    },
    topHolders: [
      { address: '0x1234...5678', balance: 150000000, percentage: 6.0 },
      { address: '0xabcd...efgh', balance: 100000000, percentage: 4.0 },
      { address: '0x9876...4321', balance: 75000000, percentage: 3.0 }
    ]
  });
});

// Get NFT analytics
router.get('/nfts', (req, res) => {
  const { collection = 'all' } = req.query;

  const nftData = {
    ...metricsData.nftAnalytics,
    recentSales: [
      {
        collection: 'KUNTA Genesis',
        tokenId: 1,
        price: 5.2,
        buyer: '0xabc...123',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        collection: 'KUNTA Genesis',
        tokenId: 2,
        price: 4.8,
        buyer: '0xdef...456',
        timestamp: new Date(Date.now() - 7200000).toISOString()
      }
    ],
    rarityDistribution: {
      legendary: 2,
      epic: 50,
      rare: 500,
      uncommon: 2000,
      common: 7448
    },
    insights: {
      trend: 'Growing interest in Genesis collection',
      recommendation: 'Genesis NFTs showing strong value retention',
      marketSentiment: 'Positive'
    }
  };

  res.json(nftData);
});

// Get user activity metrics
router.get('/activity', (req, res) => {
  const { timeframe = '24h' } = req.query;

  const activityData = {
    ...metricsData.userActivity,
    hourlyActivity: generateHourlyActivity(timeframe),
    topActivities: [
      { activity: 'Music Streaming', count: 4523, percentage: 32 },
      { activity: 'Community Posts', count: 456, percentage: 18 },
      { activity: 'NFT Viewing', count: 892, percentage: 15 },
      { activity: 'ScrollCoin Transactions', count: 3421, percentage: 35 }
    ],
    geographicDistribution: [
      { region: 'North America', users: 6234, percentage: 39 },
      { region: 'Europe', users: 4523, percentage: 29 },
      { region: 'Asia', users: 3156, percentage: 20 },
      { region: 'Other', users: 1934, percentage: 12 }
    ]
  };

  res.json(activityData);
});

// Get personalized user insights (requires authentication)
router.get('/insights/personal', authenticateToken, (req, res) => {
  const username = req.user.username;
  
  const personalInsights = {
    username,
    accountAge: calculateAccountAge(username),
    scrollCoinBalance: 2500,
    nftsOwned: 1,
    activityScore: 85,
    rank: 342,
    recommendations: [
      {
        type: 'content',
        title: 'New music releases in your favorite frequency',
        action: 'Explore 963Hz collection'
      },
      {
        type: 'community',
        title: 'Join trending discussions',
        action: 'Participate in governance polls'
      },
      {
        type: 'economy',
        title: 'ScrollCoin earning opportunity',
        action: 'Complete daily challenges for 100 SCR'
      },
      {
        type: 'nft',
        title: 'Exclusive NFT drop incoming',
        action: 'Pre-register for limited Genesis collection'
      }
    ],
    achievements: [
      { name: 'Early Adopter', earned: true, date: '2025-01-15' },
      { name: 'Community Champion', earned: true, date: '2025-02-20' },
      { name: 'NFT Collector', earned: false, progress: 50 }
    ],
    stats: {
      contentConsumed: 145,
      postsCreated: 23,
      commentsAdded: 67,
      scrollCoinEarned: 4200,
      scrollCoinSpent: 1700
    }
  };

  res.json(personalInsights);
});

// Get real-time activity feed
router.get('/feed/realtime', (req, res) => {
  const { limit = 20 } = req.query;
  
  // Add simulated real-time activities if feed is empty or stale
  if (activityFeed.length === 0 || Date.now() - new Date(activityFeed[0].timestamp).getTime() > 60000) {
    addRealtimeActivity({
      type: 'transaction',
      description: 'User purchased Premium tier with ScrollCoin',
      amount: 1000,
      timestamp: new Date().toISOString()
    });
  }

  const recentActivities = activityFeed.slice(0, parseInt(limit));

  res.json({
    activities: recentActivities,
    updateFrequency: '5 seconds',
    lastUpdate: new Date().toISOString()
  });
});

// Get community engagement metrics
router.get('/community', (req, res) => {
  const communityMetrics = {
    totalMembers: metricsData.userActivity.totalUsers,
    activeMembers24h: metricsData.userActivity.activeUsers24h,
    posts24h: metricsData.userActivity.communityPosts24h,
    engagement: {
      likes: 3421,
      comments: 1234,
      shares: 567
    },
    topContributors: [
      { username: 'sovereign_alpha', posts: 45, likes: 892 },
      { username: 'kunta_holder_1', posts: 38, likes: 756 },
      { username: 'scroll_master', posts: 34, likes: 634 }
    ],
    trendingTopics: [
      { topic: '#ScrollCoinRising', mentions: 234 },
      { topic: '#KUNTAGenesis', mentions: 189 },
      { topic: '#FestivalOfFun', mentions: 156 },
      { topic: '#NewMusic', mentions: 134 }
    ],
    governanceActivity: {
      activeProposals: 3,
      votesLast24h: 456,
      participationRate: '28.5%'
    }
  };

  res.json(communityMetrics);
});

// Get system health and performance
router.get('/health', (req, res) => {
  const health = {
    status: 'operational',
    uptime: '99.98%',
    services: {
      api: { status: 'operational', responseTime: '45ms' },
      streaming: { status: 'operational', activeStreams: 89 },
      scrollcoin: { status: 'operational', transactionsPerSecond: 42 },
      nft: { status: 'operational', verificationTime: '120ms' },
      community: { status: 'operational', activeSessions: 234 }
    },
    performance: {
      cpuUsage: '42%',
      memoryUsage: '67%',
      networkLatency: '12ms',
      storageUsed: '45%'
    },
    incidents: [],
    maintenance: {
      scheduled: false,
      nextWindow: 'No maintenance scheduled'
    }
  };

  res.json(health);
});

// Get governance metrics
router.get('/governance', authenticateToken, (req, res) => {
  const governanceData = {
    activeProposals: [
      {
        id: 1,
        title: 'Increase ScrollCoin rewards for community engagement',
        status: 'active',
        votesFor: 3421,
        votesAgainst: 1234,
        deadline: new Date(Date.now() + 86400000 * 3).toISOString()
      },
      {
        id: 2,
        title: 'Launch new NFT collection: Eternal Flame',
        status: 'active',
        votesFor: 5234,
        votesAgainst: 892,
        deadline: new Date(Date.now() + 86400000 * 5).toISOString()
      },
      {
        id: 3,
        title: 'Add new healing frequencies to music catalog',
        status: 'pending',
        votesFor: 892,
        votesAgainst: 234,
        deadline: new Date(Date.now() + 86400000 * 7).toISOString()
      }
    ],
    userVotingPower: calculateVotingPower(req.user.username),
    recentDecisions: [
      {
        title: 'Implement Festival of Forever Fun',
        result: 'Approved',
        executedAt: new Date(Date.now() - 86400000).toISOString()
      }
    ]
  };

  res.json(governanceData);
});

// Export dashboard data (requires authentication)
router.get('/export', authenticateToken, (req, res) => {
  const { format = 'json' } = req.query;

  const exportData = {
    exportedAt: new Date().toISOString(),
    exportedBy: req.user.username,
    data: {
      scrollCoinEconomy: metricsData.scrollCoinEconomy,
      nftAnalytics: metricsData.nftAnalytics,
      userActivity: metricsData.userActivity
    }
  };

  if (format === 'csv') {
    // Simple CSV conversion for demo
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=dashboard-export.csv');
    res.send('Category,Metric,Value\n' + Object.entries(exportData.data).map(([cat, data]) => 
      Object.entries(data).map(([key, val]) => `${cat},${key},${val}`).join('\n')
    ).join('\n'));
  } else {
    res.json(exportData);
  }
});

// Helper functions

function generateHistoricalData(currentPrice, timeframe) {
  const points = timeframe === '24h' ? 24 : timeframe === '7d' ? 7 : 30;
  const data = [];
  
  for (let i = points; i >= 0; i--) {
    const variance = (Math.random() - 0.5) * 0.01;
    data.push({
      timestamp: new Date(Date.now() - i * (timeframe === '24h' ? 3600000 : 86400000)).toISOString(),
      price: currentPrice * (1 + variance),
      volume: Math.floor(Math.random() * 200000 + 1000000)
    });
  }
  
  return data;
}

function generateHourlyActivity(timeframe) {
  const hours = timeframe === '24h' ? 24 : 168;
  const data = [];
  
  for (let i = hours; i >= 0; i--) {
    data.push({
      hour: new Date(Date.now() - i * 3600000).toISOString(),
      activeUsers: Math.floor(Math.random() * 500 + 1500),
      transactions: Math.floor(Math.random() * 100 + 50),
      posts: Math.floor(Math.random() * 50 + 10)
    });
  }
  
  return data;
}

function addRealtimeActivity(activity) {
  activityFeed.unshift(activity);
  if (activityFeed.length > 100) {
    activityFeed.pop();
  }
}

function calculateAccountAge(username) {
  // Simplified - in production, fetch from user database
  return Math.floor(Math.random() * 365) + 1;
}

function calculateVotingPower(username) {
  // Voting power based on ScrollCoin holdings, NFTs, and activity
  return {
    total: 150,
    breakdown: {
      scrollCoinHoldings: 50,
      nftOwnership: 50,
      activityScore: 30,
      onboardingBonus: 20
    }
  };
}

// Simulated real-time updates (in production, use WebSocket or Server-Sent Events)
setInterval(() => {
  // Update metrics with simulated changes
  metricsData.scrollCoinEconomy.currentPrice *= (1 + (Math.random() - 0.5) * 0.01);
  metricsData.scrollCoinEconomy.volume24h += Math.floor(Math.random() * 10000 - 5000);
  metricsData.userActivity.onlineNow += Math.floor(Math.random() * 10 - 5);
  
  // Add random activity
  const activityTypes = ['transaction', 'nft_sale', 'new_user', 'post', 'stream_start'];
  const randomType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
  
  addRealtimeActivity({
    type: randomType,
    description: getActivityDescription(randomType),
    timestamp: new Date().toISOString()
  });
}, 10000); // Update every 10 seconds

function getActivityDescription(type) {
  const descriptions = {
    transaction: 'ScrollCoin transaction processed',
    nft_sale: 'NFT sold on marketplace',
    new_user: 'New Sovereign joined the ecosystem',
    post: 'Community post created',
    stream_start: 'User started streaming content'
  };
  return descriptions[type] || 'Activity recorded';
}

export { router as dashboardRouter };
