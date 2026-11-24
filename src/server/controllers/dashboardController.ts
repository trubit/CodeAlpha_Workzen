import { Request, Response, NextFunction } from 'express';
import { ResponseEnvelope } from '../../shared/types/index.js';
import { DashboardService } from '../services/dashboardService.js';
import {
  dashboardOverviewQuerySchema,
  myTasksQuerySchema,
  dashboardActivityQuerySchema,
  dashboardAnalyticsQuerySchema
} from '../../shared/validation/dashboard.js';
import { OrganisationMembershipModel } from '../models/OrganisationMembership.js';

export class DashboardController {
  /**
   * Helper: Resolves active organization ID from headers or user's first active membership
   */
  private static async resolveOrganisationId(req: Request): Promise<string> {
    const headerOrgId = req.headers['x-organisation-id'] as string;
    if (headerOrgId) {
      return headerOrgId;
    }

    const userId = req.user!.userId;
    const membership = await OrganisationMembershipModel.findOne({
      userId,
      status: 'active'
    }).lean();

    if (!membership) {
      const err: any = new Error('No active organization found for this user');
      err.statusCode = 404;
      err.code = 'NO_ACTIVE_ORGANISATION';
      throw err;
    }

    return (membership as any).organisationId.toString();
  }

  /**
   * GET /api/v1/dashboard/overview
   */
  static async getOverview(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const organisationId = await DashboardController.resolveOrganisationId(req);
      const query = dashboardOverviewQuerySchema.parse(req.query);

      // Workspace header fallback
      if (!query.workspaceId && req.headers['x-workspace-id']) {
        query.workspaceId = req.headers['x-workspace-id'] as string;
      }

      const overview = await DashboardService.getOverview(userId, organisationId, query);

      res.status(200).json({
        success: true,
        data: overview
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/dashboard/my-tasks
   */
  static async getMyTasks(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const organisationId = await DashboardController.resolveOrganisationId(req);
      const query = myTasksQuerySchema.parse(req.query);

      if (!query.workspaceId && req.headers['x-workspace-id']) {
        query.workspaceId = req.headers['x-workspace-id'] as string;
      }

      const tasks = await DashboardService.getMyTasks(userId, organisationId, query);

      res.status(200).json({
        success: true,
        data: {
          tasks,
          count: tasks.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/dashboard/activity
   */
  static async getActivity(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const organisationId = await DashboardController.resolveOrganisationId(req);
      const query = dashboardActivityQuerySchema.parse(req.query);

      const activities = await DashboardService.getActivity(organisationId, query);

      res.status(200).json({
        success: true,
        data: {
          activities,
          count: activities.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/dashboard/analytics
   */
  static async getAnalytics(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const organisationId = await DashboardController.resolveOrganisationId(req);
      const query = dashboardAnalyticsQuerySchema.parse(req.query);

      if (!query.workspaceId && req.headers['x-workspace-id']) {
        query.workspaceId = req.headers['x-workspace-id'] as string;
      }

      const analytics = await DashboardService.getAnalytics(organisationId, query);

      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      next(error);
    }
  }
}

