import React, { useState } from 'react';
import { useWorkzenStore } from '../store/useWorkzenStore.js';
import { apiClient } from '../api/client.js';
import {
  Layers,
  Search,
  Plus,
  ArrowRight,
  Check,
  Filter,
  Lock,
  Globe,
  SlidersHorizontal,
  Calendar,
  Code,
  Briefcase,
  Palette,
  Users
} from 'lucide-react';
import { Workspace } from '../../shared/types/index.js';

export const WorkspaceSelectPage: React.FC = () => {
  const {
    currentOrg,
    currentWorkspace,
    workspaces,
    setCurrentWorkspace,
    setCreateWorkspaceModalOpen,
    setActiveView
  } = useWorkzenStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('active');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created'>('name');

  const filtered = workspaces
    .filter((ws) => !ws.organisationId || ws.organisationId === currentOrg?._id)
    .filter((ws) => {
      if (statusFilter === 'active') return ws.status !== 'archived';
      if (statusFilter === 'archived') return ws.status === 'archived';
      return true;
    })
    .filter((ws) => {
      if (typeFilter === 'all') return true;
      return ws.type === typeFilter;
    })
    .filter((ws) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        ws.name.toLowerCase().includes(q) ||
        (ws.description && ws.description.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

  const handleSelectWorkspace = async (ws: Workspace) => {
    try {
      await apiClient.selectWorkspace(ws._id);
    } catch (e) {
      // ignore
    }
    setCurrentWorkspace(ws);
    setActiveView('workspace_dashboard');
  };

  return (
    <div className="d-flex flex-column gap-4 max-w-6xl mx-auto pb-5">
      {/* Top Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div>
          <h2 className="fw-bold text-dark m-0">Workspaces Directory</h2>
          <p className="text-muted small m-0">
            Workspaces in {currentOrg?.name || 'your Organization'}
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary rounded-3 fw-semibold px-4 py-2 text-white shadow-sm d-flex align-items-center gap-2"
          style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
          onClick={() => setCreateWorkspaceModalOpen(true)}
        >
          <Plus size={16} />
          <span>New Workspace</span>
        </button>
      </div>

      {/* Filter and Search Bar (matching Zuper mobile app & modern SaaS specs) */}
      <div className="wz-card p-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div className="position-relative flex-grow-1" style={{ maxWidth: 360 }}>
          <Search
            size={16}
            className="position-absolute text-muted"
            style={{ top: '50%', left: 14, transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            className="form-control rounded-pill ps-5 bg-light border-0"
            placeholder="Search workspaces by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ fontSize: '0.86rem' }}
          />
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2">
          {/* Status filter */}
          <div className="btn-group btn-group-sm">
            {(['active', 'all', 'archived'] as const).map((s) => (
              <button
                key={s}
                type="button"
                className={`btn text-capitalize ${
                  statusFilter === s ? 'btn-dark text-white fw-semibold' : 'btn-light border'
                }`}
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Sort By */}
          <select
            className="form-select form-select-sm rounded-3 border-slate-200"
            style={{ width: 'auto', fontSize: '0.82rem' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="name">Sort by Name</option>
            <option value="created">Sort by Date Created</option>
          </select>
        </div>
      </div>

      {/* Workspaces Grid */}
      {filtered.length === 0 ? (
        <div className="wz-card p-5 text-center">
          <div
            className="rounded-circle bg-light text-muted p-3 mx-auto mb-3 d-flex align-items-center justify-content-center"
            style={{ width: 56, height: 56 }}
          >
            <Layers size={26} />
          </div>
          <h5 className="fw-bold text-dark">No workspaces found</h5>
          <p className="text-muted small mx-auto" style={{ maxWidth: 360 }}>
            No workspaces match your current search or filters. Create a new workspace to organize your team's projects.
          </p>
          <button
            type="button"
            className="btn btn-primary rounded-3 fw-semibold px-4 py-2 mt-2"
            onClick={() => setCreateWorkspaceModalOpen(true)}
          >
            Create New Workspace
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {filtered.map((ws) => {
            const isCurrent = ws._id === currentWorkspace?._id;
            return (
              <div key={ws._id} className="col-md-6 col-lg-4">
                <div
                  className={`wz-card p-4 h-100 d-flex flex-column justify-content-between transition-all ${
                    isCurrent ? 'border-primary shadow-md' : 'hover-shadow-sm'
                  }`}
                  style={{
                    borderTop: `4px solid ${ws.themeColor || '#6366F1'}`
                  }}
                >
                  <div>
                    {/* Header */}
                    <div className="d-flex align-items-start justify-content-between mb-3">
                      <div className="d-flex align-items-center gap-2.5">
                        <div
                          className="rounded-3 d-flex align-items-center justify-content-center text-white fw-bold shadow-xs"
                          style={{
                            width: 40,
                            height: 40,
                            backgroundColor: ws.themeColor || '#6366F1',
                            fontSize: '1rem'
                          }}
                        >
                          {ws.icon && ws.icon.length <= 2 ? ws.icon : ws.name.charAt(0)}
                        </div>
                        <div>
                          <h6 className="fw-bold m-0 text-dark text-truncate" style={{ maxWidth: 160 }}>
                            {ws.name}
                          </h6>
                          <span className="text-muted small text-capitalize">
                            {ws.type || 'General'}
                          </span>
                        </div>
                      </div>

                      {isCurrent ? (
                        <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-2.5 py-1 fw-bold small">
                          Current
                        </span>
                      ) : ws.status === 'archived' ? (
                        <span className="badge bg-danger-subtle text-danger rounded-pill px-2 py-0.5 small">
                          Archived
                        </span>
                      ) : (
                        ws.isPrivate && (
                          <span className="badge bg-secondary-subtle text-secondary rounded-pill px-2 py-0.5 small d-flex align-items-center gap-1">
                            <Lock size={10} /> Private
                          </span>
                        )
                      )}
                    </div>

                    <p className="text-muted small mb-3" style={{ fontSize: '0.82rem', minHeight: 36 }}>
                      {ws.description || 'No description provided for this operational workspace.'}
                    </p>
                  </div>

                  {/* Footer actions */}
                  <div className="pt-3 border-top d-flex align-items-center justify-content-between mt-2">
                    <span className="text-muted small" style={{ fontSize: '0.74rem' }}>
                      {ws.projectCount ? `${ws.projectCount} Projects` : 'Workspace Active'}
                    </span>

                    {isCurrent ? (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary rounded-3 fw-semibold px-3 d-flex align-items-center gap-1"
                        onClick={() => setActiveView('workspace_dashboard')}
                      >
                        <span>Open</span>
                        <ArrowRight size={13} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-sm btn-light border rounded-3 fw-medium px-3 text-dark hover-bg-primary hover-text-white"
                        onClick={() => handleSelectWorkspace(ws)}
                      >
                        Switch To
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

