import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { PERMISSIONS } from '../../shared/constants/roles.js';
import { ProjectController } from '../controllers/projectController.js';
import { KanbanController } from '../controllers/kanbanController.js';

export const projectRouter = Router();

// All project routes require valid user authentication
projectRouter.use(authenticate);

/**
 * @route   POST /api/v1/projects
 * @desc    Create a new project in the active organization and workspace
 * @access  Authenticated User with PROJECT_CREATE permission
 */
projectRouter.post('/', requirePermission(PERMISSIONS.PROJECT_CREATE), ProjectController.create);

/**
 * @route   GET /api/v1/projects
 * @desc    List projects with filtering, status facets, search, and pagination
 * @access  Authenticated User with PROJECT_READ permission
 */
projectRouter.get('/', requirePermission(PERMISSIONS.PROJECT_READ), ProjectController.list);

/**
 * @route   GET /api/v1/projects/:id
 * @desc    Get detailed project metadata, telemetry, and member rosters
 * @access  Authenticated User with PROJECT_READ permission
 */
projectRouter.get('/:id', requirePermission(PERMISSIONS.PROJECT_READ), ProjectController.getById);

/**
 * @route   PATCH /api/v1/projects/:id
 * @desc    Update project metadata (name, description, dates, visibility, tags)
 * @access  Authenticated User with PROJECT_UPDATE permission
 */
projectRouter.patch('/:id', requirePermission(PERMISSIONS.PROJECT_UPDATE), ProjectController.update);

/**
 * @route   PATCH /api/v1/projects/:id/status
 * @desc    Update project lifecycle status (planning, active, on_hold, completed, cancelled)
 * @access  Authenticated User with PROJECT_UPDATE permission
 */
projectRouter.patch('/:id/status', requirePermission(PERMISSIONS.PROJECT_UPDATE), ProjectController.updateStatus);

/**
 * @route   PATCH /api/v1/projects/:id/priority
 * @desc    Update project urgency and priority level (low, medium, high, urgent)
 * @access  Authenticated User with PROJECT_UPDATE permission
 */
projectRouter.patch('/:id/priority', requirePermission(PERMISSIONS.PROJECT_UPDATE), ProjectController.updatePriority);

/**
 * @route   POST /api/v1/projects/:id/transfer-owner
 * @desc    Transfer project primary ownership and lead responsibility
 * @access  Authenticated User with PROJECT_UPDATE permission
 */
projectRouter.post('/:id/transfer-owner', requirePermission(PERMISSIONS.PROJECT_UPDATE), ProjectController.transferOwner);

/**
 * @route   GET /api/v1/projects/:id/members
 * @desc    List all members in the project with profile, role, and tenure details
 * @access  Authenticated User with PROJECT_READ permission
 */
projectRouter.get('/:id/members', requirePermission(PERMISSIONS.PROJECT_READ), ProjectController.listMembers);

/**
 * @route   GET /api/v1/projects/:id/eligible-members
 * @desc    List organization members eligible to be added to this project
 * @access  Authenticated User with PROJECT_UPDATE permission
 */
projectRouter.get('/:id/eligible-members', requirePermission(PERMISSIONS.PROJECT_UPDATE), ProjectController.getEligibleMembers);

/**
 * @route   POST /api/v1/projects/:id/members
 * @desc    Add eligible organization members to the project roster
 * @access  Authenticated User with PROJECT_UPDATE permission
 */
projectRouter.post('/:id/members', requirePermission(PERMISSIONS.PROJECT_UPDATE), ProjectController.addMembers);

/**
 * @route   PATCH /api/v1/projects/:id/members/:memberId/role
 * @desc    Update project-level role (lead, contributor, observer)
 * @access  Authenticated User with PROJECT_UPDATE permission
 */
projectRouter.patch('/:id/members/:memberId/role', requirePermission(PERMISSIONS.PROJECT_UPDATE), ProjectController.updateMemberRole);

/**
 * @route   DELETE /api/v1/projects/:id/members/:memberId
 * @desc    Remove a member from the project roster (owner protected)
 * @access  Authenticated User with PROJECT_UPDATE permission
 */
projectRouter.delete('/:id/members/:memberId', requirePermission(PERMISSIONS.PROJECT_UPDATE), ProjectController.removeMember);

/**
 * @route   GET /api/v1/projects/:id/members/activity
 * @desc    Get audit history scoped to project membership modifications
 * @access  Authenticated User with PROJECT_READ permission
 */
projectRouter.get('/:id/members/activity', requirePermission(PERMISSIONS.PROJECT_READ), ProjectController.getMemberActivity);

/**
 * @route   POST /api/v1/projects/:id/archive
 * @desc    Soft-archive a project after explicit name confirmation
 * @access  Authenticated User with PROJECT_DELETE permission
 */
projectRouter.post('/:id/archive', requirePermission(PERMISSIONS.PROJECT_DELETE), ProjectController.archive);

/**
 * @route   POST /api/v1/projects/:id/restore
 * @desc    Restore an archived project to planning status
 * @access  Authenticated User with PROJECT_UPDATE permission
 */
projectRouter.post('/:id/restore', requirePermission(PERMISSIONS.PROJECT_UPDATE), ProjectController.restore);

/**
 * @route   DELETE /api/v1/projects/:id
 * @desc    Permanently delete project after name confirmation
 * @access  Authenticated User with PROJECT_DELETE permission
 */
projectRouter.delete('/:id', requirePermission(PERMISSIONS.PROJECT_DELETE), ProjectController.delete);

/**
 * @route   GET /api/v1/projects/:id/activity
 * @desc    Get complete audit activity log for the project
 * @access  Authenticated User with PROJECT_READ permission
 */
projectRouter.get('/:id/activity', requirePermission(PERMISSIONS.PROJECT_READ), ProjectController.getActivity);

// ==============================================================================
// Phase 13: Project Kanban Board Routes
// ==============================================================================

/**
 * @route   GET /api/v1/projects/:projectId/kanban
 * @desc    Retrieve project Kanban board structure with workflow columns and task cards
 * @access  Authenticated User with PROJECT_READ permission
 */
projectRouter.get('/:projectId/kanban', requirePermission(PERMISSIONS.PROJECT_READ), KanbanController.getBoard);

/**
 * @route   POST /api/v1/projects/:projectId/tasks
 * @desc    Create a new task directly inside the project board
 * @access  Authenticated User with TASK_CREATE permission
 */
projectRouter.post('/:projectId/tasks', requirePermission(PERMISSIONS.TASK_CREATE), KanbanController.createTask);

/**
 * @route   PATCH /api/v1/projects/:projectId/kanban/tasks/:taskId/move
 * @desc    Move a task between workflow columns and update its order
 * @access  Authenticated User with TASK_UPDATE permission
 */
projectRouter.patch('/:projectId/kanban/tasks/:taskId/move', requirePermission(PERMISSIONS.TASK_UPDATE), KanbanController.moveTask);

/**
 * @route   PATCH /api/v1/projects/:projectId/kanban/reorder
 * @desc    Reorder tasks within a specific workflow column
 * @access  Authenticated User with TASK_UPDATE permission
 */
projectRouter.patch('/:projectId/kanban/reorder', requirePermission(PERMISSIONS.TASK_UPDATE), KanbanController.reorderColumn);


