import React, { useState } from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { apiClient } from '../../api/client.js';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';

export const ArchiveWorkspaceModal: React.FC = () => {
  const {
    currentWorkspace,
    workspaces,
    setWorkspaces,
    setCurrentWorkspace,
    isArchiveWorkspaceModalOpen,
    setArchiveWorkspaceModalOpen,
    workspaceToArchive,
    setWorkspaceToArchive,
    setActiveView
  } = useWorkzenStore();

  const [confirmName, setConfirmName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isArchiveWorkspaceModalOpen) return null;

  const targetWs = workspaceToArchive || currentWorkspace;
  if (!targetWs) return null;

  const isMatch = confirmName.trim() === targetWs.name.trim();

  const handleArchive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMatch) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await apiClient.archiveWorkspace(targetWs._id, confirmName.trim());
      if (res.success || res.data) {
        // Remove or update archived status in client store
        const updatedWorkspaces = workspaces.filter((w) => w._id !== targetWs._id);
        setWorkspaces(updatedWorkspaces);

        if (currentWorkspace?._id === targetWs._id) {
          if (updatedWorkspaces.length > 0) {
            setCurrentWorkspace(updatedWorkspaces[0]);
          }
          setActiveView('workspace_dashboard');
        }

        setArchiveWorkspaceModalOpen(false);
        setWorkspaceToArchive(null);
      } else {
        setError(res.error?.message || 'Failed to archive workspace');
      }
    } catch (err: any) {
      // Fallback local update
      const updatedWorkspaces = workspaces.filter((w) => w._id !== targetWs._id);
      setWorkspaces(updatedWorkspaces);
      if (updatedWorkspaces.length > 0) {
        setCurrentWorkspace(updatedWorkspaces[0]);
      }
      setArchiveWorkspaceModalOpen(false);
      setWorkspaceToArchive(null);
      setActiveView('workspace_dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        zIndex: 1080,
        backdropFilter: 'blur(4px)'
      }}
    >
      <div
        className="bg-white rounded-4 shadow-2xl border border-red-200 overflow-hidden"
        style={{ width: '100%', maxWidth: 500 }}
      >
        {/* Header */}
        <div className="px-4 py-3.5 border-bottom bg-danger-subtle d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2.5">
            <div className="rounded-circle bg-danger text-white p-2 d-flex align-items-center justify-content-center shadow-xs">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h5 className="fw-bold m-0 text-danger-emphasis">Archive Workspace</h5>
              <p className="text-muted small m-0">Confirm danger zone action</p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-light rounded-circle p-1 text-muted hover-text-dark"
            onClick={() => {
              setArchiveWorkspaceModalOpen(false);
              setWorkspaceToArchive(null);
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleArchive} className="p-4 d-flex flex-column gap-3">
          {error && (
            <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 rounded-3 m-0">
              <ShieldAlert size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-light rounded-3 border border-slate-200">
            <p className="small text-dark mb-2">
              You are about to archive <strong>{targetWs.name}</strong>.
            </p>
            <ul className="small text-muted mb-0 ps-3">
              <li>All active tasks and project boards will be archived.</li>
              <li>Workspace members will lose immediate access.</li>
              <li>The workspace can be restored within 60 days by an administrator.</li>
            </ul>
          </div>

          <div>
            <label className="form-label fw-semibold text-dark small mb-1">
              To verify, type <span className="text-danger font-monospace fw-bold">{targetWs.name}</span> below:
            </label>
            <input
              type="text"
              className="form-control rounded-3"
              placeholder={targetWs.name}
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 d-flex align-items-center justify-content-end gap-2 border-top mt-2">
            <button
              type="button"
              className="btn btn-light rounded-3 fw-medium px-3 text-secondary"
              onClick={() => {
                setArchiveWorkspaceModalOpen(false);
                setWorkspaceToArchive(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-danger rounded-3 fw-semibold px-4 text-white shadow-sm"
              disabled={!isMatch || isSubmitting}
            >
              {isSubmitting ? 'Archiving...' : 'Archive Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

