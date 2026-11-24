import mongoose, { Schema, Document } from 'mongoose';
import { WORKSPACE_ROLES, WorkspaceRole } from '../../shared/constants/roles.js';

export interface IWorkspaceMembershipDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  organisationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: WorkspaceRole;
  status: 'active' | 'suspended';
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceMembershipSchema = new Schema<IWorkspaceMembershipDocument>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true
    },
    organisationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organisation',
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    role: {
      type: String,
      enum: Object.values(WORKSPACE_ROLES),
      default: WORKSPACE_ROLES.MEMBER
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
  },
  {
    timestamps: true
  }
);

// Enforce unique workspace membership per user
WorkspaceMembershipSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });
WorkspaceMembershipSchema.index({ organisationId: 1, userId: 1 });

export const WorkspaceMembershipModel =
  mongoose.models.WorkspaceMembership ||
  mongoose.model<IWorkspaceMembershipDocument>('WorkspaceMembership', WorkspaceMembershipSchema);

