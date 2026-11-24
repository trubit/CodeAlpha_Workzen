import { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env.js';

export const securityHeadersMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // XSS protection for legacy browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Strict Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy for API
  const connectSrc = ENV.NODE_ENV === 'development'
    ? "'self' ws: wss: http://localhost:* http://127.0.0.1:*"
    : `'self' ws: wss: ${ENV.CLIENT_URL}`;

  res.setHeader(
    'Content-Security-Policy',
    `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https: data:; connect-src ${connectSrc};`
  );

  // HTTP Strict Transport Security in production
  if (ENV.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Remove fingerprinting header
  res.removeHeader('X-Powered-By');

  next();
};

export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or matching CLIENT_URL
    const allowedOrigins = [
      ENV.CLIENT_URL,
      'http://localhost:3070',
      'http://127.0.0.1:3070'
    ];

    if (!origin || allowedOrigins.includes(origin) || ENV.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not permitted by WORKZEN CORS policy`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    '*',
    'Content-Type',
    'Authorization',
    'X-Organisation-Id',
    'X-Workspace-Id',
    'x-organisation-id',
    'x-workspace-id',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset', 'Authorization', 'X-Organisation-Id', 'X-Workspace-Id'],
  optionsSuccessStatus: 200
};

