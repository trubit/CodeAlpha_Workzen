import React, { useState } from 'react';
import { apiClient } from '../../api/client.js';
import { UserMinus, X, AlertTriangle, AlertCircle } from 'lucide-react';

interface RemoveProjectMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  member: {
    id: string;
    name: string;
    email: string;
    isOwner: boolean;
  } | null;
  onMemberRemoved: () => void;
}

export const RemoveProjectMemberModal: React.FC<RemoveProjectMemberModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  member,
  onMemberRemoved
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !member) return null;

  const handleConfirm = async () => {
    if (member.isOwner) {
      setError('Cannot remove the project owner. Please transfer ownership first.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await apiClient.removeProjectMember(projectId, member.id);
      if (res.success) {
        onMemberRemoved();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to remove member from project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        zIndex: 1055,
        backdropFilter: 'blur(4px)'
      }}
    >
      <div className="bg-white rounded-4 shadow-lg border border-slate-200 w-100" style={{ maxWidth: 460 }}>
        {/* Header */}
        <div className="p-4 border-bottom d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle p-2.5 d-flex align-items-center justify-content-center"
              style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}
            >
              <UserMinus size={22} />
            </div>
            <div>
              <h5 className="fw-bold text-dark m-0">Remove Project Member</h5>
              <p className="text-muted small m-0">{projectName}</p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-link text-muted p-1"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 d-flex flex-column gap-3">
          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 rounded-3 m-0 small">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="d-flex align-items-start gap-3 p-3 rounded-3 bg-light border">
            <AlertTriangle size={24} className="text-warning flex-shrink-0 mt-0.5" />
            <div className="small text-secondary">
              Are you sure you want to remove <strong>{member.name}</strong> ({member.email}) from this project?
            </div>
          </div>

          <p className="text-muted small m-0">
            Removing this user will revoke their access to this project's tasks, roadmaps, and sprint board.
            Their global account, organization membership, and historical deliverables will remain intact.
          </p>
        </div>

        {/* Footer */}
        <div className="p-3 bg-light border-top rounded-bottom-4 d-flex align-items-center justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary px-3 py-2 fw-medium rounded-3"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-sm btn-danger px-4 py-2 fw-semibold rounded-3 shadow-sm"
            onClick={handleConfirm}
            disabled={isSubmitting || member.isOwner}
          >
            {isSubmitting ? 'Removing...' : 'Confirm Removal'}
          </button>
        </div>
      </div>
    </div>
  );
};

