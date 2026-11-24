import React, { useState, useEffect } from 'react';
import { useWorkzenStore } from '../store/useWorkzenStore.js';
import { apiClient } from '../api/client.js';
import { ORG_ROLES } from '../../shared/constants/roles.js';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  MoreVertical,
  Mail,
  Calendar,
  Layers,
  Clock,
  RotateCw,
  XCircle,
  Eye,
  CheckCircle,
  AlertCircle,
  UserCheck,
  UserX,
  History,
  Filter
} from 'lucide-react';

import { InviteMemberModal } from '../components/modals/InviteMemberModal.js';
import { ManageMemberWorkspacesModal } from '../components/modals/ManageMemberWorkspacesModal.js';
import { UpdateMemberStatusModal } from '../components/modals/UpdateMemberStatusModal.js';
import { RemoveMemberModal } from '../components/modals/RemoveMemberModal.js';
import { MemberDetailsDrawer } from '../components/modals/MemberDetailsDrawer.js';
import { AssignRoleModal } from '../components/modals/AssignRoleModal.js';

export const TeamManagementPage: React.FC = () => {
  const {
    currentOrg,
    currentUser,
    setInviteMemberModalOpen,
    isInviteMemberModalOpen,
    isManageWorkspacesModalOpen,
    setManageWorkspacesModalOpen,
    setMemberToManageWorkspaces,
    isMemberStatusModalOpen,
    setMemberStatusModalOpen,
    setMemberToUpdateStatus,
    isRemoveMemberModalOpen,
    setRemoveMemberModalOpen,
    setMemberToRemove,
    isMemberDetailsDrawerOpen,
    setMemberDetailsDrawerOpen,
    setSelectedMemberDetails,
    isAssignRoleModalOpen,
    setAssignRoleModalOpen,
    setMemberToAssignRole
  } = useWorkzenStore();

  const [activeTab, setActiveTab] = useState<'directory' | 'invitations' | 'audit'>('directory');
  const [members, setMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [workspaces, setWorkspaces] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [workspaceFilter, setWorkspaceFilter] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchMembers = () => {
    if (!currentOrg?._id) return;
    setIsLoading(true);
    apiClient
      .listTeamMembers(currentOrg._id, {
        search: search.trim() || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        workspaceId: workspaceFilter || undefined
      })
      .then((res) => {
        if (res.success && res.data) {
          setMembers(res.data);
        }
      })
      .catch((err: any) => {
        setActionError(err.message || 'Failed to load team members');
      })
      .finally(() => setIsLoading(false));
  };

  const fetchInvitations = () => {
    if (!currentOrg?._id) return;
    apiClient
      .listTeamInvitations(currentOrg._id)
      .then((res) => {
        if (res.success && res.data) {
          setInvitations(res.data);
        }
      })
      .catch(() => {});
  };

  const fetchAuditLogs = () => {
    if (!currentOrg?._id) return;
    apiClient
      .getTeamAuditHistory(currentOrg._id, 30)
      .then((res) => {
        if (res.success && res.data) {
          setAuditLogs(res.data);
        }
      })
      .catch(() => {});
  };

  const fetchWorkspaces = () => {
    if (!currentOrg?._id) return;
    apiClient
      .listWorkspaces(currentOrg._id)
      .then((res) => {
        if (res.success && res.data) {
          setWorkspaces(res.data);
        }
      })
      .catch(() => {});
  };

  // Initial load & when filters change
  useEffect(() => {
    if (currentOrg?._id) {
      fetchMembers();
      fetchInvitations();
      fetchAuditLogs();
      fetchWorkspaces();
    }
  }, [currentOrg?._id, search, roleFilter, statusFilter, workspaceFilter]);

  // Refresh when modals close
  useEffect(() => {
    if (!isInviteMemberModalOpen && !isManageWorkspacesModalOpen && !isMemberStatusModalOpen && !isRemoveMemberModalOpen && !isAssignRoleModalOpen) {
      if (currentOrg?._id) {
        fetchMembers();
        fetchInvitations();
        fetchAuditLogs();
      }
    }
  }, [isInviteMemberModalOpen, isManageWorkspacesModalOpen, isMemberStatusModalOpen, isRemoveMemberModalOpen, isAssignRoleModalOpen]);

  const handleResendInvite = async (invitationId: string) => {
    if (!currentOrg?._id) return;
    setActionSuccess(null);
    setActionError(null);
    try {
      const res = await apiClient.resendTeamInvitation(currentOrg._id, invitationId);
      if (res.success) {
        setActionSuccess('Invitation refreshed and dispatched successfully.');
        fetchInvitations();
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to resend invitation.');
    }
  };

  const handleCancelInvite = async (invitationId: string) => {
    if (!currentOrg?._id) return;
    setActionSuccess(null);
    setActionError(null);
    try {
      const res = await apiClient.cancelTeamInvitation(currentOrg._id, invitationId);
      if (res.success) {
        setActionSuccess('Invitation has been cancelled and revoked.');
        fetchInvitations();
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to cancel invitation.');
    }
  };

  if (!currentOrg) {
    return (
      <div className="wz-card p-5 text-center">
        <Users size={48} className="text-muted mb-3" />
        <h4 className="fw-bold text-dark">No Organization Selected</h4>
        <p className="text-muted small">Please select an organization from the top bar to manage team members.</p>
      </div>
    );
  }

  const activeMembersCount = members.filter((m) => m.status === 'active').length;
  const pendingCount = invitations.filter((i) => i.status === 'pending').length;
  const seatsUsed = members.length;
  const seatsTotal = currentOrg.seats || 25;

  return (
    <div className="d-flex flex-column gap-4 pb-5">
      {/* Top Banner & Action */}
      <div className="wz-card p-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <span className="badge bg-indigo-subtle text-primary border border-primary-subtle px-2.5 py-1 mb-1.5 fw-semibold">
            {currentOrg.name} &bull; Enterprise Tenancy
          </span>
          <h3 className="fw-bold m-0 text-dark">Team Management</h3>
          <p className="text-muted small m-0 mt-0.5">
            Manage authenticated members, cryptographic email invitations, workspace boundaries, and role permissions.
          </p>
        </div>

        <button
          className="btn btn-primary d-flex align-items-center gap-1.5 fw-semibold rounded-3 px-3.5 py-2 shadow-sm"
          style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
          onClick={() => setInviteMemberModalOpen(true)}
        >
          <UserPlus size={16} /> Invite Team Member
        </button>
      </div>

      {/* Notifications / Alerts */}
      {actionSuccess && (
        <div className="alert alert-success py-2.5 px-3 small rounded-3 d-flex align-items-center justify-content-between m-0">
          <div className="d-flex align-items-center gap-2">
            <CheckCircle size={16} className="text-success flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button type="button" className="btn-close" onClick={() => setActionSuccess(null)} />
        </div>
      )}

      {actionError && (
        <div className="alert alert-danger py-2.5 px-3 small rounded-3 d-flex align-items-center justify-content-between m-0">
          <div className="d-flex align-items-center gap-2">
            <AlertCircle size={16} className="text-danger flex-shrink-0" />
            <span>{actionError}</span>
          </div>
          <button type="button" className="btn-close" onClick={() => setActionError(null)} />
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="row g-3">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="wz-card p-3.5 h-100">
            <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.72rem' }}>
              Active Members
            </div>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <span className="fs-3 fw-bold text-dark">{activeMembersCount}</span>
              <span className="text-muted small">verified</span>
            </div>
            <div className="text-muted" style={{ fontSize: '0.74rem', marginTop: 4 }}>
              Active organization access
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="wz-card p-3.5 h-100">
            <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.72rem' }}>
              Pending Invitations
            </div>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <span className="fs-3 fw-bold text-warning">{pendingCount}</span>
              <span className="text-muted small">awaiting</span>
            </div>
            <div className="text-muted" style={{ fontSize: '0.74rem', marginTop: 4 }}>
              Invitations valid for 7 days
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="wz-card p-3.5 h-100">
            <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.72rem' }}>
              Workspaces Available
            </div>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <span className="fs-3 fw-bold text-primary">{workspaces.length}</span>
              <span className="text-muted small">active</span>
            </div>
            <div className="text-muted" style={{ fontSize: '0.74rem', marginTop: 4 }}>
              Dedicated team workspaces
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="wz-card p-3.5 h-100">
            <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.72rem' }}>
              Seat Allocation
            </div>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <span className="fs-3 fw-bold text-dark">{seatsUsed}</span>
              <span className="text-muted small">/ {seatsTotal} seats</span>
            </div>
            <div className="progress mt-2" style={{ height: 6 }}>
              <div
                className="progress-bar bg-primary"
                style={{ width: `${Math.min(100, Math.round((seatsUsed / seatsTotal) * 100))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="d-flex gap-2 border-bottom pb-2">
        <button
          type="button"
          className={`btn btn-sm px-3.5 py-2 fw-semibold rounded-3 d-flex align-items-center gap-2 ${
            activeTab === 'directory' ? 'btn-primary shadow-sm' : 'btn-light border text-secondary'
          }`}
          style={activeTab === 'directory' ? { backgroundColor: '#4F46E5', borderColor: '#4F46E5' } : {}}
          onClick={() => setActiveTab('directory')}
        >
          <Users size={16} /> Directory ({members.length})
        </button>

        <button
          type="button"
          className={`btn btn-sm px-3.5 py-2 fw-semibold rounded-3 d-flex align-items-center gap-2 ${
            activeTab === 'invitations' ? 'btn-primary shadow-sm' : 'btn-light border text-secondary'
          }`}
          style={activeTab === 'invitations' ? { backgroundColor: '#4F46E5', borderColor: '#4F46E5' } : {}}
          onClick={() => setActiveTab('invitations')}
        >
          <Mail size={16} /> Pending Invitations ({pendingCount})
        </button>

        <button
          type="button"
          className={`btn btn-sm px-3.5 py-2 fw-semibold rounded-3 d-flex align-items-center gap-2 ${
            activeTab === 'audit' ? 'btn-primary shadow-sm' : 'btn-light border text-secondary'
          }`}
          style={activeTab === 'audit' ? { backgroundColor: '#4F46E5', borderColor: '#4F46E5' } : {}}
          onClick={() => setActiveTab('audit')}
        >
          <History size={16} /> Team Audit History
        </button>
      </div>

      {/* TAB 1: Member Directory */}
      {activeTab === 'directory' && (
        <div className="wz-card p-0 overflow-hidden">
          {/* Search and Filters Toolbar */}
          <div className="p-3 border-bottom bg-light d-flex flex-wrap align-items-center justify-content-between gap-2.5">
            <div className="d-flex flex-wrap align-items-center gap-2 flex-grow-1" style={{ maxWidth: 700 }}>
              {/* Search */}
              <div className="position-relative flex-grow-1" style={{ minWidth: 220 }}>
                <Search size={15} className="position-absolute text-muted" style={{ top: 10, left: 12 }} />
                <input
                  type="text"
                  className="form-control form-control-sm ps-5 bg-white border"
                  placeholder="Filter by name or corporate email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Role Filter */}
              <select
                className="form-select form-select-sm"
                style={{ width: 140 }}
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value={ORG_ROLES.OWNER}>Owner</option>
                <option value={ORG_ROLES.ADMIN}>Admin</option>
                <option value={ORG_ROLES.MANAGER}>Manager</option>
                <option value={ORG_ROLES.MEMBER}>Member</option>
                <option value={ORG_ROLES.VIEWER}>Viewer</option>
                <option value={ORG_ROLES.GUEST}>Guest</option>
              </select>

              {/* Status Filter */}
              <select
                className="form-select form-select-sm"
                style={{ width: 140 }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="deactivated">Deactivated</option>
              </select>

              {/* Workspace Filter */}
              {workspaces.length > 0 && (
                <select
                  className="form-select form-select-sm"
                  style={{ width: 160 }}
                  value={workspaceFilter}
                  onChange={(e) => setWorkspaceFilter(e.target.value)}
                >
                  <option value="">All Workspaces</option>
                  {workspaces.map((ws) => (
                    <option key={ws._id} value={ws._id}>
                      {ws.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <span className="text-muted small">
              Showing <strong>{members.length}</strong> authenticated members
            </span>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light border-bottom">
                <tr className="text-secondary small text-uppercase" style={{ letterSpacing: '0.04em' }}>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Workspaces</th>
                  <th className="py-3 px-3">Joined</th>
                  <th className="py-3 px-4 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted small">
                      <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                      Loading team members...
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <div className="text-muted mb-2">
                        <Users size={36} className="text-muted" />
                      </div>
                      <h6 className="fw-bold text-dark m-0">No Team Members Found</h6>
                      <p className="text-muted small mt-1 mb-3">
                        {search || roleFilter || statusFilter || workspaceFilter
                          ? 'No members match the current filter criteria.'
                          : 'You are currently the only member in this organization. Invite your team to get started.'}
                      </p>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary rounded-3 px-3 fw-semibold"
                        onClick={() => setInviteMemberModalOpen(true)}
                      >
                        <UserPlus size={14} className="me-1.5" /> Invite First Member
                      </button>
                    </td>
                  </tr>
                ) : (
                  members.map((member) => {
                    const user = member.user || member;
                    const isOwner = member.role === 'owner' || currentOrg.ownerId === member._id;
                    const targetUserId = member._id || user._id;

                    return (
                      <tr key={member.membershipId || member._id}>
                        {/* Member & Email */}
                        <td className="py-3 px-4">
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center shadow-sm flex-shrink-0"
                              style={{
                                width: 38,
                                height: 38,
                                backgroundColor: isOwner ? '#4F46E5' : '#8B5CF6',
                                fontSize: '0.88rem'
                              }}
                            >
                              {user.firstName ? user.firstName[0] : ''}
                              {user.lastName ? user.lastName[0] : ''}
                            </div>
                            <div>
                              <div className="fw-bold text-dark small d-flex align-items-center gap-1.5">
                                {user.firstName} {user.lastName}
                                {isOwner && (
                                  <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle" style={{ fontSize: '0.68rem' }}>
                                    Owner
                                  </span>
                                )}
                              </div>
                              <div className="text-muted" style={{ fontSize: '0.74rem' }}>
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Organization Role */}
                        <td className="py-3 px-3">
                          <span className="badge bg-light text-dark border small text-capitalize fw-semibold px-2.5 py-1">
                            {member.role || 'Member'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          <span
                            className={`badge px-2.5 py-1 text-capitalize fw-semibold ${
                              member.status === 'active'
                                ? 'bg-success-subtle text-success border border-success-subtle'
                                : member.status === 'suspended'
                                ? 'bg-warning-subtle text-warning border border-warning-subtle'
                                : 'bg-danger-subtle text-danger border border-danger-subtle'
                            }`}
                          >
                            {member.status || 'Active'}
                          </span>
                        </td>

                        {/* Workspaces */}
                        <td className="py-3 px-3">
                          {member.workspaces && member.workspaces.length > 0 ? (
                            <div className="d-flex flex-wrap gap-1">
                              {member.workspaces.slice(0, 2).map((ws: any) => (
                                <span key={ws.workspaceId || ws._id} className="badge bg-light text-secondary border small">
                                  {ws.name}
                                </span>
                              ))}
                              {member.workspaces.length > 2 && (
                                <span className="badge bg-light text-muted border small">
                                  +{member.workspaces.length - 2} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted small">None assigned</span>
                          )}
                        </td>

                        {/* Joined Date */}
                        <td className="py-3 px-3 small text-muted">
                          {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'Active'}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-end">
                          <div className="dropdown d-inline-block">
                            <button
                              type="button"
                              className="btn btn-sm btn-light border rounded-3 p-1.5"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              <MoreVertical size={16} />
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3 p-1.5">
                              <li>
                                <button
                                  type="button"
                                  className="dropdown-item small rounded-2 d-flex align-items-center gap-2 py-1.5"
                                  onClick={() => {
                                    setSelectedMemberDetails(member);
                                    setMemberDetailsDrawerOpen(true);
                                  }}
                                >
                                  <Eye size={14} /> View Dossier
                                </button>
                              </li>
                              <li>
                                <button
                                  type="button"
                                  className="dropdown-item small rounded-2 d-flex align-items-center gap-2 py-1.5"
                                  onClick={() => {
                                    setMemberToAssignRole(member);
                                    setAssignRoleModalOpen(true);
                                  }}
                                  disabled={isOwner}
                                >
                                  <Shield size={14} /> Assign Role
                                </button>
                              </li>
                              <li>
                                <button
                                  type="button"
                                  className="dropdown-item small rounded-2 d-flex align-items-center gap-2 py-1.5"
                                  onClick={() => {
                                    setMemberToManageWorkspaces(member);
                                    setManageWorkspacesModalOpen(true);
                                  }}
                                >
                                  <Layers size={14} /> Manage Workspaces
                                </button>
                              </li>
                              <li>
                                <button
                                  type="button"
                                  className="dropdown-item small rounded-2 d-flex align-items-center gap-2 py-1.5"
                                  onClick={() => {
                                    setMemberToUpdateStatus(member);
                                    setMemberStatusModalOpen(true);
                                  }}
                                  disabled={isOwner}
                                >
                                  <UserCheck size={14} /> Change Status
                                </button>
                              </li>
                              <li>
                                <hr className="dropdown-divider my-1" />
                              </li>
                              <li>
                                <button
                                  type="button"
                                  className="dropdown-item small rounded-2 text-danger d-flex align-items-center gap-2 py-1.5"
                                  onClick={() => {
                                    setMemberToRemove(member);
                                    setRemoveMemberModalOpen(true);
                                  }}
                                  disabled={isOwner}
                                >
                                  <UserX size={14} /> Remove Member
                                </button>
                              </li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Pending Invitations */}
      {activeTab === 'invitations' && (
        <div className="wz-card p-0 overflow-hidden">
          <div className="p-3 border-bottom bg-light d-flex justify-content-between align-items-center">
            <div>
              <h6 className="fw-bold text-dark m-0">Pending Invitations ({invitations.length})</h6>
              <div className="text-muted small">Invitations awaiting acceptance by prospective team members</div>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-primary rounded-3 fw-semibold"
              onClick={() => setInviteMemberModalOpen(true)}
            >
              <UserPlus size={14} className="me-1.5" /> New Invitation
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light border-bottom">
                <tr className="text-secondary small text-uppercase" style={{ letterSpacing: '0.04em' }}>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Invited By</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Expires</th>
                  <th className="py-3 px-4 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invitations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <Mail size={36} className="text-muted mb-2" />
                      <h6 className="fw-bold text-dark m-0">No Pending Invitations</h6>
                      <p className="text-muted small mt-1 mb-3">All invitations have been claimed or expired.</p>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary rounded-3 px-3 fw-medium"
                        onClick={() => setInviteMemberModalOpen(true)}
                      >
                        Invite Team Member
                      </button>
                    </td>
                  </tr>
                ) : (
                  invitations.map((inv) => {
                    const isPending = inv.status === 'pending';
                    const expiresAt = new Date(inv.expiresAt);
                    const isExpired = new Date() > expiresAt || inv.status === 'expired';

                    return (
                      <tr key={inv._id}>
                        <td className="py-3 px-4">
                          <div className="fw-semibold text-dark small">{inv.email}</div>
                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                            Created: {new Date(inv.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="badge bg-light text-dark border small text-capitalize">
                            {inv.role}
                          </span>
                        </td>
                        <td className="py-3 px-3 small text-muted">
                          {inv.invitedBy
                            ? `${inv.invitedBy.firstName} ${inv.invitedBy.lastName}`
                            : 'Administrator'}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`badge px-2.5 py-1 text-capitalize fw-semibold ${
                              isPending && !isExpired
                                ? 'bg-warning-subtle text-warning border border-warning-subtle'
                                : inv.status === 'accepted'
                                ? 'bg-success-subtle text-success border border-success-subtle'
                                : 'bg-danger-subtle text-danger border border-danger-subtle'
                            }`}
                          >
                            {isExpired && isPending ? 'Expired' : inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 small text-muted">
                          {expiresAt.toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-end">
                          {isPending && !isExpired && (
                            <div className="d-flex justify-content-end gap-1.5">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary py-1 px-2.5 rounded-2 d-flex align-items-center gap-1"
                                style={{ fontSize: '0.78rem' }}
                                onClick={() => handleResendInvite(inv._id)}
                              >
                                <RotateCw size={13} /> Resend
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger py-1 px-2.5 rounded-2 d-flex align-items-center gap-1"
                                style={{ fontSize: '0.78rem' }}
                                onClick={() => handleCancelInvite(inv._id)}
                              >
                                <XCircle size={13} /> Cancel
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Team Audit History */}
      {activeTab === 'audit' && (
        <div className="wz-card p-0 overflow-hidden">
          <div className="p-3 border-bottom bg-light">
            <h6 className="fw-bold text-dark m-0">Team Management Audit Trail</h6>
            <div className="text-muted small">Immutable record of member invitations, role changes, and access modifications</div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light border-bottom">
                <tr className="text-secondary small text-uppercase" style={{ letterSpacing: '0.04em' }}>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-3">Actor</th>
                  <th className="py-3 px-3">Context / Changes</th>
                  <th className="py-3 px-4 text-end">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-5 text-muted small">
                      <History size={36} className="text-muted mb-2" />
                      <div className="fw-semibold">No Team Audit Events Recorded</div>
                      <div className="text-muted">Mutations will be automatically tracked here.</div>
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => {
                    const actorName = log.userId
                      ? `${log.userId.firstName} ${log.userId.lastName}`
                      : 'System / User';

                    return (
                      <tr key={log._id}>
                        <td className="py-3 px-4">
                          <span className="badge bg-indigo-subtle text-primary border border-primary-subtle fw-semibold font-monospace small">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-3 small fw-medium text-dark">
                          {actorName}
                        </td>
                        <td className="py-3 px-3 small text-muted">
                          {log.changes ? (
                            <span className="font-monospace" style={{ fontSize: '0.76rem' }}>
                              {JSON.stringify(log.changes)}
                            </span>
                          ) : (
                            <span>{log.entityType}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-end small text-muted">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mount All Modal Components */}
      <InviteMemberModal />
      <ManageMemberWorkspacesModal />
      <UpdateMemberStatusModal />
      <RemoveMemberModal />
      <MemberDetailsDrawer />
      <AssignRoleModal />
    </div>
  );
};
