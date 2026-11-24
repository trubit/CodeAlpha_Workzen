import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useWorkzenStore } from '../store/useWorkzenStore.js';
import { apiClient } from '../api/client.js';
import { TASK_STATUS, TASK_PRIORITY } from '../../shared/constants/status.js';
import { PriorityChip } from '../components/common/PriorityChip.js';
import { AvatarGroup } from '../components/common/AvatarGroup.js';
import { CreateTaskModal } from '../components/modals/CreateTaskModal.js';
import { EditTaskModal } from '../components/modals/EditTaskModal.js';
import { DeleteTaskModal } from '../components/modals/DeleteTaskModal.js';
import { io, Socket } from 'socket.io-client';
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  X,
  Clock,
  Calendar,
  AlertCircle,
  FolderKanban,
  CheckSquare,
  Square,
  ChevronDown,
  Archive,
  RotateCcw,
  Trash2,
  Edit,
  ExternalLink,
  SlidersHorizontal,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  Lock
} from 'lucide-react';

export const TaskListPage: React.FC = () => {
  const {
    currentProject,
    setCurrentProject,
    projects,
    setProjects,
    setSelectedTaskId,
    setActiveView
  } = useWorkzenStore();

  // Tasks state
  const [tasks, setTasks] = useState<any[]>([]);
  const [telemetry, setTelemetry] = useState<any>({
    total: 0,
    todoCount: 0,
    inProgressCount: 0,
    reviewCount: 0,
    doneCount: 0,
    urgentCount: 0
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 1,
    hasMore: false
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    (currentProject as any)?._id || (currentProject as any)?.id || ''
  );
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('');
  const [dueDateFilter, setDueDateFilter] = useState<string>('');
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [projectMembers, setProjectMembers] = useState<Array<{ id: string; name: string }>>([]);

  // Sorting state
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Bulk selection state
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState<boolean>(false);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [deletingTask, setDeletingTask] = useState<any | null>(null);
  const [deleteMode, setDeleteMode] = useState<'archive' | 'permanent'>('archive');

  // Socket
  const socketRef = useRef<Socket | null>(null);

  // Load project members for assignee filter
  useEffect(() => {
    if (projects.length === 0) {
      apiClient
        .listProjects()
        .then((res) => {
          if (res.success && res.data?.projects) {
            setProjects(res.data.projects);
          }
        })
        .catch(() => {});
    }
  }, [projects.length, setProjects]);

  useEffect(() => {
    if (selectedProjectId) {
      apiClient
        .listProjectMembers(selectedProjectId)
        .then((res) => {
          if (res.success && res.data?.members) {
            setProjectMembers(
              res.data.members.map((m: any) => ({
                id: m.id || m.userId,
                name: m.name || m.email || 'Team Member'
              }))
            );
          } else {
            setProjectMembers([]);
          }
        })
        .catch(() => setProjectMembers([]));
    } else {
      setProjectMembers([]);
    }
  }, [selectedProjectId]);

  // Fetch tasks from API
  const fetchTasks = useCallback(
    async (pageToLoad = 1, showSpinner = true) => {
      if (showSpinner) setIsLoading(true);
      setError(null);

      try {
        const query: any = {
          page: pageToLoad,
          limit: pagination.limit,
          sortBy,
          sortOrder,
          isArchived: showArchived
        };

        if (selectedProjectId) query.projectId = selectedProjectId;
        if (searchTerm.trim()) query.search = searchTerm.trim();
        if (statusFilter) query.status = statusFilter;
        if (priorityFilter) query.priority = priorityFilter;
        if (assigneeFilter) query.assigneeId = assigneeFilter;
        if (dueDateFilter) query.dueDate = dueDateFilter;

        const res = await apiClient.listTasks(query);
        if (res.success && res.data) {
          setTasks(res.data.tasks || []);
          if (res.data.pagination) setPagination(res.data.pagination);
          if (res.data.telemetry) setTelemetry(res.data.telemetry);
        } else {
          setError(res.error?.message || 'Failed to load tasks.');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while loading tasks.');
      } finally {
        setIsLoading(false);
      }
    },
    [
      pagination.limit,
      sortBy,
      sortOrder,
      showArchived,
      selectedProjectId,
      searchTerm,
      statusFilter,
      priorityFilter,
      assigneeFilter,
      dueDateFilter
    ]
  );

  // Initial and reactive fetch
  useEffect(() => {
    fetchTasks(1, true);
  }, [fetchTasks]);

  // Real-time Socket.IO integration
  useEffect(() => {
    try {
      const socket = io({
        reconnectionAttempts: 5,
        timeout: 10000
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        if (selectedProjectId) {
          socket.emit('project:join', selectedProjectId);
        }
      });

      const handleRefresh = () => fetchTasks(pagination.page, false);

      socket.on('task:created', handleRefresh);
      socket.on('task:updated', handleRefresh);
      socket.on('task:status_updated', handleRefresh);
      socket.on('task:archived', handleRefresh);
      socket.on('task:restored', handleRefresh);
      socket.on('task:deleted', handleRefresh);

      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    } catch {
      // Ignored
    }
  }, [selectedProjectId, pagination.page, fetchTasks]);

  // Handle header sort click
  const handleSortClick = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Select all toggle
  const handleSelectAll = () => {
    if (selectedTaskIds.length === tasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(tasks.map((t) => t.id));
    }
  };

  const handleToggleSelectTask = (taskId: string) => {
    if (selectedTaskIds.includes(taskId)) {
      setSelectedTaskIds(selectedTaskIds.filter((id) => id !== taskId));
    } else {
      setSelectedTaskIds([...selectedTaskIds, taskId]);
    }
  };

  // Bulk actions
  const handleBulkStatusChange = async (targetStatus: string) => {
    if (selectedTaskIds.length === 0) return;
    setIsBulkUpdating(true);
    try {
      await Promise.all(
        selectedTaskIds.map((id) => apiClient.updateTaskStatus(id, targetStatus))
      );
      setSelectedTaskIds([]);
      fetchTasks(pagination.page, false);
    } catch (err: any) {
      setError(err.message || 'Failed to update selected tasks.');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleBulkArchive = async () => {
    if (selectedTaskIds.length === 0) return;
    setIsBulkUpdating(true);
    try {
      await Promise.all(selectedTaskIds.map((id) => apiClient.archiveTask(id)));
      setSelectedTaskIds([]);
      fetchTasks(pagination.page, false);
    } catch (err: any) {
      setError(err.message || 'Failed to archive selected tasks.');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  // Inline status update
  const handleQuickStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const res = await apiClient.updateTaskStatus(taskId, newStatus);
      if (res.success) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
        );
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update status.');
    }
  };

  // Inline priority update
  const handleQuickPriorityChange = async (taskId: string, newPriority: string) => {
    try {
      const res = await apiClient.updateTaskPriority(taskId, newPriority);
      if (res.success) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, priority: newPriority } : t))
        );
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update priority.');
    }
  };

  // Navigate to task details
  const handleViewTaskDetails = (taskId: string) => {
    setSelectedTaskId(taskId);
    setActiveView('task_details');
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

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPriorityFilter('');
    setAssigneeFilter('');
    setDueDateFilter('');
    setShowArchived(false);
  };

  const hasActiveFilters = Boolean(
    searchTerm || statusFilter || priorityFilter || assigneeFilter || dueDateFilter || showArchived
  );

  return (
    <div className="d-flex flex-column h-100">
      {/* 1. Header Toolbar */}
      <div className="bg-white border rounded-4 p-3.5 mb-3 shadow-sm">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          {/* Left: Title & Project Switcher */}
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-3 p-2 d-flex align-items-center justify-content-center text-white"
              style={{ backgroundColor: '#4F46E5' }}
            >
              <CheckSquare size={20} />
            </div>
            <div>
              <h4 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                <span>Task Management</span>
                {showArchived && (
                  <span className="badge bg-warning-subtle text-warning border border-warning small fw-semibold">
                    Archived View
                  </span>
                )}
              </h4>
              <p className="text-muted small m-0">Centralized sprint task tracking and execution</p>
            </div>

            {/* Project Filter Select */}
            {projects.length > 0 && (
              <div className="ms-2">
                <select
                  className="form-select form-select-sm rounded-3 border-slate-200 text-secondary fw-medium"
                  style={{ fontSize: '0.8rem' }}
                  value={selectedProjectId}
                  onChange={(e) => {
                    setSelectedProjectId(e.target.value);
                    const found = projects.find((p: any) => (p._id || p.id) === e.target.value);
                    if (found) setCurrentProject(found);
                  }}
                >
                  <option value="">All Workspace Projects</option>
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
              className={`btn btn-sm rounded-3 fw-medium d-flex align-items-center gap-1.5 ${
                showArchived ? 'btn-warning text-dark' : 'btn-outline-secondary'
              }`}
              onClick={() => setShowArchived(!showArchived)}
              title="Toggle between active and archived tasks"
            >
              <Archive size={14} />
              <span className="d-none d-sm-inline">
                {showArchived ? 'Active Tasks' : 'Archived'}
              </span>
            </button>

            <button
              className="btn btn-outline-secondary btn-sm rounded-3 fw-medium d-flex align-items-center gap-1.5"
              onClick={() => fetchTasks(pagination.page, true)}
              title="Refresh task list"
            >
              <RefreshCw size={14} className={isLoading ? 'spin-animation' : ''} />
              <span className="d-none d-sm-inline">Refresh</span>
            </button>

            <button
              className="btn btn-primary btn-sm fw-semibold d-flex align-items-center rounded-3 px-3 py-1.5 shadow-sm"
              style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus size={16} className="me-1" /> New Task
            </button>
          </div>
        </div>

        {/* 2. Filter & Live Search Toolbar */}
        <div className="row g-2 mt-2 pt-2 border-top align-items-center">
          {/* Live Search */}
          <div className="col-12 col-md-3">
            <div className="position-relative">
              <Search
                size={14}
                className="position-absolute top-50 start-0 translate-middle-y ms-2.5 text-muted"
              />
              <input
                type="text"
                className="form-control form-control-sm ps-4 pe-2 rounded-3 border-slate-200"
                placeholder="Search tasks, descriptions, or #tags..."
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

          {/* Status Filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm rounded-3 border-slate-200"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value={TASK_STATUS.TODO}>To Do</option>
              <option value={TASK_STATUS.IN_PROGRESS}>In Progress</option>
              <option value={TASK_STATUS.REVIEW}>In Review</option>
              <option value={TASK_STATUS.DONE}>Done</option>
              <option value={TASK_STATUS.BACKLOG}>Backlog</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="col-6 col-md-2">
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
          <div className="col-6 col-md-2">
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
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm rounded-3 border-slate-200"
              value={dueDateFilter}
              onChange={(e) => setDueDateFilter(e.target.value)}
            >
              <option value="">All Due Dates</option>
              <option value="overdue">Overdue</option>
              <option value="today">Due Today</option>
              <option value="week">Due This Week</option>
            </select>
          </div>

          {/* Clear Filter */}
          {hasActiveFilters && (
            <div className="col-auto">
              <button
                type="button"
                className="btn btn-link btn-sm text-danger text-decoration-none d-flex align-items-center gap-1 p-0 fw-semibold"
                onClick={handleClearFilters}
              >
                <X size={14} /> Reset
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Telemetry Metric Strip */}
      <div className="bg-white border rounded-4 p-2.5 px-3.5 mb-3 shadow-sm d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div className="d-flex align-items-center gap-4 flex-wrap">
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small fw-medium">Total:</span>
            <span className="fw-bold text-dark">{telemetry.total}</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="rounded-circle bg-primary" style={{ width: 8, height: 8 }}></span>
            <span className="text-muted small fw-medium">To Do:</span>
            <span className="fw-bold text-dark">{telemetry.todoCount}</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span
              className="rounded-circle"
              style={{ width: 8, height: 8, backgroundColor: '#6366F1' }}
            ></span>
            <span className="text-muted small fw-medium">In Progress:</span>
            <span className="fw-bold text-dark">{telemetry.inProgressCount}</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="rounded-circle bg-warning" style={{ width: 8, height: 8 }}></span>
            <span className="text-muted small fw-medium">In Review:</span>
            <span className="fw-bold text-dark">{telemetry.reviewCount}</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="rounded-circle bg-success" style={{ width: 8, height: 8 }}></span>
            <span className="text-muted small fw-medium">Done:</span>
            <span className="fw-bold text-success">{telemetry.doneCount}</span>
          </div>
          {telemetry.urgentCount > 0 && (
            <div className="d-flex align-items-center gap-2">
              <span className="rounded-circle bg-danger" style={{ width: 8, height: 8 }}></span>
              <span className="text-muted small fw-medium">Urgent:</span>
              <span className="fw-bold text-danger">{telemetry.urgentCount}</span>
            </div>
          )}
        </div>

        {/* Kanban Board Link */}
        <button
          className="btn btn-sm btn-link text-primary text-decoration-none d-flex align-items-center gap-1.5 p-0 fw-semibold"
          onClick={() => setActiveView('kanban')}
        >
          <span>View on Kanban Board</span>
          <ExternalLink size={14} />
        </button>
      </div>

      {/* Bulk Action Bar (when selected) */}
      {selectedTaskIds.length > 0 && (
        <div className="alert alert-primary d-flex flex-wrap align-items-center justify-content-between p-2 px-3 rounded-3 mb-3 shadow-xs">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary rounded-pill px-2.5 py-1">
              {selectedTaskIds.length} Selected
            </span>
            <span className="small text-secondary">Apply batch operation to selected tasks:</span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <select
              className="form-select form-select-sm rounded-3 border-primary text-primary fw-medium"
              style={{ width: 'auto', fontSize: '0.8rem' }}
              defaultValue=""
              disabled={isBulkUpdating}
              onChange={(e) => {
                if (e.target.value) handleBulkStatusChange(e.target.value);
              }}
            >
              <option value="" disabled>
                Change Status to...
              </option>
              <option value={TASK_STATUS.TODO}>Mark as To Do</option>
              <option value={TASK_STATUS.IN_PROGRESS}>Mark as In Progress</option>
              <option value={TASK_STATUS.REVIEW}>Mark as In Review</option>
              <option value={TASK_STATUS.DONE}>Mark as Done</option>
              <option value={TASK_STATUS.BACKLOG}>Move to Backlog</option>
            </select>

            <button
              className="btn btn-sm btn-outline-warning rounded-3 fw-medium d-flex align-items-center gap-1"
              onClick={handleBulkArchive}
              disabled={isBulkUpdating}
            >
              <Archive size={14} />
              <span>Archive</span>
            </button>

            <button
              className="btn btn-sm btn-link text-secondary p-0 ms-2 small"
              onClick={() => setSelectedTaskIds([])}
            >
              Deselect All
            </button>
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

      {/* 4. Tasks Table Container */}
      <div className="bg-white border rounded-4 shadow-sm flex-grow-1 d-flex flex-column overflow-hidden mb-3">
        <div className="table-responsive flex-grow-1">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light border-bottom">
              <tr style={{ fontSize: '0.78rem', color: '#64748B' }}>
                <th style={{ width: 44 }} className="ps-3">
                  <span
                    role="button"
                    onClick={handleSelectAll}
                    className="cursor-pointer d-inline-flex"
                  >
                    {selectedTaskIds.length === tasks.length && tasks.length > 0 ? (
                      <CheckSquare size={16} className="text-primary" />
                    ) : (
                      <Square size={16} className="text-muted" />
                    )}
                  </span>
                </th>
                <th
                  className="cursor-pointer user-select-none"
                  onClick={() => handleSortClick('taskNumber')}
                  style={{ minWidth: 260 }}
                >
                  <div className="d-flex align-items-center gap-1">
                    <span>TASK</span>
                    <ArrowUpDown size={12} className="text-muted" />
                  </div>
                </th>
                <th style={{ minWidth: 160 }}>PROJECT</th>
                <th
                  className="cursor-pointer user-select-none"
                  onClick={() => handleSortClick('status')}
                  style={{ minWidth: 140 }}
                >
                  <div className="d-flex align-items-center gap-1">
                    <span>STATUS</span>
                    <ArrowUpDown size={12} className="text-muted" />
                  </div>
                </th>
                <th
                  className="cursor-pointer user-select-none"
                  onClick={() => handleSortClick('priority')}
                  style={{ minWidth: 120 }}
                >
                  <div className="d-flex align-items-center gap-1">
                    <span>PRIORITY</span>
                    <ArrowUpDown size={12} className="text-muted" />
                  </div>
                </th>
                <th style={{ minWidth: 140 }}>ASSIGNEES</th>
                <th
                  className="cursor-pointer user-select-none"
                  onClick={() => handleSortClick('dueDate')}
                  style={{ minWidth: 130 }}
                >
                  <div className="d-flex align-items-center gap-1">
                    <span>DUE DATE</span>
                    <ArrowUpDown size={12} className="text-muted" />
                  </div>
                </th>
                <th className="text-end pe-3" style={{ width: 140 }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && tasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    <RefreshCw size={24} className="spin-animation text-primary mb-2" />
                    <p className="small m-0">Loading tasks...</p>
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5">
                    <div className="d-flex flex-column align-items-center justify-content-center p-4">
                      <div
                        className="rounded-circle p-3 d-flex align-items-center justify-content-center mb-2"
                        style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', width: 56, height: 56 }}
                      >
                        <CheckSquare size={28} />
                      </div>
                      <h6 className="fw-bold text-dark mb-1">
                        {hasActiveFilters ? 'No matching tasks' : 'No tasks created yet'}
                      </h6>
                      <p className="text-secondary small mb-3" style={{ maxWidth: 360 }}>
                        {hasActiveFilters
                          ? 'Try adjusting your search criteria or reset filters to display sprint tasks.'
                          : 'Create your first sprint task with acceptance criteria, priority, and assignees.'}
                      </p>
                      {hasActiveFilters ? (
                        <button
                          className="btn btn-sm btn-outline-primary rounded-3 px-3 py-1.5"
                          onClick={handleClearFilters}
                        >
                          Reset Filters
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-primary rounded-3 px-3 py-1.5 shadow-sm"
                          style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
                          onClick={() => setIsCreateOpen(true)}
                        >
                          <Plus size={14} className="me-1" /> Create Task
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                tasks.map((task) => {
                  const isSelected = selectedTaskIds.includes(task.id);
                  const due = formatDueDate(task.dueDate);

                  return (
                    <tr
                      key={task.id}
                      className={isSelected ? 'table-primary-subtle' : ''}
                      style={{ transition: 'background-color 0.15s' }}
                    >
                      {/* Checkbox */}
                      <td className="ps-3">
                        <span
                          role="button"
                          className="cursor-pointer d-inline-flex"
                          onClick={() => handleToggleSelectTask(task.id)}
                        >
                          {isSelected ? (
                            <CheckSquare size={16} className="text-primary" />
                          ) : (
                            <Square size={16} className="text-muted" />
                          )}
                        </span>
                      </td>

                      {/* Task Key & Title */}
                      <td>
                        <div className="d-flex align-items-start gap-2">
                          <span
                            className="badge bg-light text-secondary border font-monospace mt-0.5"
                            style={{ fontSize: '0.72rem' }}
                          >
                            {task.taskKey}
                          </span>
                          <div>
                            <span
                              className="fw-bold text-dark text-decoration-none cursor-pointer hover-text-primary d-block"
                              role="button"
                              onClick={() => handleViewTaskDetails(task.id)}
                              style={{ fontSize: '0.88rem' }}
                            >
                              {task.title}
                            </span>
                            {task.tags && task.tags.length > 0 && (
                              <div className="d-flex flex-wrap gap-1 mt-1">
                                {task.tags.map((t: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="badge bg-light text-muted border px-1.5 py-0.5"
                                    style={{ fontSize: '0.65rem' }}
                                  >
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            )}
                            {((task.subtaskProgress && task.subtaskProgress.total > 0) || task.isBlocked) && (
                              <div className="d-flex flex-wrap align-items-center gap-1.5 mt-1">
                                {task.subtaskProgress && task.subtaskProgress.total > 0 && (
                                  <span
                                    className="badge bg-light text-primary border px-1.5 py-0.5 rounded-1 d-inline-flex align-items-center gap-1"
                                    style={{ fontSize: '0.68rem' }}
                                    title={`${task.subtaskProgress.completed} of ${task.subtaskProgress.total} subtasks completed`}
                                  >
                                    <CheckSquare size={10} />
                                    <span>{task.subtaskProgress.completed}/{task.subtaskProgress.total}</span>
                                  </span>
                                )}
                                {task.isBlocked && (
                                  <span
                                    className="badge bg-danger-subtle text-danger border border-danger-subtle px-1.5 py-0.5 rounded-1 d-inline-flex align-items-center gap-1 fw-semibold"
                                    style={{ fontSize: '0.68rem' }}
                                    title="Task is blocked by prerequisite tasks"
                                  >
                                    <Lock size={10} />
                                    <span>Blocked</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Project */}
                      <td>
                        <span
                          className="badge text-white px-2 py-1 rounded-2 small"
                          style={{ backgroundColor: task.project?.color || '#4F46E5' }}
                        >
                          {task.project?.name || 'Project'}
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td>
                        <select
                          className="form-select form-select-sm p-1 border-slate-200 fw-semibold text-secondary"
                          style={{ fontSize: '0.75rem', width: 125 }}
                          value={task.status}
                          onChange={(e) => handleQuickStatusChange(task.id, e.target.value)}
                        >
                          <option value={TASK_STATUS.TODO}>To Do</option>
                          <option value={TASK_STATUS.IN_PROGRESS}>In Progress</option>
                          <option value={TASK_STATUS.REVIEW}>In Review</option>
                          <option value={TASK_STATUS.DONE}>Completed</option>
                          <option value={TASK_STATUS.BACKLOG}>Backlog</option>
                        </select>
                      </td>

                      {/* Priority Dropdown */}
                      <td>
                        <select
                          className="form-select form-select-sm p-1 border-slate-200 fw-semibold text-secondary"
                          style={{ fontSize: '0.75rem', width: 105 }}
                          value={task.priority}
                          onChange={(e) => handleQuickPriorityChange(task.id, e.target.value)}
                        >
                          <option value={TASK_PRIORITY.LOW}>Low</option>
                          <option value={TASK_PRIORITY.MEDIUM}>Medium</option>
                          <option value={TASK_PRIORITY.HIGH}>High</option>
                          <option value={TASK_PRIORITY.URGENT}>Urgent</option>
                        </select>
                      </td>

                      {/* Assignees */}
                      <td>
                        <AvatarGroup
                          users={task.assignees.map((a: any) => ({
                            _id: a.id,
                            firstName: a.name,
                            lastName: '',
                            email: a.email,
                            avatarUrl: a.avatarUrl
                          }))}
                          max={2}
                          size={24}
                        />
                      </td>

                      {/* Due Date */}
                      <td>
                        {due ? (
                          <span
                            className={`d-flex align-items-center small ${
                              due.isPast ? 'text-danger fw-semibold' : 'text-muted'
                            }`}
                            style={{ fontSize: '0.78rem' }}
                          >
                            <Clock size={12} className="me-1" />
                            {due.formatted}
                          </span>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>

                      {/* Row Actions */}
                      <td className="text-end pe-3">
                        <div className="d-inline-flex align-items-center gap-1.5">
                          <button
                            className="btn btn-xs btn-outline-primary rounded-2 px-2 py-1"
                            onClick={() => handleViewTaskDetails(task.id)}
                            title="View details"
                          >
                            Details
                          </button>
                          <button
                            className="btn btn-xs btn-light rounded-2 p-1 text-muted hover-text-dark"
                            onClick={() => setEditingTask(task)}
                            title="Edit task"
                          >
                            <Edit size={14} />
                          </button>
                          {showArchived ? (
                            <button
                              className="btn btn-xs btn-light rounded-2 p-1 text-success"
                              onClick={async () => {
                                await apiClient.restoreTask(task.id);
                                fetchTasks(pagination.page, false);
                              }}
                              title="Restore task"
                            >
                              <RotateCcw size={14} />
                            </button>
                          ) : (
                            <button
                              className="btn btn-xs btn-light rounded-2 p-1 text-warning"
                              onClick={() => {
                                setDeletingTask(task);
                                setDeleteMode('archive');
                              }}
                              title="Archive task"
                            >
                              <Archive size={14} />
                            </button>
                          )}
                          <button
                            className="btn btn-xs btn-light rounded-2 p-1 text-danger"
                            onClick={() => {
                              setDeletingTask(task);
                              setDeleteMode('permanent');
                            }}
                            title="Delete permanently"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination Footer */}
        {pagination.total > 0 && (
          <div className="p-3 border-top bg-light d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div className="text-muted small">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}{' '}
              tasks
            </div>

            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-sm btn-outline-secondary px-2.5 py-1 rounded-2"
                disabled={pagination.page <= 1}
                onClick={() => fetchTasks(pagination.page - 1, true)}
              >
                Previous
              </button>

              <span className="small text-secondary px-2 fw-medium">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                className="btn btn-sm btn-outline-secondary px-2.5 py-1 rounded-2"
                disabled={!pagination.hasMore}
                onClick={() => fetchTasks(pagination.page + 1, true)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onTaskCreated={() => fetchTasks(1, false)}
        defaultProjectId={selectedProjectId}
      />

      {editingTask && (
        <EditTaskModal
          isOpen={Boolean(editingTask)}
          onClose={() => setEditingTask(null)}
          task={editingTask}
          onTaskUpdated={() => fetchTasks(pagination.page, false)}
        />
      )}

      {deletingTask && (
        <DeleteTaskModal
          isOpen={Boolean(deletingTask)}
          onClose={() => setDeletingTask(null)}
          task={deletingTask}
          mode={deleteMode}
          onDeleted={() => fetchTasks(pagination.page, false)}
        />
      )}
    </div>
  );
};

