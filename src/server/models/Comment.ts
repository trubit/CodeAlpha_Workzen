import mongoose, { Schema, Document } from 'mongoose';

export interface ICommentDocument extends Document {
  taskId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  organisationId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  content: string;
  parentId?: mongoose.Types.ObjectId;
  mentions: mongoose.Types.ObjectId[];
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  replyCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<ICommentDocument>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
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
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
      index: true
    },
    mentions: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: {
      type: Date
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },
    deletedAt: {
      type: Date
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    replyCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

CommentSchema.index({ taskId: 1, createdAt: 1 });
CommentSchema.index({ taskId: 1, parentId: 1, createdAt: 1 });
CommentSchema.index({ organisationId: 1, authorId: 1 });
CommentSchema.index({ mentions: 1 });

export const CommentModel =
  mongoose.models.Comment || mongoose.model<ICommentDocument>('Comment', CommentSchema);

