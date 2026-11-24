import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkspaceDocument extends Document {
  organisationId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  type: string;
  icon?: string;
  logo?: string;
  themeColor?: string;
  departmentId?: mongoose.Types.ObjectId;
  isPrivate: boolean;
  status: 'active' | 'archived';
  archivedAt?: Date;
  archivedBy?: mongoose.Types.ObjectId;
  settings: {
    defaultTaskView: 'kanban' | 'list' | 'calendar' | 'timeline';
    allowGuestAccess: boolean;
    requireApprovalForProjects: boolean;
  };
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceSchema = new Schema<IWorkspaceDocument>(
  {
    organisationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organisation',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['engineering', 'product', 'marketing', 'operations', 'general'],
      default: 'general'
    },
    icon: {
      type: String,
      trim: true
    },
    logo: {
      type: String,
      trim: true
    },
    themeColor: {
      type: String,
      default: '#6366F1'
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department'
    },
    isPrivate: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
      index: true
    },
    archivedAt: {
      type: Date
    },
    archivedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    settings: {
      defaultTaskView: {
        type: String,
        enum: ['kanban', 'list', 'calendar', 'timeline'],
        default: 'kanban'
      },
      allowGuestAccess: {
        type: Boolean,
        default: false
      },
      requireApprovalForProjects: {
        type: Boolean,
        default: false
      }
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Compound Indexes for fast, tenant-scoped queries & uniqueness
WorkspaceSchema.index({ organisationId: 1, slug: 1 }, { unique: true });
WorkspaceSchema.index({ organisationId: 1, status: 1 });

export const WorkspaceModel =
  mongoose.models.Workspace || mongoose.model<IWorkspaceDocument>('Workspace', WorkspaceSchema);
