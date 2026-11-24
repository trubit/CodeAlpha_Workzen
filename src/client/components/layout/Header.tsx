import React from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { apiClient } from '../../api/client.js';
import { OrganisationSelector } from '../organisation/OrganisationSelector.js';
import { WorkspaceSelector } from '../workspace/WorkspaceSelector.js';
import { Search, Plus, Bell, Settings, UserCheck, Shield, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeView,
    setActiveView,
    currentUser,
    logout,
    currentOrg,
    currentWorkspace,
    setCreateTaskModalOpen,
    setInviteMemberModalOpen,
    notifications,
    searchQuery,
    setSearchQuery
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

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getViewTitle = () => {
    switch (activeView) {
      case 'enterprise_dashboard':
        return 'Executive Dashboard';
      case 'org_dashboard':
        return 'Organization Hub';
      case 'workspace_dashboard':
        return 'Workspace Overview';
      case 'workspace_settings':
        return 'Workspace Overview & Settings';
      case 'workspace_select':
        return 'Workspaces Directory';
      case 'workspace_onboarding':
        return 'Workspace Onboarding';
      case 'project_overview':
        return 'Project Portfolio & Roadmap';
      case 'kanban':
        return 'Kanban Workflow Board';
      case 'task_details':
        return 'Task Details';
      case 'team':
        return 'Team Management';
      case 'calendar':
        return 'Sprint Calendar & Deadlines';
      case 'notifications':
        return 'Notification Centre';
      case 'settings':
        return 'Settings & Security';
      default:
        return 'Workzen Platform';
    }
  };

  return (
    <header className="navbar navbar-expand bg-white border-bottom px-4 py-2.5 sticky-top shadow-xs">
      <div className="container-fluid p-0 d-flex align-items-center justify-content-between">
        {/* Breadcrumb Path & Title */}
        <div className="d-flex align-items-center gap-2.5">
          <div className="d-none d-md-flex align-items-center gap-2">
            <OrganisationSelector />
            <WorkspaceSelector />
          </div>
          <div>
            <h1 className="h5 fw-bold text-dark m-0 mt-0.5">{getViewTitle()}</h1>
          </div>
        </div>

        {/* Action Controls & Search */}
        <div className="d-flex align-items-center gap-3">
          {/* Search Bar */}
          <div className="position-relative d-none d-md-block" style={{ width: 260 }}>
            <Search
              size={15}
              className="position-absolute text-muted"
              style={{ top: '50%', left: 12, transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="form-control form-control-sm ps-5 bg-light border-0 rounded-pill"
              placeholder="Search tasks, docs... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ fontSize: '0.82rem' }}
            />
          </div>

          {/* Quick Create Task */}
          <button
            type="button"
            className="btn btn-sm btn-primary d-flex align-items-center rounded-3 fw-semibold px-3 py-1.5 shadow-sm"
            style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5', fontSize: '0.82rem' }}
            onClick={() => setCreateTaskModalOpen(true)}
          >
            <Plus size={16} className="me-1" />
            <span>Create Task</span>
          </button>

          {/* Invite Member */}
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-none d-lg-flex align-items-center rounded-3 fw-medium px-2.5 py-1.5"
            style={{ fontSize: '0.82rem' }}
            onClick={() => setInviteMemberModalOpen(true)}
          >
            <UserCheck size={15} className="me-1 text-primary" />
            <span>Invite</span>
          </button>

          <div className="vr d-none d-md-block my-1 text-secondary opacity-25"></div>

          {/* Notifications Bell */}
          <button
            type="button"
            className="btn btn-light btn-sm rounded-circle p-2 position-relative text-secondary"
            onClick={() => setActiveView('notifications')}
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white" style={{ fontSize: '0.65rem' }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Settings */}
          <button
            type="button"
            className="btn btn-light btn-sm rounded-circle p-2 text-secondary"
            onClick={() => setActiveView('settings')}
            title="Settings"
          >
            <Settings size={18} />
          </button>

          {/* User Profile */}
          <div
            className="d-flex align-items-center ms-1 p-1 rounded-pill bg-light border ps-2"
            role="button"
            onClick={() => setActiveView('settings')}
          >
            <span className="fw-semibold small me-2 d-none d-sm-inline" style={{ fontSize: '0.78rem' }}>
              {currentUser?.firstName || 'User'} {currentUser?.lastName || ''}
            </span>
            <div
              className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center"
              style={{ width: 28, height: 28, backgroundColor: '#4F46E5', fontSize: '0.75rem' }}
            >
              {currentUser?.firstName?.charAt(0) || 'U'}{currentUser?.lastName?.charAt(0) || ''}
            </div>
          </div>

          {/* Logout Action */}
          <button
            type="button"
            className="btn btn-light btn-sm rounded-circle p-2 text-danger hover-bg-danger-subtle ms-1"
            onClick={handleLogout}
            title="Log Out of Workzen"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  );
};

