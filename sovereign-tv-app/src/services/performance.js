/**
 * Performance Optimization Service
 * 
 * Handles streaming performance optimization and load balancing
 */

import { Router } from 'express';
import { authenticateToken } from './auth.js';
import { standardLimiter } from '../utils/rate-limiter.js';

const performanceRouter = Router();

// Helper functions for optimization
function calculateBufferSize(bandwidth) {
  if (bandwidth > 10) return 30;
  if (bandwidth > 5) return 20;
  return 10;
}

function recommendQuality(bandwidth) {
  if (bandwidth > 25) return '4K';
  if (bandwidth > 10) return '1080p';
  if (bandwidth > 5) return '720p';
  return '480p';
}

function getCompressionLevel(bandwidth) {
  return bandwidth < 5 ? 'high' : 'medium';
}

// CDN and edge server configuration
const edgeServers = [
  { id: 'edge-us-east-1', region: 'US-East', load: 0.45, status: 'active', capacity: 1000 },
  { id: 'edge-us-west-1', region: 'US-West', load: 0.32, status: 'active', capacity: 1000 },
  { id: 'edge-eu-central-1', region: 'EU-Central', load: 0.58, status: 'active', capacity: 1000 },
  { id: 'edge-asia-east-1', region: 'Asia-East', load: 0.41, status: 'active', capacity: 1000 },
  { id: 'edge-africa-south-1', region: 'Africa-South', load: 0.28, status: 'active', capacity: 800 },
  { id: 'edge-latam-south-1', region: 'LATAM-South', load: 0.35, status: 'active', capacity: 800 }
];

// Performance metrics
const performanceMetrics = {
  avgLoadTime: 1.2,
  avgBufferTime: 0.3,
  streamQuality: 98.5,
  uptime: 99.97,
  concurrentUsers: 15234,
  peakLoad: 0.58,
  lastUpdate: new Date().toISOString()
};

// Get optimal edge server for user
performanceRouter.get('/optimal-server', authenticateToken, standardLimiter, (req, res) => {
  const { userRegion, quality } = req.query;
  
  // Find best server based on region and load
  let optimalServer = edgeServers
    .filter(server => server.status === 'active')
    .sort((a, b) => {
      // Prefer regional match
      const aRegionMatch = userRegion && a.region.toLowerCase().includes(userRegion.toLowerCase());
      const bRegionMatch = userRegion && b.region.toLowerCase().includes(userRegion.toLowerCase());
      
      if (aRegionMatch && !bRegionMatch) return -1;
      if (!aRegionMatch && bRegionMatch) return 1;
      
      // Then sort by load
      return a.load - b.load;
    })[0];
  
  if (!optimalServer) {
    optimalServer = edgeServers[0];
  }
  
  res.json({
    server: optimalServer,
    streamingUrl: `https://${optimalServer.id}.stream.omniverse.io`,
    quality: quality || 'auto',
    protocol: 'HLS',
    optimization: {
      adaptiveBitrate: true,
      preloading: true,
      caching: true
    }
  });
});

// Load balancing status
performanceRouter.get('/load-balance', (req, res) => {
  const totalCapacity = edgeServers.reduce((sum, s) => sum + s.capacity, 0);
  const activeServers = edgeServers.filter(s => s.status === 'active').length;
  const avgLoad = edgeServers.reduce((sum, s) => sum + s.load, 0) / edgeServers.length;
  
  const loadDistribution = edgeServers.map(server => ({
    region: server.region,
    load: server.load,
    utilization: `${(server.load * 100).toFixed(1)}%`,
    status: server.status,
    currentConnections: Math.floor(server.load * server.capacity)
  }));
  
  res.json({
    status: 'optimal',
    loadBalancing: {
      enabled: true,
      algorithm: 'least-connections',
      healthCheck: 'active'
    },
    servers: {
      total: edgeServers.length,
      active: activeServers,
      capacity: totalCapacity,
      averageLoad: `${(avgLoad * 100).toFixed(1)}%`
    },
    distribution: loadDistribution,
    globalReadiness: avgLoad < 0.75 ? 'ready' : 'near-capacity'
  });
});

// Performance metrics
performanceRouter.get('/metrics', authenticateToken, standardLimiter, (req, res) => {
  const { metric, timeRange } = req.query;
  
  const metrics = {
    streaming: {
      avgLoadTime: performanceMetrics.avgLoadTime,
      avgBufferTime: performanceMetrics.avgBufferTime,
      streamQuality: performanceMetrics.streamQuality,
      unit: 'seconds'
    },
    availability: {
      uptime: performanceMetrics.uptime,
      downtime: 100 - performanceMetrics.uptime,
      unit: 'percentage'
    },
    users: {
      concurrent: performanceMetrics.concurrentUsers,
      peak24h: 23456,
      growth: '+12.5%'
    },
    infrastructure: {
      peakLoad: performanceMetrics.peakLoad,
      avgLoad: edgeServers.reduce((sum, s) => sum + s.load, 0) / edgeServers.length,
      healthStatus: 'excellent'
    }
  };
  
  if (metric && metrics[metric]) {
    return res.json({ metric, data: metrics[metric], lastUpdate: performanceMetrics.lastUpdate });
  }
  
  res.json({
    metrics,
    lastUpdate: performanceMetrics.lastUpdate,
    status: 'operational'
  });
});

// Streaming optimization settings
performanceRouter.post('/optimize', authenticateToken, standardLimiter, async (req, res) => {
  try {
    const { userId, quality, bandwidth } = req.body;
    
    const optimization = {
      userId: userId || req.user.username,
      settings: {
        quality: quality || 'auto',
        adaptiveBitrate: true,
        bufferSize: calculateBufferSize(bandwidth),
        preloadStrategy: 'aggressive',
        compressionLevel: getCompressionLevel(bandwidth)
      },
      recommendations: {
        suggestedQuality: recommendQuality(bandwidth),
        edgeServer: 'auto-select',
        caching: true
      },
      applied: true,
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      optimization,
      message: 'Streaming optimized for your connection'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CDN cache status
performanceRouter.get('/cdn-status', (req, res) => {
  res.json({
    cdn: {
      provider: 'OmniVerse CDN',
      status: 'active',
      edgeLocations: edgeServers.length,
      coverage: 'global'
    },
    cache: {
      hitRate: 94.2,
      missRate: 5.8,
      totalRequests: 1234567,
      cachedContent: 8900,
      unit: 'percentage'
    },
    performance: {
      avgResponseTime: 45,
      unit: 'milliseconds'
    }
  });
});

export { performanceRouter };
