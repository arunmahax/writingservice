/**
 * Recipe Article Generator - Express Server
 * 
 * A comprehensive API for generating SEO-optimized recipe articles
 * using OpenRouter AI (Claude Sonnet) with retry logic and progress tracking.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { initializeGemini, isInitialized } = require('./services/geminiService');
const jobController = require('./controllers/jobController');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3090;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Initialize AI (OpenRouter)
initializeGemini();

// ============================================
// ROUTES
// ============================================

/**
 * Health Check
 * GET /health
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    geminiInitialized: isInitialized(),
    version: '1.0.0',
    ai: 'OpenRouter (Claude Sonnet)'
  });
});

/**
 * API Info
 * GET /
 */
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Recipe Article Generator API',
    version: '1.0.0',
    description: 'Generate SEO-optimized recipe articles using OpenRouter AI (Claude Sonnet)',
    endpoints: {
      health: 'GET /health',
      createJob: 'POST /api/generate-recipe OR POST /api/recipe/generate',
      jobStatus: 'GET /api/job-status/:jobId',
      jobResult: 'GET /api/job-result/:jobId',
      listJobs: 'GET /api/jobs',
      deleteJob: 'DELETE /api/job/:jobId'
    },
    documentation: {
      createJob: {
        method: 'POST',
        path: '/api/generate-recipe OR /api/recipe/generate',
        body: {
          title: 'string (required)',
          image1: 'string (optional)',
          image2: 'string (optional)',
          featuredImage: 'string (optional)',
          categories: 'string (optional) - format: "Name (id)"',
          authors: 'string (optional) - format: "Name (id)"'
        }
      }
    }
  });
});

/**
 * Create Recipe Generation Job
 * POST /api/generate-recipe
 * POST /api/recipe/generate (alias)
 */
app.post('/api/generate-recipe', jobController.createJob);
app.post('/api/recipe/generate', jobController.createJob);

/**
 * Get Job Status
 * GET /api/job-status/:jobId
 */
app.get('/api/job-status/:jobId', jobController.getJobStatus);

/**
 * Get Job Result
 * GET /api/job-result/:jobId
 */
app.get('/api/job-result/:jobId', jobController.getJobResult);

/**
 * List All Jobs (Debug)
 * GET /api/jobs
 */
app.get('/api/jobs', jobController.listJobs);

/**
 * Delete Job
 * DELETE /api/job/:jobId
 */
app.delete('/api/job/:jobId', jobController.deleteJob);

// ============================================
// ERROR HANDLING
// ============================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    availableEndpoints: {
      health: 'GET /health',
      createJob: 'POST /api/generate-recipe OR POST /api/recipe/generate',
      jobStatus: 'GET /api/job-status/:jobId',
      jobResult: 'GET /api/job-result/:jobId'
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// SERVER STARTUP
// ============================================

app.listen(PORT, () => {
  console.log('\n====================================');
  console.log('🍳 Recipe Article Generator API');
  console.log('====================================');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log('====================================');
  console.log('📋 Available Endpoints:');
  console.log(`   POST   /api/generate-recipe`);
  console.log(`   POST   /api/recipe/generate (alias)`);
  console.log(`   GET    /api/job-status/:jobId`);
  console.log(`   GET    /api/job-result/:jobId`);
  console.log(`   GET    /api/jobs`);
  console.log(`   DELETE /api/job/:jobId`);
  console.log('====================================\n');
  
  if (!isInitialized()) {
    console.log('⚠️  Warning: AI not initialized.');
    console.log('   Please set OPENROUTER_API_KEY in your .env file.\n');
  }
});

module.exports = app;
