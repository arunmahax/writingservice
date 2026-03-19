/**
 * API Key Authentication Middleware
 */

const { logger } = require('../config/logger');

const apiKeyAuth = (req, res, next) => {
  const apiKey = process.env.API_KEY;

  // Skip auth if no API_KEY is configured (local development)
  if (!apiKey) {
    return next();
  }

  const providedKey = req.headers['x-api-key'];

  if (!providedKey) {
    logger.warn('Missing API key', { ip: req.ip, path: req.path });
    return res.status(401).json({
      success: false,
      error: { message: 'Missing API key. Provide it via x-api-key header.' }
    });
  }

  if (providedKey !== apiKey) {
    logger.warn('Invalid API key', { ip: req.ip, path: req.path });
    return res.status(403).json({
      success: false,
      error: { message: 'Invalid API key.' }
    });
  }

  next();
};

module.exports = { apiKeyAuth };
