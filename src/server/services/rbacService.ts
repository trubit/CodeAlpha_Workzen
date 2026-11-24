import mongoose from 'mongoose';
import { RoleModel, IRoleDocument } from '../models/Role.js';
import { RoleAssignmentModel, IRoleAssignmentDocument } from '../models/RoleAssignment.js';
import { OrganisationModel } from '../models/Organisation.js';
import { OrganisationMembershipModel } from '../models/OrganisationMembership.js';
import { AuditLogModel } from '../models/AuditLog.js';
import {
  ORG_ROLES,
  WORKSPACE_ROLES,
  PERMISSIONS,
  PERMISSION_CATALOGUE,
  DEFAULT_ORG_ROLE_PERMISSIONS,
  DEFAULT_WORKSPACE_ROLE_PERMISSIONS,
  PermissionKey
} from '../../shared/constants/roles.js';
import {
  CreateRoleInput,
  UpdateRoleInput,
  AssignRoleInput
} from '../../shared/validation/rbac.js';

export interface EffectivePermissionsResult {
  userId: string;
  organisationId: string;
  workspaceId?: string;
  isOwner: boolean;
  primaryRole: string;
  roles: any[];
  permissions: string[];
}

export class RbacService {
  /**
   * Seeds default system roles for an organization if not already seeded
   */
  async seedDefaultRolesForOrg(
    organisationId: string | mongoose.Types.ObjectId,
    ownerId?: string | mongoose.Types.ObjectId
  ): Promise<void> {
    const orgObjectId = new mongoose.Types.ObjectId(organisationId);

    // 1. Organization-level System Roles
    const orgDefaults = [
      {
        name: 'Organization Owner',
        slug: 'org-owner',
        description: 'Full unrestricted governance across all organization and workspace assets.',
        scope: 'organization',
        isSystem: true,
        isDefault: false,
        permissions: DEFAULT_ORG_ROLE_PERMISSIONS[ORG_ROLES.OWNER]
      },
      {
        name: 'Organization Admin',
        slug: 'org-admin',
        description: 'Comprehensive administrative authority over members, security policies, and squads.',
        scope: 'organization',
        isSystem: true,
        isDefault: false,
        permissions: DEFAULT_ORG_ROLE_PERMISSIONS[ORG_ROLES.ADMIN]
      },
      {
        name: 'Organization Manager',
        slug: 'org-manager',
        description: 'Operational team leadership over workspaces, projects, backlogs, and reporting.',
        scope: 'organization',
        isSystem: true,
        isDefault: false,
        permissions: DEFAULT_ORG_ROLE_PERMISSIONS[ORG_ROLES.MANAGER]
      },
      {
        name: 'Organization Member',
        slug: 'org-member',
        description: 'Standard collaborative access across projects, backlogs, and sprints.',
        scope: 'organization',
        isSystem: true,
        isDefault: true,
        permissions: DEFAULT_ORG_ROLE_PERMISSIONS[ORG_ROLES.MEMBER]
      },
      {
        name: 'Organization Viewer',
        slug: 'org-viewer',
        description: 'Read-only observational access across dashboards, roadmaps, and reports.',
        scope: 'organization',
        isSystem: true,
        isDefault: false,
        permissions: DEFAULT_ORG_ROLE_PERMISSIONS[ORG_ROLES.VIEWER]
      }
    ];

    // 2. Workspace-level System Roles
    const wsDefaults = [
      {
        name: 'Workspace Admin',
        slug: 'ws-admin',
        description: 'Full administrative authority within the boundaries of a specific workspace.',
        scope: 'workspace',
        isSystem: true,
        isDefault: false,
        permissions: DEFAULT_WORKSPACE_ROLE_PERMISSIONS[WORKSPACE_ROLES.ADMIN]
      },
      {
        name: 'Workspace Manager',
        slug: 'ws-manager',
        description: 'Sprint planning and backlog coordination within a workspace.',
        scope: 'workspace',
        isSystem: true,
        isDefault: false,
        permissions: DEFAULT_WORKSPACE_ROLE_PERMISSIONS[WORKSPACE_ROLES.MANAGER]
      },
      {
        name: 'Workspace Editor',
        slug: 'ws-editor',
        description: 'Direct backlog contributor; can create and edit tasks, files, and roadmaps.',
        scope: 'workspace',
        isSystem: true,
        isDefault: false,
        permissions: DEFAULT_WORKSPACE_ROLE_PERMISSIONS[WORKSPACE_ROLES.EDITOR]
      },
      {
        name: 'Workspace Member',
        slug: 'ws-member',
        description: 'Standard squad member executing sprint tickets and Kanban tasks.',
        scope: 'workspace',
        isSystem: true,
        isDefault: true,
        permissions: DEFAULT_WORKSPACE_ROLE_PERMISSIONS[WORKSPACE_ROLES.MEMBER]
      },
      {
        name: 'Workspace Viewer',
        slug: 'ws-viewer',
        description: 'Read-only observer for sprint progress and task boards.',
        scope: 'workspace',
        isSystem: true,
        isDefault: false,
        permissions: DEFAULT_WORKSPACE_ROLE_PERMISSIONS[WORKSPACE_ROLES.VIEWER]
      }
    ];

    const allDefaults = [...orgDefaults, ...wsDefaults];

    for (const def of allDefaults) {
      await RoleModel.findOneAndUpdate(
        {
          organisationId: orgObjectId,
          scope: def.scope,
          slug: def.slug
        },
        {
          $setOnInsert: {
            ...def,
            organisationId: orgObjectId
          }
        },
        { upsert: true, new: true }
      );
    }

    // Assign owner role if ownerId is provided
    if (ownerId) {
      const ownerRole = await RoleModel.findOne({
        organisationId: orgObjectId,
        slug: 'org-owner'
      });
      if (ownerRole) {
        await RoleAssignmentModel.findOneAndUpdate(
          {
            organisationId: orgObjectId,
            userId: new mongoose.Types.ObjectId(ownerId),
            roleId: ownerRole._id
          },
          {
            $setOnInsert: {
              organisationId: orgObjectId,
              userId: new mongoose.Types.ObjectId(ownerId),
              roleId: ownerRole._id,
              scope: 'organization',
              assignedBy: new mongoose.Types.ObjectId(ownerId),
              assignedAt: new Date()
            }
          },
          { upsert: true }
        );
      }
    }
  }

  /**
   * Resolves effective permissions for a user within an organization (and optional workspace)
   */
  async getUserEffectivePermissions(
    userId: string | mongoose.Types.ObjectId,
    organisationId: string | mongoose.Types.ObjectId,
    workspaceId?: string | mongoose.Types.ObjectId
  ): Promise<EffectivePermissionsResult> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const orgObjectId = new mongoose.Types.ObjectId(organisationId);
    const wsObjectId = workspaceId ? new mongoose.Types.ObjectId(workspaceId) : undefined;

    // Check organization and owner status
    const organisation = await OrganisationModel.findById(orgObjectId);
    if (!organisation) {
      return {
        userId: userId.toString(),
        organisationId: organisationId.toString(),
        isOwner: false,
        primaryRole: 'none',
        roles: [],
        permissions: []
      };
    }

    const isOwner = organisation.ownerId.toString() === userId.toString();
    if (isOwner) {
      // Organization Owner holds 100% of permissions
      return {
        userId: userId.toString(),
        organisationId: organisationId.toString(),
        workspaceId: workspaceId?.toString(),
        isOwner: true,
        primaryRole: ORG_ROLES.OWNER,
        roles: [
          {
            name: 'Organization Owner',
            slug: 'org-owner',
            scope: 'organization',
            isSystem: true
          }
        ],
        permissions: PERMISSION_CATALOGUE.map((p) => p.key)
      };
    }

    // Verify active organization membership
    const membership = await OrganisationMembershipModel.findOne({
      organisationId: orgObjectId,
      userId: userObjectId,
      status: 'active'
    });

    if (!membership) {
      return {
        userId: userId.toString(),
        organisationId: organisationId.toString(),
        isOwner: false,
        primaryRole: 'none',
        roles: [],
        permissions: []
      };
    }

    const permissionSet = new Set<string>();
    const rolesList: any[] = [];

    // Add base membership permissions
    const basePerms = DEFAULT_ORG_ROLE_PERMISSIONS[membership.role] || [];
    basePerms.forEach((p) => permissionSet.add(p));

    // Fetch direct role assignments for this user in this organization
    const query: any = {
      organisationId: orgObjectId,
      userId: userObjectId
    };

    if (wsObjectId) {
      // Include org-level assignments AND specific workspace assignments
      query.$or = [{ workspaceId: null }, { workspaceId: wsObjectId }];
    } else {
      // Org-level assignments only
      query.workspaceId = null;
    }

    const assignments = await RoleAssignmentModel.find(query).populate('roleId');

    for (const assignment of assignments) {
      const role = assignment.roleId as any;
      if (role && Array.isArray(role.permissions)) {
        rolesList.push(role);
        role.permissions.forEach((p: string) => permissionSet.add(p));
      }
    }

    return {
      userId: userId.toString(),
      organisationId: organisationId.toString(),
      workspaceId: workspaceId?.toString(),
      isOwner: false,
      primaryRole: membership.role,
      roles: rolesList,
      permissions: Array.from(permissionSet)
    };
  }

  /**
   * Fast Boolean check if user holds a specific permission
   */
  async hasPermission(
    userId: string | mongoose.Types.ObjectId,
    organisationId: string | mongoose.Types.ObjectId,
    permission: PermissionKey | string,
    workspaceId?: string | mongoose.Types.ObjectId
  ): Promise<boolean> {
    const effective = await this.getUserEffectivePermissions(userId, organisationId, workspaceId);
    if (effective.isOwner) return true;
    return effective.permissions.includes(permission);
  }

  /**
   * Lists all roles for an organization (with active assigned member counts)
   */
  async listRoles(
    organisationId: string | mongoose.Types.ObjectId,
    workspaceId?: string | mongoose.Types.ObjectId
  ): Promise<IRoleDocument[]> {
    const orgObjectId = new mongoose.Types.ObjectId(organisationId);

    // Ensure default system roles are seeded
    await this.seedDefaultRolesForOrg(orgObjectId);

    const filter: any = { organisationId: orgObjectId };
    if (workspaceId) {
      filter.$or = [{ workspaceId: null }, { workspaceId: new mongoose.Types.ObjectId(workspaceId) }];
    }

    const roles = await RoleModel.find(filter).sort({ isSystem: -1, scope: 1, name: 1 });

    // Compute live assigned counts
    const roleIds = roles.map((r) => r._id);
    const counts = await RoleAssignmentModel.aggregate([
      { $match: { roleId: { $in: roleIds } } },
      { $group: { _id: '$roleId', count: { $sum: 1 } } }
    ]);

    const countMap = new Map<string, number>();
    counts.forEach((c) => countMap.set(c._id.toString(), c.count));

    return roles.map((r) => {
      const doc = r.toObject();
      doc.assignedCount = countMap.get(r._id.toString()) || 0;
      return doc;
    });
  }

  /**
   * Creates a custom role with anti-privilege escalation checks
   */
  async createCustomRole(
    organisationId: string | mongoose.Types.ObjectId,
    input: CreateRoleInput,
    actorId: string | mongoose.Types.ObjectId,
    actorEmail?: string
  ): Promise<IRoleDocument> {
    const orgObjectId = new mongoose.Types.ObjectId(organisationId);
    const actorObjectId = new mongoose.Types.ObjectId(actorId);

    // 1. Delegation Authority Check (Anti-Privilege Escalation):
    // Actor must possess all permissions they are delegating, unless they are the Owner
    const actorEffective = await this.getUserEffectivePermissions(actorId, organisationId);
    if (!actorEffective.isOwner) {
      const unpossessedPerms = input.permissions.filter(
        (p) => !actorEffective.permissions.includes(p)
      );
      if (unpossessedPerms.length > 0) {
        const error: any = new Error(
          `Privilege escalation detected: You cannot grant permissions you do not possess (${unpossessedPerms.join(', ')})`
        );
        error.code = 'FORBIDDEN_PRIVILEGE_ESCALATION';
        error.statusCode = 403;
        throw error;
      }
    }

    // 2. Generate slug if missing
    const slug =
      input.slug ||
      input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    // 3. Ensure slug uniqueness within scope
    const existing = await RoleModel.findOne({
      organisationId: orgObjectId,
      scope: input.scope,
      workspaceId: input.workspaceId ? new mongoose.Types.ObjectId(input.workspaceId) : null,
      slug
    });

    if (existing) {
      const error: any = new Error(`A role with slug '${slug}' already exists in this scope`);
      error.code = 'ROLE_SLUG_CONFLICT';
      error.statusCode = 409;
      throw error;
    }

    // 4. Create Role
    const role = await RoleModel.create({
      organisationId: orgObjectId,
      workspaceId: input.workspaceId ? new mongoose.Types.ObjectId(input.workspaceId) : null,
      name: input.name,
      slug,
      description: input.description || '',
      scope: input.scope,
      isSystem: false,
      isDefault: false,
      permissions: input.permissions,
      createdBy: actorObjectId,
      updatedBy: actorObjectId
    });

    // 5. Audit Log
    await AuditLogModel.create({
      organisationId: orgObjectId,
      userId: actorObjectId,
      userEmail: actorEmail || 'unknown@workzen.io',
      action: 'ROLE_CREATED',
      entityType: 'role',
      entityId: role._id.toString(),
      ipAddress: '127.0.0.1'
    });

    return role;
  }

  /**
   * Updates an existing custom role (protects system roles from alteration)
   */
  async updateCustomRole(
    roleId: string | mongoose.Types.ObjectId,
    input: UpdateRoleInput,
    actorId: string | mongoose.Types.ObjectId,
    organisationId: string | mongoose.Types.ObjectId,
    actorEmail?: string
  ): Promise<IRoleDocument> {
    const role = await RoleModel.findById(roleId);
    if (!role) {
      const error: any = new Error('Role not found');
      error.code = 'ROLE_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    if (role.isSystem) {
      const error: any = new Error('System default roles are immutable and cannot be modified');
      error.code = 'FORBIDDEN_SYSTEM_ROLE_IMMUTABLE';
      error.statusCode = 403;
      throw error;
    }

    // Anti-Privilege Escalation on permissions change
    if (input.permissions) {
      const actorEffective = await this.getUserEffectivePermissions(actorId, organisationId);
      if (!actorEffective.isOwner) {
        const unpossessed = input.permissions.filter(
          (p) => !actorEffective.permissions.includes(p)
        );
        if (unpossessed.length > 0) {
          const error: any = new Error(
            `Privilege escalation detected: You cannot grant permissions you do not possess (${unpossessed.join(', ')})`
          );
          error.code = 'FORBIDDEN_PRIVILEGE_ESCALATION';
          error.statusCode = 403;
          throw error;
        }
      }
      role.permissions = input.permissions;
    }

    if (input.name) role.name = input.name;
    if (input.description !== undefined) role.description = input.description;
    role.updatedBy = new mongoose.Types.ObjectId(actorId);

    await role.save();

    await AuditLogModel.create({
      organisationId: new mongoose.Types.ObjectId(organisationId),
      userId: new mongoose.Types.ObjectId(actorId),
      userEmail: actorEmail || 'unknown@workzen.io',
      action: 'ROLE_UPDATED',
      entityType: 'role',
      entityId: role._id.toString(),
      ipAddress: '127.0.0.1'
    });

    return role;
  }

  /**
   * Deletes a custom role (safeguarded against system roles and assigned users)
   */
  async deleteCustomRole(
    roleId: string | mongoose.Types.ObjectId,
    confirmName: string,
    actorId: string | mongoose.Types.ObjectId,
    organisationId: string | mongoose.Types.ObjectId,
    actorEmail?: string
  ): Promise<void> {
    const role = await RoleModel.findById(roleId);
    if (!role) {
      const error: any = new Error('Role not found');
      error.code = 'ROLE_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    if (role.isSystem) {
      const error: any = new Error('System default roles cannot be deleted');
      error.code = 'FORBIDDEN_SYSTEM_ROLE_IMMUTABLE';
      error.statusCode = 403;
      throw error;
    }

    if (role.name !== confirmName) {
      const error: any = new Error('Role confirmation name does not match');
      error.code = 'ROLE_NAME_MISMATCH';
      error.statusCode = 400;
      throw error;
    }

    // Check if role is currently assigned
    const activeAssignments = await RoleAssignmentModel.countDocuments({ roleId: role._id });
    if (activeAssignments > 0) {
      const error: any = new Error(
        `Cannot delete role '${role.name}': It is currently assigned to ${activeAssignments} active member(s). Reassign them first.`
      );
      error.code = 'ROLE_IN_USE';
      error.statusCode = 409;
      throw error;
    }

    await RoleModel.findByIdAndDelete(role._id);

    await AuditLogModel.create({
      organisationId: new mongoose.Types.ObjectId(organisationId),
      userId: new mongoose.Types.ObjectId(actorId),
      userEmail: actorEmail || 'unknown@workzen.io',
      action: 'ROLE_DELETED',
      entityType: 'role',
      entityId: role._id.toString(),
      ipAddress: '127.0.0.1'
    });
  }

  /**
   * Assigns a role to a member with anti-self promotion and owner protection
   */
  async assignRole(
    targetUserId: string | mongoose.Types.ObjectId,
    roleId: string | mongoose.Types.ObjectId,
    organisationId: string | mongoose.Types.ObjectId,
    workspaceId: string | mongoose.Types.ObjectId | undefined,
    actorId: string | mongoose.Types.ObjectId,
    actorEmail?: string
  ): Promise<IRoleAssignmentDocument> {
    const orgObjectId = new mongoose.Types.ObjectId(organisationId);
    const targetObjectId = new mongoose.Types.ObjectId(targetUserId);
    const roleObjectId = new mongoose.Types.ObjectId(roleId);
    const actorObjectId = new mongoose.Types.ObjectId(actorId);

    // 1. Verify target user is an active organization member
    const targetMembership = await OrganisationMembershipModel.findOne({
      organisationId: orgObjectId,
      userId: targetObjectId,
      status: 'active'
    });

    if (!targetMembership) {
      const error: any = new Error('Target user does not have active membership in this organization');
      error.code = 'TARGET_NOT_ORG_MEMBER';
      error.statusCode = 404;
      throw error;
    }

    // 2. Resolve Role
    const role = await RoleModel.findById(roleObjectId);
    if (!role) {
      const error: any = new Error('Role not found');
      error.code = 'ROLE_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    // 3. Protect Owner Invariant: Cannot assign 'org-owner' via role assignment
    // (Ownership transfer is reserved for Phase 6 transferOwnership endpoint)
    if (role.slug === 'org-owner') {
      const org = await OrganisationModel.findById(orgObjectId);
      if (org && org.ownerId.toString() !== targetUserId.toString()) {
        const error: any = new Error(
          'Organization Owner role cannot be assigned arbitrarily. Use Ownership Transfer.'
        );
        error.code = 'FORBIDDEN_OWNER_ROLE_ASSIGNMENT';
        error.statusCode = 403;
        throw error;
      }
    }

    // 4. Anti-Self Promotion: Non-owner actors cannot assign themselves roles with higher permissions
    if (actorId.toString() === targetUserId.toString()) {
      const actorEffective = await this.getUserEffectivePermissions(actorId, organisationId);
      if (!actorEffective.isOwner) {
        const unpossessed = role.permissions.filter(
          (p: string) => !actorEffective.permissions.includes(p)
        );
        if (unpossessed.length > 0) {
          const error: any = new Error('Self-promotion rejected: You cannot grant yourself elevated roles');
          error.code = 'FORBIDDEN_SELF_PROMOTION';
          error.statusCode = 403;
          throw error;
        }
      }
    }

    // 5. Create or Update Assignment
    const assignment = await RoleAssignmentModel.findOneAndUpdate(
      {
        organisationId: orgObjectId,
        workspaceId: workspaceId ? new mongoose.Types.ObjectId(workspaceId) : null,
        userId: targetObjectId,
        roleId: roleObjectId
      },
      {
        $set: {
          organisationId: orgObjectId,
          workspaceId: workspaceId ? new mongoose.Types.ObjectId(workspaceId) : null,
          userId: targetObjectId,
          roleId: roleObjectId,
          scope: role.scope,
          assignedBy: actorObjectId,
          assignedAt: new Date()
        }
      },
      { upsert: true, new: true }
    );

    // Sync primary membership role if assigning standard org role
    if (!workspaceId && role.scope === 'organization') {
      if (
        role.slug === 'org-admin' ||
        role.slug === 'org-manager' ||
        role.slug === 'org-member' ||
        role.slug === 'org-viewer'
      ) {
        const mappedRole = role.slug.replace('org-', '');
        await OrganisationMembershipModel.updateOne(
          { organisationId: orgObjectId, userId: targetObjectId },
          { $set: { role: mappedRole } }
        );
      }
    }

    // 6. Audit Logging
    await AuditLogModel.create({
      organisationId: orgObjectId,
      userId: actorObjectId,
      userEmail: actorEmail || 'unknown@workzen.io',
      action: 'ROLE_ASSIGNED',
      entityType: 'role_assignment',
      entityId: assignment._id.toString(),
      ipAddress: '127.0.0.1'
    });

    return assignment;
  }

  /**
   * Revokes a role assignment from a member (safeguarded against owner removal)
   */
  async revokeRole(
    targetUserId: string | mongoose.Types.ObjectId,
    roleId: string | mongoose.Types.ObjectId,
    organisationId: string | mongoose.Types.ObjectId,
    workspaceId: string | mongoose.Types.ObjectId | undefined,
    actorId: string | mongoose.Types.ObjectId,
    actorEmail?: string
  ): Promise<void> {
    const orgObjectId = new mongoose.Types.ObjectId(organisationId);
    const targetObjectId = new mongoose.Types.ObjectId(targetUserId);
    const roleObjectId = new mongoose.Types.ObjectId(roleId);

    // Prevent removing the Organization Owner
    const org = await OrganisationModel.findById(orgObjectId);
    if (org && org.ownerId.toString() === targetUserId.toString()) {
      const role = await RoleModel.findById(roleObjectId);
      if (role && role.slug === 'org-owner') {
        const error: any = new Error('Cannot revoke role from the primary Organization Owner');
        error.code = 'FORBIDDEN_REVOKE_OWNER';
        error.statusCode = 403;
        throw error;
      }
    }

    const deleted = await RoleAssignmentModel.findOneAndDelete({
      organisationId: orgObjectId,
      userId: targetObjectId,
      roleId: roleObjectId,
      workspaceId: workspaceId ? new mongoose.Types.ObjectId(workspaceId) : null
    });

    if (deleted) {
      await AuditLogModel.create({
        organisationId: orgObjectId,
        userId: new mongoose.Types.ObjectId(actorId),
        userEmail: actorEmail || 'unknown@workzen.io',
        action: 'ROLE_REVOKED',
        entityType: 'role_assignment',
        entityId: deleted._id.toString(),
        ipAddress: '127.0.0.1'
      });
    }
  }

  /**
   * Lists role assignments with populated user and role details
   */
  async listRoleAssignments(
    organisationId: string | mongoose.Types.ObjectId,
    workspaceId?: string | mongoose.Types.ObjectId
  ): Promise<any[]> {
    const orgObjectId = new mongoose.Types.ObjectId(organisationId);
    const filter: any = { organisationId: orgObjectId };

    if (workspaceId) {
      filter.workspaceId = new mongoose.Types.ObjectId(workspaceId);
    } else {
      filter.workspaceId = null;
    }

    return RoleAssignmentModel.find(filter)
      .populate('userId', 'firstName lastName email avatarUrl status')
      .populate('roleId', 'name slug scope isSystem permissions')
      .sort({ createdAt: -1 });
  }
}

export const rbacService = new RbacService();

