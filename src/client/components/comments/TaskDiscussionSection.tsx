import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { apiClient } from '../../api/client.js';
import {
  MessageSquare,
  Send,
  CornerDownRight,
  Edit2,
  Trash2,
  AlertCircle,
  Check,
  X,
  Bold,
  Italic,
  Code,
  Link2,
  List,
  Quote,
  AtSign,
  Clock,
  RefreshCw,
  Sparkles,
  UserCheck
} from 'lucide-react';

interface FormattedComment {
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
  createdAt: string;
  updatedAt: string;
}

interface TaskDiscussionSectionProps {
  taskId: string;
  taskTitle: string;
  onCommentCountChange?: (count: number) => void;
}

export const TaskDiscussionSection: React.FC<TaskDiscussionSectionProps> = ({
  taskId,
  taskTitle,
  onCommentCountChange
}) => {
  const { currentUser } = useWorkzenStore();

  const [comments, setComments] = useState<FormattedComment[]>([]);
  const [telemetry, setTelemetry] = useState({ totalComments: 0, rootComments: 0, replies: 0 });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Main Composer State
  const [mainContent, setMainContent] = useState<string>('');
  const [showMentionPopup, setShowMentionPopup] = useState<boolean>(false);
  const [mentionQuery, setMentionQuery] = useState<string>('');
  const [mentionMembers, setMentionMembers] = useState<any[]>([]);
  const [mentionCursorPos, setMentionCursorPos] = useState<number>(0);
  const mainTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Reply Composer State
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<string>('');
  const [isSubmittingReply, setIsSubmittingReply] = useState<boolean>(false);
  const replyTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Edit Comment State
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState<boolean>(false);

  // Delete Modal State
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Keep a stable ref to onCommentCountChange to avoid infinite re-render loops
  const onCommentCountChangeRef = useRef(onCommentCountChange);
  useEffect(() => {
    onCommentCountChangeRef.current = onCommentCountChange;
  }, [onCommentCountChange]);

  const fetchComments = useCallback(async () => {
    if (!taskId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.getTaskComments(taskId);
      if (res.success && res.data) {
        setComments(res.data.comments || []);
        if (res.data.telemetry) {
          setTelemetry(res.data.telemetry);
        }
      } else {
        setError(res.error?.message || 'Failed to load task discussions.');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to comments service.');
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (taskId) {
      fetchComments();
    }
  }, [taskId, fetchComments]);

  // Load mentionable members on mount or query change
  const loadMentionableMembers = async (q?: string) => {
    try {
      const res = await apiClient.getMentionableMembers(taskId, q);
      if (res.success && res.data?.members) {
        setMentionMembers(res.data.members);
      }
    } catch {
      // ignore
    }
  };

  // Main Composer: handle text change and detect @
  const handleMainContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const pos = e.target.selectionStart;
    setMainContent(val);

    // Check if the last typed character or preceding word triggered '@'
    const textBeforeCursor = val.slice(0, pos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1 && (lastAtIndex === 0 || /\s/.test(textBeforeCursor[lastAtIndex - 1]))) {
      const query = textBeforeCursor.slice(lastAtIndex + 1);
      if (!query.includes(' ') && query.length <= 20) {
        setMentionQuery(query);
        setMentionCursorPos(lastAtIndex);
        setShowMentionPopup(true);
        loadMentionableMembers(query);
        return;
      }
    }

    setShowMentionPopup(false);
  };

  // Insert selected mention into main composer
  const handleSelectMention = (member: any) => {
    const textBeforeAt = mainContent.slice(0, mentionCursorPos);
    const textAfterCursor = mainContent.slice(mainTextareaRef.current?.selectionStart || mentionCursorPos);
    const updated = `${textBeforeAt}@${member.name} ${textAfterCursor}`;
    setMainContent(updated);
    setShowMentionPopup(false);
    if (mainTextareaRef.current) {
      mainTextareaRef.current.focus();
    }
  };

  // Apply quick formatting markdown
  const applyFormatting = (type: 'bold' | 'italic' | 'code' | 'link' | 'list' | 'quote') => {
    const textarea = mainTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = mainContent.slice(start, end);
    let replacement = '';

    switch (type) {
      case 'bold':
        replacement = `**${selected || 'bold text'}**`;
        break;
      case 'italic':
        replacement = `*${selected || 'italic text'}*`;
        break;
      case 'code':
        replacement = selected.includes('\n')
          ? `\`\`\`\n${selected || '// code block'}\n\`\`\``
          : `\`${selected || 'code'}\``;
        break;
      case 'link':
        replacement = `[${selected || 'link text'}](https://)`;
        break;
      case 'list':
        replacement = `\n- ${selected || 'list item'}`;
        break;
      case 'quote':
        replacement = `\n> ${selected || 'quoted text'}`;
        break;
    }

    const updated = mainContent.slice(0, start) + replacement + mainContent.slice(end);
    setMainContent(updated);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);
  };

  // Submit new root comment
  const handlePostComment = async () => {
    if (!mainContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await apiClient.createTaskComment(taskId, {
        content: mainContent.trim()
      });

      if (res.success && res.data?.comment) {
        setMainContent('');
        setShowMentionPopup(false);
        await fetchComments();
        onCommentCountChangeRef.current?.(telemetry.totalComments + 1);
      } else {
        setError(res.error?.message || 'Failed to post comment.');
      }
    } catch (err: any) {
      setError(err.message || 'Error submitting comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit threaded reply
  const handlePostReply = async (parentCommentId: string) => {
    if (!replyContent.trim() || isSubmittingReply) return;

    setIsSubmittingReply(true);
    setError(null);

    try {
      const res = await apiClient.createTaskComment(taskId, {
        content: replyContent.trim(),
        parentId: parentCommentId
      });

      if (res.success && res.data?.comment) {
        setReplyContent('');
        setReplyingToCommentId(null);
        await fetchComments();
        onCommentCountChangeRef.current?.(telemetry.totalComments + 1);
      } else {
        setError(res.error?.message || 'Failed to post reply.');
      }
    } catch (err: any) {
      setError(err.message || 'Error submitting reply.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Save edited comment
  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim() || isSubmittingEdit) return;

    setIsSubmittingEdit(true);
    setError(null);

    try {
      const res = await apiClient.updateComment(commentId, {
        content: editContent.trim()
      });

      if (res.success) {
        setEditingCommentId(null);
        setEditContent('');
        await fetchComments();
      } else {
        setError(res.error?.message || 'Failed to update comment.');
      }
    } catch (err: any) {
      setError(err.message || 'Error saving changes.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Confirm delete comment
  const handleConfirmDelete = async () => {
    if (!deletingCommentId || isDeleting) return;

    setIsDeleting(true);
    setError(null);

    try {
      const res = await apiClient.deleteComment(deletingCommentId);
      if (res.success) {
        setDeletingCommentId(null);
        await fetchComments();
        onCommentCountChangeRef.current?.(Math.max(0, telemetry.totalComments - 1));
      } else {
        setError(res.error?.message || 'Failed to delete comment.');
      }
    } catch (err: any) {
      setError(err.message || 'Error deleting comment.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Format relative time (e.g. "5 minutes ago", "2 hours ago")
  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch {
      return '';
    }
  };

  // Safe renderer for comment body with highlighted @mentions and simple formatting
  const renderCommentContent = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="d-flex flex-column gap-1.5" style={{ fontSize: '0.88rem', lineHeight: 1.55 }}>
        {lines.map((line, lIdx) => {
          // Tokenize mentions (@username)
          const parts = line.split(/(@[A-Za-z0-9_.\s]+?(?=\s|[.,!?]|$))/g);
          return (
            <p key={lIdx} className="m-0 text-secondary">
              {parts.map((part, pIdx) => {
                if (part.startsWith('@')) {
                  return (
                    <span
                      key={pIdx}
                      className="badge fw-semibold rounded-pill px-2 py-0.5 mx-0.5"
                      style={{
                        backgroundColor: '#EEF2FF',
                        color: '#4F46E5',
                        fontSize: '0.82rem',
                        border: '1px solid #E0E7FF'
                      }}
                    >
                      {part}
                    </span>
                  );
                }
                return part;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white border rounded-4 p-4 shadow-sm">
      {/* Discussion Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3.5">
        <div className="d-flex align-items-center gap-2.5">
          <div
            className="rounded-circle p-2 d-flex align-items-center justify-content-center"
            style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}
          >
            <MessageSquare size={18} />
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h6 className="fw-bold text-dark m-0">Task Discussions & Collaboration</h6>
              <span className="badge bg-light text-secondary border small">
                {telemetry.totalComments} {telemetry.totalComments === 1 ? 'Comment' : 'Comments'}
              </span>
            </div>
            <p className="text-muted small m-0" style={{ fontSize: '0.78rem' }}>
              Real-time asynchronous updates, technical notes, and @mentions
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-sm btn-outline-secondary rounded-3 d-flex align-items-center gap-1.5"
          onClick={fetchComments}
          disabled={isLoading}
          title="Refresh discussions"
        >
          <RefreshCw size={13} className={isLoading ? 'spin' : ''} />
          <span className="small">Refresh</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between py-2 px-3 rounded-3 small mb-3">
          <div className="d-flex align-items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-link text-danger p-0 fw-semibold text-decoration-none"
            onClick={fetchComments}
          >
            Retry
          </button>
        </div>
      )}

      {/* Discussion Thread Feed */}
      <div className="d-flex flex-column gap-3 mb-4">
        {isLoading && comments.length === 0 ? (
          /* Shimmer Loading Skeleton */
          <div className="d-flex flex-column gap-3 py-3">
            {[1, 2].map((k) => (
              <div key={k} className="p-3 bg-light rounded-3 d-flex gap-3 align-items-start">
                <div
                  className="rounded-circle bg-secondary-subtle flex-shrink-0"
                  style={{ width: 36, height: 36 }}
                />
                <div className="flex-grow-1 d-flex flex-column gap-2">
                  <div
                    className="bg-secondary-subtle rounded-2"
                    style={{ width: 140, height: 14 }}
                  />
                  <div
                    className="bg-secondary-subtle rounded-2"
                    style={{ width: '80%', height: 28 }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          /* Clean Zero State */
          <div className="text-center py-5 border border-dashed rounded-3 p-4">
            <div
              className="rounded-circle bg-indigo-subtle text-primary p-3 mx-auto mb-2.5 d-flex align-items-center justify-content-center"
              style={{ width: 52, height: 52 }}
            >
              <MessageSquare size={24} />
            </div>
            <h6 className="fw-bold text-dark mb-1">No discussions on this task yet</h6>
            <p className="text-muted small mx-auto mb-3" style={{ maxWidth: 440 }}>
              Be the first to share a progress update, ask for technical clarification, or tag a
              collaborator with <span className="text-primary font-monospace">@mention</span>.
            </p>
          </div>
        ) : (
          /* Rendered Root Comments */
          comments.map((comment) => {
            const currentUserId = currentUser
              ? currentUser._id || (currentUser as any).id || (currentUser as any).userId
              : null;
            const isAuthor = currentUserId === comment.author.id;

            const isEditing = editingCommentId === comment.id;

            return (
              <div
                key={comment.id}
                className="p-3 rounded-3 border bg-white shadow-xs transition-all hover-border-primary"
              >
                {/* Comment Author Header */}
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2.5">
                    {/* Avatar */}
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                      style={{
                        width: 34,
                        height: 34,
                        backgroundColor: '#4F46E5',
                        fontSize: '0.78rem'
                      }}
                    >
                      {comment.author.name ? comment.author.name[0].toUpperCase() : 'U'}
                    </div>

                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-semibold text-dark small">{comment.author.name}</span>
                        {isAuthor && (
                          <span
                            className="badge rounded-pill bg-primary-subtle text-primary"
                            style={{ fontSize: '0.68rem' }}
                          >
                            You
                          </span>
                        )}
                        <span className="text-muted small" style={{ fontSize: '0.74rem' }}>
                          &bull; {formatRelativeTime(comment.createdAt)}
                        </span>
                        {comment.isEdited && (
                          <span
                            className="text-muted small fst-italic"
                            style={{ fontSize: '0.72rem' }}
                            title={comment.editedAt ? `Edited: ${new Date(comment.editedAt).toLocaleString()}` : 'Edited'}
                          >
                            (edited)
                          </span>
                        )}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                        {comment.author.email}
                      </div>
                    </div>
                  </div>

                  {/* Comment Actions (Edit / Delete / Reply) */}
                  {!comment.isDeleted && !isEditing && (
                    <div className="d-flex align-items-center gap-1">
                      <button
                        type="button"
                        className="btn btn-sm btn-link text-muted p-1 text-decoration-none d-flex align-items-center gap-1 hover-text-primary"
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => {
                          setReplyingToCommentId(
                            replyingToCommentId === comment.id ? null : comment.id
                          );
                          setReplyContent('');
                        }}
                      >
                        <CornerDownRight size={13} />
                        <span>Reply</span>
                      </button>

                      {isAuthor && (
                        <>
                          <button
                            type="button"
                            className="btn btn-sm btn-link text-muted p-1 text-decoration-none hover-text-primary"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => {
                              setEditingCommentId(comment.id);
                              setEditContent(comment.content);
                            }}
                            title="Edit Comment"
                          >
                            <Edit2 size={13} />
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-link text-muted p-1 text-decoration-none hover-text-danger"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => setDeletingCommentId(comment.id)}
                            title="Delete Comment"
                          >
                            <Trash2 size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Comment Body / Edit Form */}
                {isEditing ? (
                  <div className="d-flex flex-column gap-2 mt-2">
                    <textarea
                      className="form-control rounded-3 p-2.5 small"
                      rows={3}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      disabled={isSubmittingEdit}
                      autoFocus
                    />
                    <div className="d-flex align-items-center justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary rounded-2 px-2.5 py-1"
                        style={{ fontSize: '0.78rem' }}
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditContent('');
                        }}
                        disabled={isSubmittingEdit}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary rounded-2 px-3 py-1 fw-semibold d-flex align-items-center gap-1"
                        style={{
                          backgroundColor: '#4F46E5',
                          borderColor: '#4F46E5',
                          fontSize: '0.78rem'
                        }}
                        onClick={() => handleSaveEdit(comment.id)}
                        disabled={isSubmittingEdit || !editContent.trim()}
                      >
                        {isSubmittingEdit ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                ) : comment.isDeleted ? (
                  <div className="p-2.5 bg-light border border-dashed rounded-3 text-muted small fst-italic">
                    [This comment was deleted by author]
                  </div>
                ) : (
                  <div className="mt-1">{renderCommentContent(comment.content)}</div>
                )}

                {/* Threaded Replies (1-Level Indented) */}
                {comment.replies && comment.replies.length > 0 && (
                  <div
                    className="mt-3 pt-2.5 border-top d-flex flex-column gap-2.5 ps-3"
                    style={{ borderLeft: '2px solid #E2E8F0', marginLeft: 16 }}
                  >
                    {comment.replies.map((reply) => {
                      const currentUserId = currentUser
                        ? currentUser._id || (currentUser as any).id || (currentUser as any).userId
                        : null;
                      const isReplyAuthor = currentUserId === reply.author.id;

                      const isReplyEditing = editingCommentId === reply.id;

                      return (
                        <div key={reply.id} className="p-2.5 bg-slate-50 rounded-3 border">
                          <div className="d-flex align-items-center justify-content-between mb-1.5">
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                                style={{
                                  width: 24,
                                  height: 24,
                                  backgroundColor: '#10B981',
                                  fontSize: '0.68rem'
                                }}
                              >
                                {reply.author.name ? reply.author.name[0].toUpperCase() : 'U'}
                              </div>
                              <span className="fw-semibold text-dark small" style={{ fontSize: '0.8rem' }}>
                                {reply.author.name}
                              </span>
                              {isReplyAuthor && (
                                <span
                                  className="badge rounded-pill bg-success-subtle text-success"
                                  style={{ fontSize: '0.62rem' }}
                                >
                                  You
                                </span>
                              )}
                              <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                                &bull; {formatRelativeTime(reply.createdAt)}
                              </span>
                              {reply.isEdited && (
                                <span
                                  className="text-muted small fst-italic"
                                  style={{ fontSize: '0.68rem' }}
                                >
                                  (edited)
                                </span>
                              )}
                            </div>

                            {/* Reply Edit / Delete */}
                            {!reply.isDeleted && !isReplyEditing && isReplyAuthor && (
                              <div className="d-flex align-items-center gap-1">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-link text-muted p-0.5 text-decoration-none"
                                  onClick={() => {
                                    setEditingCommentId(reply.id);
                                    setEditContent(reply.content);
                                  }}
                                  title="Edit Reply"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-link text-muted p-0.5 text-decoration-none hover-text-danger"
                                  onClick={() => setDeletingCommentId(reply.id)}
                                  title="Delete Reply"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Reply Body / Edit */}
                          {isReplyEditing ? (
                            <div className="d-flex flex-column gap-2 mt-1.5">
                              <textarea
                                className="form-control rounded-2 p-2 small"
                                rows={2}
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                disabled={isSubmittingEdit}
                                autoFocus
                              />
                              <div className="d-flex align-items-center justify-content-end gap-1.5">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary rounded-2 px-2 py-0.5"
                                  style={{ fontSize: '0.74rem' }}
                                  onClick={() => {
                                    setEditingCommentId(null);
                                    setEditContent('');
                                  }}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-primary rounded-2 px-2.5 py-0.5 fw-semibold"
                                  style={{
                                    backgroundColor: '#4F46E5',
                                    borderColor: '#4F46E5',
                                    fontSize: '0.74rem'
                                  }}
                                  onClick={() => handleSaveEdit(reply.id)}
                                  disabled={isSubmittingEdit || !editContent.trim()}
                                >
                                  {isSubmittingEdit ? 'Saving...' : 'Save'}
                                </button>
                              </div>
                            </div>
                          ) : reply.isDeleted ? (
                            <div className="p-2 bg-light border border-dashed rounded-2 text-muted small fst-italic">
                              [This reply was deleted by author]
                            </div>
                          ) : (
                            renderCommentContent(reply.content)
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Inline Reply Composer for this comment */}
                {replyingToCommentId === comment.id && (
                  <div
                    className="mt-3 pt-2.5 border-top ps-3"
                    style={{ borderLeft: '2px solid #4F46E5', marginLeft: 16 }}
                  >
                    <div className="d-flex flex-column gap-2 bg-light p-2.5 rounded-3 border">
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="small fw-semibold text-muted d-flex align-items-center gap-1">
                          <CornerDownRight size={13} className="text-primary" />
                          Replying to {comment.author.name}
                        </span>
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-muted p-0"
                          onClick={() => setReplyingToCommentId(null)}
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <textarea
                        ref={replyTextareaRef}
                        className="form-control rounded-2 p-2 small bg-white"
                        rows={2}
                        placeholder={`Write your reply to ${comment.author.name}...`}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            handlePostReply(comment.id);
                          }
                        }}
                        autoFocus
                      />

                      <div className="d-flex align-items-center justify-content-end gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary rounded-2 px-2.5 py-1"
                          style={{ fontSize: '0.78rem' }}
                          onClick={() => setReplyingToCommentId(null)}
                          disabled={isSubmittingReply}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-primary rounded-2 px-3 py-1 fw-semibold d-flex align-items-center gap-1"
                          style={{
                            backgroundColor: '#4F46E5',
                            borderColor: '#4F46E5',
                            fontSize: '0.78rem'
                          }}
                          onClick={() => handlePostReply(comment.id)}
                          disabled={isSubmittingReply || !replyContent.trim()}
                        >
                          {isSubmittingReply ? (
                            'Posting...'
                          ) : (
                            <>
                              <Send size={12} />
                              <span>Post Reply</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Main Bottom Composer */}
      <div className="border rounded-3 p-3 bg-light position-relative">
        {/* Formatting Toolbar */}
        <div className="d-flex flex-wrap align-items-center justify-content-between pb-2 mb-2 border-bottom">
          <div className="d-flex align-items-center gap-1">
            <button
              type="button"
              className="btn btn-sm btn-link text-muted p-1 hover-text-dark"
              onClick={() => applyFormatting('bold')}
              title="Bold (**text**)"
            >
              <Bold size={14} />
            </button>
            <button
              type="button"
              className="btn btn-sm btn-link text-muted p-1 hover-text-dark"
              onClick={() => applyFormatting('italic')}
              title="Italic (*text*)"
            >
              <Italic size={14} />
            </button>
            <button
              type="button"
              className="btn btn-sm btn-link text-muted p-1 hover-text-dark"
              onClick={() => applyFormatting('code')}
              title="Code (`code`)"
            >
              <Code size={14} />
            </button>
            <button
              type="button"
              className="btn btn-sm btn-link text-muted p-1 hover-text-dark"
              onClick={() => applyFormatting('link')}
              title="Link ([title](url))"
            >
              <Link2 size={14} />
            </button>
            <button
              type="button"
              className="btn btn-sm btn-link text-muted p-1 hover-text-dark"
              onClick={() => applyFormatting('list')}
              title="Bullet List (- item)"
            >
              <List size={14} />
            </button>
            <button
              type="button"
              className="btn btn-sm btn-link text-muted p-1 hover-text-dark"
              onClick={() => applyFormatting('quote')}
              title="Quote (> quote)"
            >
              <Quote size={14} />
            </button>
            <div className="vr mx-1 opacity-25" style={{ height: 16 }} />
            <button
              type="button"
              className="btn btn-sm btn-link text-primary p-1 fw-semibold d-flex align-items-center gap-1"
              onClick={() => {
                const updated = `${mainContent}@`;
                setMainContent(updated);
                setShowMentionPopup(true);
                loadMentionableMembers();
                mainTextareaRef.current?.focus();
              }}
              title="Mention a collaborator"
              style={{ fontSize: '0.78rem' }}
            >
              <AtSign size={13} />
              <span>Mention</span>
            </button>
          </div>

          <span className="text-muted" style={{ fontSize: '0.72rem' }}>
            Markdown supported &bull; Ctrl+Enter to post
          </span>
        </div>

        {/* Textarea */}
        <textarea
          ref={mainTextareaRef}
          className="form-control rounded-2 p-2.5 small bg-white"
          rows={3}
          placeholder="Add a technical comment or progress update... Type @ to mention team members"
          value={mainContent}
          onChange={handleMainContentChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              handlePostComment();
            }
          }}
          disabled={isSubmitting}
        />

        {/* Mention Autocomplete Floating Popup */}
        {showMentionPopup && mentionMembers.length > 0 && (
          <div
            className="position-absolute bg-white rounded-3 shadow-lg border p-1"
            style={{
              bottom: 60,
              left: 20,
              width: 260,
              maxHeight: 200,
              overflowY: 'auto',
              zIndex: 1050
            }}
          >
            <div
              className="px-2 py-1 text-uppercase text-muted fw-bold"
              style={{ fontSize: '0.65rem' }}
            >
              Eligible Collaborators
            </div>
            {mentionMembers.map((m) => (
              <div
                key={m.id}
                className="d-flex align-items-center gap-2 p-2 rounded-2 cursor-pointer hover-bg-slate"
                style={{ cursor: 'pointer' }}
                onClick={() => handleSelectMention(m)}
              >
                <div
                  className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: 24,
                    height: 24,
                    backgroundColor: '#4F46E5',
                    fontSize: '0.65rem'
                  }}
                >
                  {m.name ? m.name[0].toUpperCase() : 'U'}
                </div>
                <div className="overflow-hidden">
                  <div className="fw-semibold text-dark small text-truncate" style={{ fontSize: '0.78rem' }}>
                    {m.name}
                  </div>
                  <div className="text-muted text-truncate" style={{ fontSize: '0.68rem' }}>
                    {m.role || 'Member'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="d-flex align-items-center justify-content-between mt-2.5">
          <div className="d-flex align-items-center gap-2">
            <span
              className={`small ${
                mainContent.length > 4500 ? 'text-danger fw-bold' : 'text-muted'
              }`}
              style={{ fontSize: '0.74rem' }}
            >
              {mainContent.length} / 5,000 characters
            </span>
            {mainContent.length > 4800 && (
              <span className="badge bg-warning-subtle text-warning small">
                Approaching limit
              </span>
            )}
          </div>

          <button
            type="button"
            className="btn btn-primary rounded-3 px-3.5 py-1.5 fw-semibold small shadow-sm d-flex align-items-center gap-1.5"
            style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
            onClick={handlePostComment}
            disabled={isSubmitting || !mainContent.trim()}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                <span>Posting...</span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>Post Comment</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal (Accessible & Non-native) */}
      {deletingCommentId && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 1080
          }}
        >
          <div className="bg-white rounded-4 shadow-lg border p-4 w-100" style={{ maxWidth: 460 }}>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div
                className="rounded-circle p-2.5 d-flex align-items-center justify-content-center text-danger"
                style={{ backgroundColor: '#FFF1F2' }}
              >
                <Trash2 size={22} />
              </div>
              <div>
                <h5 className="fw-bold text-dark m-0">Delete Comment?</h5>
                <p className="text-muted small m-0">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-secondary small mb-4">
              Are you sure you want to delete this comment? If team members have already replied to
              it, their replies will remain safely preserved with a soft-deleted placeholder.
            </p>

            <div className="d-flex align-items-center justify-content-end gap-2.5">
              <button
                type="button"
                className="btn btn-outline-secondary rounded-3 px-3.5 py-2 small fw-medium"
                onClick={() => setDeletingCommentId(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger rounded-3 px-4 py-2 small fw-semibold shadow-sm d-flex align-items-center gap-1.5"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Comment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
