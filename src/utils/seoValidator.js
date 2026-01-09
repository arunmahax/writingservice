/**
 * SEO Validation utility for recipe content
 */

const { SEO_LIMITS } = require('../config/constants');

/**
 * Validate a single field against SEO limits
 * @param {string} value - The value to validate
 * @param {string} fieldName - The name of the field
 * @returns {Object} - Validation result
 */
const validateField = (value, fieldName) => {
  const limits = SEO_LIMITS[fieldName];
  
  if (!limits) {
    return { valid: true, field: fieldName };
  }
  
  if (!value || typeof value !== 'string') {
    return {
      valid: false,
      field: fieldName,
      error: `${fieldName} is required and must be a string`,
      value: value,
      length: 0,
      limits
    };
  }
  
  const length = value.length;
  const isValid = length >= limits.min && length <= limits.max;
  
  return {
    valid: isValid,
    field: fieldName,
    value: value,
    length,
    limits,
    error: isValid ? null : limits.errorMessage,
    suggestion: isValid ? null : getSuggestion(length, limits)
  };
};

/**
 * Get suggestion for fixing SEO issues
 * @param {number} length - Current length
 * @param {Object} limits - Min/max limits
 * @returns {string} - Suggestion message
 */
const getSuggestion = (length, limits) => {
  if (length < limits.min) {
    return `Add ${limits.min - length} more characters (current: ${length}, min: ${limits.min})`;
  }
  if (length > limits.max) {
    return `Remove ${length - limits.max} characters (current: ${length}, max: ${limits.max})`;
  }
  return null;
};

/**
 * Validate all SEO fields in metadata
 * @param {Object} metadata - The metadata object to validate
 * @returns {Object} - Validation results
 */
const validateMetadata = (metadata) => {
  const results = {
    valid: true,
    fields: {},
    errors: []
  };
  
  // Validate title
  const titleResult = validateField(metadata.title, 'title');
  results.fields.title = titleResult;
  if (!titleResult.valid) {
    results.valid = false;
    results.errors.push(titleResult);
  }
  
  // Validate shortTitle
  const shortTitleResult = validateField(metadata.shortTitle, 'shortTitle');
  results.fields.shortTitle = shortTitleResult;
  if (!shortTitleResult.valid) {
    results.valid = false;
    results.errors.push(shortTitleResult);
  }
  
  // Validate description
  const descriptionResult = validateField(metadata.description, 'description');
  results.fields.description = descriptionResult;
  if (!descriptionResult.valid) {
    results.valid = false;
    results.errors.push(descriptionResult);
  }
  
  return results;
};

/**
 * Check if generated content needs regeneration due to SEO issues
 * @param {Object} metadata - The metadata to check
 * @returns {Object} - Object with needsRegeneration flag and details
 */
const checkNeedsRegeneration = (metadata) => {
  const validation = validateMetadata(metadata);
  
  return {
    needsRegeneration: !validation.valid,
    validation,
    errorSummary: validation.errors.map(e => e.error).join('; ')
  };
};

/**
 * Log validation results
 * @param {Object} validation - Validation results
 * @param {string} sectionName - Name of the section
 */
const logValidation = (validation, sectionName) => {
  const timestamp = new Date().toISOString();
  
  if (validation.valid) {
    console.log(`[${timestamp}] SEO Validation PASSED for ${sectionName}`);
  } else {
    console.log(`[${timestamp}] SEO Validation FAILED for ${sectionName}:`);
    validation.errors.forEach(err => {
      console.log(`  - ${err.field}: ${err.error} (${err.suggestion})`);
    });
  }
};

module.exports = {
  validateField,
  validateMetadata,
  checkNeedsRegeneration,
  logValidation,
  SEO_LIMITS
};
