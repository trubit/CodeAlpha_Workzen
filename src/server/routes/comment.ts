import { Router } from 'express';
import { CommentController } from '../controllers/commentController.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { PERMISSIONS } from '../../shared/constants/roles.js';

export const commentRouter = Router();

// All comment endpoints require authentication
commentRouter.use(authenticate);

/**
 * @route   POST /api/v1/tasks/:taskId/comments
 * @desc    Add a comment or reply to a task
 * @access  Authenticated User with TASK_READ permission
 */
commentRouter.post(
  '/tasks/:taskId/comments',
  requirePermission(PERMISSIONS.TASK_READ),
  CommentController.createComment
);

/**
 * @route   GET /api/v1/tasks/:taskId/comments
 * @desc    List all comments and threaded replies for a task
 * @access  Authenticated User with TASK_READ permission
 */
commentRouter.get(
  '/tasks/:taskId/comments',
  requirePermission(PERMISSIONS.TASK_READ),
  CommentController.listComments
);

/**
 * @route   GET /api/v1/tasks/:taskId/mentionable-members
 * @desc    List members eligible for @mention autocomplete on a task
 * @access  Authenticated User with TASK_READ permission
 */
commentRouter.get(
  '/tasks/:taskId/mentionable-members',
  requirePermission(PERMISSIONS.TASK_READ),
  CommentController.getMentionableMembers
);

/**
 * @route   PATCH /api/v1/comments/:id
 * @desc    Update a comment's content (Author only)
 * @access  Authenticated User
 */
commentRouter.patch('/comments/:id', CommentController.updateComment);

/**
 * @route   DELETE /api/v1/comments/:id
 * @desc    Delete or soft-delete a comment
 * @access  Authenticated User (Author or Moderator)
 */
commentRouter.delete('/comments/:id', CommentController.deleteComment);

