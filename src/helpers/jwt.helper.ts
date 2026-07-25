import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/index.js';
import type { TokenPayload, UserRole } from '../types/index.js';
import { ApiError } from '../utils/ApiError.js';
import { MESSAGES } from '../constants/index.js';

export interface SignTokenInput {
  id: string;
  role: UserRole;
}

export const signAccessToken = (payload: SignTokenInput): string => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expire as jwt.SignOptions['expiresIn'],
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
  });
};

export const signRefreshToken = (payload: SignTokenInput): string => {
  return jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpire as jwt.SignOptions['expiresIn'],
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, jwtConfig.secret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    }) as TokenPayload;
  } catch {
    throw ApiError.unauthorized(MESSAGES.TOKEN_INVALID);
  }
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, jwtConfig.refreshSecret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    }) as TokenPayload;
  } catch {
    throw ApiError.unauthorized(MESSAGES.TOKEN_INVALID);
  }
};
