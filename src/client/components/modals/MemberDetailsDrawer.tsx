import React from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { X, Mail, Calendar, Shield, Layers, UserCheck, UserX, Clock } from 'lucide-react';

export const MemberDetailsDrawer: React.FC = () => {
  const {
    isMemberDetailsDrawerOpen,
    setMemberDetailsDrawerOpen,
    selectedMemberDetails,
    setSelectedMemberDetails,
    currentOrg,
    setAssignRoleModalOpen,
    setMemberToAssignRole,
    setManageWorkspacesModalOpen,
    setMemberToManageWorkspaces,
    setMemberStatusModalOpen,
    setMemberToUpdateStatus
  } = useWorkzenStore();

  if (!isMemberDetailsDrawerOpen || !selectedMemberDetails) return null;

  const user = selectedMemberDetails.user || selectedMemberDetails;
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Team Member';
  const email = user.email || '';
  const role = selectedMemberDetails.role || 'member';
  const status = selectedMemberDetails.status || 'active';
  const joinedAt = selectedMemberDetails.joinedAt || user.createdAt;
  const workspaces = selectedMemberDetails.workspaces || [];
  const customRoles = selectedMemberDetails.customRoles || [];

  const handleEditRole = () => {
    setMemberToAssignRole(selectedMemberDetails);
    setAssignRoleModalOpen(true);
  };

  const handleEditWorkspaces = () => {
    setMemberToManageWorkspaces(selectedMemberDetails);
    setManageWorkspacesModalOpen(true);
  };

  const handleEditStatus = () => {
    setMemberToUpdateStatus(selectedMemberDetails);
    setMemberStatusModalOpen(true);
  };

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(2px)', zIndex: 1040 }}
      onClick={() => {
        setMemberDetailsDrawerOpen(false);
        setSelectedMemberDetails(null);
      }}
    >
      <div
        className="position-fixed top-0 end-0 h-100 bg-white shadow-lg d-flex flex-column"
        style={{ width: '100%', maxWidth: 480, zIndex: 1050 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-bottom d-flex align-items-center justify-content-between bg-light">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center shadow-sm"
              style={{
                width: 48,
                height: 48,
                backgroundColor: '#4F46E5',
                fontSize: '1.1rem'
              }}
            >
              {user.firstName ? user.firstName[0] : ''}
              {user.lastName ? user.lastName[0] : ''}
            </div>
            <div>
              <h5 className="fw-bold text-dark m-0">{fullName}</h5>
              <div className="text-muted small d-flex align-items-center gap-1 mt-0.5">
                <Mail size={13} /> {email}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-light rounded-circle p-1"
            onClick={() => {
              setMemberDetailsDrawerOpen(false);
              setSelectedMemberDetails(null);
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 flex-grow-1 overflow-auto d-flex flex-column gap-4">
          {/* Status & Role Summary Card */}
          <div className="p-3.5 border rounded-3 bg-light">
            <div className="row g-3">
              <div className="col-6">
                <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.7rem' }}>
                  Organization Role
                </div>
                <div className="mt-1 d-flex align-items-center gap-2">
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 text-capitalize fw-bold">
                    {role}
                  </span>
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-decoration-none small"
                    onClick={handleEditRole}
                  >
                    Change
                  </button>
                </div>
              </div>

              <div className="col-6">
                <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.7rem' }}>
                  Account Status
                </div>
                <div className="mt-1 d-flex align-items-center gap-2">
                  <span
                    className={`badge px-2.5 py-1 text-capitalize fw-bold ${
                      status === 'active'
                        ? 'bg-success-subtle text-success border border-success-subtle'
                        : 'bg-danger-subtle text-danger border border-danger-subtle'
                    }`}
                  >
                    {status}
                  </span>
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-decoration-none small"
                    onClick={handleEditStatus}
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Key Dates & Metadata */}
          <div>
            <h6 className="fw-bold text-dark mb-2.5 small text-uppercase" style={{ letterSpacing: '0.04em' }}>
              Tenure & Authentication
            </h6>
            <div className="d-flex flex-column gap-2 small">
              <div className="d-flex justify-content-between p-2 rounded-2 bg-light border">
                <span className="text-muted d-flex align-items-center gap-1.5">
                  <Calendar size={14} /> Organization Joined
                </span>
                <span className="fw-medium text-dark">
                  {joinedAt ? new Date(joinedAt).toLocaleDateString() : 'Active'}
                </span>
              </div>
              <div className="d-flex justify-content-between p-2 rounded-2 bg-light border">
                <span className="text-muted d-flex align-items-center gap-1.5">
                  <Clock size={14} /> Email Verification
                </span>
                <span className={`fw-medium ${user.isEmailVerified ? 'text-success' : 'text-warning'}`}>
                  {user.isEmailVerified ? 'Verified' : 'Pending Confirmation'}
                </span>
              </div>
            </div>
          </div>

          {/* Assigned Workspaces */}
          <div>
            <div className="d-flex justify-content-between align-items-center mb-2.5">
              <h6 className="fw-bold text-dark m-0 small text-uppercase" style={{ letterSpacing: '0.04em' }}>
                Workspace Access ({workspaces.length})
              </h6>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary py-0.5 px-2 rounded-2"
                style={{ fontSize: '0.75rem' }}
                onClick={handleEditWorkspaces}
              >
                Manage Access
              </button>
            </div>

            {workspaces.length === 0 ? (
              <div className="alert alert-light border small text-muted text-center py-3 m-0">
                No specific workspace assigned. Member possesses general organization scope.
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {workspaces.map((ws: any) => (
                  <div key={ws.workspaceId || ws._id} className="p-2.5 rounded-3 border bg-light d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold text-dark small">{ws.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        slug: {ws.slug}
                      </div>
                    </div>
                    <span className="badge bg-white text-secondary border small text-capitalize">
                      {ws.role || 'Member'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Custom Roles */}
          {customRoles.length > 0 && (
            <div>
              <h6 className="fw-bold text-dark mb-2.5 small text-uppercase" style={{ letterSpacing: '0.04em' }}>
                Custom Role Grants ({customRoles.length})
              </h6>
              <div className="d-flex flex-wrap gap-1.5">
                {customRoles.map((cr: any) => (
                  <span key={cr._id} className="badge bg-indigo-subtle text-primary border border-primary-subtle px-2 py-1 small">
                    {cr.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-top bg-light text-end">
          <button
            type="button"
            className="btn btn-secondary px-4 py-2 fw-medium"
            onClick={() => {
              setMemberDetailsDrawerOpen(false);
              setSelectedMemberDetails(null);
            }}
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};

