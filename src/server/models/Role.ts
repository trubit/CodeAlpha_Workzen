import mongoose, { Schema, Document } from 'mongoose';

export interface IRoleDocument extends Document {
  organisationId: mongoose.Types.ObjectId;
  workspaceId?: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  scope: 'organization' | 'workspace';
  isSystem: boolean;
  isDefault: boolean;
  permissions: string[];
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRoleDocument>(
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
      default: null,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 60
    },
    description: {
      type: String,
      default: '',
      maxlength: 500
    },
    scope: {
      type: String,
      enum: ['organization', 'workspace'],
      default: 'organization',
      required: true
    },
    isSystem: {
      type: Boolean,
      default: false,
      index: true
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    permissions: {
      type: [String],
      default: []
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Enforce unique role slugs per organization and workspace scope
RoleSchema.index(
  { organisationId: 1, scope: 1, workspaceId: 1, slug: 1 },
  { unique: true }
);

export const RoleModel =
  mongoose.models.Role || mongoose.model<IRoleDocument>('Role', RoleSchema);

