import React, { useState, useEffect } from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { apiClient } from '../../api/client.js';
import { TASK_STATUS, TASK_PRIORITY } from '../../../shared/constants/status.js';
import { X, Plus, Calendar, AlertCircle, Clock, Tag, User, Layers } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onTaskCreated?: () => void;
  defaultProjectId?: string;
  defaultStatus?: string;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  onTaskCreated,
  defaultProjectId,
  defaultStatus
}) => {
  const {
    isCreateTaskModalOpen,
    setCreateTaskModalOpen,
    setCreateProjectModalOpen,
    projects,
    setProjects,
    currentProject,
    currentWorkspace,
    setActiveView
  } = useWorkzenStore();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isCreateTaskModalOpen;
  const handleClose = () => {
    if (propOnClose) propOnClose();
    setCreateTaskModalOpen(false);
  };

  const initialProjId =
    defaultProjectId ||
    (currentProject as any)?._id ||
    (currentProject as any)?.id ||
    (projects.length > 0 ? (projects[0] as any)._id || (projects[0] as any).id : '');

  const [projectId, setProjectId] = useState<string>(initialProjId);
  const [availableProjects, setAvailableProjects] = useState<any[]>(projects || []);
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<string>(defaultStatus || TASK_STATUS.TODO);
  const [priority, setPriority] = useState<string>(TASK_PRIORITY.MEDIUM);
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [estimatedHours, setEstimatedHours] = useState<number>(0);
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [members, setMembers] = useState<Array<{ id: string; name: string; role: string }>>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Always fetch fresh projects from backend whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoadingProjects(true);
      apiClient
        .listProjects()
        .then((res) => {
          if (res.success && res.data?.projects) {
            const fetched: any[] = res.data.projects;
            setAvailableProjects(fetched);
            setProjects(fetched);

            // Auto-select valid project
            setProjectId((current) => {
              if (defaultProjectId && fetched.some((p: any) => (p._id || p.id) === defaultProjectId)) {
                return defaultProjectId;
              }
              if (current && fetched.some((p: any) => (p._id || p.id) === current)) {
                return current;
              }
              const currId = (currentProject as any)?._id || (currentProject as any)?.id;
              if (currId && fetched.some((p: any) => (p._id || p.id) === currId)) {
                return currId;
              }
              return fetched.length > 0 ? (fetched[0]._id || fetched[0].id) : '';
            });
          }
        })
        .catch(() => {})
        .finally(() => {
          setIsLoadingProjects(false);
        });

      setTitle('');
      setDescription('');
      setStatus(defaultStatus || TASK_STATUS.TODO);
      setPriority(TASK_PRIORITY.MEDIUM);
      setSelectedAssigneeIds([]);
      setStartDate('');
      setDueDate('');
      setEstimatedHours(0);
      setTags([]);
      setError(null);
    }
  }, [isOpen, defaultProjectId, defaultStatus, currentProject, setProjects]);

  // Sync when store projects change (e.g. after creating a project via CreateProjectModal)
  useEffect(() => {
    if (projects && projects.length > 0) {
      setAvailableProjects(projects);
      setProjectId((current) => {
        if (current && projects.some((p: any) => (p._id || p.id) === current)) {
          return current;
        }
        return (projects[0] as any)._id || (projects[0] as any).id || '';
      });
    }
  }, [projects]);

  // Load project members when projectId changes
  useEffect(() => {
    if (projectId) {
      apiClient
        .listProjectMembers(projectId)
        .then((res) => {
          if (res.success && res.data?.members) {
            setMembers(
              res.data.members.map((m: any) => ({
                id: m.id || m.userId,
                name: m.name || m.email || 'Team Member',
                role: m.role || 'Contributor'
              }))
            );
          } else {
            setMembers([]);
          }
        })
        .catch(() => setMembers([]));
    }
  }, [projectId]);

  if (!isOpen) return null;

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tToRemove: string) => {
    setTags(tags.filter((t) => t !== tToRemove));
  };

  const handleToggleAssignee = (mId: string) => {
    if (selectedAssigneeIds.includes(mId)) {
      setSelectedAssigneeIds(selectedAssigneeIds.filter((id) => id !== mId));
    } else {
      setSelectedAssigneeIds([...selectedAssigneeIds, mId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }
    if (!projectId) {
      setError('Please select a project for this task.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const targetProj = availableProjects.find((p: any) => (p._id || p.id) === projectId);
      const targetWsId =
        targetProj?.workspaceId ||
        (currentWorkspace as any)?._id ||
        (currentWorkspace as any)?.id ||
        'default';

      const payload: any = {
        projectId,
        workspaceId: targetWsId,
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        assigneeIds: selectedAssigneeIds,
        startDate: startDate || undefined,
        dueDate: dueDate || undefined,
        estimatedHours: estimatedHours > 0 ? estimatedHours : undefined,
        tags
      };

      const res = await apiClient.createTask(payload);
      if (res.success) {
        if (onTaskCreated) onTaskCreated();
        handleClose();
      } else {
        setError(res.error?.message || 'Failed to create task.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1060
      }}
    >
      <div
        className="bg-white rounded-4 shadow-lg border border-slate-200 w-100"
        style={{ maxWidth: 620, maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="p-4 border-bottom d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle p-2.5 d-flex align-items-center justify-content-center"
              style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}
            >
              <Plus size={22} />
            </div>
            <div>
              <h5 className="fw-bold text-dark m-0">Create New Task</h5>
              <p className="text-muted small m-0">Initialize sprint task with scope and assignments</p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-link text-muted p-1"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-4 d-flex flex-column gap-3.5">
            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 rounded-3 m-0 small">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Project Selection */}
            <div>
              <div className="d-flex align-items-center justify-content-between mb-1">
                <label className="form-label small fw-semibold text-dark mb-0 d-flex align-items-center gap-1.5">
                  <Layers size={14} className="text-primary" /> Project *
                </label>
                <button
                  type="button"
                  className="btn btn-sm btn-link text-primary fw-semibold p-0 text-decoration-none d-flex align-items-center gap-1"
                  style={{ fontSize: '0.78rem' }}
                  onClick={() => setCreateProjectModalOpen(true)}
                >
                  <Plus size={13} />
                  <span>New Project</span>
                </button>
              </div>
              <select
                className="form-select rounded-3 py-2"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required
                disabled={isLoadingProjects || isSubmitting}
              >
                <option value="">
                  {isLoadingProjects
                    ? 'Loading available projects...'
                    : availableProjects.length === 0
                    ? 'No projects available in workspace'
                    : 'Select a target project...'}
                </option>
                {availableProjects.map((p: any) => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.name} ({p.key})
                  </option>
                ))}
              </select>
              {availableProjects.length === 0 && !isLoadingProjects && (
                <div className="alert alert-warning py-2 px-3 rounded-3 small mt-2 d-flex align-items-center justify-content-between">
                  <span>No projects found. Create a project first to assign tasks.</span>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary fw-semibold px-2.5 py-1 rounded-2 shadow-xs"
                    style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5', fontSize: '0.78rem' }}
                    onClick={() => setCreateProjectModalOpen(true)}
                  >
                    + Create Project
                  </button>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="form-label small fw-semibold text-dark mb-1">Task Title *</label>
              <input
                type="text"
                className="form-control rounded-3 py-2"
                placeholder="e.g. Implement Redis token revocation blacklist"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="form-label small fw-semibold text-dark mb-1">Description</label>
              <textarea
                className="form-control rounded-3"
                rows={3}
                placeholder="Detailed requirements, technical constraints, or acceptance criteria..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Status & Priority Row */}
            <div className="row g-3">
              <div className="col-sm-6">
                <label className="form-label small fw-semibold text-dark mb-1">Workflow Status</label>
                <select
                  className="form-select rounded-3 py-2"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value={TASK_STATUS.TODO}>To Do</option>
                  <option value={TASK_STATUS.IN_PROGRESS}>In Progress</option>
                  <option value={TASK_STATUS.REVIEW}>In Review</option>
                  <option value={TASK_STATUS.DONE}>Completed</option>
                  <option value={TASK_STATUS.BACKLOG}>Backlog</option>
                </select>
              </div>

              <div className="col-sm-6">
                <label className="form-label small fw-semibold text-dark mb-1">Priority</label>
                <select
                  className="form-select rounded-3 py-2"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value={TASK_PRIORITY.LOW}>Low</option>
                  <option value={TASK_PRIORITY.MEDIUM}>Medium</option>
                  <option value={TASK_PRIORITY.HIGH}>High</option>
                  <option value={TASK_PRIORITY.URGENT}>Urgent</option>
                </select>
              </div>
            </div>

            {/* Dates & Effort Row */}
            <div className="row g-3">
              <div className="col-sm-4">
                <label className="form-label small fw-semibold text-dark mb-1 d-flex align-items-center gap-1.5">
                  <Calendar size={13} className="text-muted" /> Start Date
                </label>
                <input
                  type="date"
                  className="form-control rounded-3 py-1.5 small"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="col-sm-4">
                <label className="form-label small fw-semibold text-dark mb-1 d-flex align-items-center gap-1.5">
                  <Calendar size={13} className="text-primary" /> Due Date
                </label>
                <input
                  type="date"
                  className="form-control rounded-3 py-1.5 small"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="col-sm-4">
                <label className="form-label small fw-semibold text-dark mb-1 d-flex align-items-center gap-1.5">
                  <Clock size={13} className="text-muted" /> Est. Hours
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  className="form-control rounded-3 py-1.5 small"
                  placeholder="0"
                  value={estimatedHours || ''}
                  onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Member Assignees Selector */}
            <div>
              <label className="form-label small fw-semibold text-dark mb-1.5 d-flex align-items-center justify-content-between">
                <span className="d-flex align-items-center gap-1.5">
                  <User size={14} className="text-primary" /> Assign Teammates
                </span>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {selectedAssigneeIds.length} assigned
                </span>
              </label>

              {members.length === 0 ? (
                <div className="p-3 bg-light rounded-3 text-muted small border">
                  No project members found. Add members to the project to assign tasks.
                </div>
              ) : (
                <div
                  className="d-flex flex-wrap gap-2 p-2.5 bg-light rounded-3 border"
                  style={{ maxHeight: 120, overflowY: 'auto' }}
                >
                  {members.map((m) => {
                    const isSelected = selectedAssigneeIds.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        className={`btn btn-xs rounded-pill px-3 py-1 d-flex align-items-center gap-1.5 border transition-all ${
                          isSelected
                            ? 'btn-primary text-white border-primary shadow-xs'
                            : 'btn-white text-dark border-slate-200'
                        }`}
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => handleToggleAssignee(m.id)}
                      >
                        <span>{m.name}</span>
                        <span className="opacity-75">({m.role})</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="form-label small fw-semibold text-dark mb-1 d-flex align-items-center gap-1.5">
                <Tag size={14} className="text-primary" /> Tags
              </label>
              <input
                type="text"
                className="form-control rounded-3 py-2"
                placeholder="Type tag name and press Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
              {tags.length > 0 && (
                <div className="d-flex flex-wrap gap-1.5 mt-2">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="badge bg-light text-secondary border px-2 py-1 rounded-2 d-flex align-items-center gap-1 small"
                    >
                      #{t}
                      <X
                        size={12}
                        className="cursor-pointer text-muted hover-text-dark"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleRemoveTag(t)}
                      />
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 bg-light border-top rounded-bottom-4 d-flex align-items-center justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary px-3 py-2 fw-medium rounded-3"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-sm btn-primary px-4 py-2 fw-semibold rounded-3 shadow-sm"
              style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
