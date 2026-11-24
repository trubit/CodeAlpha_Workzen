import React, { useState } from 'react';
import { apiClient } from '../../api/client.js';
import { Shield, X, AlertCircle } from 'lucide-react';

interface UpdateProjectMemberRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  member: {
    id: string;
    name: string;
    email: string;
    role: 'lead' | 'contributor' | 'observer';
    isOwner: boolean;
  } | null;
  onRoleUpdated: () => void;
}

export const UpdateProjectMemberRoleModal: React.FC<UpdateProjectMemberRoleModalProps> = ({
  isOpen,
  onClose,
  projectId,
  member,
  onRoleUpdated
}) => {
  const [role, setRole] = useState<'lead' | 'contributor' | 'observer'>(
    member?.role || 'contributor'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (member) {
      setRole(member.role);
      setError(null);
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (member.isOwner && role !== 'lead') {
      setError('Cannot change role of project owner. Transfer ownership first.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await apiClient.updateProjectMemberRole(projectId, member.id, role);
      if (res.success) {
        onRoleUpdated();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update member role.');
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
      <div className="bg-white rounded-4 shadow-lg border border-slate-200 w-100" style={{ maxWidth: 480 }}>
        {/* Header */}
        <div className="p-4 border-bottom d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle p-2.5 d-flex align-items-center justify-content-center"
              style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}
            >
              <Shield size={22} />
            </div>
            <div>
              <h5 className="fw-bold text-dark m-0">Modify Project Role</h5>
              <p className="text-muted small m-0">{member.name} ({member.email})</p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-4 d-flex flex-column gap-3">
            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 rounded-3 m-0 small">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {member.isOwner && (
              <div className="alert alert-warning py-2.5 px-3 rounded-3 m-0 small">
                <strong>Project Owner</strong>: Role is locked to Lead. To modify, transfer primary project ownership.
              </div>
            )}

            <div className="d-flex flex-column gap-2">
              <label className="form-label small fw-semibold text-dark mb-1">Select Access Role</label>

              {/* Lead Role Option */}
              <label
                className={`p-3 border rounded-3 d-flex align-items-start gap-3 cursor-pointer transition-all ${
                  role === 'lead' ? 'border-primary bg-primary-subtle' : 'border-slate-200 bg-white'
                }`}
                style={{ cursor: member.isOwner ? 'default' : 'pointer' }}
              >
                <input
                  type="radio"
                  name="projectRole"
                  value="lead"
                  checked={role === 'lead'}
                  onChange={() => setRole('lead')}
                  className="mt-1"
                  disabled={member.isOwner}
                />
                <div>
                  <div className="fw-bold text-dark small">Project Lead</div>
                  <div className="text-muted" style={{ fontSize: 12 }}>
                    Full management permissions, member management, roadmap editing, and settings.
                  </div>
                </div>
              </label>

              {/* Contributor Role Option */}
              <label
                className={`p-3 border rounded-3 d-flex align-items-start gap-3 cursor-pointer transition-all ${
                  role === 'contributor' ? 'border-primary bg-primary-subtle' : 'border-slate-200 bg-white'
                }`}
                style={{ cursor: member.isOwner ? 'not-allowed' : 'pointer' }}
              >
                <input
                  type="radio"
                  name="projectRole"
                  value="contributor"
                  checked={role === 'contributor'}
                  onChange={() => setRole('contributor')}
                  className="mt-1"
                  disabled={member.isOwner}
                />
                <div>
                  <div className="fw-bold text-dark small">Contributor</div>
                  <div className="text-muted" style={{ fontSize: 12 }}>
                    Can create, update, and manage tasks, sprints, and deliverables.
                  </div>
                </div>
              </label>

              {/* Observer Role Option */}
              <label
                className={`p-3 border rounded-3 d-flex align-items-start gap-3 cursor-pointer transition-all ${
                  role === 'observer' ? 'border-primary bg-primary-subtle' : 'border-slate-200 bg-white'
                }`}
                style={{ cursor: member.isOwner ? 'not-allowed' : 'pointer' }}
              >
                <input
                  type="radio"
                  name="projectRole"
                  value="observer"
                  checked={role === 'observer'}
                  onChange={() => setRole('observer')}
                  className="mt-1"
                  disabled={member.isOwner}
                />
                <div>
                  <div className="fw-bold text-dark small">Observer</div>
                  <div className="text-muted" style={{ fontSize: 12 }}>
                    Read-only project access. Can view roadmaps, tasks, and velocity metrics.
                  </div>
                </div>
              </label>
            </div>
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
              type="submit"
              className="btn btn-sm btn-primary px-4 py-2 fw-semibold rounded-3 shadow-sm"
              style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
              disabled={isSubmitting || (member.isOwner && role !== 'lead')}
            >
              {isSubmitting ? 'Saving...' : 'Save Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

