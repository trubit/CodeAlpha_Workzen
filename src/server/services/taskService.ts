import mongoose from 'mongoose';
import { TaskModel, ITaskDocument } from '../models/Task.js';
import { ProjectModel } from '../models/Project.js';
import { UserModel } from '../models/User.js';
import { AuditLogModel } from '../models/AuditLog.js';
import { OrganisationMembershipModel } from '../models/OrganisationMembership.js';
import { getIO } from '../socket/index.js';
import { TASK_STATUS, TASK_PRIORITY } from '../../shared/constants/status.js';
import {
  CreateTaskInput,
  UpdateTaskInput,
  TaskListQuery,
  CreateSubtaskInput
} from '../../shared/validation/task.js';

export interface FormattedTask {
  id: string;
  taskNumber: number;
  taskKey: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  project: {
    id: string;
    name: string;
    key: string;
    color: string;
  };
  workspace?: {
    id: string;
    name: string;
  };
  assignees: Array<{
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  }>;
  reporter?: {
    id: string;
    name: string;
    email: string;
  };
  startDate?: Date;
  dueDate?: Date;
  estimatedHours: number;
  loggedHours: number;
  tags: string[];
  order: number;
  parentId?: string;
  parentTask?: {
    id: string;
    taskKey: string;
    title: string;
    status: string;
  };
  subtaskProgress?: {
    total: number;
    completed: number;
    remaining: number;
    percentage: number;
  };
  blockedByIds?: string[];
  isBlocked?: boolean;
  blockedByTasks?: Array<{
    id: string;
    taskKey: string;
    title: string;
    status: string;
    priority?: string;
  }>;
  blocksTasks?: Array<{
    id: string;
    taskKey: string;
    title: string;
    status: string;
    priority?: string;
  }>;
  isArchived: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskListResponse {
  tasks: FormattedTask[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
  telemetry: {
    total: number;
    todoCount: number;
    inProgressCount: number;
    reviewCount: number;
    doneCount: number;
    urgentCount: number;
  };
}

export class TaskService {
  /**
   * Helper to format a Mongoose task document into a standard FormattedTask
   */
  private static formatTask(t: any): FormattedTask {
    const project = t.projectId || {};
    const workspace = t.workspaceId || {};
    const taskKey = `${project.key || 'TASK'}-${t.taskNumber}`;

    const assignees = (t.assigneeIds || []).map((u: any) => ({
      id: u._id ? u._id.toString() : u.toString(),
      name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Team Member',
      email: u.email || '',
      avatarUrl: u.avatarUrl
    }));

    const reporter = t.reporterId
      ? {
          id: t.reporterId._id ? t.reporterId._id.toString() : t.reporterId.toString(),
          name:
            t.reporterId.name ||
            `${t.reporterId.firstName || ''} ${t.reporterId.lastName || ''}`.trim() ||
            t.reporterId.email ||
            'Reporter',
          email: t.reporterId.email || ''
        }
      : undefined;

    return {
      id: t._id.toString(),
      taskNumber: t.taskNumber,
      taskKey,
      title: t.title,
      description: t.description || '',
      status: t.status,
      priority: t.priority,
      project: {
        id: project._id ? project._id.toString() : (project.id || ''),
        name: project.name || 'Project',
        key: project.key || 'PROJ',
        color: project.color || '#4F46E5'
      },
      workspace: workspace._id
        ? {
            id: workspace._id.toString(),
            name: workspace.name || 'Workspace'
          }
        : undefined,
      assignees,
      reporter,
      startDate: t.startDate,
      dueDate: t.dueDate,
      estimatedHours: t.estimatedHours || 0,
      loggedHours: t.loggedHours || 0,
      tags: t.tags || [],
      order: t.order || 0,
      parentId: t.parentId ? (t.parentId._id ? t.parentId._id.toString() : t.parentId.toString()) : undefined,
      blockedByIds: (t.blockedByIds || []).map((b: any) => (b._id ? b._id.toString() : b.toString())),
      isArchived: Boolean(t.isArchived),
      archivedAt: t.archivedAt,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt
    };
  }

  /**
   * Retrieves paginated, sorted, and filtered task list scoped to tenant and project
   */
  public static async getTasks(
    userId: string,
    organisationId: string,
    query: TaskListQuery
  ): Promise<TaskListResponse> {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);

    // Build filter query
    const filter: any = {
      organisationId: orgObjId
    };

    // Archival state
    filter.isArchived = Boolean(query.isArchived);

    // Project filtering
    if (query.projectId && mongoose.Types.ObjectId.isValid(query.projectId)) {
      filter.projectId = new mongoose.Types.ObjectId(query.projectId);
    }

    // Workspace filtering
    if (query.workspaceId && mongoose.Types.ObjectId.isValid(query.workspaceId)) {
      filter.workspaceId = new mongoose.Types.ObjectId(query.workspaceId);
    }

    // Status filtering (supports single or comma-separated)
    if (query.status) {
      const statuses = query.status.split(',').map((s) => s.trim()).filter(Boolean);
      if (statuses.length === 1) {
        filter.status = statuses[0];
      } else if (statuses.length > 1) {
        filter.status = { $in: statuses };
      }
    }

    // Priority filtering
    if (query.priority) {
      filter.priority = query.priority;
    }

    // Assignee filtering
    if (query.assigneeId && mongoose.Types.ObjectId.isValid(query.assigneeId)) {
      filter.assigneeIds = { $in: [new mongoose.Types.ObjectId(query.assigneeId)] };
    }

    // Search query (title, tags)
    if (query.search && query.search.trim()) {
      const escaped = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escaped, 'i');
      filter.$or = [
        { title: { $regex: searchRegex } },
        { tags: { $in: [searchRegex] } }
      ];
    }

    // Due date filtering
    if (query.dueDate && query.dueDate !== 'all') {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      if (query.dueDate === 'overdue') {
        filter.dueDate = { $lt: startOfToday };
        filter.status = { $ne: TASK_STATUS.DONE };
      } else if (query.dueDate === 'today') {
        filter.dueDate = { $gte: startOfToday, $lte: endOfToday };
      } else if (query.dueDate === 'week') {
        const nextWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);
        filter.dueDate = { $gte: startOfToday, $lte: nextWeek };
      }
    }

    // Sorting
    const sortField = query.sortBy || 'createdAt';
    const sortDir = query.sortOrder === 'asc' ? 1 : -1;
    const sortOptions: any = {};
    sortOptions[sortField] = sortDir;
    // Secondary sort for consistency
    if (sortField !== 'taskNumber') {
      sortOptions.taskNumber = -1;
    }

    // Pagination
    const page = query.page || 1;
    const limit = query.limit || 25;
    const skip = (page - 1) * limit;

    // Execute queries in parallel
    const [tasks, total, telemetryAgg] = await Promise.all([
      TaskModel.find(filter)
        .populate('projectId', 'name key color visibility')
        .populate('workspaceId', 'name')
        .populate('assigneeIds', 'firstName lastName name email avatarUrl')
        .populate('reporterId', 'firstName lastName name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      TaskModel.countDocuments(filter),
      TaskModel.aggregate([
        { $match: { organisationId: orgObjId, isArchived: Boolean(query.isArchived) } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            todoCount: {
              $sum: { $cond: [{ $eq: ['$status', TASK_STATUS.TODO] }, 1, 0] }
            },
            inProgressCount: {
              $sum: { $cond: [{ $eq: ['$status', TASK_STATUS.IN_PROGRESS] }, 1, 0] }
            },
            reviewCount: {
              $sum: { $cond: [{ $eq: ['$status', TASK_STATUS.REVIEW] }, 1, 0] }
            },
            doneCount: {
              $sum: { $cond: [{ $eq: ['$status', TASK_STATUS.DONE] }, 1, 0] }
            },
            urgentCount: {
              $sum: { $cond: [{ $eq: ['$priority', TASK_PRIORITY.URGENT] }, 1, 0] }
            }
          }
        }
      ])
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    const telem = telemetryAgg[0] || {
      total: 0,
      todoCount: 0,
      inProgressCount: 0,
      reviewCount: 0,
      doneCount: 0,
      urgentCount: 0
    };

    const taskIds = tasks.map((t: any) => t._id);

    // Compute subtask progress in bulk
    const subtaskAgg = await TaskModel.aggregate([
      {
        $match: {
          parentId: { $in: taskIds },
          organisationId: orgObjId,
          isArchived: false
        }
      },
      {
        $group: {
          _id: '$parentId',
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', TASK_STATUS.DONE] }, 1, 0] }
          }
        }
      }
    ]);

    const subtaskMap = new Map<string, { total: number; completed: number; remaining: number; percentage: number }>();
    for (const item of subtaskAgg) {
      const total = item.total;
      const completed = item.completed;
      subtaskMap.set(item._id.toString(), {
        total,
        completed,
        remaining: total - completed,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0
      });
    }

    // Compute blocked status in bulk
    const allPrereqIds = tasks.flatMap((t: any) => t.blockedByIds || []);
    const unfinishedPrereqs = allPrereqIds.length > 0
      ? await TaskModel.find({
          _id: { $in: allPrereqIds },
          organisationId: orgObjId,
          status: { $ne: TASK_STATUS.DONE },
          isArchived: false
        })
          .select('_id')
          .lean()
      : [];
    const unfinishedSet = new Set(unfinishedPrereqs.map((p: any) => p._id.toString()));

    const formattedTasks = tasks.map((t: any) => {
      const formatted = TaskService.formatTask(t);
      formatted.subtaskProgress = subtaskMap.get(t._id.toString()) || {
        total: 0,
        completed: 0,
        remaining: 0,
        percentage: 0
      };
      const prereqs = (t.blockedByIds || []).map((id: any) => (id._id ? id._id.toString() : id.toString()));
      formatted.isBlocked = prereqs.some((id: string) => unfinishedSet.has(id));
      return formatted;
    });

    return {
      tasks: formattedTasks,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages
      },
      telemetry: {
        total: telem.total || 0,
        todoCount: telem.todoCount || 0,
        inProgressCount: telem.inProgressCount || 0,
        reviewCount: telem.reviewCount || 0,
        doneCount: telem.doneCount || 0,
        urgentCount: telem.urgentCount || 0
      }
    };
  }

  /**
   * Retrieves single task details with populated relations
   */
  public static async getTaskById(
    userId: string,
    organisationId: string,
    taskId: string
  ): Promise<FormattedTask> {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);
    const taskObjId = new mongoose.Types.ObjectId(taskId);

    const task: any = await TaskModel.findOne({
      _id: taskObjId,
      organisationId: orgObjId
    })
      .populate('projectId', 'name key color visibility')
      .populate('workspaceId', 'name')
      .populate('assigneeIds', 'firstName lastName name email avatarUrl')
      .populate('reporterId', 'firstName lastName name email')
      .populate('parentId', 'taskNumber title status')
      .populate({
        path: 'blockedByIds',
        select: 'taskNumber title status priority projectId isArchived',
        populate: { path: 'projectId', select: 'key' }
      })
      .lean();

    if (!task) {
      const err: any = new Error('Task not found');
      err.statusCode = 404;
      err.code = 'TASK_NOT_FOUND';
      throw err;
    }

    // Parallel lookup for subtasks and downstream dependents ("Blocks")
    const [subtasks, dependentsRaw] = await Promise.all([
      TaskModel.find({
        parentId: taskObjId,
        organisationId: orgObjId,
        isArchived: false
      })
        .select('status')
        .lean(),
      TaskModel.find({
        blockedByIds: taskObjId,
        organisationId: orgObjId,
        isArchived: false
      })
        .populate('projectId', 'key')
        .select('taskNumber title status priority projectId')
        .lean()
    ]);

    const formatted = TaskService.formatTask(task);

    // Subtask progress
    const subTotal = subtasks.length;
    const subCompleted = subtasks.filter((s: any) => s.status === TASK_STATUS.DONE).length;
    formatted.subtaskProgress = {
      total: subTotal,
      completed: subCompleted,
      remaining: subTotal - subCompleted,
      percentage: subTotal > 0 ? Math.round((subCompleted / subTotal) * 100) : 0
    };

    // Parent task info
    if (task.parentId && typeof task.parentId === 'object') {
      const pKey = task.projectId?.key || 'TASK';
      formatted.parentTask = {
        id: task.parentId._id.toString(),
        taskKey: `${pKey}-${task.parentId.taskNumber}`,
        title: task.parentId.title,
        status: task.parentId.status
      };
    }

    // Blocked by tasks (Prerequisites)
    const blockedByTasks = (task.blockedByIds || []).map((b: any) => ({
      id: b._id.toString(),
      taskKey: `${b.projectId?.key || 'TASK'}-${b.taskNumber}`,
      title: b.title,
      status: b.status,
      priority: b.priority,
      isArchived: Boolean(b.isArchived)
    }));
    formatted.blockedByTasks = blockedByTasks;

    // Derived isBlocked boolean: true if any prerequisite is not DONE and not archived
    formatted.isBlocked = blockedByTasks.some(
      (b: any) => b.status !== TASK_STATUS.DONE && !b.isArchived
    );

    // Dependents ("Blocks")
    formatted.blocksTasks = dependentsRaw.map((d: any) => ({
      id: d._id.toString(),
      taskKey: `${d.projectId?.key || 'TASK'}-${d.taskNumber}`,
      title: d.title,
      status: d.status,
      priority: d.priority
    }));

    return formatted;
  }

  /**
   * Creates a new task
   */
  public static async createTask(
    userId: string,
    organisationId: string,
    input: CreateTaskInput
  ): Promise<FormattedTask> {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);
    const userObjId = new mongoose.Types.ObjectId(userId);
    const projObjId = new mongoose.Types.ObjectId(input.projectId);

    // 1. Verify project exists and belongs to org
    const project: any = await ProjectModel.findOne({
      _id: projObjId,
      organisationId: orgObjId
    }).lean();

    if (!project) {
      const err: any = new Error('Project not found');
      err.statusCode = 404;
      err.code = 'PROJECT_NOT_FOUND';
      throw err;
    }

    // 2. Validate assignees
    const assigneeObjIds: mongoose.Types.ObjectId[] = [];
    if (input.assigneeIds && input.assigneeIds.length > 0) {
      for (const aId of input.assigneeIds) {
        if (mongoose.Types.ObjectId.isValid(aId)) {
          assigneeObjIds.push(new mongoose.Types.ObjectId(aId));
        }
      }
    }

    // 3. Sequential task number for project
    const latestTask: any = await TaskModel.findOne({ projectId: projObjId })
      .sort({ taskNumber: -1 })
      .select('taskNumber')
      .lean();

    const nextTaskNumber = (latestTask?.taskNumber || 0) + 1;

    // 4. Next column order
    const initialStatus = input.status || TASK_STATUS.TODO;
    const latestInCol: any = await TaskModel.findOne({
      projectId: projObjId,
      status: initialStatus
    })
      .sort({ order: -1 })
      .select('order')
      .lean();

    const nextOrder = latestInCol && typeof latestInCol.order === 'number'
      ? latestInCol.order + 1
      : 0;

    // 5. Create Task
    const task = await TaskModel.create({
      organisationId: orgObjId,
      workspaceId: project.workspaceId,
      projectId: projObjId,
      taskNumber: nextTaskNumber,
      title: input.title.trim(),
      description: input.description?.trim() || '',
      status: initialStatus,
      priority: input.priority || TASK_PRIORITY.MEDIUM,
      assigneeIds: assigneeObjIds,
      reporterId: userObjId,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      estimatedHours: input.estimatedHours || 0,
      tags: input.tags || [],
      order: nextOrder,
      isArchived: false
    });

    // 6. Audit Log
    await AuditLogModel.create({
      organisationId: orgObjId,
      userId: userObjId,
      action: 'TASK_CREATED',
      entityType: 'task',
      entityId: task._id,
      changes: {
        taskKey: `${project.key}-${nextTaskNumber}`,
        title: task.title,
        status: task.status,
        priority: task.priority
      }
    });

    // 7. Socket.IO Broadcast
    const io = getIO();
    if (io) {
      io.to(`project:${input.projectId}`).emit('task:created', {
        taskId: task._id.toString(),
        projectId: input.projectId,
        taskKey: `${project.key}-${nextTaskNumber}`,
        title: task.title,
        status: task.status
      });
      io.to(`project:${input.projectId}`).emit('kanban:task_created', {
        taskId: task._id.toString(),
        projectId: input.projectId
      });
    }

    return TaskService.getTaskById(userId, organisationId, task._id.toString());
  }

  /**
   * Updates an existing task
   */
  public static async updateTask(
    userId: string,
    organisationId: string,
    taskId: string,
    input: UpdateTaskInput
  ): Promise<FormattedTask> {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);
    const userObjId = new mongoose.Types.ObjectId(userId);
    const taskObjId = new mongoose.Types.ObjectId(taskId);

    const task = await TaskModel.findOne({
      _id: taskObjId,
      organisationId: orgObjId
    });

    if (!task) {
      const err: any = new Error('Task not found');
      err.statusCode = 404;
      err.code = 'TASK_NOT_FOUND';
      throw err;
    }

    const previousStatus = task.status;
    const previousPriority = task.priority;
    const previousTitle = task.title;

    if (input.title !== undefined) task.title = input.title.trim();
    if (input.description !== undefined) task.description = input.description.trim();
    if (input.status !== undefined) task.status = input.status;
    if (input.priority !== undefined) task.priority = input.priority;
    if (input.startDate !== undefined) task.startDate = input.startDate ? new Date(input.startDate) : undefined;
    if (input.dueDate !== undefined) task.dueDate = input.dueDate ? new Date(input.dueDate) : undefined;
    if (input.estimatedHours !== undefined) task.estimatedHours = input.estimatedHours;
    if (input.tags !== undefined) task.tags = input.tags;

    if (input.assigneeIds !== undefined) {
      task.assigneeIds = input.assigneeIds
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
    }

    await task.save();

    // Audit Log
    await AuditLogModel.create({
      organisationId: orgObjId,
      userId: userObjId,
      action: 'TASK_UPDATED',
      entityType: 'task',
      entityId: task._id,
      changes: {
        title: input.title !== undefined ? { from: previousTitle, to: task.title } : undefined,
        status: input.status !== undefined ? { from: previousStatus, to: task.status } : undefined,
        priority: input.priority !== undefined ? { from: previousPriority, to: task.priority } : undefined
      }
    });

    // Real-Time Broadcast
    const io = getIO();
    if (io) {
      io.to(`project:${task.projectId.toString()}`).emit('task:updated', {
        taskId: task._id.toString(),
        projectId: task.projectId.toString()
      });
      if (input.status && input.status !== previousStatus) {
        io.to(`project:${task.projectId.toString()}`).emit('kanban:task_moved', {
          taskId: task._id.toString(),
          projectId: task.projectId.toString(),
          previousStatus,
          targetStatus: task.status
        });
      }
    }

    return TaskService.getTaskById(userId, organisationId, taskId);
  }

  /**
   * Updates only task status (bi-directional Kanban sync)
   */
  public static async updateStatus(
    userId: string,
    organisationId: string,
    taskId: string,
    status: string
  ): Promise<FormattedTask> {
    if (!Object.values(TASK_STATUS).includes(status as any)) {
      const err: any = new Error(`Invalid status '${status}'`);
      err.statusCode = 400;
      err.code = 'INVALID_STATUS';
      throw err;
    }

    return TaskService.updateTask(userId, organisationId, taskId, { status: status as any });
  }

  /**
   * Updates only task priority
   */
  public static async updatePriority(
    userId: string,
    organisationId: string,
    taskId: string,
    priority: string
  ): Promise<FormattedTask> {
    if (!Object.values(TASK_PRIORITY).includes(priority as any)) {
      const err: any = new Error(`Invalid priority '${priority}'`);
      err.statusCode = 400;
      err.code = 'INVALID_PRIORITY';
      throw err;
    }

    return TaskService.updateTask(userId, organisationId, taskId, { priority: priority as any });
  }

  /**
   * Updates task assignees
   */
  public static async assignTask(
    userId: string,
    organisationId: string,
    taskId: string,
    assigneeIds: string[]
  ): Promise<FormattedTask> {
    return TaskService.updateTask(userId, organisationId, taskId, { assigneeIds });
  }

  /**
   * Safely archives a task (soft-deletion)
   */
  public static async archiveTask(
    userId: string,
    organisationId: string,
    taskId: string
  ): Promise<FormattedTask> {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);
    const userObjId = new mongoose.Types.ObjectId(userId);
    const taskObjId = new mongoose.Types.ObjectId(taskId);

    const task = await TaskModel.findOne({
      _id: taskObjId,
      organisationId: orgObjId
    });

    if (!task) {
      const err: any = new Error('Task not found');
      err.statusCode = 404;
      err.code = 'TASK_NOT_FOUND';
      throw err;
    }

    task.isArchived = true;
    task.archivedAt = new Date();
    task.archivedBy = userObjId;
    await task.save();

    // Cascade archival to all child subtasks
    await TaskModel.updateMany(
      { parentId: task._id, organisationId: orgObjId, isArchived: false },
      { isArchived: true, archivedAt: new Date(), archivedBy: userObjId }
    );

    // Audit Log
    await AuditLogModel.create({
      organisationId: orgObjId,
      userId: userObjId,
      action: 'TASK_ARCHIVED',
      entityType: 'task',
      entityId: task._id
    });

    // Broadcast
    const io = getIO();
    if (io) {
      io.to(`project:${task.projectId.toString()}`).emit('task:archived', {
        taskId: task._id.toString(),
        projectId: task.projectId.toString()
      });
      io.to(`project:${task.projectId.toString()}`).emit('kanban:task_moved', {
        taskId: task._id.toString(),
        projectId: task.projectId.toString()
      });
    }

    return TaskService.getTaskById(userId, organisationId, taskId);
  }

  /**
   * Restores an archived task
   */
  public static async restoreTask(
    userId: string,
    organisationId: string,
    taskId: string
  ): Promise<FormattedTask> {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);
    const userObjId = new mongoose.Types.ObjectId(userId);
    const taskObjId = new mongoose.Types.ObjectId(taskId);

    const task = await TaskModel.findOne({
      _id: taskObjId,
      organisationId: orgObjId
    });

    if (!task) {
      const err: any = new Error('Task not found');
      err.statusCode = 404;
      err.code = 'TASK_NOT_FOUND';
      throw err;
    }

    task.isArchived = false;
    task.archivedAt = undefined;
    task.archivedBy = undefined;
    await task.save();

    // Cascade restoration to child subtasks
    await TaskModel.updateMany(
      { parentId: task._id, organisationId: orgObjId, isArchived: true },
      { isArchived: false, archivedAt: undefined, archivedBy: undefined }
    );

    // Audit Log
    await AuditLogModel.create({
      organisationId: orgObjId,
      userId: userObjId,
      action: 'TASK_RESTORED',
      entityType: 'task',
      entityId: task._id
    });

    // Broadcast
    const io = getIO();
    if (io) {
      io.to(`project:${task.projectId.toString()}`).emit('task:restored', {
        taskId: task._id.toString(),
        projectId: task.projectId.toString()
      });
      io.to(`project:${task.projectId.toString()}`).emit('kanban:task_created', {
        taskId: task._id.toString(),
        projectId: task.projectId.toString()
      });
    }

    return TaskService.getTaskById(userId, organisationId, taskId);
  }

  /**
   * Permanently deletes a task (RBAC-guarded)
   */
  public static async deleteTask(
    userId: string,
    organisationId: string,
    taskId: string
  ): Promise<{ success: boolean; taskId: string }> {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);
    const userObjId = new mongoose.Types.ObjectId(userId);
    const taskObjId = new mongoose.Types.ObjectId(taskId);

    const task = await TaskModel.findOne({
      _id: taskObjId,
      organisationId: orgObjId
    });

    if (!task) {
      const err: any = new Error('Task not found');
      err.statusCode = 404;
      err.code = 'TASK_NOT_FOUND';
      throw err;
    }

    const projectIdStr = task.projectId.toString();
    await TaskModel.deleteOne({ _id: taskObjId });

    // Cascade delete subtasks and remove references from prerequisite lists
    await TaskModel.deleteMany({ parentId: taskObjId, organisationId: orgObjId });
    await TaskModel.updateMany(
      { organisationId: orgObjId, blockedByIds: taskObjId },
      { $pull: { blockedByIds: taskObjId } }
    );

    // Audit Log
    await AuditLogModel.create({
      organisationId: orgObjId,
      userId: userObjId,
      action: 'TASK_DELETED',
      entityType: 'task',
      entityId: taskObjId,
      changes: {
        taskNumber: task.taskNumber,
        title: task.title
      }
    });

    // Broadcast
    const io = getIO();
    if (io) {
      io.to(`project:${projectIdStr}`).emit('task:deleted', {
        taskId,
        projectId: projectIdStr
      });
      io.to(`project:${projectIdStr}`).emit('kanban:task_moved', {
        taskId,
        projectId: projectIdStr
      });
    }

    return { success: true, taskId };
  }

  /**
   * Retrieves audit activity timeline for a task
   */
  public static async getTaskActivity(
    userId: string,
    organisationId: string,
    taskId: string,
    limit: number = 20
  ): Promise<any[]> {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);
    const taskObjId = new mongoose.Types.ObjectId(taskId);

    // Verify task exists in org
    const task = await TaskModel.findOne({ _id: taskObjId, organisationId: orgObjId }).select('_id');
    if (!task) {
      const err: any = new Error('Task not found');
      err.statusCode = 404;
      err.code = 'TASK_NOT_FOUND';
      throw err;
    }

    const logs: any[] = await AuditLogModel.find({
      organisationId: orgObjId,
      entityId: taskObjId
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'firstName lastName name email avatarUrl')
      .lean();

    return logs.map((l) => ({
      id: l._id.toString(),
      action: l.action,
      changes: l.changes,
      createdAt: l.createdAt,
      user: l.userId
        ? {
            id: l.userId._id ? l.userId._id.toString() : l.userId.toString(),
            name: l.userId.name || `${l.userId.firstName || ''} ${l.userId.lastName || ''}`.trim() || l.userId.email,
            avatarUrl: l.userId.avatarUrl
          }
        : undefined
    }));
  }

  /**
   * Creates a subtask under a parent task (strictly enforces max 1-level depth)
   */
  public static async createSubtask(
    userId: string,
    organisationId: string,
    parentTaskId: string,
    input: CreateSubtaskInput
  ): Promise<FormattedTask> {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);
    const userObjId = new mongoose.Types.ObjectId(userId);
    const parentObjId = new mongoose.Types.ObjectId(parentTaskId);

    const parentTask: any = await TaskModel.findOne({
      _id: parentObjId,
      organisationId: orgObjId
    });

    if (!parentTask) {
      const err: any = new Error('Parent task not found');
      err.statusCode = 404;
      err.code = 'PARENT_TASK_NOT_FOUND';
      throw err;
    }

    if (parentTask.isArchived) {
      const err: any = new Error('Cannot add subtasks to an archived task');
      err.statusCode = 400;
      err.code = 'PARENT_TASK_ARCHIVED';
      throw err;
    }

    // Enforce 1-level maximum nesting depth
    if (parentTask.parentId) {
      const err: any = new Error('Subtasks cannot have nested subtasks. Workzen enforces a strict 1-level subtask hierarchy.');
      err.statusCode = 400;
      err.code = 'SUBTASK_NESTING_LIMIT_EXCEEDED';
      throw err;
    }

    // Determine next task number for the project
    const latestTask: any = await TaskModel.findOne({ projectId: parentTask.projectId })
      .sort({ taskNumber: -1 })
      .select('taskNumber')
      .lean();
    const nextTaskNumber = (latestTask?.taskNumber || 0) + 1;

    const assigneeObjectIds = (input.assigneeIds || [])
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    const subtask = await TaskModel.create({
      organisationId: orgObjId,
      workspaceId: parentTask.workspaceId,
      projectId: parentTask.projectId,
      taskNumber: nextTaskNumber,
      title: input.title.trim(),
      description: input.description?.trim() || '',
      status: TASK_STATUS.TODO,
      priority: input.priority || TASK_PRIORITY.MEDIUM,
      assigneeIds: assigneeObjectIds,
      reporterId: userObjId,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      estimatedHours: input.estimatedHours || 0,
      parentId: parentTask._id,
      blockedByIds: [],
      order: 0,
      isArchived: false
    });

    // Audit Log
    await AuditLogModel.create({
      organisationId: orgObjId,
      userId: userObjId,
      action: 'SUBTASK_CREATED',
      entityType: 'task',
      entityId: subtask._id,
      changes: {
        parentId: parentTask._id.toString(),
        parentTitle: parentTask.title,
        title: subtask.title
      }
    });

    // Broadcast
    const io = getIO();
    if (io) {
      io.to(`project:${parentTask.projectId.toString()}`).emit('subtask:created', {
        parentTaskId: parentTask._id.toString(),
        subtaskId: subtask._id.toString(),
        projectId: parentTask.projectId.toString()
      });
    }

    return TaskService.getTaskById(userId, organisationId, subtask._id.toString());
  }

  /**
   * Retrieves all active subtasks for a parent task
   */
  public static async getSubtasks(
    userId: string,
    organisationId: string,
    parentTaskId: string
  ): Promise<FormattedTask[]> {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);
    const parentObjId = new mongoose.Types.ObjectId(parentTaskId);

    const parentTask: any = await TaskModel.findOne({
      _id: parentObjId,
      organisationId: orgObjId
    }).lean();

    if (!parentTask) {
      const err: any = new Error('Parent task not found');
      err.statusCode = 404;
      err.code = 'PARENT_TASK_NOT_FOUND';
      throw err;
    }

    const subtasks = await TaskModel.find({
      parentId: parentObjId,
      organisationId: orgObjId,
      isArchived: false
    })
      .populate('projectId', 'name key color visibility')
      .populate('workspaceId', 'name')
      .populate('assigneeIds', 'firstName lastName name email avatarUrl')
      .populate('reporterId', 'firstName lastName name email')
      .sort({ createdAt: 1 })
      .lean();

    return subtasks.map(TaskService.formatTask);
  }

  /**
   * Adds a prerequisite dependency with Cycle Detection (DFS/BFS graph traversal)
   */
  public static async addDependency(
    userId: string,
    organisationId: string,
    taskId: string,
    prerequisiteTaskId: string
  ): Promise<{ prerequisites: any[]; dependents: any[]; isBlocked: boolean }> {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);
    const userObjId = new mongoose.Types.ObjectId(userId);
    const taskObjId = new mongoose.Types.ObjectId(taskId);
    const prereqObjId = new mongoose.Types.ObjectId(prerequisiteTaskId);

    // 1. Check self-dependency
    if (taskId === prerequisiteTaskId) {
      const err: any = new Error('A task cannot depend on itself');
      err.statusCode = 400;
      err.code = 'CANNOT_DEPEND_ON_SELF';
      throw err;
    }

    // 2. Fetch both tasks
    const [task, prereqTask]: any[] = await Promise.all([
      TaskModel.findOne({ _id: taskObjId, organisationId: orgObjId }),
      TaskModel.findOne({ _id: prereqObjId, organisationId: orgObjId })
    ]);

    if (!task) {
      const err: any = new Error('Target task not found');
      err.statusCode = 404;
      err.code = 'TASK_NOT_FOUND';
      throw err;
    }

    if (!prereqTask) {
      const err: any = new Error('Prerequisite task not found');
      err.statusCode = 404;
      err.code = 'PREREQUISITE_NOT_FOUND';
      throw err;
    }

    // 3. Cycle Detection: Check if adding prereqTask to task's blockedByIds creates a cycle
    // (i.e. check if prereqTask directly or indirectly depends on task)
    const visited = new Set<string>();
    const queue = [prerequisiteTaskId];
    visited.add(prerequisiteTaskId);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (currentId === taskId) {
        const err: any = new Error(
          `Circular dependency detected: Task '${task.title}' cannot depend on '${prereqTask.title}' as it creates a cyclic loop.`
        );
        err.statusCode = 400;
        err.code = 'CIRCULAR_DEPENDENCY_DETECTED';
        throw err;
      }

      const currentTask: any = await TaskModel.findOne({
        _id: new mongoose.Types.ObjectId(currentId),
        organisationId: orgObjId
      })
        .select('blockedByIds')
        .lean();

      if (currentTask && Array.isArray(currentTask.blockedByIds)) {
        for (const nextPrereqId of currentTask.blockedByIds) {
          const nextStr = nextPrereqId.toString();
          if (!visited.has(nextStr)) {
            visited.add(nextStr);
            queue.push(nextStr);
          }
        }
      }
    }

    // 4. Add dependency (avoid duplicate entries)
    await TaskModel.updateOne(
      { _id: taskObjId },
      { $addToSet: { blockedByIds: prereqObjId } }
    );

    // Audit Log
    await AuditLogModel.create({
      organisationId: orgObjId,
      userId: userObjId,
      action: 'TASK_DEPENDENCY_ADDED',
      entityType: 'task',
      entityId: task._id,
      changes: {
        prerequisiteTaskId: prereqTask._id.toString(),
        prerequisiteTitle: prereqTask.title
      }
    });

    // Real-Time Broadcast
    const io = getIO();
    if (io) {
      io.to(`project:${task.projectId.toString()}`).emit('task:dependency_added', {
        taskId: task._id.toString(),
        prerequisiteTaskId: prereqTask._id.toString(),
        projectId: task.projectId.toString()
      });
    }

    return TaskService.getDependencies(userId, organisationId, taskId);
  }

  /**
   * Removes a prerequisite dependency
   */
  public static async removeDependency(
    userId: string,
    organisationId: string,
    taskId: string,
    prerequisiteTaskId: string
  ): Promise<{ prerequisites: any[]; dependents: any[]; isBlocked: boolean }> {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);
    const userObjId = new mongoose.Types.ObjectId(userId);
    const taskObjId = new mongoose.Types.ObjectId(taskId);
    const prereqObjId = new mongoose.Types.ObjectId(prerequisiteTaskId);

    const task = await TaskModel.findOne({ _id: taskObjId, organisationId: orgObjId });
    if (!task) {
      const err: any = new Error('Task not found');
      err.statusCode = 404;
      err.code = 'TASK_NOT_FOUND';
      throw err;
    }

    await TaskModel.updateOne(
      { _id: taskObjId },
      { $pull: { blockedByIds: prereqObjId } }
    );

    // Audit Log
    await AuditLogModel.create({
      organisationId: orgObjId,
      userId: userObjId,
      action: 'TASK_DEPENDENCY_REMOVED',
      entityType: 'task',
      entityId: task._id,
      changes: {
        removedPrerequisiteId: prerequisiteTaskId
      }
    });

    // Real-Time Broadcast
    const io = getIO();
    if (io) {
      io.to(`project:${task.projectId.toString()}`).emit('task:dependency_removed', {
        taskId: task._id.toString(),
        prerequisiteTaskId,
        projectId: task.projectId.toString()
      });
    }

    return TaskService.getDependencies(userId, organisationId, taskId);
  }

  /**
   * Retrieves full dependency graph for a task (Prerequisites and Dependents)
   */
  public static async getDependencies(
    userId: string,
    organisationId: string,
    taskId: string
  ): Promise<{ prerequisites: any[]; dependents: any[]; isBlocked: boolean }> {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);
    const taskObjId = new mongoose.Types.ObjectId(taskId);

    const task: any = await TaskModel.findOne({ _id: taskObjId, organisationId: orgObjId })
      .populate({
        path: 'blockedByIds',
        select: 'taskNumber title status priority projectId isArchived',
        populate: { path: 'projectId', select: 'key' }
      })
      .lean();

    if (!task) {
      const err: any = new Error('Task not found');
      err.statusCode = 404;
      err.code = 'TASK_NOT_FOUND';
      throw err;
    }

    // Dependents: tasks that have this task in their blockedByIds
    const dependentsRaw: any[] = await TaskModel.find({
      blockedByIds: taskObjId,
      organisationId: orgObjId,
      isArchived: false
    })
      .populate('projectId', 'key')
      .select('taskNumber title status priority projectId')
      .lean();

    const prerequisites = (task.blockedByIds || []).map((b: any) => ({
      id: b._id.toString(),
      taskKey: `${b.projectId?.key || 'TASK'}-${b.taskNumber}`,
      title: b.title,
      status: b.status,
      priority: b.priority,
      isArchived: Boolean(b.isArchived)
    }));

    const dependents = dependentsRaw.map((d: any) => ({
      id: d._id.toString(),
      taskKey: `${d.projectId?.key || 'TASK'}-${d.taskNumber}`,
      title: d.title,
      status: d.status,
      priority: d.priority
    }));

    const isBlocked = prerequisites.some(
      (b: any) => b.status !== TASK_STATUS.DONE && !b.isArchived
    );

    return {
      prerequisites,
      dependents,
      isBlocked
    };
  }
}

