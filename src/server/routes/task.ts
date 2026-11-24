import { Router } from 'express';
import { TaskController } from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { PERMISSIONS } from '../../shared/constants/roles.js';

export const taskRouter = Router();

// All task routes require authentication
taskRouter.use(authenticate);

/**
 * @route   GET /api/v1/tasks
 * @desc    List tasks with pagination, sorting, search, and filters
 * @access  Authenticated User with TASK_READ permission
 */
taskRouter.get('/', requirePermission(PERMISSIONS.TASK_READ), TaskController.listTasks);

/**
 * @route   POST /api/v1/tasks
 * @desc    Create a new task within a project
 * @access  Authenticated User with TASK_CREATE permission
 */
taskRouter.post('/', requirePermission(PERMISSIONS.TASK_CREATE), TaskController.createTask);

/**
 * @route   GET /api/v1/tasks/:id
 * @desc    Retrieve full task details
 * @access  Authenticated User with TASK_READ permission
 */
taskRouter.get('/:id', requirePermission(PERMISSIONS.TASK_READ), TaskController.getTask);

/**
 * @route   PATCH /api/v1/tasks/:id
 * @desc    Update task fields (title, description, dates, etc.)
 * @access  Authenticated User with TASK_UPDATE permission
 */
taskRouter.patch('/:id', requirePermission(PERMISSIONS.TASK_UPDATE), TaskController.updateTask);

/**
 * @route   PATCH /api/v1/tasks/:id/status
 * @desc    Update task workflow status (syncs with Kanban)
 * @access  Authenticated User with TASK_MANAGE_STATUS permission
 */
taskRouter.patch('/:id/status', requirePermission(PERMISSIONS.TASK_MANAGE_STATUS), TaskController.updateStatus);

/**
 * @route   PATCH /api/v1/tasks/:id/priority
 * @desc    Update task priority
 * @access  Authenticated User with TASK_UPDATE permission
 */
taskRouter.patch('/:id/priority', requirePermission(PERMISSIONS.TASK_UPDATE), TaskController.updatePriority);

/**
 * @route   PATCH /api/v1/tasks/:id/assignees
 * @desc    Assign or unassign task members
 * @access  Authenticated User with TASK_ASSIGN permission
 */
taskRouter.patch('/:id/assignees', requirePermission(PERMISSIONS.TASK_ASSIGN), TaskController.assignTask);

/**
 * @route   POST /api/v1/tasks/:id/archive
 * @desc    Safely archive a task (soft deletion)
 * @access  Authenticated User with TASK_UPDATE permission
 */
taskRouter.post('/:id/archive', requirePermission(PERMISSIONS.TASK_UPDATE), TaskController.archiveTask);

/**
 * @route   POST /api/v1/tasks/:id/restore
 * @desc    Restore an archived task back to active workflow
 * @access  Authenticated User with TASK_UPDATE permission
 */
taskRouter.post('/:id/restore', requirePermission(PERMISSIONS.TASK_UPDATE), TaskController.restoreTask);

/**
 * @route   DELETE /api/v1/tasks/:id
 * @desc    Permanently delete a task (RBAC-guarded)
 * @access  Authenticated User with TASK_DELETE permission
 */
taskRouter.delete('/:id', requirePermission(PERMISSIONS.TASK_DELETE), TaskController.deleteTask);

/**
 * @route   GET /api/v1/tasks/:id/activity
 * @desc    Retrieve audit activity trail for a task
 * @access  Authenticated User with TASK_READ permission
 */
taskRouter.get('/:id/activity', requirePermission(PERMISSIONS.TASK_READ), TaskController.getActivity);

/**
 * @route   POST /api/v1/tasks/:id/subtasks
 * @desc    Create a child subtask under a parent task
 * @access  Authenticated User with TASK_CREATE permission
 */
taskRouter.post('/:id/subtasks', requirePermission(PERMISSIONS.TASK_CREATE), TaskController.createSubtask);

/**
 * @route   GET /api/v1/tasks/:id/subtasks
 * @desc    Retrieve active child subtasks for a parent task
 * @access  Authenticated User with TASK_READ permission
 */
taskRouter.get('/:id/subtasks', requirePermission(PERMISSIONS.TASK_READ), TaskController.listSubtasks);

/**
 * @route   POST /api/v1/tasks/:id/dependencies
 * @desc    Add a prerequisite dependency with Cycle Detection
 * @access  Authenticated User with TASK_UPDATE permission
 */
taskRouter.post('/:id/dependencies', requirePermission(PERMISSIONS.TASK_UPDATE), TaskController.addDependency);

/**
 * @route   DELETE /api/v1/tasks/:id/dependencies/:prerequisiteId
 * @desc    Remove a prerequisite dependency
 * @access  Authenticated User with TASK_UPDATE permission
 */
taskRouter.delete('/:id/dependencies/:prerequisiteId', requirePermission(PERMISSIONS.TASK_UPDATE), TaskController.removeDependency);

/**
 * @route   GET /api/v1/tasks/:id/dependencies
 * @desc    Retrieve prerequisites and dependents with derived isBlocked state
 * @access  Authenticated User with TASK_READ permission
 */
taskRouter.get('/:id/dependencies', requirePermission(PERMISSIONS.TASK_READ), TaskController.getDependencies);

