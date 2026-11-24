import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client.js';
import { TASK_STATUS, TASK_PRIORITY } from '../../../shared/constants/status.js';
import { X, Edit3, Calendar, AlertCircle, Clock, Tag, User, Layers } from 'lucide-react';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: any;
  onTaskUpdated: () => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  onClose,
  task,
  onTaskUpdated
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<string>(TASK_STATUS.TODO);
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

  useEffect(() => {
    if (isOpen && task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || TASK_STATUS.TODO);
      setPriority(task.priority || TASK_PRIORITY.MEDIUM);
      const existingAssigneeIds = (task.assignees || []).map((a: any) => a.id || a._id);
      setSelectedAssigneeIds(existingAssigneeIds);
      setStartDate(task.startDate ? task.startDate.split('T')[0] : '');
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
      setEstimatedHours(task.estimatedHours || 0);
      setTags(task.tags || []);
      setError(null);

      const pId = task.project?.id || task.projectId?._id || task.projectId;
      if (pId) {
        apiClient
          .listProjectMembers(pId)
          .then((res) => {
            if (res.success && res.data?.members) {
              setMembers(
                res.data.members.map((m: any) => ({
                  id: m.id || m.userId,
                  name: m.name || m.email || 'Team Member',
                  role: m.role || 'Contributor'
                }))
              );
            }
          })
          .catch(() => setMembers([]));
      }
    }
  }, [isOpen, task]);

  if (!isOpen || !task) return null;

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
      setError('Task title cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: any = {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assigneeIds: selectedAssigneeIds,
        startDate: startDate || undefined,
        dueDate: dueDate || undefined,
        estimatedHours: estimatedHours >= 0 ? estimatedHours : 0,
        tags
      };

      const res = await apiClient.updateTask(task.id || task._id, payload);
      if (res.success) {
        onTaskUpdated();
        onClose();
      } else {
        setError(res.error?.message || 'Failed to update task.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating task.');
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
              <Edit3 size={20} />
            </div>
            <div>
              <h5 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                <span>Edit Task</span>
                <span className="badge bg-light text-secondary border font-monospace small">
                  {task.taskKey}
                </span>
              </h5>
              <p className="text-muted small m-0">{task.project?.name || 'Sprint Task'}</p>
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="form-label small fw-semibold text-dark mb-1">Description</label>
              <textarea
                className="form-control rounded-3"
                rows={3}
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
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Member Assignees */}
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
                <div className="p-2.5 bg-light rounded-3 text-muted small border">
                  No project members available.
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
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

