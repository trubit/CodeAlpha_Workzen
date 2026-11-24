import { Request, Response, NextFunction } from 'express';
import { CommentService } from '../services/commentService.js';
import { ResponseEnvelope } from '../../shared/types/index.js';
import {
  createCommentSchema,
  updateCommentSchema,
  listCommentsQuerySchema
} from '../../shared/validation/comment.js';

export class CommentController {
  /**
   * POST /api/v1/tasks/:taskId/comments
   * Add a comment or threaded reply to a task
   */
  public static async createComment(
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

      const { taskId } = req.params;
      const validatedInput = createCommentSchema.parse(req.body);

      const comment = await CommentService.createComment(userId, orgId, taskId, validatedInput);

      res.status(201).json({
        success: true,
        data: { comment }
      });
    } catch (err: any) {
      if (err.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: err.errors[0]?.message || 'Invalid comment input'
          }
        });
        return;
      }
      next(err);
    }
  }

  /**
   * GET /api/v1/tasks/:taskId/comments
   * List all comments and threaded replies for a task
   */
  public static async listComments(
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

      const { taskId } = req.params;
      const validatedQuery = listCommentsQuerySchema.parse(req.query);

      const result = await CommentService.getTaskComments(userId, orgId, taskId, validatedQuery);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/comments/:id
   * Edit an existing comment (author only)
   */
  public static async updateComment(
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

      const { id } = req.params;
      const validatedInput = updateCommentSchema.parse(req.body);

      const comment = await CommentService.updateComment(userId, orgId, id, validatedInput);

      res.status(200).json({
        success: true,
        data: { comment }
      });
    } catch (err: any) {
      if (err.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: err.errors[0]?.message || 'Invalid comment content'
          }
        });
        return;
      }
      if (err.message && err.message.includes('Unauthorized')) {
        res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: err.message }
        });
        return;
      }
      next(err);
    }
  }

  /**
   * DELETE /api/v1/comments/:id
   * Delete or soft-delete a comment
   */
  public static async deleteComment(
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

      const { id } = req.params;
      const result = await CommentService.deleteComment(userId, orgId, id);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err: any) {
      if (err.message && err.message.includes('Unauthorized')) {
        res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: err.message }
        });
        return;
      }
      next(err);
    }
  }

  /**
   * GET /api/v1/tasks/:taskId/mentionable-members
   * List eligible members for @mention autocomplete
   */
  public static async getMentionableMembers(
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

      const { taskId } = req.params;
      const search = req.query.search as string | undefined;

      const members = await CommentService.getMentionableMembers(userId, orgId, taskId, search);

      res.status(200).json({
        success: true,
        data: { members }
      });
    } catch (err) {
      next(err);
    }
  }
}

