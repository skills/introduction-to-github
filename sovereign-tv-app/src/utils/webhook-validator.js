/**
 * Webhook Validation Utility
 * 
 * Provides HMAC signature validation for webhook endpoints
 * Implements security best practices for webhook authentication
 * 
 * @author Chais Hill - OmniTech1
 */

import crypto from 'crypto';

/**
 * Webhook validation configuration
 */
export const webhookConfig = {
  // Supported signature algorithms
  algorithms: {
    sha256: 'sha256',
    sha512: 'sha512'
  },
  
  // Header names for different webhook providers
  headers: {
    scrollverse: 'X-ScrollVerse-Signature',
    stripe: 'Stripe-Signature',
    github: 'X-Hub-Signature-256',
    custom: 'X-Webhook-Signature'
  },
  
  // Signature format: algorithm=signature
  signatureFormat: /^([a-z0-9]+)=([a-f0-9]+)$/,
  
  // Timestamp tolerance in seconds (prevent replay attacks)
  timestampTolerance: 300 // 5 minutes
};

/**
 * Generate HMAC signature for webhook payload
 * @param {string|Buffer} payload - Raw webhook payload
 * @param {string} secret - Webhook secret key
 * @param {string} algorithm - Hash algorithm (default: sha256)
 * @returns {string} HMAC signature in format "algorithm=signature"
 */
export function generateWebhookSignature(payload, secret, algorithm = 'sha256') {
  if (!payload) {
    throw new Error('Payload is required for signature generation');
  }
  
  if (!secret) {
    throw new Error('Secret is required for signature generation');
  }
  
  if (!webhookConfig.algorithms[algorithm]) {
    throw new Error(`Unsupported algorithm: ${algorithm}`);
  }
  
  const hmac = crypto.createHmac(algorithm, secret);
  hmac.update(typeof payload === 'string' ? payload : payload.toString());
  const signature = hmac.digest('hex');
  
  return `${algorithm}=${signature}`;
}

/**
 * Verify webhook signature
 * @param {string|Buffer} payload - Raw webhook payload
 * @param {string} signature - Received signature
 * @param {string} secret - Webhook secret key
 * @returns {boolean} True if signature is valid
 */
export function verifyWebhookSignature(payload, signature, secret) {
  if (!payload || !signature || !secret) {
    return false;
  }
  
  try {
    // Parse signature format
    const match = signature.match(webhookConfig.signatureFormat);
    if (!match) {
      console.error('Invalid signature format');
      return false;
    }
    
    const [, algorithm, receivedSignature] = match;
    
    // Generate expected signature
    const expectedSignature = generateWebhookSignature(payload, secret, algorithm);
    const [, expectedSig] = expectedSignature.split('=');
    
    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(receivedSignature, 'hex'),
      Buffer.from(expectedSig, 'hex')
    );
  } catch (error) {
    console.error('Signature verification error:', error.message);
    return false;
  }
}

/**
 * Verify webhook with timestamp validation (prevents replay attacks)
 * @param {string|Buffer} payload - Raw webhook payload
 * @param {string} signature - Received signature
 * @param {number} timestamp - Webhook timestamp (Unix seconds)
 * @param {string} secret - Webhook secret key
 * @param {number} tolerance - Timestamp tolerance in seconds (default: 300)
 * @returns {Object} Verification result with details
 */
export function verifyWebhookWithTimestamp(payload, signature, timestamp, secret, tolerance = webhookConfig.timestampTolerance) {
  const result = {
    valid: false,
    reason: null,
    timestamp: null,
    age: null
  };
  
  // Verify timestamp is provided
  if (!timestamp) {
    result.reason = 'Timestamp is required';
    return result;
  }
  
  // Verify timestamp is within tolerance
  const now = Math.floor(Date.now() / 1000);
  const age = now - timestamp;
  result.timestamp = timestamp;
  result.age = age;
  
  if (Math.abs(age) > tolerance) {
    result.reason = `Timestamp is too old (age: ${age}s, tolerance: ${tolerance}s)`;
    return result;
  }
  
  // Verify signature
  const signatureValid = verifyWebhookSignature(payload, signature, secret);
  if (!signatureValid) {
    result.reason = 'Invalid signature';
    return result;
  }
  
  result.valid = true;
  return result;
}

/**
 * Express middleware for webhook signature validation
 * @param {Object} options - Validation options
 * @param {string} options.secret - Webhook secret (can be function)
 * @param {string} options.header - Signature header name (default: X-Webhook-Signature)
 * @param {string} options.timestampHeader - Timestamp header name (optional)
 * @param {number} options.tolerance - Timestamp tolerance in seconds
 * @param {Function} options.onError - Error handler callback
 * @returns {Function} Express middleware
 */
export function webhookValidator(options = {}) {
  const {
    secret,
    header = webhookConfig.headers.custom,
    timestampHeader = 'X-Webhook-Timestamp',
    tolerance = webhookConfig.timestampTolerance,
    onError = null
  } = options;
  
  if (!secret) {
    throw new Error('Webhook secret is required');
  }
  
  return async (req, res, next) => {
    try {
      // Get signature from header
      const signature = req.get(header);
      if (!signature) {
        const error = new Error('Missing webhook signature');
        error.statusCode = 401;
        if (onError) return onError(error, req, res, next);
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Missing webhook signature',
          header
        });
      }
      
      // Get raw payload (must be Buffer or string)
      let payload;
      try {
        payload = req.body && typeof req.body === 'object' 
          ? JSON.stringify(req.body)
          : req.body;
      } catch (stringifyError) {
        const error = new Error('Invalid webhook payload - cannot serialize');
        error.statusCode = 400;
        error.originalError = stringifyError;
        if (onError) return onError(error, req, res, next);
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid webhook payload structure'
        });
      }
      
      if (!payload) {
        const error = new Error('Missing webhook payload');
        error.statusCode = 400;
        if (onError) return onError(error, req, res, next);
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Missing webhook payload'
        });
      }
      
      // Resolve secret (can be a function)
      const webhookSecret = typeof secret === 'function' ? await secret(req) : secret;
      
      // Check if timestamp validation is required
      const timestamp = req.get(timestampHeader);
      if (timestamp) {
        const verification = verifyWebhookWithTimestamp(
          payload,
          signature,
          parseInt(timestamp, 10),
          webhookSecret,
          tolerance
        );
        
        if (!verification.valid) {
          const error = new Error(`Webhook verification failed: ${verification.reason}`);
          error.statusCode = 401;
          if (onError) return onError(error, req, res, next);
          return res.status(401).json({
            error: 'Unauthorized',
            message: verification.reason,
            timestamp: verification.timestamp,
            age: verification.age
          });
        }
      } else {
        // Simple signature verification without timestamp
        const isValid = verifyWebhookSignature(payload, signature, webhookSecret);
        if (!isValid) {
          const error = new Error('Invalid webhook signature');
          error.statusCode = 401;
          if (onError) return onError(error, req, res, next);
          return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid webhook signature'
          });
        }
      }
      
      // Signature is valid, proceed
      next();
    } catch (error) {
      console.error('Webhook validation error:', error);
      if (onError) return onError(error, req, res, next);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Webhook validation failed'
      });
    }
  };
}

/**
 * Store for webhook deduplication (prevent duplicate processing)
 */
const webhookIdempotencyStore = new Map();

/**
 * Middleware for webhook idempotency (prevent duplicate processing)
 * @param {Object} options - Idempotency options
 * @param {string} options.header - Idempotency header name (default: X-Webhook-ID)
 * @param {number} options.ttl - Time to live in milliseconds (default: 24 hours)
 * @returns {Function} Express middleware
 */
export function webhookIdempotency(options = {}) {
  const {
    header = 'X-Webhook-ID',
    ttl = 86400000 // 24 hours
  } = options;
  
  return (req, res, next) => {
    const webhookId = req.get(header);
    
    if (!webhookId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing webhook ID',
        header
      });
    }
    
    // Check if webhook has already been processed
    if (webhookIdempotencyStore.has(webhookId)) {
      const record = webhookIdempotencyStore.get(webhookId);
      return res.status(200).json({
        message: 'Webhook already processed',
        webhookId,
        processedAt: record.processedAt,
        cached: true
      });
    }
    
    // Store webhook ID
    webhookIdempotencyStore.set(webhookId, {
      processedAt: new Date().toISOString(),
      expiresAt: Date.now() + ttl
    });
    
    // Mark as processed
    req.webhookId = webhookId;
    next();
  };
}

/**
 * Clean up expired webhook IDs periodically (every hour)
 * In production, use a more robust cleanup mechanism (e.g., Redis TTL)
 */
let cleanupInterval = null;

export function startWebhookCleanup(intervalMs = 3600000) {
  if (cleanupInterval) return; // Already running
  
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [id, record] of webhookIdempotencyStore.entries()) {
      if (now > record.expiresAt) {
        webhookIdempotencyStore.delete(id);
      }
    }
  }, intervalMs);
  
  // Unref to allow process to exit
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }
}

export function stopWebhookCleanup() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}

// Auto-start cleanup in non-test environments
if (process.env.NODE_ENV !== 'test') {
  startWebhookCleanup();
}

/**
 * Get webhook validation statistics
 * @returns {Object} Statistics
 */
export function getWebhookStats() {
  return {
    idempotencyStoreSize: webhookIdempotencyStore.size,
    config: {
      supportedAlgorithms: Object.keys(webhookConfig.algorithms),
      supportedProviders: Object.keys(webhookConfig.headers),
      timestampTolerance: webhookConfig.timestampTolerance
    }
  };
}

export default {
  generateWebhookSignature,
  verifyWebhookSignature,
  verifyWebhookWithTimestamp,
  webhookValidator,
  webhookIdempotency,
  getWebhookStats,
  startWebhookCleanup,
  stopWebhookCleanup,
  webhookConfig
};
