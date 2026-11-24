import { Request, Response, NextFunction } from 'express';
import { KanbanService } from '../services/kanbanService.js';
import {
  createTaskSchema,
  moveTaskSchema,
  reorderColumnTasksSchema,
  kanbanBoardQuerySchema
} from '../../shared/validation/task.js';
import { ResponseEnvelope } from '../../shared/types/index.js';

export class KanbanController {
  /**
   * GET /api/v1/projects/:projectId/kanban
   */
  public static async getBoard(req: Request, res: Response<ResponseEnvelope>, next: NextFunction): Promise<void> {
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

      const validatedQuery = kanbanBoardQuerySchema.parse(req.query);
      const board = await KanbanService.getProjectKanbanBoard(
        userId,
        orgId,
        req.params.projectId,
        validatedQuery
      );

      res.status(200).json({
        success: true,
        data: board
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/projects/:projectId/tasks
   */
  public static async createTask(req: Request, res: Response<ResponseEnvelope>, next: NextFunction): Promise<void> {
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

      const validated = createTaskSchema.parse({
        ...req.body,
        projectId: req.params.projectId,
        workspaceId: req.body.workspaceId || (req.headers['x-workspace-id'] as string) || 'default'
      });

      const task = await KanbanService.createTask(
        userId,
        orgId,
        req.params.projectId,
        validated
      );

      res.status(201).json({
        success: true,
        data: { task }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/projects/:projectId/kanban/tasks/:taskId/move
   */
  public static async moveTask(req: Request, res: Response<ResponseEnvelope>, next: NextFunction): Promise<void> {
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

      const validated = moveTaskSchema.parse(req.body);
      const updatedTask = await KanbanService.moveTask(
        userId,
        orgId,
        req.params.projectId,
        req.params.taskId,
        validated.targetStatus,
        validated.targetOrder
      );

      res.status(200).json({
        success: true,
        data: { task: updatedTask }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/projects/:projectId/kanban/reorder
   */
  public static async reorderColumn(req: Request, res: Response<ResponseEnvelope>, next: NextFunction): Promise<void> {
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

      const validated = reorderColumnTasksSchema.parse(req.body);
      const result = await KanbanService.reorderColumn(
        userId,
        orgId,
        req.params.projectId,
        validated.status,
        validated.orderedTaskIds
      );

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

