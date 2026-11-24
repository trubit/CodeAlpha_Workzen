import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client.js';
import { UserPlus, X, Search, Check, AlertCircle, Shield, Users } from 'lucide-react';

interface AddProjectMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  onMembersAdded: () => void;
}

export const AddProjectMemberModal: React.FC<AddProjectMemberModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  onMembersAdded
}) => {
  const [eligibleMembers, setEligibleMembers] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<'contributor' | 'observer' | 'lead'>('contributor');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && projectId) {
      loadEligibleMembers();
      setSelectedIds([]);
      setSearch('');
      setError(null);
    }
  }, [isOpen, projectId]);

  const loadEligibleMembers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.getEligibleOrganisationMembers(projectId);
      if (res.success && res.data?.eligible) {
        setEligibleMembers(res.data.eligible);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load eligible organization members.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredMembers = eligibleMembers.filter(
    (m) =>
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredMembers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMembers.map((m) => m.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) {
      setError('Please select at least one organization member to add.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await apiClient.addProjectMembers(projectId, selectedIds, selectedRole);
      if (res.success) {
        onMembersAdded();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add members to project.');
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
      <div
        className="bg-white rounded-4 shadow-lg border border-slate-200 w-100"
        style={{ maxWidth: 580, maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="p-4 border-bottom d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle p-2.5 d-flex align-items-center justify-content-center"
              style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}
            >
              <UserPlus size={22} />
            </div>
            <div>
              <h5 className="fw-bold text-dark m-0">Add Team Members</h5>
              <p className="text-muted small m-0">Grant access to {projectName}</p>
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
          <div className="p-4 d-flex flex-column gap-3.5">
            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2.5 px-3 rounded-3 m-0 small">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="form-label small fw-semibold text-dark mb-1.5 d-flex align-items-center gap-1.5">
                <Shield size={14} className="text-primary" /> Initial Project Role
              </label>
              <select
                className="form-select form-select-sm rounded-3 py-2"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as any)}
                disabled={isSubmitting}
              >
                <option value="contributor">Contributor (Can create and manage tasks)</option>
                <option value="observer">Observer (Read-only project access)</option>
                <option value="lead">Project Lead (Full administrative access)</option>
              </select>
            </div>

            {/* Member Search */}
            <div>
              <label className="form-label small fw-semibold text-dark mb-1.5 d-flex align-items-center justify-content-between">
                <span>Select Organization Teammates</span>
                {filteredMembers.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-link p-0 text-primary small fw-semibold text-decoration-none"
                    onClick={handleSelectAll}
                  >
                    {selectedIds.length === filteredMembers.length ? 'Deselect All' : 'Select All'}
                  </button>
                )}
              </label>
              <div className="input-group input-group-sm mb-2">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search teammates by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Member Selection List */}
            <div
              className="border rounded-3 p-2 d-flex flex-column gap-1 bg-light"
              style={{ maxHeight: 240, overflowY: 'auto' }}
            >
              {isLoading ? (
                <div className="text-center py-4 text-muted small">Loading available organization teammates...</div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  <Users size={24} className="opacity-40 mb-1 d-block mx-auto" />
                  {search
                    ? 'No matching teammates found.'
                    : 'All active organization members are already in this project.'}
                </div>
              ) : (
                filteredMembers.map((member) => {
                  const isChecked = selectedIds.includes(member.id);
                  return (
                    <div
                      key={member.id}
                      className={`p-2.5 rounded-3 d-flex align-items-center justify-content-between cursor-pointer transition-all ${
                        isChecked ? 'bg-white border shadow-sm' : 'hover-bg-slate'
                      }`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleSelect(member.id)}
                    >
                      <div className="d-flex align-items-center gap-2.5">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold small flex-shrink-0"
                          style={{
                            width: 32,
                            height: 32,
                            backgroundColor: '#4F46E5',
                            fontSize: 12
                          }}
                        >
                          {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="fw-semibold text-dark small">{member.name}</div>
                          <div className="text-muted" style={{ fontSize: 11 }}>
                            {member.email} • {member.orgRole}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`rounded-2 d-flex align-items-center justify-content-center border ${
                          isChecked ? 'bg-primary text-white border-primary' : 'bg-white text-transparent border-slate-300'
                        }`}
                        style={{ width: 20, height: 20 }}
                      >
                        <Check size={13} strokeWidth={3} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="text-muted" style={{ fontSize: 11 }}>
              Selected: <strong>{selectedIds.length}</strong> teammate{selectedIds.length === 1 ? '' : 's'}
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
              disabled={isSubmitting || selectedIds.length === 0}
            >
              {isSubmitting ? 'Adding Members...' : `Add Selected (${selectedIds.length})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

