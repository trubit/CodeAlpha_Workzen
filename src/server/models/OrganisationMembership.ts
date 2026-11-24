import mongoose, { Schema, Document } from 'mongoose';
import { ORG_ROLES, OrgRole } from '../../shared/constants/roles.js';

export interface IOrganisationMembershipDocument extends Document {
  organisationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: OrgRole;
  status: 'active' | 'invited' | 'suspended' | 'deactivated';
  joinedAt: Date;
}

const OrganisationMembershipSchema = new Schema<IOrganisationMembershipDocument>(
  {
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
      enum: Object.values(ORG_ROLES),
      default: ORG_ROLES.MEMBER
    },
    status: {
      type: String,
      enum: ['active', 'invited', 'suspended', 'deactivated'],
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

// Enforce unique user membership per organisation
OrganisationMembershipSchema.index({ organisationId: 1, userId: 1 }, { unique: true });

export const OrganisationMembershipModel =
  mongoose.models.OrganisationMembership ||
  mongoose.model<IOrganisationMembershipDocument>('OrganisationMembership', OrganisationMembershipSchema);

