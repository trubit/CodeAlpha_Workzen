import React from 'react';
import { useWorkzenStore, ActiveView } from '../../store/useWorkzenStore.js';
import { apiClient } from '../../api/client.js';
import { OrganisationSelector } from '../organisation/OrganisationSelector.js';
import { WorkspaceSelector } from '../workspace/WorkspaceSelector.js';
import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  KanbanSquare,
  CheckSquare,
  ListTodo,
  Users,
  Bell,
  Calendar,
  Settings,
  Sparkles,
  ChevronDown,
  Layers,
  Briefcase,
  BarChart3,
  Sliders,
  LogOut,
  ShieldCheck
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    currentUser,
    logout,
    currentOrg,
    organisations,
    setCurrentOrg,
    currentWorkspace,
    workspaces,
    setCurrentWorkspace,
    tasks,
    setCreateOrgModalOpen
  } = useWorkzenStore();

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      // ignore
    }
    logout();
    setActiveView('login');
  };

  const navigationItems: { id: ActiveView; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'enterprise_dashboard', label: 'Executive Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'org_dashboard', label: 'Organization Hub', icon: <Building2 size={18} /> },
    { id: 'org_settings', label: 'Organization Settings', icon: <Settings size={18} /> },
    { id: 'org_members', label: 'Organization Members', icon: <Users size={18} /> },
    { id: 'roles_permissions', label: 'Roles & Permissions', icon: <ShieldCheck size={18} /> },
    { id: 'workspace_dashboard', label: 'Workspace Overview', icon: <Briefcase size={18} /> },
    { id: 'workspace_settings', label: 'Workspace Settings', icon: <Sliders size={18} /> },
    { id: 'workspace_select', label: 'Workspaces Directory', icon: <Layers size={18} /> },
    { id: 'project_overview', label: 'Project Portfolio', icon: <FolderKanban size={18} /> },
    { id: 'tasks', label: 'Tasks', icon: <ListTodo size={18} /> },
    { id: 'kanban', label: 'Kanban Board', icon: <KanbanSquare size={18} />, badge: tasks.length },
    { id: 'task_details', label: 'Task Details', icon: <CheckSquare size={18} /> },
    { id: 'team', label: 'Team Management', icon: <Users size={18} /> },
    { id: 'calendar', label: 'Sprint Calendar', icon: <Calendar size={18} /> },
    { id: 'analytics', label: 'Reports & Analytics', icon: <BarChart3 size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} />, badge: 2 },
    { id: 'settings', label: 'Settings & Security', icon: <Settings size={18} /> }
  ];

  return (
    <aside
      className="d-flex flex-column flex-shrink-0 bg-white border-end shadow-sm"
      style={{ width: '270px', minHeight: '100vh' }}
    >
      {/* Brand Header */}
      <div className="px-4 py-3 border-bottom d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center" role="button" onClick={() => setActiveView('enterprise_dashboard')}>
          <div
            className="rounded-3 d-flex align-items-center justify-content-center text-white me-2.5 shadow-sm"
            style={{ width: 34, height: 34, backgroundColor: '#4F46E5' }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <span className="fw-bolder fs-5 text-dark tracking-tight">WORKZEN</span>
            <div className="text-muted" style={{ fontSize: '0.68rem', marginTop: -3 }}>
              Enterprise SaaS
            </div>
          </div>
        </div>
      </div>

      {/* Tenant Context Selector (B2B Popover Switcher Benchmark) */}
      <div className="p-3 border-bottom bg-light d-flex flex-column gap-2">
        <div>
          <label className="text-uppercase text-muted fw-bold mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>
            Organization
          </label>
          <OrganisationSelector />
        </div>

        <div>
          <label className="text-uppercase text-muted fw-bold mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>
            Workspace
          </label>
          <WorkspaceSelector />
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-grow-1 overflow-auto py-2 px-3">
        <div className="text-uppercase text-muted fw-bold px-2 py-1 mb-1" style={{ fontSize: '0.65rem' }}>
          Workspace Views
        </div>
        <ul className="nav nav-pills flex-column gap-1 mb-3">
          {navigationItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <li key={item.id} className="nav-item">
                <button
                  type="button"
                  onClick={() => setActiveView(item.id)}
                  className={`nav-link w-100 d-flex align-items-center justify-content-between text-start border-0 px-3 py-2 rounded-3 transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-secondary bg-transparent hover-bg-light'
                  }`}
                  style={{
                    backgroundColor: isActive ? '#4F46E5' : 'transparent',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.86rem'
                  }}
                >
                  <div className="d-flex align-items-center">
                    <span className="me-2.5 opacity-90">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`badge rounded-pill ${
                        isActive ? 'bg-white text-primary' : 'bg-light text-secondary border'
                      }`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer Info with User Profile and Logout */}
      <div className="p-3 border-top bg-light d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center overflow-hidden me-2">
          <div
            className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center me-2 flex-shrink-0"
            style={{ width: 34, height: 34, backgroundColor: '#4F46E5', fontSize: '0.8rem' }}
          >
            {currentUser?.firstName?.charAt(0) || 'U'}
            {currentUser?.lastName?.charAt(0) || ''}
          </div>
          <div className="overflow-hidden">
            <div className="fw-semibold text-truncate small">
              {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Workzen User'}
            </div>
            <div className="text-muted text-truncate" style={{ fontSize: '0.7rem' }}>
              {currentUser?.email || 'Logged In'}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-sm btn-light border rounded-3 p-1.5 text-danger hover-bg-danger-subtle flex-shrink-0"
          onClick={handleLogout}
          title="Log Out of Workzen"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};

