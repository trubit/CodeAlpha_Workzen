// tests/rbac.test.ts
// WORKZEN Enterprise RBAC, Roles & Granular Permissions Test Suite

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { AuthService } from '../src/server/services/authService.js';
import { OrganisationService } from '../src/server/services/orgService.js';
import { WorkspaceService } from '../src/server/services/workspaceService.js';
import { rbacService } from '../src/server/services/rbacService.js';
import { UserModel } from '../src/server/models/User.js';
import { OrganisationModel } from '../src/server/models/Organisation.js';
import { OrganisationMembershipModel } from '../src/server/models/OrganisationMembership.js';
import { WorkspaceModel } from '../src/server/models/Workspace.js';
import { RoleModel } from '../src/server/models/Role.js';
import { RoleAssignmentModel } from '../src/server/models/RoleAssignment.js';
import { AuditLogModel } from '../src/server/models/AuditLog.js';
import { PERMISSIONS, PERMISSION_CATALOGUE } from '../src/shared/constants/roles.js';
import { ENV } from '../src/server/config/env.js';

describe('Phase 8 — Enterprise RBAC and Permissions Management', () => {
  let ownerUser: any;
  let adminUser: any;
  let memberUser: any;
  let outsiderUser: any;
  let testOrg: any;
  let testWorkspace: any;
  let customRole: any;

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(ENV.MONGODB_URI);
    }

    // 1. Create Org Owner
    const ownerEmail = `rbac.owner.${Date.now()}@workzen.io`;
    const ownerReg = await AuthService.register({
      email: ownerEmail,
      password: 'OwnerPassword123!',
      firstName: 'Alex',
      lastName: 'Owner'
    });
    ownerUser = await UserModel.findById(ownerReg.id);

    // 2. Create Org Admin User
    const adminEmail = `rbac.admin.${Date.now()}@workzen.io`;
    const adminReg = await AuthService.register({
      email: adminEmail,
      password: 'AdminPassword123!',
      firstName: 'Sarah',
      lastName: 'Admin'
    });
    adminUser = await UserModel.findById(adminReg.id);

    // 3. Create Org Member User
    const memberEmail = `rbac.member.${Date.now()}@workzen.io`;
    const memberReg = await AuthService.register({
      email: memberEmail,
      password: 'MemberPassword123!',
      firstName: 'James',
      lastName: 'Member'
    });
    memberUser = await UserModel.findById(memberReg.id);

    // 4. Create Outsider User (no membership)
    const outsiderEmail = `rbac.outsider.${Date.now()}@workzen.io`;
    const outsiderReg = await AuthService.register({
      email: outsiderEmail,
      password: 'OutsiderPassword123!',
      firstName: 'David',
      lastName: 'Outsider'
    });
    outsiderUser = await UserModel.findById(outsiderReg.id);

    // 5. Create Parent Organization
    const { organisation } = await OrganisationService.createOrganisation(ownerUser._id.toString(), {
      name: `RBAC Acme Corp ${Date.now()}`,
      industry: 'Technology & Software'
    });
    testOrg = organisation;

    // Add admin and member to the organization
    await OrganisationMembershipModel.create({
      organisationId: testOrg._id,
      userId: adminUser._id,
      role: 'admin',
      status: 'active'
    });

    await OrganisationMembershipModel.create({
      organisationId: testOrg._id,
      userId: memberUser._id,
      role: 'member',
      status: 'active'
    });

    // Create a workspace
    const ws = await WorkspaceService.createWorkspace(
      testOrg._id.toString(),
      ownerUser._id.toString(),
      {
        name: 'Core Engineering',
        type: 'engineering',
        isPrivate: false
      }
    );
    testWorkspace = ws;
  });

  after(async () => {
    // Cleanup
    if (testOrg) {
      await RoleAssignmentModel.deleteMany({ organisationId: testOrg._id });
      await RoleModel.deleteMany({ organisationId: testOrg._id });
      await WorkspaceModel.deleteMany({ organisationId: testOrg._id });
      await OrganisationMembershipModel.deleteMany({ organisationId: testOrg._id });
      await OrganisationModel.findByIdAndDelete(testOrg._id);
    }
    if (ownerUser) await UserModel.findByIdAndDelete(ownerUser._id);
    if (adminUser) await UserModel.findByIdAndDelete(adminUser._id);
    if (memberUser) await UserModel.findByIdAndDelete(memberUser._id);
    if (outsiderUser) await UserModel.findByIdAndDelete(outsiderUser._id);

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  test('1. Permission Catalogue: Exposes all 35 standardized permissions across 6 categories', () => {
    assert.strictEqual(PERMISSION_CATALOGUE.length, 35);
    const categories = new Set(PERMISSION_CATALOGUE.map((p) => p.category));
    assert.deepStrictEqual(Array.from(categories).sort(), [
      'Collaboration',
      'Organization',
      'Projects',
      'Reports',
      'Tasks',
      'Workspace'
    ]);
  });

  test('2. Default Roles Seeding: Seeds 5 Org and 5 Workspace default system roles on organization setup', async () => {
    const roles = await rbacService.listRoles(testOrg._id.toString());
    assert.ok(roles.length >= 10, 'Expected at least 10 default system roles');

    const orgOwner = roles.find((r) => r.slug === 'org-owner');
    assert.ok(orgOwner);
    assert.strictEqual(orgOwner.isSystem, true);
    assert.strictEqual(orgOwner.scope, 'organization');
    assert.strictEqual(orgOwner.permissions.length, 35);

    const wsAdmin = roles.find((r) => r.slug === 'ws-admin');
    assert.ok(wsAdmin);
    assert.strictEqual(wsAdmin.isSystem, true);
    assert.strictEqual(wsAdmin.scope, 'workspace');
  });

  test('3. Organization Owner Invariant: Owner holds 100% of capabilities', async () => {
    const effective = await rbacService.getUserEffectivePermissions(
      ownerUser._id.toString(),
      testOrg._id.toString()
    );
    assert.strictEqual(effective.isOwner, true);
    assert.strictEqual(effective.permissions.length, 35);

    const hasDelete = await rbacService.hasPermission(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      PERMISSIONS.ORG_ARCHIVE
    );
    assert.strictEqual(hasDelete, true);
  });

  test('4. Standard Member Capabilities: Holds standard permissions without administrative grants', async () => {
    const effective = await rbacService.getUserEffectivePermissions(
      memberUser._id.toString(),
      testOrg._id.toString()
    );
    assert.strictEqual(effective.isOwner, false);
    assert.strictEqual(effective.primaryRole, 'member');

    // Can read tasks and workspaces
    assert.strictEqual(effective.permissions.includes(PERMISSIONS.WORKSPACE_READ), true);
    assert.strictEqual(effective.permissions.includes(PERMISSIONS.TASK_READ), true);

    // Cannot manage roles or transfer ownership
    assert.strictEqual(effective.permissions.includes(PERMISSIONS.ORG_MANAGE_ROLES), false);
    assert.strictEqual(effective.permissions.includes(PERMISSIONS.ORG_TRANSFER_OWNERSHIP), false);
  });

  test('5. Outsider Isolation: User without membership has 0 effective permissions', async () => {
    const effective = await rbacService.getUserEffectivePermissions(
      outsiderUser._id.toString(),
      testOrg._id.toString()
    );
    assert.strictEqual(effective.isOwner, false);
    assert.strictEqual(effective.permissions.length, 0);

    const hasAccess = await rbacService.hasPermission(
      outsiderUser._id.toString(),
      testOrg._id.toString(),
      PERMISSIONS.ORG_READ
    );
    assert.strictEqual(hasAccess, false);
  });

  test('6. Custom Role Creation: Authorized user creates custom role with delegated capabilities', async () => {
    const role = await rbacService.createCustomRole(
      testOrg._id.toString(),
      {
        name: 'QA Release Lead',
        description: 'Oversees sprint verification and quality gates',
        scope: 'workspace',
        workspaceId: testWorkspace._id.toString(),
        permissions: [
          PERMISSIONS.WORKSPACE_READ,
          PERMISSIONS.TASK_READ,
          PERMISSIONS.TASK_CREATE,
          PERMISSIONS.TASK_UPDATE,
          PERMISSIONS.REPORT_READ
        ]
      },
      ownerUser._id.toString(),
      ownerUser.email
    );

    assert.ok(role._id);
    assert.strictEqual(role.name, 'QA Release Lead');
    assert.strictEqual(role.slug, 'qa-release-lead');
    assert.strictEqual(role.isSystem, false);
    assert.strictEqual(role.permissions.length, 5);
    customRole = role;

    // Check audit log
    const audit = await AuditLogModel.findOne({
      organisationId: testOrg._id,
      entityType: 'role',
      action: 'ROLE_CREATED'
    });
    assert.ok(audit);
  });

  test('7. Anti-Privilege Escalation: Non-owner cannot delegate permissions they do not possess', async () => {
    // memberUser only has standard permissions, cannot grant 'org:manage_roles'
    await assert.rejects(
      async () => {
        await rbacService.createCustomRole(
          testOrg._id.toString(),
          {
            name: 'Escalated Admin',
            scope: 'organization',
            permissions: [PERMISSIONS.ORG_MANAGE_ROLES, PERMISSIONS.ORG_ARCHIVE]
          },
          memberUser._id.toString(),
          memberUser.email
        );
      },
      (err: any) => {
        assert.strictEqual(err.code, 'FORBIDDEN_PRIVILEGE_ESCALATION');
        return true;
      }
    );
  });

  test('8. System Role Immutability: System default roles cannot be altered or deleted', async () => {
    const orgAdminRole = await RoleModel.findOne({
      organisationId: testOrg._id,
      slug: 'org-admin'
    });
    assert.ok(orgAdminRole);

    await assert.rejects(
      async () => {
        await rbacService.updateCustomRole(
          orgAdminRole._id.toString(),
          { name: 'Renamed Admin' },
          ownerUser._id.toString(),
          testOrg._id.toString()
        );
      },
      (err: any) => {
        assert.strictEqual(err.code, 'FORBIDDEN_SYSTEM_ROLE_IMMUTABLE');
        return true;
      }
    );

    await assert.rejects(
      async () => {
        await rbacService.deleteCustomRole(
          orgAdminRole._id.toString(),
          orgAdminRole.name,
          ownerUser._id.toString(),
          testOrg._id.toString()
        );
      },
      (err: any) => {
        assert.strictEqual(err.code, 'FORBIDDEN_SYSTEM_ROLE_IMMUTABLE');
        return true;
      }
    );
  });

  test('9. Role Assignment: Assigns custom role to active member and verifies expanded permissions', async () => {
    const assignment = await rbacService.assignRole(
      memberUser._id.toString(),
      customRole._id.toString(),
      testOrg._id.toString(),
      testWorkspace._id.toString(),
      ownerUser._id.toString(),
      ownerUser.email
    );
    assert.ok(assignment._id);

    // Verify member effective permissions in the workspace context
    const effective = await rbacService.getUserEffectivePermissions(
      memberUser._id.toString(),
      testOrg._id.toString(),
      testWorkspace._id.toString()
    );
    assert.strictEqual(effective.permissions.includes(PERMISSIONS.REPORT_READ), true);
  });

  test('10. Anti-Self Promotion: Non-owner member cannot assign themselves an elevated role', async () => {
    const orgAdminRole = await RoleModel.findOne({
      organisationId: testOrg._id,
      slug: 'org-admin'
    });

    await assert.rejects(
      async () => {
        await rbacService.assignRole(
          memberUser._id.toString(),
          orgAdminRole!._id.toString(),
          testOrg._id.toString(),
          undefined,
          memberUser._id.toString(), // member self-promoting
          memberUser.email
        );
      },
      (err: any) => {
        assert.strictEqual(err.code, 'FORBIDDEN_SELF_PROMOTION');
        return true;
      }
    );
  });

  test('11. Protected Owner Invariant: Cannot revoke primary role from Organization Owner', async () => {
    const ownerRole = await RoleModel.findOne({
      organisationId: testOrg._id,
      slug: 'org-owner'
    });

    await assert.rejects(
      async () => {
        await rbacService.revokeRole(
          ownerUser._id.toString(),
          ownerRole!._id.toString(),
          testOrg._id.toString(),
          undefined,
          ownerUser._id.toString(),
          ownerUser.email
        );
      },
      (err: any) => {
        assert.strictEqual(err.code, 'FORBIDDEN_REVOKE_OWNER');
        return true;
      }
    );
  });

  test('12. Role Deletion Guard: Cannot delete role while active assignments exist', async () => {
    await assert.rejects(
      async () => {
        await rbacService.deleteCustomRole(
          customRole._id.toString(),
          customRole.name,
          ownerUser._id.toString(),
          testOrg._id.toString(),
          ownerUser.email
        );
      },
      (err: any) => {
        assert.strictEqual(err.code, 'ROLE_IN_USE');
        return true;
      }
    );

    // Revoke assignment first
    await rbacService.revokeRole(
      memberUser._id.toString(),
      customRole._id.toString(),
      testOrg._id.toString(),
      testWorkspace._id.toString(),
      ownerUser._id.toString(),
      ownerUser.email
    );

    // Mismatched confirmation name should fail
    await assert.rejects(
      async () => {
        await rbacService.deleteCustomRole(
          customRole._id.toString(),
          'Wrong Name',
          ownerUser._id.toString(),
          testOrg._id.toString()
        );
      },
      (err: any) => {
        assert.strictEqual(err.code, 'ROLE_NAME_MISMATCH');
        return true;
      }
    );

    // Exact name match succeeds
    await rbacService.deleteCustomRole(
      customRole._id.toString(),
      customRole.name,
      ownerUser._id.toString(),
      testOrg._id.toString(),
      ownerUser.email
    );

    const deleted = await RoleModel.findById(customRole._id);
    assert.strictEqual(deleted, null);
  });
});
