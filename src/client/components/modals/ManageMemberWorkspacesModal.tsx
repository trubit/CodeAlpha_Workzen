import React, { useState, useEffect } from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { apiClient } from '../../api/client.js';
import { WORKSPACE_ROLES } from '../../../shared/constants/roles.js';
import { X, Layers, AlertCircle, CheckCircle } from 'lucide-react';

export const ManageMemberWorkspacesModal: React.FC = () => {
  const {
    isManageWorkspacesModalOpen,
    setManageWorkspacesModalOpen,
    memberToManageWorkspaces,
    setMemberToManageWorkspaces,
    currentOrg
  } = useWorkzenStore();

  const [availableWorkspaces, setAvailableWorkspaces] = useState<any[]>([]);
  const [assignedMap, setAssignedMap] = useState<Record<string, string>>({}); // wsId -> role
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isManageWorkspacesModalOpen && memberToManageWorkspaces && currentOrg?._id) {
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsLoading(true);

      const targetUserId =
        memberToManageWorkspaces._id ||
        memberToManageWorkspaces.userId?._id ||
        memberToManageWorkspaces.userId;

      // 1. Fetch available workspaces in organization
      // 2. Fetch member's current details
      Promise.all([
        apiClient.listWorkspaces(currentOrg._id),
        apiClient.getTeamMember(currentOrg._id, targetUserId)
      ])
        .then(([wsRes, memberRes]) => {
          if (wsRes.success && wsRes.data) {
            setAvailableWorkspaces(wsRes.data);
          }
          if (memberRes.success && memberRes.data?.workspaces) {
            const initialMap: Record<string, string> = {};
            memberRes.data.workspaces.forEach((w: any) => {
              initialMap[w.workspaceId] = w.role || WORKSPACE_ROLES.MEMBER;
            });
            setAssignedMap(initialMap);
          }
        })
        .catch((err: any) => {
          setErrorMessage(err.message || 'Failed to load workspace memberships');
        })
        .finally(() => setIsLoading(false));
    }
  }, [isManageWorkspacesModalOpen, memberToManageWorkspaces, currentOrg?._id]);

  if (!isManageWorkspacesModalOpen || !memberToManageWorkspaces || !currentOrg) return null;

  const targetUserId =
    memberToManageWorkspaces._id ||
    memberToManageWorkspaces.userId?._id ||
    memberToManageWorkspaces.userId;

  const memberName = memberToManageWorkspaces.user
    ? `${memberToManageWorkspaces.user.firstName} ${memberToManageWorkspaces.user.lastName}`
    : memberToManageWorkspaces.firstName
    ? `${memberToManageWorkspaces.firstName} ${memberToManageWorkspaces.lastName}`
    : 'Member';

  const handleToggle = (wsId: string) => {
    const updated = { ...assignedMap };
    if (updated[wsId]) {
      delete updated[wsId];
    } else {
      updated[wsId] = WORKSPACE_ROLES.MEMBER;
    }
    setAssignedMap(updated);
  };

  const handleRoleChange = (wsId: string, role: string) => {
    setAssignedMap({
      ...assignedMap,
      [wsId]: role
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload = Object.entries(assignedMap).map(([workspaceId, role]) => ({
      workspaceId,
      role
    }));

    try {
      const res = await apiClient.updateTeamMemberWorkspaces(currentOrg._id, targetUserId, payload);
      if (res.success) {
        setSuccessMessage('Workspace memberships updated successfully.');
        setTimeout(() => {
          setManageWorkspacesModalOpen(false);
          setMemberToManageWorkspaces(null);
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update workspace memberships.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1050 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header border-bottom px-4 py-3 bg-light rounded-top-4">
            <div>
              <span className="badge bg-indigo-subtle text-primary mb-1">
                Member: {memberName}
              </span>
              <h5 className="modal-title fw-bold text-dark m-0">Manage Workspace Access</h5>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-light rounded-circle p-1"
              onClick={() => {
                setManageWorkspacesModalOpen(false);
                setMemberToManageWorkspaces(null);
              }}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave}>
            <div className="modal-body px-4 py-3">
              {errorMessage && (
                <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2">
                  <AlertCircle size={16} className="text-danger flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="alert alert-success py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2">
                  <CheckCircle size={16} className="text-success flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <p className="text-muted small mb-3">
                Select which workspaces <strong>{memberName}</strong> can access and choose their role within each workspace.
              </p>

              {isLoading ? (
                <div className="text-center py-4 text-muted small">Loading workspaces...</div>
              ) : availableWorkspaces.length === 0 ? (
                <div className="alert alert-light border small text-muted text-center py-3">
                  No active workspaces in this organization.
                </div>
              ) : (
                <div className="d-flex flex-column gap-2" style={{ maxHeight: 280, overflowY: 'auto' }}>
                  {availableWorkspaces.map((ws) => {
                    const isAssigned = Boolean(assignedMap[ws._id]);
                    return (
                      <div
                        key={ws._id}
                        className={`p-2.5 rounded-3 border transition-all ${
                          isAssigned ? 'bg-white border-primary' : 'bg-light border-light'
                        }`}
                      >
                        <div className="d-flex align-items-center justify-content-between">
                          <label className="d-flex align-items-center gap-2 m-0 cursor-pointer" style={{ cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              className="form-check-input m-0"
                              checked={isAssigned}
                              onChange={() => handleToggle(ws._id)}
                              disabled={isSubmitting}
                            />
                            <div>
                              <div className="fw-semibold text-dark small">{ws.name}</div>
                              <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                                slug: {ws.slug} {ws.isPrivate ? '• Private' : ''}
                              </div>
                            </div>
                          </label>

                          {isAssigned && (
                            <select
                              className="form-select form-select-sm"
                              style={{ width: 120, fontSize: '0.78rem' }}
                              value={assignedMap[ws._id]}
                              onChange={(e) => handleRoleChange(ws._id, e.target.value)}
                              disabled={isSubmitting}
                            >
                              <option value={WORKSPACE_ROLES.MEMBER}>Member</option>
                              <option value={WORKSPACE_ROLES.ADMIN}>Admin</option>
                              <option value={WORKSPACE_ROLES.MANAGER}>Manager</option>
                              <option value={WORKSPACE_ROLES.EDITOR}>Editor</option>
                              <option value={WORKSPACE_ROLES.VIEWER}>Viewer</option>
                            </select>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="modal-footer border-top px-4 py-3 bg-light rounded-bottom-4">
              <button
                type="button"
                className="btn btn-outline-secondary px-3 py-2 fw-medium"
                onClick={() => {
                  setManageWorkspacesModalOpen(false);
                  setMemberToManageWorkspaces(null);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary px-4 py-2 fw-semibold"
                style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? 'Saving...' : 'Save Workspace Access'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

