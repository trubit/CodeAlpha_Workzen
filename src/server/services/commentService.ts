import mongoose from 'mongoose';
import { CommentModel, ICommentDocument } from '../models/Comment.js';
import { TaskModel } from '../models/Task.js';
import { UserModel } from '../models/User.js';
import { AuditLogModel } from '../models/AuditLog.js';
import { NotificationModel } from '../models/Notification.js';
import { OrganisationMembershipModel } from '../models/OrganisationMembership.js';
import { getIO } from '../socket/index.js';
import {
  CreateCommentInput,
  UpdateCommentInput,
  ListCommentsQuery
} from '../../shared/validation/comment.js';

export interface FormattedComment {
  id: string;
  taskId: string;
  projectId: string;
  workspaceId: string;
  organisationId: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  content: string;
  parentId?: string | null;
  mentions: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  replyCount: number;
  replies?: FormattedComment[];
  createdAt: Date;
  updatedAt: Date;
}

export class CommentService {
  /**
   * Helper to format a Comment document
   */
  public static formatComment(c: any, replies?: FormattedComment[]): FormattedComment {
    const author = c.authorId || {};
    const authorName =
      author.name ||
      `${author.firstName || ''} ${author.lastName || ''}`.trim() ||
      author.email ||
      'Collaborator';

    const mentions = (c.mentions || []).map((m: any) => ({
      id: m._id ? m._id.toString() : m.toString(),
      name: m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.email || 'Team Member',
      email: m.email || ''
    }));

    return {
      id: c._id.toString(),
      taskId: c.taskId?._id ? c.taskId._id.toString() : c.taskId.toString(),
      projectId: c.projectId?._id ? c.projectId._id.toString() : c.projectId.toString(),
      workspaceId: c.workspaceId?._id ? c.workspaceId._id.toString() : c.workspaceId.toString(),
      organisationId: c.organisationId?._id ? c.organisationId._id.toString() : c.organisationId.toString(),
      author: {
        id: author._id ? author._id.toString() : (author.id || c.authorId.toString()),
        name: authorName,
        email: author.email || '',
        avatarUrl: author.avatarUrl
      },
      content: c.isDeleted ? '[This comment was deleted by author]' : c.content,
      parentId: c.parentId ? c.parentId.toString() : null,
      mentions,
      isEdited: c.isEdited || false,
      editedAt: c.editedAt,
      isDeleted: c.isDeleted || false,
      deletedAt: c.deletedAt,
      replyCount: c.replyCount || 0,
      replies: replies || [],
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    };
  }

  /**
   * Create a new comment or reply attached to a task
   */
  public static async createComment(
    userId: string,
    orgId: string,
    taskId: string,
    input: CreateCommentInput
  ): Promise<FormattedComment> {
    const task = await TaskModel.findOne({
      _id: taskId,
      organisationId: orgId
    });

    if (!task) {
      throw new Error('Task not found or access denied in this organization');
    }

    let parentComment: any = null;
    let resolvedParentId: mongoose.Types.ObjectId | null = null;

    if (input.parentId) {
      parentComment = await CommentModel.findOne({
        _id: input.parentId,
        taskId,
        organisationId: orgId
      });

      if (!parentComment) {
        throw new Error('Parent comment not found on this task');
      }

      // Enforce 1-level threading: if parent is already a reply, thread into its root
      if (parentComment.parentId) {
        resolvedParentId = parentComment.parentId;
      } else {
        resolvedParentId = parentComment._id;
      }
    }

    // Resolve mentions: validate user IDs against organization membership
    const validMentionIds: mongoose.Types.ObjectId[] = [];
    if (input.mentions && input.mentions.length > 0) {
      const eligibleMembers = await OrganisationMembershipModel.find({
        organisationId: orgId,
        userId: { $in: input.mentions }
      });
      const eligibleUserIds = eligibleMembers.map((m) => m.userId.toString());

      for (const mId of input.mentions) {
        if (eligibleUserIds.includes(mId) && mongoose.Types.ObjectId.isValid(mId)) {
          validMentionIds.push(new mongoose.Types.ObjectId(mId));
        }
      }
    }

    const comment = await CommentModel.create({
      taskId: task._id,
      projectId: task.projectId,
      workspaceId: task.workspaceId,
      organisationId: orgId,
      authorId: userId,
      content: input.content,
      parentId: resolvedParentId,
      mentions: validMentionIds,
      replyCount: 0,
      isEdited: false,
      isDeleted: false
    });

    // If this is a reply, increment parent comment's replyCount
    if (resolvedParentId) {
      await CommentModel.findByIdAndUpdate(resolvedParentId, {
        $inc: { replyCount: 1 }
      });
    }

    // Increment task comment count
    await TaskModel.findByIdAndUpdate(taskId, {
      $inc: { commentCount: 1 }
    });

    // Audit log
    await AuditLogModel.create({
      organisationId: orgId,
      userId,
      action: 'comment_created',
      entityType: 'task',
      entityId: task._id,
      changes: {
        commentId: comment._id.toString(),
        isReply: !!resolvedParentId,
        mentionsCount: validMentionIds.length
      }
    });

    const authorUser = await UserModel.findById(userId);
    const authorName = authorUser
      ? `${authorUser.firstName || ''} ${authorUser.lastName || ''}`.trim() || authorUser.email
      : 'A team member';

    // Notifications: Mentioned users
    for (const mentionedId of validMentionIds) {
      if (mentionedId.toString() !== userId) {
        await NotificationModel.create({
          organisationId: orgId,
          userId: mentionedId,
          actorId: userId,
          type: 'mention',
          title: 'Mentioned in Task Discussion',
          message: `${authorName} mentioned you in task: "${task.title}"`,
          entityType: 'task',
          entityId: task._id
        });
      }
    }

    // Notifications: Task assignees
    const assigneeIds = (task.assigneeIds || []).map((a: any) => a.toString());
    for (const assigneeId of assigneeIds) {
      // Don't notify the author or users already notified via mention
      if (
        assigneeId !== userId &&
        !validMentionIds.some((m) => m.toString() === assigneeId)
      ) {
        await NotificationModel.create({
          organisationId: orgId,
          userId: assigneeId,
          actorId: userId,
          type: 'comment',
          title: 'New Task Comment',
          message: `${authorName} commented on task: "${task.title}"`,
          entityType: 'task',
          entityId: task._id
        });
      }
    }

    // Populate for response
    const populated = await CommentModel.findById(comment._id)
      .populate('authorId', 'firstName lastName email avatarUrl')
      .populate('mentions', 'firstName lastName email');

    // Realtime socket event
    try {
      const io = getIO();
      if (io) {
        io.to(`task:${taskId}`).emit('task:comment:created', {
          taskId,
          comment: CommentService.formatComment(populated)
        });
      }
    } catch {
      // Sockets optional
    }

    return CommentService.formatComment(populated);
  }

  /**
   * Retrieve comments for a task organized hierarchically (root comments with nested replies)
   */
  public static async getTaskComments(
    userId: string,
    orgId: string,
    taskId: string,
    query: Partial<ListCommentsQuery> = {}
  ): Promise<{
    comments: FormattedComment[];
    telemetry: {
      totalComments: number;
      rootComments: number;
      replies: number;
    };
  }> {
    const task = await TaskModel.findOne({
      _id: taskId,
      organisationId: orgId
    });

    if (!task) {
      throw new Error('Task not found or access denied in this organization');
    }

    // Fetch all comments for the task
    const allComments = await CommentModel.find({
      taskId,
      organisationId: orgId
    })
      .sort({ createdAt: 1 })
      .populate('authorId', 'firstName lastName email avatarUrl')
      .populate('mentions', 'firstName lastName email');

    const totalComments = allComments.length;
    let rootCommentsCount = 0;
    let repliesCount = 0;

    // Group replies under their parent comments
    const replyMap = new Map<string, FormattedComment[]>();
    const rootComments: any[] = [];

    for (const doc of allComments) {
      if (doc.parentId) {
        repliesCount++;
        const pId = doc.parentId.toString();
        const formattedReply = CommentService.formatComment(doc);
        if (!replyMap.has(pId)) {
          replyMap.set(pId, []);
        }
        replyMap.get(pId)!.push(formattedReply);
      } else {
        rootCommentsCount++;
        rootComments.push(doc);
      }
    }

    const structuredComments: FormattedComment[] = rootComments.map((rootDoc) => {
      const rId = rootDoc._id.toString();
      const childReplies = replyMap.get(rId) || [];
      return CommentService.formatComment(rootDoc, childReplies);
    });

    return {
      comments: structuredComments,
      telemetry: {
        totalComments,
        rootComments: rootCommentsCount,
        replies: repliesCount
      }
    };
  }

  /**
   * Edit a comment (author only or administrative moderation)
   */
  public static async updateComment(
    userId: string,
    orgId: string,
    commentId: string,
    input: UpdateCommentInput
  ): Promise<FormattedComment> {
    const comment = await CommentModel.findOne({
      _id: commentId,
      organisationId: orgId
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.isDeleted) {
      throw new Error('Cannot edit a deleted comment');
    }

    // Permission check: only author can edit
    if (comment.authorId.toString() !== userId) {
      throw new Error('Unauthorized: You can only edit your own comments');
    }

    comment.content = input.content;
    comment.isEdited = true;
    comment.editedAt = new Date();
    await comment.save();

    await AuditLogModel.create({
      organisationId: orgId,
      userId,
      action: 'comment_updated',
      entityType: 'task',
      entityId: comment.taskId,
      changes: { commentId: comment._id.toString() }
    });

    const populated = await CommentModel.findById(comment._id)
      .populate('authorId', 'firstName lastName email avatarUrl')
      .populate('mentions', 'firstName lastName email');

    // Realtime socket event
    try {
      const io = getIO();
      if (io) {
        io.to(`task:${comment.taskId}`).emit('task:comment:updated', {
          comment: CommentService.formatComment(populated)
        });
      }
    } catch {
      // Sockets optional
    }

    return CommentService.formatComment(populated);
  }

  /**
   * Delete a comment safely (soft deletion to preserve conversation flow if replies exist)
   */
  public static async deleteComment(
    userId: string,
    orgId: string,
    commentId: string
  ): Promise<{ success: boolean; isSoftDeleted: boolean }> {
    const comment = await CommentModel.findOne({
      _id: commentId,
      organisationId: orgId
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    // Permission check: author or authorized moderator
    if (comment.authorId.toString() !== userId) {
      throw new Error('Unauthorized: You can only delete your own comments');
    }

    const hasReplies = comment.replyCount > 0;
    let isSoftDeleted = true;

    comment.isDeleted = true;
    comment.deletedAt = new Date();
    comment.deletedBy = new mongoose.Types.ObjectId(userId);
    comment.content = '[This comment was deleted by author]';
    await comment.save();

    // If it was a reply, decrement parent's replyCount
    if (comment.parentId) {
      await CommentModel.findByIdAndUpdate(comment.parentId, {
        $inc: { replyCount: -1 }
      });
    }

    // Decrement task's total comment count
    await TaskModel.findByIdAndUpdate(comment.taskId, {
      $inc: { commentCount: -1 }
    });

    await AuditLogModel.create({
      organisationId: orgId,
      userId,
      action: 'comment_deleted',
      entityType: 'task',
      entityId: comment.taskId,
      changes: {
        commentId: comment._id.toString(),
        hadReplies: hasReplies
      }
    });

    // Realtime socket event
    try {
      const io = getIO();
      if (io) {
        io.to(`task:${comment.taskId}`).emit('task:comment:deleted', {
          commentId,
          taskId: comment.taskId.toString(),
          isSoftDeleted
        });
      }
    } catch {
      // Sockets optional
    }

    return { success: true, isSoftDeleted };
  }

  /**
   * Search eligible members in the organization/project for @mention autocomplete
   */
  public static async getMentionableMembers(
    userId: string,
    orgId: string,
    taskId: string,
    search?: string
  ): Promise<Array<{ id: string; name: string; email: string; avatarUrl?: string; role?: string }>> {
    const task = await TaskModel.findOne({ _id: taskId, organisationId: orgId });
    if (!task) {
      throw new Error('Task not found');
    }

    const memberships = await OrganisationMembershipModel.find({
      organisationId: orgId
    }).populate('userId', 'firstName lastName email avatarUrl');

    let members = memberships
      .filter((m: any) => m.userId)
      .map((m: any) => {
        const u = m.userId;
        const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email;
        return {
          id: u._id.toString(),
          name,
          email: u.email,
          avatarUrl: u.avatarUrl,
          role: m.role || 'Member'
        };
      });

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      members = members.filter(
        (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
      );
    }

    return members;
  }
}
