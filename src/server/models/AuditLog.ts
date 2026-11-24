import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLogDocument extends Document {
  organisationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: string;
  entityType: string;
  entityId?: mongoose.Types.ObjectId;
  ipAddress?: string;
  userAgent?: string;
  changes?: Record<string, any>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLogDocument>(
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
    action: {
      type: String,
      required: true
    },
    entityType: {
      type: String,
      required: true
    },
    entityId: {
      type: Schema.Types.ObjectId
    },
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    },
    changes: {
      type: Schema.Types.Mixed
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

AuditLogSchema.index({ organisationId: 1, createdAt: -1 });

export const AuditLogModel =
  mongoose.models.AuditLog || mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);

