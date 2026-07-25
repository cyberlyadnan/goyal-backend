import env from './env.config.js';

export const jwtConfig = {
  secret: env.JWT_SECRET,
  expire: env.JWT_EXPIRE,
  refreshSecret: env.JWT_REFRESH_SECRET,
  refreshExpire: env.JWT_REFRESH_EXPIRE,
  issuer: 'goyal-wholesale',
  audience: 'goyal-wholesale-clients',
} as const;

export default jwtConfig;
