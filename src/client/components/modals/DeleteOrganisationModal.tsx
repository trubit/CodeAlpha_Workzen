import React, { useState } from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { apiClient } from '../../api/client.js';
import { Trash2, X, AlertTriangle, AlertCircle } from 'lucide-react';

export const DeleteOrganisationModal: React.FC = () => {
  const {
    isDeleteOrgModalOpen,
    setDeleteOrgModalOpen,
    currentOrg,
    organisations,
    setOrganisations,
    setCurrentOrg,
    setActiveView
  } = useWorkzenStore();

  const [confirmName, setConfirmName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isDeleteOrgModalOpen || !currentOrg) return null;

  const isMatch = confirmName.trim().toLowerCase() === currentOrg.name.trim().toLowerCase();

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMatch) {
      setError(`Confirmation name does not match '${currentOrg.name}'.`);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await apiClient.deleteOrganisation(currentOrg._id, confirmName.trim());
      if (res.success) {
        const remaining = organisations.filter((o) => o._id !== currentOrg._id);
        setOrganisations(remaining);

        if (remaining.length > 0) {
          setCurrentOrg(remaining[0]);
          setActiveView('org_dashboard');
        } else {
          setActiveView('org_onboarding');
        }

        setDeleteOrgModalOpen(false);
        setConfirmName('');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to archive organization');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        zIndex: 1050,
        backdropFilter: 'blur(4px)'
      }}
    >
      <div className="bg-white rounded-4 shadow-lg border border-danger w-100" style={{ maxWidth: 520 }}>
        {/* Header */}
        <div className="p-4 border-bottom border-danger-subtle d-flex align-items-center justify-content-between bg-danger-subtle rounded-top-4">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center text-white shadow-sm"
              style={{ width: 44, height: 44, backgroundColor: '#EF4444' }}
            >
              <Trash2 size={22} />
            </div>
            <div>
              <h5 className="fw-bold text-danger m-0">Archive & Delete Organization</h5>
              <p className="text-secondary small m-0">{currentOrg.name}</p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-light rounded-circle p-2"
            onClick={() => setDeleteOrgModalOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleDelete} className="p-4 d-flex flex-column gap-3">
          <div className="alert alert-danger py-2.5 px-3 small rounded-3 m-0 d-flex gap-2">
            <AlertTriangle size={18} className="flex-shrink-0 text-danger" />
            <div>
              <strong>Destructive Action:</strong> Archiving will disable all active operational workspaces
              within <strong>{currentOrg.name}</strong>. Members will lose access to projects and tasks.
            </div>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small rounded-3 m-0">
              <AlertCircle size={16} className="text-danger flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="form-label small fw-semibold text-dark mb-1">
              To confirm, type <strong className="text-dark">"{currentOrg.name}"</strong> below:
            </label>
            <input
              type="text"
              className="form-control"
              placeholder={currentOrg.name}
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="d-flex justify-content-end gap-2 pt-3 border-top mt-2">
            <button
              type="button"
              className="btn btn-light text-secondary fw-medium px-4 rounded-3"
              onClick={() => setDeleteOrgModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-danger fw-semibold px-4 rounded-3 shadow-sm"
              disabled={isLoading || !isMatch}
            >
              {isLoading ? 'Archiving...' : 'I understand, delete this organization'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

