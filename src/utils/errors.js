/**
 * Custom Error Classes for Better Error Handling
 */

class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

class NotFoundError extends AppError {
  constructor(resource, identifier) {
    super(`${resource} not found: ${identifier}`, 404);
    this.name = 'NotFoundError';
    this.resource = resource;
    this.identifier = identifier;
  }
}

class ExternalAPIError extends AppError {
  constructor(service, message, originalError = null) {
    super(`${service} API error: ${message}`, 503);
    this.name = 'ExternalAPIError';
    this.service = service;
    this.originalError = originalError;
  }
}

class RateLimitError extends AppError {
  constructor(retryAfter = 60) {
    super('Too many requests, please try again later', 429);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

class DatabaseError extends AppError {
  constructor(message, originalError = null) {
    super(`Database error: ${message}`, 500, false);
    this.name = 'DatabaseError';
    this.originalError = originalError;
  }
}

class QueueError extends AppError {
  constructor(message, originalError = null) {
    super(`Queue error: ${message}`, 500, false);
    this.name = 'QueueError';
    this.originalError = originalError;
  }
}

class JobProcessingError extends AppError {
  constructor(jobId, section, message) {
    super(`Job processing error in ${section}: ${message}`, 500);
    this.name = 'JobProcessingError';
    this.jobId = jobId;
    this.section = section;
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  ExternalAPIError,
  RateLimitError,
  DatabaseError,
  QueueError,
  JobProcessingError
};
