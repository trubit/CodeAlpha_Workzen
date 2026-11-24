import { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env.js';
import { ResponseEnvelope } from '../../shared/types/index.js';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const memoryStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryStore.entries()) {
    if (now > entry.resetTime) {
      memoryStore.delete(key);
    }
  }
}, 300000);
if (cleanupTimer && typeof cleanupTimer.unref === 'function') {
  cleanupTimer.unref();
}

export interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}

export const createRateLimiter = (options: RateLimitOptions = {}) => {
  const windowMs = options.windowMs || ENV.RATE_LIMIT_WINDOW_MS;
  const max = options.max || ENV.RATE_LIMIT_MAX_REQUESTS;
  const message = options.message || 'Too many requests. Please try again later.';

  return (req: Request, res: Response<ResponseEnvelope>, next: NextFunction): void => {
    // In test environment, skip rate limiting
    if (ENV.NODE_ENV === 'test') {
      next();
      return;
    }

    const isDev = ENV.NODE_ENV === 'development';
    const effectiveMax = isDev ? Math.max(max, 10000) : max;

    const key = options.keyGenerator
      ? options.keyGenerator(req)
      : req.ip || req.socket.remoteAddress || 'unknown-client';

    const now = Date.now();
    let entry = memoryStore.get(key);

    if (!entry || now > entry.resetTime) {
      entry = {
        count: 1,
        resetTime: now + windowMs
      };
      memoryStore.set(key, entry);
    } else {
      entry.count += 1;
    }

    const remaining = Math.max(0, effectiveMax - entry.count);
    const resetSeconds = Math.ceil((entry.resetTime - now) / 1000);

    res.setHeader('RateLimit-Limit', effectiveMax.toString());
    res.setHeader('RateLimit-Remaining', remaining.toString());
    res.setHeader('RateLimit-Reset', resetSeconds.toString());

    if (entry.count > effectiveMax) {
      res.setHeader('Retry-After', resetSeconds.toString());
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message,
          details: {
            retryAfterSeconds: resetSeconds
          }
        }
      });
      return;
    }

    next();
  };
};

export const clearRateLimitStore = () => {
  memoryStore.clear();
};

export const globalRateLimiter = createRateLimiter({
  windowMs: ENV.RATE_LIMIT_WINDOW_MS,
  max: ENV.RATE_LIMIT_MAX_REQUESTS
});

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: ENV.AUTH_RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many authentication attempts. Please wait 15 minutes before trying again.'
});

