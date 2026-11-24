import { OrgRole, WorkspaceRole, ProjectRole, PermissionKey } from '../constants/roles.js';
import { TaskStatus, TaskPriority, ProjectStatus, SubscriptionPlan } from '../constants/status.js';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  status: 'active' | 'suspended' | 'pending';
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organisation {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  industry?: string;
  organizationSize?: string;
  logoUrl?: string;
  website?: string;
  country?: string;
  timezone?: string;
  ownerId: string;
  status?: 'active' | 'archived';
  archivedAt?: string;
  plan: SubscriptionPlan;
  billingEmail?: string;
  seats: number;
  settings?: {
    allowedDomains?: string[];
    enforce2FA?: boolean;
    defaultMemberRole?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrganisationMembership {
  _id: string;
  organisationId: string;
  userId: string;
  role: OrgRole;
  status: 'active' | 'invited' | 'suspended' | 'deactivated';
  joinedAt: string;
  user?: User;
}

export interface WorkspaceMembership {
  _id: string;
  workspaceId: string;
  organisationId: string;
  userId: string;
  role: WorkspaceRole;
  status: 'active' | 'suspended';
  joinedAt: string;
  workspace?: Workspace;
  user?: User;
}

export interface WorkspaceSettings {
  defaultTaskView?: 'kanban' | 'list' | 'calendar' | 'timeline';
  allowGuestAccess?: boolean;
  requireApprovalForProjects?: boolean;
}

export interface Workspace {
  _id: string;
  organisationId: string;
  name: string;
  slug: string;
  description?: string;
  departmentId?: string;
  type?: 'engineering' | 'product' | 'marketing' | 'operations' | 'general' | string;
  icon?: string;
  logo?: string;
  themeColor?: string;
  isPrivate: boolean;
  status?: 'active' | 'archived';
  archivedAt?: string;
  archivedBy?: string;
  settings?: WorkspaceSettings;
  projectCount?: number;
  memberCount?: number;
  organisation?: {
    _id: string;
    name: string;
    slug: string;
  };
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Project {
  _id: string;
  organisationId: string;
  workspaceId: string;
  name: string;
  key: string;
  description?: string;
  status: ProjectStatus;
  priority: TaskPriority;
  color?: string;
  startDate?: string;
  targetDate?: string;
  leadId?: string;
  lead?: User;
  taskCount?: number;
  completedTaskCount?: number;
  createdAt: string;
}

export interface Task {
  _id: string;
  organisationId: string;
  workspaceId: string;
  projectId: string;
  taskNumber: number;
  taskKey: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeIds: string[];
  assignees?: User[];
  reporterId: string;
  reporter?: User;
  dueDate?: string;
  estimatedHours?: number;
  loggedHours?: number;
  tags: string[];
  order: number;
  subtaskCount?: number;
  completedSubtaskCount?: number;
  commentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  _id: string;
  organisationId: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  assigneeId?: string;
  dueDate?: string;
}

export interface Comment {
  _id: string;
  organisationId: string;
  taskId: string;
  authorId: string;
  author?: User;
  content: string;
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  organisationId: string;
  userId: string;
  type: 'task_assigned' | 'mention' | 'status_change' | 'comment' | 'deadline';
  title: string;
  message: string;
  entityType: 'task' | 'project' | 'organisation';
  entityId: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  organisationId: string;
  userId: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress: string;
  createdAt: string;
}

export interface Role {
  _id: string;
  organisationId: string;
  workspaceId?: string;
  name: string;
  slug: string;
  description: string;
  scope: 'organization' | 'workspace';
  isSystem: boolean;
  isDefault: boolean;
  permissions: string[];
  assignedCount?: number;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  _id?: string;
  key: string;
  name: string;
  description: string;
  category: 'Organization' | 'Workspace' | 'Projects' | 'Tasks' | 'Collaboration' | 'Reports';
  scope: 'organization' | 'workspace';
  isSystem?: boolean;
}

export interface RoleAssignment {
  _id: string;
  userId: string;
  roleId: string;
  organisationId: string;
  workspaceId?: string;
  scope: 'organization' | 'workspace';
  assignedBy: string;
  assignedAt: string;
  user?: User;
  role?: Role;
}

export interface UserEffectivePermissions {
  userId: string;
  organisationId: string;
  workspaceId?: string;
  isOwner: boolean;
  primaryRole: string;
  roles: Role[];
  permissions: string[];
}

export interface TeamInvitation {
  _id: string;
  organisationId: string;
  email: string;
  role: OrgRole;
  workspaceIds: string[];
  workspaces?: { _id: string; name: string; slug: string }[];
  invitedBy: { _id: string; firstName: string; lastName: string; email: string };
  token?: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  createdAt: string;
  updatedAt: string;
}

export interface TeamMemberProfile {
  _id: string;
  membershipId: string;
  organisationId: string;
  user: User;
  role: OrgRole;
  status: 'active' | 'invited' | 'suspended' | 'deactivated';
  joinedAt: string;
  workspaces: {
    _id: string;
    workspaceId: string;
    name: string;
    slug: string;
    role: WorkspaceRole;
    status: 'active' | 'suspended';
  }[];
  customRoles?: Role[];
}

export interface ResponseEnvelope<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

