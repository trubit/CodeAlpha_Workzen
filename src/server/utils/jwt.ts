import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { ENV } from '../config/env.js';
import { AuthenticatedUserPayload } from '../middleware/auth.js';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const generateTokens = (payload: AuthenticatedUserPayload): TokenPair => {
  const accessSignOptions: SignOptions = {
    expiresIn: (ENV.JWT_ACCESS_EXPIRES_IN || '15m') as any,
    jwtid: crypto.randomUUID()
  };

  const refreshSignOptions: SignOptions = {
    expiresIn: (ENV.JWT_REFRESH_EXPIRES_IN || '7d') as any,
    jwtid: crypto.randomUUID()
  };

  const accessToken = jwt.sign(payload, ENV.JWT_ACCESS_SECRET, accessSignOptions);
  const refreshToken = jwt.sign(
    { userId: payload.userId },
    ENV.JWT_REFRESH_SECRET,
    refreshSignOptions
  );

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): AuthenticatedUserPayload => {
  return jwt.verify(token, ENV.JWT_ACCESS_SECRET) as AuthenticatedUserPayload;
};

export const verifyRefreshToken = (token: string): { userId: string } => {
  return jwt.verify(token, ENV.JWT_REFRESH_SECRET) as { userId: string };
};

