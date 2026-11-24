import React, { useState } from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { apiClient } from '../../api/client.js';
import { UserCheck, AlertCircle, Loader2, Check } from 'lucide-react';

export const AssignRoleModal: React.FC = () => {
  const {
    isAssignRoleModalOpen,
    setAssignRoleModalOpen,
    memberToAssignRole,
    setMemberToAssignRole,
    currentOrg,
    currentWorkspace,
    roles
  } = useWorkzenStore();

  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [scope, setScope] = useState<'organization' | 'workspace'>('organization');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isAssignRoleModalOpen || !memberToAssignRole) return null;

  const handleClose = () => {
    setSelectedRoleId('');
    setMemberToAssignRole(null);
    setAssignRoleModalOpen(false);
    setErrorMessage(null);
  };

  const filteredRoles = roles.filter((r) => r.scope === scope);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleId) {
      setErrorMessage('Please select a role to assign.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const targetUserId = memberToAssignRole.userId?._id || memberToAssignRole.userId || memberToAssignRole._id;

      if (scope === 'organization') {
        if (!currentOrg?._id) {
          setErrorMessage('No active organization selected.');
          setIsSubmitting(false);
          return;
        }
        await apiClient.post(
          `/organizations/${currentOrg._id}/members/${targetUserId}/roles`,
          { roleId: selectedRoleId }
        );
      } else {
        if (!currentWorkspace?._id) {
          setErrorMessage('No active workspace selected.');
          setIsSubmitting(false);
          return;
        }
        await apiClient.post(
          `/workspaces/${currentWorkspace._id}/members/${targetUserId}/roles`,
          { roleId: selectedRoleId }
        );
      }

      handleClose();
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Failed to assign role. Self-promotion and owner modification are blocked.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const memberName =
    memberToAssignRole.user
      ? `${memberToAssignRole.user.firstName} ${memberToAssignRole.user.lastName}`
      : memberToAssignRole.name || 'Member';

  const memberEmail =
    memberToAssignRole.user?.email || memberToAssignRole.email || '';

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1050 }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '580px' }}>
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div className="modal-header border-bottom px-4 py-3 bg-white d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center text-white"
                style={{ width: 36, height: 36, backgroundColor: '#10B981' }}
              >
                <UserCheck size={20} />
              </div>
              <div>
                <h5 className="modal-title fw-bold text-dark m-0" style={{ fontSize: '1.05rem' }}>
                  Assign Role to Member
                </h5>
                <span className="text-muted small">Update enterprise capability tier</span>
              </div>
            </div>
            <button type="button" className="btn-close" onClick={handleClose} disabled={isSubmitting} />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {errorMessage && (
                <div className="alert alert-danger d-flex align-items-center gap-2 small py-2 rounded-3 mb-3">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Target Member Card */}
              <div className="p-3 rounded-3 bg-light border mb-4 d-flex align-items-center justify-content-between">
                <div>
                  <div className="fw-semibold text-dark">{memberName}</div>
                  <div className="text-muted small font-monospace">{memberEmail}</div>
                </div>
                <span className="badge bg-white text-secondary border">Active Member</span>
              </div>

              {/* Scope Switcher */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary mb-1">
                  Assignment Level
                </label>
                <div className="btn-group w-100" role="group">
                  <button
                    type="button"
                    className={`btn btn-sm py-2 ${
                      scope === 'organization' ? 'btn-primary' : 'btn-outline-secondary'
                    }`}
                    onClick={() => {
                      setScope('organization');
                      setSelectedRoleId('');
                    }}
                  >
                    Organization Level
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm py-2 ${
                      scope === 'workspace' ? 'btn-primary' : 'btn-outline-secondary'
                    }`}
                    onClick={() => {
                      setScope('workspace');
                      setSelectedRoleId('');
                    }}
                  >
                    Workspace Level ({currentWorkspace?.name || 'Workspace'})
                  </button>
                </div>
              </div>

              {/* Role Select */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary mb-1">
                  Select Role <span className="text-danger">*</span>
                </label>
                <div className="d-flex flex-column gap-2" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                  {filteredRoles.map((role) => {
                    const isSelected = selectedRoleId === role._id;
                    return (
                      <label
                        key={role._id}
                        className={`d-flex align-items-center justify-content-between p-3 rounded-3 border transition-all cursor-pointer ${
                          isSelected ? 'border-primary bg-primary-subtle' : 'bg-light border-light'
                        }`}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <input
                            type="radio"
                            name="roleSelection"
                            className="form-check-input mt-0"
                            checked={isSelected}
                            onChange={() => setSelectedRoleId(role._id)}
                          />
                          <div>
                            <div className="fw-semibold text-dark small">{role.name}</div>
                            <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                              {role.description || `${role.permissions.length} capabilities granted`}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`badge ${role.isSystem ? 'bg-secondary text-white' : 'bg-indigo text-white'}`}
                          style={{ fontSize: '0.68rem', backgroundColor: role.isSystem ? '#64748B' : '#6366F1' }}
                        >
                          {role.isSystem ? 'System' : 'Custom'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="modal-footer border-top px-4 py-3 bg-light d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-light border px-3"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedRoleId || isSubmitting}
                className="btn btn-primary px-4 fw-semibold d-flex align-items-center gap-2"
                style={{ backgroundColor: '#10B981', borderColor: '#10B981' }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="spinner-border spinner-border-sm" />
                    <span>Assigning Role...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Confirm Assignment</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

