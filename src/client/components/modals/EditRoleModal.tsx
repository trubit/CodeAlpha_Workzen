import React, { useState, useEffect } from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { apiClient } from '../../api/client.js';
import { PERMISSION_CATALOGUE, PermissionCategory } from '../../../shared/constants/roles.js';
import { Sliders, AlertCircle, Loader2, Save } from 'lucide-react';

export const EditRoleModal: React.FC = () => {
  const {
    isEditRoleModalOpen,
    setEditRoleModalOpen,
    roleToEdit,
    setRoleToEdit,
    roles,
    setRoles
  } = useWorkzenStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (roleToEdit) {
      setName(roleToEdit.name);
      setDescription(roleToEdit.description || '');
      setSelectedPermissions(roleToEdit.permissions || []);
      setErrorMessage(null);
    }
  }, [roleToEdit]);

  if (!isEditRoleModalOpen || !roleToEdit) return null;

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
    setRoleToEdit(null);
    setEditRoleModalOpen(false);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Role name cannot be empty.');
      return;
    }

    if (selectedPermissions.length === 0) {
      setErrorMessage('A role must contain at least one permission grant.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiClient.patch<any>(`/roles/${roleToEdit._id}`, {
        name: name.trim(),
        description: description.trim(),
        permissions: selectedPermissions
      });

      if (res.data) {
        setRoles(roles.map((r) => (r._id === roleToEdit._id ? res.data : r)));
      }

      handleClose();
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Failed to update custom role. Verify delegation permissions.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
                style={{ width: 36, height: 36, backgroundColor: '#4F46E5' }}
              >
                <Sliders size={20} />
              </div>
              <div>
                <h5 className="modal-title fw-bold text-dark m-0" style={{ fontSize: '1.1rem' }}>
                  Edit Role: {roleToEdit.name}
                </h5>
                <span className="text-muted small font-monospace">
                  slug: {roleToEdit.slug} &bull; Scope: {roleToEdit.scope}
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

              {/* Form inputs */}
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary mb-1">
                    Role Display Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control py-2"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary mb-1">
                    Role Scope (Immutable)
                  </label>
                  <input
                    type="text"
                    className="form-control py-2 bg-light text-muted"
                    value={roleToEdit.scope.toUpperCase()}
                    disabled
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-secondary mb-1">
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Permission Matrix */}
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div>
                  <h6 className="fw-bold text-dark m-0">Capability Grants Matrix</h6>
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
                Permissions update immediately for all active members assigned to this role.
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
                  style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="spinner-border spinner-border-sm" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Save Role Changes</span>
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

