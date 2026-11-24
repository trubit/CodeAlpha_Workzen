import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  requireWorkspaceAccess,
  requireWorkspaceAdminOrOwner
} from '../middleware/workspace.js';
import { WorkspaceController } from '../controllers/workspaceController.js';

export const workspaceRouter = Router();

// All workspace operations require authenticated user identity
workspaceRouter.use(authenticate);

/**
 * @route   POST /api/v1/workspaces
 * @desc    Create a new workspace within an organization
 * @access  Authenticated User (org member)
 */
workspaceRouter.post('/', WorkspaceController.create);

/**
 * @route   GET /api/v1/workspaces
 * @desc    List workspaces within an organization (via query ?organisationId=...)
 * @access  Authenticated User
 */
workspaceRouter.get('/', WorkspaceController.list);

/**
 * @route   GET /api/v1/workspaces/:workspaceId
 * @desc    Get detailed workspace info and telemetry
 * @access  Active Workspace Member (Org Member)
 */
workspaceRouter.get('/:workspaceId', requireWorkspaceAccess, WorkspaceController.getById);

/**
 * @route   PATCH /api/v1/workspaces/:workspaceId
 * @desc    Update workspace profile and identity
 * @access  Workspace Admin or Organization Owner
 */
workspaceRouter.patch(
  '/:workspaceId',
  requireWorkspaceAccess,
  requireWorkspaceAdminOrOwner,
  WorkspaceController.update
);

/**
 * @route   PATCH /api/v1/workspaces/:workspaceId/settings
 * @desc    Update workspace policies and configurations
 * @access  Workspace Admin or Organization Owner
 */
workspaceRouter.patch(
  '/:workspaceId/settings',
  requireWorkspaceAccess,
  requireWorkspaceAdminOrOwner,
  WorkspaceController.updateSettings
);

/**
 * @route   POST /api/v1/workspaces/:workspaceId/select
 * @desc    Switch user's active workspace session context
 * @access  Active Workspace Member
 */
workspaceRouter.post('/:workspaceId/select', requireWorkspaceAccess, WorkspaceController.select);

/**
 * @route   POST /api/v1/workspaces/:workspaceId/archive
 * @desc    Soft-archive workspace with name confirmation
 * @access  Workspace Admin or Organization Owner
 */
workspaceRouter.post(
  '/:workspaceId/archive',
  requireWorkspaceAccess,
  requireWorkspaceAdminOrOwner,
  WorkspaceController.archive
);

/**
 * @route   DELETE /api/v1/workspaces/:workspaceId
 * @desc    Alias for soft-archive workspace with name confirmation
 * @access  Workspace Admin or Organization Owner
 */
workspaceRouter.delete(
  '/:workspaceId',
  requireWorkspaceAccess,
  requireWorkspaceAdminOrOwner,
  WorkspaceController.archive
);

/**
 * @route   POST /api/v1/workspaces/:workspaceId/restore
 * @desc    Restore an archived workspace
 * @access  Workspace Admin or Organization Owner
 */
workspaceRouter.post(
  '/:workspaceId/restore',
  requireWorkspaceAccess,
  requireWorkspaceAdminOrOwner,
  WorkspaceController.restore
);

