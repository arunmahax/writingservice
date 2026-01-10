/**
 * Updated Job Controller - With Queue Integration
 */

const Job = require('../models/jobSchema');
const { addJob } = require('../config/queue');
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
  
  // Create job in database
  const job = await Job.create({
    jobId,
    status: JOB_STATUS.PENDING,
    progress: 0,
    currentSection: null,
    input: {
      title: input.title,
      image1: input.image1,
      image2: input.image2,
      featuredImage: input.featuredImage,
      categories: input.categories,
      authors: input.authors
    },
    sections,
    context: {},
    result: null,
    errors: [],
    metadata: {
      attemptNumber: 1,
      queuedAt: new Date()
    }
  });
  
  logger.info('Job created in database', { jobId, title: input.title });
  
  // Add job to queue
  await addJob(jobId, { jobId, input }, {
    priority: input.priority || 10
  });
  
  // Update job status to queued
  job.status = JOB_STATUS.QUEUED;
  await job.save();
  
  logger.info('Job queued for processing', { jobId });
  
  return res.status(201).json({
    success: true,
    jobId: job.jobId,
    status: job.status,
    message: 'Job created and queued for processing',
    statusUrl: `/api/job-status/${job.jobId}`,
    resultUrl: `/api/job-result/${job.jobId}`
  });
});

/**
 * Get job status
 * GET /api/job-status/:jobId
 */
const getJobStatus = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  
  const job = await Job.findOne({ jobId });
  
  if (!job) {
    throw new NotFoundError('Job', jobId);
  }
  
  // Calculate progress based on completed sections
  const completedSections = Object.values(job.sections.toObject()).filter(
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
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      sections: Object.fromEntries(
        Object.entries(job.sections.toObject()).map(([key, value]) => [
          key,
          { status: value.status, timestamp: value.timestamp }
        ])
      ),
      errors: job.errors,
      metadata: job.metadata
    }
  });
});

/**
 * Get job result
 * GET /api/job-result/:jobId
 */
const getJobResult = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  
  const job = await Job.findOne({ jobId });
  
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
      errors: job.errors,
      lastError: job.metadata.lastError
    });
  }
  
  // Job completed successfully
  return res.status(200).json({
    success: true,
    jobId: job.jobId,
    status: job.status,
    result: job.result,
    processingTime: job.metadata.processingTime,
    completedAt: job.metadata.completedAt
  });
});

/**
 * List all jobs (paginated)
 * GET /api/jobs
 */
const listJobs = asyncHandler(async (req, res) => {
  const { status, limit = 50, page = 1 } = req.query;
  
  const query = status ? { status } : {};
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [jobs, total] = await Promise.all([
    Job.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-result -context -sections'),
    Job.countDocuments(query)
  ]);
  
  return res.status(200).json({
    success: true,
    jobs,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

/**
 * Delete a job
 * DELETE /api/job/:jobId
 */
const deleteJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  
  const job = await Job.findOne({ jobId });
  
  if (!job) {
    throw new NotFoundError('Job', jobId);
  }
  
  await job.deleteOne();
  
  logger.info('Job deleted', { jobId });
  
  return res.status(200).json({
    success: true,
    message: 'Job deleted successfully',
    jobId
  });
});

/**
 * Get job statistics
 * GET /api/stats
 */
const getStats = asyncHandler(async (req, res) => {
  const stats = await Job.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const statusCounts = stats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {});
  
  const totalJobs = stats.reduce((sum, stat) => sum + stat.count, 0);
  
  return res.status(200).json({
    success: true,
    stats: {
      total: totalJobs,
      ...statusCounts
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
