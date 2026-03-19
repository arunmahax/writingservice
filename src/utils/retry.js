/**
 * Retry utility with configurable attempts and delay
 */

const { RETRY_CONFIG, ERROR_TYPES } = require('../config/constants');

/**
 * Sleep utility function
 * @param {number} ms - Milliseconds to sleep
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Determines if an error is retryable
 * @param {Error} error - The error to check
 * @returns {boolean} - Whether the error is retryable
 */
const isRetryableError = (error) => {
  // Don't retry on invalid API key or malformed requests
  if (error.message?.includes('API key') || error.status === 401) {
    return false;
  }
  if (error.message?.includes('malformed') || error.status === 400) {
    return false;
  }
  
  // Retry on network errors, timeouts, rate limits
  if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
    return true;
  }
  if (error.status === 429 || error.status === 503 || error.status === 500) {
    return true;
  }
  if (error.message?.includes('timeout') || error.message?.includes('rate limit')) {
    return true;
  }
  
  // Default to retrying
  return true;
};

/**
 * Execute a function with retry logic
 * @param {Function} fn - The async function to execute
 * @param {Object} options - Retry options
 * @param {string} options.sectionName - Name of the section being generated
 * @param {Function} options.onRetry - Callback for each retry attempt
 * @returns {Promise<any>} - The result of the function
 */
const withRetry = async (fn, options = {}) => {
  const {
    maxRetries = RETRY_CONFIG.maxRetries,
    retryDelay = RETRY_CONFIG.retryDelay,
    sectionName = 'unknown',
    onRetry = null
  } = options;
  
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      return {
        success: true,
        data: result,
        attempts: attempt
      };
    } catch (error) {
      lastError = error;
      
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] Retry attempt ${attempt}/${maxRetries} for section "${sectionName}": ${error.message}`);
      
      // Call onRetry callback if provided
      if (onRetry) {
        onRetry({
          attempt,
          maxRetries,
          error,
          sectionName,
          timestamp
        });
      }
      
      // Check if we should retry
      if (!isRetryableError(error)) {
        console.log(`[${timestamp}] Non-retryable error for section "${sectionName}": ${error.message}`);
        throw {
          type: ERROR_TYPES.FATAL_ERROR,
          message: error.message,
          attempts: attempt,
          retryable: false
        };
      }
      
      // Don't wait after the last attempt
      if (attempt < maxRetries) {
        console.log(`[${timestamp}] Waiting ${retryDelay}ms before retry...`);
        await sleep(retryDelay);
      }
    }
  }
  
  // All retries exhausted
  console.log(`[${new Date().toISOString()}] All ${maxRetries} retries exhausted for section "${sectionName}"`);
  throw {
    type: ERROR_TYPES.FATAL_ERROR,
    message: `Failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`,
    attempts: maxRetries,
    lastError
  };
};

/**
 * Execute with timeout
 * @param {Function} fn - The async function to execute
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<any>} - The result of the function
 */
const withTimeout = async (fn, timeout = RETRY_CONFIG.requestTimeout) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const result = await fn(controller.signal);
    return result;
  } catch (error) {
    if (controller.signal.aborted) {
      throw { type: ERROR_TYPES.TIMEOUT_ERROR, message: `Operation timed out after ${timeout}ms` };
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
};

module.exports = {
  withRetry,
  withTimeout,
  sleep,
  isRetryableError
};
