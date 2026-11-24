import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useWorkzenStore } from '../store/useWorkzenStore.js';
import { TASK_STATUS, TASK_PRIORITY } from '../../shared/constants/status.js';
import { PriorityChip } from '../components/common/PriorityChip.js';
import { AvatarGroup } from '../components/common/AvatarGroup.js';
import { apiClient } from '../api/client.js';
import { CreateKanbanTaskModal } from '../components/modals/CreateKanbanTaskModal.js';
import { io, Socket } from 'socket.io-client';
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  User as UserIcon,
  Filter,
  RefreshCw,
  FolderKanban,
  X,
  ArrowRight,
  TrendingUp,
  Lock,
  CheckSquare
} from 'lucide-react';

interface KanbanTaskItem {
  id: string;
  taskNumber: number;
  taskKey: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignees: Array<{
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  }>;
  dueDate?: string;
  tags: string[];
  order: number;
  subtaskProgress?: {
    total: number;
    completed: number;
    remaining: number;
    percentage: number;
  };
  isBlocked?: boolean;
  blockedCount?: number;
}

interface ColumnData {
  id: string;
  label: string;
  color: string;
  tasks: KanbanTaskItem[];
  count: number;
}

interface BoardData {
  project: {
    id: string;
    name: string;
    key: string;
    color: string;
    visibility: string;
  };
  columns: ColumnData[];
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  reviewTasks: number;
  progressPercentage: number;
}

export const KanbanBoard: React.FC = () => {
  const {
    currentProject,
    setCurrentProject,
    projects,
    setProjects,
    setSelectedTaskId,
    setActiveView
  } = useWorkzenStore();

  // Board state
  const [boardData, setBoardData] = useState<BoardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('');
  const [dueDateFilter, setDueDateFilter] = useState<string>('');
  const [projectMembers, setProjectMembers] = useState<Array<{ id: string; name: string }>>([]);

  // Drag and Drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [isMovingTask, setIsMovingTask] = useState<boolean>(false);

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [modalInitialStatus, setModalInitialStatus] = useState<string>(TASK_STATUS.TODO);

  // Socket reference
  const socketRef = useRef<Socket | null>(null);

  // Active Project ID resolution
  const activeProjectId = (currentProject as any)?._id || (currentProject as any)?.id || (projects.length > 0 ? ((projects[0] as any)._id || (projects[0] as any).id) : null);

  // If store doesn't have currentProject set yet, but projects exist, set first project
  useEffect(() => {
    if (projects.length === 0) {
      apiClient
        .listProjects()
        .then((res) => {
          if (res.success && res.data?.projects) {
            setProjects(res.data.projects);
            if (!currentProject && res.data.projects.length > 0) {
              setCurrentProject(res.data.projects[0]);
            }
          }
        })
        .catch(() => {});
    } else if (!currentProject && projects.length > 0) {
      setCurrentProject(projects[0]);
    }
  }, [currentProject, projects, setCurrentProject, setProjects]);

  // Load project members for the assignee filter
  const loadProjectMembers = useCallback(async (projId: string) => {
    try {
      const res = await apiClient.listProjectMembers(projId);
      if (res.success && res.data?.members) {
        setProjectMembers(
          res.data.members.map((m: any) => ({
            id: m.id || m.userId,
            name: m.name || m.email || 'Team Member'
          }))
        );
      }
    } catch {
      // Ignored
    }
  }, []);

  // Fetch full board data
  const fetchBoard = useCallback(async (showLoadingSpinner = true) => {
    if (!activeProjectId) {
      setIsLoading(false);
      return;
    }

    if (showLoadingSpinner) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const query: any = {};
      if (searchTerm.trim()) query.search = searchTerm.trim();
      if (priorityFilter) query.priority = priorityFilter;
      if (assigneeFilter) query.assigneeId = assigneeFilter;
      if (dueDateFilter) query.dueDate = dueDateFilter;

      const res = await apiClient.getKanbanBoard(activeProjectId, query);
      if (res.success && res.data) {
        setBoardData(res.data);
      } else {
        setError(res.error?.message || 'Failed to load Kanban board data.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while loading the board.');
    } finally {
      setIsLoading(false);
    }
  }, [activeProjectId, searchTerm, priorityFilter, assigneeFilter, dueDateFilter]);

  // Initial load and filter change trigger
  useEffect(() => {
    if (activeProjectId) {
      loadProjectMembers(activeProjectId);
      fetchBoard(true);
    } else {
      setIsLoading(false);
    }
  }, [activeProjectId, loadProjectMembers, fetchBoard]);

  // Real-time Socket.IO synchronization
  useEffect(() => {
    if (!activeProjectId) return;

    try {
      const socket = io({
        reconnectionAttempts: 5,
        timeout: 10000
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('project:join', activeProjectId);
      });

      // Listen to kanban events broadcast by server
      socket.on('kanban:task_created', () => {
        fetchBoard(false);
      });

      socket.on('kanban:task_moved', () => {
        fetchBoard(false);
      });

      socket.on('kanban:column_reordered', () => {
        fetchBoard(false);
      });

      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    } catch {
      // Socket connection fallback
    }
  }, [activeProjectId, fetchBoard]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setPriorityFilter('');
    setAssigneeFilter('');
    setDueDateFilter('');
  };

  const hasActiveFilters = Boolean(searchTerm || priorityFilter || assigneeFilter || dueDateFilter);

  // Card click handler
  const handleCardClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setActiveView('task_details');
  };

  // Open modal with specific status
  const handleOpenCreateModal = (initialStatus: string = TASK_STATUS.TODO) => {
    setModalInitialStatus(initialStatus);
    setIsCreateModalOpen(true);
  };

  // Drag and Drop Event Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, columnId: string) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverColumn === columnId) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    setDragOverColumn(null);

    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDraggedTaskId(null);

    if (!taskId || !activeProjectId || !boardData) return;

    // Check if task is already in that column
    const currentColumn = boardData.columns.find((col) =>
      col.tasks.some((t) => t.id === taskId)
    );
    if (currentColumn && currentColumn.id === targetStatus) {
      return; // No status change needed
    }

    // Optimistic UI update
    const previousBoard = boardData;
    let movedTask: KanbanTaskItem | null = null;

    const newColumns = boardData.columns.map((col) => {
      const match = col.tasks.find((t) => t.id === taskId);
      if (match) {
        movedTask = { ...match, status: targetStatus };
        return {
          ...col,
          tasks: col.tasks.filter((t) => t.id !== taskId),
          count: col.tasks.length - 1
        };
      }
      return col;
    });

    if (movedTask) {
      const targetColIndex = newColumns.findIndex((col) => col.id === targetStatus);
      if (targetColIndex !== -1) {
        newColumns[targetColIndex] = {
          ...newColumns[targetColIndex],
          tasks: [...newColumns[targetColIndex].tasks, movedTask],
          count: newColumns[targetColIndex].count + 1
        };
      }

      setBoardData({
        ...boardData,
        columns: newColumns
      });
    }

    // Persist to backend
    setIsMovingTask(true);
    try {
      const res = await apiClient.moveKanbanTask(activeProjectId, taskId, targetStatus);
      if (!res.success) {
        // Rollback
        setBoardData(previousBoard);
        setError(res.error?.message || 'Failed to move task.');
      }
    } catch (err: any) {
      setBoardData(previousBoard);
      setError(err.message || 'Error occurred while moving task.');
    } finally {
      setIsMovingTask(false);
    }
  };

  // Keyboard Quick Move Handler
  const handleQuickMove = async (taskId: string, targetStatus: string) => {
    if (!activeProjectId || !boardData) return;

    const currentColumn = boardData.columns.find((col) =>
      col.tasks.some((t) => t.id === taskId)
    );
    if (currentColumn && currentColumn.id === targetStatus) return;

    const previousBoard = boardData;
    let movedTask: KanbanTaskItem | null = null;

    const newColumns = boardData.columns.map((col) => {
      const match = col.tasks.find((t) => t.id === taskId);
      if (match) {
        movedTask = { ...match, status: targetStatus };
        return {
          ...col,
          tasks: col.tasks.filter((t) => t.id !== taskId),
          count: col.tasks.length - 1
        };
      }
      return col;
    });

    if (movedTask) {
      const targetColIndex = newColumns.findIndex((col) => col.id === targetStatus);
      if (targetColIndex !== -1) {
        newColumns[targetColIndex] = {
          ...newColumns[targetColIndex],
          tasks: [...newColumns[targetColIndex].tasks, movedTask],
          count: newColumns[targetColIndex].count + 1
        };
      }
      setBoardData({
        ...boardData,
        columns: newColumns
      });
    }

    try {
      const res = await apiClient.moveKanbanTask(activeProjectId, taskId, targetStatus);
      if (!res.success) {
        setBoardData(previousBoard);
        setError(res.error?.message || 'Failed to shift task status.');
      }
    } catch (err: any) {
      setBoardData(previousBoard);
      setError(err.message || 'Failed to shift task status.');
    }
  };

  // Format Due Date helper
  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const isPast = date < now && date.toDateString() !== now.toDateString();
    const formatted = date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
    return { formatted, isPast };
  };

  // Project Switcher
  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = projects.find((p: any) => (p._id || p.id) === e.target.value);
    if (selected) {
      setCurrentProject(selected);
    }
  };

  // If no projects exist in workspace
  if (!activeProjectId && !isLoading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center p-5 text-center bg-white rounded-4 border shadow-sm my-4">
        <div
          className="rounded-circle p-3 d-flex align-items-center justify-content-center mb-3"
          style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', width: 64, height: 64 }}
        >
          <FolderKanban size={32} />
        </div>
        <h4 className="fw-bold text-dark mb-2">No Active Project Selected</h4>
        <p className="text-secondary small mb-4" style={{ maxWidth: 440 }}>
          Create a project or select an existing project in your workspace to manage your sprint tasks on the Kanban board.
        </p>
        <button
          className="btn btn-primary px-4 py-2 rounded-3 fw-semibold shadow-sm"
          style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
          onClick={() => setActiveView('project_overview')}
        >
          Go to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column h-100">
      {/* 1. Header Toolbar */}
      <div className="bg-white border rounded-4 p-3.5 mb-3 shadow-sm">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          {/* Left: Project title & Switcher */}
          <div className="d-flex align-items-center gap-2.5">
            {boardData?.project.key && (
              <span
                className="badge text-white px-2.5 py-1.5 fw-bold rounded-2 font-monospace"
                style={{ backgroundColor: boardData?.project.color || '#4F46E5', fontSize: '0.8rem' }}
              >
                {boardData.project.key}
              </span>
            )}
            <div>
              <h4 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                {boardData?.project.name || currentProject?.name || 'Sprint Kanban Board'}
              </h4>
              <p className="text-muted small m-0">Interactive Sprint Workflow Board</p>
            </div>

            {/* Switch Project Select */}
            {projects.length > 1 && (
              <div className="ms-2">
                <select
                  className="form-select form-select-sm rounded-3 border-slate-200 text-secondary fw-medium"
                  style={{ fontSize: '0.8rem' }}
                  value={activeProjectId}
                  onChange={handleProjectChange}
                >
                  {projects.map((p: any) => (
                    <option key={p._id || p.id} value={p._id || p.id}>
                      {p.name} ({p.key})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-outline-secondary btn-sm rounded-3 fw-medium d-flex align-items-center gap-1.5"
              onClick={() => fetchBoard(true)}
              title="Refresh board data"
            >
              <RefreshCw size={14} className={isLoading ? 'spin-animation' : ''} />
              <span className="d-none d-sm-inline">Refresh</span>
            </button>

            <button
              className="btn btn-primary btn-sm fw-semibold d-flex align-items-center rounded-3 px-3 py-1.5 shadow-sm"
              style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
              onClick={() => handleOpenCreateModal(TASK_STATUS.TODO)}
            >
              <Plus size={16} className="me-1" /> New Task
            </button>
          </div>
        </div>

        {/* 2. Filter & Search Controls */}
        <div className="row g-2 mt-2 pt-2 border-top align-items-center">
          {/* Live Search */}
          <div className="col-12 col-md-4 col-lg-3">
            <div className="position-relative">
              <Search
                size={14}
                className="position-absolute top-50 start-0 translate-middle-y ms-2.5 text-muted"
              />
              <input
                type="text"
                className="form-control form-control-sm ps-4 pe-2 rounded-3 border-slate-200"
                placeholder="Search tasks or #tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="btn btn-link btn-sm position-absolute top-50 end-0 translate-middle-y me-1 p-0 text-muted"
                  onClick={() => setSearchTerm('')}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Priority Filter */}
          <div className="col-6 col-md-3 col-lg-2">
            <select
              className="form-select form-select-sm rounded-3 border-slate-200"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value={TASK_PRIORITY.URGENT}>Urgent</option>
              <option value={TASK_PRIORITY.HIGH}>High</option>
              <option value={TASK_PRIORITY.MEDIUM}>Medium</option>
              <option value={TASK_PRIORITY.LOW}>Low</option>
            </select>
          </div>

          {/* Assignee Filter */}
          <div className="col-6 col-md-3 col-lg-2">
            <select
              className="form-select form-select-sm rounded-3 border-slate-200"
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
            >
              <option value="">All Assignees</option>
              {projectMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date Filter */}
          <div className="col-6 col-md-2 col-lg-2">
            <select
              className="form-select form-select-sm rounded-3 border-slate-200"
              value={dueDateFilter}
              onChange={(e) => setDueDateFilter(e.target.value)}
            >
              <option value="">All Dates</option>
              <option value="overdue">Overdue</option>
              <option value="today">Due Today</option>
              <option value="week">Due This Week</option>
            </select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <div className="col-auto">
              <button
                type="button"
                className="btn btn-link btn-sm text-danger text-decoration-none d-flex align-items-center gap-1 p-0 fw-semibold"
                onClick={handleClearFilters}
              >
                <X size={14} /> Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Telemetry Metric Strip */}
      {boardData && (
        <div className="bg-white border rounded-4 p-2.5 px-3.5 mb-3 shadow-sm d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-4 flex-wrap">
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small fw-medium">Total:</span>
              <span className="fw-bold text-dark">{boardData.totalTasks}</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="rounded-circle bg-primary" style={{ width: 8, height: 8 }}></span>
              <span className="text-muted small fw-medium">To Do:</span>
              <span className="fw-bold text-dark">{boardData.todoTasks}</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="rounded-circle bg-indigo" style={{ width: 8, height: 8, backgroundColor: '#6366F1' }}></span>
              <span className="text-muted small fw-medium">In Progress:</span>
              <span className="fw-bold text-dark">{boardData.inProgressTasks}</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="rounded-circle bg-warning" style={{ width: 8, height: 8 }}></span>
              <span className="text-muted small fw-medium">In Review:</span>
              <span className="fw-bold text-dark">{boardData.reviewTasks}</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="rounded-circle bg-success" style={{ width: 8, height: 8 }}></span>
              <span className="text-muted small fw-medium">Done:</span>
              <span className="fw-bold text-success">{boardData.completedTasks}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="d-flex align-items-center gap-2.5" style={{ minWidth: 200 }}>
            <span className="text-muted small fw-medium text-nowrap">Sprint Progress:</span>
            <div className="progress flex-grow-1" style={{ height: 7, borderRadius: 4 }}>
              <div
                className="progress-bar bg-success"
                role="progressbar"
                style={{ width: `${boardData.progressPercentage}%` }}
                aria-valuenow={boardData.progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
            <span className="fw-bold text-dark small">{boardData.progressPercentage}%</span>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between py-2 px-3 rounded-3 mb-3 small">
          <div className="d-flex align-items-center gap-2">
            <AlertCircle size={16} className="text-danger flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button className="btn btn-sm btn-link text-danger p-0 fw-bold" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}

      {/* 4. Kanban Horizontal Columns Grid */}
      <div
        className="d-flex gap-3 overflow-auto pb-4 flex-grow-1"
        style={{ minHeight: '620px', alignItems: 'stretch' }}
      >
        {isLoading && !boardData ? (
          <div className="w-100 d-flex flex-column align-items-center justify-content-center p-5 text-center text-muted">
            <RefreshCw size={28} className="spin-animation text-primary mb-2" />
            <p className="small m-0">Loading Kanban board...</p>
          </div>
        ) : boardData?.columns && boardData.columns.length > 0 ? (
          boardData.columns.map((column) => {
            const isTarget = dragOverColumn === column.id;

            return (
              <div
                key={column.id}
                className={`wz-kanban-col d-flex flex-column flex-shrink-0 rounded-4 transition-all ${
                  isTarget ? 'bg-primary-subtle border-primary' : 'bg-light border'
                }`}
                style={{
                  width: '320px',
                  borderWidth: isTarget ? 2 : 1,
                  borderStyle: isTarget ? 'dashed' : 'solid',
                  padding: '12px',
                  transition: 'background-color 0.15s ease, border-color 0.15s ease'
                }}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={(e) => handleDragLeave(e, column.id)}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column Header */}
                <div className="d-flex justify-content-between align-items-center mb-2.5 px-1">
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className="rounded-circle d-inline-block shadow-sm"
                      style={{ width: 10, height: 10, backgroundColor: column.color }}
                    ></span>
                    <span className="fw-bold text-dark small">{column.label}</span>
                    <span className="badge rounded-pill bg-white text-secondary border small px-2 py-0.5">
                      {column.tasks.length}
                    </span>
                  </div>

                  <button
                    className="btn btn-sm btn-light text-muted p-1 rounded-2 border-0 hover-text-dark"
                    onClick={() => handleOpenCreateModal(column.id)}
                    title={`Add task to ${column.label}`}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Column Dropzone / Cards Container */}
                <div
                  className="d-flex flex-column gap-2.5 overflow-auto flex-grow-1 pr-1"
                  style={{ minHeight: '380px' }}
                >
                  {column.tasks.length === 0 ? (
                    <div
                      className="text-center py-5 px-3 text-muted small border border-dashed rounded-3 bg-white d-flex flex-column align-items-center justify-content-center flex-grow-1"
                      style={{ minHeight: '220px' }}
                    >
                      <p className="m-0 fw-medium">No tasks in {column.label}</p>
                      <p className="text-secondary small mt-1 mb-3" style={{ fontSize: '0.75rem' }}>
                        Drag tasks here or create a new one
                      </p>
                      <button
                        className="btn btn-xs btn-outline-primary rounded-2 px-2.5 py-1"
                        style={{ fontSize: '0.72rem' }}
                        onClick={() => handleOpenCreateModal(column.id)}
                      >
                        <Plus size={12} className="me-1" /> Add Task
                      </button>
                    </div>
                  ) : (
                    column.tasks.map((task) => {
                      const due = formatDueDate(task.dueDate);

                      return (
                        <div
                          key={task.id}
                          className="wz-card p-3 bg-white border rounded-3 shadow-xs hover-shadow transition-all position-relative"
                          style={{
                            cursor: 'grab',
                            borderLeft: `4px solid ${column.color}`
                          }}
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onClick={() => handleCardClick(task.id)}
                        >
                          {/* Card Header: Task Key + Priority */}
                          <div className="d-flex justify-content-between align-items-center mb-1.5">
                            <span
                              className="text-muted fw-bold font-monospace"
                              style={{ fontSize: '0.72rem' }}
                            >
                              {task.taskKey}
                            </span>
                            <PriorityChip priority={task.priority as any} />
                          </div>

                          {/* Task Title */}
                          <h6
                            className="fw-bold text-dark mb-1 text-truncate-2"
                            style={{ fontSize: '0.86rem', lineHeight: 1.35 }}
                          >
                            {task.title}
                          </h6>

                          {/* Description snippet */}
                          {task.description && (
                            <p
                              className="text-secondary small mb-2 text-truncate"
                              style={{ fontSize: '0.75rem' }}
                            >
                              {task.description}
                            </p>
                          )}

                          {/* Tags */}
                          {task.tags && task.tags.length > 0 && (
                            <div className="d-flex flex-wrap gap-1 mb-2">
                              {task.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="badge bg-light text-secondary border px-1.5 py-0.5"
                                  style={{ fontSize: '0.66rem' }}
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Phase 15: Subtasks & Blocked Badges */}
                          {((task.subtaskProgress && task.subtaskProgress.total > 0) || task.isBlocked) && (
                            <div className="d-flex flex-wrap align-items-center gap-1.5 mb-2">
                              {task.subtaskProgress && task.subtaskProgress.total > 0 && (
                                <span
                                  className={`badge px-2 py-0.5 rounded-2 d-inline-flex align-items-center gap-1 border ${
                                    task.subtaskProgress.percentage === 100
                                      ? 'bg-success-subtle text-success border-success-subtle'
                                      : 'bg-light text-primary border-slate-200'
                                  }`}
                                  style={{ fontSize: '0.68rem' }}
                                  title={`${task.subtaskProgress.completed} of ${task.subtaskProgress.total} subtasks completed (${task.subtaskProgress.percentage}%)`}
                                >
                                  <CheckSquare size={10} />
                                  <span>{task.subtaskProgress.completed}/{task.subtaskProgress.total}</span>
                                </span>
                              )}
                              {task.isBlocked && (
                                <span
                                  className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-0.5 rounded-2 d-inline-flex align-items-center gap-1 fw-semibold"
                                  style={{ fontSize: '0.68rem' }}
                                  title="Task is blocked by unfinished prerequisite tasks"
                                >
                                  <Lock size={10} />
                                  <span>Blocked</span>
                                </span>
                              )}
                            </div>
                          )}

                          {/* Card Footer: Due Date, Assignees, Keyboard Shift Dropdown */}
                          <div className="d-flex justify-content-between align-items-center pt-2 border-top mt-1">
                            {/* Left: Due Date */}
                            <div>
                              {due ? (
                                <span
                                  className={`d-flex align-items-center small ${
                                    due.isPast ? 'text-danger fw-semibold' : 'text-muted'
                                  }`}
                                  style={{ fontSize: '0.72rem' }}
                                  title={due.isPast ? 'Overdue' : 'Due date'}
                                >
                                  <Clock size={12} className="me-1" />
                                  {due.formatted}
                                </span>
                              ) : (
                                <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                                  —
                                </span>
                              )}
                            </div>

                            {/* Right: Quick Column Move Dropdown & Assignee Avatar */}
                            <div className="d-flex align-items-center gap-2">
                              {/* Accessible Keyboard Column Switcher */}
                              <select
                                className="form-select form-select-sm p-0 px-1 border-0 bg-light text-muted fw-semibold"
                                style={{ fontSize: '0.68rem', width: 'auto', height: 22 }}
                                value={task.status}
                                title="Move task to column"
                                aria-label={`Move task ${task.taskKey} to column`}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleQuickMove(task.id, e.target.value);
                                }}
                              >
                                <option value={TASK_STATUS.TODO}>To Do</option>
                                <option value={TASK_STATUS.IN_PROGRESS}>In Progress</option>
                                <option value={TASK_STATUS.REVIEW}>Review</option>
                                <option value={TASK_STATUS.DONE}>Done</option>
                                <option value={TASK_STATUS.BACKLOG}>Backlog</option>
                              </select>

                              {/* Assignees */}
                              <AvatarGroup
                                users={task.assignees.map((a) => ({
                                  _id: a.id,
                                  firstName: a.name,
                                  lastName: '',
                                  email: a.email,
                                  avatarUrl: a.avatarUrl
                                } as any))}
                                max={2}
                                size={22}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="w-100 d-flex flex-column align-items-center justify-content-center p-5 text-center text-muted">
            <p className="small">No columns or tasks found.</p>
          </div>
        )}
      </div>

      {/* 5. Create Task Modal */}
      {activeProjectId && (
        <CreateKanbanTaskModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          projectId={activeProjectId}
          projectName={boardData?.project.name || currentProject?.name || 'Project'}
          initialStatus={modalInitialStatus}
          onTaskCreated={() => fetchBoard(false)}
        />
      )}
    </div>
  );
};
