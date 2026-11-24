import React, { useState } from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { apiClient } from '../../api/client.js';
import { PERMISSION_CATALOGUE, PermissionCategory } from '../../../shared/constants/roles.js';
import { ShieldCheck, X, AlertCircle, Check, Loader2, Sparkles } from 'lucide-react';

export const CreateRoleModal: React.FC = () => {
  const {
    isCreateRoleModalOpen,
    setCreateRoleModalOpen,
    currentOrg,
    currentWorkspace,
    roles,
    setRoles
  } = useWorkzenStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scope, setScope] = useState<'organization' | 'workspace'>('organization');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isCreateRoleModalOpen) return null;

  // Group permissions by category
  const categories: Record<PermissionCategory, typeof PERMISSION_CATALOGUE> = {
    Organization: [],
    Workspace: [],
    Projects: [],
    Tasks: [],
    Collaboration: [],
    Reports: []
  };

  PERMISSION_CATALOGUE.forEach((p) => {
    categories[p.category].push(p);
  });

  const togglePermission = (key: string) => {
    if (selectedPermissions.includes(key)) {
      setSelectedPermissions(selectedPermissions.filter((k) => k !== key));
    } else {
      setSelectedPermissions([...selectedPermissions, key]);
    }
  };

  const toggleCategory = (cat: PermissionCategory) => {
    const catKeys = categories[cat].map((p) => p.key);
    const allSelected = catKeys.every((k) => selectedPermissions.includes(k));

    if (allSelected) {
      setSelectedPermissions(selectedPermissions.filter((k) => !catKeys.includes(k)));
    } else {
      const merged = new Set([...selectedPermissions, ...catKeys]);
      setSelectedPermissions(Array.from(merged));
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setSelectedPermissions([]);
    setErrorMessage(null);
    setCreateRoleModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please provide a role name.');
      return;
    }

    if (selectedPermissions.length === 0) {
      setErrorMessage('A role must contain at least one permission grant.');
      return;
    }

    if (!currentOrg?._id) {
      setErrorMessage('No active organization selected.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        name: name.trim(),
        description: description.trim(),
        scope,
        permissions: selectedPermissions
      };

      if (scope === 'workspace' && currentWorkspace?._id) {
        payload.workspaceId = currentWorkspace._id;
      }

      const res = await apiClient.post<any>(
        `/organizations/${currentOrg._id}/roles`,
        payload
      );

      if (res.data) {
        setRoles([...roles, res.data]);
      }

      handleClose();
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Failed to create custom role. Verify delegation permissions.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatedSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1050 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg" style={{ maxWidth: '840px' }}>
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div className="modal-header border-bottom px-4 py-3 bg-white d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center text-white"
                style={{ width: 36, height: 36, backgroundColor: '#6366F1' }}
              >
                <ShieldCheck size={20} />
              </div>
              <div>
                <h5 className="modal-title fw-bold text-dark m-0" style={{ fontSize: '1.1rem' }}>
                  Create Custom Role
                </h5>
                <span className="text-muted small">
                  Define specialized capability grants within {currentOrg?.name || 'Organization'}
                </span>
              </div>
            </div>
            <button type="button" className="btn-close" onClick={handleClose} disabled={isSubmitting} />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4 overflow-auto" style={{ maxHeight: '72vh' }}>
              {errorMessage && (
                <div className="alert alert-danger d-flex align-items-center gap-2 small py-2 rounded-3 mb-3">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Basic Fields */}
              <div className="row g-3 mb-4">
                <div className="col-md-7">
                  <label className="form-label small fw-semibold text-secondary mb-1">
                    Role Display Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control py-2"
                    placeholder="e.g. Quality Assurance Lead"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  {name && (
                    <div className="text-muted small mt-1 font-monospace" style={{ fontSize: '0.75rem' }}>
                      Slug identifier: <span className="text-primary fw-semibold">{generatedSlug}</span>
                    </div>
                  )}
                </div>

                <div className="col-md-5">
                  <label className="form-label small fw-semibold text-secondary mb-1">
                    Authority Scope <span className="text-danger">*</span>
                  </label>
                  <div className="btn-group w-100" role="group">
                    <button
                      type="button"
                      className={`btn btn-sm py-2 ${
                        scope === 'organization' ? 'btn-primary' : 'btn-outline-secondary'
                      }`}
                      onClick={() => setScope('organization')}
                    >
                      Organization Scope
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm py-2 ${
                        scope === 'workspace' ? 'btn-primary' : 'btn-outline-secondary'
                      }`}
                      onClick={() => setScope('workspace')}
                    >
                      Workspace Scope
                    </button>
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-secondary mb-1">
                    Description & Purpose
                  </label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Describe the operational responsibilities and access boundaries of this role..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Permission Matrix */}
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div>
                  <h6 className="fw-bold text-dark m-0">Granular Capability Matrix</h6>
                  <span className="text-muted small">
                    Selected: {selectedPermissions.length} / {PERMISSION_CATALOGUE.length} permissions
                  </span>
                </div>
                <div className="badge bg-light text-primary border small">
                  Anti-Privilege Escalation Enforced
                </div>
              </div>

              <div className="row g-3">
                {(Object.keys(categories) as PermissionCategory[]).map((cat) => {
                  const items = categories[cat];
                  const allCatSelected = items.every((p) => selectedPermissions.includes(p.key));

                  return (
                    <div key={cat} className="col-md-6">
                      <div className="card h-100 border rounded-3 shadow-none bg-light">
                        <div className="card-header bg-white border-bottom py-2 px-3 d-flex align-items-center justify-content-between">
                          <span className="fw-bold small text-dark">{cat} Domain</span>
                          <button
                            type="button"
                            className="btn btn-sm btn-link p-0 text-decoration-none small"
                            style={{ fontSize: '0.78rem' }}
                            onClick={() => toggleCategory(cat)}
                          >
                            {allCatSelected ? 'Deselect All' : 'Select All'}
                          </button>
                        </div>
                        <div className="card-body p-2.5">
                          <div className="d-flex flex-column gap-2">
                            {items.map((perm) => {
                              const isChecked = selectedPermissions.includes(perm.key);
                              return (
                                <label
                                  key={perm.key}
                                  className={`d-flex align-items-start gap-2 p-2 rounded-2 border transition-all cursor-pointer ${
                                    isChecked ? 'bg-white border-primary shadow-xs' : 'bg-transparent border-transparent'
                                  }`}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <input
                                    type="checkbox"
                                    className="form-check-input mt-0.5 flex-shrink-0"
                                    checked={isChecked}
                                    onChange={() => togglePermission(perm.key)}
                                  />
                                  <div className="overflow-hidden">
                                    <div className="fw-semibold text-dark small" style={{ fontSize: '0.82rem' }}>
                                      {perm.name}
                                    </div>
                                    <div className="text-muted small text-truncate" style={{ fontSize: '0.72rem' }}>
                                      {perm.description}
                                    </div>
                                    <span className="font-monospace text-muted" style={{ fontSize: '0.68rem' }}>
                                      {perm.key}
                                    </span>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer border-top px-4 py-3 bg-light d-flex justify-content-between">
              <span className="text-muted small" style={{ fontSize: '0.76rem' }}>
                Actions are logged in the immutable security audit trail.
              </span>
              <div className="d-flex gap-2">
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
                  disabled={isSubmitting}
                  className="btn btn-primary px-4 fw-semibold d-flex align-items-center gap-2"
                  style={{ backgroundColor: '#6366F1', borderColor: '#6366F1' }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="spinner-border spinner-border-sm" />
                      <span>Creating Role...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Create Role</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

