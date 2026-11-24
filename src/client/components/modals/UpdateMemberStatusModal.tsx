import React, { useState } from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { apiClient } from '../../api/client.js';
import { X, ShieldAlert, AlertCircle, CheckCircle, UserCheck, UserX, PauseCircle } from 'lucide-react';

export const UpdateMemberStatusModal: React.FC = () => {
  const {
    isMemberStatusModalOpen,
    setMemberStatusModalOpen,
    memberToUpdateStatus,
    setMemberToUpdateStatus,
    currentOrg
  } = useWorkzenStore();

  const [selectedStatus, setSelectedStatus] = useState<'active' | 'suspended' | 'deactivated'>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (memberToUpdateStatus) {
      setSelectedStatus(memberToUpdateStatus.status || 'active');
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [memberToUpdateStatus]);

  if (!isMemberStatusModalOpen || !memberToUpdateStatus || !currentOrg) return null;

  const targetUserId =
    memberToUpdateStatus._id ||
    memberToUpdateStatus.userId?._id ||
    memberToUpdateStatus.userId;

  const memberName = memberToUpdateStatus.user
    ? `${memberToUpdateStatus.user.firstName} ${memberToUpdateStatus.user.lastName}`
    : memberToUpdateStatus.firstName
    ? `${memberToUpdateStatus.firstName} ${memberToUpdateStatus.lastName}`
    : 'Member';

  const isOwner =
    currentOrg.ownerId === targetUserId ||
    memberToUpdateStatus.role === 'owner';

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOwner) {
      setErrorMessage('The Organization Owner cannot be suspended or deactivated. Transfer ownership first.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await apiClient.updateTeamMemberStatus(currentOrg._id, targetUserId, selectedStatus);
      if (res.success) {
        setSuccessMessage(`Member status successfully changed to ${selectedStatus}.`);
        setTimeout(() => {
          setMemberStatusModalOpen(false);
          setMemberToUpdateStatus(null);
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update member status.');
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
              <h5 className="modal-title fw-bold text-dark m-0">Change Member Access Status</h5>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-light rounded-circle p-1"
              onClick={() => {
                setMemberStatusModalOpen(false);
                setMemberToUpdateStatus(null);
              }}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleUpdate}>
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

              {isOwner && (
                <div className="alert alert-warning py-2.5 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2">
                  <ShieldAlert size={16} className="text-warning flex-shrink-0" />
                  <span>
                    <strong>Owner Protection:</strong> This user is the Organization Owner. The owner account cannot be suspended or deactivated.
                  </span>
                </div>
              )}

              <p className="text-muted small mb-3">
                Configure account access state for <strong>{memberName}</strong> in {currentOrg.name}.
              </p>

              <div className="d-flex flex-column gap-2 mb-3">
                <label
                  className={`p-3 rounded-3 border d-flex align-items-start gap-3 cursor-pointer ${
                    selectedStatus === 'active' ? 'bg-success-subtle border-success' : 'bg-light border-light'
                  }`}
                  style={{ cursor: isOwner ? 'not-allowed' : 'pointer' }}
                >
                  <input
                    type="radio"
                    name="status"
                    className="form-check-input mt-1"
                    checked={selectedStatus === 'active'}
                    onChange={() => setSelectedStatus('active')}
                    disabled={isOwner || isSubmitting}
                  />
                  <div>
                    <div className="fw-bold text-success d-flex align-items-center gap-1.5 small">
                      <UserCheck size={15} /> Active
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.74rem' }}>
                      Member has normal access to permitted workspaces, projects, and tasks.
                    </div>
                  </div>
                </label>

                <label
                  className={`p-3 rounded-3 border d-flex align-items-start gap-3 cursor-pointer ${
                    selectedStatus === 'suspended' ? 'bg-warning-subtle border-warning' : 'bg-light border-light'
                  }`}
                  style={{ cursor: isOwner ? 'not-allowed' : 'pointer' }}
                >
                  <input
                    type="radio"
                    name="status"
                    className="form-check-input mt-1"
                    checked={selectedStatus === 'suspended'}
                    onChange={() => setSelectedStatus('suspended')}
                    disabled={isOwner || isSubmitting}
                  />
                  <div>
                    <div className="fw-bold text-warning d-flex align-items-center gap-1.5 small">
                      <PauseCircle size={15} /> Suspended
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.74rem' }}>
                      Temporary lock. Existing sessions are terminated. Access can be restored anytime.
                    </div>
                  </div>
                </label>

                <label
                  className={`p-3 rounded-3 border d-flex align-items-start gap-3 cursor-pointer ${
                    selectedStatus === 'deactivated' ? 'bg-danger-subtle border-danger' : 'bg-light border-light'
                  }`}
                  style={{ cursor: isOwner ? 'not-allowed' : 'pointer' }}
                >
                  <input
                    type="radio"
                    name="status"
                    className="form-check-input mt-1"
                    checked={selectedStatus === 'deactivated'}
                    onChange={() => setSelectedStatus('deactivated')}
                    disabled={isOwner || isSubmitting}
                  />
                  <div>
                    <div className="fw-bold text-danger d-flex align-items-center gap-1.5 small">
                      <UserX size={15} /> Deactivated
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.74rem' }}>
                      Soft-deactivated. Workspace access revoked; task history and audit trail are preserved.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="modal-footer border-top px-4 py-3 bg-light rounded-bottom-4">
              <button
                type="button"
                className="btn btn-outline-secondary px-3 py-2 fw-medium"
                onClick={() => {
                  setMemberStatusModalOpen(false);
                  setMemberToUpdateStatus(null);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary px-4 py-2 fw-semibold"
                style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
                disabled={isOwner || isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Update Status'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

