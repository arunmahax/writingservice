/**
 * Database Configuration - MongoDB Connection
 */

const mongoose = require('mongoose');
const { logger } = require('./logger');

let isConnected = false;

/**
 * Connect to MongoDB
 */
const connectDatabase = async () => {
  if (isConnected) {
    logger.info('Using existing database connection');
    return;
  }

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe-generator';

  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    logger.info('✅ MongoDB connected successfully', { uri: mongoUri.replace(/\/\/.*@/, '//***@') });

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
      isConnected = true;
    });

  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error);
    throw error;
  }
};

/**
 * Disconnect from MongoDB gracefully
 */
const disconnectDatabase = async () => {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.connection.close();
    isConnected = false;
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.error('Error closing MongoDB connection:', error);
    throw error;
  }
};

/**
 * Check if database is connected
 */
const isDatabaseConnected = () => {
  return isConnected && mongoose.connection.readyState === 1;
};

module.exports = {
  connectDatabase,
  disconnectDatabase,
  isDatabaseConnected
};
