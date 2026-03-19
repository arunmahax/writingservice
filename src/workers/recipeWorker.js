/**
 * Recipe Generation Worker - Queue-Only (No Database)
 * Processes jobs from the queue, stores results in Redis via BullMQ
 */

require('dotenv').config();

const { Worker } = require('bullmq');
const { redisConfig } = require('../config/queue');
const { logger } = require('../config/logger');
const { initializeGemini } = require('../services/geminiService');
const generatorController = require('../controllers/generatorController');
const jobModel = require('../models/jobModel');

// Initialize AI (OpenRouter)
logger.info('Initializing OpenRouter AI in worker...');
const geminiInit = initializeGemini();
if (!geminiInit) {
  logger.warn('⚠️  AI not initialized. Check OPENROUTER_API_KEY in .env');
} else {
  logger.info('✅ OpenRouter AI initialized successfully');
}

/**
 * Worker for processing recipe generation jobs
 */
const recipeWorker = new Worker(
  'recipe-generation',
  async (job) => {
    const { jobId, input, sections } = job.data;
    
    logger.info('Worker processing job', { jobId, attemptNumber: job.attemptsMade + 1 });
    
    try {
      // Create job in temporary memory for processing
      jobModel.createJob({
        jobId,
        input,
        sections,
        status: 'generating',
        context: {},
        errorLog: []
      });
      
      const startTime = Date.now();
      
      // Update progress callback
      const updateProgress = async (progress) => {
        await job.updateProgress(progress);
        // Update job data in queue
        await job.updateData({
          ...job.data,
          progress,
          status: 'generating',
          metadata: {
            ...job.data.metadata,
            updatedAt: new Date().toISOString(),
            lastProgress: progress
          }
        });
      };
      
      // Process the job using existing generator controller
      await generatorController.startGeneration(jobId, updateProgress);
      
      const processingTime = Date.now() - startTime;
      
      // Get final job state
      const finalJob = jobModel.getFinalJobState(jobId);
      
      logger.info('Worker completed job', { jobId, processingTime });
      
      // Return result (BullMQ stores this in job.returnvalue)
      return {
        success: true,
        jobId,
        status: finalJob.status,
        result: finalJob.result,
        sections: finalJob.sections,
        errorLog: finalJob.errorLog || [],
        metadata: {
          ...job.data.metadata,
          completedAt: new Date().toISOString(),
          processingTime
        }
      };
      
    } catch (error) {
      logger.error('Worker failed to process job', { 
        jobId, 
        error: error.message,
        stack: error.stack
      });
      
      // Update job data with error
      await job.updateData({
        ...job.data,
        status: 'failed',
        errorLog: [
          ...(job.data.errorLog || []),
          {
            timestamp: new Date().toISOString(),
            error: error.message,
            stack: error.stack,
            attemptNumber: job.attemptsMade + 1
          }
        ],
        metadata: {
          ...job.data.metadata,
          lastError: error.message,
          failedAt: new Date().toISOString()
        }
      });
      
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

recipeWorker.on('active', (job) => {
  logger.info('Job active in worker', { jobId: job.id });
});

recipeWorker.on('progress', (job, progress) => {
  logger.debug('Job progress', { jobId: job.id, progress });
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Stopping worker gracefully...`);
  
  await recipeWorker.close();
  
  logger.info('Worker stopped');
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

logger.info('Recipe generation worker started');
logger.info(`Concurrency: ${process.env.WORKER_CONCURRENCY || 2} jobs`);
logger.info(`Rate limit: ${process.env.WORKER_MAX_JOBS || 10} jobs per ${(parseInt(process.env.WORKER_DURATION) || 60000) / 1000}s`);

module.exports = recipeWorker;
