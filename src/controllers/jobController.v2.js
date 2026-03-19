/**
 * Job Controller - Queue-Only (No Database)
 * Jobs are stored in Redis via BullMQ
 */

const { recipeQueue, addJob } = require('../config/queue');
const { logger } = require('../config/logger');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { asyncHandler } = require('../middleware/errorHandler');
const { JOB_STATUS, SECTION_ORDER, SECTION_STATUS } = require('../config/constants');

/**
 * Create a new recipe generation job
 * POST /api/generate-recipe
 */
const createJob = asyncHandler(async (req, res) => {
  const input = req.body;
  
  // Generate unique job ID
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const jobId = `job_${timestamp}_${random}`;
  
  // Initialize sections
  const sections = {};
  SECTION_ORDER.forEach(sectionKey => {
    sections[sectionKey] = {
      status: SECTION_STATUS.PENDING,
      data: null,
      timestamp: null,
      retries: 0,
      error: null
    };
  });
  
  // Job data to store in queue
  const jobData = {
    jobId,
    input: {
      title: input.title,
      image1: input.image1,
      image2: input.image2,
      featuredImage: input.featuredImage,
      categories: input.categories,
      authors: input.authors
    },
    status: JOB_STATUS.PENDING,
    progress: 0,
    currentSection: null,
    sections,
    context: {},
    result: null,
    errorLog: [],
    metadata: {
      attemptNumber: 1,
      queuedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
  };
  
  logger.info('Creating job in queue', { jobId, title: input.title });
  
  // Add job to queue - BullMQ stores job data in Redis
  await addJob(jobId, jobData, {
    priority: input.priority || 10,
    jobId // Use jobId as BullMQ job identifier
  });
  
  logger.info('Job queued for processing', { jobId });
  
  return res.status(201).json({
    success: true,
    jobId,
    status: JOB_STATUS.QUEUED,
    message: 'Job created and queued for processing',
    statusUrl: `/api/job-status/${jobId}`,
    resultUrl: `/api/job-result/${jobId}`
  });
});

/**
 * Get job from queue by jobId
 */
async function getJobFromQueue(jobId) {
  // Get job directly by ID - more efficient than fetching all jobs
  const job = await recipeQueue.getJob(jobId);
  
  if (!job) {
    return null;
  }
  
  // Map BullMQ states to our status
  let status = job.data.status || JOB_STATUS.PENDING;
  if (await job.isCompleted()) {
    status = job.returnvalue?.status || JOB_STATUS.COMPLETED;
  } else if (await job.isFailed()) {
    status = JOB_STATUS.FAILED;
  } else if (await job.isActive()) {
    status = JOB_STATUS.GENERATING;
  } else if (await job.isWaiting() || await job.isDelayed()) {
    status = JOB_STATUS.QUEUED;
  }
  
  return {
    ...job.data,
    status,
    ...(job.returnvalue || {}) // Merge return value for completed jobs
  };
}

/**
 * Get job status
 * GET /api/job-status/:jobId
 */
const getJobStatus = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  
  const job = await getJobFromQueue(jobId);
  
  if (!job) {
    throw new NotFoundError('Job', jobId);
  }
  
  // Calculate progress based on completed sections
  const sectionsObj = job.sections || {};
  const completedSections = Object.values(sectionsObj).filter(
    s => s.status === SECTION_STATUS.COMPLETED
  ).length;
  const totalSections = SECTION_ORDER.length;
  const calculatedProgress = Math.round((completedSections / totalSections) * 100);
  
  return res.status(200).json({
    success: true,
    job: {
      jobId: job.jobId,
      status: job.status,
      progress: job.progress || calculatedProgress,
      currentSection: job.currentSection,
      createdAt: job.metadata?.createdAt,
      updatedAt: job.metadata?.updatedAt,
      sections: Object.fromEntries(
        Object.entries(sectionsObj).map(([key, value]) => [
          key,
          { status: value.status, timestamp: value.timestamp }
        ])
      ),
      errorLog: job.errorLog || [],
      metadata: job.metadata || {}
    }
  });
});

/**
 * Get job result
 * GET /api/job-result/:jobId
 */
const getJobResult = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  
  const job = await getJobFromQueue(jobId);
  
  if (!job) {
    throw new NotFoundError('Job', jobId);
  }
  
  if (job.status === JOB_STATUS.PENDING || job.status === JOB_STATUS.QUEUED) {
    return res.status(202).json({
      success: false,
      message: 'Job is queued and waiting to be processed',
      jobId: job.jobId,
      status: job.status,
      queuePosition: 'Calculating...'
    });
  }
  
  if (job.status === JOB_STATUS.GENERATING) {
    return res.status(202).json({
      success: false,
      message: 'Job is still processing',
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      currentSection: job.currentSection
    });
  }
  
  if (job.status === JOB_STATUS.FAILED) {
    return res.status(500).json({
      success: false,
      message: 'Job processing failed',
      jobId: job.jobId,
      status: job.status,
      errorLog: job.errorLog || [],
      lastError: job.metadata?.lastError
    });
  }
  
  // Job completed successfully
  return res.status(200).json({
    success: true,
    jobId: job.jobId,
    status: job.status,
    result: job.result,
    processingTime: job.metadata?.processingTime,
    completedAt: job.metadata?.completedAt
  });
});

/**
 * List all jobs (from queue)
 * GET /api/jobs
 */
const listJobs = asyncHandler(async (req, res) => {
  const { status, limit = 50, page = 1 } = req.query;
  
  // Get jobs from queue
  const states = status ? [status] : ['completed', 'waiting', 'active', 'delayed', 'failed'];
  const jobs = await recipeQueue.getJobs(states);
  
  // Map to our format
  const mappedJobs = jobs.map(j => ({
    jobId: j.data.jobId || j.id,
    status: j.data.status,
    progress: j.data.progress || 0,
    currentSection: j.data.currentSection,
    createdAt: j.data.metadata?.createdAt,
    updatedAt: j.data.metadata?.updatedAt,
    input: {
      title: j.data.input?.title
    }
  }));
  
  // Pagination
  const startIdx = (parseInt(page) - 1) * parseInt(limit);
  const endIdx = startIdx + parseInt(limit);
  const paginatedJobs = mappedJobs.slice(startIdx, endIdx);
  
  return res.status(200).json({
    success: true,
    jobs: paginatedJobs,
    pagination: {
      total: mappedJobs.length,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(mappedJobs.length / parseInt(limit))
    }
  });
});

/**
 * Delete a job
 * DELETE /api/job/:jobId
 */
const deleteJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  
  // Find and remove job from queue
  const jobs = await recipeQueue.getJobs(['completed', 'waiting', 'active', 'delayed', 'failed']);
  const job = jobs.find(j => j.data.jobId === jobId || j.id === jobId);
  
  if (!job) {
    throw new NotFoundError('Job', jobId);
  }
  
  await job.remove();
  
  logger.info('Job deleted', { jobId });
  
  return res.status(200).json({
    success: true,
    message: 'Job deleted successfully',
    jobId
  });
});

/**
 * Get job statistics from queue
 * GET /api/stats
 */
const getStats = asyncHandler(async (req, res) => {
  const [completed, waiting, active, delayed, failed] = await Promise.all([
    recipeQueue.getJobCounts('completed'),
    recipeQueue.getJobCounts('waiting'),
    recipeQueue.getJobCounts('active'),
    recipeQueue.getJobCounts('delayed'),
    recipeQueue.getJobCounts('failed')
  ]);
  
  return res.status(200).json({
    success: true,
    stats: {
      total: completed.completed + waiting.waiting + active.active + delayed.delayed + failed.failed,
      completed: completed.completed,
      queued: waiting.waiting + delayed.delayed,
      generating: active.active,
      failed: failed.failed
    }
  });
});

module.exports = {
  createJob,
  getJobStatus,
  getJobResult,
  listJobs,
  deleteJob,
  getStats
};
