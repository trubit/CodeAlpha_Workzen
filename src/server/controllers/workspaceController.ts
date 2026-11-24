import { Request, Response, NextFunction } from 'express';
import { ResponseEnvelope } from '../../shared/types/index.js';
import { WorkspaceService } from '../services/workspaceService.js';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  updateWorkspaceSettingsSchema,
  archiveWorkspaceSchema
} from '../../shared/validation/workspace.js';

export class WorkspaceController {
  /**
   * POST /api/v1/organizations/:organizationId/workspaces or POST /api/v1/workspaces
   * Create a new workspace within an active organization
   */
  static async create(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedInput = createWorkspaceSchema.parse(req.body);
      const userId = req.user!.userId;
      const organisationId = req.params.organizationId || req.body.organisationId;

      if (!organisationId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_ORGANISATION_ID',
            message: 'An organization ID is required to create a workspace'
          }
        });
        return;
      }

      const workspace = await WorkspaceService.createWorkspace(
        organisationId,
        userId,
        validatedInput
      );

      res.status(201).json({
        success: true,
        data: {
          workspace
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/organizations/:organizationId/workspaces or GET /api/v1/workspaces?organisationId=...
   * List workspaces within an organization accessible to the user
   */
  static async list(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const organisationId =
        req.params.organizationId || (req.query.organisationId as string);

      if (!organisationId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_ORGANISATION_ID',
            message: 'organisationId query parameter or route param is required'
          }
        });
        return;
      }

      // Check user role in context or fallback to member
      const userRole = req.tenant?.membership?.role || req.workspaceContext?.membership?.role || 'member';

      const workspaces = await WorkspaceService.listWorkspaces(
        organisationId,
        userId,
        userRole
      );

      res.status(200).json({
        success: true,
        data: {
          workspaces,
          count: workspaces.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/workspaces/:workspaceId
   * Retrieve full workspace details, membership, and telemetry
   */
  static async getById(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const workspaceId = req.params.workspaceId;
      const workspace = await WorkspaceService.getWorkspaceById(workspaceId);

      res.status(200).json({
        success: true,
        data: {
          workspace,
          context: {
            userRole: req.workspaceContext?.membership?.role
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/workspaces/:workspaceId
   * Update workspace profile details (name, type, color, icon, visibility)
   */
  static async update(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const workspaceId = req.params.workspaceId;
      const userId = req.user!.userId;
      const validatedInput = updateWorkspaceSchema.parse(req.body);

      const workspace = await WorkspaceService.updateWorkspace(
        workspaceId,
        userId,
        validatedInput
      );

      res.status(200).json({
        success: true,
        data: {
          workspace
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/workspaces/:workspaceId/settings
   * Update workspace operational policies and settings
   */
  static async updateSettings(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const workspaceId = req.params.workspaceId;
      const userId = req.user!.userId;
      const validatedInput = updateWorkspaceSettingsSchema.parse(req.body);

      const workspace = await WorkspaceService.updateSettings(
        workspaceId,
        userId,
        validatedInput
      );

      res.status(200).json({
        success: true,
        data: {
          workspace
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/workspaces/:workspaceId/select
   * Switch the user's active workspace session context
   */
  static async select(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const workspaceId = req.params.workspaceId;
      const workspace = await WorkspaceService.getWorkspaceById(workspaceId);

      res.status(200).json({
        success: true,
        data: {
          selectedWorkspace: workspace,
          organisationId: workspace.organisationId,
          activeAt: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/workspaces/:workspaceId/archive
   * or DELETE /api/v1/workspaces/:workspaceId
   * Soft-archive a workspace requiring confirmation of exact workspace name
   */
  static async archive(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const workspaceId = req.params.workspaceId;
      const userId = req.user!.userId;
      const validatedInput = archiveWorkspaceSchema.parse(req.body);

      const workspace = await WorkspaceService.archiveWorkspace(
        workspaceId,
        userId,
        validatedInput
      );

      res.status(200).json({
        success: true,
        data: {
          workspace,
          message: 'Workspace successfully archived'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/workspaces/:workspaceId/restore
   * Restore an archived workspace to active status
   */
  static async restore(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const workspaceId = req.params.workspaceId;
      const userId = req.user!.userId;

      const workspace = await WorkspaceService.restoreWorkspace(
        workspaceId,
        userId
      );

      res.status(200).json({
        success: true,
        data: {
          workspace,
          message: 'Workspace successfully restored'
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
