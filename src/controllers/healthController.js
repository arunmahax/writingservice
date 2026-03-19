/**
 * Health Check and Monitoring Endpoints - Queue-Only (No Database)
 */

const { asyncHandler } = require('../middleware/errorHandler');
const { isRedisConnected, getQueueStats } = require('../config/queue');
const { isInitialized: isAIInitialized } = require('../services/geminiService');

/**
 * Basic health check
 * GET /health
 */
const healthCheck = asyncHandler(async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0'
  };
  
  res.status(200).json(health);
});

/**
 * Detailed health check with dependencies
 * GET /health/detailed
 */
const detailedHealthCheck = asyncHandler(async (req, res) => {
  const checks = {
    redis: isRedisConnected(),
    ai: isAIInitialized(),
    queue: false
  };
  
  // Check queue
  try {
    const queueStats = await getQueueStats();
    checks.queue = queueStats !== null;
    checks.queueStats = queueStats;
  } catch (error) {
    checks.queue = false;
    checks.queueError = error.message;
  }
  
  // Overall status
  const allHealthy = checks.redis && checks.ai && checks.queue;
  
  const statusCode = allHealthy ? 200 : 503;
  
  res.status(statusCode).json({
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024)
    }
  });
});

/**
 * Queue monitoring
 * GET /health/queue
 */
const queueHealth = asyncHandler(async (req, res) => {
  const stats = await getQueueStats();
  
  if (!stats) {
    return res.status(503).json({
      success: false,
      message: 'Queue unavailable'
    });
  }
  
  res.status(200).json({
    success: true,
    queue: stats,
    timestamp: new Date().toISOString()
  });
});

/**
 * Database monitoring (returns queue stats instead)
 * GET /health/database
 */
const databaseHealth = asyncHandler(async (req, res) => {
  // No database, return queue-based job counts
  const stats = await getQueueStats();
  
  if (!stats) {
    return res.status(503).json({
      success: false,
      message: 'Queue unavailable'
    });
  }
  
  res.status(200).json({
    success: true,
    storage: 'redis-queue',
    jobCounts: {
      completed: stats.completed || 0,
      waiting: stats.waiting || 0,
      active: stats.active || 0,
      delayed: stats.delayed || 0,
      failed: stats.failed || 0
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Readiness probe for Kubernetes/orchestration
 * GET /ready
 */
const readinessProbe = asyncHandler(async (req, res) => {
  const ready = isRedisConnected() && isAIInitialized();
  
  if (ready) {
    res.status(200).json({ ready: true });
  } else {
    res.status(503).json({ ready: false });
  }
});

/**
 * Liveness probe for Kubernetes/orchestration
 * GET /alive
 */
const livenessProbe = asyncHandler(async (req, res) => {
  res.status(200).json({ alive: true });
});

module.exports = {
  healthCheck,
  detailedHealthCheck,
  queueHealth,
  databaseHealth,
  readinessProbe,
  livenessProbe
};
