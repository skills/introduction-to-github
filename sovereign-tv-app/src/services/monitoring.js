/**
 * ScrollVerse Monitoring Service
 * 
 * Integrates Sentry for error tracking and Prometheus for metrics collection
 * Provides real-time observability for ScrollCoin, NFT, and API analytics
 * 
 * @author Chais Hill - OmniTech1
 */

import { Router } from 'express';
import { authenticateToken } from './auth.js';
import { standardLimiter } from '../utils/rate-limiter.js';

const monitoringRouter = Router();

// In-memory metrics storage (use Prometheus/TimescaleDB in production)
const metricsStore = {
  counters: new Map(),
  gauges: new Map(),
  histograms: new Map(),
  errors: [],
  startTime: Date.now()
};

// Sentry configuration (DSN from environment)
const SENTRY_CONFIG = {
  dsn: process.env.SENTRY_DSN || '',
  environment: process.env.NODE_ENV || 'development',
  release: process.env.APP_VERSION || 'v1.0-Activation',
  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.1,
  profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE) || 0.1,
  enabled: !!process.env.SENTRY_DSN
};

// Prometheus configuration
const PROMETHEUS_CONFIG = {
  pushgateway: process.env.PROMETHEUS_PUSHGATEWAY || '',
  jobName: 'scrollverse_sovereign_tv',
  scrapeInterval: parseInt(process.env.PROMETHEUS_SCRAPE_INTERVAL) || 15000,
  enabled: !!process.env.PROMETHEUS_PUSHGATEWAY
};

// Metric definitions for ScrollVerse ecosystem
const METRIC_DEFINITIONS = {
  // API metrics
  'api_requests_total': { type: 'counter', help: 'Total API requests', labels: ['method', 'endpoint', 'status'] },
  'api_request_duration_seconds': { type: 'histogram', help: 'API request duration', labels: ['method', 'endpoint'], buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5] },
  'api_errors_total': { type: 'counter', help: 'Total API errors', labels: ['method', 'endpoint', 'error_type'] },
  
  // ScrollCoin metrics
  'scrollcoin_transactions_total': { type: 'counter', help: 'Total ScrollCoin transactions', labels: ['type'] },
  'scrollcoin_volume': { type: 'gauge', help: 'ScrollCoin transaction volume', labels: ['currency'] },
  'scrollcoin_active_wallets': { type: 'gauge', help: 'Active ScrollCoin wallets' },
  'scrollcoin_price_usd': { type: 'gauge', help: 'ScrollCoin price in USD' },
  
  // NFT metrics
  'nft_mints_total': { type: 'counter', help: 'Total NFT mints', labels: ['contract', 'rarity'] },
  'nft_transfers_total': { type: 'counter', help: 'Total NFT transfers', labels: ['contract'] },
  'nft_floor_price': { type: 'gauge', help: 'NFT floor price in ETH', labels: ['contract'] },
  'nft_total_supply': { type: 'gauge', help: 'NFT total supply', labels: ['contract'] },
  
  // SBT metrics
  'sbt_souls_total': { type: 'gauge', help: 'Total ScrollSoul SBTs minted' },
  'sbt_level_distribution': { type: 'gauge', help: 'SBT level distribution', labels: ['level'] },
  'sbt_xp_granted_total': { type: 'counter', help: 'Total XP granted', labels: ['source'] },
  
  // Iam King NFT metrics
  'iam_king_holders_total': { type: 'gauge', help: 'Total Iam King NFT holders', labels: ['tier'] },
  'iam_king_upgrades_total': { type: 'counter', help: 'Total tier upgrades' },
  
  // Payment metrics
  'payment_transactions_total': { type: 'counter', help: 'Total payment transactions', labels: ['provider', 'status'] },
  'payment_volume_usd': { type: 'gauge', help: 'Payment volume in USD', labels: ['provider'] },
  'payment_webhook_latency_seconds': { type: 'histogram', help: 'Webhook processing latency', labels: ['provider'], buckets: [0.1, 0.5, 1, 2, 5] },
  
  // Festival metrics
  'festival_participants_total': { type: 'gauge', help: 'Total festival participants' },
  'festival_rewards_distributed': { type: 'counter', help: 'Total rewards distributed', labels: ['type'] },
  'festival_checkins_total': { type: 'counter', help: 'Total daily check-ins' },
  
  // System metrics
  'system_uptime_seconds': { type: 'gauge', help: 'System uptime in seconds' },
  'system_memory_usage_bytes': { type: 'gauge', help: 'Memory usage in bytes' },
  'system_cpu_usage_percent': { type: 'gauge', help: 'CPU usage percentage' },
  
  // zkEVM specific metrics
  'zkevm_gas_price_gwei': { type: 'gauge', help: 'Polygon zkEVM gas price', labels: ['network'] },
  'zkevm_transactions_total': { type: 'counter', help: 'Total zkEVM transactions', labels: ['type', 'status'] }
};

/**
 * Initialize Sentry error tracking
 */
function initSentry(app) {
  if (!SENTRY_CONFIG.enabled) {
    console.log('📊 Sentry: Disabled (no DSN configured)');
    return null;
  }

  // In production, use: import * as Sentry from '@sentry/node';
  // Sentry.init(SENTRY_CONFIG);
  
  console.log(`📊 Sentry: Initialized for ${SENTRY_CONFIG.environment}`);
  
  return {
    captureException: (error, context = {}) => {
      metricsStore.errors.push({
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString()
      });
      // In production: Sentry.captureException(error, { extra: context });
    },
    captureMessage: (message, level = 'info') => {
      console.log(`[Sentry ${level}] ${message}`);
      // In production: Sentry.captureMessage(message, level);
    },
    setUser: (user) => {
      // In production: Sentry.setUser(user);
    },
    setTag: (key, value) => {
      // In production: Sentry.setTag(key, value);
    }
  };
}

/**
 * Initialize Prometheus metrics collection
 */
function initPrometheus() {
  if (!PROMETHEUS_CONFIG.enabled) {
    console.log('📈 Prometheus: Disabled (no pushgateway configured)');
    return null;
  }

  console.log(`📈 Prometheus: Initialized with pushgateway ${PROMETHEUS_CONFIG.pushgateway}`);
  
  // In production, use: import { Registry, Counter, Gauge, Histogram } from 'prom-client';
  return {
    pushMetrics: async () => {
      // In production: push to pushgateway
      console.log('📈 Metrics pushed to Prometheus');
    }
  };
}

/**
 * Increment a counter metric
 */
function incCounter(name, labels = {}, value = 1) {
  const key = `${name}:${JSON.stringify(labels)}`;
  const current = metricsStore.counters.get(key) || 0;
  metricsStore.counters.set(key, current + value);
}

/**
 * Set a gauge metric
 */
function setGauge(name, value, labels = {}) {
  const key = `${name}:${JSON.stringify(labels)}`;
  metricsStore.gauges.set(key, value);
}

/**
 * Record histogram observation
 */
function observeHistogram(name, value, labels = {}) {
  const key = `${name}:${JSON.stringify(labels)}`;
  const observations = metricsStore.histograms.get(key) || [];
  observations.push({ value, timestamp: Date.now() });
  // Keep last 1000 observations
  if (observations.length > 1000) observations.shift();
  metricsStore.histograms.set(key, observations);
}

/**
 * Middleware to track request metrics
 */
function requestMetricsMiddleware(req, res, next) {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000;
    const labels = {
      method: req.method,
      endpoint: req.route?.path || req.path,
      status: res.statusCode.toString()
    };
    
    incCounter('api_requests_total', labels);
    observeHistogram('api_request_duration_seconds', duration, { method: req.method, endpoint: labels.endpoint });
    
    if (res.statusCode >= 400) {
      incCounter('api_errors_total', { ...labels, error_type: res.statusCode >= 500 ? 'server' : 'client' });
    }
  });
  
  next();
}

/**
 * Get monitoring configuration
 */
monitoringRouter.get('/config', authenticateToken, (req, res) => {
  res.json({
    sentry: {
      enabled: SENTRY_CONFIG.enabled,
      environment: SENTRY_CONFIG.environment,
      release: SENTRY_CONFIG.release,
      tracesSampleRate: SENTRY_CONFIG.tracesSampleRate
    },
    prometheus: {
      enabled: PROMETHEUS_CONFIG.enabled,
      jobName: PROMETHEUS_CONFIG.jobName,
      scrapeInterval: PROMETHEUS_CONFIG.scrapeInterval
    },
    metrics: Object.keys(METRIC_DEFINITIONS).length,
    uptime: Math.floor((Date.now() - metricsStore.startTime) / 1000)
  });
});

/**
 * Prometheus metrics endpoint (scrape target)
 */
monitoringRouter.get('/metrics', (req, res) => {
  let output = '';
  
  // Output counters
  for (const [key, value] of metricsStore.counters) {
    const [name, labelsJson] = key.split(':');
    const labels = JSON.parse(labelsJson);
    const labelStr = Object.entries(labels).map(([k, v]) => `${k}="${v}"`).join(',');
    const def = METRIC_DEFINITIONS[name];
    if (def) {
      output += `# HELP ${name} ${def.help}\n`;
      output += `# TYPE ${name} ${def.type}\n`;
    }
    output += `${name}{${labelStr}} ${value}\n`;
  }
  
  // Output gauges
  for (const [key, value] of metricsStore.gauges) {
    const [name, labelsJson] = key.split(':');
    const labels = JSON.parse(labelsJson);
    const labelStr = Object.entries(labels).map(([k, v]) => `${k}="${v}"`).join(',');
    const def = METRIC_DEFINITIONS[name];
    if (def) {
      output += `# HELP ${name} ${def.help}\n`;
      output += `# TYPE ${name} ${def.type}\n`;
    }
    output += `${name}{${labelStr}} ${value}\n`;
  }
  
  // Add system metrics
  const uptimeSeconds = Math.floor((Date.now() - metricsStore.startTime) / 1000);
  output += `# HELP system_uptime_seconds System uptime in seconds\n`;
  output += `# TYPE system_uptime_seconds gauge\n`;
  output += `system_uptime_seconds ${uptimeSeconds}\n`;
  
  // Memory usage (Node.js)
  const memUsage = process.memoryUsage();
  output += `# HELP system_memory_usage_bytes Memory usage in bytes\n`;
  output += `# TYPE system_memory_usage_bytes gauge\n`;
  output += `system_memory_usage_bytes{type="heapUsed"} ${memUsage.heapUsed}\n`;
  output += `system_memory_usage_bytes{type="heapTotal"} ${memUsage.heapTotal}\n`;
  output += `system_memory_usage_bytes{type="rss"} ${memUsage.rss}\n`;
  
  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.send(output);
});

/**
 * Get recent errors (Sentry-like)
 */
monitoringRouter.get('/errors', authenticateToken, standardLimiter, (req, res) => {
  const { limit = 50 } = req.query;
  
  res.json({
    errors: metricsStore.errors.slice(-parseInt(limit)),
    total: metricsStore.errors.length
  });
});

/**
 * Report an error manually
 */
monitoringRouter.post('/error', authenticateToken, standardLimiter, (req, res) => {
  const { message, stack, context, level = 'error' } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }
  
  metricsStore.errors.push({
    message,
    stack,
    context,
    level,
    timestamp: new Date().toISOString(),
    user: req.user?.username
  });
  
  res.json({ success: true, message: 'Error logged' });
});

/**
 * Get dashboard metrics summary
 */
monitoringRouter.get('/dashboard', authenticateToken, standardLimiter, (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - metricsStore.startTime) / 1000);
  const memUsage = process.memoryUsage();
  
  // Aggregate metrics
  let totalRequests = 0;
  let totalErrors = 0;
  
  for (const [key, value] of metricsStore.counters) {
    if (key.startsWith('api_requests_total')) totalRequests += value;
    if (key.startsWith('api_errors_total')) totalErrors += value;
  }
  
  res.json({
    system: {
      uptime: uptimeSeconds,
      uptimeFormatted: formatUptime(uptimeSeconds),
      memoryUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      memoryTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      memoryUnit: 'MB'
    },
    api: {
      totalRequests,
      totalErrors,
      errorRate: totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(2) + '%' : '0%'
    },
    monitoring: {
      sentryEnabled: SENTRY_CONFIG.enabled,
      prometheusEnabled: PROMETHEUS_CONFIG.enabled,
      metricsCount: metricsStore.counters.size + metricsStore.gauges.size,
      errorsLogged: metricsStore.errors.length
    },
    version: SENTRY_CONFIG.release
  });
});

/**
 * Track ScrollCoin transaction
 */
monitoringRouter.post('/track/scrollcoin', authenticateToken, standardLimiter, (req, res) => {
  const { type, amount, currency = 'USD' } = req.body;
  
  incCounter('scrollcoin_transactions_total', { type });
  
  const currentVolume = metricsStore.gauges.get(`scrollcoin_volume:{"currency":"${currency}"}`) || 0;
  setGauge('scrollcoin_volume', currentVolume + (amount || 0), { currency });
  
  res.json({ success: true });
});

/**
 * Track NFT mint
 */
monitoringRouter.post('/track/nft', authenticateToken, standardLimiter, (req, res) => {
  const { contract, rarity, event = 'mint' } = req.body;
  
  if (event === 'mint') {
    incCounter('nft_mints_total', { contract, rarity });
  } else if (event === 'transfer') {
    incCounter('nft_transfers_total', { contract });
  }
  
  res.json({ success: true });
});

/**
 * Track SBT metrics
 */
monitoringRouter.post('/track/sbt', authenticateToken, standardLimiter, (req, res) => {
  const { totalSouls, levelDistribution, xpGranted, xpSource } = req.body;
  
  if (totalSouls !== undefined) {
    setGauge('sbt_souls_total', totalSouls);
  }
  
  if (levelDistribution) {
    for (const [level, count] of Object.entries(levelDistribution)) {
      setGauge('sbt_level_distribution', count, { level });
    }
  }
  
  if (xpGranted) {
    incCounter('sbt_xp_granted_total', { source: xpSource || 'unknown' }, xpGranted);
  }
  
  res.json({ success: true });
});

/**
 * Track zkEVM gas prices (for festival gas spike monitoring)
 */
monitoringRouter.post('/track/zkevm-gas', authenticateToken, standardLimiter, (req, res) => {
  const { network, gasPrice } = req.body;
  
  if (!network || gasPrice === undefined) {
    return res.status(400).json({ error: 'network and gasPrice required' });
  }
  
  setGauge('zkevm_gas_price_gwei', gasPrice, { network });
  
  // Alert on high gas (> 100 gwei)
  if (gasPrice > 100) {
    metricsStore.errors.push({
      message: `High gas alert on ${network}: ${gasPrice} gwei`,
      level: 'warning',
      context: { network, gasPrice },
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({ success: true, alert: gasPrice > 100 });
});

/**
 * Get health status with detailed checks
 */
monitoringRouter.get('/health', (req, res) => {
  const checks = {
    api: 'healthy',
    metrics: metricsStore.counters.size > 0 || metricsStore.gauges.size > 0 ? 'healthy' : 'idle',
    sentry: SENTRY_CONFIG.enabled ? 'configured' : 'disabled',
    prometheus: PROMETHEUS_CONFIG.enabled ? 'configured' : 'disabled'
  };
  
  const allHealthy = Object.values(checks).every(s => s !== 'unhealthy');
  
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'healthy' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
    version: SENTRY_CONFIG.release
  });
});

/**
 * Format uptime to human-readable
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  
  return parts.join(' ');
}

// Export utilities for use in other services
export { 
  monitoringRouter,
  initSentry,
  initPrometheus,
  incCounter,
  setGauge,
  observeHistogram,
  requestMetricsMiddleware
};
