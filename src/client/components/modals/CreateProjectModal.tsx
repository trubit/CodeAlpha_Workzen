import React, { useState, useEffect } from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { apiClient } from '../../api/client.js';
import {
  X,
  FolderPlus,
  Layers,
  AlertCircle,
  Hash,
  Shield,
  Palette,
  Flag,
  Calendar
} from 'lucide-react';

const PROJECT_COLORS = [
  { hex: '#4F46E5', name: 'Indigo' },
  { hex: '#2563EB', name: 'Blue' },
  { hex: '#10B981', name: 'Emerald' },
  { hex: '#F59E0B', name: 'Amber' },
  { hex: '#E11D48', name: 'Rose' },
  { hex: '#8B5CF6', name: 'Purple' },
  { hex: '#06B6D4', name: 'Cyan' }
];

interface CreateProjectModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onProjectCreated?: (project: any) => void;
  defaultWorkspaceId?: string;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  onProjectCreated,
  defaultWorkspaceId
}) => {
  const {
    isCreateProjectModalOpen,
    setCreateProjectModalOpen,
    currentWorkspace,
    workspaces,
    currentOrg,
    projects,
    setProjects,
    setCurrentProject
  } = useWorkzenStore();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isCreateProjectModalOpen;
  const handleClose = () => {
    if (propOnClose) propOnClose();
    setCreateProjectModalOpen(false);
  };

  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [workspaceId, setWorkspaceId] = useState(
    defaultWorkspaceId || currentWorkspace?._id || (workspaces.length > 0 ? workspaces[0]._id : '')
  );
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [status, setStatus] = useState<'planning' | 'active' | 'on_hold'>('planning');
  const [visibility, setVisibility] = useState<'workspace' | 'restricted'>('workspace');
  const [color, setColor] = useState('#4F46E5');
  const [targetDate, setTargetDate] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync workspaceId when modal opens
  useEffect(() => {
    if (isOpen) {
      if (defaultWorkspaceId) {
        setWorkspaceId(defaultWorkspaceId);
      } else if (currentWorkspace?._id) {
        setWorkspaceId(currentWorkspace._id);
      } else if (workspaces.length > 0) {
        setWorkspaceId(workspaces[0]._id);
      }
      setError(null);
    }
  }, [isOpen, defaultWorkspaceId, currentWorkspace?._id, workspaces]);

  // Auto-generate project key from name if not manually modified
  const handleNameChange = (val: string) => {
    setName(val);
    const words = val.trim().split(/\s+/).filter(Boolean);
    let autoKey = '';
    if (words.length === 1) {
      autoKey = words[0].slice(0, 4).toUpperCase();
    } else if (words.length > 1) {
      autoKey = words
        .map((w) => w[0])
        .join('')
        .slice(0, 5)
        .toUpperCase();
    }
    // Only update key if user hasn't explicitly customized it to something completely different
    if (!key || key.startsWith(autoKey.slice(0, 1))) {
      setKey(autoKey.replace(/[^A-Z0-9]/g, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    const cleanKey = key.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleanKey.length < 2 || cleanKey.length > 10) {
      setError('Project key must be between 2 and 10 alphanumeric uppercase characters (e.g. PRJ, CORE)');
      return;
    }

    if (!workspaceId) {
      setError('Please select a target workspace for this project');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: any = {
        name: name.trim(),
        key: cleanKey,
        workspaceId,
        description: description.trim() || undefined,
        priority,
        status,
        visibility,
        color
      };

      if (targetDate) {
        payload.targetDate = new Date(targetDate).toISOString();
      }

      const res = await apiClient.createProject(payload);

      if (res.success && res.data?.project) {
        const newProj = res.data.project;
        setProjects([newProj, ...projects]);
        setCurrentProject(newProj);
        if (onProjectCreated) {
          onProjectCreated(newProj);
        }
        handleClose();
        // Reset form
        setName('');
        setKey('');
        setDescription('');
        setTargetDate('');
      } else {
        setError(res.error?.message || 'Failed to create project');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the project');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1070
      }}
    >
      <div
        className="bg-white rounded-4 shadow-lg border border-slate-200 w-100"
        style={{ maxWidth: 580, maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Modal Header */}
        <div className="p-4 border-bottom d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle p-2.5 d-flex align-items-center justify-content-center"
              style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}
            >
              <FolderPlus size={22} />
            </div>
            <div>
              <h5 className="fw-bold text-dark m-0">Create New Project</h5>
              <p className="text-muted small m-0">
                Organize deliverables, sprint roadmaps, and squad collaboration
              </p>
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-4 d-flex flex-column gap-3.5">
            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 rounded-3 m-0 small">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Target Workspace */}
            <div>
              <label className="form-label small fw-semibold text-dark mb-1 d-flex align-items-center gap-1.5">
                <Layers size={14} className="text-primary" /> Target Workspace *
              </label>
              {workspaces.length === 0 ? (
                <div className="p-2.5 bg-light rounded-3 text-muted small border">
                  No workspaces available. Please create or join a workspace first.
                </div>
              ) : (
                <select
                  className="form-select rounded-3 py-2"
                  value={workspaceId}
                  onChange={(e) => setWorkspaceId(e.target.value)}
                  required
                  disabled={isSubmitting}
                >
                  {workspaces.map((ws) => (
                    <option key={ws._id} value={ws._id}>
                      {ws.name} ({ws.slug})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Project Name & Project Key */}
            <div className="row g-3">
              <div className="col-sm-8">
                <label className="form-label small fw-semibold text-dark mb-1">Project Name *</label>
                <input
                  type="text"
                  className="form-control rounded-3 py-2"
                  placeholder="e.g. Core Cloud Services"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  autoFocus
                  disabled={isSubmitting}
                />
              </div>

              <div className="col-sm-4">
                <label className="form-label small fw-semibold text-dark mb-1 d-flex align-items-center gap-1">
                  <Hash size={13} className="text-muted" /> Key *
                </label>
                <input
                  type="text"
                  maxLength={10}
                  className="form-control rounded-3 py-2 text-uppercase fw-bold font-monospace"
                  placeholder="e.g. CORE"
                  value={key}
                  onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="form-label small fw-semibold text-dark mb-1">Description</label>
              <textarea
                className="form-control rounded-3 py-2"
                rows={3}
                placeholder="What is the objective or scope of this project?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Priority, Status, Target Date */}
            <div className="row g-3">
              <div className="col-sm-4">
                <label className="form-label small fw-semibold text-dark mb-1 d-flex align-items-center gap-1">
                  <Flag size={13} className="text-primary" /> Priority
                </label>
                <select
                  className="form-select rounded-3 py-1.5 small text-capitalize"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  disabled={isSubmitting}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="col-sm-4">
                <label className="form-label small fw-semibold text-dark mb-1">Status</label>
                <select
                  className="form-select rounded-3 py-1.5 small text-capitalize"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  disabled={isSubmitting}
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>

              <div className="col-sm-4">
                <label className="form-label small fw-semibold text-dark mb-1 d-flex align-items-center gap-1">
                  <Calendar size={13} className="text-muted" /> Target Date
                </label>
                <input
                  type="date"
                  className="form-control rounded-3 py-1.5 small"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Visibility & Theme Color */}
            <div className="row g-3 align-items-center">
              <div className="col-sm-6">
                <label className="form-label small fw-semibold text-dark mb-1 d-flex align-items-center gap-1">
                  <Shield size={13} className="text-muted" /> Visibility
                </label>
                <select
                  className="form-select rounded-3 py-1.5 small text-capitalize"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as any)}
                  disabled={isSubmitting}
                >
                  <option value="workspace">Workspace Members</option>
                  <option value="restricted">Restricted (Project Squad Only)</option>
                </select>
              </div>

              <div className="col-sm-6">
                <label className="form-label small fw-semibold text-dark mb-1.5 d-flex align-items-center gap-1">
                  <Palette size={13} className="text-muted" /> Theme Color
                </label>
                <div className="d-flex align-items-center gap-1.5">
                  {PROJECT_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      className="border-0 rounded-circle p-0 transition-transform"
                      style={{
                        width: 24,
                        height: 24,
                        backgroundColor: c.hex,
                        outline: color === c.hex ? `2px solid ${c.hex}` : 'none',
                        outlineOffset: 2,
                        transform: color === c.hex ? 'scale(1.15)' : 'scale(1)'
                      }}
                      onClick={() => setColor(c.hex)}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-3.5 bg-light border-top d-flex align-items-center justify-content-end gap-2.5 rounded-bottom-4">
            <button
              type="button"
              className="btn btn-outline-secondary rounded-3 px-3.5 py-2 fw-medium small"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary rounded-3 px-4 py-2 fw-semibold small shadow-sm d-flex align-items-center gap-1.5"
              style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                  <span>Creating Project...</span>
                </>
              ) : (
                <>
                  <FolderPlus size={16} />
                  <span>Create Project</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

