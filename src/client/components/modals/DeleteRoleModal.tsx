import React, { useState } from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { apiClient } from '../../api/client.js';
import { AlertTriangle, AlertCircle, Loader2, Trash2 } from 'lucide-react';

export const DeleteRoleModal: React.FC = () => {
  const {
    isDeleteRoleModalOpen,
    setDeleteRoleModalOpen,
    roleToDelete,
    setRoleToDelete,
    roles,
    setRoles
  } = useWorkzenStore();

  const [confirmName, setConfirmName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isDeleteRoleModalOpen || !roleToDelete) return null;

  const handleClose = () => {
    setConfirmName('');
    setRoleToDelete(null);
    setDeleteRoleModalOpen(false);
    setErrorMessage(null);
  };

  const isNameMatched = confirmName.trim() === roleToDelete.name.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isNameMatched) {
      setErrorMessage('Typed role name does not match.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await apiClient.delete<any>(`/roles/${roleToDelete._id}`, {
        body: JSON.stringify({ confirmName: confirmName.trim() })
      });

      setRoles(roles.filter((r) => r._id !== roleToDelete._id));
      handleClose();
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Failed to delete role. Ensure no active members are assigned to this role.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '540px' }}>
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div className="modal-header border-bottom px-4 py-3 bg-danger-subtle d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2 text-danger">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center bg-danger text-white"
                style={{ width: 34, height: 34 }}
              >
                <AlertTriangle size={18} />
              </div>
              <div>
                <h5 className="modal-title fw-bold m-0" style={{ fontSize: '1.05rem' }}>
                  Delete Custom Role
                </h5>
                <span className="small text-danger-emphasis">
                  Permanent removal from access control matrix
                </span>
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

              <p className="text-secondary small mb-3">
                You are about to permanently delete the custom role{' '}
                <strong className="text-dark">"{roleToDelete.name}"</strong> (
                <span className="font-monospace text-muted">{roleToDelete.slug}</span>).
              </p>

              <div className="p-3 rounded-3 bg-light border mb-3 small text-secondary">
                <div className="fw-semibold text-dark mb-1">Safety Constraints:</div>
                <ul className="mb-0 ps-3">
                  <li>System Default roles can never be deleted.</li>
                  <li>Roles currently assigned to active users cannot be removed.</li>
                  <li>This action cannot be undone.</li>
                </ul>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary mb-1">
                  Type <span className="text-danger fw-bold">{roleToDelete.name}</span> to confirm:
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={roleToDelete.name}
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  autoComplete="off"
                  required
                />
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
                disabled={!isNameMatched || isSubmitting}
                className="btn btn-danger px-4 fw-semibold d-flex align-items-center gap-2 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="spinner-border spinner-border-sm" />
                    <span>Deleting Role...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Delete Role</span>
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
