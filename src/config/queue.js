/**
 * Job Queue Configuration - BullMQ
 * Handles asynchronous job processing with Redis
 */

const { Queue, Worker, QueueEvents } = require('bullmq');
const Redis = require('ioredis');
const { logger } = require('./logger');

// Redis connection configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
};

// Create Redis connection for BullMQ
const connection = new Redis(redisConfig);

// Queue for recipe generation jobs
const recipeQueue = new Queue('recipe-generation', {
  connection,
  defaultJobOptions: {
    attempts: 3, // Retry failed jobs 3 times
    backoff: {
      type: 'exponential',
      delay: 5000 // Start with 5 second delay
    },
    removeOnComplete: {
      age: 3600, // Keep completed jobs for 1 hour
      count: 100 // Keep last 100 completed jobs
    },
    removeOnFail: {
      age: 86400, // Keep failed jobs for 24 hours
      count: 500 // Keep last 500 failed jobs
    }
  }
});

// Queue events for monitoring
const queueEvents = new QueueEvents('recipe-generation', { connection });

// Event listeners
queueEvents.on('completed', ({ jobId }) => {
  logger.info('Job completed', { jobId });
});

queueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error('Job failed', { jobId, reason: failedReason });
});

queueEvents.on('stalled', ({ jobId }) => {
  logger.warn('Job stalled', { jobId });
});

// Redis connection events
connection.on('connect', () => {
  logger.info('✅ Redis connected successfully');
});

connection.on('error', (err) => {
  logger.error('❌ Redis connection error:', err);
});

connection.on('reconnecting', () => {
  logger.warn('🔄 Redis reconnecting...');
});

/**
 * Add a job to the queue
 * @param {string} jobId - Unique job identifier
 * @param {Object} data - Job data
 * @param {Object} options - Job options
 * @returns {Promise<Job>}
 */
const addJob = async (jobId, data, options = {}) => {
  try {
    const job = await recipeQueue.add(jobId, data, {
      jobId,
      priority: options.priority || 10,
      ...options
    });
    
    logger.info('Job added to queue', { jobId, priority: options.priority || 10 });
    return job;
  } catch (error) {
    logger.error('Failed to add job to queue', { jobId, error: error.message });
    throw error;
  }
};

/**
 * Get job status from queue
 * @param {string} jobId - Job identifier
 * @returns {Promise<Object>}
 */
const getJobStatus = async (jobId) => {
  try {
    const job = await recipeQueue.getJob(jobId);
    if (!job) {
      return null;
    }

    const state = await job.getState();
    const progress = job.progress;

    return {
      id: job.id,
      state,
      progress,
      data: job.data,
      returnvalue: job.returnvalue,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
      timestamp: job.timestamp
    };
  } catch (error) {
    logger.error('Error getting job status', { jobId, error: error.message });
    return null;
  }
};

/**
 * Remove a job from the queue
 * @param {string} jobId - Job identifier
 * @returns {Promise<void>}
 */
const removeJob = async (jobId) => {
  try {
    const job = await recipeQueue.getJob(jobId);
    if (job) {
      await job.remove();
      logger.info('Job removed from queue', { jobId });
    }
  } catch (error) {
    logger.error('Error removing job', { jobId, error: error.message });
    throw error;
  }
};

/**
 * Clean old jobs from the queue
 * @returns {Promise<void>}
 */
const cleanQueue = async () => {
  try {
    await recipeQueue.clean(3600000, 100, 'completed'); // Clean completed jobs older than 1 hour
    await recipeQueue.clean(86400000, 500, 'failed'); // Clean failed jobs older than 24 hours
    logger.info('Queue cleaned successfully');
  } catch (error) {
    logger.error('Error cleaning queue:', error);
  }
};

/**
 * Get queue statistics
 * @returns {Promise<Object>}
 */
const getQueueStats = async () => {
  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      recipeQueue.getWaitingCount(),
      recipeQueue.getActiveCount(),
      recipeQueue.getCompletedCount(),
      recipeQueue.getFailedCount(),
      recipeQueue.getDelayedCount()
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed
    };
  } catch (error) {
    logger.error('Error getting queue stats:', error);
    return null;
  }
};

/**
 * Close queue and Redis connections gracefully
 */
const closeQueue = async () => {
  try {
    await queueEvents.close();
    await recipeQueue.close();
    await connection.quit();
    logger.info('Queue connections closed');
  } catch (error) {
    logger.error('Error closing queue:', error);
    throw error;
  }
};

/**
 * Check if Redis is connected
 */
const isRedisConnected = () => {
  return connection.status === 'ready';
};

module.exports = {
  recipeQueue,
  queueEvents,
  addJob,
  getJobStatus,
  removeJob,
  cleanQueue,
  getQueueStats,
  closeQueue,
  isRedisConnected,
  redisConfig
};
