import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ResponseEnvelope } from '../../shared/types/index.js';
import { rbacService } from '../services/rbacService.js';
import {
  PERMISSION_CATALOGUE,
  PERMISSIONS
} from '../../shared/constants/roles.js';
import {
  createRoleSchema,
  updateRoleSchema,
  assignRoleSchema,
  deleteRoleSchema
} from '../../shared/validation/rbac.js';
import { RoleModel } from '../models/Role.js';
import { AuditLogModel } from '../models/AuditLog.js';

export class RbacController {
  /**
   * GET /api/v1/permissions
   * Returns complete standardized permission catalogue
   */
  async getPermissions(req: Request, res: Response<ResponseEnvelope>): Promise<void> {
    const categories: Record<string, any[]> = {};
    for (const perm of PERMISSION_CATALOGUE) {
      if (!categories[perm.category]) {
        categories[perm.category] = [];
      }
      categories[perm.category].push(perm);
    }

    res.status(200).json({
      success: true,
      data: {
        total: PERMISSION_CATALOGUE.length,
        catalogue: PERMISSION_CATALOGUE,
        categories
      }
    });
  }

  /**
   * GET /api/v1/organizations/:organizationId/my-permissions
   * Returns authenticated caller's effective permissions in the organization
   */
  async getMyPermissions(req: Request, res: Response<ResponseEnvelope>): Promise<void> {
    const userId = req.user!.userId;
    const orgId = req.params.organizationId;
    const wsId = req.query.workspaceId as string | undefined;

    const effective = await rbacService.getUserEffectivePermissions(userId, orgId, wsId);

    res.status(200).json({
      success: true,
      data: effective
    });
  }

  /**
   * GET /api/v1/organizations/:organizationId/roles
   * Lists all available roles for the organization
   */
  async listRoles(req: Request, res: Response<ResponseEnvelope>): Promise<void> {
    const orgId = req.params.organizationId;
    const wsId = req.query.workspaceId as string | undefined;

    const roles = await rbacService.listRoles(orgId, wsId);

    res.status(200).json({
      success: true,
      data: roles
    });
  }

  /**
   * POST /api/v1/organizations/:organizationId/roles
   * Creates a new custom role
   */
  async createRole(req: Request, res: Response<ResponseEnvelope>): Promise<void> {
    const orgId = req.params.organizationId;
    const actorId = req.user!.userId;
    const actorEmail = req.user?.email;

    const parsed = createRoleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message || 'Invalid role payload',
          details: parsed.error.format()
        }
      });
      return;
    }

    const role = await rbacService.createCustomRole(orgId, parsed.data, actorId, actorEmail);

    res.status(201).json({
      success: true,
      data: role
    });
  }

  /**
   * GET /api/v1/roles/:roleId
   * Retrieves single role details
   */
  async getRole(req: Request, res: Response<ResponseEnvelope>): Promise<void> {
    const roleId = req.params.roleId;
    if (!mongoose.Types.ObjectId.isValid(roleId)) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_ROLE_ID', message: 'Invalid role ID format' }
      });
      return;
    }

    const role = await RoleModel.findById(roleId);
    if (!role) {
      res.status(404).json({
        success: false,
        error: { code: 'ROLE_NOT_FOUND', message: 'Role not found' }
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: role
    });
  }

  /**
   * PATCH /api/v1/roles/:roleId
   * Updates a custom role
   */
  async updateRole(req: Request, res: Response<ResponseEnvelope>): Promise<void> {
    const roleId = req.params.roleId;
    const actorId = req.user!.userId;
    const actorEmail = req.user?.email;

    if (!mongoose.Types.ObjectId.isValid(roleId)) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_ROLE_ID', message: 'Invalid role ID format' }
      });
      return;
    }

    const parsed = updateRoleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message || 'Invalid role update payload',
          details: parsed.error.format()
        }
      });
      return;
    }

    const existingRole = await RoleModel.findById(roleId);
    if (!existingRole) {
      res.status(404).json({
        success: false,
        error: { code: 'ROLE_NOT_FOUND', message: 'Role not found' }
      });
      return;
    }

    const updated = await rbacService.updateCustomRole(
      roleId,
      parsed.data,
      actorId,
      existingRole.organisationId.toString(),
      actorEmail
    );

    res.status(200).json({
      success: true,
      data: updated
    });
  }

  /**
   * DELETE /api/v1/roles/:roleId
   * Deletes a custom role
   */
  async deleteRole(req: Request, res: Response<ResponseEnvelope>): Promise<void> {
    const roleId = req.params.roleId;
    const actorId = req.user!.userId;
    const actorEmail = req.user?.email;

    if (!mongoose.Types.ObjectId.isValid(roleId)) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_ROLE_ID', message: 'Invalid role ID format' }
      });
      return;
    }

    const parsed = deleteRoleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message || 'Confirmation name is required'
        }
      });
      return;
    }

    const role = await RoleModel.findById(roleId);
    if (!role) {
      res.status(404).json({
        success: false,
        error: { code: 'ROLE_NOT_FOUND', message: 'Role not found' }
      });
      return;
    }

    await rbacService.deleteCustomRole(
      roleId,
      parsed.data.confirmName,
      actorId,
      role.organisationId.toString(),
      actorEmail
    );

    res.status(200).json({
      success: true,
      data: { message: `Role '${role.name}' was successfully deleted.` }
    });
  }

  /**
   * GET /api/v1/organizations/:organizationId/role-assignments
   * Lists role assignments in organization
   */
  async listOrgRoleAssignments(req: Request, res: Response<ResponseEnvelope>): Promise<void> {
    const orgId = req.params.organizationId;
    const assignments = await rbacService.listRoleAssignments(orgId);

    res.status(200).json({
      success: true,
      data: assignments
    });
  }

  /**
   * POST /api/v1/organizations/:organizationId/members/:userId/roles
   * Assigns a role to an organization member
   */
  async assignOrgMemberRole(req: Request, res: Response<ResponseEnvelope>): Promise<void> {
    const orgId = req.params.organizationId;
    const targetUserId = req.params.userId;
    const actorId = req.user!.userId;
    const actorEmail = req.user?.email;

    const parsed = assignRoleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message || 'Valid roleId is required'
        }
      });
      return;
    }

    const assignment = await rbacService.assignRole(
      targetUserId,
      parsed.data.roleId,
      orgId,
      parsed.data.workspaceId,
      actorId,
      actorEmail
    );

    res.status(200).json({
      success: true,
      data: assignment
    });
  }

  /**
   * DELETE /api/v1/organizations/:organizationId/members/:userId/roles/:roleId
   * Revokes a role assignment from an organization member
   */
  async revokeOrgMemberRole(req: Request, res: Response<ResponseEnvelope>): Promise<void> {
    const orgId = req.params.organizationId;
    const targetUserId = req.params.userId;
    const roleId = req.params.roleId;
    const workspaceId = req.query.workspaceId as string | undefined;
    const actorId = req.user!.userId;
    const actorEmail = req.user?.email;

    await rbacService.revokeRole(
      targetUserId,
      roleId,
      orgId,
      workspaceId,
      actorId,
      actorEmail
    );

    res.status(200).json({
      success: true,
      data: { message: 'Role assignment successfully revoked.' }
    });
  }

  /**
   * GET /api/v1/workspaces/:workspaceId/role-assignments
   * Lists role assignments within a workspace
   */
  async listWorkspaceRoleAssignments(
    req: Request,
    res: Response<ResponseEnvelope>
  ): Promise<void> {
    const ws = req.workspaceContext?.workspace;
    if (!ws) {
      res.status(404).json({
        success: false,
        error: { code: 'WORKSPACE_NOT_FOUND', message: 'Workspace not found' }
      });
      return;
    }

    const assignments = await rbacService.listRoleAssignments(
      ws.organisationId.toString(),
      ws._id.toString()
    );

    res.status(200).json({
      success: true,
      data: assignments
    });
  }

  /**
   * POST /api/v1/workspaces/:workspaceId/members/:userId/roles
   * Assigns a role to a workspace member
   */
  async assignWorkspaceMemberRole(
    req: Request,
    res: Response<ResponseEnvelope>
  ): Promise<void> {
    const ws = req.workspaceContext?.workspace;
    const targetUserId = req.params.userId;
    const actorId = req.user!.userId;
    const actorEmail = req.user?.email;

    if (!ws) {
      res.status(404).json({
        success: false,
        error: { code: 'WORKSPACE_NOT_FOUND', message: 'Workspace not found' }
      });
      return;
    }

    const parsed = assignRoleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message || 'Valid roleId is required'
        }
      });
      return;
    }

    const assignment = await rbacService.assignRole(
      targetUserId,
      parsed.data.roleId,
      ws.organisationId.toString(),
      ws._id.toString(),
      actorId,
      actorEmail
    );

    res.status(200).json({
      success: true,
      data: assignment
    });
  }

  /**
   * DELETE /api/v1/workspaces/:workspaceId/members/:userId/roles/:roleId
   * Revokes a workspace role assignment
   */
  async revokeWorkspaceMemberRole(
    req: Request,
    res: Response<ResponseEnvelope>
  ): Promise<void> {
    const ws = req.workspaceContext?.workspace;
    const targetUserId = req.params.userId;
    const roleId = req.params.roleId;
    const actorId = req.user!.userId;
    const actorEmail = req.user?.email;

    if (!ws) {
      res.status(404).json({
        success: false,
        error: { code: 'WORKSPACE_NOT_FOUND', message: 'Workspace not found' }
      });
      return;
    }

    await rbacService.revokeRole(
      targetUserId,
      roleId,
      ws.organisationId.toString(),
      ws._id.toString(),
      actorId,
      actorEmail
    );

    res.status(200).json({
      success: true,
      data: { message: 'Workspace role assignment revoked.' }
    });
  }

  /**
   * GET /api/v1/organizations/:organizationId/roles/audit-logs
   * Retrieves RBAC audit history
   */
  async getRbacAuditLogs(req: Request, res: Response<ResponseEnvelope>): Promise<void> {
    const orgId = req.params.organizationId;

    const logs = await AuditLogModel.find({
      organisationId: new mongoose.Types.ObjectId(orgId),
      entityType: { $in: ['role', 'permission', 'role_assignment'] }
    })
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      data: logs
    });
  }
}

export const rbacController = new RbacController();

