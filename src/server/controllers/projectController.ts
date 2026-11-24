import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/projectService.js';
import {
  createProjectSchema,
  updateProjectSchema,
  updateProjectStatusSchema,
  updateProjectPrioritySchema,
  transferProjectOwnerSchema,
  addProjectMembersSchema,
  updateProjectMemberRoleSchema,
  archiveProjectSchema,
  listProjectsQuerySchema,
  listProjectMembersQuerySchema
} from '../../shared/validation/project.js';
import { ResponseEnvelope } from '../../shared/types/index.js';

export class ProjectController {
  /**
   * POST /api/v1/projects
   */
  public static async create(req: Request, res: Response<ResponseEnvelope>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
      }

      const orgId = (req.headers['x-organisation-id'] as string) || req.user?.defaultOrgId;
      if (!orgId) {
        res.status(400).json({ success: false, error: { code: 'ORGANISATION_REQUIRED', message: 'Active organization header required' } });
        return;
      }

      const validated = createProjectSchema.parse(req.body);
      const project = await ProjectService.createProject(userId, orgId, validated);

      res.status(201).json({
        success: true,
        data: { project }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/projects
   */
  public static async list(req: Request, res: Response<ResponseEnvelope>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
      }

      const orgId = (req.headers['x-organisation-id'] as string) || req.user?.defaultOrgId;
      if (!orgId) {
        res.status(400).json({ success: false, error: { code: 'ORGANISATION_REQUIRED', message: 'Active organization header required' } });
        return;
      }

      const validatedQuery = listProjectsQuerySchema.parse(req.query);
      const result = await ProjectService.listProjects(userId, orgId, validatedQuery);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/projects/:id
   */
  public static async getById(req: Request, res: Response<ResponseEnvelope>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
      }

      const orgId = (req.headers['x-organisation-id'] as string) || req.user?.defaultOrgId;
      if (!orgId) {
        res.status(400).json({ success: false, error: { code: 'ORGANISATION_REQUIRED', message: 'Active organization header required' } });
        return;
      }

      const project = await ProjectService.getProjectById(userId, orgId, req.params.id);

      res.status(200).json({
        success: true,
        data: { project }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/projects/:id
   */
  public static async update(req: Request, res: Response<ResponseEnvelope>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
      }

      const orgId = (req.headers['x-organisation-id'] as string) || req.user?.defaultOrgId;
      if (!orgId) {
        res.status(400).json({ success: false, error: { code: 'ORGANISATION_REQUIRED', message: 'Active organization header required' } });
        return;
      }

      const validated = updateProjectSchema.parse(req.body);
      const project = await ProjectService.updateProject(userId, orgId, req.params.id, validated);

      res.status(200).json({
        success: true,
        data: { project }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/projects/:id/status
   */
  public static async updateStatus(req: Request, res: Response<ResponseEnvelope>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
      }

      const orgId = (req.headers['x-organisation-id'] as string) || req.user?.defaultOrgId;
      if (!orgId) {
        res.status(400).json({ success: false, error: { code: 'ORGANISATION_REQUIRED', message: 'Active organization header required' } });
        return;
      }

      const validated = updateProjectStatusSchema.parse(req.body);
      const project = await ProjectService.updateStatus(userId, orgId, req.params.id, validated.status);

      res.status(200).json({
        success: true,
        data: { project }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/projects/:id/priority
   */
  public static async updatePriority(req: Request, res: Response<ResponseEnvelope>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
      }

      const orgId = (req.headers['x-organisation-id'] as string) || req.user?.defaultOrgId;
      if (!orgId) {
        res.status(400).json({ success: false, error: { code: 'ORGANISATION_REQUIRED', message: 'Active organization header required' } });
        return;
      }

      const validated = updateProjectPrioritySchema.parse(req.body);
      const project = await ProjectService.updatePriority(userId, orgId, req.params.id, validated.priority);

      res.status(200).json({
        success: true,
        data: { project }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/projects/:id/transfer-owner
   */
  public static async transferOwner(req: Request, res: Response<ResponseEnvelope>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
      }

      const orgId = (req.headers['x-organisation-id'] as string) || req.user?.defaultOrgId;
      if (!orgId) {
        res.status(400).json({ success: false, error: { code: 'ORGANISATION_REQUIRED', message: 'Active organization header required' } });
        return;
      }

      const validated = transferProjectOwnerSchema.parse(req.body);
      const project = await ProjectService.transferOwnership(userId, orgId, req.params.id, validated.newOwnerId);

      res.status(200).json({
        success: true,
        data: { project }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/projects/:id/members
   */
  public static async listMembers(req: Request, res: Response<ResponseEnvelope>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
      }

      const orgId = (req.headers['x-organisation-id'] as string) || req.user?.defaultOrgId;
      if (!orgId) {
        res.status(400).json({ success: false, error: { code: 'ORGANISATION_REQUIRED', message: 'Active organization header required' } });
        return;
      }

      const validatedQuery = listProjectMembersQuerySchema.parse(req.query);
      const result = await ProjectService.listProjectMembers(userId, orgId, req.params.id, validatedQuery);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/projects/:id/eligible-members
   */
  public static async getEligibleMembers(req: Request, res: Response<ResponseEnvelope>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
      }

      const orgId = (req.headers['x-organisation-id'] as string) || req.user?.defaultOrgId;
      if (!orgId) {
        res.status(400).json({ success: false, error: { code: 'ORGANISATION_REQUIRED', message: 'Active organization header required' } });
        return;
      }

      const search = req.query.search as string | undefined;
      const eligible = await ProjectService.getEligibleOrganisationMembers(userId, orgId, req.params.id, search);

      res.status(200).json({
        success: true,
        data: { eligible }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/projects/:id/members
   */
  public static async addMembers(req: Request, res: Response<ResponseEnvelope>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
      }

      const orgId = (req.headers['x-organisation-id'] as string) || req.user?.defaultOrgId;
      if (!orgId) {
        res.status(400).json({ success: false, error: { code: 'ORGANISATION_REQUIRED', message: 'Active organization header required' } });
        return;
      }

      const validated = addProjectMembersSchema.parse(req.body);
      const project = await ProjectService.addMembers(
        userId,
        orgId,
        req.params.id,
        validated.memberIds,
        validated.role
      );

      res.status(200).json({
        success: true,
        data: { project }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/projects/:id/members/:memberId/role
   */
  public static async updateMemberRole(req: Request, res: Response<ResponseEnvelope>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
      }

      const orgId = (req.headers['x-organisation-id'] as string) || req.user?.defaultOrgId;
      if (!orgId) {
        res.status(400).json({ success: false, error: { code: 'ORGANISATION_REQUIRED', message: 'Active organization header required' } });
        return;
      }

      const validated = updateProjectMemberRoleSchema.parse(req.body);
      const result = await ProjectService.updateMemberRole(
        userId,
        orgId,
        req.params.id,
        req.params.memberId,
        validated.role
      );

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/v1/projects/:id/members/:memberId
   */
  public static async removeMember(req: Request, res: Response<ResponseEnvelope>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
      }

      const orgId = (req.headers['x-organisation-id'] as string) || req.user?.defaultOrgId;
      if (!orgId) {
        res.status(400).json({ success: false, error: { code: 'ORGANISATION_REQUIRED', message: 'Active organization header required' } });
        return;
      }

      const project = await ProjectService.removeMember(userId, orgId, req.params.id, req.params.memberId);

      res.status(200).json({
        success: true,
        data: { project }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/projects/:id/members/activity
   */
  public static async getMemberActivity(req: Request, res: Response<ResponseEnvelope>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
      }

      const orgId = (req.headers['x-organisation-id'] as string) || req.user?.defaultOrgId;
      if (!orgId) {
        res.status(400).json({ success: false, error: { code: 'ORGANISATION_REQUIRED', message: 'Active organization header required' } });
        return;
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const activity = await ProjectService.getProjectMemberActivity(userId, orgId, req.params.id, limit);

      res.status(200).json({
        success: true,
        data: { activity }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/projects/:id/archive
   */
  public static async archive(req: Request, res: Response<ResponseEnvelope>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
      }

      const orgId = (req.headers['x-organisation-id'] as string) || req.user?.defaultOrgId;
      if (!orgId) {
        res.status(400).json({ success: false, error: { code: 'ORGANISATION_REQUIRED', message: 'Active organization header required' } });
        return;
      }

      const validated = archiveProjectSchema.parse(req.body);
      const project = await ProjectService.archiveProject(userId, orgId, req.params.id, validated.confirmationName);

      res.status(200).json({
        success: true,
        data: { project }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/projects/:id/restore
   */
  public static async restore(req: Request, res: Response<ResponseEnvelope>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
      }

      const orgId = (req.headers['x-organisation-id'] as string) || req.user?.defaultOrgId;
      if (!orgId) {
        res.status(400).json({ success: false, error: { code: 'ORGANISATION_REQUIRED', message: 'Active organization header required' } });
        return;
      }

      const project = await ProjectService.restoreProject(userId, orgId, req.params.id);

      res.status(200).json({
        success: true,
        data: { project }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/v1/projects/:id
   */
  public static async delete(req: Request, res: Response<ResponseEnvelope>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
      }

      const orgId = (req.headers['x-organisation-id'] as string) || req.user?.defaultOrgId;
      if (!orgId) {
        res.status(400).json({ success: false, error: { code: 'ORGANISATION_REQUIRED', message: 'Active organization header required' } });
        return;
      }

      const confirmationName = (req.body?.confirmationName || req.query?.confirmationName) as string;
      const result = await ProjectService.deleteProject(userId, orgId, req.params.id, confirmationName);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/projects/:id/activity
   */
  public static async getActivity(req: Request, res: Response<ResponseEnvelope>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
      }

      const orgId = (req.headers['x-organisation-id'] as string) || req.user?.defaultOrgId;
      if (!orgId) {
        res.status(400).json({ success: false, error: { code: 'ORGANISATION_REQUIRED', message: 'Active organization header required' } });
        return;
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const activity = await ProjectService.getProjectActivity(orgId, req.params.id, limit);

      res.status(200).json({
        success: true,
        data: { activity }
      });
    } catch (err) {
      next(err);
    }
  }
}
