import React, { useState, useEffect } from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { apiClient } from '../../api/client.js';
import { ShieldAlert, X, AlertCircle, CheckCircle2 } from 'lucide-react';

export const TransferOwnershipModal: React.FC = () => {
  const {
    isTransferOwnershipModalOpen,
    setTransferOwnershipModalOpen,
    currentOrg,
    setCurrentOrg,
    currentUser
  } = useWorkzenStore();

  const [members, setMembers] = useState<any[]>([]);
  const [selectedNewOwnerId, setSelectedNewOwnerId] = useState('');
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isTransferOwnershipModalOpen && currentOrg?._id) {
      setError(null);
      setSuccess(null);
      setConfirmationInput('');
      apiClient
        .listOrganisationMembers(currentOrg._id)
        .then((res) => {
          if (res.success && res.data?.members) {
            // Filter out current owner
            const eligible = res.data.members.filter(
              (m: any) => m.userId !== currentUser?._id && m.userId !== currentOrg.ownerId
            );
            setMembers(eligible);
            if (eligible.length > 0) {
              setSelectedNewOwnerId(eligible[0].userId);
            }
          }
        })
        .catch((err) => {
          setError(err.message || 'Failed to load organization members');
        });
    }
  }, [isTransferOwnershipModalOpen, currentOrg, currentUser]);

  if (!isTransferOwnershipModalOpen || !currentOrg) return null;

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (confirmationInput.trim() !== 'TRANSFER') {
      setError("Please type 'TRANSFER' exactly to confirm this action.");
      return;
    }

    if (!selectedNewOwnerId) {
      setError('Please select an active member to receive ownership.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiClient.transferOrganisationOwnership(currentOrg._id, selectedNewOwnerId);
      if (res.success) {
        setSuccess('Ownership transferred successfully!');
        if (res.data?.organisation) {
          setCurrentOrg(res.data.organisation);
        }
        setTimeout(() => {
          setTransferOwnershipModalOpen(false);
          setSuccess(null);
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to transfer ownership');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        zIndex: 1050,
        backdropFilter: 'blur(4px)'
      }}
    >
      <div className="bg-white rounded-4 shadow-lg border border-slate-200 w-100" style={{ maxWidth: 520 }}>
        {/* Header */}
        <div className="p-4 border-bottom d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center text-white shadow-sm"
              style={{ width: 44, height: 44, backgroundColor: '#F59E0B' }}
            >
              <ShieldAlert size={22} />
            </div>
            <div>
              <h5 className="fw-bold text-dark m-0">Transfer Ownership</h5>
              <p className="text-muted small m-0">{currentOrg.name}</p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-light rounded-circle p-2"
            onClick={() => setTransferOwnershipModalOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleTransfer} className="p-4 d-flex flex-column gap-3">
          <div className="alert alert-warning py-2.5 px-3 small rounded-3 m-0 d-flex gap-2">
            <ShieldAlert size={18} className="flex-shrink-0 text-warning" />
            <div>
              <strong>Warning:</strong> Transferring organization ownership is an irreversible administrative
              action. The recipient will become the sole owner, and your role will be adjusted to Administrator.
            </div>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small rounded-3 m-0">
              <AlertCircle size={16} className="text-danger flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 small rounded-3 m-0">
              <CheckCircle2 size={16} className="text-success flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div>
            <label className="form-label small fw-semibold text-dark mb-1">Select New Owner</label>
            {members.length === 0 ? (
              <p className="text-muted small p-2 border rounded-3 bg-light m-0">
                No other active members found in this organization. Invite teammates before transferring ownership.
              </p>
            ) : (
              <select
                className="form-select"
                value={selectedNewOwnerId}
                onChange={(e) => setSelectedNewOwnerId(e.target.value)}
                disabled={isLoading}
              >
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.name} ({m.email}) &bull; {m.role}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="form-label small fw-semibold text-dark mb-1">
              Type <code className="text-danger fw-bold">TRANSFER</code> to confirm:
            </label>
            <input
              type="text"
              className="form-control font-monospace"
              placeholder="TRANSFER"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              disabled={isLoading || members.length === 0}
            />
          </div>

          <div className="d-flex justify-content-end gap-2 pt-3 border-top mt-2">
            <button
              type="button"
              className="btn btn-light text-secondary fw-medium px-4 rounded-3"
              onClick={() => setTransferOwnershipModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-warning text-dark fw-semibold px-4 rounded-3 shadow-sm"
              disabled={isLoading || members.length === 0 || confirmationInput.trim() !== 'TRANSFER'}
            >
              {isLoading ? 'Transferring...' : 'Confirm Ownership Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

