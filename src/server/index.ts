import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { ENV } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { securityHeadersMiddleware, corsOptions } from './middleware/security.js';
import { globalRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initializeSocket } from './socket/index.js';
import { apiRouter } from './routes/index.js';

const app = express();
const httpServer = createServer(app);

// 1. Initialize Real-Time Socket.IO
const io = initializeSocket(httpServer);

// 2. Security Headers & CORS
app.use(securityHeadersMiddleware);
app.use(cors(corsOptions));

// 3. Request Parsers with strict size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Global Rate Limiter
app.use(globalRateLimiter);

// 5. Request Logging Middleware (safe: no secret logging)
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (ENV.NODE_ENV !== 'test') {
      console.log(`[WORKZEN HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// 6. Centralized API Router
app.use(ENV.API_PREFIX, apiRouter);

// 7. 404 Route Fallback
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`
    }
  });
});

// 8. Global Error Handler
app.use(errorHandler);

// ------------------------------------------------------------------------------
// Graceful Shutdown & Process-Level Error Handlers
// ------------------------------------------------------------------------------

let isShuttingDown = false;

const gracefulShutdown = async (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n[WORKZEN Server] Received ${signal}. Starting graceful shutdown...`);

  httpServer.close(async () => {
    console.log('[WORKZEN Server] HTTP server closed.');
    await disconnectDatabase();
    console.log('[WORKZEN Server] Shutdown complete.');
    process.exit(0);
  });

  // Force close if graceful shutdown hangs
  setTimeout(() => {
    console.error('[WORKZEN Server] Forceful shutdown initiated after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason: any) => {
  console.error('[WORKZEN Fatal] Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error: Error) => {
  console.error('[WORKZEN Fatal] Uncaught Exception:', error.message, error.stack);
  if (ENV.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// ------------------------------------------------------------------------------
// Server Bootstrap
// ------------------------------------------------------------------------------

export const startServer = async () => {
  if (ENV.NODE_ENV !== 'test') {
    await connectDatabase();
  }

  return new Promise<void>((resolve) => {
    httpServer.listen(ENV.PORT, '0.0.0.0', () => {
      console.log(`\n============================================================`);
      console.log(`[WORKZEN Enterprise SaaS] Backend Server Ready`);
      console.log(`  - Environment: ${ENV.NODE_ENV}`);
      console.log(`  - Local URL:   http://localhost:${ENV.PORT}`);
      console.log(`  - API Base:    http://localhost:${ENV.PORT}${ENV.API_PREFIX}`);
      console.log(`  - Health:      http://localhost:${ENV.PORT}${ENV.API_PREFIX}/health`);
      console.log(`  - Allowed UI:  ${ENV.CLIENT_URL}`);
      console.log(`============================================================\n`);
      resolve();
    });
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app, httpServer, io };
