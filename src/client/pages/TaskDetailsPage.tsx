import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useWorkzenStore } from '../store/useWorkzenStore.js';
import { apiClient } from '../api/client.js';
import { TASK_STATUS, TASK_PRIORITY } from '../../shared/constants/status.js';
import { PriorityChip } from '../components/common/PriorityChip.js';
import { AvatarGroup } from '../components/common/AvatarGroup.js';
import { EditTaskModal } from '../components/modals/EditTaskModal.js';
import { DeleteTaskModal } from '../components/modals/DeleteTaskModal.js';
import { TaskDiscussionSection } from '../components/comments/TaskDiscussionSection.js';
import { io, Socket } from 'socket.io-client';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  CheckSquare,
  MessageSquare,
  Plus,
  Tag,
  Edit,
  Archive,
  RotateCcw,
  Trash2,
  AlertCircle,
  FolderKanban,
  ExternalLink,
  History,
  CheckCircle2,
  RefreshCw,
  Layers,
  Lock,
  Link2,
  Unlink,
  Square
} from 'lucide-react';

export const TaskDetailsPage: React.FC = () => {
  const { selectedTaskId, setActiveView, setSelectedTaskId } = useWorkzenStore();

  const [task, setTask] = useState<any | null>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState<'archive' | 'permanent'>('archive');

  // Subtasks state
  const [subtasks, setSubtasks] = useState<any[]>([]);
  const [isAddingSubtask, setIsAddingSubtask] = useState<boolean>(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState<string>('');
  const [newSubtaskPriority, setNewSubtaskPriority] = useState<string>(TASK_PRIORITY.MEDIUM);
  const [isSubmittingSubtask, setIsSubmittingSubtask] = useState<boolean>(false);
  const [subtaskError, setSubtaskError] = useState<string | null>(null);

  // Dependencies state
  const [isAddDepModalOpen, setIsAddDepModalOpen] = useState<boolean>(false);
  const [availablePrereqTasks, setAvailablePrereqTasks] = useState<any[]>([]);
  const [selectedPrereqTaskId, setSelectedPrereqTaskId] = useState<string>('');
  const [depError, setDepError] = useState<string | null>(null);
  const [isSubmittingDep, setIsSubmittingDep] = useState<boolean>(false);

  // Assignee picker state
  const [isAssigning, setIsAssigning] = useState(false);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);

  // Socket
  const socketRef = useRef<Socket | null>(null);

  const handleCommentActivityRefresh = useCallback(() => {
    const tId = selectedTaskId;
    if (tId) {
      apiClient.getTaskActivity(tId, 20).then((res) => {
        if (res.success && res.data?.activity) {
          setActivity(res.data.activity);
        }
      }).catch(() => {});
    }
  }, [selectedTaskId]);

  const fetchTaskDetails = useCallback(async () => {
    if (!selectedTaskId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [taskRes, activityRes, subtasksRes] = await Promise.all([
        apiClient.getTask(selectedTaskId),
        apiClient.getTaskActivity(selectedTaskId, 20),
        apiClient.getSubtasks(selectedTaskId)
      ]);

      if (taskRes.success && taskRes.data?.task) {
        setTask(taskRes.data.task);

        // Load project members for assignment
        const pId = taskRes.data.task.project?.id || taskRes.data.task.projectId;
        if (pId) {
          apiClient
            .listProjectMembers(pId)
            .then((mRes) => {
              if (mRes.success && mRes.data?.members) {
                setProjectMembers(mRes.data.members);
              }
            })
            .catch(() => {});
        }
      } else {
        setError(taskRes.error?.message || 'Task not found.');
      }

      if (subtasksRes.success && subtasksRes.data?.subtasks) {
        setSubtasks(subtasksRes.data.subtasks);
      }

      if (activityRes.success && activityRes.data?.activity) {
        setActivity(activityRes.data.activity);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading task details.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedTaskId]);

  useEffect(() => {
    fetchTaskDetails();
  }, [fetchTaskDetails]);

  // Real-time updates via Socket.IO
  useEffect(() => {
    if (!selectedTaskId || !task?.project?.id) return;

    try {
      const socket = io({ reconnectionAttempts: 5, timeout: 10000 });
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('project:join', task.project.id);
      });

      const handleUpdate = () => fetchTaskDetails();

      socket.on('task:updated', handleUpdate);
      socket.on('task:status_updated', handleUpdate);
      socket.on('task:assigned', handleUpdate);
      socket.on('task:archived', handleUpdate);
      socket.on('task:restored', handleUpdate);

      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    } catch {
      // Ignored
    }
  }, [selectedTaskId, task?.project?.id, fetchTaskDetails]);

  // Quick Status change
  const handleStatusChange = async (newStatus: string) => {
    if (!task) return;
    try {
      const res = await apiClient.updateTaskStatus(task.id, newStatus);
      if (res.success) {
        setTask({ ...task, status: newStatus });
        fetchTaskDetails();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update status.');
    }
  };

  // Quick Priority change
  const handlePriorityChange = async (newPriority: string) => {
    if (!task) return;
    try {
      const res = await apiClient.updateTaskPriority(task.id, newPriority);
      if (res.success) {
        setTask({ ...task, priority: newPriority });
        fetchTaskDetails();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update priority.');
    }
  };

  // Toggle member assignment
  const handleToggleMember = async (memberUserId: string) => {
    if (!task) return;
    const currentAssigneeIds = (task.assignees || []).map((a: any) => a.id || a._id);
    const newIds = currentAssigneeIds.includes(memberUserId)
      ? currentAssigneeIds.filter((id: string) => id !== memberUserId)
      : [...currentAssigneeIds, memberUserId];

    try {
      const res = await apiClient.assignTask(task.id, newIds);
      if (res.success) {
        fetchTaskDetails();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update assignment.');
    }
  };

  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const isPast = date < now && date.toDateString() !== now.toDateString();
    const formatted = date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    return { formatted, isPast };
  };

  // Subtask Handlers
  const handleCreateSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task?.id || !newSubtaskTitle.trim()) return;

    setIsSubmittingSubtask(true);
    setSubtaskError(null);

    try {
      const res = await apiClient.createSubtask(task.id, {
        title: newSubtaskTitle.trim(),
        priority: newSubtaskPriority
      });

      if (res.success) {
        setNewSubtaskTitle('');
        setIsAddingSubtask(false);
        fetchTaskDetails();
      } else {
        setSubtaskError(res.error?.message || 'Failed to create subtask');
      }
    } catch (err: any) {
      setSubtaskError(err.message || 'Failed to create subtask');
    } finally {
      setIsSubmittingSubtask(false);
    }
  };

  const handleToggleSubtask = async (subtaskId: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === TASK_STATUS.DONE ? TASK_STATUS.TODO : TASK_STATUS.DONE;
      await apiClient.updateTaskStatus(subtaskId, nextStatus);
      fetchTaskDetails();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle subtask status');
    }
  };

  // Dependency Handlers
  const handleOpenAddDepModal = async () => {
    if (!task?.project?.id) return;
    setDepError(null);
    setSelectedPrereqTaskId('');
    setIsAddDepModalOpen(true);

    try {
      const res = await apiClient.listTasks({ projectId: task.project.id, limit: 100 });
      if (res.success && res.data?.tasks) {
        const existingPrereqIds = new Set((task.blockedByIds || []).map((id: any) => id.toString()));
        const available = res.data.tasks.filter(
          (t: any) => t.id !== task.id && !existingPrereqIds.has(t.id)
        );
        setAvailablePrereqTasks(available);
      }
    } catch (err: any) {
      setDepError(err.message || 'Failed to load project tasks');
    }
  };

  const handleAddDependency = async () => {
    if (!task?.id || !selectedPrereqTaskId) return;

    setIsSubmittingDep(true);
    setDepError(null);

    try {
      const res = await apiClient.addDependency(task.id, selectedPrereqTaskId);
      if (res.success) {
        setIsAddDepModalOpen(false);
        setSelectedPrereqTaskId('');
        fetchTaskDetails();
      } else {
        setDepError(res.error?.message || 'Failed to add prerequisite dependency');
      }
    } catch (err: any) {
      setDepError(err.message || 'Failed to add prerequisite dependency');
    } finally {
      setIsSubmittingDep(false);
    }
  };

  const handleRemoveDependency = async (prereqId: string) => {
    if (!task?.id) return;

    try {
      const res = await apiClient.removeDependency(task.id, prereqId);
      if (res.success) {
        fetchTaskDetails();
      } else {
        setError(res.error?.message || 'Failed to remove dependency');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to remove dependency');
    }
  };

  if (!selectedTaskId || (!task && !isLoading)) {
    return (
      <div className="bg-white border rounded-4 p-5 text-center my-4 shadow-sm">
        <div
          className="rounded-circle p-3 d-flex align-items-center justify-content-center mb-3 mx-auto"
          style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', width: 64, height: 64 }}
        >
          <CheckSquare size={32} />
        </div>
        <h4 className="fw-bold text-dark mb-2">No Task Selected</h4>
        <p className="text-secondary small mb-4" style={{ maxWidth: 440, margin: '0 auto' }}>
          Select a task from your task list or Kanban board to inspect its complete specifications,
          acceptance criteria, and audit timeline.
        </p>
        <div className="d-flex align-items-center justify-content-center gap-2">
          <button
            className="btn btn-outline-secondary px-3 py-2 rounded-3 fw-medium"
            onClick={() => setActiveView('tasks')}
          >
            Go to Tasks
          </button>
          <button
            className="btn btn-primary px-4 py-2 rounded-3 fw-semibold shadow-sm"
            style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
            onClick={() => setActiveView('kanban')}
          >
            Go to Kanban Board
          </button>
        </div>
      </div>
    );
  }

  if (isLoading && !task) {
    return (
      <div className="p-5 text-center text-muted">
        <RefreshCw size={28} className="spin-animation text-primary mb-2" />
        <p className="small m-0">Loading task specifications...</p>
      </div>
    );
  }

  const due = formatDueDate(task?.dueDate);
  const start = formatDueDate(task?.startDate);

  return (
    <div className="d-flex flex-column gap-3 pb-5">
      {/* 1. Navigation & Actions Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 rounded-3 px-2.5 py-1.5 fw-medium"
            onClick={() => setActiveView('tasks')}
          >
            <ArrowLeft size={16} />
            <span>Tasks</span>
          </button>
          <span className="text-muted">/</span>
          <button
            className="btn btn-sm btn-link text-secondary text-decoration-none p-0 fw-medium small"
            onClick={() => setActiveView('kanban')}
          >
            Kanban Board
          </button>
          <span className="text-muted">/</span>
          <span className="badge bg-light text-secondary border font-monospace">
            {task?.taskKey}
          </span>
          {task?.isArchived && (
            <span className="badge bg-warning-subtle text-warning border border-warning">
              Archived
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-sm btn-outline-secondary rounded-3 fw-medium d-flex align-items-center gap-1.5"
            onClick={() => setIsEditOpen(true)}
          >
            <Edit size={14} />
            <span>Edit Task</span>
          </button>

          {task?.isArchived ? (
            <button
              className="btn btn-sm btn-outline-success rounded-3 fw-medium d-flex align-items-center gap-1.5"
              onClick={async () => {
                await apiClient.restoreTask(task.id);
                fetchTaskDetails();
              }}
            >
              <RotateCcw size={14} />
              <span>Restore</span>
            </button>
          ) : (
            <button
              className="btn btn-sm btn-outline-warning rounded-3 fw-medium d-flex align-items-center gap-1.5"
              onClick={() => {
                setDeleteMode('archive');
                setIsDeleteOpen(true);
              }}
            >
              <Archive size={14} />
              <span>Archive</span>
            </button>
          )}

          <button
            className="btn btn-sm btn-outline-danger rounded-3 fw-medium d-flex align-items-center gap-1.5"
            onClick={() => {
              setDeleteMode('permanent');
              setIsDeleteOpen(true);
            }}
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="alert alert-danger py-2 px-3 rounded-3 small mb-0 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button className="btn btn-sm btn-link text-danger p-0 fw-bold" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Main Content Split View */}
      <div className="row g-3">
        {/* Left Column: Details & Audit Trail (70%) */}
        <div className="col-12 col-lg-8 d-flex flex-column gap-3">
          {/* Phase 15: Blocked State Warning Banner */}
          {task?.isBlocked && (
            <div className="alert alert-danger py-2.5 px-3 rounded-4 d-flex align-items-center justify-content-between mb-0 border-danger shadow-xs">
              <div className="d-flex align-items-center gap-2.5">
                <div
                  className="rounded-circle bg-danger text-white p-1.5 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 28, height: 28 }}
                >
                  <Lock size={14} />
                </div>
                <div>
                  <span className="fw-bold small d-block text-danger">Task is Currently Blocked</span>
                  <span className="small text-secondary">
                    Waiting on unfinished prerequisite:
                    {task.blockedByTasks
                      ?.filter((b: any) => b.status !== TASK_STATUS.DONE && !b.isArchived)
                      .map((b: any) => (
                        <button
                          key={b.id}
                          className="btn btn-link text-danger p-0 fw-bold small text-decoration-underline ms-1.5"
                          onClick={() => setSelectedTaskId(b.id)}
                        >
                          {b.taskKey} ({b.title})
                        </button>
                      ))}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Phase 15: Parent Task Breadcrumb */}
          {task?.parentTask && (
            <div className="d-flex align-items-center justify-content-between px-3 py-2 bg-light border rounded-3 small">
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted fw-semibold">Parent Task:</span>
                <button
                  className="btn btn-link text-primary p-0 fw-bold small text-decoration-none d-flex align-items-center gap-1"
                  onClick={() => setSelectedTaskId(task.parentTask.id)}
                >
                  <span>{task.parentTask.taskKey}: {task.parentTask.title}</span>
                  <ExternalLink size={12} />
                </button>
              </div>
              <span className="badge bg-white text-secondary border small font-monospace">
                {task.parentTask.status}
              </span>
            </div>
          )}

          {/* Main Card */}
          <div className="bg-white border rounded-4 p-4 shadow-sm">
            {/* Task Title */}
            <h4 className="fw-bold text-dark mb-2" style={{ lineHeight: 1.35 }}>
              {task?.title}
            </h4>

            {/* Quick Status and Priority Switchers Bar */}
            <div className="d-flex flex-wrap align-items-center gap-3 py-2.5 my-2 border-top border-bottom">
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small fw-medium">Status:</span>
                <select
                  className="form-select form-select-sm border-slate-200 fw-semibold text-secondary rounded-3"
                  style={{ width: 'auto', fontSize: '0.8rem' }}
                  value={task?.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <option value={TASK_STATUS.TODO}>To Do</option>
                  <option value={TASK_STATUS.IN_PROGRESS}>In Progress</option>
                  <option value={TASK_STATUS.REVIEW}>In Review</option>
                  <option value={TASK_STATUS.DONE}>Completed</option>
                  <option value={TASK_STATUS.BACKLOG}>Backlog</option>
                </select>
              </div>

              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small fw-medium">Priority:</span>
                <select
                  className="form-select form-select-sm border-slate-200 fw-semibold text-secondary rounded-3"
                  style={{ width: 'auto', fontSize: '0.8rem' }}
                  value={task?.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                >
                  <option value={TASK_PRIORITY.LOW}>Low</option>
                  <option value={TASK_PRIORITY.MEDIUM}>Medium</option>
                  <option value={TASK_PRIORITY.HIGH}>High</option>
                  <option value={TASK_PRIORITY.URGENT}>Urgent</option>
                </select>
              </div>
            </div>

            {/* Description Section */}
            <div className="mt-3">
              <h6 className="fw-bold text-dark mb-2 small text-uppercase tracking-wider">
                Description & Acceptance Criteria
              </h6>
              {task?.description ? (
                <div
                  className="p-3 bg-light rounded-3 text-secondary"
                  style={{ fontSize: '0.88rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}
                >
                  {task.description}
                </div>
              ) : (
                <div className="p-3 bg-light rounded-3 text-muted small border border-dashed">
                  No description provided for this task. Click "Edit Task" to add technical
                  specifications or requirements.
                </div>
              )}
            </div>

            {/* Tags Section */}
            {task?.tags && task.tags.length > 0 && (
              <div className="mt-3">
                <h6 className="fw-bold text-dark mb-2 small text-uppercase tracking-wider">
                  Tags & Classifications
                </h6>
                <div className="d-flex flex-wrap gap-1.5">
                  {task.tags.map((tag: string, idx: number) => (
                    <span
                      key={idx}
                      className="badge bg-light text-secondary border px-2.5 py-1 rounded-2 small"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Phase 15: Subtasks Management Card */}
          <div className="bg-white border rounded-4 p-4 shadow-sm">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
              <div className="d-flex align-items-center gap-2">
                <CheckSquare size={18} className="text-primary" />
                <h6 className="fw-bold text-dark m-0">Subtasks</h6>
                <span className="badge bg-light text-secondary border small">
                  {task?.subtaskProgress?.completed || 0} / {task?.subtaskProgress?.total || 0} Done
                </span>
              </div>
              <span className="small fw-semibold text-secondary">
                {task?.subtaskProgress?.percentage || 0}% Complete
              </span>
            </div>

            {/* Subtask Progress Bar */}
            <div className="progress mb-3.5" style={{ height: 6, backgroundColor: '#E2E8F0' }}>
              <div
                className={`progress-bar ${
                  task?.subtaskProgress?.percentage === 100 ? 'bg-success' : 'bg-primary'
                }`}
                style={{
                  width: `${task?.subtaskProgress?.percentage || 0}%`,
                  transition: 'width 0.3s ease-in-out'
                }}
              ></div>
            </div>

            {/* Subtask Error alert */}
            {subtaskError && (
              <div className="alert alert-danger py-2 px-3 rounded-3 small mb-3 d-flex align-items-center justify-content-between">
                <span>{subtaskError}</span>
                <button
                  type="button"
                  className="btn btn-sm btn-link text-danger p-0 fw-bold"
                  onClick={() => setSubtaskError(null)}
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Subtasks List */}
            {subtasks.length === 0 ? (
              <div className="p-3.5 text-center text-muted small border border-dashed rounded-3 bg-light mb-3">
                No subtasks created for this task yet. Break down complex tasks into smaller actionable items.
              </div>
            ) : (
              <div className="d-flex flex-column gap-2 mb-3">
                {subtasks.map((st: any) => {
                  const isDone = st.status === TASK_STATUS.DONE;
                  return (
                    <div
                      key={st.id}
                      className="p-2.5 bg-light border rounded-3 d-flex align-items-center justify-content-between gap-2.5 transition-all"
                      style={{
                        opacity: isDone ? 0.75 : 1
                      }}
                    >
                      <div className="d-flex align-items-center gap-2.5 flex-grow-1">
                        <button
                          type="button"
                          className="btn btn-link p-0 text-decoration-none border-0 d-flex align-items-center"
                          onClick={() => handleToggleSubtask(st.id, st.status)}
                          title={isDone ? 'Mark as To Do' : 'Mark as Done'}
                        >
                          {isDone ? (
                            <CheckSquare size={18} className="text-success" />
                          ) : (
                            <Square size={18} className="text-secondary" />
                          )}
                        </button>
                        <span className="badge bg-white text-muted border font-monospace small" style={{ fontSize: '0.7rem' }}>
                          {st.taskKey}
                        </span>
                        <button
                          type="button"
                          className={`btn btn-link text-start p-0 fw-semibold text-decoration-none ${
                            isDone ? 'text-decoration-line-through text-muted' : 'text-dark'
                          }`}
                          style={{ fontSize: '0.85rem' }}
                          onClick={() => setSelectedTaskId(st.id)}
                        >
                          {st.title}
                        </button>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <PriorityChip priority={st.priority} />
                        <span
                          className={`badge small ${
                            isDone ? 'bg-success-subtle text-success' : 'bg-white text-secondary border'
                          }`}
                          style={{ fontSize: '0.68rem' }}
                        >
                          {st.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Subtask Creation Controls */}
            {task?.parentId ? (
              <div className="p-2 bg-light rounded-3 text-muted small text-center border">
                Subtasks cannot have nested subtasks. Workzen enforces a max 1-level subtask hierarchy.
              </div>
            ) : isAddingSubtask ? (
              <form onSubmit={handleCreateSubtask} className="p-3 bg-light border rounded-3 d-flex flex-column gap-2.5">
                <div className="d-flex flex-wrap align-items-center gap-2">
                  <input
                    type="text"
                    className="form-control form-control-sm flex-grow-1 border-slate-200 rounded-2"
                    placeholder="Subtask title..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    autoFocus
                    required
                  />
                  <select
                    className="form-select form-select-sm border-slate-200 rounded-2"
                    style={{ width: 'auto' }}
                    value={newSubtaskPriority}
                    onChange={(e) => setNewSubtaskPriority(e.target.value)}
                  >
                    <option value={TASK_PRIORITY.LOW}>Low</option>
                    <option value={TASK_PRIORITY.MEDIUM}>Medium</option>
                    <option value={TASK_PRIORITY.HIGH}>High</option>
                    <option value={TASK_PRIORITY.URGENT}>Urgent</option>
                  </select>
                </div>
                <div className="d-flex align-items-center justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-xs btn-outline-secondary px-2.5 py-1 rounded-2"
                    onClick={() => {
                      setIsAddingSubtask(false);
                      setNewSubtaskTitle('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-xs btn-primary px-3 py-1 rounded-2 fw-semibold"
                    style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
                    disabled={isSubmittingSubtask || !newSubtaskTitle.trim()}
                  >
                    {isSubmittingSubtask ? 'Adding...' : '+ Add Subtask'}
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                className="btn btn-sm btn-outline-primary rounded-3 w-100 py-1.5 fw-medium d-flex align-items-center justify-content-center gap-1.5"
                onClick={() => setIsAddingSubtask(true)}
              >
                <Plus size={14} />
                <span>Add Subtask</span>
              </button>
            )}
          </div>

          {/* Phase 15: Dependencies Management Card */}
          <div className="bg-white border rounded-4 p-4 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2">
                <Link2 size={18} className="text-primary" />
                <h6 className="fw-bold text-dark m-0">Task Dependencies</h6>
              </div>
              <button
                type="button"
                className="btn btn-xs btn-outline-primary px-2.5 py-1 rounded-2 fw-semibold d-flex align-items-center gap-1"
                onClick={handleOpenAddDepModal}
              >
                <Plus size={12} />
                <span>Add Prerequisite</span>
              </button>
            </div>

            {/* Prerequisites Section */}
            <div className="mb-3">
              <span className="small text-muted fw-semibold text-uppercase d-block mb-1.5" style={{ fontSize: '0.72rem' }}>
                Blocked By (Prerequisites) — Must be DONE before this task:
              </span>
              {task?.blockedByTasks && task.blockedByTasks.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {task.blockedByTasks.map((prereq: any) => {
                    const isDone = prereq.status === TASK_STATUS.DONE;
                    return (
                      <div
                        key={prereq.id}
                        className={`p-2.5 border rounded-3 d-flex align-items-center justify-content-between gap-2 ${
                          isDone ? 'bg-light' : 'bg-danger-subtle border-danger-subtle'
                        }`}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-white text-secondary border font-monospace small">
                            {prereq.taskKey}
                          </span>
                          <button
                            type="button"
                            className="btn btn-link text-start p-0 fw-semibold text-dark text-decoration-none small"
                            onClick={() => setSelectedTaskId(prereq.id)}
                          >
                            {prereq.title}
                          </button>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span
                            className={`badge small ${
                              isDone ? 'bg-success-subtle text-success' : 'bg-danger text-white'
                            }`}
                          >
                            {prereq.status}
                          </span>
                          <button
                            type="button"
                            className="btn btn-link text-danger p-0 d-flex align-items-center"
                            title="Remove dependency"
                            onClick={() => handleRemoveDependency(prereq.id)}
                          >
                            <Unlink size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 bg-light rounded-3 text-muted small border border-dashed">
                  No prerequisite tasks defined. This task is not blocked by any other task.
                </div>
              )}
            </div>

            {/* Dependents Section */}
            <div>
              <span className="small text-muted fw-semibold text-uppercase d-block mb-1.5" style={{ fontSize: '0.72rem' }}>
                Blocks (Dependents) — Awaiting this task's completion:
              </span>
              {task?.blocksTasks && task.blocksTasks.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {task.blocksTasks.map((dep: any) => (
                    <div
                      key={dep.id}
                      className="p-2.5 bg-light border rounded-3 d-flex align-items-center justify-content-between gap-2"
                    >
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-white text-secondary border font-monospace small">
                          {dep.taskKey}
                        </span>
                        <button
                          type="button"
                          className="btn btn-link text-start p-0 fw-semibold text-dark text-decoration-none small"
                          onClick={() => setSelectedTaskId(dep.id)}
                        >
                          {dep.title}
                        </button>
                      </div>
                      <span className="badge bg-white text-secondary border small">
                        {dep.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-light rounded-3 text-muted small border border-dashed">
                  No downstream tasks are blocked by this task.
                </div>
              )}
            </div>
          </div>

          {/* Phase 16: Task Comments & Discussions Section */}
          {(task?._id || task?.id) && (
            <TaskDiscussionSection
              taskId={task._id || task.id}
              taskTitle={task.title || 'Task'}
              onCommentCountChange={handleCommentActivityRefresh}
            />
          )}

          {/* Audit Activity Trail */}
          <div className="bg-white border rounded-4 p-4 shadow-sm">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-2">
                <History size={18} className="text-primary" />
                <h6 className="fw-bold text-dark m-0">Task Audit Activity Trail</h6>
              </div>
              <span className="badge bg-light text-muted border small">
                {activity.length} recorded events
              </span>
            </div>

            {activity.length === 0 ? (
              <div className="p-4 text-center text-muted small border border-dashed rounded-3">
                No activity history recorded yet for this task.
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {activity.map((act) => (
                  <div key={act.id} className="d-flex align-items-start gap-3 border-bottom pb-3">
                    <div
                      className="rounded-circle p-2 d-flex align-items-center justify-content-center text-white mt-0.5 flex-shrink-0"
                      style={{
                        backgroundColor: '#4F46E5',
                        width: 28,
                        height: 28,
                        fontSize: '0.7rem'
                      }}
                    >
                      {act.user?.name ? act.user.name[0].toUpperCase() : 'U'}
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="fw-semibold text-dark small">
                          {act.user?.name || 'System User'}
                        </span>
                        <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                          {new Date(act.createdAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-secondary small m-0 mt-0.5">
                        <strong className="text-primary font-monospace">{act.action}</strong>
                        {act.changes?.fromStatus && act.changes?.toStatus && (
                          <span>
                            {' '}
                            moved task from{' '}
                            <code className="text-muted">{act.changes.fromStatus}</code> to{' '}
                            <code className="text-success">{act.changes.toStatus}</code>
                          </span>
                        )}
                        {act.changes?.title && <span> updated task title</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Metadata Sidebar (30%) */}
        <div className="col-12 col-lg-4 d-flex flex-column gap-3">
          {/* Metadata Card */}
          <div className="bg-white border rounded-4 p-4 shadow-sm d-flex flex-column gap-3.5">
            <h6 className="fw-bold text-dark m-0 border-bottom pb-2 small text-uppercase tracking-wider">
              Task Metadata
            </h6>

            {/* Project */}
            <div>
              <span className="text-muted small d-block mb-1">Project</span>
              <div className="d-flex align-items-center gap-2">
                <span
                  className="rounded-circle d-inline-block"
                  style={{
                    width: 10,
                    height: 10,
                    backgroundColor: task?.project?.color || '#4F46E5'
                  }}
                ></span>
                <span className="fw-bold text-dark small">{task?.project?.name}</span>
                <span className="badge bg-light text-secondary border font-monospace small">
                  {task?.project?.key}
                </span>
              </div>
            </div>

            {/* Workspace */}
            {task?.workspace && (
              <div>
                <span className="text-muted small d-block mb-1">Workspace</span>
                <span className="fw-semibold text-dark small">{task.workspace.name}</span>
              </div>
            )}

            {/* Dates */}
            <div className="d-flex flex-column gap-2">
              <div>
                <span className="text-muted small d-block mb-0.5">Start Date</span>
                <span className="small text-dark fw-medium">
                  {start ? start.formatted : 'Not scheduled'}
                </span>
              </div>

              <div>
                <span className="text-muted small d-block mb-0.5">Due Date</span>
                {due ? (
                  <span
                    className={`d-flex align-items-center small fw-semibold ${
                      due.isPast ? 'text-danger' : 'text-dark'
                    }`}
                  >
                    <Clock size={13} className="me-1.5" />
                    {due.formatted} {due.isPast && '(Overdue)'}
                  </span>
                ) : (
                  <span className="small text-muted">No target due date</span>
                )}
              </div>
            </div>

            {/* Effort */}
            <div>
              <span className="text-muted small d-block mb-0.5">Estimated Duration</span>
              <span className="fw-semibold text-dark small">
                {task?.estimatedHours || 0} hours
              </span>
            </div>

            {/* Assignees */}
            <div className="border-top pt-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted small fw-medium">Assignees</span>
                <button
                  className="btn btn-xs btn-link text-primary p-0 text-decoration-none fw-semibold"
                  onClick={() => setIsAssigning(!isAssigning)}
                >
                  {isAssigning ? 'Done' : '+ Manage'}
                </button>
              </div>

              {/* Assignees List */}
              {task?.assignees && task.assignees.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {task.assignees.map((a: any) => (
                    <div key={a.id} className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-xs"
                        style={{
                          width: 24,
                          height: 24,
                          backgroundColor: '#4F46E5',
                          fontSize: '0.65rem'
                        }}
                      >
                        {a.name ? a.name[0].toUpperCase() : 'U'}
                      </div>
                      <div className="d-flex flex-column">
                        <span className="small text-dark fw-semibold" style={{ fontSize: '0.8rem' }}>
                          {a.name}
                        </span>
                        <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                          {a.email}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-muted small">No teammates currently assigned.</span>
              )}

              {/* Assignee Picker Dropdown */}
              {isAssigning && (
                <div className="p-2.5 bg-light rounded-3 border mt-2">
                  <span className="small text-dark fw-semibold d-block mb-2">
                    Toggle Project Teammates:
                  </span>
                  <div className="d-flex flex-column gap-1.5" style={{ maxHeight: 140, overflowY: 'auto' }}>
                    {projectMembers.map((m: any) => {
                      const mId = m.id || m.userId;
                      const isAssigned = (task?.assignees || []).some(
                        (a: any) => (a.id || a._id) === mId
                      );
                      return (
                        <button
                          key={mId}
                          type="button"
                          className={`btn btn-xs text-start px-2 py-1 rounded-2 d-flex align-items-center justify-content-between border ${
                            isAssigned ? 'btn-primary text-white' : 'btn-white text-dark'
                          }`}
                          onClick={() => handleToggleMember(mId)}
                        >
                          <span className="small">{m.name}</span>
                          <span className="small opacity-75">{isAssigned ? '✓ Assigned' : '+ Add'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Reporter & Timestamps */}
            <div className="border-top pt-3 d-flex flex-column gap-2 text-muted" style={{ fontSize: '0.78rem' }}>
              <div>
                <span className="d-block text-secondary small">Created By</span>
                <span className="text-dark fw-medium">{task?.reporter?.name || 'System User'}</span>
              </div>
              <div>
                <span className="d-block text-secondary small">Created At</span>
                <span>{new Date(task?.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="d-block text-secondary small">Last Modified</span>
                <span>{new Date(task?.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isEditOpen && (
        <EditTaskModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          task={task}
          onTaskUpdated={() => fetchTaskDetails()}
        />
      )}

      {isDeleteOpen && (
        <DeleteTaskModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          task={task}
          mode={deleteMode}
          onDeleted={() => setActiveView('tasks')}
        />
      )}

      {/* Phase 15: Add Prerequisite Dependency Modal */}
      {isAddDepModalOpen && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)' }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom px-4 pt-4 pb-3">
                <div className="d-flex align-items-center gap-2">
                  <Link2 size={20} className="text-primary" />
                  <h5 className="modal-title fw-bold text-dark m-0">Add Prerequisite Dependency</h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsAddDepModalOpen(false)}
                ></button>
              </div>

              <div className="modal-body px-4 py-3">
                <p className="text-secondary small mb-3">
                  Select a prerequisite task that must be fully completed (<strong className="text-success">DONE</strong>)
                  before <strong>{task?.taskKey}</strong> can proceed.
                </p>

                {depError && (
                  <div className="alert alert-danger py-2 px-3 rounded-3 small mb-3 d-flex align-items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{depError}</span>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">
                    Prerequisite Task
                  </label>
                  {availablePrereqTasks.length === 0 ? (
                    <div className="p-3 bg-light rounded-3 text-muted small border border-dashed">
                      No other active sprint tasks available in this project to set as a prerequisite.
                    </div>
                  ) : (
                    <select
                      className="form-select border-slate-200 rounded-3 text-dark fw-medium"
                      value={selectedPrereqTaskId}
                      onChange={(e) => setSelectedPrereqTaskId(e.target.value)}
                    >
                      <option value="">— Select a prerequisite task —</option>
                      {availablePrereqTasks.map((t: any) => (
                        <option key={t.id} value={t.id}>
                          {t.taskKey}: {t.title} ({t.status})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="modal-footer border-top px-4 py-3">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary rounded-3 px-3 fw-medium"
                  onClick={() => setIsAddDepModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-primary rounded-3 px-3 fw-semibold shadow-sm"
                  style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
                  disabled={!selectedPrereqTaskId || isSubmittingDep}
                  onClick={handleAddDependency}
                >
                  {isSubmittingDep ? 'Adding...' : 'Add Dependency'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
