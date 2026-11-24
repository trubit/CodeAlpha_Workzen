import { create } from 'zustand';
import { Task, User, Organisation, Workspace, Project, NotificationItem, Role, RoleAssignment, UserEffectivePermissions } from '../../shared/types/index.js';
import { TASK_STATUS, TASK_PRIORITY, PROJECT_STATUS } from '../../shared/constants/status.js';
import { apiClient } from '../api/client.js';

export type ActiveView = 
  | 'landing'
  | 'features'
  | 'solutions'
  | 'pricing'
  | 'about'
  | 'contact'
  | 'faq'
  | 'login'
  | 'register'
  | 'verify_email'
  | 'verify_otp'
  | 'forgot_password'
  | 'reset_password'
  | 'account_verified'
  | 'password_reset_success'
  | 'accept_invitation'
  | 'enterprise_dashboard'
  | 'org_dashboard'
  | 'org_onboarding'
  | 'org_select'
  | 'org_settings'
  | 'org_branding'
  | 'org_ownership'
  | 'org_members'
  | 'roles_permissions'
  | 'workspace_dashboard'
  | 'workspace_settings'
  | 'workspace_select'
  | 'workspace_onboarding'
  | 'project_overview'
  | 'tasks'
  | 'kanban'
  | 'task_details'
  | 'team'
  | 'notifications'
  | 'calendar'
  | 'analytics'
  | 'settings'
  | 'dev_setup';

export interface WorkzenState {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  
  // Current Tenant & Session
  currentUser: User | null;
  authToken: string | null;
  isAuthenticated: boolean;
  pendingAuthEmail: string;
  setAuthToken: (token: string | null) => void;
  setCurrentUser: (user: User | null) => void;
  setPendingAuthEmail: (email: string) => void;
  logout: () => void;
  currentOrg: Organisation | null;
  currentWorkspace: Workspace | null;
  currentProject: Project | null;
  
  organisations: Organisation[];
  workspaces: Workspace[];
  projects: Project[];
  teamMembers: User[];
  
  tasks: Task[];
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  
  // Actions
  setCurrentOrg: (org: Organisation | null) => void;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  setCurrentProject: (project: Project | null) => void;
  updateTaskStatus: (taskId: string, status: any) => void;
  addTask: (task: Partial<Task>) => void;
  
  // Modals & UI Toggles
  isCreateTaskModalOpen: boolean;
  setCreateTaskModalOpen: (open: boolean) => void;
  isInviteMemberModalOpen: boolean;
  setInviteMemberModalOpen: (open: boolean) => void;
  isCreateOrgModalOpen: boolean;
  setCreateOrgModalOpen: (open: boolean) => void;
  isTransferOwnershipModalOpen: boolean;
  setTransferOwnershipModalOpen: (open: boolean) => void;
  isDeleteOrgModalOpen: boolean;
  setDeleteOrgModalOpen: (open: boolean) => void;
  isCreateWorkspaceModalOpen: boolean;
  setCreateWorkspaceModalOpen: (open: boolean) => void;
  isCreateProjectModalOpen: boolean;
  setCreateProjectModalOpen: (open: boolean) => void;
  isArchiveWorkspaceModalOpen: boolean;
  setArchiveWorkspaceModalOpen: (open: boolean) => void;
  workspaceToArchive: Workspace | null;
  setWorkspaceToArchive: (ws: Workspace | null) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  setProjects: (projects: Project[]) => void;
  orgMembers: any[];
  setOrgMembers: (members: any[]) => void;
  setOrganisations: (orgs: Organisation[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // RBAC State (Phase 8)
  roles: Role[];
  setRoles: (roles: Role[]) => void;
  userEffectivePermissions: UserEffectivePermissions | null;
  setUserEffectivePermissions: (perms: UserEffectivePermissions | null) => void;
  isCreateRoleModalOpen: boolean;
  setCreateRoleModalOpen: (open: boolean) => void;
  isEditRoleModalOpen: boolean;
  setEditRoleModalOpen: (open: boolean) => void;
  roleToEdit: Role | null;
  setRoleToEdit: (role: Role | null) => void;
  isDeleteRoleModalOpen: boolean;
  setDeleteRoleModalOpen: (open: boolean) => void;
  roleToDelete: Role | null;
  setRoleToDelete: (role: Role | null) => void;
  isAssignRoleModalOpen: boolean;
  setAssignRoleModalOpen: (open: boolean) => void;
  memberToAssignRole: any | null;
  setMemberToAssignRole: (member: any | null) => void;

  // Phase 9 Team Management State
  pendingInvitations: any[];
  setPendingInvitations: (invites: any[]) => void;
  isManageWorkspacesModalOpen: boolean;
  setManageWorkspacesModalOpen: (open: boolean) => void;
  memberToManageWorkspaces: any | null;
  setMemberToManageWorkspaces: (member: any | null) => void;
  isMemberStatusModalOpen: boolean;
  setMemberStatusModalOpen: (open: boolean) => void;
  memberToUpdateStatus: any | null;
  setMemberToUpdateStatus: (member: any | null) => void;
  isRemoveMemberModalOpen: boolean;
  setRemoveMemberModalOpen: (open: boolean) => void;
  memberToRemove: any | null;
  setMemberToRemove: (member: any | null) => void;
  isMemberDetailsDrawerOpen: boolean;
  setMemberDetailsDrawerOpen: (open: boolean) => void;
  selectedMemberDetails: any | null;
  setSelectedMemberDetails: (member: any | null) => void;
}


export const useWorkzenStore = create<WorkzenState>((set) => ({
  activeView: (typeof window !== 'undefined' && localStorage.getItem('workzen_auth_token')) ? 'enterprise_dashboard' : 'login',
  setActiveView: (view) => set({ activeView: view }),

  currentUser: typeof window !== 'undefined' && localStorage.getItem('workzen_user')
    ? (() => {
        try {
          return JSON.parse(localStorage.getItem('workzen_user')!);
        } catch {
          return null;
        }
      })()
    : null,
  authToken: typeof window !== 'undefined' ? localStorage.getItem('workzen_auth_token') : null,
  isAuthenticated: typeof window !== 'undefined' ? Boolean(localStorage.getItem('workzen_auth_token')) : false,
  pendingAuthEmail: '',
  setAuthToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('workzen_auth_token', token);
      } else {
        localStorage.removeItem('workzen_auth_token');
      }
    }
    apiClient.setAuthToken(token);
    set({ authToken: token, isAuthenticated: Boolean(token) });
  },
  setCurrentUser: (user) => {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('workzen_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('workzen_user');
      }
    }
    set({ currentUser: user });
  },
  setPendingAuthEmail: (email) => set({ pendingAuthEmail: email }),
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('workzen_auth_token');
      localStorage.removeItem('workzen_user');
    }
    apiClient.setAuthToken(null);
    set({
      authToken: null,
      isAuthenticated: false,
      currentUser: null,
      currentOrg: null,
      currentWorkspace: null,
      currentProject: null,
      organisations: [],
      workspaces: [],
      projects: [],
      teamMembers: [],
      tasks: [],
      selectedTaskId: null,
      notifications: [],
      roles: [],
      userEffectivePermissions: null,
      activeView: 'login'
    });
  },
  currentOrg: null,
  currentWorkspace: null,
  currentProject: null,

  organisations: [],
  workspaces: [],
  projects: [],
  teamMembers: [],

  tasks: [],
  selectedTaskId: null,
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),

  notifications: [],
  markNotificationAsRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) => n._id === id ? { ...n, isRead: true } : n)
  })),
  markAllNotificationsAsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, isRead: true }))
  })),

  setCurrentOrg: (org) => {
    apiClient.setActiveOrganisation(org?._id || null);
    set({ currentOrg: org });
  },
  setCurrentWorkspace: (workspace) => {
    apiClient.setActiveWorkspace(workspace?._id || null);
    set({ currentWorkspace: workspace });
  },
  setCurrentProject: (project) => set({ currentProject: project }),

  updateTaskStatus: (taskId, status) => set((state) => ({
    tasks: state.tasks.map((t) => t._id === taskId ? { ...t, status } : t)
  })),

  addTask: (newTask) => set((state) => {
    const orgId = state.currentOrg?._id || '';
    const wsId = state.currentWorkspace?._id || '';
    const prjId = state.currentProject?._id || '';
    const prjKey = state.currentProject?.key || 'TSK';
    const num = state.tasks.length + 1;
    const fullTask: Task = {
      _id: `tsk_${Date.now()}`,
      organisationId: orgId,
      workspaceId: wsId,
      projectId: prjId,
      taskNumber: num,
      taskKey: `${prjKey}-${num}`,
      title: newTask.title || 'Untitled Task',
      description: newTask.description || '',
      status: newTask.status || TASK_STATUS.TODO,
      priority: newTask.priority || TASK_PRIORITY.MEDIUM,
      assigneeIds: newTask.assigneeIds || (state.currentUser ? [state.currentUser._id] : []),
      assignees: state.currentUser ? [state.currentUser] : [],
      reporterId: state.currentUser?._id || '',
      reporter: state.currentUser as any,
      dueDate: newTask.dueDate || new Date().toISOString().split('T')[0],
      tags: newTask.tags || ['Task'],
      order: 0,
      subtaskCount: 0,
      completedSubtaskCount: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return { tasks: [fullTask, ...state.tasks] };
  }),

  isCreateTaskModalOpen: false,
  setCreateTaskModalOpen: (open) => set({ isCreateTaskModalOpen: open }),
  isInviteMemberModalOpen: false,
  setInviteMemberModalOpen: (open) => set({ isInviteMemberModalOpen: open }),

  isCreateOrgModalOpen: false,
  setCreateOrgModalOpen: (open) => set({ isCreateOrgModalOpen: open }),
  isTransferOwnershipModalOpen: false,
  setTransferOwnershipModalOpen: (open) => set({ isTransferOwnershipModalOpen: open }),
  isDeleteOrgModalOpen: false,
  setDeleteOrgModalOpen: (open) => set({ isDeleteOrgModalOpen: open }),
  isCreateWorkspaceModalOpen: false,
  setCreateWorkspaceModalOpen: (open) => set({ isCreateWorkspaceModalOpen: open }),
  isCreateProjectModalOpen: false,
  setCreateProjectModalOpen: (open) => set({ isCreateProjectModalOpen: open }),
  isArchiveWorkspaceModalOpen: false,
  setArchiveWorkspaceModalOpen: (open) => set({ isArchiveWorkspaceModalOpen: open }),
  workspaceToArchive: null,
  setWorkspaceToArchive: (ws) => set({ workspaceToArchive: ws }),
  setWorkspaces: (workspaces) => set({ workspaces }),
  setProjects: (projects) => set({ projects }),
  orgMembers: [],
  setOrgMembers: (members) => set({ orgMembers: members }),
  setOrganisations: (orgs) => set({ organisations: orgs }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // RBAC Initial State
  roles: [],
  setRoles: (roles) => set({ roles }),
  userEffectivePermissions: null,
  setUserEffectivePermissions: (perms) => set({ userEffectivePermissions: perms }),
  isCreateRoleModalOpen: false,
  setCreateRoleModalOpen: (open) => set({ isCreateRoleModalOpen: open }),
  isEditRoleModalOpen: false,
  setEditRoleModalOpen: (open) => set({ isEditRoleModalOpen: open }),
  roleToEdit: null,
  setRoleToEdit: (role) => set({ roleToEdit: role }),
  isDeleteRoleModalOpen: false,
  setDeleteRoleModalOpen: (open) => set({ isDeleteRoleModalOpen: open }),
  roleToDelete: null,
  setRoleToDelete: (role) => set({ roleToDelete: role }),
  isAssignRoleModalOpen: false,
  setAssignRoleModalOpen: (open) => set({ isAssignRoleModalOpen: open }),
  memberToAssignRole: null,
  setMemberToAssignRole: (member) => set({ memberToAssignRole: member }),

  // Phase 9 Team Management State
  pendingInvitations: [],
  setPendingInvitations: (invites) => set({ pendingInvitations: invites }),
  isManageWorkspacesModalOpen: false,
  setManageWorkspacesModalOpen: (open) => set({ isManageWorkspacesModalOpen: open }),
  memberToManageWorkspaces: null,
  setMemberToManageWorkspaces: (member) => set({ memberToManageWorkspaces: member }),
  isMemberStatusModalOpen: false,
  setMemberStatusModalOpen: (open) => set({ isMemberStatusModalOpen: open }),
  memberToUpdateStatus: null,
  setMemberToUpdateStatus: (member) => set({ memberToUpdateStatus: member }),
  isRemoveMemberModalOpen: false,
  setRemoveMemberModalOpen: (open) => set({ isRemoveMemberModalOpen: open }),
  memberToRemove: null,
  setMemberToRemove: (member) => set({ memberToRemove: member }),
  isMemberDetailsDrawerOpen: false,
  setMemberDetailsDrawerOpen: (open) => set({ isMemberDetailsDrawerOpen: open }),
  selectedMemberDetails: null,
  setSelectedMemberDetails: (member) => set({ selectedMemberDetails: member })
}));

// Automatically synchronize API 401 session expirations to trigger store logout and login view
apiClient.setOnAuthError(() => {
  useWorkzenStore.getState().logout();
});


