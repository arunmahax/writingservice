/**
 * Request Validation Middleware
 */

const { body, param, validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

/**
 * Validate recipe generation request
 */
const validateRecipeRequest = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Recipe title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  
  body('image1')
    .optional()
    .isURL()
    .withMessage('image1 must be a valid URL'),
  
  body('image2')
    .optional()
    .isURL()
    .withMessage('image2 must be a valid URL'),
  
  body('featuredImage')
    .optional()
    .isURL()
    .withMessage('featuredImage must be a valid URL'),
  
  body('categories')
    .optional()
    .isString()
    .withMessage('categories must be a string'),
  
  body('authors')
    .optional()
    .isString()
    .withMessage('authors must be a string'),
];

/**
 * Validate job ID parameter
 */
const validateJobId = [
  param('jobId')
    .notEmpty()
    .withMessage('Job ID is required')
    .matches(/^job_\d+_[a-z0-9]+$/)
    .withMessage('Invalid job ID format')
];

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value
    }));
    
    throw new ValidationError('Validation failed', formattedErrors);
  }
  
  next();
};

module.exports = {
  validateRecipeRequest,
  validateJobId,
  handleValidationErrors
};
