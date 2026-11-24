/**
 * Centralized Workzen Product Copywriting and Terminology Constants
 * Ensures consistent, professional, customer-facing language across the entire application.
 */

export const BRAND = {
  name: 'WORKZEN',
  legalName: 'WORKZEN Technologies Inc.',
  tagline: 'Plan Smarter. Work Together. Achieve More.',
  shortDescription: 'Enterprise project management and team collaboration SaaS platform.',
  fullDescription:
    'Workzen provides a unified workspace for agile squads and enterprise organizations to manage projects, track tasks, and collaborate with decisive clarity.',
  copyright: `© ${new Date().getFullYear()} WORKZEN Enterprise SaaS. All rights reserved.`
} as const;

export const TERMINOLOGY = {
  organization: 'Organization',
  organizations: 'Organizations',
  workspace: 'Workspace',
  workspaces: 'Workspaces',
  teamMember: 'Team Member',
  teamMembers: 'Team Members',
  project: 'Project',
  projects: 'Projects',
  task: 'Task',
  tasks: 'Tasks',
  subtask: 'Subtask',
  subtasks: 'Subtasks',
  role: 'Role',
  roles: 'Roles',
  permission: 'Permission',
  permissions: 'Permissions',
  invitation: 'Invitation',
  invitations: 'Invitations',
  owner: 'Owner',
  administrator: 'Administrator',
  member: 'Member',
  viewer: 'Viewer',
  access: 'Access',
  notification: 'Notification',
  notifications: 'Notifications',
  subscription: 'Subscription',
  auditTrail: 'Audit History'
} as const;

export const ACTION_LABELS = {
  createOrg: 'Create Organization',
  createWorkspace: 'Create Workspace',
  inviteMember: 'Invite Team Member',
  saveChanges: 'Save Changes',
  updateRole: 'Update Role',
  manageAccess: 'Manage Access',
  cancelInvitation: 'Cancel Invitation',
  resendInvitation: 'Resend Invitation',
  removeMember: 'Remove Member',
  deactivateMember: 'Deactivate Member',
  activateMember: 'Activate Member',
  archiveWorkspace: 'Archive Workspace',
  restoreWorkspace: 'Restore Workspace',
  signIn: 'Sign In',
  signOut: 'Sign Out',
  getStarted: 'Get Started Free',
  exploreApp: 'Explore Workspace'
} as const;

export const EMPTY_STATES = {
  noMembers: {
    title: 'No Additional Team Members',
    description: 'You are currently the only member of this organization. Invite colleagues to collaborate in one shared workspace.'
  },
  noInvitations: {
    title: 'No Pending Invitations',
    description: 'All invited members have accepted or no pending invitations exist.'
  },
  noWorkspaces: {
    title: 'No Workspaces Found',
    description: 'Create a workspace to organize your team projects and deliverables.'
  },
  noProjects: {
    title: 'No Active Projects',
    description: 'Get started by creating your first project in this workspace.'
  },
  noTasks: {
    title: 'No Tasks in Pipeline',
    description: 'Add a new task to begin organizing your work across the Kanban board.'
  },
  noAuditLogs: {
    title: 'No Audit History Recorded',
    description: 'Security and administrative actions will appear here automatically.'
  },
  noNotifications: {
    title: 'All Caught Up',
    description: 'You have no unread notifications or assignment alerts.'
  }
} as const;

export const SECURITY_MESSAGES = {
  dataIsolation: 'Dedicated organization data boundary and role-based access control.',
  sessionActive: 'Active encrypted session with automatic token refresh.',
  sessionExpired: 'Your session has expired. Please sign in again to continue.',
  passwordPolicy: 'Password must be at least 8 characters long and contain both letters and numbers.',
  lastOwnerProtection: 'Every organization must retain at least one active Owner. Transfer ownership before leaving or demoting.'
} as const;

export const ERROR_MESSAGES = {
  networkError: 'Unable to connect to the server. Please check your network connection and try again.',
  unauthorized: 'Your session has expired or you do not have permission to perform this action.',
  notFound: 'The requested resource could not be found.',
  genericFailure: 'Something went wrong while processing your request. Please try again.'
} as const;

