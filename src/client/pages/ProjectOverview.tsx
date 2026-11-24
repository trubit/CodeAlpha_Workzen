import React, { useState, useEffect } from 'react';
import { useWorkzenStore } from '../store/useWorkzenStore.js';
import { apiClient } from '../api/client.js';
import {
  FolderKanban,
  Calendar,
  Users,
  CheckCircle2,
  KanbanSquare,
  Clock,
  ShieldCheck,
  Plus,
  Search,
  Filter,
  Shield,
  UserPlus,
  UserMinus,
  Edit2,
  AlertCircle,
  History,
  Crown,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { AvatarGroup } from '../components/common/AvatarGroup.js';
import { AddProjectMemberModal } from '../components/modals/AddProjectMemberModal.js';
import { UpdateProjectMemberRoleModal } from '../components/modals/UpdateProjectMemberRoleModal.js';
import { RemoveProjectMemberModal } from '../components/modals/RemoveProjectMemberModal.js';

export const ProjectOverview: React.FC = () => {
  const {
    currentProject,
    setCurrentProject,
    currentWorkspace,
    currentOrg,
    tasks,
    setActiveView,
    setCreateTaskModalOpen,
    setCreateProjectModalOpen,
    projects
  } = useWorkzenStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'activity'>('members');
  const [members, setMembers] = useState<any[]>([]);
  const [eligibleCount, setEligibleCount] = useState<number>(0);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'lead' | 'contributor' | 'observer'>('all');
  const [memberActivity, setMemberActivity] = useState<any[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);

  // Modals state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedMemberForRole, setSelectedMemberForRole] = useState<any | null>(null);
  const [selectedMemberForRemoval, setSelectedMemberForRemoval] = useState<any | null>(null);

  // Project List (when no project selected)
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  useEffect(() => {
    if (!currentProject) {
      loadProjects();
    } else {
      loadMembers();
      loadMemberActivity();
    }
  }, [currentProject, currentOrg, currentWorkspace, projects]);

  const loadProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const res = await apiClient.listProjects({
        workspaceId: currentWorkspace?._id || undefined
      });
      if (res.success && res.data?.projects) {
        setProjectsList(res.data.projects);
      }
    } catch {
      // Handled cleanly
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const loadMembers = async () => {
    if (!currentProject?._id) return;
    setIsLoadingMembers(true);
    try {
      const res = await apiClient.listProjectMembers(currentProject._id);
      if (res.success && res.data?.members) {
        setMembers(res.data.members);
      }

      // Check eligible count for add button badge
      const eligRes = await apiClient.getEligibleOrganisationMembers(currentProject._id);
      if (eligRes.success && eligRes.data?.eligible) {
        setEligibleCount(eligRes.data.eligible.length);
      }
    } catch (err) {
      console.error('Failed to load project members', err);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const loadMemberActivity = async () => {
    if (!currentProject?._id) return;
    setIsLoadingActivity(true);
    try {
      const res = await apiClient.getProjectMemberActivity(currentProject._id, 15);
      if (res.success && res.data?.activity) {
        setMemberActivity(res.data.activity);
      }
    } catch (err) {
      console.error('Failed to load project activity', err);
    } finally {
      setIsLoadingActivity(false);
    }
  };

  // If no project is selected, show the Project Directory
  if (!currentProject) {
    return (
      <div className="d-flex flex-column gap-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h3 className="fw-bold text-dark m-0">Projects & Squads</h3>
            <p className="text-muted small m-0">Select an active project to view team collaboration and roster</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary fw-semibold rounded-3 px-3 py-2"
              onClick={() => setActiveView('workspace_dashboard')}
            >
              Workspace Dashboard
            </button>
            <button
              type="button"
              className="btn btn-primary fw-semibold rounded-3 px-3.5 py-2 shadow-sm d-flex align-items-center gap-1.5"
              style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
              onClick={() => setCreateProjectModalOpen(true)}
            >
              <Plus size={16} />
              <span>Create Project</span>
            </button>
          </div>
        </div>

        {isLoadingProjects ? (
          <div className="wz-card p-5 text-center text-muted small">Loading projects...</div>
        ) : projectsList.length === 0 ? (
          <div className="wz-card p-5 text-center my-4">
            <div
              className="rounded-circle bg-primary-subtle text-primary p-3 mx-auto mb-3 d-flex align-items-center justify-content-center"
              style={{ width: 64, height: 64 }}
            >
              <FolderKanban size={32} />
            </div>
            <h4 className="fw-bold text-dark mb-2">No Projects Available</h4>
            <p className="text-muted small mx-auto mb-4" style={{ maxWidth: 460 }}>
              There are no active projects found in this workspace. Create your first project to start planning deliverables and collaborating.
            </p>
            <div className="d-flex justify-content-center align-items-center gap-2.5">
              <button
                type="button"
                className="btn btn-primary fw-semibold px-4 py-2.5 rounded-3 shadow-sm d-flex align-items-center gap-2"
                style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
                onClick={() => setCreateProjectModalOpen(true)}
              >
                <Plus size={16} />
                <span>Create First Project</span>
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary fw-semibold px-3.5 py-2.5 rounded-3"
                onClick={() => setActiveView('workspace_dashboard')}
              >
                Go to Workspace Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="row g-3">
            {projectsList.map((p) => (
              <div key={p.id || p._id} className="col-md-6 col-lg-4">
                <div
                  className="wz-card p-4 h-100 cursor-pointer hover-shadow transition-all d-flex flex-column justify-content-between"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setCurrentProject(p)}
                >
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span
                        className="badge text-white px-2 py-1 rounded-2"
                        style={{ backgroundColor: p.color || '#4F46E5', fontSize: 11 }}
                      >
                        {p.key}
                      </span>
                      <span className="badge bg-light text-secondary border text-capitalize small">
                        {p.status || 'planning'}
                      </span>
                    </div>
                    <h5 className="fw-bold text-dark mb-1">{p.name}</h5>
                    <p className="text-muted small mb-3 text-truncate-2" style={{ minHeight: 38 }}>
                      {p.description || 'Enterprise project workspace.'}
                    </p>
                  </div>

                  <div className="pt-3 border-top d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2 small text-muted">
                      <Users size={14} />
                      <span>{p.members?.length || p.memberIds?.length || 1} Collaborators</span>
                    </div>
                    <span className="text-primary small fw-semibold d-flex align-items-center">
                      Open <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Filtered members list
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.email?.toLowerCase().includes(memberSearch.toLowerCase());
    const matchesRole = roleFilter === 'all' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const leadCount = members.filter((m) => m.role === 'lead').length;
  const contributorCount = members.filter((m) => m.role === 'contributor').length;
  const observerCount = members.filter((m) => m.role === 'observer').length;

  const projectTasks = tasks.filter((t) => t.projectId === currentProject._id);
  const doneTasks = projectTasks.filter((t) => t.status === 'done');
  const percent = projectTasks.length > 0 ? Math.round((doneTasks.length / projectTasks.length) * 100) : 0;

  return (
    <div className="d-flex flex-column gap-4">
      {/* Project Banner */}
      <div className="wz-card p-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-3">
            <span
              className="badge text-white px-3 py-2 fs-5 fw-bold rounded-3"
              style={{ backgroundColor: currentProject.color || '#4F46E5' }}
            >
              {currentProject.key}
            </span>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h3 className="fw-bold m-0 text-dark">{currentProject.name}</h3>
                <span className="badge bg-light text-secondary border small text-capitalize">
                  {currentProject.status || 'planning'}
                </span>
              </div>
              <p className="text-muted small m-0 mt-0.5">
                {currentProject.description || 'Enterprise project space for high-velocity teams.'}
              </p>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm fw-medium rounded-3 px-3 py-2"
              onClick={() => setCurrentProject(null)}
            >
              Switch Project
            </button>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm fw-medium rounded-3 px-3 py-2 d-flex align-items-center gap-1.5"
              onClick={() => setCreateProjectModalOpen(true)}
            >
              <Plus size={14} />
              <span>New Project</span>
            </button>
            <button
              type="button"
              className="btn btn-primary d-flex align-items-center fw-semibold rounded-3 px-3.5 py-2 shadow-sm"
              style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
              onClick={() => setActiveView('kanban')}
            >
              <KanbanSquare size={16} className="me-2" />
              Switch to Kanban Board
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="d-flex align-items-center gap-3 border-top pt-3 mt-3">
          <button
            type="button"
            className={`btn btn-sm fw-semibold rounded-pill px-3 py-1.5 transition-all ${
              activeTab === 'members'
                ? 'btn-primary text-white shadow-sm'
                : 'btn-light text-secondary hover-bg-slate'
            }`}
            style={activeTab === 'members' ? { backgroundColor: '#4F46E5', borderColor: '#4F46E5' } : {}}
            onClick={() => setActiveTab('members')}
          >
            <Users size={14} className="me-1.5" />
            Members & Collaboration ({members.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm fw-semibold rounded-pill px-3 py-1.5 transition-all ${
              activeTab === 'overview'
                ? 'btn-primary text-white shadow-sm'
                : 'btn-light text-secondary hover-bg-slate'
            }`}
            style={activeTab === 'overview' ? { backgroundColor: '#4F46E5', borderColor: '#4F46E5' } : {}}
            onClick={() => setActiveTab('overview')}
          >
            <FolderKanban size={14} className="me-1.5" />
            Deliverables & Roadmap
          </button>
          <button
            type="button"
            className={`btn btn-sm fw-semibold rounded-pill px-3 py-1.5 transition-all ${
              activeTab === 'activity'
                ? 'btn-primary text-white shadow-sm'
                : 'btn-light text-secondary hover-bg-slate'
            }`}
            style={activeTab === 'activity' ? { backgroundColor: '#4F46E5', borderColor: '#4F46E5' } : {}}
            onClick={() => setActiveTab('activity')}
          >
            <History size={14} className="me-1.5" />
            Membership Activity Log
          </button>
        </div>
      </div>

      {/* TAB 1: MEMBERS & COLLABORATION (PHASE 12) */}
      {activeTab === 'members' && (
        <div className="d-flex flex-column gap-4">
          {/* Top 3 Stat Cards */}
          <div className="row g-3">
            <div className="col-md-4">
              <div className="wz-card p-3.5 d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted small fw-medium">Total Collaborators</div>
                  <div className="fs-4 fw-bold text-dark mt-0.5">{members.length} Members</div>
                  <div className="text-secondary small mt-0.5">Across this project roster</div>
                </div>
                <div
                  className="rounded-circle p-3 d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}
                >
                  <Users size={24} />
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="wz-card p-3.5 d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted small fw-medium">Project Leadership</div>
                  <div className="fs-4 fw-bold text-success mt-0.5">{leadCount} Lead{leadCount === 1 ? '' : 's'}</div>
                  <div className="text-secondary small mt-0.5">Authorized administrators</div>
                </div>
                <div
                  className="rounded-circle p-3 d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: '#ECFDF5', color: '#10B981' }}
                >
                  <Crown size={24} />
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="wz-card p-3.5 d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted small fw-medium">Eligible Teammates</div>
                  <div className="fs-4 fw-bold text-primary mt-0.5">{eligibleCount} Available</div>
                  <div className="text-secondary small mt-0.5">Active organization members</div>
                </div>
                <div
                  className="rounded-circle p-3 d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: '#F0F9FF', color: '#0EA5E9' }}
                >
                  <UserPlus size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Roster Table Card */}
          <div className="wz-card p-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3.5">
              <div>
                <h5 className="fw-bold text-dark m-0">Project Member Roster</h5>
                <p className="text-muted small m-0">
                  {members.length} collaborator{members.length === 1 ? '' : 's'} allocated to {currentProject.name}
                </p>
              </div>

              <div className="d-flex flex-wrap align-items-center gap-2">
                {/* Search Bar */}
                <div className="input-group input-group-sm" style={{ width: 240 }}>
                  <span className="input-group-text bg-white border-end-0 text-muted">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search roster..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                  />
                </div>

                {/* Role Filter Chips */}
                <select
                  className="form-select form-select-sm"
                  style={{ width: 140 }}
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                >
                  <option value="all">All Roles</option>
                  <option value="lead">Leads ({leadCount})</option>
                  <option value="contributor">Contributors ({contributorCount})</option>
                  <option value="observer">Observers ({observerCount})</option>
                </select>

                <button
                  type="button"
                  className="btn btn-sm btn-primary d-flex align-items-center gap-1.5 fw-semibold px-3 py-1.5 rounded-3 shadow-sm"
                  style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
                  onClick={() => setIsAddMemberOpen(true)}
                >
                  <UserPlus size={15} /> Add Team Member
                </button>
              </div>
            </div>

            {/* Table */}
            {isLoadingMembers ? (
              <div className="text-center py-5 text-muted small">Loading project roster...</div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-5 border border-dashed rounded-3">
                <Users size={32} className="text-muted mb-2 opacity-50" />
                <h6 className="fw-semibold text-dark">
                  {memberSearch || roleFilter !== 'all' ? 'No Matching Members' : 'No Additional Members'}
                </h6>
                <p className="text-muted small mb-3" style={{ maxWidth: 420 }}>
                  {memberSearch || roleFilter !== 'all'
                    ? 'Adjust your search query or role filter to view matching collaborators.'
                    : 'Add collaborators from your organization so your team can plan roadmaps and track tasks together.'}
                </p>
                <button
                  type="button"
                  className="btn btn-sm btn-primary rounded-3"
                  style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
                  onClick={() => setIsAddMemberOpen(true)}
                >
                  <UserPlus size={14} className="me-1.5" /> Add Teammate
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-muted small text-uppercase" style={{ fontSize: 11 }}>
                    <tr>
                      <th scope="col" className="ps-3">Collaborator</th>
                      <th scope="col">Role & Access</th>
                      <th scope="col">Joined Project</th>
                      <th scope="col">Status</th>
                      <th scope="col" className="text-end pe-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((m) => {
                      const isOwner = m.isOwner;
                      return (
                        <tr key={m.id}>
                          <td className="ps-3 py-3">
                            <div className="d-flex align-items-center gap-2.5">
                              <div
                                className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                                style={{
                                  width: 36,
                                  height: 36,
                                  backgroundColor: isOwner ? '#10B981' : '#4F46E5',
                                  fontSize: 13
                                }}
                              >
                                {m.name ? m.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <div className="fw-semibold text-dark small d-flex align-items-center gap-1.5">
                                  {m.name}
                                  {isOwner && (
                                    <span
                                      className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-1.5 py-0.5"
                                      style={{ fontSize: 10 }}
                                    >
                                      Project Owner
                                    </span>
                                  )}
                                </div>
                                <div className="text-muted" style={{ fontSize: 11 }}>
                                  {m.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span
                              className={`badge rounded-pill px-2.5 py-1 text-capitalize fw-semibold ${
                                m.role === 'lead'
                                  ? 'bg-success-subtle text-success border border-success-subtle'
                                  : m.role === 'observer'
                                  ? 'bg-info-subtle text-info-emphasis border border-info-subtle'
                                  : 'bg-primary-subtle text-primary border border-primary-subtle'
                              }`}
                              style={{ fontSize: 11 }}
                            >
                              <Shield size={12} className="me-1 inline" />
                              {m.role}
                            </span>
                          </td>

                          <td className="text-secondary small">
                            {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : 'Active Member'}
                          </td>

                          <td>
                            <span className="badge bg-success-subtle text-success px-2 py-0.5 rounded-2 small">
                              Active
                            </span>
                          </td>

                          <td className="text-end pe-3">
                            <div className="d-inline-flex align-items-center gap-1">
                              <button
                                type="button"
                                className="btn btn-sm btn-link text-primary text-decoration-none fw-medium py-1 px-2"
                                onClick={() => setSelectedMemberForRole(m)}
                              >
                                <Edit2 size={13} className="me-1" />
                                Role
                              </button>
                              {!isOwner && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-link text-danger text-decoration-none fw-medium py-1 px-2"
                                  onClick={() => setSelectedMemberForRemoval(m)}
                                >
                                  <UserMinus size={13} className="me-1" />
                                  Remove
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DELIVERABLES & ROADMAP */}
      {activeTab === 'overview' && (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="wz-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 className="fw-bold text-dark m-0">Project Deliverables & Tasks</h5>
                  <p className="text-muted small m-0">Sprint items linked to {currentProject.name}</p>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary fw-medium rounded-3"
                  onClick={() => setCreateTaskModalOpen(true)}
                >
                  <Plus size={14} className="me-1" /> New Task
                </button>
              </div>

              {projectTasks.length === 0 ? (
                <div className="text-center py-5 border border-dashed rounded-3">
                  <CheckCircle2 size={32} className="text-muted mb-2 opacity-50" />
                  <h6 className="fw-semibold text-dark">No Tasks for this Project</h6>
                  <p className="text-muted small mb-3">Create sprint tasks to track project progress.</p>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary rounded-3"
                    style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
                    onClick={() => setCreateTaskModalOpen(true)}
                  >
                    <Plus size={14} className="me-1" /> Create Task
                  </button>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2.5">
                  {projectTasks.map((t) => (
                    <div
                      key={t._id}
                      className="p-3 border rounded-3 bg-white d-flex align-items-center justify-content-between"
                    >
                      <div>
                        <div className="d-flex align-items-center gap-2">
                          {t.status === 'done' ? (
                            <CheckCircle2 size={16} className="text-success" />
                          ) : (
                            <Clock size={16} className="text-primary" />
                          )}
                          <span className="fw-bold text-dark small">{t.taskKey}: {t.title}</span>
                        </div>
                        <p className="text-muted small m-0 ms-4 mt-0.5 text-truncate">
                          {t.description || 'No description'}
                        </p>
                      </div>
                      <span className="badge bg-light text-secondary border small text-capitalize">
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-4">
            <div className="wz-card p-4 h-100">
              <h5 className="fw-bold text-dark mb-3">Project Overview</h5>
              <div className="d-flex flex-column gap-3 small text-secondary">
                <div>
                  <span className="fw-semibold text-dark d-block mb-1">Sprint Progress</span>
                  <div className="progress rounded-pill mb-1" style={{ height: 8 }}>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{ width: `${percent}%`, backgroundColor: '#4F46E5' }}
                    />
                  </div>
                  <div className="text-muted" style={{ fontSize: 11 }}>
                    {doneTasks.length} of {projectTasks.length} tasks completed ({percent}%)
                  </div>
                </div>

                <div className="border-top pt-3">
                  <span className="fw-semibold text-dark d-block mb-1">Target Timeline</span>
                  <div className="text-dark d-flex align-items-center gap-1.5">
                    <Calendar size={14} className="text-primary" />
                    {currentProject.startDate ? new Date(currentProject.startDate).toLocaleDateString() : 'Started'}
                    {' '} &rarr; {' '}
                    {currentProject.targetDate ? new Date(currentProject.targetDate).toLocaleDateString() : 'Open'}
                  </div>
                </div>

                <div className="border-top pt-3">
                  <span className="fw-semibold text-dark d-block mb-1">Security & Access</span>
                  <div className="d-flex align-items-center gap-1.5 text-dark">
                    <ShieldCheck size={16} className="text-success" />
                    <span>Multi-tenant isolation active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MEMBERSHIP ACTIVITY AUDIT LOG */}
      {activeTab === 'activity' && (
        <div className="wz-card p-4">
          <div className="mb-3.5">
            <h5 className="fw-bold text-dark m-0">Project Membership History</h5>
            <p className="text-muted small m-0">Audit trail of collaborator allocations, role changes, and removals</p>
          </div>

          {isLoadingActivity ? (
            <div className="text-center py-5 text-muted small">Loading membership activity history...</div>
          ) : memberActivity.length === 0 ? (
            <div className="text-center py-5 border border-dashed rounded-3">
              <History size={32} className="text-muted mb-2 opacity-50" />
              <h6 className="fw-semibold text-dark">No Recent Membership Changes</h6>
              <p className="text-muted small m-0">
                Member additions, role changes, and removals will appear in this audit log.
              </p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {memberActivity.map((act) => (
                <div key={act.id} className="p-3 border rounded-3 bg-white d-flex align-items-start gap-3">
                  <div
                    className="rounded-circle p-2 d-flex align-items-center justify-content-center text-primary mt-0.5"
                    style={{ backgroundColor: '#EEF2FF' }}
                  >
                    <History size={16} />
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="fw-bold text-dark small">
                        {act.action === 'PROJECT_MEMBERS_ADDED'
                          ? 'Collaborators Added'
                          : act.action === 'PROJECT_MEMBER_REMOVED'
                          ? 'Member Removed'
                          : act.action === 'PROJECT_MEMBER_ROLE_UPDATED'
                          ? 'Member Role Modified'
                          : act.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-muted" style={{ fontSize: 11 }}>
                        {new Date(act.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-muted small mt-0.5">
                      Executed by <strong>{act.actor?.name || 'Authorized Member'}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AddProjectMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        projectId={currentProject._id}
        projectName={currentProject.name}
        onMembersAdded={() => {
          loadMembers();
          loadMemberActivity();
        }}
      />

      <UpdateProjectMemberRoleModal
        isOpen={!!selectedMemberForRole}
        onClose={() => setSelectedMemberForRole(null)}
        projectId={currentProject._id}
        member={selectedMemberForRole}
        onRoleUpdated={() => {
          loadMembers();
          loadMemberActivity();
        }}
      />

      <RemoveProjectMemberModal
        isOpen={!!selectedMemberForRemoval}
        onClose={() => setSelectedMemberForRemoval(null)}
        projectId={currentProject._id}
        projectName={currentProject.name}
        member={selectedMemberForRemoval}
        onMemberRemoved={() => {
          loadMembers();
          loadMemberActivity();
        }}
      />
    </div>
  );
};
