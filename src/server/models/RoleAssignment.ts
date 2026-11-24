import mongoose, { Schema, Document } from 'mongoose';

export interface IRoleAssignmentDocument extends Document {
  userId: mongoose.Types.ObjectId;
  roleId: mongoose.Types.ObjectId;
  organisationId: mongoose.Types.ObjectId;
  workspaceId?: mongoose.Types.ObjectId;
  scope: 'organization' | 'workspace';
  assignedBy: mongoose.Types.ObjectId;
  assignedAt: Date;
}

const RoleAssignmentSchema = new Schema<IRoleAssignmentDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    roleId: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
      index: true
    },
    organisationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organisation',
      required: true,
      index: true
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      default: null,
      index: true
    },
    scope: {
      type: String,
      enum: ['organization', 'workspace'],
      default: 'organization',
      required: true
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    assignedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Enforce unique role assignment per user per scope context
RoleAssignmentSchema.index(
  { organisationId: 1, workspaceId: 1, userId: 1, roleId: 1 },
  { unique: true }
);

export const RoleAssignmentModel =
  mongoose.models.RoleAssignment ||
  mongoose.model<IRoleAssignmentDocument>('RoleAssignment', RoleAssignmentSchema);

