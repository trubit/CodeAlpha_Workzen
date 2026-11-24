import React, { useEffect, useState } from 'react';
import { useWorkzenStore } from '../store/useWorkzenStore.js';
import { apiClient } from '../api/client.js';
import { Users, Shield, Plus, Mail, Calendar, ArrowLeft } from 'lucide-react';

export const OrganisationMembersPage: React.FC = () => {
  const { currentOrg, setActiveView, setInviteMemberModalOpen } = useWorkzenStore();
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentOrg?._id) {
      setIsLoading(true);
      apiClient
        .listOrganisationMembers(currentOrg._id)
        .then((res) => {
          if (res.success && res.data?.members) {
            setMembers(res.data.members);
          }
        })
        .catch(() => {
          setMembers([]);
        })
        .finally(() => setIsLoading(false));
    }
  }, [currentOrg?._id]);

  if (!currentOrg) return null;

  return (
    <div className="d-flex flex-column gap-4">
      {/* Top Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-light border rounded-3 p-2"
            onClick={() => setActiveView('org_dashboard')}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h3 className="fw-bold text-dark m-0">Organization Members</h3>
            <p className="text-muted small m-0">Team members with active access to {currentOrg.name}</p>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-primary d-flex align-items-center gap-1.5 fw-semibold rounded-3 shadow-sm"
            style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
            onClick={() => setInviteMemberModalOpen(true)}
          >
            <Plus size={16} /> Invite Member
          </button>
        </div>
      </div>

      {/* Team Management Hub Shortcut */}
      <div className="alert alert-info py-2.5 px-3 small rounded-3 m-0 d-flex justify-content-between align-items-center">
        <div className="d-flex gap-2 align-items-center">
          <Shield size={16} className="text-info flex-shrink-0" />
          <span>
            <strong>Team Management Hub:</strong> View detailed member dossiers, assign workspaces, and manage active invitations.
          </span>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary fw-semibold py-1 px-3 rounded-2"
          onClick={() => setActiveView('team')}
        >
          Open Team Hub &rarr;
        </button>
      </div>

      {/* Members Table */}
      <div className="wz-card p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table align-middle m-0 table-hover">
            <thead className="table-light border-bottom">
              <tr>
                <th className="py-3 px-4 text-muted small fw-bold text-uppercase" style={{ letterSpacing: '0.04em' }}>
                  Member Name
                </th>
                <th className="py-3 px-4 text-muted small fw-bold text-uppercase" style={{ letterSpacing: '0.04em' }}>
                  Email Address
                </th>
                <th className="py-3 px-4 text-muted small fw-bold text-uppercase" style={{ letterSpacing: '0.04em' }}>
                  Organization Role
                </th>
                <th className="py-3 px-4 text-muted small fw-bold text-uppercase" style={{ letterSpacing: '0.04em' }}>
                  Status
                </th>
                <th className="py-3 px-4 text-muted small fw-bold text-uppercase" style={{ letterSpacing: '0.04em' }}>
                  Joined Date
                </th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-5 text-muted small">
                    No active members found for this organization.
                  </td>
                </tr>
              ) : (
                members.map((m) => {
                  const isOwner = m.role === 'owner';
                  const isAdmin = m.role === 'admin';
                  return (
                    <tr key={m.userId || m._id} className="border-bottom">
                    <td className="py-3 px-4">
                      <div className="d-flex align-items-center gap-2.5">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-xs flex-shrink-0"
                          style={{
                            width: 34,
                            height: 34,
                            backgroundColor: isOwner ? '#4F46E5' : isAdmin ? '#7C3AED' : '#64748B',
                            fontSize: '0.85rem'
                          }}
                        >
                          {m.name.charAt(0)}
                        </div>
                        <span className="fw-semibold text-dark small">{m.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted small">{m.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`badge ${
                          isOwner
                            ? 'bg-primary-subtle text-primary border border-primary-subtle'
                            : isAdmin
                            ? 'bg-purple-subtle text-purple border'
                            : 'bg-light text-secondary border'
                        } text-capitalize`}
                      >
                        {m.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="badge bg-success-subtle text-success border border-success-subtle">
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted small">
                      {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : 'Active Member'}
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

