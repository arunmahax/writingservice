/**
 * Recipe Article Generator - Production Server
 * v2.0.0 - Scalable Architecture with Queue and Error Handling (Queue-Only, No Database)
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Configuration
const { logger } = require('./config/logger');
const { closeQueue, cleanQueue } = require('./config/queue');
const { initializeGemini, isInitialized } = require('./services/geminiService');

// Controllers
const jobController = require('./controllers/jobController.v2');
const healthController = require('./controllers/healthController');

// Middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { 
  validateRecipeRequest, 
  validateJobId, 
  handleValidationErrors 
} = require('./middleware/validation');
const { apiKeyAuth } = require('./middleware/apiKeyAuth');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3090;

// ============================================
// SECURITY & MIDDLEWARE
// ============================================

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // 100 requests per window
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// API key authentication
app.use('/api/', apiKeyAuth);

// Stricter rate limit for job creation
const createJobLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.CREATE_JOB_LIMIT) || 10, // 10 jobs per 15 minutes
  message: 'Too many job creation requests, please try again later',
  skipSuccessfulRequests: false
});

// ============================================
// ROUTES
// ============================================

/**
 * Health & Monitoring Endpoints
 */
app.get('/health', healthController.healthCheck);
app.get('/health/detailed', healthController.detailedHealthCheck);
app.get('/health/queue', healthController.queueHealth);
app.get('/health/database', healthController.databaseHealth);
app.get('/ready', healthController.readinessProbe);
app.get('/alive', healthController.livenessProbe);

/**
 * API Info
 */
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Recipe Article Generator API',
    version: '2.0.0',
    description: 'Scalable recipe article generation with OpenRouter AI (Claude Sonnet)',
    architecture: {
      queue: 'BullMQ with Redis (Queue-Only Storage)',
      database: 'None (Jobs stored in Redis via BullMQ)',
      ai: 'OpenRouter (Claude Sonnet)',
      logging: 'Winston'
    },
    endpoints: {
      health: 'GET /health',
      healthDetailed: 'GET /health/detailed',
      createJob: 'POST /api/generate-recipe',
      jobStatus: 'GET /api/job-status/:jobId',
      jobResult: 'GET /api/job-result/:jobId',
      listJobs: 'GET /api/jobs',
      stats: 'GET /api/stats',
      deleteJob: 'DELETE /api/job/:jobId'
    },
    documentation: {
      createJob: {
        method: 'POST',
        path: '/api/generate-recipe',
        body: {
          title: 'string (required, 5-200 chars)',
          image1: 'string (optional URL)',
          image2: 'string (optional URL)',
          featuredImage: 'string (optional URL)',
          categories: 'string (optional)',
          authors: 'string (optional)'
        },
        rateLimit: `${process.env.CREATE_JOB_LIMIT || 10} requests per 15 minutes`
      }
    }
  });
});

/**
 * Job Management Endpoints
 */
app.post(
  '/api/generate-recipe',
  createJobLimiter,
  validateRecipeRequest,
  handleValidationErrors,
  jobController.createJob
);

app.get(
  '/api/job-status/:jobId',
  validateJobId,
  handleValidationErrors,
  jobController.getJobStatus
);

app.get(
  '/api/job-result/:jobId',
  validateJobId,
  handleValidationErrors,
  jobController.getJobResult
);

app.get('/api/jobs', jobController.listJobs);

app.get('/api/stats', jobController.getStats);

app.delete(
  '/api/job/:jobId',
  validateJobId,
  handleValidationErrors,
  jobController.deleteJob
);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// ============================================
// SERVER INITIALIZATION
// ============================================

const startServer = async () => {
  try {
    // Initialize AI (OpenRouter)
    logger.info('Initializing OpenRouter AI...');
    const geminiInit = initializeGemini();
    if (!geminiInit) {
      logger.warn('⚠️  AI not initialized. Check OPENROUTER_API_KEY in .env');
    }
    
    // Clean old queue jobs periodically (every hour)
    setInterval(async () => {
      try {
        await cleanQueue();
      } catch (error) {
        logger.error('Error cleaning queue:', error);
      }
    }, 3600000); // 1 hour
    
    // Start Express server
    const server = app.listen(PORT, () => {
      logger.info('='.repeat(50));
      logger.info('🍳 Recipe Article Generator API v2.0.0');
      logger.info('='.repeat(50));
      logger.info(`📡 Server running on port ${PORT}`);
      logger.info(`🔗 http://localhost:${PORT}`);
      logger.info(`💚 Health check: http://localhost:${PORT}/health`);
      logger.info(`📊 Detailed health: http://localhost:${PORT}/health/detailed`);
      logger.info('='.repeat(50));
      logger.info('🏗️  Architecture:');
      logger.info(`   • Storage: Redis (Queue-Only) ✅`);
      logger.info(`   • Queue: BullMQ (Check /health/queue)`);
      logger.info(`   • AI: OpenRouter Claude Sonnet (${isInitialized() ? '✅' : '❌'})`);
      logger.info(`   • Logging: Winston`);
      logger.info('='.repeat(50));
      logger.info('📋 Available Endpoints:');
      logger.info(`   POST   /api/generate-recipe (Rate limit: ${process.env.CREATE_JOB_LIMIT || 10}/15min)`);
      logger.info(`   GET    /api/job-status/:jobId`);
      logger.info(`   GET    /api/job-result/:jobId`);
      logger.info(`   GET    /api/jobs`);
      logger.info(`   GET    /api/stats`);
      logger.info(`   DELETE /api/job/:jobId`);
      logger.info('='.repeat(50));
      logger.info('');
      
      if (!isInitialized()) {
        logger.warn('⚠️  Warning: AI not initialized.');
        logger.warn('   Please set OPENROUTER_API_KEY in your .env file.');
      }
    });
    
    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
      // Stop accepting new connections
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          // Close queue connections
          logger.info('Closing queue connections...');
          await closeQueue();
          
          logger.info('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });
      
      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forceful shutdown after timeout');
        process.exit(1);
      }, 30000);
    };
    
    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;
