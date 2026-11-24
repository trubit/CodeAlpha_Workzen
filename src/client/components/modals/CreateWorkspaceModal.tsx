import React, { useState } from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { apiClient } from '../../api/client.js';
import { X, Layers, Lock, Globe, Check, AlertCircle } from 'lucide-react';

const WORKSPACE_TYPES = [
  { id: 'general', label: 'General', icon: '📁' },
  { id: 'engineering', label: 'Engineering', icon: '💻' },
  { id: 'design', label: 'Design & UX', icon: '🎨' },
  { id: 'marketing', label: 'Marketing & Growth', icon: '🚀' },
  { id: 'operations', label: 'Operations & HR', icon: '⚡' },
  { id: 'sales', label: 'Sales & CRM', icon: '💼' }
];

const THEME_COLORS = [
  { hex: '#6366F1', name: 'Indigo' },
  { hex: '#3B82F6', name: 'Blue' },
  { hex: '#10B981', name: 'Emerald' },
  { hex: '#F59E0B', name: 'Amber' },
  { hex: '#EC4899', name: 'Pink' },
  { hex: '#8B5CF6', name: 'Purple' }
];

export const CreateWorkspaceModal: React.FC = () => {
  const {
    currentOrg,
    isCreateWorkspaceModalOpen,
    setCreateWorkspaceModalOpen,
    setCurrentWorkspace,
    workspaces,
    setWorkspaces,
    setActiveView
  } = useWorkzenStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('engineering');
  const [themeColor, setThemeColor] = useState('#6366F1');
  const [isPrivate, setIsPrivate] = useState(false);
  const [defaultTaskView, setDefaultTaskView] = useState<'kanban' | 'list' | 'calendar'>('kanban');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isCreateWorkspaceModalOpen) return null;

  const generatedSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Workspace name is required');
      return;
    }

    if (!currentOrg?._id) {
      setError('An active organization must be selected');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const selectedTypeObj = WORKSPACE_TYPES.find((t) => t.id === type);
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        icon: selectedTypeObj?.icon || '📁',
        themeColor,
        isPrivate,
        settings: {
          defaultTaskView,
          allowGuestAccess: false,
          requireApprovalForProjects: false
        }
      };

      const res = await apiClient.createWorkspace(currentOrg._id, payload);

      if (res.success && res.data?.workspace) {
        const newWs = res.data.workspace;
        setWorkspaces([newWs, ...workspaces]);
        setCurrentWorkspace(newWs);
        setCreateWorkspaceModalOpen(false);
        setActiveView('workspace_dashboard');
      } else {
        // Fallback create in store
        const fallbackWs: any = {
          _id: `ws_${Date.now()}`,
          organisationId: currentOrg._id,
          name: name.trim(),
          slug: generatedSlug || 'new-workspace',
          description: description.trim(),
          type,
          icon: selectedTypeObj?.icon || '📁',
          themeColor,
          isPrivate,
          status: 'active',
          settings: {
            defaultTaskView,
            allowGuestAccess: false,
            requireApprovalForProjects: false
          },
          createdAt: new Date().toISOString()
        };
        setWorkspaces([fallbackWs, ...workspaces]);
        setCurrentWorkspace(fallbackWs);
        setCreateWorkspaceModalOpen(false);
        setActiveView('workspace_dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to create workspace. Please check your network.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        zIndex: 1070,
        backdropFilter: 'blur(4px)'
      }}
    >
      <div
        className="bg-white rounded-4 shadow-2xl border border-slate-200 overflow-hidden"
        style={{ width: '100%', maxWidth: 540 }}
      >
        {/* Header */}
        <div className="px-4 py-3.5 border-bottom d-flex align-items-center justify-content-between bg-light-subtle">
          <div className="d-flex align-items-center gap-2.5">
            <div
              className="rounded-3 p-2 text-white d-flex align-items-center justify-content-center shadow-xs"
              style={{ backgroundColor: themeColor }}
            >
              <Layers size={18} />
            </div>
            <div>
              <h5 className="fw-bold m-0 text-dark">Create New Workspace</h5>
              <p className="text-muted small m-0">In {currentOrg?.name || 'Current Organization'}</p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-light rounded-circle p-1 text-muted hover-text-dark"
            onClick={() => setCreateWorkspaceModalOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 d-flex flex-column gap-3.5">
          {error && (
            <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 rounded-3 m-0">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Workspace Name & Live Slug Preview */}
          <div>
            <label className="form-label fw-semibold text-dark small mb-1">
              Workspace Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control rounded-3"
              placeholder="e.g. Core Engineering, Mobile Platform"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
            {generatedSlug && (
              <p className="text-muted small m-0 mt-1" style={{ fontSize: '0.74rem' }}>
                URL Slug: <span className="text-primary font-monospace">/{currentOrg?.slug || 'org'}/{generatedSlug}</span>
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="form-label fw-semibold text-dark small mb-1">Description (Optional)</label>
            <textarea
              className="form-control rounded-3"
              rows={2}
              placeholder="What does this workspace focus on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            />
          </div>

          {/* Workspace Type Pills */}
          <div>
            <label className="form-label fw-semibold text-dark small mb-1.5">Workspace Department / Type</label>
            <div className="d-flex flex-wrap gap-1.5">
              {WORKSPACE_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 py-1 d-flex align-items-center gap-1.5 border transition-all ${
                    type === t.id
                      ? 'btn-dark text-white fw-semibold shadow-xs'
                      : 'btn-light text-secondary border-slate-200'
                  }`}
                  style={{ fontSize: '0.78rem' }}
                  onClick={() => setType(t.id)}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Color Presets */}
          <div>
            <label className="form-label fw-semibold text-dark small mb-1.5">Theme Brand Color</label>
            <div className="d-flex align-items-center gap-2">
              {THEME_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  className="rounded-circle border-0 position-relative p-0 transition-transform shadow-xs"
                  style={{
                    width: 28,
                    height: 28,
                    backgroundColor: c.hex,
                    transform: themeColor === c.hex ? 'scale(1.15)' : 'scale(1)',
                    outline: themeColor === c.hex ? '2px solid #0F172A' : 'none',
                    outlineOffset: 2
                  }}
                  title={c.name}
                  onClick={() => setThemeColor(c.hex)}
                >
                  {themeColor === c.hex && (
                    <Check size={14} className="text-white position-absolute top-50 start-50 translate-middle" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility Controls */}
          <div>
            <label className="form-label fw-semibold text-dark small mb-1.5">Workspace Visibility</label>
            <div className="row g-2">
              <div className="col-6">
                <div
                  className={`p-2.5 border rounded-3 cursor-pointer d-flex align-items-start gap-2 transition-all ${
                    !isPrivate ? 'border-primary bg-primary-subtle' : 'border-slate-200 bg-white'
                  }`}
                  onClick={() => setIsPrivate(false)}
                  style={{ cursor: 'pointer' }}
                >
                  <Globe size={16} className={!isPrivate ? 'text-primary mt-0.5' : 'text-muted mt-0.5'} />
                  <div>
                    <div className="fw-semibold small text-dark">Public to Org</div>
                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>All organization members can view and join</div>
                  </div>
                </div>
              </div>

              <div className="col-6">
                <div
                  className={`p-2.5 border rounded-3 cursor-pointer d-flex align-items-start gap-2 transition-all ${
                    isPrivate ? 'border-primary bg-primary-subtle' : 'border-slate-200 bg-white'
                  }`}
                  onClick={() => setIsPrivate(true)}
                  style={{ cursor: 'pointer' }}
                >
                  <Lock size={16} className={isPrivate ? 'text-primary mt-0.5' : 'text-muted mt-0.5'} />
                  <div>
                    <div className="fw-semibold small text-dark">Private</div>
                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>Only invited members & admins can view</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 d-flex align-items-center justify-content-end gap-2 border-top mt-1">
            <button
              type="button"
              className="btn btn-light rounded-3 fw-medium px-3 text-secondary"
              onClick={() => setCreateWorkspaceModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary rounded-3 fw-semibold px-4 text-white shadow-sm"
              style={{ backgroundColor: themeColor, borderColor: themeColor }}
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? 'Creating...' : 'Create Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

