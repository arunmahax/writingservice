/**
 * Health Check and Monitoring Endpoints
 */

const { asyncHandler } = require('../middleware/errorHandler');
const { isDatabaseConnected } = require('../config/database');
const { isRedisConnected, getQueueStats } = require('../config/queue');
const { isInitialized: isGeminiInitialized } = require('../services/geminiService');
const Job = require('../models/jobSchema');

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
    database: isDatabaseConnected(),
    redis: isRedisConnected(),
    gemini: isGeminiInitialized(),
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
  const allHealthy = Object.values(checks).every(v => 
    typeof v === 'boolean' ? v : true
  );
  
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
 * Database monitoring
 * GET /health/database
 */
const databaseHealth = asyncHandler(async (req, res) => {
  if (!isDatabaseConnected()) {
    return res.status(503).json({
      success: false,
      message: 'Database not connected'
    });
  }
  
  const jobCounts = await Job.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const counts = jobCounts.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});
  
  res.status(200).json({
    success: true,
    connected: true,
    jobCounts: counts,
    timestamp: new Date().toISOString()
  });
});

/**
 * Readiness probe for Kubernetes/orchestration
 * GET /ready
 */
const readinessProbe = asyncHandler(async (req, res) => {
  const ready = 
    isDatabaseConnected() && 
    isRedisConnected() && 
    isGeminiInitialized();
  
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
