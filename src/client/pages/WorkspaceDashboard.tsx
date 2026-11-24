import React from 'react';
import { useWorkzenStore } from '../store/useWorkzenStore.js';
import {
  Layers,
  Plus,
  KanbanSquare,
  CheckSquare,
  Clock,
  User,
  ArrowRight,
  Settings,
  FolderGit2,
  CheckCircle2,
  TrendingUp,
  Lock,
  Globe
} from 'lucide-react';

export const WorkspaceDashboard: React.FC = () => {
  const {
    currentWorkspace,
    currentOrg,
    projects,
    tasks,
    setActiveView,
    setCreateTaskModalOpen,
    setCreateProjectModalOpen,
    setCreateWorkspaceModalOpen
  } = useWorkzenStore();

  if (!currentWorkspace) {
    return (
      <div className="wz-card p-5 text-center my-4 max-w-6xl mx-auto">
        <div
          className="rounded-circle bg-primary-subtle text-primary p-3 mx-auto mb-3 d-flex align-items-center justify-content-center"
          style={{ width: 64, height: 64 }}
        >
          <Layers size={32} />
        </div>
        <h4 className="fw-bold text-dark mb-2">No Workspace Selected</h4>
        <p className="text-muted small mx-auto mb-4" style={{ maxWidth: 460 }}>
          Select an active workspace from the top menu or create a new dedicated workspace for your team.
        </p>
        <button
          type="button"
          className="btn btn-primary fw-semibold px-4 py-2.5 rounded-3 shadow-sm"
          style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
          onClick={() => setCreateWorkspaceModalOpen(true)}
        >
          <Plus size={16} className="me-1.5" /> Create Workspace
        </button>
      </div>
    );
  }

  const workspaceProjects = projects.filter((p) => p.workspaceId === currentWorkspace._id);
  const workspaceTasks = tasks.filter((t) => t.workspaceId === currentWorkspace._id);
  const completedTasks = workspaceTasks.filter((t) => t.status === 'done');
  const inProgressTasks = workspaceTasks.filter((t) => t.status === 'in_progress');
  const inReviewTasks = workspaceTasks.filter((t) => t.status === 'review');
  const completionRate = workspaceTasks.length > 0
    ? Math.round((completedTasks.length / workspaceTasks.length) * 100)
    : 0;

  return (
    <div className="d-flex flex-column gap-4 max-w-6xl mx-auto pb-5">
      {/* Workspace Banner */}
      <div className="wz-card p-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-3 d-flex align-items-center justify-content-center text-white fw-bold shadow-xs flex-shrink-0"
            style={{
              width: 52,
              height: 52,
              backgroundColor: currentWorkspace?.themeColor || '#6366F1',
              fontSize: '1.4rem'
            }}
          >
            {currentWorkspace?.icon && currentWorkspace.icon.length <= 2
              ? currentWorkspace.icon
              : currentWorkspace?.name?.charAt(0) || 'W'}
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h3 className="fw-bold m-0 text-dark">{currentWorkspace?.name}</h3>
              <span className="badge bg-success-subtle text-success rounded-pill px-2 py-0.5 small">
                Active
              </span>
              {currentWorkspace?.isPrivate ? (
                <span className="badge bg-secondary-subtle text-secondary rounded-pill px-2 py-0.5 small d-flex align-items-center gap-1">
                  <Lock size={10} /> Private
                </span>
              ) : (
                <span className="badge bg-light text-muted border rounded-pill px-2 py-0.5 small d-flex align-items-center gap-1">
                  <Globe size={10} /> Public
                </span>
              )}
            </div>
            <p className="text-muted small m-0 mt-0.5">
              {currentWorkspace?.description || 'Dedicated workspace for projects and sprint deliverables'} &bull;{' '}
              <span className="font-monospace text-primary">
                /{currentOrg?.slug || 'org'}/{currentWorkspace?.slug || 'workspace'}
              </span>
            </p>
          </div>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary d-flex align-items-center rounded-3 fw-medium px-3"
            onClick={() => setActiveView('workspace_settings')}
          >
            <Settings size={15} className="me-1.5" /> Workspace Settings
          </button>
          <button
            type="button"
            className="btn btn-outline-primary d-flex align-items-center rounded-3 fw-medium px-3"
            onClick={() => setActiveView('kanban')}
          >
            <KanbanSquare size={15} className="me-1.5" /> Kanban Board
          </button>
          <button
            type="button"
            className="btn btn-outline-primary d-flex align-items-center rounded-3 fw-medium px-3"
            onClick={() => setCreateProjectModalOpen(true)}
          >
            <Plus size={15} className="me-1.5" /> Create Project
          </button>
          <button
            type="button"
            className="btn btn-primary d-flex align-items-center rounded-3 fw-semibold shadow-sm px-3.5"
            style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
            onClick={() => setCreateTaskModalOpen(true)}
          >
            <Plus size={16} className="me-1.5" /> Create Task
          </button>
        </div>
      </div>

      {/* Real KPI Telemetry Cards */}
      <div className="row g-3">
        <div className="col-sm-6 col-lg-3">
          <div className="wz-card p-3.5">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-muted small fw-medium">Active Projects</span>
              <div className="rounded-2 p-1.5 bg-primary-subtle text-primary">
                <FolderGit2 size={16} />
              </div>
            </div>
            <h4 className="fw-bolder text-dark m-0">{workspaceProjects.length}</h4>
            <div className="text-muted small mt-1" style={{ fontSize: '0.72rem' }}>
              {workspaceProjects.length === 0 ? 'No projects yet' : 'Tracked in workspace'}
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="wz-card p-3.5">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-muted small fw-medium">Workspace Tasks</span>
              <div className="rounded-2 p-1.5 bg-indigo-subtle text-indigo">
                <CheckSquare size={16} />
              </div>
            </div>
            <h4 className="fw-bolder text-dark m-0">{workspaceTasks.length}</h4>
            <div className="text-muted small mt-1" style={{ fontSize: '0.72rem' }}>
              {inReviewTasks.length} in review &bull; {inProgressTasks.length} in progress
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="wz-card p-3.5">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-muted small fw-medium">Completion Rate</span>
              <div className="rounded-2 p-1.5 bg-success-subtle text-success">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <h4 className="fw-bolder text-dark m-0">{completionRate}%</h4>
            <div className="progress mt-2" style={{ height: 4 }}>
              <div
                className="progress-bar bg-success"
                role="progressbar"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="wz-card p-3.5">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-muted small fw-medium">Default View</span>
              <div className="rounded-2 p-1.5 bg-warning-subtle text-warning">
                <KanbanSquare size={16} />
              </div>
            </div>
            <h4 className="fw-bolder text-dark m-0 text-capitalize">
              {currentWorkspace?.settings?.defaultTaskView || 'Kanban'}
            </h4>
            <div className="text-muted small mt-1" style={{ fontSize: '0.72rem' }}>
              Optimized for sprint workflow
            </div>
          </div>
        </div>
      </div>

      {/* Projects in this Workspace & Activity Stream */}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="wz-card p-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h5 className="fw-bold text-dark m-0">Workspace Projects</h5>
                <p className="text-muted small m-0">Active projects organized under this workspace</p>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary rounded-3"
                  onClick={() => setActiveView('project_overview')}
                >
                  View All
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-primary fw-semibold rounded-3 d-flex align-items-center gap-1 shadow-xs"
                  style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
                  onClick={() => setCreateProjectModalOpen(true)}
                >
                  <Plus size={14} />
                  <span>New Project</span>
                </button>
              </div>
            </div>

            <div className="d-flex flex-column gap-3">
              {workspaceProjects.length === 0 ? (
                <div className="text-center py-5 border border-dashed rounded-3">
                  <FolderGit2 size={32} className="text-muted mb-2 opacity-50" />
                  <h6 className="fw-semibold text-dark">No Projects In This Workspace</h6>
                  <p className="text-muted small mb-3">
                    Projects created for {currentWorkspace.name} will appear here.
                  </p>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary fw-semibold px-3 py-1.5 rounded-3 shadow-xs d-inline-flex align-items-center gap-1.5"
                    style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
                    onClick={() => setCreateProjectModalOpen(true)}
                  >
                    <Plus size={15} />
                    <span>Create First Project</span>
                  </button>
                </div>
              ) : (
                workspaceProjects.map((proj) => (
                  <div
                    key={proj._id}
                    className="p-3 border rounded-3 d-flex flex-wrap justify-content-between align-items-center gap-2 hover-bg-slate transition-all"
                  >
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge text-white rounded-2 px-2 py-1" style={{ backgroundColor: proj.color }}>
                          {proj.key}
                        </span>
                        <span className="fw-bold text-dark">{proj.name}</span>
                        <span className="badge bg-light text-muted border small text-capitalize">
                          {proj.status}
                        </span>
                      </div>
                      <p className="text-muted small m-0 mt-1">{proj.description}</p>
                    </div>

                    <button
                      className="btn btn-sm btn-outline-primary fw-medium px-3 rounded-3 d-flex align-items-center gap-1"
                      onClick={() => setActiveView('project_overview')}
                    >
                      <span>Project Details</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Workspace Activity Stream */}
        <div className="col-lg-4">
          <div className="wz-card p-4 h-100 d-flex flex-column">
            <h5 className="fw-bold text-dark mb-1">Recent Activity</h5>
            <p className="text-muted small mb-3">Live workspace event stream</p>

            {workspaceTasks.length === 0 ? (
              <div className="text-center py-5 my-auto text-muted small border border-dashed rounded-3 p-3">
                <Clock size={28} className="opacity-40 mb-2 mx-auto" />
                <div>No recent activity in this workspace yet.</div>
                <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                  Actions and task updates will stream here automatically.
                </div>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {workspaceTasks.slice(0, 4).map((task) => (
                  <div key={task._id} className="d-flex gap-2.5">
                    <div
                      className="rounded-circle bg-primary-subtle text-primary p-2 d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 32, height: 32 }}
                    >
                      <CheckSquare size={16} />
                    </div>
                    <div>
                      <div className="small fw-semibold text-dark">{task.title}</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        Status: <strong className="text-capitalize">{task.status.replace('_', ' ')}</strong> &bull; {task.taskKey}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
