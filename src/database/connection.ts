import mongoose from 'mongoose';
import { dbConfig } from '../config/index.js';
import { logger } from '../utils/logger.js';

let isConnected = false;

export const connectDatabase = async (): Promise<typeof mongoose> => {
  if (isConnected) {
    return mongoose;
  }

  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => {
    isConnected = true;
    logger.info('MongoDB connected');
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    logger.warn('MongoDB disconnected');
  });

  await mongoose.connect(dbConfig.uri, dbConfig.options);
  return mongoose;
};

export const disconnectDatabase = async (): Promise<void> => {
  if (!isConnected && mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.connection.close();
  isConnected = false;
  logger.info('MongoDB connection closed');
};

export default { connectDatabase, disconnectDatabase };
