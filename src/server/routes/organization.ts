import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireOrgMember, requireOrgOwner } from '../middleware/tenant.js';
import { OrganisationController } from '../controllers/orgController.js';
import { WorkspaceController } from '../controllers/workspaceController.js';

export const organizationRouter = Router();

// All organization operations require authenticated user identity
organizationRouter.use(authenticate);

/**
 * @route   POST /api/v1/organizations
 * @desc    Create a new organization (caller becomes owner)
 * @access  Authenticated User
 */
organizationRouter.post('/', OrganisationController.create);

/**
 * @route   GET /api/v1/organizations
 * @desc    List all active organizations the caller belongs to
 * @access  Authenticated User
 */
organizationRouter.get('/', OrganisationController.list);

/**
 * @route   GET /api/v1/organizations/:organizationId
 * @desc    Get detailed organization tenancy information
 * @access  Active Organization Member
 */
organizationRouter.get('/:organizationId', requireOrgMember, OrganisationController.getById);

/**
 * @route   PATCH /api/v1/organizations/:organizationId
 * @desc    Update organization profile details
 * @access  Organization Owner Only
 */
organizationRouter.patch('/:organizationId', requireOrgOwner, OrganisationController.update);

/**
 * @route   PATCH /api/v1/organizations/:organizationId/settings
 * @desc    Update organization security and regional settings
 * @access  Organization Owner Only
 */
organizationRouter.patch('/:organizationId/settings', requireOrgOwner, OrganisationController.updateSettings);

/**
 * @route   PATCH /api/v1/organizations/:organizationId/logo
 * @desc    Update organization brand logo
 * @access  Organization Owner Only
 */
organizationRouter.patch('/:organizationId/logo', requireOrgOwner, OrganisationController.updateLogo);

/**
 * @route   POST /api/v1/organizations/:organizationId/select
 * @desc    Validate and switch active organization context
 * @access  Active Organization Member
 */
organizationRouter.post('/:organizationId/select', requireOrgMember, OrganisationController.select);

/**
 * @route   POST /api/v1/organizations/:organizationId/transfer-ownership
 * @desc    Transfer ownership to another active organization member
 * @access  Organization Owner Only
 */
organizationRouter.post('/:organizationId/transfer-ownership', requireOrgOwner, OrganisationController.transferOwnership);

/**
 * @route   DELETE /api/v1/organizations/:organizationId
 * @desc    Safely archive organization and deactivate workspace access
 * @access  Organization Owner Only
 */
organizationRouter.delete('/:organizationId', requireOrgOwner, OrganisationController.archive);

/**
 * @route   GET /api/v1/organizations/:organizationId/members
 * @desc    List active members belonging to this organization tenant
 * @access  Active Organization Member
 */
organizationRouter.get('/:organizationId/members', requireOrgMember, OrganisationController.listMembers);

/**
 * @route   POST /api/v1/organizations/:organizationId/workspaces
 * @desc    Create a new workspace within this organization
 * @access  Active Organization Member
 */
organizationRouter.post('/:organizationId/workspaces', requireOrgMember, WorkspaceController.create);

/**
 * @route   GET /api/v1/organizations/:organizationId/workspaces
 * @desc    List active workspaces within this organization
 * @access  Active Organization Member
 */
organizationRouter.get('/:organizationId/workspaces', requireOrgMember, WorkspaceController.list);


