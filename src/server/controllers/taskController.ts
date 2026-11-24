import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/taskService.js';
import { ResponseEnvelope } from '../../shared/types/index.js';
import {
  createTaskSchema,
  updateTaskSchema,
  taskListQuerySchema,
  assignTaskSchema,
  taskPriorityUpdateSchema,
  updateTaskStatusSchema,
  createSubtaskSchema,
  addDependencySchema
} from '../../shared/validation/task.js';

export class TaskController {
  /**
   * GET /api/v1/tasks
   * List paginated, filtered tasks across projects or scoped to a project
   */
  public static async listTasks(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      const orgId = (req.headers['x-organisation-id'] as string) || req.user?.defaultOrgId;
      if (!orgId) {
        res.status(400).json({
          success: false,
          error: { code: 'ORGANISATION_REQUIRED', message: 'Active organization context required' }
        });
        return;
      }

      const validatedQuery = taskListQuerySchema.parse(req.query);
      const result = await TaskService.getTasks(userId, orgId, validatedQuery);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/tasks/:id
   * Retrieve single task details
   */
  public static async getTask(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      const orgId = (req.headers['x-organisation-id'] as string) || req.user?.defaultOrgId;
      if (!orgId) {
        res.status(400).json({
          success: false,
          error: { code: 'ORGANISATION_REQUIRED', message: 'Active organization context required' }
        });
        return;
      }

      const task = await TaskService.getTaskById(userId, orgId, req.params.id);

      res.status(200).json({
        success: true,
        data: { task }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/tasks
   * Create a new task
   */
  public static async createTask(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      const orgId = (req.headers['x-organisation-id'] as string) || req.user?.defaultOrgId;
      if (!orgId) {
        res.status(400).json({
          success: false,
          error: { code: 'ORGANISATION_REQUIRED', message: 'Active organization context required' }
        });
        return;
      }

      const validated = createTaskSchema.parse(req.body);
      const task = await TaskService.createTask(userId, orgId, validated);

      res.status(201).json({
        success: true,
        data: { task }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/tasks/:id
   * Update task fields
   */
  public static async updateTask(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      const orgId = (req.headers['x-organisation-id'] as string) || req.user?.defaultOrgId;
      if (!orgId) {
        res.status(400).json({
          success: false,
          error: { code: 'ORGANISATION_REQUIRED', message: 'Active organization context required' }
        });
        return;
      }

      const validated = updateTaskSchema.parse(req.body);
      const task = await TaskService.updateTask(userId, orgId, req.params.id, validated);

      res.status(200).json({
        success: true,
        data: { task }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/tasks/:id/status
   * Update task status (syncs with Kanban)
   */
  public static async updateStatus(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      const orgId = (req.headers['x-organisation-id'] as string) || req.user?.defaultOrgId;
      if (!orgId) {
        res.status(400).json({
          success: false,
          error: { code: 'ORGANISATION_REQUIRED', message: 'Active organization context required' }
        });
        return;
      }

      const validated = updateTaskStatusSchema.parse(req.body);
      const task = await TaskService.updateStatus(userId, orgId, req.params.id, validated.status);

      res.status(200).json({
        success: true,
        data: { task }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/tasks/:id/priority
   * Update task priority
   */
  public static async updatePriority(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      const orgId = (req.headers['x-organisation-id'] as string) || req.user?.defaultOrgId;
      if (!orgId) {
        res.status(400).json({
          success: false,
          error: { code: 'ORGANISATION_REQUIRED', message: 'Active organization context required' }
        });
        return;
      }

      const validated = taskPriorityUpdateSchema.parse(req.body);
      const task = await TaskService.updatePriority(userId, orgId, req.params.id, validated.priority);

      res.status(200).json({
        success: true,
        data: { task }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/tasks/:id/assignees
   * Assign or unassign task members
   */
  public static async assignTask(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      const orgId = (req.headers['x-organisation-id'] as string) || req.user?.defaultOrgId;
      if (!orgId) {
        res.status(400).json({
          success: false,
          error: { code: 'ORGANISATION_REQUIRED', message: 'Active organization context required' }
        });
        return;
      }

      const validated = assignTaskSchema.parse(req.body);
      const task = await TaskService.assignTask(userId, orgId, req.params.id, validated.assigneeIds);

      res.status(200).json({
        success: true,
        data: { task }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/tasks/:id/archive
   * Soft-delete / archive task
   */
  public static async archiveTask(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      const orgId = (req.headers['x-organisation-id'] as string) || req.user?.defaultOrgId;
      if (!orgId) {
        res.status(400).json({
          success: false,
          error: { code: 'ORGANISATION_REQUIRED', message: 'Active organization context required' }
        });
        return;
      }

      const task = await TaskService.archiveTask(userId, orgId, req.params.id);

      res.status(200).json({
        success: true,
        data: { task }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/tasks/:id/restore
   * Restore archived task
   */
  public static async restoreTask(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      const orgId = (req.headers['x-organisation-id'] as string) || req.user?.defaultOrgId;
      if (!orgId) {
        res.status(400).json({
          success: false,
          error: { code: 'ORGANISATION_REQUIRED', message: 'Active organization context required' }
        });
        return;
      }

      const task = await TaskService.restoreTask(userId, orgId, req.params.id);

      res.status(200).json({
        success: true,
        data: { task }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/v1/tasks/:id
   * Permanent deletion of task (RBAC-guarded)
   */
  public static async deleteTask(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      const orgId = (req.headers['x-organisation-id'] as string) || req.user?.defaultOrgId;
      if (!orgId) {
        res.status(400).json({
          success: false,
          error: { code: 'ORGANISATION_REQUIRED', message: 'Active organization context required' }
        });
        return;
      }

      const result = await TaskService.deleteTask(userId, orgId, req.params.id);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/tasks/:id/activity
   * Audit activity trail
   */
  public static async getActivity(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      const orgId = (req.headers['x-organisation-id'] as string) || req.user?.defaultOrgId;
      if (!orgId) {
        res.status(400).json({
          success: false,
          error: { code: 'ORGANISATION_REQUIRED', message: 'Active organization context required' }
        });
        return;
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const activity = await TaskService.getTaskActivity(userId, orgId, req.params.id, limit);

      res.status(200).json({
        success: true,
        data: { activity }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/tasks/:id/subtasks
   * Create a child subtask under a parent task
   */
  public static async createSubtask(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      const orgId = (req.headers['x-organisation-id'] as string) || req.user?.defaultOrgId;
      if (!orgId) {
        res.status(400).json({
          success: false,
          error: { code: 'ORGANISATION_REQUIRED', message: 'Active organization context required' }
        });
        return;
      }

      const validatedInput = createSubtaskSchema.parse(req.body);
      const subtask = await TaskService.createSubtask(userId, orgId, req.params.id, validatedInput);

      res.status(201).json({
        success: true,
        data: { task: subtask }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/tasks/:id/subtasks
   * List all subtasks for a parent task
   */
  public static async listSubtasks(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      const orgId = (req.headers['x-organisation-id'] as string) || req.user?.defaultOrgId;
      if (!orgId) {
        res.status(400).json({
          success: false,
          error: { code: 'ORGANISATION_REQUIRED', message: 'Active organization context required' }
        });
        return;
      }

      const subtasks = await TaskService.getSubtasks(userId, orgId, req.params.id);

      res.status(200).json({
        success: true,
        data: { subtasks }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/tasks/:id/dependencies
   * Add a prerequisite task dependency
   */
  public static async addDependency(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      const orgId = (req.headers['x-organisation-id'] as string) || req.user?.defaultOrgId;
      if (!orgId) {
        res.status(400).json({
          success: false,
          error: { code: 'ORGANISATION_REQUIRED', message: 'Active organization context required' }
        });
        return;
      }

      const validatedInput = addDependencySchema.parse(req.body);
      const result = await TaskService.addDependency(
        userId,
        orgId,
        req.params.id,
        validatedInput.prerequisiteTaskId
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
   * DELETE /api/v1/tasks/:id/dependencies/:prerequisiteId
   * Remove a prerequisite task dependency
   */
  public static async removeDependency(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      const orgId = (req.headers['x-organisation-id'] as string) || req.user?.defaultOrgId;
      if (!orgId) {
        res.status(400).json({
          success: false,
          error: { code: 'ORGANISATION_REQUIRED', message: 'Active organization context required' }
        });
        return;
      }

      const result = await TaskService.removeDependency(
        userId,
        orgId,
        req.params.id,
        req.params.prerequisiteId
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
   * GET /api/v1/tasks/:id/dependencies
   * Get prerequisite and dependent tasks
   */
  public static async getDependencies(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      const orgId = (req.headers['x-organisation-id'] as string) || req.user?.defaultOrgId;
      if (!orgId) {
        res.status(400).json({
          success: false,
          error: { code: 'ORGANISATION_REQUIRED', message: 'Active organization context required' }
        });
        return;
      }

      const result = await TaskService.getDependencies(userId, orgId, req.params.id);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

