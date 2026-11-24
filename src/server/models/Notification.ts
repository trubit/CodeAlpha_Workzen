import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationDocument extends Document {
  organisationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  actorId?: mongoose.Types.ObjectId;
  type: 'task_assigned' | 'mention' | 'status_change' | 'comment' | 'deadline';
  title: string;
  message: string;
  entityType: 'task' | 'project' | 'organisation';
  entityId: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
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
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['task_assigned', 'mention', 'status_change', 'comment', 'deadline'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    entityType: {
      type: String,
      enum: ['task', 'project', 'organisation'],
      required: true
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const NotificationModel =
  mongoose.models.Notification || mongoose.model<INotificationDocument>('Notification', NotificationSchema);
