import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWorkzenStore } from '../store/useWorkzenStore.js';
import { apiClient } from '../api/client.js';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Target,
  Layers,
  Calendar,
  ChevronRight,
  Plus,
  RefreshCw,
  BarChart3,
  Activity,
  ShieldCheck,
  Building2,
  UserCheck,
  Inbox,
  Filter,
  CheckSquare,
  Sparkles,
  ArrowUpRight,
  UserPlus
} from 'lucide-react';

type DashboardTab = 'overview' | 'my_tasks' | 'analytics' | 'activity';
type DateRange = 'today' | '7d' | '30d' | '90d' | 'all';

export const EnterpriseDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const {
    currentOrg,
    currentWorkspace,
    workspaces,
    currentUser,
    setActiveView,
    setCurrentWorkspace,
    setCreateOrgModalOpen,
    setCreateWorkspaceModalOpen,
    setCreateTaskModalOpen,
    setInviteMemberModalOpen,
    setSelectedTaskId
  } = useWorkzenStore();

  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>(currentWorkspace?._id || 'all');
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('all');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<string>('all');

  const wsQueryId = selectedWorkspaceId === 'all' ? undefined : selectedWorkspaceId;

  // 1. Overview Telemetry Query
  const {
    data: overviewRes,
    isLoading: isOverviewLoading,
    isRefetching: isOverviewRefetching,
    error: overviewError,
    refetch: refetchOverview
  } = useQuery({
    queryKey: ['dashboard-overview', currentOrg?._id, wsQueryId, dateRange],
    queryFn: () => apiClient.getDashboardOverview({ workspaceId: wsQueryId, dateRange }),
    enabled: Boolean(currentOrg?._id),
    staleTime: 30000
  });

  // 2. My Tasks Query
  const {
    data: myTasksRes,
    isLoading: isMyTasksLoading,
    refetch: refetchMyTasks
  } = useQuery({
    queryKey: ['dashboard-my-tasks', currentOrg?._id, wsQueryId, taskStatusFilter, taskPriorityFilter],
    queryFn: () =>
      apiClient.getDashboardMyTasks({
        workspaceId: wsQueryId,
        status: taskStatusFilter !== 'all' ? taskStatusFilter : undefined,
        priority: taskPriorityFilter !== 'all' ? taskPriorityFilter : undefined
      }),
    enabled: Boolean(currentOrg?._id),
    staleTime: 30000
  });

  // 3. Activity Stream Query
  const {
    data: activityRes,
    isLoading: isActivityLoading,
    refetch: refetchActivity
  } = useQuery({
    queryKey: ['dashboard-activity', currentOrg?._id, wsQueryId],
    queryFn: () => apiClient.getDashboardActivity({ workspaceId: wsQueryId, limit: 25 }),
    enabled: Boolean(currentOrg?._id),
    staleTime: 30000
  });

  // 4. Analytics Breakdown Query
  const {
    data: analyticsRes,
    isLoading: isAnalyticsLoading,
    refetch: refetchAnalytics
  } = useQuery({
    queryKey: ['dashboard-analytics', currentOrg?._id, wsQueryId, dateRange],
    queryFn: () => apiClient.getDashboardAnalytics({ workspaceId: wsQueryId, dateRange }),
    enabled: Boolean(currentOrg?._id),
    staleTime: 30000
  });

  const handleRefreshAll = () => {
    refetchOverview();
    refetchMyTasks();
    refetchActivity();
    refetchAnalytics();
  };

  if (!currentOrg) {
    return (
      <div className="wz-card p-5 text-center my-4">
        <div
          className="rounded-circle bg-primary-subtle text-primary p-3 mx-auto mb-3 d-flex align-items-center justify-content-center"
          style={{ width: 64, height: 64 }}
        >
          <Building2 size={32} />
        </div>
        <h4 className="fw-bold text-dark mb-2 wz-section-heading">No Organization Selected</h4>
        <p className="text-muted small mx-auto mb-4 wz-description" style={{ maxWidth: 460 }}>
          Create an enterprise organization to initialize workspaces, invite your team, and track project deliverables in real time.
        </p>
        <button
          type="button"
          className="btn btn-primary fw-semibold px-4 py-2.5 rounded-3 shadow-sm wz-btn-text"
          style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
          onClick={() => setCreateOrgModalOpen(true)}
        >
          <Plus size={16} className="me-1.5" /> Create Organization
        </button>
      </div>
    );
  }

  const overviewData = overviewRes?.data;
  const metrics = overviewData?.metrics || {
    projects: { total: 0, active: 0, completed: 0, archived: 0 },
    tasks: { total: 0, completed: 0, inProgress: 0, review: 0, todo: 0, overdue: 0, dueToday: 0, completionRate: 0 },
    team: { activeMembers: 1, workspaceMembers: 1, pendingInvitations: 0 }
  };
  const projectsList = overviewData?.projects || [];
  const deadlinesList = overviewData?.upcomingDeadlines || [];
  const myTasksList = myTasksRes?.data?.tasks || [];
  const activitiesList = activityRes?.data?.activities || [];
  const analyticsData = analyticsRes?.data;

  const userDisplayName = currentUser?.firstName
    ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim()
    : currentUser?.email?.split('@')[0] || 'Team Contributor';

  return (
    <div className="d-flex flex-column gap-4" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* 1. Executive Banner */}
      <div
        className="card border-0 rounded-4 text-white p-4 shadow-sm position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0A0F1D 0%, #1E1B4B 50%, #4338CA 100%)'
        }}
      >
        <div
          className="position-absolute"
          style={{
            top: '-50px',
            right: '-50px',
            width: '260px',
            height: '260px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, rgba(99, 102, 241, 0) 70%)',
            borderRadius: '50%',
            pointerEvents: 'none'
          }}
        />

        <div className="d-flex flex-wrap justify-content-between align-items-center position-relative">
          <div>
            <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-2 bg-white bg-opacity-10 border border-white border-opacity-20">
              <span className="rounded-circle bg-success d-inline-block" style={{ width: 7, height: 7 }} />
              <span className="small fw-semibold text-uppercase tracking-wide" style={{ fontSize: '0.72rem' }}>
                Executive Hub &bull; {currentOrg.name} &bull; {currentOrg.country || 'Global'}
              </span>
            </div>
            <h2 className="fw-extrabold m-0 tracking-tight text-white wz-display-heading" style={{ fontSize: '1.9rem' }}>
              Welcome back, {userDisplayName}
            </h2>
            <p className="text-white-50 m-0 mt-1 small wz-description">
              Real-time portfolio telemetry, active sprint deliverables, and team collaboration stream.
            </p>
          </div>

          <div className="d-flex flex-wrap gap-2 mt-3 mt-md-0">
            <button
              type="button"
              className="btn btn-sm text-white fw-bold px-3 py-2 rounded-3 shadow-sm d-flex align-items-center gap-1.5 wz-btn-text"
              style={{ backgroundColor: '#6366F1', borderColor: '#6366F1' }}
              onClick={() => setActiveView('kanban')}
            >
              <Layers size={15} />
              <span>Sprint Kanban</span>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-light fw-medium px-3 py-2 rounded-3 d-flex align-items-center gap-1.5 wz-btn-text"
              onClick={() => setCreateTaskModalOpen(true)}
            >
              <Plus size={15} />
              <span>New Task</span>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-light fw-medium px-2.5 py-2 rounded-3 d-flex align-items-center gap-1.5 wz-btn-text"
              onClick={handleRefreshAll}
              title="Refresh Dashboard"
            >
              <RefreshCw size={14} className={isOverviewRefetching ? 'spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Operational Control Bar (Workspace & Date Range Filter) */}
      <div className="wz-card p-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
        {/* Workspace Context Selector */}
        <div className="d-flex align-items-center gap-2 flex-grow-1 flex-md-grow-0">
          <Filter size={16} className="text-muted" />
          <span className="small fw-semibold text-secondary wz-label">Workspace Scope:</span>
          <select
            className="form-select form-select-sm rounded-3 fw-medium"
            style={{ width: 'auto', minWidth: 200 }}
            value={selectedWorkspaceId}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedWorkspaceId(val);
              if (val !== 'all') {
                const ws = workspaces.find((w) => w._id === val);
                if (ws) setCurrentWorkspace(ws);
              }
            }}
          >
            <option value="all">All Workspaces (Organization View)</option>
            {workspaces.map((ws) => (
              <option key={ws._id} value={ws._id}>
                {ws.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Selector */}
        <div className="d-flex align-items-center gap-2">
          <Calendar size={16} className="text-muted" />
          <span className="small fw-semibold text-secondary wz-label">Period:</span>
          <div className="btn-group btn-group-sm" role="group">
            {[
              { id: 'today', label: 'Today' },
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: 'all', label: 'All Time' }
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                className={`btn ${dateRange === r.id ? 'btn-primary' : 'btn-outline-secondary'} wz-btn-text`}
                onClick={() => setDateRange(r.id as DateRange)}
                style={dateRange === r.id ? { backgroundColor: '#4F46E5', borderColor: '#4F46E5' } : {}}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="d-flex align-items-center gap-1 w-100 w-lg-auto border-top border-lg-0 pt-2 pt-lg-0 mt-1 mt-lg-0">
          {[
            { id: 'overview', label: 'Executive Overview', icon: <Target size={14} /> },
            { id: 'my_tasks', label: `My Tasks (${myTasksList.length})`, icon: <CheckSquare size={14} /> },
            { id: 'analytics', label: 'Status & Velocity', icon: <BarChart3 size={14} /> },
            { id: 'activity', label: 'Activity Feed', icon: <Activity size={14} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`btn btn-sm d-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 fw-semibold transition-all wz-btn-text ${
                activeTab === tab.id ? 'bg-primary text-white shadow-xs' : 'text-secondary hover-bg-light'
              }`}
              style={activeTab === tab.id ? { backgroundColor: '#4F46E5' } : {}}
              onClick={() => setActiveTab(tab.id as DashboardTab)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Real KPI Metric Cards */}
      <div className="row g-3">
        {/* KPI 1: Active Projects */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="p-3.5 rounded-4 h-100 border shadow-xs transition-all"
            style={{ backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }}
          >
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-secondary small fw-semibold wz-label">Active Projects</span>
              <span className="p-1.5 rounded-3 bg-white text-success shadow-2xs">
                <FolderKanban size={16} />
              </span>
            </div>
            <div className="display-6 fw-extrabold text-dark m-0 wz-page-heading" style={{ fontSize: '2rem' }}>
              {isOverviewLoading ? '—' : metrics.projects.active}
            </div>
            <div className="progress mt-2 mb-2" style={{ height: 6 }}>
              <div
                className="progress-bar rounded"
                role="progressbar"
                style={{
                  width: metrics.projects.total > 0
                    ? `${Math.round((metrics.projects.active / metrics.projects.total) * 100)}%`
                    : '0%',
                  backgroundColor: '#10B981'
                }}
              />
            </div>
            <div className="text-muted small fw-medium wz-caption" style={{ fontSize: '0.75rem' }}>
              {metrics.projects.total} total &bull; {metrics.projects.completed} completed
            </div>
          </div>
        </div>

        {/* KPI 2: Task Completion Rate */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="p-3.5 rounded-4 h-100 border shadow-xs transition-all"
            style={{ backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }}
          >
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-secondary small fw-semibold wz-label">Task Completion Rate</span>
              <span className="p-1.5 rounded-3 bg-white text-info shadow-2xs">
                <CheckCircle2 size={16} />
              </span>
            </div>
            <div className="display-6 fw-extrabold text-dark m-0 wz-page-heading" style={{ fontSize: '2rem' }}>
              {isOverviewLoading ? '—' : `${metrics.tasks.completionRate}%`}
            </div>
            <div className="progress mt-2 mb-2" style={{ height: 6 }}>
              <div
                className="progress-bar rounded"
                role="progressbar"
                style={{ width: `${metrics.tasks.completionRate}%`, backgroundColor: '#0EA5E9' }}
              />
            </div>
            <div className="text-muted small fw-medium wz-caption" style={{ fontSize: '0.75rem' }}>
              {metrics.tasks.completed} of {metrics.tasks.total} deliverables closed
            </div>
          </div>
        </div>

        {/* KPI 3: Overdue Tasks & Due Today */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="p-3.5 rounded-4 h-100 border shadow-xs transition-all"
            style={{
              backgroundColor: metrics.tasks.overdue > 0 ? '#FFF1F2' : '#F8FAFC',
              borderColor: metrics.tasks.overdue > 0 ? '#FECDD3' : '#E2E8F0'
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-secondary small fw-semibold wz-label">Attention Needed</span>
              <span className={`p-1.5 rounded-3 bg-white shadow-2xs ${metrics.tasks.overdue > 0 ? 'text-danger' : 'text-muted'}`}>
                <AlertTriangle size={16} />
              </span>
            </div>
            <div className="display-6 fw-extrabold text-dark m-0 wz-page-heading" style={{ fontSize: '2rem' }}>
              {isOverviewLoading ? '—' : metrics.tasks.overdue}
            </div>
            <div className="progress mt-2 mb-2" style={{ height: 6 }}>
              <div
                className="progress-bar rounded"
                role="progressbar"
                style={{
                  width: metrics.tasks.total > 0
                    ? `${Math.min(100, Math.round((metrics.tasks.overdue / metrics.tasks.total) * 100))}%`
                    : '0%',
                  backgroundColor: '#EF4444'
                }}
              />
            </div>
            <div className="text-muted small fw-medium wz-caption" style={{ fontSize: '0.75rem' }}>
              {metrics.tasks.dueToday} due today &bull; {metrics.tasks.inProgress} in progress
            </div>
          </div>
        </div>

        {/* KPI 4: Team Contributors & Capacity */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="p-3.5 rounded-4 h-100 border shadow-xs transition-all"
            style={{ backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' }}
          >
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-secondary small fw-semibold wz-label">Team Contributors</span>
              <span className="p-1.5 rounded-3 bg-white text-purple shadow-2xs">
                <Users size={16} />
              </span>
            </div>
            <div className="display-6 fw-extrabold text-dark m-0 wz-page-heading" style={{ fontSize: '2rem' }}>
              {isOverviewLoading ? '—' : metrics.team.activeMembers}
            </div>
            <div className="progress mt-2 mb-2" style={{ height: 6 }}>
              <div
                className="progress-bar rounded"
                role="progressbar"
                style={{ width: metrics.team.activeMembers > 0 ? '100%' : '0%', backgroundColor: '#8B5CF6' }}
              />
            </div>
            <div className="text-muted small fw-medium wz-caption" style={{ fontSize: '0.75rem' }}>
              {metrics.team.workspaceMembers} in workspace &bull; {metrics.team.pendingInvitations} pending
            </div>
          </div>
        </div>
      </div>

      {/* 4. TAB CONTENT PANELS */}
      {activeTab === 'overview' && (
        <div className="row g-4">
          {/* Left Column: Active Projects Portfolio (w: 8 cols) */}
          <div className="col-lg-8">
            <div className="wz-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 className="fw-bold m-0 text-dark wz-section-heading">Strategic Projects Portfolio</h5>
                  <p className="text-muted small m-0 wz-description">
                    Progress tracking based on genuine completed deliverable ratios
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-link text-primary text-decoration-none fw-semibold d-flex align-items-center gap-1 wz-btn-text"
                  onClick={() => setActiveView('project_overview')}
                >
                  <span>View All Projects</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              {isOverviewLoading ? (
                <div className="d-flex flex-column gap-3 py-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-3 border rounded-3 bg-light">
                      <div className="d-flex justify-content-between mb-2">
                        <div className="bg-secondary opacity-25 rounded" style={{ width: 140, height: 16 }} />
                        <div className="bg-secondary opacity-25 rounded" style={{ width: 60, height: 16 }} />
                      </div>
                      <div className="bg-secondary opacity-25 rounded mt-2" style={{ width: '100%', height: 6 }} />
                    </div>
                  ))}
                </div>
              ) : projectsList.length === 0 ? (
                <div className="text-center py-5 border border-dashed rounded-3 bg-light">
                  <FolderKanban size={36} className="text-muted mb-2 opacity-50" />
                  <h6 className="fw-semibold text-dark wz-card-heading">No Projects Found</h6>
                  <p className="text-muted small mb-3 wz-description" style={{ maxWidth: 360, margin: '0 auto' }}>
                    Your projects will appear here once you create one in this workspace.
                  </p>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary rounded-3 fw-semibold px-3 py-1.5 wz-btn-text"
                    style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
                    onClick={() => setActiveView('project_overview')}
                  >
                    <Plus size={14} className="me-1" /> Create Project
                  </button>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {projectsList.map((proj: any) => (
                    <div
                      key={proj.id}
                      className="p-3 border rounded-3 bg-white hover-shadow transition-all"
                      role="button"
                      onClick={() => setActiveView('project_overview')}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <span
                            className="rounded-2 px-2 py-0.5 fw-bold text-white wz-caption"
                            style={{ backgroundColor: proj.color || '#6366F1', fontSize: '0.72rem' }}
                          >
                            {proj.key}
                          </span>
                          <span className="fw-bold text-dark wz-card-heading">{proj.name}</span>
                        </div>
                        <span className="badge bg-light text-secondary border small text-capitalize wz-caption">
                          {proj.status}
                        </span>
                      </div>

                      <div className="d-flex align-items-center justify-content-between">
                        <div className="w-75 me-3">
                          <div className="progress" style={{ height: 6 }}>
                            <div
                              className="progress-bar rounded"
                              role="progressbar"
                              style={{ width: `${proj.progressPercentage}%`, backgroundColor: proj.color || '#6366F1' }}
                            />
                          </div>
                        </div>
                        <div className="small text-muted fw-semibold wz-caption">
                          {proj.completedTasks}/{proj.totalTasks} closed ({proj.progressPercentage}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Upcoming Deadlines & Signals (w: 4 cols) */}
          <div className="col-lg-4">
            <div className="d-flex flex-column gap-4">
              {/* Upcoming Deadlines Widget */}
              <div className="wz-card p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold m-0 text-dark wz-card-heading">Approaching Deadlines</h6>
                  <span className="badge bg-primary-subtle text-primary wz-caption">{deadlinesList.length}</span>
                </div>

                {deadlinesList.length === 0 ? (
                  <div className="text-center py-4 text-muted small border border-dashed rounded-3 wz-description">
                    No upcoming deadlines scheduled for active tasks.
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {deadlinesList.map((item: any) => (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-3 border d-flex justify-content-between align-items-center ${
                          item.isOverdue
                            ? 'bg-danger-subtle border-danger-subtle'
                            : item.isDueToday
                            ? 'bg-warning-subtle border-warning-subtle'
                            : 'bg-light'
                        }`}
                      >
                        <div className="text-truncate me-2">
                          <div className="small fw-semibold text-dark text-truncate wz-body">
                            {item.title}
                          </div>
                          <div className="text-muted wz-caption" style={{ fontSize: '0.72rem' }}>
                            {item.projectName || 'Project Task'} &bull; Priority: {item.priority}
                          </div>
                        </div>
                        <span
                          className={`badge ${
                            item.isOverdue
                              ? 'bg-danger text-white'
                              : item.isDueToday
                              ? 'bg-warning text-dark'
                              : 'bg-secondary text-white'
                          } wz-caption`}
                        >
                          {item.isOverdue
                            ? 'Overdue'
                            : item.isDueToday
                            ? 'Due Today'
                            : new Date(item.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions & Governance Shortcuts */}
              <div className="wz-card p-4">
                <h6 className="fw-bold text-dark mb-3 wz-card-heading">Executive Shortcuts</h6>
                <div className="d-flex flex-column gap-2">
                  <button
                    type="button"
                    className="btn btn-light btn-sm text-start d-flex align-items-center justify-content-between p-2.5 rounded-3 border"
                    onClick={() => setActiveView('team')}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <Users size={16} className="text-primary" />
                      <span className="small fw-semibold text-dark wz-btn-text">Manage Team Directory</span>
                    </div>
                    <ChevronRight size={14} className="text-muted" />
                  </button>

                  <button
                    type="button"
                    className="btn btn-light btn-sm text-start d-flex align-items-center justify-content-between p-2.5 rounded-3 border"
                    onClick={() => setActiveView('roles_permissions')}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <ShieldCheck size={16} className="text-success" />
                      <span className="small fw-semibold text-dark wz-btn-text">Roles & Permissions (RBAC)</span>
                    </div>
                    <ChevronRight size={14} className="text-muted" />
                  </button>

                  <button
                    type="button"
                    className="btn btn-light btn-sm text-start d-flex align-items-center justify-content-between p-2.5 rounded-3 border"
                    onClick={() => setInviteMemberModalOpen(true)}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <UserPlus size={16} className="text-purple" />
                      <span className="small fw-semibold text-dark wz-btn-text">Invite New Colleague</span>
                    </div>
                    <ChevronRight size={14} className="text-muted" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY TASKS */}
      {activeTab === 'my_tasks' && (
        <div className="wz-card p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
            <div>
              <h5 className="fw-bold m-0 text-dark wz-section-heading">My Assigned Deliverables</h5>
              <p className="text-muted small m-0 wz-description">
                Work items assigned to {userDisplayName} across active projects
              </p>
            </div>

            {/* Task Filters */}
            <div className="d-flex align-items-center gap-2">
              <select
                className="form-select form-select-sm rounded-3"
                value={taskStatusFilter}
                onChange={(e) => setTaskStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Completed</option>
              </select>

              <select
                className="form-select form-select-sm rounded-3"
                value={taskPriorityFilter}
                onChange={(e) => setTaskPriorityFilter(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {isMyTasksLoading ? (
            <div className="text-center py-5 text-muted small wz-description">
              <div className="spinner-border spinner-border-sm text-primary mb-2" role="status" />
              <div>Loading your assigned tasks...</div>
            </div>
          ) : myTasksList.length === 0 ? (
            <div className="text-center py-5 border border-dashed rounded-3 bg-light">
              <Inbox size={36} className="text-muted mb-2 opacity-50" />
              <h6 className="fw-semibold text-dark wz-card-heading">No Assigned Tasks Found</h6>
              <p className="text-muted small mb-3 wz-description" style={{ maxWidth: 400, margin: '0 auto' }}>
                You don't have any tasks matching the current filters. Create a task or pick one from the sprint board.
              </p>
              <button
                type="button"
                className="btn btn-sm btn-primary rounded-3 fw-semibold px-3 py-1.5 wz-btn-text"
                style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
                onClick={() => setCreateTaskModalOpen(true)}
              >
                <Plus size={14} className="me-1" /> Create Task
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light wz-table-head">
                  <tr>
                    <th scope="col" style={{ width: '45%' }}>Title</th>
                    <th scope="col">Project</th>
                    <th scope="col">Status</th>
                    <th scope="col">Priority</th>
                    <th scope="col">Due Date</th>
                  </tr>
                </thead>
                <tbody className="wz-table-cell">
                  {myTasksList.map((t: any) => (
                    <tr
                      key={t.id}
                      role="button"
                      onClick={() => {
                        setSelectedTaskId(t.id);
                        setActiveView('task_details');
                      }}
                    >
                      <td>
                        <div className="fw-semibold text-dark wz-body">{t.title}</div>
                        <div className="text-muted small wz-caption" style={{ fontSize: '0.72rem' }}>
                          #{t.taskNumber}
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border wz-caption">
                          {t.project?.key ? `${t.project.key}: ${t.project.name}` : 'General'}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-primary-subtle text-primary text-capitalize wz-caption">
                          {t.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            t.priority === 'urgent'
                              ? 'bg-danger text-white'
                              : t.priority === 'high'
                              ? 'bg-warning text-dark'
                              : 'bg-light text-secondary border'
                          } text-capitalize wz-caption`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`small ${t.isOverdue ? 'text-danger fw-bold' : 'text-muted'} wz-caption`}>
                          {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No date'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STATUS ANALYTICS & VELOCITY */}
      {activeTab === 'analytics' && (
        <div className="row g-4">
          {/* Status Breakdown Bar */}
          <div className="col-lg-6">
            <div className="wz-card p-4 h-100">
              <h5 className="fw-bold text-dark mb-1 wz-section-heading">Task Status Distribution</h5>
              <p className="text-muted small mb-3 wz-description">
                Active deliverable counts across all workflow states
              </p>

              {analyticsData && analyticsData.totalTasks > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {[
                    { key: 'done', label: 'Completed', color: '#10B981' },
                    { key: 'in_progress', label: 'In Progress', color: '#6366F1' },
                    { key: 'review', label: 'In Review', color: '#F59E0B' },
                    { key: 'todo', label: 'To Do', color: '#0EA5E9' },
                    { key: 'backlog', label: 'Backlog', color: '#64748B' }
                  ].map((s) => {
                    const count = analyticsData.statusDistribution[s.key] || 0;
                    const pct = Math.round((count / analyticsData.totalTasks) * 100);
                    return (
                      <div key={s.key}>
                        <div className="d-flex justify-content-between align-items-center small mb-1">
                          <span className="fw-semibold text-dark wz-label">{s.label}</span>
                          <span className="text-muted wz-caption">{count} tasks ({pct}%)</span>
                        </div>
                        <div className="progress" style={{ height: 8 }}>
                          <div
                            className="progress-bar rounded"
                            style={{ width: `${pct}%`, backgroundColor: s.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-5 border border-dashed rounded-3 text-muted small wz-description">
                  No task data to calculate status distribution.
                </div>
              )}
            </div>
          </div>

          {/* Priority Distribution Matrix */}
          <div className="col-lg-6">
            <div className="wz-card p-4 h-100">
              <h5 className="fw-bold text-dark mb-1 wz-section-heading">Priority Breakdown</h5>
              <p className="text-muted small mb-3 wz-description">
                Workload urgency distribution across active tasks
              </p>

              {analyticsData && analyticsData.totalTasks > 0 ? (
                <div className="row g-3">
                  {[
                    { key: 'urgent', label: 'Urgent', color: '#EF4444', bg: '#FFF1F2' },
                    { key: 'high', label: 'High', color: '#F59E0B', bg: '#FFFBEB' },
                    { key: 'medium', label: 'Medium', color: '#6366F1', bg: '#EEF2FF' },
                    { key: 'low', label: 'Low', color: '#10B981', bg: '#F0FDF4' }
                  ].map((p) => {
                    const count = analyticsData.priorityDistribution[p.key] || 0;
                    return (
                      <div key={p.key} className="col-6">
                        <div
                          className="p-3 rounded-3 border text-center"
                          style={{ backgroundColor: p.bg, borderColor: p.color }}
                        >
                          <div className="h3 fw-extrabold m-0" style={{ color: p.color }}>
                            {count}
                          </div>
                          <div className="small fw-semibold text-dark text-capitalize mt-1 wz-label">
                            {p.label} Priority
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-5 border border-dashed rounded-3 text-muted small wz-description">
                  No priority records found to plot matrix.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RECENT ACTIVITY FEED */}
      {activeTab === 'activity' && (
        <div className="wz-card p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="fw-bold m-0 text-dark wz-section-heading">Live Immutable Activity Trail</h5>
              <p className="text-muted small m-0 wz-description">
                Cryptographic audit records capturing mutations, assignments, and governance events
              </p>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 wz-btn-text"
              onClick={() => refetchActivity()}
            >
              <RefreshCw size={13} />
              <span>Refresh</span>
            </button>
          </div>

          {isActivityLoading ? (
            <div className="text-center py-5 text-muted small wz-description">
              <div className="spinner-border spinner-border-sm text-primary mb-2" role="status" />
              <div>Loading real-time activity stream...</div>
            </div>
          ) : activitiesList.length === 0 ? (
            <div className="text-center py-5 border border-dashed rounded-3 bg-light">
              <Activity size={36} className="text-muted mb-2 opacity-50" />
              <h6 className="fw-semibold text-dark wz-card-heading">No Recent Activity Recorded</h6>
              <p className="text-muted small wz-description" style={{ maxWidth: 400, margin: '0 auto' }}>
                There is no recent activity to display. Activity records are logged automatically as you create and update projects and tasks.
              </p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2.5">
              {activitiesList.map((act: any) => (
                <div
                  key={act.id}
                  className="p-3 rounded-3 border bg-light d-flex align-items-start justify-content-between"
                >
                  <div className="d-flex align-items-start gap-3">
                    <div
                      className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold"
                      style={{ width: 36, height: 36, fontSize: '0.85rem' }}
                    >
                      {act.actor.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="small text-dark wz-body">
                        <strong className="text-primary">{act.actor.name}</strong>{' '}
                        <span>{act.action.replace('_', ' ')}</span>{' '}
                        <span className="badge bg-secondary-subtle text-secondary wz-caption">
                          {act.entityType}
                        </span>
                      </div>
                      {act.changes && (
                        <div className="text-muted small mt-1 wz-caption" style={{ fontSize: '0.75rem' }}>
                          Target ID: {act.entityId || 'N/A'}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-muted small text-nowrap wz-caption" style={{ fontSize: '0.75rem' }}>
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                    &bull; {new Date(act.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
