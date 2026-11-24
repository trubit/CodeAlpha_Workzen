import { Router } from 'express';
import { TeamController } from '../controllers/teamController.js';
import { authenticate } from '../middleware/auth.js';
import { requireOrgMember } from '../middleware/tenant.js';
import { requirePermission } from '../middleware/rbac.js';
import { PERMISSIONS } from '../../shared/constants/roles.js';

// Organization-scoped team router
export const orgTeamRouter = Router({ mergeParams: true });

orgTeamRouter.use(authenticate);
orgTeamRouter.use(requireOrgMember);

/**
 * @route   GET /api/v1/organizations/:organizationId/team/members
 * @desc    List members of an organization with search and filters
 * @access  Active Member (org:read)
 */
orgTeamRouter.get('/members', requirePermission(PERMISSIONS.ORG_READ), TeamController.listMembers);

/**
 * @route   GET /api/v1/organizations/:organizationId/team/members/:memberId
 * @desc    Get detailed profile and memberships of a single member
 * @access  Active Member (org:read)
 */
orgTeamRouter.get('/members/:memberId', requirePermission(PERMISSIONS.ORG_READ), TeamController.getMember);

/**
 * @route   PATCH /api/v1/organizations/:organizationId/team/members/:memberId/role
 * @desc    Update a member's organization role
 * @access  Admin/Owner (org:manage_roles)
 */
orgTeamRouter.patch('/members/:memberId/role', requirePermission(PERMISSIONS.ORG_MANAGE_ROLES), TeamController.updateRole);

/**
 * @route   PATCH /api/v1/organizations/:organizationId/team/members/:memberId/status
 * @desc    Suspend, deactivate, or reactivate a team member
 * @access  Admin/Owner (org:manage_members)
 */
orgTeamRouter.patch('/members/:memberId/status', requirePermission(PERMISSIONS.ORG_MANAGE_MEMBERS), TeamController.updateStatus);

/**
 * @route   DELETE /api/v1/organizations/:organizationId/team/members/:memberId
 * @desc    Safely remove member from organization
 * @access  Admin/Owner (org:manage_members)
 */
orgTeamRouter.delete('/members/:memberId', requirePermission(PERMISSIONS.ORG_MANAGE_MEMBERS), TeamController.removeMember);

/**
 * @route   PATCH /api/v1/organizations/:organizationId/team/members/:memberId/workspaces
 * @desc    Update workspace memberships for a team member
 * @access  Admin/Owner (workspace:manage_access)
 */
orgTeamRouter.patch(
  '/members/:memberId/workspaces',
  requirePermission(PERMISSIONS.WORKSPACE_MANAGE_ACCESS),
  TeamController.updateMemberWorkspaces
);

/**
 * @route   POST /api/v1/organizations/:organizationId/team/invitations
 * @desc    Invite a new member via corporate email
 * @access  Admin/Owner (org:manage_members)
 */
orgTeamRouter.post('/invitations', requirePermission(PERMISSIONS.ORG_MANAGE_MEMBERS), TeamController.createInvitation);

/**
 * @route   GET /api/v1/organizations/:organizationId/team/invitations
 * @desc    List active and pending invitations for this organization
 * @access  Admin/Owner (org:manage_members)
 */
orgTeamRouter.get('/invitations', requirePermission(PERMISSIONS.ORG_MANAGE_MEMBERS), TeamController.listInvitations);

/**
 * @route   POST /api/v1/organizations/:organizationId/team/invitations/:invitationId/resend
 * @desc    Resend invitation email with refreshed cryptographic token
 * @access  Admin/Owner (org:manage_members)
 */
orgTeamRouter.post(
  '/invitations/:invitationId/resend',
  requirePermission(PERMISSIONS.ORG_MANAGE_MEMBERS),
  TeamController.resendInvitation
);

/**
 * @route   DELETE /api/v1/organizations/:organizationId/team/invitations/:invitationId
 * @desc    Revoke or cancel a pending invitation
 * @access  Admin/Owner (org:manage_members)
 */
orgTeamRouter.delete(
  '/invitations/:invitationId',
  requirePermission(PERMISSIONS.ORG_MANAGE_MEMBERS),
  TeamController.cancelInvitation
);

/**
 * @route   GET /api/v1/organizations/:organizationId/team/audit
 * @desc    Retrieve chronological team and membership audit history
 * @access  Active Member (org:read)
 */
orgTeamRouter.get('/audit', requirePermission(PERMISSIONS.ORG_READ), TeamController.getAuditHistory);

// Global invitation acceptance router
export const publicInvitationRouter = Router();

/**
 * @route   GET /api/v1/invitations/verify
 * @desc    Public verification of invitation token
 * @access  Public
 */
publicInvitationRouter.get('/verify', TeamController.getInvitationByToken);

/**
 * @route   POST /api/v1/invitations/accept
 * @desc    Accept invitation and provision memberships for authenticated user
 * @access  Authenticated User
 */
publicInvitationRouter.post('/accept', authenticate, TeamController.acceptInvitation);

