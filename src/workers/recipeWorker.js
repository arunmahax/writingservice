/**
 * Recipe Generation Worker
 * Processes jobs from the queue
 */

const { Worker } = require('bullmq');
const { redisConfig } = require('../config/queue');
const { logger } = require('../config/logger');
const { connectDatabase } = require('../config/database');
const Job = require('../models/jobSchema');
const generatorController = require('../controllers/generatorController');

// Connect to database
connectDatabase().catch(err => {
  logger.error('Worker failed to connect to database:', err);
  process.exit(1);
});

/**
 * Worker for processing recipe generation jobs
 */
const recipeWorker = new Worker(
  'recipe-generation',
  async (job) => {
    const { jobId } = job.data;
    
    logger.info('Worker processing job', { jobId, attemptNumber: job.attemptsMade + 1 });
    
    try {
      // Update job status in database
      const dbJob = await Job.findOne({ jobId });
      if (dbJob) {
        dbJob.status = 'generating';
        dbJob.metadata.startedAt = new Date();
        dbJob.metadata.attemptNumber = job.attemptsMade + 1;
        await dbJob.save();
      }
      
      // Update progress callback
      const updateProgress = async (progress) => {
        await job.updateProgress(progress);
        if (dbJob) {
          await dbJob.updateProgress(progress);
        }
      };
      
      // Process the job
      await generatorController.startGeneration(jobId, updateProgress);
      
      logger.info('Worker completed job', { jobId });
      
      return { success: true, jobId };
      
    } catch (error) {
      logger.error('Worker failed to process job', { 
        jobId, 
        error: error.message,
        stack: error.stack
      });
      
      // Update database with failure
      const dbJob = await Job.findOne({ jobId });
      if (dbJob) {
        await dbJob.markFailed(error.message);
      }
      
      throw error;
    }
  },
  {
    connection: redisConfig,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY) || 2, // Process 2 jobs at a time
    limiter: {
      max: parseInt(process.env.WORKER_MAX_JOBS) || 10, // Max 10 jobs
      duration: parseInt(process.env.WORKER_DURATION) || 60000 // per minute
    },
    settings: {
      stalledInterval: 30000, // Check for stalled jobs every 30 seconds
      maxStalledCount: 1, // Max times a job can be stalled before failing
    }
  }
);

// Worker event listeners
recipeWorker.on('completed', (job) => {
  logger.info('Job completed by worker', { jobId: job.id });
});

recipeWorker.on('failed', (job, err) => {
  logger.error('Job failed in worker', { 
    jobId: job?.id, 
    error: err.message,
    attemptsMade: job?.attemptsMade
  });
});

recipeWorker.on('error', (err) => {
  logger.error('Worker error:', err);
});

recipeWorker.on('stalled', (jobId) => {
  logger.warn('Job stalled', { jobId });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing worker...');
  await recipeWorker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing worker...');
  await recipeWorker.close();
  process.exit(0);
});

logger.info('🔧 Recipe generation worker started', {
  concurrency: recipeWorker.opts.concurrency,
  maxJobs: recipeWorker.opts.limiter.max,
  duration: recipeWorker.opts.limiter.duration
});

module.exports = recipeWorker;
