import { z } from 'zod';
import { TASK_STATUS, TASK_PRIORITY } from '../constants/status.js';

export const createTaskSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  workspaceId: z.string().min(1, 'Workspace ID is required'),
  title: z.string().min(1, 'Title is required').max(255, 'Title must be under 255 characters').trim(),
  description: z.string().optional(),
  status: z.enum([
    TASK_STATUS.BACKLOG,
    TASK_STATUS.TODO,
    TASK_STATUS.IN_PROGRESS,
    TASK_STATUS.REVIEW,
    TASK_STATUS.DONE,
    TASK_STATUS.CANCELLED
  ]).default(TASK_STATUS.TODO),
  priority: z.enum([
    TASK_PRIORITY.LOW,
    TASK_PRIORITY.MEDIUM,
    TASK_PRIORITY.HIGH,
    TASK_PRIORITY.URGENT
  ]).default(TASK_PRIORITY.MEDIUM),
  assigneeIds: z.array(z.string()).default([]),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  estimatedHours: z.number().nonnegative().optional(),
  tags: z.array(z.string()).default([])
});

export type CreateTaskInput = z.input<typeof createTaskSchema>;
export type CreateTaskOutput = z.output<typeof createTaskSchema>;

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(255).trim().optional(),
  description: z.string().optional(),
  status: z.enum([
    TASK_STATUS.BACKLOG,
    TASK_STATUS.TODO,
    TASK_STATUS.IN_PROGRESS,
    TASK_STATUS.REVIEW,
    TASK_STATUS.DONE,
    TASK_STATUS.CANCELLED
  ]).optional(),
  priority: z.enum([
    TASK_PRIORITY.LOW,
    TASK_PRIORITY.MEDIUM,
    TASK_PRIORITY.HIGH,
    TASK_PRIORITY.URGENT
  ]).optional(),
  assigneeIds: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  estimatedHours: z.number().nonnegative().optional(),
  tags: z.array(z.string()).optional()
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const assignTaskSchema = z.object({
  assigneeIds: z.array(z.string().min(1)).min(0)
});

export type AssignTaskInput = z.infer<typeof assignTaskSchema>;

export const taskPriorityUpdateSchema = z.object({
  priority: z.enum([
    TASK_PRIORITY.LOW,
    TASK_PRIORITY.MEDIUM,
    TASK_PRIORITY.HIGH,
    TASK_PRIORITY.URGENT
  ])
});

export type TaskPriorityUpdateInput = z.infer<typeof taskPriorityUpdateSchema>;

export const taskListQuerySchema = z.object({
  projectId: z.string().optional(),
  workspaceId: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  assigneeId: z.string().optional(),
  search: z.string().optional(),
  dueDate: z.enum(['overdue', 'today', 'week', 'all']).optional(),
  isArchived: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional().default(false),
  page: z.preprocess((val) => (val ? Number(val) : 1), z.number().int().positive()).optional().default(1),
  limit: z.preprocess((val) => (val ? Number(val) : 25), z.number().int().positive().max(100)).optional().default(25),
  sortBy: z.enum(['createdAt', 'dueDate', 'priority', 'status', 'title', 'taskNumber']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

export type TaskListQuery = z.infer<typeof taskListQuerySchema>;

export const updateTaskStatusSchema = z.object({
  status: z.enum([
    TASK_STATUS.BACKLOG,
    TASK_STATUS.TODO,
    TASK_STATUS.IN_PROGRESS,
    TASK_STATUS.REVIEW,
    TASK_STATUS.DONE,
    TASK_STATUS.CANCELLED
  ]),
  order: z.number().int().nonnegative().optional()
});

export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;

export const moveTaskSchema = z.object({
  targetStatus: z.enum([
    TASK_STATUS.BACKLOG,
    TASK_STATUS.TODO,
    TASK_STATUS.IN_PROGRESS,
    TASK_STATUS.REVIEW,
    TASK_STATUS.DONE,
    TASK_STATUS.CANCELLED
  ]),
  targetOrder: z.number().int().nonnegative().optional()
});

export type MoveTaskInput = z.infer<typeof moveTaskSchema>;

export const reorderColumnTasksSchema = z.object({
  status: z.enum([
    TASK_STATUS.BACKLOG,
    TASK_STATUS.TODO,
    TASK_STATUS.IN_PROGRESS,
    TASK_STATUS.REVIEW,
    TASK_STATUS.DONE,
    TASK_STATUS.CANCELLED
  ]),
  orderedTaskIds: z.array(z.string().min(1)).min(1, 'At least one task ID is required')
});

export type ReorderColumnTasksInput = z.infer<typeof reorderColumnTasksSchema>;

export const kanbanBoardQuerySchema = z.object({
  search: z.string().optional(),
  assigneeId: z.string().optional(),
  priority: z.enum([
    TASK_PRIORITY.LOW,
    TASK_PRIORITY.MEDIUM,
    TASK_PRIORITY.HIGH,
    TASK_PRIORITY.URGENT
  ]).optional(),
  dueDate: z.enum(['overdue', 'today', 'week', 'all']).optional(),
  sortBy: z.enum(['order', 'priority', 'dueDate', 'createdAt']).optional().default('order')
});

export type KanbanBoardQuery = z.input<typeof kanbanBoardQuerySchema>;
export type KanbanBoardQueryOutput = z.output<typeof kanbanBoardQuerySchema>;

export const createSubtaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be under 255 characters').trim(),
  description: z.string().optional(),
  priority: z.enum([
    TASK_PRIORITY.LOW,
    TASK_PRIORITY.MEDIUM,
    TASK_PRIORITY.HIGH,
    TASK_PRIORITY.URGENT
  ]).default(TASK_PRIORITY.MEDIUM),
  assigneeIds: z.array(z.string()).default([]),
  dueDate: z.string().optional(),
  estimatedHours: z.number().nonnegative().optional()
});

export type CreateSubtaskInput = z.infer<typeof createSubtaskSchema>;

export const addDependencySchema = z.object({
  prerequisiteTaskId: z.string().min(1, 'Prerequisite task ID is required')
});

export type AddDependencyInput = z.infer<typeof addDependencySchema>;


