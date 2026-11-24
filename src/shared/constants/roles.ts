export const ORG_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MANAGER: 'manager',
  MEMBER: 'member',
  VIEWER: 'viewer',
  GUEST: 'guest'
} as const;

export type OrgRole = typeof ORG_ROLES[keyof typeof ORG_ROLES];

export const WORKSPACE_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EDITOR: 'editor',
  MEMBER: 'member',
  VIEWER: 'viewer'
} as const;

export type WorkspaceRole = typeof WORKSPACE_ROLES[keyof typeof WORKSPACE_ROLES];

export const PROJECT_ROLES = {
  LEAD: 'lead',
  CONTRIBUTOR: 'contributor',
  OBSERVER: 'observer'
} as const;

export type ProjectRole = typeof PROJECT_ROLES[keyof typeof PROJECT_ROLES];

/**
 * Standardized 35 Granular Action Permissions across 6 SaaS Domains
 */
export const PERMISSIONS = {
  // Organization Domain (8)
  ORG_READ: 'org:read',
  ORG_UPDATE: 'org:update',
  ORG_MANAGE_SETTINGS: 'org:manage_settings',
  ORG_MANAGE_MEMBERS: 'org:manage_members',
  ORG_MANAGE_ROLES: 'org:manage_roles',
  ORG_MANAGE_PERMISSIONS: 'org:manage_permissions',
  ORG_ARCHIVE: 'org:archive',
  ORG_TRANSFER_OWNERSHIP: 'org:transfer_ownership',

  // Workspace Domain (7)
  WORKSPACE_READ: 'workspace:read',
  WORKSPACE_CREATE: 'workspace:create',
  WORKSPACE_UPDATE: 'workspace:update',
  WORKSPACE_MANAGE_SETTINGS: 'workspace:manage_settings',
  WORKSPACE_MANAGE_ACCESS: 'workspace:manage_access',
  WORKSPACE_MANAGE_ROLES: 'workspace:manage_roles',
  WORKSPACE_ARCHIVE: 'workspace:archive',

  // Projects Domain (5)
  PROJECT_READ: 'project:read',
  PROJECT_CREATE: 'project:create',
  PROJECT_UPDATE: 'project:update',
  PROJECT_DELETE: 'project:delete',
  PROJECT_MANAGE_SETTINGS: 'project:manage_settings',

  // Tasks Domain (6)
  TASK_READ: 'task:read',
  TASK_CREATE: 'task:create',
  TASK_UPDATE: 'task:update',
  TASK_DELETE: 'task:delete',
  TASK_ASSIGN: 'task:assign',
  TASK_MANAGE_STATUS: 'task:manage_status',

  // Collaboration Domain (6)
  COLLABORATION_READ: 'collaboration:read',
  COMMENT_CREATE: 'comment:create',
  COMMENT_UPDATE: 'comment:update',
  COMMENT_DELETE: 'comment:delete',
  FILE_UPLOAD: 'file:upload',
  FILE_MANAGE: 'file:manage',

  // Reports Domain (3)
  REPORT_READ: 'report:read',
  REPORT_GENERATE: 'report:generate',
  REPORT_EXPORT: 'report:export',

  // Legacy mappings for backwards compatibility
  ORG_DELETE: 'org:archive',
  ORG_MANAGE_BILLING: 'org:manage_settings',
  ORG_VIEW_AUDIT_LOGS: 'org:read',
  WORKSPACE_DELETE: 'workspace:archive',
  WORKSPACE_MANAGE_MEMBERS: 'workspace:manage_access',
  PROJECT_MANAGE_WORKFLOW: 'project:manage_settings',
  TASK_COMMENT: 'comment:create'
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export type PermissionCategory =
  | 'Organization'
  | 'Workspace'
  | 'Projects'
  | 'Tasks'
  | 'Collaboration'
  | 'Reports';

export interface PermissionDefinition {
  key: string;
  name: string;
  description: string;
  category: PermissionCategory;
  scope: 'organization' | 'workspace';
}

export const PERMISSION_CATALOGUE: PermissionDefinition[] = [
  // Organization
  {
    key: PERMISSIONS.ORG_READ,
    name: 'View Organization',
    description: 'View organization details, metadata, and active member list',
    category: 'Organization',
    scope: 'organization'
  },
  {
    key: PERMISSIONS.ORG_UPDATE,
    name: 'Update Organization',
    description: 'Update organization profile, display name, and brand styling',
    category: 'Organization',
    scope: 'organization'
  },
  {
    key: PERMISSIONS.ORG_MANAGE_SETTINGS,
    name: 'Manage Organization Settings',
    description: 'Configure multi-factor authentication, security policies, and billing',
    category: 'Organization',
    scope: 'organization'
  },
  {
    key: PERMISSIONS.ORG_MANAGE_MEMBERS,
    name: 'Manage Organization Members',
    description: 'Add, suspend, or remove members from the organization tenant',
    category: 'Organization',
    scope: 'organization'
  },
  {
    key: PERMISSIONS.ORG_MANAGE_ROLES,
    name: 'Manage Organization Roles',
    description: 'Create, modify, and assign organization and workspace roles',
    category: 'Organization',
    scope: 'organization'
  },
  {
    key: PERMISSIONS.ORG_MANAGE_PERMISSIONS,
    name: 'Manage Permission Grants',
    description: 'Delegate permissions to custom roles within authorized boundaries',
    category: 'Organization',
    scope: 'organization'
  },
  {
    key: PERMISSIONS.ORG_ARCHIVE,
    name: 'Archive Organization',
    description: 'Soft-archive the entire organization tenant with confirmation',
    category: 'Organization',
    scope: 'organization'
  },
  {
    key: PERMISSIONS.ORG_TRANSFER_OWNERSHIP,
    name: 'Transfer Ownership',
    description: 'Transfer primary ownership to another active member of the organization',
    category: 'Organization',
    scope: 'organization'
  },

  // Workspace
  {
    key: PERMISSIONS.WORKSPACE_READ,
    name: 'View Workspaces',
    description: 'Inspect workspace directories and accessible workspace overviews',
    category: 'Workspace',
    scope: 'workspace'
  },
  {
    key: PERMISSIONS.WORKSPACE_CREATE,
    name: 'Create Workspace',
    description: 'Provision new workspaces and agile squads within the organization',
    category: 'Workspace',
    scope: 'organization'
  },
  {
    key: PERMISSIONS.WORKSPACE_UPDATE,
    name: 'Update Workspace',
    description: 'Edit workspace profile, slug, department, and brand theme',
    category: 'Workspace',
    scope: 'workspace'
  },
  {
    key: PERMISSIONS.WORKSPACE_MANAGE_SETTINGS,
    name: 'Manage Workspace Settings',
    description: 'Configure operational defaults, task view policies, and approvals',
    category: 'Workspace',
    scope: 'workspace'
  },
  {
    key: PERMISSIONS.WORKSPACE_MANAGE_ACCESS,
    name: 'Manage Workspace Access',
    description: 'Control member privacy and access permissions for the workspace',
    category: 'Workspace',
    scope: 'workspace'
  },
  {
    key: PERMISSIONS.WORKSPACE_MANAGE_ROLES,
    name: 'Manage Workspace Roles',
    description: 'Assign and modify workspace-specific roles for squad members',
    category: 'Workspace',
    scope: 'workspace'
  },
  {
    key: PERMISSIONS.WORKSPACE_ARCHIVE,
    name: 'Archive Workspace',
    description: 'Soft-archive an agile workspace with name verification',
    category: 'Workspace',
    scope: 'workspace'
  },

  // Projects
  {
    key: PERMISSIONS.PROJECT_READ,
    name: 'View Projects',
    description: 'View project roadmaps, portfolio milestones, and summaries',
    category: 'Projects',
    scope: 'workspace'
  },
  {
    key: PERMISSIONS.PROJECT_CREATE,
    name: 'Create Projects',
    description: 'Initialize new projects and roadmaps within a workspace',
    category: 'Projects',
    scope: 'workspace'
  },
  {
    key: PERMISSIONS.PROJECT_UPDATE,
    name: 'Update Projects',
    description: 'Edit project details, timelines, status, and lead assignments',
    category: 'Projects',
    scope: 'workspace'
  },
  {
    key: PERMISSIONS.PROJECT_DELETE,
    name: 'Delete Projects',
    description: 'Remove or archive projects from the workspace backlog',
    category: 'Projects',
    scope: 'workspace'
  },
  {
    key: PERMISSIONS.PROJECT_MANAGE_SETTINGS,
    name: 'Manage Project Settings',
    description: 'Configure project workflow states, custom fields, and permissions',
    category: 'Projects',
    scope: 'workspace'
  },

  // Tasks
  {
    key: PERMISSIONS.TASK_READ,
    name: 'View Tasks',
    description: 'View sprint tasks, Kanban cards, task deep-dive details, and boards',
    category: 'Tasks',
    scope: 'workspace'
  },
  {
    key: PERMISSIONS.TASK_CREATE,
    name: 'Create Tasks',
    description: 'Add new backlog items, bugs, feature cards, and sprint tickets',
    category: 'Tasks',
    scope: 'workspace'
  },
  {
    key: PERMISSIONS.TASK_UPDATE,
    name: 'Update Tasks',
    description: 'Modify task titles, descriptions, due dates, and priority levels',
    category: 'Tasks',
    scope: 'workspace'
  },
  {
    key: PERMISSIONS.TASK_DELETE,
    name: 'Delete Tasks',
    description: 'Delete or remove tasks from Kanban boards and sprint backlogs',
    category: 'Tasks',
    scope: 'workspace'
  },
  {
    key: PERMISSIONS.TASK_ASSIGN,
    name: 'Assign Tasks',
    description: 'Assign or reassign tasks to team members within the workspace',
    category: 'Tasks',
    scope: 'workspace'
  },
  {
    key: PERMISSIONS.TASK_MANAGE_STATUS,
    name: 'Manage Task Status',
    description: 'Transition task workflow status (Backlog -> In Progress -> Review -> Done)',
    category: 'Tasks',
    scope: 'workspace'
  },

  // Collaboration
  {
    key: PERMISSIONS.COLLABORATION_READ,
    name: 'View Discussions',
    description: 'Read comments, discussions, activity feeds, and mentions',
    category: 'Collaboration',
    scope: 'workspace'
  },
  {
    key: PERMISSIONS.COMMENT_CREATE,
    name: 'Post Comments',
    description: 'Post comments and updates on tasks, issues, and project cards',
    category: 'Collaboration',
    scope: 'workspace'
  },
  {
    key: PERMISSIONS.COMMENT_UPDATE,
    name: 'Edit Comments',
    description: 'Modify authored comments and discussions',
    category: 'Collaboration',
    scope: 'workspace'
  },
  {
    key: PERMISSIONS.COMMENT_DELETE,
    name: 'Delete Comments',
    description: 'Remove comments from tasks and discussion streams',
    category: 'Collaboration',
    scope: 'workspace'
  },
  {
    key: PERMISSIONS.FILE_UPLOAD,
    name: 'Upload Files',
    description: 'Upload assets, specifications, and attachments to tasks and projects',
    category: 'Collaboration',
    scope: 'workspace'
  },
  {
    key: PERMISSIONS.FILE_MANAGE,
    name: 'Manage Files',
    description: 'Organize, rename, or delete file attachments',
    category: 'Collaboration',
    scope: 'workspace'
  },

  // Reports
  {
    key: PERMISSIONS.REPORT_READ,
    name: 'View Reports',
    description: 'Access sprint velocity, completion rates, and team analytics',
    category: 'Reports',
    scope: 'workspace'
  },
  {
    key: PERMISSIONS.REPORT_GENERATE,
    name: 'Generate Reports',
    description: 'Compile custom metrics, velocity benchmarks, and executive roadmaps',
    category: 'Reports',
    scope: 'organization'
  },
  {
    key: PERMISSIONS.REPORT_EXPORT,
    name: 'Export Reports',
    description: 'Export compliance, telemetry, and velocity data to CSV or PDF',
    category: 'Reports',
    scope: 'organization'
  }
];

/**
 * Standard System Role Permission Matrices
 */
export const DEFAULT_ORG_ROLE_PERMISSIONS: Record<string, string[]> = {
  [ORG_ROLES.OWNER]: PERMISSION_CATALOGUE.map((p) => p.key), // All 35 permissions
  [ORG_ROLES.ADMIN]: PERMISSION_CATALOGUE.filter(
    (p) => p.key !== PERMISSIONS.ORG_TRANSFER_OWNERSHIP && p.key !== PERMISSIONS.ORG_ARCHIVE
  ).map((p) => p.key),
  [ORG_ROLES.MANAGER]: [
    PERMISSIONS.ORG_READ,
    PERMISSIONS.ORG_MANAGE_MEMBERS,
    PERMISSIONS.WORKSPACE_READ,
    PERMISSIONS.WORKSPACE_CREATE,
    PERMISSIONS.WORKSPACE_UPDATE,
    PERMISSIONS.WORKSPACE_MANAGE_SETTINGS,
    PERMISSIONS.WORKSPACE_MANAGE_ACCESS,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_UPDATE,
    PERMISSIONS.PROJECT_MANAGE_SETTINGS,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_UPDATE,
    PERMISSIONS.TASK_ASSIGN,
    PERMISSIONS.TASK_MANAGE_STATUS,
    PERMISSIONS.COLLABORATION_READ,
    PERMISSIONS.COMMENT_CREATE,
    PERMISSIONS.FILE_UPLOAD,
    PERMISSIONS.REPORT_READ,
    PERMISSIONS.REPORT_GENERATE
  ],
  [ORG_ROLES.MEMBER]: [
    PERMISSIONS.ORG_READ,
    PERMISSIONS.WORKSPACE_READ,
    PERMISSIONS.WORKSPACE_CREATE,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_UPDATE,
    PERMISSIONS.TASK_MANAGE_STATUS,
    PERMISSIONS.COLLABORATION_READ,
    PERMISSIONS.COMMENT_CREATE,
    PERMISSIONS.FILE_UPLOAD,
    PERMISSIONS.REPORT_READ
  ],
  [ORG_ROLES.VIEWER]: [
    PERMISSIONS.ORG_READ,
    PERMISSIONS.WORKSPACE_READ,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.COLLABORATION_READ,
    PERMISSIONS.REPORT_READ
  ],
  [ORG_ROLES.GUEST]: [
    PERMISSIONS.WORKSPACE_READ,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.COLLABORATION_READ
  ]
};

export const DEFAULT_WORKSPACE_ROLE_PERMISSIONS: Record<string, string[]> = {
  [WORKSPACE_ROLES.ADMIN]: [
    PERMISSIONS.WORKSPACE_READ,
    PERMISSIONS.WORKSPACE_UPDATE,
    PERMISSIONS.WORKSPACE_MANAGE_SETTINGS,
    PERMISSIONS.WORKSPACE_MANAGE_ACCESS,
    PERMISSIONS.WORKSPACE_MANAGE_ROLES,
    PERMISSIONS.WORKSPACE_ARCHIVE,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_UPDATE,
    PERMISSIONS.PROJECT_DELETE,
    PERMISSIONS.PROJECT_MANAGE_SETTINGS,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_UPDATE,
    PERMISSIONS.TASK_DELETE,
    PERMISSIONS.TASK_ASSIGN,
    PERMISSIONS.TASK_MANAGE_STATUS,
    PERMISSIONS.COLLABORATION_READ,
    PERMISSIONS.COMMENT_CREATE,
    PERMISSIONS.COMMENT_UPDATE,
    PERMISSIONS.COMMENT_DELETE,
    PERMISSIONS.FILE_UPLOAD,
    PERMISSIONS.FILE_MANAGE,
    PERMISSIONS.REPORT_READ
  ],
  [WORKSPACE_ROLES.MANAGER]: [
    PERMISSIONS.WORKSPACE_READ,
    PERMISSIONS.WORKSPACE_UPDATE,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_UPDATE,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_UPDATE,
    PERMISSIONS.TASK_ASSIGN,
    PERMISSIONS.TASK_MANAGE_STATUS,
    PERMISSIONS.COLLABORATION_READ,
    PERMISSIONS.COMMENT_CREATE,
    PERMISSIONS.COMMENT_UPDATE,
    PERMISSIONS.FILE_UPLOAD,
    PERMISSIONS.REPORT_READ
  ],
  [WORKSPACE_ROLES.EDITOR]: [
    PERMISSIONS.WORKSPACE_READ,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_UPDATE,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_UPDATE,
    PERMISSIONS.TASK_MANAGE_STATUS,
    PERMISSIONS.COLLABORATION_READ,
    PERMISSIONS.COMMENT_CREATE,
    PERMISSIONS.FILE_UPLOAD
  ],
  [WORKSPACE_ROLES.MEMBER]: [
    PERMISSIONS.WORKSPACE_READ,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_UPDATE,
    PERMISSIONS.TASK_MANAGE_STATUS,
    PERMISSIONS.COLLABORATION_READ,
    PERMISSIONS.COMMENT_CREATE,
    PERMISSIONS.FILE_UPLOAD
  ],
  [WORKSPACE_ROLES.VIEWER]: [
    PERMISSIONS.WORKSPACE_READ,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.COLLABORATION_READ
  ]
};
