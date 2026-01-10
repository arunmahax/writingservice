/**
 * Global Error Handler Middleware
 */

const { logger } = require('../config/logger');
const { AppError } = require('../utils/errors');

/**
 * Error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error('Error occurred', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    statusCode: err.statusCode || 500
  });

  // Default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    if (err.errors && typeof err.errors === 'object') {
      // Mongoose validation errors
      errors = Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message
      }));
      message = 'Validation failed';
    }
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value entered';
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Don't send stack trace in production
  const response = {
    success: false,
    error: {
      message,
      statusCode,
      ...(errors.length > 0 && { errors }),
      ...(process.env.NODE_ENV === 'development' && { 
        stack: err.stack,
        originalError: err.originalError
      })
    }
  };

  // Send specific retry-after header for rate limit errors
  if (err.name === 'RateLimitError' && err.retryAfter) {
    res.setHeader('Retry-After', err.retryAfter);
  }

  res.status(statusCode).json(response);
};

/**
 * Handle 404 errors
 */
const notFound = (req, res, next) => {
  const error = new AppError(`Not found: ${req.originalUrl}`, 404);
  next(error);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler
};
