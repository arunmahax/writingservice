/**
 * Job Controller - Handles job creation, status, and result endpoints
 */

const jobModel = require('../models/jobModel');
const { startGeneration } = require('./generatorController');
const { JOB_STATUS } = require('../config/constants');

/**
 * Create a new recipe generation job
 * POST /api/generate-recipe
 */
const createJob = async (req, res) => {
  try {
    const input = req.body;
    
    // Validate input
    const validation = jobModel.validateInput(input);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        details: validation.errors
      });
    }
    
    // Create job
    const job = jobModel.createJob(input);
    
    console.log(`📋 Job created: ${job.jobId} for "${input.title}"`);
    
    // Start generation process asynchronously
    startGeneration(job.jobId).catch(err => {
      console.error(`❌ Generation failed for job ${job.jobId}:`, err.message);
    });
    
    // Return immediately with job ID
    return res.status(200).json({
      success: true,
      jobId: job.jobId,
      message: 'Recipe generation started',
      statusUrl: `/api/job-status/${job.jobId}`,
      resultUrl: `/api/job-result/${job.jobId}`
    });
    
  } catch (error) {
    console.error('Error creating job:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create job',
      details: error.message
    });
  }
};

/**
 * Get job status
 * GET /api/job-status/:jobId
 */
const getJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const status = jobModel.getJobStatus(jobId);
    
    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'Job not found',
        jobId
      });
    }
    
    return res.status(200).json({
      success: true,
      ...status
    });
    
  } catch (error) {
    console.error('Error getting job status:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get job status',
      details: error.message
    });
  }
};

/**
 * Get job result
 * GET /api/job-result/:jobId
 */
const getJobResult = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = jobModel.getJob(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found',
        jobId
      });
    }
    
    // Check if job is still processing
    if (job.status === JOB_STATUS.PENDING || job.status === JOB_STATUS.GENERATING) {
      return res.status(202).json({
        success: true,
        jobId: job.jobId,
        status: job.status,
        progress: job.progress,
        currentSection: job.currentSection,
        message: 'Job is still processing. Please check back later.',
        statusUrl: `/api/job-status/${jobId}`
      });
    }
    
    // Check if job failed
    if (job.status === JOB_STATUS.FAILED) {
      return res.status(500).json({
        success: false,
        jobId: job.jobId,
        status: job.status,
        error: 'Recipe generation failed',
        errors: job.errors
      });
    }
    
    // Return completed result
    return res.status(200).json({
      success: true,
      jobId: job.jobId,
      status: job.status,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      completedAt: job.completedAt,
      result: job.result
    });
    
  } catch (error) {
    console.error('Error getting job result:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get job result',
      details: error.message
    });
  }
};

/**
 * List all jobs (for debugging)
 * GET /api/jobs
 */
const listJobs = async (req, res) => {
  try {
    const jobs = jobModel.getAllJobs();
    
    const summary = jobs.map(job => ({
      jobId: job.jobId,
      title: job.input.title,
      status: job.status,
      progress: job.progress,
      createdAt: job.createdAt,
      completedAt: job.completedAt
    }));
    
    return res.status(200).json({
      success: true,
      count: summary.length,
      jobs: summary
    });
    
  } catch (error) {
    console.error('Error listing jobs:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to list jobs',
      details: error.message
    });
  }
};

/**
 * Delete a job
 * DELETE /api/job/:jobId
 */
const deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const deleted = jobModel.deleteJob(jobId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Job not found',
        jobId
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Job deleted successfully',
      jobId
    });
    
  } catch (error) {
    console.error('Error deleting job:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete job',
      details: error.message
    });
  }
};

module.exports = {
  createJob,
  getJobStatus,
  getJobResult,
  listJobs,
  deleteJob
};
