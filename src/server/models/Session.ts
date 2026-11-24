import mongoose, { Schema, Document } from 'mongoose';

export interface ISessionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  refreshTokenHash: string;
  ipAddress?: string;
  userAgent?: string;
  isRevoked: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISessionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    refreshTokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    },
    isRevoked: {
      type: Boolean,
      default: false
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // MongoDB TTL index to automatically purge expired sessions
    }
  },
  {
    timestamps: true
  }
);

export const SessionModel =
  mongoose.models.Session || mongoose.model<ISessionDocument>('Session', SessionSchema);
