import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { PERMISSIONS } from '../../shared/constants/roles.js';
import { DashboardController } from '../controllers/dashboardController.js';

export const dashboardRouter = Router();

// All dashboard endpoints require authentication
dashboardRouter.use(authenticate);

/**
 * @route   GET /api/v1/dashboard/overview
 * @desc    Get high-level KPI metrics, project summaries, and upcoming deadlines
 * @access  Protected (Requires org:read permission)
 */
dashboardRouter.get(
  '/overview',
  requirePermission(PERMISSIONS.ORG_READ),
  DashboardController.getOverview
);

/**
 * @route   GET /api/v1/dashboard/my-tasks
 * @desc    Get deliverables assigned to the authenticated user in the current org/workspace
 * @access  Protected (Requires task:read permission)
 */
dashboardRouter.get(
  '/my-tasks',
  requirePermission(PERMISSIONS.TASK_READ),
  DashboardController.getMyTasks
);

/**
 * @route   GET /api/v1/dashboard/activity
 * @desc    Get live immutable audit and collaborative activity stream
 * @access  Protected (Requires org:read permission)
 */
dashboardRouter.get(
  '/activity',
  requirePermission(PERMISSIONS.ORG_READ),
  DashboardController.getActivity
);

/**
 * @route   GET /api/v1/dashboard/analytics
 * @desc    Get genuine task distribution and project progress analytics
 * @access  Protected (Requires report:read or org:read permission)
 */
dashboardRouter.get(
  '/analytics',
  requirePermission(PERMISSIONS.REPORT_READ),
  DashboardController.getAnalytics
);

