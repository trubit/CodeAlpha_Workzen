import { Router } from 'express';
import { rbacController } from '../controllers/rbacController.js';
import { authenticate } from '../middleware/auth.js';
import { requireOrgMember } from '../middleware/tenant.js';
import { requireWorkspaceAccess } from '../middleware/workspace.js';
import { requirePermission } from '../middleware/rbac.js';
import { PERMISSIONS } from '../../shared/constants/roles.js';

export const rbacRouter = Router();

// Publicly authenticated permission catalogue
rbacRouter.get('/permissions', authenticate, (req, res) =>
  rbacController.getPermissions(req, res)
);

// Single role CRUD (by roleId)
rbacRouter.get('/roles/:roleId', authenticate, (req, res) =>
  rbacController.getRole(req, res)
);

rbacRouter.patch('/roles/:roleId', authenticate, (req, res) =>
  rbacController.updateRole(req, res)
);

rbacRouter.delete('/roles/:roleId', authenticate, (req, res) =>
  rbacController.deleteRole(req, res)
);

// Organization-scoped RBAC routes
export const orgRbacRouter = Router({ mergeParams: true });

orgRbacRouter.use(authenticate);
orgRbacRouter.use(requireOrgMember);

orgRbacRouter.get('/my-permissions', (req, res) =>
  rbacController.getMyPermissions(req, res)
);

orgRbacRouter.get('/roles', requirePermission(PERMISSIONS.ORG_READ), (req, res) =>
  rbacController.listRoles(req, res)
);

orgRbacRouter.post(
  '/roles',
  requirePermission(PERMISSIONS.ORG_MANAGE_ROLES),
  (req, res) => rbacController.createRole(req, res)
);

orgRbacRouter.get(
  '/role-assignments',
  requirePermission(PERMISSIONS.ORG_MANAGE_ROLES),
  (req, res) => rbacController.listOrgRoleAssignments(req, res)
);

orgRbacRouter.post(
  '/members/:userId/roles',
  requirePermission(PERMISSIONS.ORG_MANAGE_ROLES),
  (req, res) => rbacController.assignOrgMemberRole(req, res)
);

orgRbacRouter.delete(
  '/members/:userId/roles/:roleId',
  requirePermission(PERMISSIONS.ORG_MANAGE_ROLES),
  (req, res) => rbacController.revokeOrgMemberRole(req, res)
);

orgRbacRouter.get(
  '/roles/audit-logs',
  requirePermission(PERMISSIONS.ORG_READ),
  (req, res) => rbacController.getRbacAuditLogs(req, res)
);

// Workspace-scoped RBAC routes
export const workspaceRbacRouter = Router({ mergeParams: true });

workspaceRbacRouter.use(authenticate);
workspaceRbacRouter.use(requireWorkspaceAccess);

workspaceRbacRouter.get(
  '/role-assignments',
  requirePermission(PERMISSIONS.WORKSPACE_MANAGE_ROLES, { scope: 'workspace' }),
  (req, res) => rbacController.listWorkspaceRoleAssignments(req, res)
);

workspaceRbacRouter.post(
  '/members/:userId/roles',
  requirePermission(PERMISSIONS.WORKSPACE_MANAGE_ROLES, { scope: 'workspace' }),
  (req, res) => rbacController.assignWorkspaceMemberRole(req, res)
);

workspaceRbacRouter.delete(
  '/members/:userId/roles/:roleId',
  requirePermission(PERMISSIONS.WORKSPACE_MANAGE_ROLES, { scope: 'workspace' }),
  (req, res) => rbacController.revokeWorkspaceMemberRole(req, res)
);

