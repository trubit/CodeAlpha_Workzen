import React, { useState } from 'react';
import { useWorkzenStore } from '../store/useWorkzenStore.js';
import { apiClient } from '../api/client.js';
import {
  ArrowLeft,
  Layers,
  Save,
  CheckCircle2,
  AlertCircle,
  Archive,
  Lock,
  Globe,
  Sliders,
  Shield,
  Clock,
  Briefcase,
  Code,
  Palette,
  Users
} from 'lucide-react';

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

export const WorkspaceSettingsPage: React.FC = () => {
  const {
    currentWorkspace,
    setCurrentWorkspace,
    workspaces,
    setWorkspaces,
    setArchiveWorkspaceModalOpen,
    setWorkspaceToArchive,
    setActiveView
  } = useWorkzenStore();

  const [name, setName] = useState(currentWorkspace?.name || '');
  const [description, setDescription] = useState(currentWorkspace?.description || '');
  const [type, setType] = useState(currentWorkspace?.type || 'engineering');
  const [themeColor, setThemeColor] = useState(currentWorkspace?.themeColor || '#6366F1');
  const [isPrivate, setIsPrivate] = useState(currentWorkspace?.isPrivate || false);

  const [defaultTaskView, setDefaultTaskView] = useState<'kanban' | 'list' | 'calendar'>(
    (currentWorkspace?.settings?.defaultTaskView as any) || 'kanban'
  );
  const [allowGuestAccess, setAllowGuestAccess] = useState(
    currentWorkspace?.settings?.allowGuestAccess || false
  );
  const [requireApproval, setRequireApproval] = useState(
    currentWorkspace?.settings?.requireApprovalForProjects || false
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!currentWorkspace) {
    return (
      <div className="text-center py-5">
        <h4 className="fw-bold text-dark">No workspace selected</h4>
        <p className="text-muted">Please select a workspace to view its settings.</p>
        <button
          className="btn btn-primary rounded-3"
          onClick={() => setActiveView('workspace_dashboard')}
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        type,
        themeColor,
        isPrivate
      };

      const res = await apiClient.updateWorkspace(currentWorkspace._id, payload);

      const updated = {
        ...currentWorkspace,
        ...payload
      };

      setCurrentWorkspace(updated);
      setWorkspaces(workspaces.map((w) => (w._id === updated._id ? updated : w)));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update workspace general details');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePolicies = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const payload = {
        defaultTaskView,
        allowGuestAccess,
        requireApprovalForProjects: requireApproval
      };

      await apiClient.updateWorkspaceSettings(currentWorkspace._id, payload);

      const updated = {
        ...currentWorkspace,
        settings: {
          ...currentWorkspace.settings,
          ...payload
        }
      };

      setCurrentWorkspace(updated);
      setWorkspaces(workspaces.map((w) => (w._id === updated._id ? updated : w)));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update workspace operational policies');
    } finally {
      setIsSaving(false);
    }
  };

  const triggerArchive = () => {
    setWorkspaceToArchive(currentWorkspace);
    setArchiveWorkspaceModalOpen(true);
  };

  return (
    <div className="d-flex flex-column gap-4 max-w-6xl mx-auto pb-5">
      {/* Breadcrumb Header matching Dribbble reference */}
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-sm btn-light border rounded-3 p-2 text-muted hover-text-dark"
            onClick={() => setActiveView('workspace_dashboard')}
            title="Back to Workspace"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h3 className="fw-bold m-0 text-dark">Workspace Overview</h3>
            <p className="text-muted small m-0">View and edit workspace settings and policies</p>
          </div>
        </div>

        {saveSuccess && (
          <div className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill d-flex align-items-center gap-1.5 shadow-xs">
            <CheckCircle2 size={15} />
            <span className="fw-semibold">Settings saved successfully</span>
          </div>
        )}
      </div>

      <div className="row g-4">
        {/* Left Column: Profile Card & Identity Metadata */}
        <div className="col-lg-4">
          <div className="wz-card p-4 d-flex flex-column gap-3.5 sticky-top" style={{ top: 80 }}>
            {/* Identity Badge */}
            <div className="d-flex align-items-center gap-3 pb-3 border-bottom">
              <div
                className="rounded-4 d-flex align-items-center justify-content-center text-white shadow-sm flex-shrink-0"
                style={{
                  width: 56,
                  height: 56,
                  backgroundColor: currentWorkspace.themeColor || '#6366F1',
                  fontSize: '1.5rem',
                  fontWeight: 700
                }}
              >
                {currentWorkspace.icon && currentWorkspace.icon.length <= 2
                  ? currentWorkspace.icon
                  : currentWorkspace.name.charAt(0)}
              </div>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <h5 className="fw-bold m-0 text-dark">{currentWorkspace.name}</h5>
                  <span className="badge bg-success-subtle text-success rounded-pill px-2 py-0.5 small d-flex align-items-center gap-1">
                    <span className="rounded-circle bg-success" style={{ width: 6, height: 6 }} />
                    Active
                  </span>
                </div>
                <div className="text-muted font-monospace small" style={{ fontSize: '0.72rem' }}>
                  ID: #{currentWorkspace._id.slice(-8)}
                </div>
              </div>
            </div>

            {/* Quick Metadata */}
            <div className="d-flex flex-column gap-2 small">
              <div className="d-flex justify-content-between text-muted py-1 border-bottom border-light">
                <span>Created At</span>
                <span className="fw-medium text-dark">
                  {new Date(currentWorkspace.createdAt || Date.now()).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="d-flex justify-content-between text-muted py-1 border-bottom border-light">
                <span>Department / Type</span>
                <span className="fw-medium text-dark text-capitalize">{currentWorkspace.type || 'General'}</span>
              </div>
              <div className="d-flex justify-content-between text-muted py-1 border-bottom border-light">
                <span>Visibility</span>
                <span className="fw-medium text-dark d-flex align-items-center gap-1">
                  {currentWorkspace.isPrivate ? (
                    <>
                      <Lock size={12} className="text-warning" /> Private
                    </>
                  ) : (
                    <>
                      <Globe size={12} className="text-success" /> Public to Org
                    </>
                  )}
                </span>
              </div>
              <div className="d-flex justify-content-between text-muted py-1">
                <span>Default View</span>
                <span className="fw-medium text-dark text-capitalize">
                  {currentWorkspace.settings?.defaultTaskView || 'Kanban'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Forms & Controls */}
        <div className="col-lg-8 d-flex flex-column gap-4">
          {/* Card: Workspace Details */}
          <div className="wz-card p-4">
            <h5 className="fw-bold text-dark mb-1">Workspace Details</h5>
            <p className="text-muted small mb-4">Edit the name, description, and visual identity of this workspace</p>

            <form onSubmit={handleSaveDetails} className="d-flex flex-column gap-3.5">
              <div>
                <label className="form-label fw-semibold text-dark small mb-1">Workspace Name</label>
                <input
                  type="text"
                  className="form-control rounded-3"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label fw-semibold text-dark small mb-1">Workspace Description</label>
                <textarea
                  className="form-control rounded-3"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the projects and purpose of this workspace..."
                  style={{ fontSize: '0.88rem' }}
                />
              </div>

              {/* Type Pills */}
              <div>
                <label className="form-label fw-semibold text-dark small mb-1.5">Workspace Department</label>
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
                      style={{ fontSize: '0.8rem' }}
                      onClick={() => setType(t.id)}
                    >
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Color Selector */}
              <div>
                <label className="form-label fw-semibold text-dark small mb-1.5">Theme Brand Color</label>
                <div className="d-flex align-items-center gap-2">
                  {THEME_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      className="rounded-circle border-0 position-relative p-0 transition-transform shadow-xs"
                      style={{
                        width: 30,
                        height: 30,
                        backgroundColor: c.hex,
                        transform: themeColor === c.hex ? 'scale(1.15)' : 'scale(1)',
                        outline: themeColor === c.hex ? '2px solid #0F172A' : 'none',
                        outlineOffset: 2
                      }}
                      title={c.name}
                      onClick={() => setThemeColor(c.hex)}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 d-flex justify-content-end">
                <button
                  type="submit"
                  className="btn btn-primary rounded-3 fw-semibold px-4 text-white d-flex align-items-center gap-2 shadow-sm"
                  style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
                  disabled={isSaving}
                >
                  <Save size={16} />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Card: Operational Policies */}
          <div className="wz-card p-4">
            <h5 className="fw-bold text-dark mb-1">Operational Policies</h5>
            <p className="text-muted small mb-3">Configure access rules and default workflows</p>

            <div className="d-flex flex-column gap-3">
              {/* Default task view */}
              <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded-3">
                <div>
                  <div className="fw-semibold text-dark small">Default Task View</div>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                    Select the initial view when opening projects
                  </div>
                </div>
                <div className="btn-group btn-group-sm">
                  {(['kanban', 'list', 'calendar'] as const).map((view) => (
                    <button
                      key={view}
                      type="button"
                      className={`btn text-capitalize ${
                        defaultTaskView === view ? 'btn-primary text-white fw-semibold' : 'btn-outline-secondary'
                      }`}
                      onClick={() => setDefaultTaskView(view)}
                    >
                      {view}
                    </button>
                  ))}
                </div>
              </div>

              {/* Guest Access Toggle */}
              <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded-3">
                <div>
                  <div className="fw-semibold text-dark small">Allow External Guest Collaborators</div>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                    Permit single-project guest viewers to access tasks
                  </div>
                </div>
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    checked={allowGuestAccess}
                    onChange={(e) => setAllowGuestAccess(e.target.checked)}
                    style={{ cursor: 'pointer', width: 38, height: 20 }}
                  />
                </div>
              </div>

              {/* Project Approval Toggle */}
              <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded-3">
                <div>
                  <div className="fw-semibold text-dark small">Require Admin Approval for New Projects</div>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                    Hold project creation in pending state until workspace admin approves
                  </div>
                </div>
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    checked={requireApproval}
                    onChange={(e) => setRequireApproval(e.target.checked)}
                    style={{ cursor: 'pointer', width: 38, height: 20 }}
                  />
                </div>
              </div>

              <div className="pt-1 d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-outline-primary rounded-3 fw-semibold px-3 py-1.5"
                  onClick={handleSavePolicies}
                  disabled={isSaving}
                >
                  Update Policies
                </button>
              </div>
            </div>
          </div>

          {/* Card: Danger Zone / Archival */}
          <div className="wz-card p-4 border-danger-subtle bg-danger-subtle bg-opacity-10">
            <h5 className="fw-bold text-danger mb-1">Danger Zone</h5>
            <p className="text-muted small mb-3">
              Safely archive this workspace and deactivate project workflows
            </p>

            <div className="p-3 bg-white rounded-3 border border-danger-subtle d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <div className="fw-bold text-dark small">Archive this Workspace</div>
                <div className="text-muted" style={{ fontSize: '0.75rem', maxWidth: 440 }}>
                  In case of archiving, all active processes and workflows associated with this workspace will be halted and can be restored within 60 days.
                </div>
              </div>
              <button
                type="button"
                className="btn btn-danger rounded-3 fw-semibold px-3 py-2 text-white shadow-xs d-flex align-items-center gap-1.5"
                onClick={triggerArchive}
              >
                <Archive size={15} />
                <span>Archive Workspace</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

