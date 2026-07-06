import mongoose from 'mongoose';

import logger from '../utils/logger.js';

import config from './index.js';

mongoose.set('strictQuery', true);

/**
 * Connects to MongoDB. Call once during server startup.
 * Connection errors are fatal on startup — the process should not
 * serve requests against a database it can't reach.
 */
export async function connectDB() {
  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connection established');
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB connection lost');
  });

  await mongoose.connect(config.mongoUri);
}

/**
 * Gracefully closes the MongoDB connection. Used on process shutdown.
 */
export async function disconnectDB() {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
}

export default mongoose;
