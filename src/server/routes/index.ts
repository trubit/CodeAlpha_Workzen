import { Router, Request, Response } from 'express';
import { ResponseEnvelope } from '../../shared/types/index.js';
import { getDatabaseHealth } from '../config/database.js';
import { ENV } from '../config/env.js';
import { authRouter } from './auth.js';
import { organizationRouter } from './organization.js';
import { workspaceRouter } from './workspace.js';
import { rbacRouter, orgRbacRouter, workspaceRbacRouter } from './rbac.js';
import { orgTeamRouter, publicInvitationRouter } from './team.js';
import { dashboardRouter } from './dashboard.js';
import { projectRouter } from './project.js';
import { taskRouter } from './task.js';
import { commentRouter } from './comment.js';

export const apiRouter = Router();

// Mount authentication routes
apiRouter.use('/auth', authRouter);

// Mount organization management routes (Phase 6)
apiRouter.use('/organizations', organizationRouter);

// Mount workspace management routes (Phase 7)
apiRouter.use('/workspaces', workspaceRouter);

// Mount RBAC & Permissions routes (Phase 8)
apiRouter.use('/', rbacRouter);
apiRouter.use('/organizations/:organizationId', orgRbacRouter);
apiRouter.use('/workspaces/:workspaceId', workspaceRbacRouter);

// Mount Team Management routes (Phase 9)
apiRouter.use('/organizations/:organizationId/team', orgTeamRouter);
apiRouter.use('/invitations', publicInvitationRouter);

// Mount Enterprise Dashboard routes (Phase 10)
apiRouter.use('/dashboard', dashboardRouter);

// Mount Project Management & Collaboration routes (Phases 11 & 12)
apiRouter.use('/projects', projectRouter);

// Mount Task Management routes (Phase 14)
apiRouter.use('/tasks', taskRouter);

// Mount Task Comments & Discussions routes (Phase 16)
apiRouter.use('/', commentRouter);

/**
 * @route   GET /api/v1/health
 * @desc    Comprehensive system, database and telemetry health check
 * @access  Public
 */
apiRouter.get('/health', (req: Request, res: Response<ResponseEnvelope>) => {
  const dbHealth = getDatabaseHealth();
  const isHealthy = dbHealth.status === 'connected' || ENV.NODE_ENV === 'development';

  const memory = process.memoryUsage();
  const uptimeSeconds = Math.floor(process.uptime());

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    data: {
      status: isHealthy ? 'healthy' : 'degraded',
      platform: 'WORKZEN Enterprise SaaS',
      version: '1.0.0',
      environment: ENV.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: uptimeSeconds,
        formatted: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${uptimeSeconds % 60}s`
      },
      memory: {
        rssMb: Math.round(memory.rss / 1024 / 1024),
        heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(memory.heapTotal / 1024 / 1024)
      },
      database: dbHealth,
      features: {
        socketIO: true,
        multiTenancy: true,
        rateLimiting: true,
        cloudinary: Boolean(ENV.CLOUDINARY_CLOUD_NAME),
        stripe: Boolean(ENV.STRIPE_SECRET_KEY),
        paystack: Boolean(ENV.PAYSTACK_SECRET_KEY)
      }
    }
  });
});

/**
 * @route   GET /api/v1/info
 * @desc    Public metadata endpoint describing API version & available capabilities
 * @access  Public
 */
apiRouter.get('/info', (req: Request, res: Response<ResponseEnvelope>) => {
  res.json({
    success: true,
    data: {
      name: 'WORKZEN API',
      version: 'v1',
      tagline: 'Plan Smarter. Work Together. Achieve More.',
      endpoints: {
        health: `${ENV.API_PREFIX}/health`,
        auth: `${ENV.API_PREFIX}/auth`,
        organisations: `${ENV.API_PREFIX}/organisations`,
        workspaces: `${ENV.API_PREFIX}/workspaces`,
        projects: `${ENV.API_PREFIX}/projects`,
        tasks: `${ENV.API_PREFIX}/tasks`
      }
    }
  });
});
