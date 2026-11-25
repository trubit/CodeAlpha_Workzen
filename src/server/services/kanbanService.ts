import mongoose from 'mongoose';
import { TaskModel, ITaskDocument } from '../models/Task.js';
import { ProjectModel } from '../models/Project.js';
import { OrganisationModel } from '../models/Organisation.js';
import { UserModel } from '../models/User.js';
import { AuditLogModel } from '../models/AuditLog.js';
import { getIO } from '../socket/index.js';
import { TASK_STATUS, TASK_PRIORITY } from '../../shared/constants/status.js';
import {
  CreateTaskInput,
  MoveTaskInput,
  KanbanBoardQuery
} from '../../shared/validation/task.js';

export type CreateKanbanTaskInput = Omit<CreateTaskInput, 'projectId' | 'workspaceId'> & {
  projectId?: string;
  workspaceId?: string;
};

export interface FormattedKanbanTask {
  id: string;
  taskNumber: number;
  taskKey: string;
  title: string;
  description: string;
  status: string;
  priority: string;
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
  dueDate?: Date;
  estimatedHours: number;
  loggedHours: number;
  tags: string[];
  order: number;
  parentId?: string;
  subtaskProgress?: {
    total: number;
    completed: number;
    remaining: number;
    percentage: number;
  };
  isBlocked?: boolean;
  blockedCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface KanbanColumn {
  id: string;
  label: string;
  color: string;
  tasks: FormattedKanbanTask[];
  count: number;
}

export interface KanbanBoardResponse {
  project: {
    id: string;
    name: string;
    key: string;
    color: string;
    visibility: string;
    ownerId?: string;
  };
  columns: KanbanColumn[];
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  reviewTasks: number;
  progressPercentage: number;
}

export class KanbanService {
  /**
   * Retrieves the full Kanban board structure for a project with columns, tasks, and telemetry
   */
  public static async getProjectKanbanBoard(
    userId: string,
    organisationId: string,
    projectId: string,
    query?: KanbanBoardQuery
  ): Promise<KanbanBoardResponse> {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);
    const projObjId = new mongoose.Types.ObjectId(projectId);

    // 1. Verify project belongs to organization
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

    // 2. Build MongoDB query filter
    const taskFilter: any = {
      projectId: projObjId,
      organisationId: orgObjId
    };

    if (query?.priority) {
      taskFilter.priority = query.priority;
    }

    if (query?.assigneeId && mongoose.Types.ObjectId.isValid(query.assigneeId)) {
      taskFilter.assigneeIds = new mongoose.Types.ObjectId(query.assigneeId);
    }

    if (query?.search && query.search.trim()) {
      const q = query.search.trim();
      const regex = new RegExp(q, 'i');
      taskFilter.$or = [
        { title: regex },
        { description: regex },
        { tags: regex }
      ];

      // If search looks like a number, check taskNumber
      const parsedNum = parseInt(q.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(parsedNum)) {
        taskFilter.$or.push({ taskNumber: parsedNum });
      }
    }

    // Due date filter
    if (query?.dueDate && query.dueDate !== 'all') {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      if (query.dueDate === 'overdue') {
        taskFilter.dueDate = { $lt: startOfToday };
        taskFilter.status = { $ne: TASK_STATUS.DONE };
      } else if (query.dueDate === 'today') {
        taskFilter.dueDate = { $gte: startOfToday, $lte: endOfToday };
      } else if (query.dueDate === 'week') {
        const nextWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);
        taskFilter.dueDate = { $gte: startOfToday, $lte: nextWeek };
      }
    }

    // Sort definition
    let sortOptions: any = { order: 1, createdAt: 1 };
    if (query?.sortBy === 'priority') {
      sortOptions = { priority: -1, order: 1 };
    } else if (query?.sortBy === 'dueDate') {
      sortOptions = { dueDate: 1, order: 1 };
    } else if (query?.sortBy === 'createdAt') {
      sortOptions = { createdAt: -1 };
    }

    // 3. Fetch matching tasks
    const rawTasks = await TaskModel.find(taskFilter)
      .sort(sortOptions)
      .populate('assigneeIds', 'firstName lastName name email avatarUrl')
      .populate('reporterId', 'firstName lastName name email')
      .lean();

    const taskIds = rawTasks.map((t: any) => t._id);

    // Compute subtask progress in bulk for board cards
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

    // Compute blocked status in bulk for board cards
    const allPrereqIds = rawTasks.flatMap((t: any) => t.blockedByIds || []);
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

    // 4. Format tasks
    const formattedTasks: FormattedKanbanTask[] = rawTasks.map((t: any) => {
      const assignees = (t.assigneeIds || []).map((u: any) => ({
        id: u._id.toString(),
        name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
        email: u.email,
        avatarUrl: u.avatarUrl
      }));

      const reporter = t.reporterId
        ? {
            id: t.reporterId._id.toString(),
            name: t.reporterId.name || `${t.reporterId.firstName || ''} ${t.reporterId.lastName || ''}`.trim() || t.reporterId.email,
            email: t.reporterId.email
          }
        : undefined;

      const prereqs = (t.blockedByIds || []).map((b: any) => (b._id ? b._id.toString() : b.toString()));
      const activeBlockers = prereqs.filter((id: string) => unfinishedSet.has(id));

      return {
        id: t._id.toString(),
        taskNumber: t.taskNumber,
        taskKey: `${project.key}-${t.taskNumber}`,
        title: t.title,
        description: t.description || '',
        status: t.status,
        priority: t.priority,
        assignees,
        reporter,
        dueDate: t.dueDate,
        estimatedHours: t.estimatedHours || 0,
        loggedHours: t.loggedHours || 0,
        tags: t.tags || [],
        order: t.order || 0,
        parentId: t.parentId ? (t.parentId._id ? t.parentId._id.toString() : t.parentId.toString()) : undefined,
        subtaskProgress: subtaskMap.get(t._id.toString()) || {
          total: 0,
          completed: 0,
          remaining: 0,
          percentage: 0
        },
        isBlocked: activeBlockers.length > 0,
        blockedCount: activeBlockers.length,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt
      };
    });

    // 5. Partition tasks into standard workflow columns
    const columnsConfig: Array<{ id: string; label: string; color: string }> = [
      { id: TASK_STATUS.TODO, label: 'To Do', color: '#0EA5E9' },
      { id: TASK_STATUS.IN_PROGRESS, label: 'In Progress', color: '#4F46E5' },
      { id: TASK_STATUS.REVIEW, label: 'In Review', color: '#F59E0B' },
      { id: TASK_STATUS.DONE, label: 'Completed', color: '#10B981' },
      { id: TASK_STATUS.BACKLOG, label: 'Backlog', color: '#64748B' }
    ];

    const columns: KanbanColumn[] = columnsConfig.map((cfg) => {
      const colTasks = formattedTasks.filter((t) => t.status === cfg.id);
      return {
        id: cfg.id,
        label: cfg.label,
        color: cfg.color,
        tasks: colTasks,
        count: colTasks.length
      };
    });

    // 6. Calculate board telemetry
    const totalTasks = formattedTasks.length;
    const completedTasks = formattedTasks.filter((t) => t.status === TASK_STATUS.DONE).length;
    const inProgressTasks = formattedTasks.filter((t) => t.status === TASK_STATUS.IN_PROGRESS).length;
    const todoTasks = formattedTasks.filter((t) => t.status === TASK_STATUS.TODO).length;
    const reviewTasks = formattedTasks.filter((t) => t.status === TASK_STATUS.REVIEW).length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      project: {
        id: project._id.toString(),
        name: project.name,
        key: project.key,
        color: project.color || '#4F46E5',
        visibility: project.visibility,
        ownerId: project.ownerId?.toString()
      },
      columns,
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      reviewTasks,
      progressPercentage
    };
  }

  /**
   * Creates a new task inside a project board
   */
  public static async createTask(
    userId: string,
    organisationId: string,
    projectId: string,
    input: CreateKanbanTaskInput
  ): Promise<FormattedKanbanTask> {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);
    const userObjId = new mongoose.Types.ObjectId(userId);
    const projObjId = new mongoose.Types.ObjectId(projectId);

    // 1. Verify project
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

    // 2. Next taskNumber in project
    const latestTask: any = await TaskModel.findOne({ projectId: projObjId })
      .sort({ taskNumber: -1 })
      .select('taskNumber')
      .lean();

    const nextTaskNumber = (latestTask?.taskNumber || 0) + 1;

    // 3. Next order in column
    const initialStatus = input.status || TASK_STATUS.TODO;
    const latestInColumn: any = await TaskModel.findOne({
      projectId: projObjId,
      status: initialStatus
    })
      .sort({ order: -1 })
      .select('order')
      .lean();

    const nextOrder = (latestInColumn && typeof latestInColumn.order === 'number')
      ? latestInColumn.order + 1
      : 0;

    // 4. Validate and map assignees
    const assigneeObjIds: mongoose.Types.ObjectId[] = [];
    if (input.assigneeIds && input.assigneeIds.length > 0) {
      for (const aId of input.assigneeIds) {
        if (mongoose.Types.ObjectId.isValid(aId)) {
          assigneeObjIds.push(new mongoose.Types.ObjectId(aId));
        }
      }
    }

    // 5. Create task
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
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      estimatedHours: input.estimatedHours || 0,
      tags: input.tags || [],
      order: nextOrder
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

    // 7. Real-Time Broadcast via Socket.IO
    const io = getIO();
    if (io) {
      io.to(`project:${projectId}`).emit('kanban:task_created', {
        taskId: task._id.toString(),
        projectId,
        taskKey: `${project.key}-${nextTaskNumber}`,
        status: task.status
      });
    }

    // 8. Return formatted task
    const populated: any = await TaskModel.findById(task._id)
      .populate('assigneeIds', 'firstName lastName name email avatarUrl')
      .populate('reporterId', 'firstName lastName name email')
      .lean();

    const assignees = (populated?.assigneeIds || []).map((u: any) => ({
      id: u._id.toString(),
      name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
      email: u.email,
      avatarUrl: u.avatarUrl
    }));

    return {
      id: task._id.toString(),
      taskNumber: task.taskNumber,
      taskKey: `${project.key}-${task.taskNumber}`,
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assignees,
      dueDate: task.dueDate,
      estimatedHours: task.estimatedHours || 0,
      loggedHours: task.loggedHours || 0,
      tags: task.tags || [],
      order: task.order,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    };
  }

  /**
   * Moves a task between workflow columns and updates ordering
   */
  public static async moveTask(
    userId: string,
    organisationId: string,
    projectId: string,
    taskId: string,
    targetStatus: string,
    targetOrder?: number
  ): Promise<FormattedKanbanTask> {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);
    const userObjId = new mongoose.Types.ObjectId(userId);
    const projObjId = new mongoose.Types.ObjectId(projectId);
    const taskObjId = new mongoose.Types.ObjectId(taskId);

    // 1. Verify task belongs to project and organization
    const task = await TaskModel.findOne({
      _id: taskObjId,
      projectId: projObjId,
      organisationId: orgObjId
    });

    if (!task) {
      const err: any = new Error('Task not found in this project');
      err.statusCode = 404;
      err.code = 'TASK_NOT_FOUND';
      throw err;
    }

    // 2. Validate target status
    if (!Object.values(TASK_STATUS).includes(targetStatus as any)) {
      const err: any = new Error(`Invalid target status '${targetStatus}'`);
      err.statusCode = 400;
      err.code = 'INVALID_TASK_STATUS';
      throw err;
    }

    const previousStatus = task.status;
    const previousOrder = task.order;

    // 3. Compute new order in destination column
    let newOrder = targetOrder;
    if (newOrder === undefined) {
      const highestInCol: any = await TaskModel.findOne({
        projectId: projObjId,
        status: targetStatus,
        _id: { $ne: taskObjId }
      })
        .sort({ order: -1 })
        .select('order')
        .lean();
      newOrder = (highestInCol && typeof highestInCol.order === 'number')
        ? highestInCol.order + 1
        : 0;
    }

    // 4. Update task
    task.status = targetStatus;
    task.order = newOrder;
    await task.save();

    // 5. Audit Log
    await AuditLogModel.create({
      organisationId: orgObjId,
      userId: userObjId,
      action: 'TASK_MOVED',
      entityType: 'task',
      entityId: task._id,
      changes: {
        fromStatus: previousStatus,
        toStatus: targetStatus,
        fromOrder: previousOrder,
        toOrder: newOrder
      }
    });

    // 6. Broadcast via Socket.IO
    const io = getIO();
    if (io) {
      io.to(`project:${projectId}`).emit('kanban:task_moved', {
        taskId: task._id.toString(),
        projectId,
        previousStatus,
        targetStatus,
        newOrder,
        movedBy: userId
      });
    }

    // 7. Return populated task
    const populated: any = await TaskModel.findById(task._id)
      .populate('assigneeIds', 'firstName lastName name email avatarUrl')
      .populate('reporterId', 'firstName lastName name email')
      .lean();

    const project: any = await ProjectModel.findById(projObjId).select('key').lean();

    const assignees = (populated?.assigneeIds || []).map((u: any) => ({
      id: u._id.toString(),
      name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
      email: u.email,
      avatarUrl: u.avatarUrl
    }));

    return {
      id: task._id.toString(),
      taskNumber: task.taskNumber,
      taskKey: `${project?.key || 'TASK'}-${task.taskNumber}`,
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assignees,
      dueDate: task.dueDate,
      estimatedHours: task.estimatedHours || 0,
      loggedHours: task.loggedHours || 0,
      tags: task.tags || [],
      order: task.order,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    };
  }

  /**
   * Reorders an entire list of tasks in a specific column
   */
  public static async reorderColumn(
    userId: string,
    organisationId: string,
    projectId: string,
    status: string,
    orderedTaskIds: string[]
  ): Promise<{ success: boolean; reorderedCount: number }> {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);
    const projObjId = new mongoose.Types.ObjectId(projectId);

    // Validate status
    if (!Object.values(TASK_STATUS).includes(status as any)) {
      const err: any = new Error(`Invalid column status '${status}'`);
      err.statusCode = 400;
      err.code = 'INVALID_COLUMN_STATUS';
      throw err;
    }

    // Batch update positions
    const bulkOps = orderedTaskIds.map((taskId, index) => ({
      updateOne: {
        filter: {
          _id: new mongoose.Types.ObjectId(taskId),
          projectId: projObjId,
          organisationId: orgObjId
        },
        update: {
          $set: {
            status,
            order: index
          }
        }
      }
    }));

    if (bulkOps.length > 0) {
      await TaskModel.bulkWrite(bulkOps);
    }

    // Broadcast Socket.IO
    const io = getIO();
    if (io) {
      io.to(`project:${projectId}`).emit('kanban:column_reordered', {
        projectId,
        status,
        orderedTaskIds
      });
    }

    return {
      success: true,
      reorderedCount: orderedTaskIds.length
    };
  }
}

