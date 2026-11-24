import React, { useState, useRef, useEffect } from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { apiClient } from '../../api/client.js';
import { ChevronDown, Search, Plus, Settings, Check, Layers, Code, Briefcase, Palette, Users } from 'lucide-react';
import { Workspace } from '../../../shared/types/index.js';

export const WorkspaceSelector: React.FC = () => {
  const {
    currentOrg,
    currentWorkspace,
    workspaces,
    setWorkspaces,
    setCurrentWorkspace,
    setCreateWorkspaceModalOpen,
    setActiveView
  } = useWorkzenStore();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch workspaces for the active organization
  useEffect(() => {
    if (!currentOrg?._id) return;

    const token = apiClient.getAuthToken();
    if (!token) return;

    apiClient
      .listWorkspaces(currentOrg._id)
      .then((res) => {
        if (res.success && res.data?.workspaces) {
          setWorkspaces(res.data.workspaces);
          // If no active workspace or active workspace belongs to another org, pick the first
          if (
            (!currentWorkspace || currentWorkspace.organisationId !== currentOrg._id) &&
            res.data.workspaces.length > 0
          ) {
            setCurrentWorkspace(res.data.workspaces[0]);
          }
        }
      })
      .catch(() => {});
  }, [currentOrg?._id]);

  const handleSelect = async (ws: Workspace) => {
    if (ws._id === currentWorkspace?._id) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.selectWorkspace(ws._id);
      setCurrentWorkspace(ws);
      setActiveView('workspace_dashboard');
    } catch (err) {
      console.warn('Select workspace fallback:', err);
      setCurrentWorkspace(ws);
      setActiveView('workspace_dashboard');
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const getWorkspaceIcon = (ws: Workspace) => {
    switch (ws.type) {
      case 'engineering':
        return <Code size={15} />;
      case 'marketing':
        return <Briefcase size={15} />;
      case 'design':
        return <Palette size={15} />;
      case 'operations':
        return <Users size={15} />;
      default:
        return <Layers size={15} />;
    }
  };

  const orgWorkspaces = workspaces.filter(
    (w) => !w.organisationId || w.organisationId === currentOrg?._id
  );

  const filtered = orgWorkspaces.filter((w) =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="position-relative" ref={dropdownRef}>
      {/* Trigger Button matching modern B2B SaaS UI */}
      <button
        type="button"
        className="btn btn-light border bg-white d-flex align-items-center gap-2 py-1.5 px-3 rounded-3 shadow-xs text-start"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        title="Switch Workspace"
        style={{ minWidth: 160 }}
      >
        <div
          className="rounded-2 d-flex align-items-center justify-content-center text-white fw-bold shadow-xs flex-shrink-0"
          style={{
            width: 24,
            height: 24,
            backgroundColor: currentWorkspace?.themeColor || '#6366F1',
            fontSize: '0.75rem'
          }}
        >
          {currentWorkspace?.icon && currentWorkspace.icon.length <= 2 ? (
            currentWorkspace.icon
          ) : (
            currentWorkspace?.name?.charAt(0) || 'W'
          )}
        </div>
        <div className="d-flex flex-column text-truncate" style={{ maxWidth: 140 }}>
          <span className="fw-semibold text-dark text-truncate small leading-tight">
            {currentWorkspace?.name || 'Select Workspace'}
          </span>
          <span className="text-muted" style={{ fontSize: '0.68rem' }}>
            {currentWorkspace?.type ? `${currentWorkspace.type} workspace` : 'Workspace'}
          </span>
        </div>
        <ChevronDown size={14} className="text-muted ms-auto" />
      </button>

      {/* Popover Dropdown (Exact Match to Max Burnside Dribbble B2B Workspace Selector) */}
      {isOpen && (
        <div
          className="position-absolute start-0 mt-2 bg-white rounded-4 shadow-xl border border-slate-200 py-2.5 animate-in fade-in zoom-in-95"
          style={{
            width: 320,
            zIndex: 1060,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Search Bar with Magnifying Glass */}
          <div className="px-3 pb-2 pt-1">
            <div className="position-relative">
              <Search
                size={14}
                className="position-absolute text-muted"
                style={{ top: '50%', left: 10, transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                className="form-control form-control-sm ps-4 bg-light border-0 rounded-3 text-dark"
                placeholder="Search for a workspace"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                style={{ fontSize: '0.82rem' }}
              />
            </div>
          </div>

          <div className="dropdown-divider my-1 border-slate-100" />

          {/* Workspaces Scrollable List */}
          <div className="px-2 py-1" style={{ maxHeight: 240, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                <p className="m-0">No workspaces found</p>
                <button
                  type="button"
                  className="btn btn-link btn-sm text-decoration-none mt-1 p-0 fw-semibold text-primary"
                  onClick={() => {
                    setIsOpen(false);
                    setCreateWorkspaceModalOpen(true);
                  }}
                >
                  Create one now
                </button>
              </div>
            ) : (
              filtered.map((ws) => {
                const isCurrent = ws._id === currentWorkspace?._id;
                return (
                  <button
                    key={ws._id}
                    type="button"
                    className={`w-100 border-0 rounded-3 px-3 py-2 text-start d-flex align-items-center justify-content-between mb-1 transition-all ${
                      isCurrent ? 'shadow-sm text-dark fw-semibold' : 'text-slate-700 hover-bg-slate'
                    }`}
                    style={
                      isCurrent
                        ? {
                            background: 'linear-gradient(90deg, #FDBA74 0%, #F59E0B 100%)',
                            color: '#1E293B',
                            fontWeight: 600
                          }
                        : {
                            backgroundColor: 'transparent'
                          }
                    }
                    onClick={() => handleSelect(ws)}
                  >
                    <div className="d-flex align-items-center gap-2.5 text-truncate">
                      <div
                        className="rounded-2 d-flex align-items-center justify-content-center shadow-xs flex-shrink-0"
                        style={{
                          width: 26,
                          height: 26,
                          backgroundColor: isCurrent ? '#FFFFFF' : (ws.themeColor || '#E2E8F0'),
                          color: isCurrent ? '#B45309' : '#334155',
                          fontSize: '0.78rem',
                          fontWeight: 700
                        }}
                      >
                        {ws.icon && ws.icon.length <= 2 ? ws.icon : (ws.name ? ws.name.charAt(0).toUpperCase() : 'W')}
                      </div>
                      <div className="text-truncate">
                        <div className="text-truncate" style={{ fontSize: '0.85rem' }}>
                          {ws.name}
                        </div>
                        {ws.description && !isCurrent && (
                          <div className="text-muted text-truncate" style={{ fontSize: '0.7rem' }}>
                            {ws.description}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Exact Prototype "Current" pill badge */}
                    {isCurrent ? (
                      <span
                        className="badge bg-dark text-white rounded-pill px-2 py-1 fw-bold"
                        style={{ fontSize: '0.65rem', letterSpacing: '0.02em' }}
                      >
                        Current
                      </span>
                    ) : (
                      ws.isPrivate && (
                        <span className="badge bg-secondary-subtle text-secondary rounded-pill" style={{ fontSize: '0.62rem' }}>
                          Private
                        </span>
                      )
                    )}
                  </button>
                );
              })
            )}
          </div>

          <div className="dropdown-divider my-1 border-slate-100" />

          {/* Bottom Actions matching Prototype: Create New Workspace & Workspace Settings */}
          <div className="px-3 pt-2 pb-1 d-flex align-items-center justify-content-between">
            <button
              type="button"
              className="btn btn-sm btn-link text-decoration-none text-dark fw-semibold p-0 d-flex align-items-center gap-1.5"
              style={{ fontSize: '0.8rem' }}
              onClick={() => {
                setIsOpen(false);
                setCreateWorkspaceModalOpen(true);
              }}
            >
              <Plus size={14} className="text-primary" />
              <span>Create New Workspace</span>
            </button>

            <button
              type="button"
              className="btn btn-sm btn-link text-decoration-none text-muted fw-medium p-0 d-flex align-items-center gap-1 hover-text-dark"
              style={{ fontSize: '0.78rem' }}
              onClick={() => {
                setIsOpen(false);
                setActiveView('workspace_settings');
              }}
            >
              <Settings size={13} />
              <span>Workspace Settings</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

