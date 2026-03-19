/**
 * Simple in-memory job storage for queue-only architecture
 * Jobs are stored in Redis via BullMQ, but we need temporary runtime storage
 * for the generation process
 */

const { JOB_STATUS, SECTION_STATUS } = require('../config/constants');

// In-memory store for jobs being processed
const jobs = new Map();

/**
 * Create or update a job in memory
 */
const createJob = (jobData) => {
  jobs.set(jobData.jobId, {
    ...jobData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  return jobs.get(jobData.jobId);
};

/**
 * Get a job by ID
 */
const getJob = (jobId) => {
  return jobs.get(jobId);
};

/**
 * Update job status
 */
const updateJobStatus = (jobId, status) => {
  const job = jobs.get(jobId);
  if (job) {
    job.status = status;
    job.updatedAt = new Date().toISOString();
  }
};

/**
 * Update job context
 */
const updateContext = (jobId, context) => {
  const job = jobs.get(jobId);
  if (job) {
    job.context = context;
    job.updatedAt = new Date().toISOString();
  }
};

/**
 * Update section status and data
 */
const updateSection = (jobId, sectionKey, status, data = null, error = null) => {
  const job = jobs.get(jobId);
  if (job) {
    job.sections[sectionKey] = {
      status,
      data,
      error,
      timestamp: new Date().toISOString(),
      retries: job.sections[sectionKey]?.retries || 0
    };
    job.updatedAt = new Date().toISOString();
  }
};

/**
 * Add error to job
 */
const addError = (jobId, section, errorMessage) => {
  const job = jobs.get(jobId);
  if (job) {
    if (!job.errorLog) {
      job.errorLog = [];
    }
    job.errorLog.push({
      timestamp: new Date().toISOString(),
      section,
      error: errorMessage
    });
  }
};

/**
 * Set final result
 */
const setResult = (jobId, result) => {
  const job = jobs.get(jobId);
  if (job) {
    job.result = result;
    job.status = JOB_STATUS.COMPLETED;
    job.progress = 100;
    job.updatedAt = new Date().toISOString();
  }
};

/**
 * Mark job as failed
 */
const failJob = (jobId, errorMessage) => {
  const job = jobs.get(jobId);
  if (job) {
    job.status = JOB_STATUS.FAILED;
    addError(jobId, 'general', errorMessage);
    job.updatedAt = new Date().toISOString();
  }
};

/**
 * Delete job from memory (after completion)
 */
const deleteJob = (jobId) => {
  jobs.delete(jobId);
};

/**
 * Get final job state for return
 */
const getFinalJobState = (jobId) => {
  const job = jobs.get(jobId);
  if (!job) return null;
  
  // Return job state and clean up
  const jobState = { ...job };
  jobs.delete(jobId); // Clean up from memory
  return jobState;
};

module.exports = {
  createJob,
  getJob,
  updateJobStatus,
  updateContext,
  updateSection,
  addError,
  setResult,
  failJob,
  deleteJob,
  getFinalJobState
};
