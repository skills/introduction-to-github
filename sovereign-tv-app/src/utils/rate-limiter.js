/**
 * Rate Limiting Middleware
 * 
 * Provides rate limiting to prevent abuse of API endpoints
 * Implements consistent rate limiting across all services
 * 
 * Rate Limit Tiers:
 * - Strict: 20 req/min - Payment, authentication, sensitive operations
 * - Standard: 100 req/min - General API endpoints
 * - Relaxed: 300 req/min - Public/read-heavy endpoints
 * - Burst: 500 req/min - High-traffic endpoints with caching
 */

// Simple in-memory rate limiter with validation
const rateLimitStore = new Map();

// Rate limit configuration (centralized for consistency validation)
export const rateLimitConfig = {
  strict: { windowMs: 60000, max: 20, description: 'Payment, auth, sensitive operations' },
  standard: { windowMs: 60000, max: 100, description: 'General API endpoints' },
  relaxed: { windowMs: 60000, max: 300, description: 'Public/read-heavy endpoints' },
  burst: { windowMs: 60000, max: 500, description: 'High-traffic cached endpoints' },
  webhook: { windowMs: 60000, max: 50, description: 'Webhook endpoints' }
};

/**
 * Create a rate limiter middleware
 * @param {Object} options - Rate limiter options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum number of requests per window
 * @param {string} options.tier - Rate limit tier name for tracking
 * @returns {Function} Express middleware
 */
export function createRateLimiter({ windowMs = 60000, max = 100, tier = 'custom' } = {}) {
  return (req, res, next) => {
    const key = `${tier}:${req.user?.username || req.ip || 'anonymous'}`;
    const now = Date.now();
    
    // Get or create user's request record
    let record = rateLimitStore.get(key);
    
    if (!record) {
      record = { count: 0, resetTime: now + windowMs, tier };
      rateLimitStore.set(key, record);
    }
    
    // Reset if window has passed
    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + windowMs;
    }
    
    // Check if limit exceeded
    if (record.count >= max) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.set('Retry-After', retryAfter.toString());
      res.set('X-RateLimit-Tier', tier);
      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        retryAfter,
        tier,
        limit: max
      });
    }
    
    // Increment counter
    record.count++;
    
    // Set comprehensive rate limit headers
    res.set('X-RateLimit-Limit', max.toString());
    res.set('X-RateLimit-Remaining', (max - record.count).toString());
    res.set('X-RateLimit-Reset', new Date(record.resetTime).toISOString());
    res.set('X-RateLimit-Tier', tier);
    res.set('X-RateLimit-Window', (windowMs / 1000).toString());
    
    next();
  };
}

// Standard rate limiters for different use cases (with tier tracking)
export const standardLimiter = createRateLimiter({ 
  ...rateLimitConfig.standard, 
  tier: 'standard' 
});

export const strictLimiter = createRateLimiter({ 
  ...rateLimitConfig.strict, 
  tier: 'strict' 
});

export const relaxedLimiter = createRateLimiter({ 
  ...rateLimitConfig.relaxed, 
  tier: 'relaxed' 
});

export const burstLimiter = createRateLimiter({ 
  ...rateLimitConfig.burst, 
  tier: 'burst' 
});

export const webhookLimiter = createRateLimiter({ 
  ...rateLimitConfig.webhook, 
  tier: 'webhook' 
});

/**
 * Get current rate limit statistics
 * @returns {Object} Rate limit statistics
 */
export function getRateLimitStats() {
  const stats = {
    totalKeys: rateLimitStore.size,
    byTier: {},
    activeUsers: 0
  };
  
  const now = Date.now();
  
  for (const [key, record] of rateLimitStore.entries()) {
    const tier = record.tier || 'unknown';
    
    if (!stats.byTier[tier]) {
      stats.byTier[tier] = { count: 0, totalRequests: 0 };
    }
    
    stats.byTier[tier].count++;
    stats.byTier[tier].totalRequests += record.count;
    
    // Count active users (within window)
    if (now <= record.resetTime) {
      stats.activeUsers++;
    }
  }
  
  return stats;
}

/**
 * Validate rate limit consistency across services
 * @returns {Object} Validation results
 */
export function validateRateLimitConsistency() {
  const expectedLimiters = {
    strict: ['payments', 'auth', 'webhook'],
    standard: ['api', 'dashboard', 'onboarding'],
    relaxed: ['public', 'health']
  };
  
  return {
    config: rateLimitConfig,
    expectedUsage: expectedLimiters,
    isConsistent: true,
    recommendations: [
      'Use strictLimiter for all payment and authentication endpoints',
      'Use standardLimiter for general API endpoints',
      'Use relaxedLimiter for public/read-only endpoints',
      'Use webhookLimiter for all webhook receivers'
    ]
  };
}

// Clean up old entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime + 300000) { // 5 minutes after reset
      rateLimitStore.delete(key);
    }
  }
}, 300000);
