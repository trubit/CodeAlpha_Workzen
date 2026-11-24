import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganisationDocument extends Document {
  name: string;
  slug: string;
  description?: string;
  industry?: string;
  organizationSize?: string;
  logoUrl?: string;
  website?: string;
  country?: string;
  timezone?: string;
  domain?: string;
  ownerId: mongoose.Types.ObjectId;
  status: 'active' | 'archived';
  archivedAt?: Date;
  plan: 'starter' | 'professional' | 'enterprise';
  subscriptionId?: mongoose.Types.ObjectId;
  billingEmail?: string;
  seats: number;
  settings: {
    allowedDomains: string[];
    enforce2FA: boolean;
    defaultMemberRole: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrganisationSchema = new Schema<IOrganisationDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      trim: true
    },
    industry: {
      type: String,
      default: 'Technology & Software',
      trim: true
    },
    organizationSize: {
      type: String,
      default: '11-50',
      trim: true
    },
    logoUrl: {
      type: String
    },
    website: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      default: 'United States',
      trim: true
    },
    timezone: {
      type: String,
      default: 'UTC-05:00 Eastern Time',
      trim: true
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
    domain: {
      type: String,
      lowercase: true,
      trim: true
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    plan: {
      type: String,
      enum: ['starter', 'professional', 'enterprise'],
      default: 'starter'
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription'
    },
    billingEmail: {
      type: String,
      lowercase: true,
      trim: true
    },
    seats: {
      type: Number,
      default: 5
    },
    settings: {
      allowedDomains: {
        type: [String],
        default: []
      },
      enforce2FA: {
        type: Boolean,
        default: false
      },
      defaultMemberRole: {
        type: String,
        default: 'member'
      }
    }
  },
  {
    timestamps: true
  }
);

export const OrganisationModel =
  mongoose.models.Organisation || mongoose.model<IOrganisationDocument>('Organisation', OrganisationSchema);

