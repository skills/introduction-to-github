/**
 * Error Handling Utilities
 * 
 * Centralized error handling, logging, and monitoring integration
 * Provides consistent error responses and observability
 * 
 * @author Chais Hill - OmniTech1
 */

/**
 * Custom error classes for different error types
 */
export class ValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.details = details;
  }
}

export class AuthenticationError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
  }
}

export class AuthorizationError extends Error {
  constructor(message = 'Permission denied') {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = 403;
  }
}

export class NotFoundError extends Error {
  constructor(resource, identifier = null) {
    super(identifier ? `${resource} '${identifier}' not found` : `${resource} not found`);
    this.name = 'NotFoundError';
    this.statusCode = 404;
    this.resource = resource;
    this.identifier = identifier;
  }
}

export class ConflictError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
    this.details = details;
  }
}

export class RateLimitError extends Error {
  constructor(retryAfter, tier = 'standard') {
    super(`Rate limit exceeded. Try again in ${retryAfter} seconds.`);
    this.name = 'RateLimitError';
    this.statusCode = 429;
    this.retryAfter = retryAfter;
    this.tier = tier;
  }
}

export class InternalError extends Error {
  constructor(message = 'Internal server error', originalError = null) {
    super(message);
    this.name = 'InternalError';
    this.statusCode = 500;
    this.originalError = originalError;
  }
}

/**
 * Error response formatter
 * @param {Error} error - Error object
 * @param {boolean} includeStack - Include stack trace (only in development)
 * @returns {Object} Formatted error response
 */
export function formatErrorResponse(error, includeStack = false) {
  const response = {
    error: error.name || 'Error',
    message: error.message || 'An error occurred',
    statusCode: error.statusCode || 500
  };
  
  // Add additional details if available
  if (error.details) {
    response.details = error.details;
  }
  
  if (error.resource) {
    response.resource = error.resource;
  }
  
  if (error.identifier) {
    response.identifier = error.identifier;
  }
  
  if (error.retryAfter) {
    response.retryAfter = error.retryAfter;
  }
  
  if (error.tier) {
    response.tier = error.tier;
  }
  
  // Include stack trace only in development
  if (includeStack && process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }
  
  return response;
}

/**
 * Log error to console with context
 * @param {Error} error - Error object
 * @param {Object} context - Additional context (req, user, etc.)
 */
export function logError(error, context = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      statusCode: error.statusCode || 500,
      stack: error.stack
    },
    context: {
      method: context.method,
      path: context.path,
      user: context.user,
      ip: context.ip,
      ...context
    }
  };
  
  // Log based on severity
  if (error.statusCode && error.statusCode < 500) {
    console.warn('⚠️  Client Error:', JSON.stringify(logEntry, null, 2));
  } else {
    console.error('❌ Server Error:', JSON.stringify(logEntry, null, 2));
  }
  
  // In production, send to monitoring service (Sentry, DataDog, etc.)
  if (process.env.NODE_ENV === 'production' && error.statusCode >= 500) {
    // Example: Sentry.captureException(error, { extra: context });
  }
}

/**
 * Async error handler wrapper for route handlers
 * Catches async errors and passes them to error middleware
 * @param {Function} fn - Async route handler function
 * @returns {Function} Wrapped function with error handling
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Express error handling middleware
 * Should be used as the last middleware in the chain
 */
export function errorMiddleware(err, req, res, next) {
  // Log the error with request context
  logError(err, {
    method: req.method,
    path: req.path,
    user: req.user?.username,
    ip: req.ip,
    body: req.body,
    query: req.query
  });
  
  // Format and send error response
  const errorResponse = formatErrorResponse(
    err,
    process.env.NODE_ENV === 'development'
  );
  
  res.status(errorResponse.statusCode).json(errorResponse);
}

/**
 * Create validation error from validation failures
 * @param {Array} errors - Array of validation errors
 * @returns {ValidationError}
 */
export function createValidationError(errors) {
  const messages = errors.map(e => e.message || e).join(', ');
  return new ValidationError('Validation failed', { errors });
}

/**
 * Handle database errors and convert to appropriate error types
 * @param {Error} dbError - Database error
 * @returns {Error} Appropriate error type
 */
export function handleDatabaseError(dbError) {
  // Check for common database errors
  if (dbError.code === '23505' || dbError.message.includes('duplicate')) {
    return new ConflictError('Resource already exists', {
      constraint: dbError.constraint
    });
  }
  
  if (dbError.code === '23503') {
    return new ValidationError('Referenced resource does not exist', {
      constraint: dbError.constraint
    });
  }
  
  // Default to internal error
  return new InternalError('Database operation failed', dbError);
}

/**
 * Metrics for error tracking
 */
const errorMetrics = {
  total: 0,
  byType: new Map(),
  byEndpoint: new Map(),
  byStatusCode: new Map()
};

/**
 * Track error for monitoring
 * @param {Error} error - Error object
 * @param {Object} context - Request context
 */
export function trackError(error, context = {}) {
  errorMetrics.total++;
  
  // Track by error type
  const errorType = error.name || 'Unknown';
  errorMetrics.byType.set(errorType, (errorMetrics.byType.get(errorType) || 0) + 1);
  
  // Track by endpoint
  if (context.path) {
    const endpoint = context.path;
    errorMetrics.byEndpoint.set(endpoint, (errorMetrics.byEndpoint.get(endpoint) || 0) + 1);
  }
  
  // Track by status code
  const statusCode = error.statusCode || 500;
  errorMetrics.byStatusCode.set(statusCode, (errorMetrics.byStatusCode.get(statusCode) || 0) + 1);
}

/**
 * Get error statistics
 * @returns {Object} Error metrics
 */
export function getErrorStats() {
  return {
    total: errorMetrics.total,
    byType: Object.fromEntries(errorMetrics.byType),
    byEndpoint: Object.fromEntries(errorMetrics.byEndpoint),
    byStatusCode: Object.fromEntries(errorMetrics.byStatusCode)
  };
}

/**
 * Reset error metrics (useful for testing)
 */
export function resetErrorMetrics() {
  errorMetrics.total = 0;
  errorMetrics.byType.clear();
  errorMetrics.byEndpoint.clear();
  errorMetrics.byStatusCode.clear();
}

export default {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalError,
  formatErrorResponse,
  logError,
  asyncHandler,
  errorMiddleware,
  createValidationError,
  handleDatabaseError,
  trackError,
  getErrorStats,
  resetErrorMetrics
};
