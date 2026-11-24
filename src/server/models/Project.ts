import mongoose, { Schema, Document } from 'mongoose';
import { PROJECT_STATUS, TASK_PRIORITY } from '../../shared/constants/status.js';

export interface IProjectMember {
  userId: mongoose.Types.ObjectId;
  role: 'lead' | 'contributor' | 'observer';
  status: 'active' | 'suspended';
  joinedAt: Date;
}

export interface IProjectDocument extends Document {
  organisationId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  name: string;
  key: string;
  description?: string;
  status: string;
  priority: string;
  color?: string;
  startDate?: Date;
  targetDate?: Date;
  leadId?: mongoose.Types.ObjectId;
  ownerId?: mongoose.Types.ObjectId;
  memberIds: mongoose.Types.ObjectId[];
  members: IProjectMember[];
  visibility: 'workspace' | 'restricted';
  tags: string[];
  isArchived: boolean;
  archivedAt?: Date;
  archivedBy?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProjectDocument>(
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
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    key: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      maxlength: 10
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    status: {
      type: String,
      enum: Object.values(PROJECT_STATUS),
      default: PROJECT_STATUS.PLANNING,
      index: true
    },
    priority: {
      type: String,
      enum: Object.values(TASK_PRIORITY),
      default: TASK_PRIORITY.MEDIUM,
      index: true
    },
    color: {
      type: String,
      default: '#4F46E5'
    },
    startDate: {
      type: Date
    },
    targetDate: {
      type: Date
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    memberIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    members: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        role: {
          type: String,
          enum: ['lead', 'contributor', 'observer'],
          default: 'contributor'
        },
        status: {
          type: String,
          enum: ['active', 'suspended'],
          default: 'active'
        },
        joinedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    visibility: {
      type: String,
      enum: ['workspace', 'restricted'],
      default: 'workspace'
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
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
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

ProjectSchema.index({ organisationId: 1, key: 1 }, { unique: true });
ProjectSchema.index({ organisationId: 1, workspaceId: 1, isArchived: 1 });
ProjectSchema.index({ organisationId: 1, isArchived: 1, status: 1 });

export const ProjectModel =
  mongoose.models.Project || mongoose.model<IProjectDocument>('Project', ProjectSchema);
