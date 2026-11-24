import React, { useState } from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { apiClient } from '../../api/client.js';
import { X, Trash2, AlertTriangle, AlertCircle, ShieldAlert } from 'lucide-react';

export const RemoveMemberModal: React.FC = () => {
  const {
    isRemoveMemberModalOpen,
    setRemoveMemberModalOpen,
    memberToRemove,
    setMemberToRemove,
    currentOrg
  } = useWorkzenStore();

  const [confirmationInput, setConfirmationInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    setConfirmationInput('');
    setErrorMessage(null);
  }, [isRemoveMemberModalOpen]);

  if (!isRemoveMemberModalOpen || !memberToRemove || !currentOrg) return null;

  const targetUserId =
    memberToRemove._id ||
    memberToRemove.userId?._id ||
    memberToRemove.userId;

  const memberName = memberToRemove.user
    ? `${memberToRemove.user.firstName} ${memberToRemove.user.lastName}`
    : memberToRemove.firstName
    ? `${memberToRemove.firstName} ${memberToRemove.lastName}`
    : 'Member';

  const isOwner =
    currentOrg.ownerId === targetUserId ||
    memberToRemove.role === 'owner';

  const handleRemove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOwner) {
      setErrorMessage('The Organization Owner cannot be removed. Transfer ownership before leaving.');
      return;
    }

    if (confirmationInput.trim() !== 'REMOVE') {
      setErrorMessage("Please type 'REMOVE' exactly to confirm member eviction.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await apiClient.removeTeamMember(currentOrg._id, targetUserId);
      if (res.success) {
        setRemoveMemberModalOpen(false);
        setMemberToRemove(null);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to remove member.');
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
          <div className="modal-header border-bottom px-4 py-3 bg-danger-subtle rounded-top-4">
            <div className="d-flex align-items-center gap-2">
              <div className="p-2 bg-danger text-white rounded-3">
                <Trash2 size={18} />
              </div>
              <div>
                <h5 className="modal-title fw-bold text-danger m-0">Remove Team Member</h5>
                <span className="text-muted small">Organization: {currentOrg.name}</span>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-light rounded-circle p-1"
              onClick={() => {
                setRemoveMemberModalOpen(false);
                setMemberToRemove(null);
              }}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleRemove}>
            <div className="modal-body px-4 py-3">
              {errorMessage && (
                <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2">
                  <AlertCircle size={16} className="text-danger flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {isOwner ? (
                <div className="alert alert-warning py-3 px-3 small rounded-3 mb-3 d-flex align-items-start gap-2.5">
                  <ShieldAlert size={18} className="text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Protected Owner Invariant:</strong>
                    <div className="mt-1">
                      {memberName} is the designated Organization Owner. The owner cannot be removed. You must first transfer ownership in Organization Settings.
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="alert alert-danger-subtle border border-danger-subtle p-3 rounded-3 mb-3 small text-dark">
                    <div className="fw-bold mb-1 d-flex align-items-center gap-1.5 text-danger">
                      <AlertTriangle size={16} /> Important Notice
                    </div>
                    <div>
                      You are removing <strong>{memberName}</strong> from {currentOrg.name}.
                      This will revoke all organization and workspace memberships immediately.
                      Past project and task contributions will remain preserved in historical audit trails.
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-secondary small">
                      Type <strong>REMOVE</strong> to confirm eviction:
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="REMOVE"
                      value={confirmationInput}
                      onChange={(e) => setConfirmationInput(e.target.value)}
                      disabled={isSubmitting}
                      autoFocus
                    />
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer border-top px-4 py-3 bg-light rounded-bottom-4">
              <button
                type="button"
                className="btn btn-outline-secondary px-3 py-2 fw-medium"
                onClick={() => {
                  setRemoveMemberModalOpen(false);
                  setMemberToRemove(null);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-danger px-4 py-2 fw-semibold"
                disabled={isOwner || confirmationInput.trim() !== 'REMOVE' || isSubmitting}
              >
                {isSubmitting ? 'Evicting...' : 'Confirm Eviction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

