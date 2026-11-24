import mongoose, { Schema, Document } from 'mongoose';
import { ORG_ROLES, OrgRole } from '../../shared/constants/roles.js';

export interface IInvitationDocument extends Document {
  organisationId: mongoose.Types.ObjectId;
  email: string;
  role: OrgRole;
  workspaceIds: mongoose.Types.ObjectId[];
  invitedBy: mongoose.Types.ObjectId;
  token: string;
  tokenHash?: string;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  createdAt: Date;
  updatedAt: Date;
}

const InvitationSchema = new Schema<IInvitationDocument>(
  {
    organisationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organisation',
      required: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    role: {
      type: String,
      enum: Object.values(ORG_ROLES),
      default: ORG_ROLES.MEMBER
    },
    workspaceIds: [{
      type: Schema.Types.ObjectId,
      ref: 'Workspace'
    }],
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    tokenHash: {
      type: String,
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'expired', 'revoked'],
      default: 'pending',
      index: true
    }
  },
  {
    timestamps: true
  }
);

InvitationSchema.index({ organisationId: 1, email: 1, status: 1 });

export const InvitationModel =
  mongoose.models.Invitation || mongoose.model<IInvitationDocument>('Invitation', InvitationSchema);
