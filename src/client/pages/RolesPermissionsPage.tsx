import React, { useState, useEffect } from 'react';
import { useWorkzenStore } from '../store/useWorkzenStore.js';
import { apiClient } from '../api/client.js';
import { PERMISSION_CATALOGUE, PermissionCategory } from '../../shared/constants/roles.js';
import {
  ShieldCheck,
  Plus,
  Search,
  Users,
  Key,
  Shield,
  Layers,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  Lock,
  Filter,
  Sparkles,
  AlertCircle,
  FileText,
  ShieldAlert
} from 'lucide-react';

export const RolesPermissionsPage: React.FC = () => {
  const {
    currentOrg,
    currentWorkspace,
    roles,
    setRoles,
    setCreateRoleModalOpen,
    setEditRoleModalOpen,
    setRoleToEdit,
    setDeleteRoleModalOpen,
    setRoleToDelete,
    setAssignRoleModalOpen,
    setMemberToAssignRole,
    orgMembers
  } = useWorkzenStore();

  const [activeTab, setActiveTab] = useState<'matrix' | 'assignments' | 'catalogue' | 'audit'>('matrix');
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'organization' | 'workspace'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Fetch roles
  const loadRoles = async () => {
    if (!currentOrg?._id || currentOrg._id === 'org_acme') return;
    setIsLoading(true);
    try {
      const res = await apiClient.get<any>(`/organizations/${currentOrg._id}/roles`);
      if (res.data && Array.isArray(res.data)) {
        setRoles(res.data);
      }
    } catch (e) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch audit logs
  const loadAuditLogs = async () => {
    if (!currentOrg?._id || currentOrg._id === 'org_acme') return;
    try {
      const res = await apiClient.get<any>(`/organizations/${currentOrg._id}/roles/audit-logs`);
      if (res.data && Array.isArray(res.data)) {
        setAuditLogs(res.data);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    loadRoles();
    if (activeTab === 'audit') {
      loadAuditLogs();
    }
  }, [currentOrg?._id, activeTab]);

  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesScope =
      scopeFilter === 'all' || role.scope === scopeFilter;
    return matchesSearch && matchesScope;
  });

  const customRolesCount = roles.filter((r) => !r.isSystem).length;

  return (
    <div className="container-fluid p-4" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* 1. Header Banner */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center text-white"
              style={{ width: 34, height: 34, backgroundColor: '#6366F1' }}
            >
              <ShieldCheck size={18} />
            </div>
            <h4 className="fw-bolder text-dark m-0">Roles & Permissions Management</h4>
            <span className="badge bg-light text-primary border small">Access Governance</span>
          </div>
          <p className="text-secondary small mb-0">
            Define granular action permissions, enforce delegation boundaries, and govern access for{' '}
            <strong>{currentOrg?.name || 'Organization'}</strong>.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-primary d-flex align-items-center gap-2 fw-semibold px-3 py-2 rounded-3 shadow-sm"
            style={{ backgroundColor: '#6366F1', borderColor: '#6366F1' }}
            onClick={() => setCreateRoleModalOpen(true)}
          >
            <Plus size={16} />
            <span>Create Custom Role</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="card border rounded-3 p-3 bg-white shadow-xs">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold">Total Roles</span>
              <span className="p-1.5 rounded-2 bg-indigo-subtle text-primary">
                <Shield size={16} />
              </span>
            </div>
            <div className="fs-3 fw-bolder text-dark">{roles.length || 10}</div>
            <div className="text-muted small mt-1">5 Org + 5 Workspace System Roles</div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card border rounded-3 p-3 bg-white shadow-xs">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold">Custom Roles</span>
              <span className="p-1.5 rounded-2 bg-purple-subtle text-purple" style={{ color: '#8B5CF6' }}>
                <Sparkles size={16} />
              </span>
            </div>
            <div className="fs-3 fw-bolder text-dark">{customRolesCount}</div>
            <div className="text-muted small mt-1">Tailored Enterprise Access Grants</div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card border rounded-3 p-3 bg-white shadow-xs">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold">Granular Capabilities</span>
              <span className="p-1.5 rounded-2 bg-success-subtle text-success">
                <Key size={16} />
              </span>
            </div>
            <div className="fs-3 fw-bolder text-dark">{PERMISSION_CATALOGUE.length}</div>
            <div className="text-muted small mt-1">Across 6 Standardized Domains</div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card border rounded-3 p-3 bg-white shadow-xs">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold">Active Members</span>
              <span className="p-1.5 rounded-2 bg-info-subtle text-info">
                <Users size={16} />
              </span>
            </div>
            <div className="fs-3 fw-bolder text-dark">{orgMembers.length || 1}</div>
            <div className="text-muted small mt-1">Protected by Anti-Privilege Escalation</div>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="card border rounded-4 shadow-sm bg-white overflow-hidden">
        <div className="card-header bg-white border-bottom px-4 pt-3 pb-0 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <ul className="nav nav-tabs border-0 flex-nowrap overflow-auto gap-2">
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link border-0 pb-3 fw-semibold small ${
                  activeTab === 'matrix' ? 'text-primary border-bottom border-primary border-2 active' : 'text-secondary'
                }`}
                onClick={() => setActiveTab('matrix')}
              >
                Roles & Capability Matrix
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link border-0 pb-3 fw-semibold small ${
                  activeTab === 'assignments' ? 'text-primary border-bottom border-primary border-2 active' : 'text-secondary'
                }`}
                onClick={() => setActiveTab('assignments')}
              >
                User Role Assignments
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link border-0 pb-3 fw-semibold small ${
                  activeTab === 'catalogue' ? 'text-primary border-bottom border-primary border-2 active' : 'text-secondary'
                }`}
                onClick={() => setActiveTab('catalogue')}
              >
                Permission Catalogue (35)
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link border-0 pb-3 fw-semibold small ${
                  activeTab === 'audit' ? 'text-primary border-bottom border-primary border-2 active' : 'text-secondary'
                }`}
                onClick={() => setActiveTab('audit')}
              >
                Security Audit Trail
              </button>
            </li>
          </ul>

          {/* Search & Filters */}
          {activeTab === 'matrix' && (
            <div className="d-flex align-items-center gap-2 pb-2">
              <div className="input-group input-group-sm" style={{ width: 220 }}>
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Filter roles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="form-select form-select-sm bg-light"
                style={{ width: 140 }}
                value={scopeFilter}
                onChange={(e: any) => setScopeFilter(e.target.value)}
              >
                <option value="all">All Scopes</option>
                <option value="organization">Organization</option>
                <option value="workspace">Workspace</option>
              </select>
            </div>
          )}
        </div>

        {/* 4. Tab 1: Roles & Matrix */}
        {activeTab === 'matrix' && (
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-uppercase text-secondary" style={{ fontSize: '0.72rem' }}>
                  <tr>
                    <th className="ps-4 py-3">Role Name & Slug</th>
                    <th>Scope</th>
                    <th>Role Type</th>
                    <th>Assigned Members</th>
                    <th>Permissions Granted</th>
                    <th className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoles.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-5 text-muted">
                        <ShieldAlert size={36} className="text-muted mb-2 opacity-50" />
                        <div>No roles match the selected filter.</div>
                      </td>
                    </tr>
                  ) : (
                    filteredRoles.map((role) => (
                      <tr key={role._id}>
                        <td className="ps-4 py-3">
                          <div className="fw-bold text-dark">{role.name}</div>
                          <div className="text-muted small font-monospace" style={{ fontSize: '0.75rem' }}>
                            {role.slug}
                          </div>
                          {role.description && (
                            <div className="text-secondary small mt-0.5 text-truncate" style={{ maxWidth: 360, fontSize: '0.74rem' }}>
                              {role.description}
                            </div>
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge rounded-pill small ${
                              role.scope === 'organization' ? 'bg-indigo-subtle text-indigo' : 'bg-info-subtle text-info'
                            }`}
                            style={{
                              backgroundColor: role.scope === 'organization' ? '#EEF2FF' : '#E0F2FE',
                              color: role.scope === 'organization' ? '#4F46E5' : '#0284C7'
                            }}
                          >
                            {role.scope === 'organization' ? 'Organization' : 'Workspace'}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge rounded-pill ${
                              role.isSystem ? 'bg-light text-secondary border' : 'bg-purple-subtle text-purple border'
                            }`}
                            style={{
                              backgroundColor: role.isSystem ? '#F8FAFC' : '#FAF5FF',
                              color: role.isSystem ? '#64748B' : '#7E22CE'
                            }}
                          >
                            {role.isSystem ? 'System Built-In' : 'Custom Role'}
                          </span>
                        </td>
                        <td>
                          <span className="small fw-semibold text-dark">
                            {role.assignedCount || 0} Member(s)
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="progress flex-grow-1" style={{ height: 6, width: 80 }}>
                              <div
                                className="progress-bar"
                                style={{
                                  width: `${Math.round((role.permissions.length / PERMISSION_CATALOGUE.length) * 100)}%`,
                                  backgroundColor: role.isSystem ? '#4F46E5' : '#8B5CF6'
                                }}
                              />
                            </div>
                            <span className="small text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
                              {role.permissions.length}/{PERMISSION_CATALOGUE.length}
                            </span>
                          </div>
                        </td>
                        <td className="text-end pe-4">
                          <div className="d-inline-flex gap-1">
                            {!role.isSystem && (
                              <>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-light border p-1.5 text-secondary hover-bg-light"
                                  title="Edit Custom Role"
                                  onClick={() => {
                                    setRoleToEdit(role);
                                    setEditRoleModalOpen(true);
                                  }}
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-light border p-1.5 text-danger hover-bg-danger-subtle"
                                  title="Delete Custom Role"
                                  onClick={() => {
                                    setRoleToDelete(role);
                                    setDeleteRoleModalOpen(true);
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                            {role.isSystem && (
                              <span className="badge bg-light text-muted border small" style={{ fontSize: '0.68rem' }}>
                                Protected
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. Tab 2: User Role Assignments */}
        {activeTab === 'assignments' && (
          <div className="card-body p-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h6 className="fw-bold text-dark m-0">Member Role Assignments</h6>
                <span className="text-muted small">
                  Assign enterprise roles to team members. Protected against self-promotion.
                </span>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-uppercase text-secondary" style={{ fontSize: '0.72rem' }}>
                  <tr>
                    <th className="ps-3 py-3">Member</th>
                    <th>Primary Org Role</th>
                    <th>Status</th>
                    <th className="text-end pe-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orgMembers.map((member: any) => {
                    const mName = member.user
                      ? `${member.user.firstName} ${member.user.lastName}`
                      : member.firstName
                      ? `${member.firstName} ${member.lastName}`
                      : 'Active User';
                    const mEmail = member.user?.email || member.email || '';
                    const mRole = member.role || 'member';

                    return (
                      <tr key={member._id || member.userId}>
                        <td className="ps-3 py-3">
                          <div className="d-flex align-items-center gap-2.5">
                            <div
                              className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center"
                              style={{ width: 34, height: 34, backgroundColor: '#4F46E5', fontSize: '0.75rem' }}
                            >
                              {mName.charAt(0)}
                            </div>
                            <div>
                              <div className="fw-semibold text-dark small">{mName}</div>
                              <div className="text-muted small font-monospace" style={{ fontSize: '0.72rem' }}>
                                {mEmail}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-primary-subtle text-primary border text-capitalize small">
                            {mRole}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-success-subtle text-success border small">
                            Active
                          </span>
                        </td>
                        <td className="text-end pe-3">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary px-3 rounded-2 fw-semibold"
                            onClick={() => {
                              setMemberToAssignRole(member);
                              setAssignRoleModalOpen(true);
                            }}
                          >
                            Assign Role
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. Tab 3: Permission Catalogue */}
        {activeTab === 'catalogue' && (
          <div className="card-body p-4">
            <div className="mb-4">
              <h6 className="fw-bold text-dark m-0">Standardized Permission Catalogue (35 Granular Grants)</h6>
              <span className="text-muted small">
                Every API endpoint in WORKZEN validates these actions server-side.
              </span>
            </div>

            <div className="row g-4">
              {[
                { cat: 'Organization', color: '#6366F1' },
                { cat: 'Workspace', color: '#0EA5E9' },
                { cat: 'Projects', color: '#8B5CF6' },
                { cat: 'Tasks', color: '#10B981' },
                { cat: 'Collaboration', color: '#F59E0B' },
                { cat: 'Reports', color: '#14B8A6' }
              ].map(({ cat, color }) => {
                const perms = PERMISSION_CATALOGUE.filter((p) => p.category === cat);
                return (
                  <div key={cat} className="col-md-6 col-xl-4">
                    <div className="card h-100 border rounded-3 shadow-none bg-light">
                      <div className="card-header bg-white border-bottom py-2.5 px-3 d-flex align-items-center justify-content-between">
                        <span className="fw-bold small" style={{ color }}>
                          {cat} Domain ({perms.length})
                        </span>
                        <span className="badge bg-light text-secondary border small">
                          Protected
                        </span>
                      </div>
                      <div className="card-body p-3 d-flex flex-column gap-2">
                        {perms.map((p) => (
                          <div key={p.key} className="p-2 bg-white rounded-2 border">
                            <div className="fw-semibold text-dark small" style={{ fontSize: '0.82rem' }}>
                              {p.name}
                            </div>
                            <div className="text-muted small mb-1" style={{ fontSize: '0.72rem' }}>
                              {p.description}
                            </div>
                            <span className="font-monospace text-primary bg-light px-1.5 py-0.5 rounded" style={{ fontSize: '0.68rem' }}>
                              {p.key}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 7. Tab 4: Security Audit Trail */}
        {activeTab === 'audit' && (
          <div className="card-body p-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h6 className="fw-bold text-dark m-0">Role & Permission Audit Trail</h6>
                <span className="text-muted small">
                  Immutable record of role definitions, updates, member delegations, and access changes.
                </span>
              </div>
            </div>

            {auditLogs.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <FileText size={36} className="text-muted mb-2 opacity-50" />
                <div>No audit events recorded yet for this organization.</div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-uppercase text-secondary" style={{ fontSize: '0.72rem' }}>
                    <tr>
                      <th className="ps-3 py-3">Timestamp</th>
                      <th>Actor</th>
                      <th>Action</th>
                      <th>Target Resource</th>
                      <th>IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log: any) => (
                      <tr key={log._id}>
                        <td className="ps-3 py-2.5 text-muted small font-monospace">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="small fw-semibold text-dark">
                          {log.userEmail || 'System'}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              log.action === 'ACCESS_DENIED'
                                ? 'bg-danger-subtle text-danger border'
                                : 'bg-primary-subtle text-primary border'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="font-monospace small text-muted">
                          {log.entityType} ({log.entityId})
                        </td>
                        <td className="small text-muted font-monospace">
                          {log.ipAddress || '127.0.0.1'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
