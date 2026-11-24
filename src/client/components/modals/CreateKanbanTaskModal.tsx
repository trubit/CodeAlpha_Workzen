import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client.js';
import { TASK_STATUS, TASK_PRIORITY } from '../../../shared/constants/status.js';
import { Plus, X, AlertCircle, Calendar, User, Tag, Clock } from 'lucide-react';

interface CreateKanbanTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  initialStatus?: string;
  onTaskCreated: () => void;
}

export const CreateKanbanTaskModal: React.FC<CreateKanbanTaskModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  initialStatus = TASK_STATUS.TODO,
  onTaskCreated
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<string>(initialStatus);
  const [priority, setPriority] = useState<string>(TASK_PRIORITY.MEDIUM);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && projectId) {
      loadProjectMembers();
      setTitle('');
      setDescription('');
      setStatus(initialStatus);
      setPriority(TASK_PRIORITY.MEDIUM);
      setSelectedAssigneeId('');
      setDueDate('');
      setTags([]);
      setError(null);
    }
  }, [isOpen, projectId, initialStatus]);

  const loadProjectMembers = async () => {
    setIsLoadingMembers(true);
    try {
      const res = await apiClient.listProjectMembers(projectId);
      if (res.success && res.data?.members) {
        setMembers(res.data.members);
      }
    } catch {
      // Ignored cleanly
    } finally {
      setIsLoadingMembers(false);
    }
  };

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

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: any = {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        assigneeIds: selectedAssigneeId ? [selectedAssigneeId] : [],
        dueDate: dueDate || undefined,
        tags
      };

      const res = await apiClient.createKanbanTask(projectId, payload);
      if (res.success) {
        onTaskCreated();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create task on the board.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        zIndex: 1060,
        backdropFilter: 'blur(4px)'
      }}
    >
      <div
        className="bg-white rounded-4 shadow-lg border border-slate-200 w-100"
        style={{ maxWidth: 540, maxHeight: '90vh', overflowY: 'auto' }}
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
              <h5 className="fw-bold text-dark m-0">Create Sprint Task</h5>
              <p className="text-muted small m-0">Adding task to {projectName}</p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-link text-muted p-1"
            onClick={onClose}
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

            {/* Title */}
            <div>
              <label className="form-label small fw-semibold text-dark mb-1">Task Title *</label>
              <input
                type="text"
                className="form-control rounded-3 py-2"
                placeholder="e.g. Implement Redis token revocation cache"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="form-label small fw-semibold text-dark mb-1">Description (Optional)</label>
              <textarea
                className="form-control rounded-3"
                rows={3}
                placeholder="Brief summary of requirements or acceptance criteria..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Column & Priority Row */}
            <div className="row g-3">
              <div className="col-sm-6">
                <label className="form-label small fw-semibold text-dark mb-1">Workflow Column</label>
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

            {/* Assignee & Due Date Row */}
            <div className="row g-3">
              <div className="col-sm-6">
                <label className="form-label small fw-semibold text-dark mb-1 d-flex align-items-center gap-1.5">
                  <User size={14} className="text-primary" /> Assignee
                </label>
                <select
                  className="form-select rounded-3 py-2"
                  value={selectedAssigneeId}
                  onChange={(e) => setSelectedAssigneeId(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-sm-6">
                <label className="form-label small fw-semibold text-dark mb-1 d-flex align-items-center gap-1.5">
                  <Calendar size={14} className="text-primary" /> Due Date
                </label>
                <input
                  type="date"
                  className="form-control rounded-3 py-2"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
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
              onClick={onClose}
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

