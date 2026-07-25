import env from './env.config.js';

export const dbConfig = {
  uri: env.MONGODB_URI,
  options: {
    maxPoolSize: 20,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
  },
} as const;

export default dbConfig;
