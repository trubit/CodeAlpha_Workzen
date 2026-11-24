import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDocument extends Document {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetOTP?: string;
  passwordResetExpires?: Date;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  status: 'active' | 'suspended' | 'pending';
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    avatarUrl: {
      type: String
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String,
      select: false
    },
    emailVerificationExpires: {
      type: Date,
      select: false
    },
    passwordResetOTP: {
      type: String,
      select: false
    },
    passwordResetExpires: {
      type: Date,
      select: false
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    twoFactorSecret: {
      type: String,
      select: false
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'pending'],
      default: 'pending'
    },
    lastLoginAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

export const UserModel = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

