import React, { useState, useEffect } from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { ORG_ROLES } from '../../../shared/constants/roles.js';
import { apiClient } from '../../api/client.js';
import { X, Mail, Check, AlertCircle, CheckCircle } from 'lucide-react';

export const InviteMemberModal: React.FC = () => {
  const { isInviteMemberModalOpen, setInviteMemberModalOpen, currentOrg, setPendingInvitations, pendingInvitations } = useWorkzenStore();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<any>(ORG_ROLES.MEMBER);
  const [selectedWorkspaceIds, setSelectedWorkspaceIds] = useState<string[]>([]);
  const [availableWorkspaces, setAvailableWorkspaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isInviteMemberModalOpen && currentOrg?._id) {
      setEmail('');
      setRole(ORG_ROLES.MEMBER);
      setSelectedWorkspaceIds([]);
      setSuccessMessage(null);
      setErrorMessage(null);
      setIsLoading(true);

      apiClient
        .listWorkspaces(currentOrg._id)
        .then((res) => {
          if (res.success && res.data) {
            setAvailableWorkspaces(res.data);
            // Default select all active workspaces
            setSelectedWorkspaceIds(res.data.map((w: any) => w._id));
          }
        })
        .catch(() => {
          setAvailableWorkspaces([]);
        })
        .finally(() => setIsLoading(false));
    }
  }, [isInviteMemberModalOpen, currentOrg?._id]);

  if (!isInviteMemberModalOpen || !currentOrg) return null;

  const handleToggleWorkspace = (wsId: string) => {
    if (selectedWorkspaceIds.includes(wsId)) {
      setSelectedWorkspaceIds(selectedWorkspaceIds.filter((id) => id !== wsId));
    } else {
      setSelectedWorkspaceIds([...selectedWorkspaceIds, wsId]);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await apiClient.createTeamInvitation(currentOrg._id, {
        email: email.trim(),
        role,
        workspaceIds: selectedWorkspaceIds
      });

      if (res.success && res.data) {
        setSuccessMessage(`Invitation dispatched successfully to ${email}. Token valid for 7 days.`);
        setPendingInvitations([res.data, ...pendingInvitations]);
        setEmail('');
        setTimeout(() => {
          setInviteMemberModalOpen(false);
        }, 1800);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch invitation. Please verify email and permissions.');
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
                Organization: {currentOrg.name}
              </span>
              <h5 className="modal-title fw-bold text-dark m-0">Invite Team Member</h5>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-light rounded-circle p-1"
              onClick={() => setInviteMemberModalOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSend}>
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

              <div className="mb-3">
                <label className="form-label fw-semibold text-secondary small">Corporate Email Address *</label>
                <div className="input-group">
                  <span className="input-group-text bg-white text-muted">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="colleague@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="text-muted" style={{ fontSize: '0.72rem', marginTop: 4 }}>
                  The recipient will receive an invitation email with a link to join your organization.
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold text-secondary small">Organization Role *</label>
                <select
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value={ORG_ROLES.MEMBER}>Member (Standard contributor; tasks and projects)</option>
                  <option value={ORG_ROLES.MANAGER}>Manager (Can manage projects, workspaces and teams)</option>
                  <option value={ORG_ROLES.ADMIN}>Admin (Full organization configuration and role management)</option>
                  <option value={ORG_ROLES.VIEWER}>Viewer (Read-only access across organization)</option>
                  <option value={ORG_ROLES.GUEST}>Guest (Restricted single-project viewer)</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold text-secondary small">
                  Initial Workspace Assignments ({selectedWorkspaceIds.length} of {availableWorkspaces.length} selected)
                </label>
                {isLoading ? (
                  <div className="text-muted small py-2">Loading organization workspaces...</div>
                ) : availableWorkspaces.length === 0 ? (
                  <div className="text-muted small py-1">No additional workspaces created. Member will have general organization access.</div>
                ) : (
                  <div className="d-flex flex-column gap-1.5 p-2 border rounded-3 bg-light" style={{ maxHeight: 150, overflowY: 'auto' }}>
                    {availableWorkspaces.map((ws) => (
                      <label
                        key={ws._id}
                        className="d-flex align-items-center gap-2 p-1.5 rounded-2 bg-white border small cursor-pointer"
                        style={{ cursor: 'pointer' }}
                      >
                        <input
                          type="checkbox"
                          className="form-check-input m-0"
                          checked={selectedWorkspaceIds.includes(ws._id)}
                          onChange={() => handleToggleWorkspace(ws._id)}
                          disabled={isSubmitting}
                        />
                        <span className="fw-medium text-dark">{ws.name}</span>
                        <span className="text-muted" style={{ fontSize: '0.72rem' }}>({ws.slug})</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer border-top px-4 py-3 bg-light rounded-bottom-4">
              <button
                type="button"
                className="btn btn-outline-secondary px-3 py-2 fw-medium"
                onClick={() => setInviteMemberModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary px-4 py-2 fw-semibold d-flex align-items-center gap-1.5"
                style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
                disabled={isSubmitting || !email}
              >
                {isSubmitting ? 'Dispatching...' : 'Send Invitation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
