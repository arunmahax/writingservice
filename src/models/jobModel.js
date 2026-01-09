/**
 * Job Model - In-memory job storage and management
 */

const { JOB_STATUS, SECTION_STATUS, SECTIONS, SECTION_ORDER } = require('../config/constants');

// In-memory storage for jobs
const jobStore = new Map();

/**
 * Generate a unique job ID
 * @returns {string} - Unique job ID
 */
const generateJobId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `job_${timestamp}_${random}`;
};

/**
 * Create a new job
 * @param {Object} input - Input data for the job
 * @returns {Object} - The created job
 */
const createJob = (input) => {
  const jobId = generateJobId();
  const now = new Date().toISOString();
  
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
  
  const job = {
    jobId,
    status: JOB_STATUS.PENDING,
    progress: 0,
    currentSection: null,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
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
    errors: []
  };
  
  jobStore.set(jobId, job);
  return job;
};

/**
 * Get a job by ID
 * @param {string} jobId - The job ID
 * @returns {Object|null} - The job or null if not found
 */
const getJob = (jobId) => {
  return jobStore.get(jobId) || null;
};

/**
 * Update job status
 * @param {string} jobId - The job ID
 * @param {string} status - New status
 * @param {Object} updates - Additional updates
 * @returns {Object|null} - Updated job or null
 */
const updateJobStatus = (jobId, status, updates = {}) => {
  const job = jobStore.get(jobId);
  if (!job) return null;
  
  job.status = status;
  job.updatedAt = new Date().toISOString();
  
  Object.assign(job, updates);
  
  jobStore.set(jobId, job);
  return job;
};

/**
 * Update a section's status and data
 * @param {string} jobId - The job ID
 * @param {string} sectionKey - The section key
 * @param {string} status - Section status
 * @param {any} data - Section data
 * @param {string} error - Error message if failed
 * @returns {Object|null} - Updated job or null
 */
const updateSection = (jobId, sectionKey, status, data = null, error = null) => {
  const job = jobStore.get(jobId);
  if (!job || !job.sections[sectionKey]) return null;
  
  const section = job.sections[sectionKey];
  section.status = status;
  section.timestamp = new Date().toISOString();
  
  if (data !== null) {
    section.data = data;
  }
  
  if (error) {
    section.error = error;
    section.retries = (section.retries || 0) + 1;
  }
  
  // Update current section
  if (status === SECTION_STATUS.GENERATING) {
    job.currentSection = SECTIONS[sectionKey].name;
  }
  
  // Calculate progress
  job.progress = calculateProgress(job);
  job.updatedAt = new Date().toISOString();
  
  jobStore.set(jobId, job);
  return job;
};

/**
 * Calculate job progress based on completed sections
 * @param {Object} job - The job object
 * @returns {number} - Progress percentage
 */
const calculateProgress = (job) => {
  const totalSections = SECTION_ORDER.length;
  let completedWeight = 0;
  let totalWeight = 0;
  
  SECTION_ORDER.forEach(sectionKey => {
    const sectionConfig = SECTIONS[sectionKey];
    totalWeight += sectionConfig.weight;
    
    if (job.sections[sectionKey].status === SECTION_STATUS.COMPLETED) {
      completedWeight += sectionConfig.weight;
    } else if (job.sections[sectionKey].status === SECTION_STATUS.GENERATING) {
      completedWeight += sectionConfig.weight * 0.5; // Half credit for in-progress
    }
  });
  
  return Math.round((completedWeight / totalWeight) * 100);
};

/**
 * Update job context
 * @param {string} jobId - The job ID
 * @param {Object} context - New context data
 * @returns {Object|null} - Updated job or null
 */
const updateContext = (jobId, context) => {
  const job = jobStore.get(jobId);
  if (!job) return null;
  
  job.context = context;
  job.updatedAt = new Date().toISOString();
  
  jobStore.set(jobId, job);
  return job;
};

/**
 * Set final result for a job
 * @param {string} jobId - The job ID
 * @param {Object} result - The final assembled result
 * @returns {Object|null} - Updated job or null
 */
const setResult = (jobId, result) => {
  const job = jobStore.get(jobId);
  if (!job) return null;
  
  job.result = result;
  job.status = JOB_STATUS.COMPLETED;
  job.progress = 100;
  job.completedAt = new Date().toISOString();
  job.updatedAt = job.completedAt;
  
  jobStore.set(jobId, job);
  return job;
};

/**
 * Mark job as failed
 * @param {string} jobId - The job ID
 * @param {string} error - Error message
 * @returns {Object|null} - Updated job or null
 */
const failJob = (jobId, error) => {
  const job = jobStore.get(jobId);
  if (!job) return null;
  
  job.status = JOB_STATUS.FAILED;
  job.errors.push({
    message: error,
    timestamp: new Date().toISOString()
  });
  job.updatedAt = new Date().toISOString();
  
  jobStore.set(jobId, job);
  return job;
};

/**
 * Add error to job
 * @param {string} jobId - The job ID
 * @param {string} sectionKey - The section that errored
 * @param {string} error - Error message
 * @returns {Object|null} - Updated job or null
 */
const addError = (jobId, sectionKey, error) => {
  const job = jobStore.get(jobId);
  if (!job) return null;
  
  job.errors.push({
    section: sectionKey,
    message: error,
    timestamp: new Date().toISOString()
  });
  job.updatedAt = new Date().toISOString();
  
  jobStore.set(jobId, job);
  return job;
};

/**
 * Get job status summary for API response
 * @param {string} jobId - The job ID
 * @returns {Object|null} - Job status summary or null
 */
const getJobStatus = (jobId) => {
  const job = jobStore.get(jobId);
  if (!job) return null;
  
  // Create sections summary
  const sectionsSummary = {};
  SECTION_ORDER.forEach(sectionKey => {
    const section = job.sections[sectionKey];
    sectionsSummary[sectionKey] = {
      status: section.status,
      timestamp: section.timestamp,
      retries: section.retries
    };
  });
  
  return {
    jobId: job.jobId,
    status: job.status,
    progress: job.progress,
    currentSection: job.currentSection,
    sections: sectionsSummary,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    completedAt: job.completedAt,
    errorCount: job.errors.length
  };
};

/**
 * Get all jobs (for debugging)
 * @returns {Array} - Array of all jobs
 */
const getAllJobs = () => {
  return Array.from(jobStore.values());
};

/**
 * Delete a job
 * @param {string} jobId - The job ID
 * @returns {boolean} - Whether deletion was successful
 */
const deleteJob = (jobId) => {
  return jobStore.delete(jobId);
};

/**
 * Validate input for job creation
 * @param {Object} input - Input to validate
 * @returns {Object} - Validation result
 */
const validateInput = (input) => {
  const errors = [];
  
  if (!input.title || typeof input.title !== 'string' || input.title.trim().length === 0) {
    errors.push('title is required and must be a non-empty string');
  }
  
  if (input.image1 && typeof input.image1 !== 'string') {
    errors.push('image1 must be a string URL');
  }
  
  if (input.image2 && typeof input.image2 !== 'string') {
    errors.push('image2 must be a string URL');
  }
  
  if (input.featuredImage && typeof input.featuredImage !== 'string') {
    errors.push('featuredImage must be a string URL');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

module.exports = {
  createJob,
  getJob,
  updateJobStatus,
  updateSection,
  updateContext,
  setResult,
  failJob,
  addError,
  getJobStatus,
  getAllJobs,
  deleteJob,
  validateInput,
  generateJobId
};
