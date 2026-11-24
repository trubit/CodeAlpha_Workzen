import mongoose, { Schema, Document } from 'mongoose';
import { TASK_STATUS, TASK_PRIORITY } from '../../shared/constants/status.js';

export interface ITaskDocument extends Document {
  organisationId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  taskNumber: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assigneeIds: mongoose.Types.ObjectId[];
  reporterId: mongoose.Types.ObjectId;
  startDate?: Date;
  dueDate?: Date;
  estimatedHours?: number;
  loggedHours?: number;
  tags: string[];
  order: number;
  commentCount?: number;
  parentId?: mongoose.Types.ObjectId;
  blockedByIds: mongoose.Types.ObjectId[];
  isArchived: boolean;
  archivedAt?: Date;
  archivedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITaskDocument>(
  {
    organisationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organisation',
      required: true,
      index: true
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    taskNumber: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255
    },
    description: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: Object.values(TASK_STATUS),
      default: TASK_STATUS.TODO,
      index: true
    },
    priority: {
      type: String,
      enum: Object.values(TASK_PRIORITY),
      default: TASK_PRIORITY.MEDIUM,
      index: true
    },
    assigneeIds: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    startDate: {
      type: Date
    },
    dueDate: {
      type: Date
    },
    estimatedHours: {
      type: Number,
      default: 0
    },
    loggedHours: {
      type: Number,
      default: 0
    },
    tags: {
      type: [String],
      default: []
    },
    order: {
      type: Number,
      default: 0
    },
    commentCount: {
      type: Number,
      default: 0
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      default: null
    },
    blockedByIds: [{
      type: Schema.Types.ObjectId,
      ref: 'Task'
    }],
    isArchived: {
      type: Boolean,
      default: false,
      index: true
    },
    archivedAt: {
      type: Date
    },
    archivedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

TaskSchema.index({ projectId: 1, taskNumber: 1 }, { unique: true });
TaskSchema.index({ organisationId: 1, projectId: 1, status: 1 });
TaskSchema.index({ organisationId: 1, assigneeIds: 1 });
TaskSchema.index({ organisationId: 1, isArchived: 1 });
TaskSchema.index({ parentId: 1 });
TaskSchema.index({ blockedByIds: 1 });

export const TaskModel =
  mongoose.models.Task || mongoose.model<ITaskDocument>('Task', TaskSchema);

