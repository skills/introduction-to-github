/**
 * Rate Limiting Middleware
 * 
 * Provides rate limiting to prevent abuse of API endpoints
 */

// Simple in-memory rate limiter
const rateLimitStore = new Map();

/**
 * Create a rate limiter middleware
 * @param {Object} options - Rate limiter options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum number of requests per window
 * @returns {Function} Express middleware
 */
export function createRateLimiter({ windowMs = 60000, max = 100 } = {}) {
  return (req, res, next) => {
    const key = req.user?.username || req.ip || 'anonymous';
    const now = Date.now();
    
    // Get or create user's request record
    let record = rateLimitStore.get(key);
    
    if (!record) {
      record = { count: 0, resetTime: now + windowMs };
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
      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        retryAfter
      });
    }
    
    // Increment counter
    record.count++;
    
    // Set rate limit headers
    res.set('X-RateLimit-Limit', max.toString());
    res.set('X-RateLimit-Remaining', (max - record.count).toString());
    res.set('X-RateLimit-Reset', new Date(record.resetTime).toISOString());
    
    next();
  };
}

// Standard rate limiters for different use cases
export const standardLimiter = createRateLimiter({ windowMs: 60000, max: 100 }); // 100 requests per minute
export const strictLimiter = createRateLimiter({ windowMs: 60000, max: 20 }); // 20 requests per minute
export const relaxedLimiter = createRateLimiter({ windowMs: 60000, max: 300 }); // 300 requests per minute

// Clean up old entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime + 300000) { // 5 minutes after reset
      rateLimitStore.delete(key);
    }
  }
}, 300000);
