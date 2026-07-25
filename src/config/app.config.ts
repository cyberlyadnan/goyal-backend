import env from './env.config.js';

export const appConfig = {
  name: 'Goyal Wholesale API',
  version: '1.0.0',
  env: env.NODE_ENV,
  port: env.PORT,
  corsOrigin: env.CORS_ORIGIN,
  rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
  rateLimitMax: env.RATE_LIMIT_MAX,
  requestBodyLimit: env.REQUEST_BODY_LIMIT,
  logLevel: env.LOG_LEVEL,
  apiPrefix: '/api/v1',
} as const;

export default appConfig;
