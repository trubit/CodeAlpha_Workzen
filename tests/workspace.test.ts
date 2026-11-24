// tests/workspace.test.ts
// WORKZEN Enterprise Workspace Management & Multi-Tenant Isolation Test Suite

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { AuthService } from '../src/server/services/authService.js';
import { OrganisationService } from '../src/server/services/orgService.js';
import { WorkspaceService } from '../src/server/services/workspaceService.js';
import { UserModel } from '../src/server/models/User.js';
import { OrganisationModel } from '../src/server/models/Organisation.js';
import { OrganisationMembershipModel } from '../src/server/models/OrganisationMembership.js';
import { WorkspaceModel } from '../src/server/models/Workspace.js';
import { SessionModel } from '../src/server/models/Session.js';
import { AuditLogModel } from '../src/server/models/AuditLog.js';
import { ENV } from '../src/server/config/env.js';

describe('Phase 7 — Complete Workspace Management System', () => {
  let ownerUser: any;
  let memberUser: any;
  let outsiderUser: any;
  let testOrgA: any;
  let testOrgB: any;
  let primaryWorkspace: any;

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(ENV.MONGODB_URI);
    }

    // 1. Create Org Owner
    const ownerEmail = `ws.owner.${Date.now()}@workzen.io`;
    const ownerReg = await AuthService.register({
      email: ownerEmail,
      password: 'OwnerPassword123!',
      firstName: 'Alex',
      lastName: 'Owner'
    });
    const ownerDoc = await UserModel.findById(ownerReg.id).select('+passwordResetOTP');
    await AuthService.verifyEmail(ownerEmail, ownerDoc!.passwordResetOTP!);
    ownerUser = await UserModel.findById(ownerReg.id);

    // 2. Create Org Member
    const memberEmail = `ws.member.${Date.now()}@workzen.io`;
    const memberReg = await AuthService.register({
      email: memberEmail,
      password: 'MemberPassword123!',
      firstName: 'Sarah',
      lastName: 'Member'
    });
    const memberDoc = await UserModel.findById(memberReg.id).select('+passwordResetOTP');
    await AuthService.verifyEmail(memberEmail, memberDoc!.passwordResetOTP!);
    memberUser = await UserModel.findById(memberReg.id);

    // 3. Create Outsider
    const outsiderEmail = `ws.outsider.${Date.now()}@workzen.io`;
    const outsiderReg = await AuthService.register({
      email: outsiderEmail,
      password: 'OutsiderPassword123!',
      firstName: 'David',
      lastName: 'Outsider'
    });
    const outsiderDoc = await UserModel.findById(outsiderReg.id).select('+passwordResetOTP');
    await AuthService.verifyEmail(outsiderEmail, outsiderDoc!.passwordResetOTP!);
    outsiderUser = await UserModel.findById(outsiderReg.id);

    // 4. Create Test Org A (owner is ownerUser, memberUser added as member)
    const orgResultA = await OrganisationService.createOrganisation(
      ownerUser._id.toString(),
      {
        name: `Acme Corp ${Date.now()}`,
        country: 'US',
        industry: 'Technology'
      }
    );
    testOrgA = orgResultA.organisation;

    // Add memberUser to Org A
    await OrganisationMembershipModel.create({
      organisationId: testOrgA._id,
      userId: memberUser._id,
      role: 'member',
      status: 'active'
    });

    // 5. Create Test Org B for outsider (Tenant B)
    const orgResultB = await OrganisationService.createOrganisation(
      outsiderUser._id.toString(),
      {
        name: `Outsider Corp ${Date.now()}`,
        country: 'GB',
        industry: 'Finance'
      }
    );
    testOrgB = orgResultB.organisation;
  });

  after(async () => {
    const userIds = [ownerUser?._id, memberUser?._id, outsiderUser?._id].filter(Boolean);
    if (userIds.length > 0) {
      const orgIds = [testOrgA?._id, testOrgB?._id].filter(Boolean);
      await WorkspaceModel.deleteMany({ organisationId: { $in: orgIds } });
      await OrganisationModel.deleteMany({ _id: { $in: orgIds } });
      await OrganisationMembershipModel.deleteMany({ userId: { $in: userIds } });
      await SessionModel.deleteMany({ userId: { $in: userIds } });
      await AuditLogModel.deleteMany({ userId: { $in: userIds } });
      await UserModel.deleteMany({ _id: { $in: userIds } });
    }

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  test('1. Workspace Creation: Creates workspace with auto-generated unique slug', async () => {
    const ws = await WorkspaceService.createWorkspace(
      testOrgA._id.toString(),
      ownerUser._id.toString(),
      {
        name: 'Engineering & Cloud Ops',
        description: 'Core platform services and infrastructure',
        type: 'engineering',
        themeColor: '#6366F1',
        isPrivate: false
      }
    );

    assert.ok(ws._id, 'Workspace should have an ID');
    assert.strictEqual(ws.name, 'Engineering & Cloud Ops');
    assert.strictEqual(ws.slug, 'engineering-cloud-ops');
    assert.strictEqual(ws.status, 'active');
    assert.strictEqual(ws.organisationId.toString(), testOrgA._id.toString());
    assert.strictEqual(ws.type, 'engineering');

    primaryWorkspace = ws;

    // Verify audit log
    const audit = await AuditLogModel.findOne({
      entityId: ws._id,
      action: 'WORKSPACE_CREATED'
    });
    assert.ok(audit, 'WORKSPACE_CREATED audit log must exist');
  });

  test('2. Slug Uniqueness Collision: Auto-generates unique suffix when duplicate name is provided without slug', async () => {
    const duplicateWs = await WorkspaceService.createWorkspace(
      testOrgA._id.toString(),
      ownerUser._id.toString(),
      {
        name: 'Engineering & Cloud Ops',
        description: 'Second workspace with same name'
      }
    );

    assert.ok(duplicateWs._id);
    assert.strictEqual(duplicateWs.slug, 'engineering-cloud-ops-1');
  });

  test('3. Explicit Duplicate Slug Conflict: Throws 409 when explicit conflicting slug is provided in same org', async () => {
    await assert.rejects(
      async () => {
        await WorkspaceService.createWorkspace(
          testOrgA._id.toString(),
          ownerUser._id.toString(),
          {
            name: 'Another Workspace',
            slug: 'engineering-cloud-ops'
          }
        );
      },
      (err: any) => {
        assert.strictEqual(err.statusCode, 409);
        assert.strictEqual(err.code, 'WORKSPACE_SLUG_CONFLICT');
        return true;
      }
    );
  });

  test('4. Cross-Tenant Slug Independence: Same slug allowed in a DIFFERENT organization', async () => {
    const wsOrgB = await WorkspaceService.createWorkspace(
      testOrgB._id.toString(),
      outsiderUser._id.toString(),
      {
        name: 'Engineering & Cloud Ops',
        slug: 'engineering-cloud-ops'
      }
    );

    assert.ok(wsOrgB._id);
    assert.strictEqual(wsOrgB.slug, 'engineering-cloud-ops');
    assert.strictEqual(wsOrgB.organisationId.toString(), testOrgB._id.toString());
  });

  test('5. Workspace Listing: Org member lists all active public workspaces in their org', async () => {
    const list = await WorkspaceService.listWorkspaces(
      testOrgA._id.toString(),
      memberUser._id.toString(),
      'member'
    );

    assert.ok(Array.isArray(list));
    assert.ok(list.length >= 2);
    const names = list.map((w) => w.name);
    assert.ok(names.includes('Engineering & Cloud Ops'));
  });

  test('6. Workspace Privacy Isolation: Regular member cannot see other user’s private workspace', async () => {
    // Owner creates a private workspace
    const privateWs = await WorkspaceService.createWorkspace(
      testOrgA._id.toString(),
      ownerUser._id.toString(),
      {
        name: 'Confidential Finance',
        isPrivate: true
      }
    );

    // Regular member lists workspaces
    const memberList = await WorkspaceService.listWorkspaces(
      testOrgA._id.toString(),
      memberUser._id.toString(),
      'member'
    );
    const memberIds = memberList.map((w) => w._id.toString());
    assert.strictEqual(memberIds.includes(privateWs._id.toString()), false, 'Private workspace must not be visible to regular member');

    // Org owner lists workspaces
    const ownerList = await WorkspaceService.listWorkspaces(
      testOrgA._id.toString(),
      ownerUser._id.toString(),
      'owner'
    );
    const ownerIds = ownerList.map((w) => w._id.toString());
    assert.ok(ownerIds.includes(privateWs._id.toString()), 'Org owner must be able to view all workspaces');
  });

  test('7. Workspace Details: Retrieves full workspace details with telemetry', async () => {
    const wsDetails = await WorkspaceService.getWorkspaceById(primaryWorkspace._id.toString());

    assert.strictEqual(wsDetails.name, 'Engineering & Cloud Ops');
    assert.strictEqual(wsDetails.status, 'active');
    assert.ok(wsDetails.organisationId);
    assert.strictEqual(typeof wsDetails.projectCount, 'number');
    assert.strictEqual(typeof wsDetails.taskCount, 'number');
  });

  test('8. Workspace Update: Updates name, description, and visual styling', async () => {
    const updated = await WorkspaceService.updateWorkspace(
      primaryWorkspace._id.toString(),
      ownerUser._id.toString(),
      {
        name: 'Core Engineering Platform',
        description: 'Updated description for cloud architecture',
        themeColor: '#10B981',
        type: 'engineering'
      }
    );

    assert.strictEqual(updated.name, 'Core Engineering Platform');
    assert.strictEqual(updated.description, 'Updated description for cloud architecture');
    assert.strictEqual(updated.themeColor, '#10B981');

    // Verify audit log
    const audit = await AuditLogModel.findOne({
      entityId: primaryWorkspace._id,
      action: 'WORKSPACE_UPDATED'
    });
    assert.ok(audit, 'WORKSPACE_UPDATED audit log must exist');
  });

  test('9. Workspace Settings Update: Updates operational policies', async () => {
    const updated = await WorkspaceService.updateSettings(
      primaryWorkspace._id.toString(),
      ownerUser._id.toString(),
      {
        defaultTaskView: 'calendar',
        allowGuestAccess: true,
        requireApprovalForProjects: true
      }
    );

    assert.strictEqual(updated.settings?.defaultTaskView, 'calendar');
    assert.strictEqual(updated.settings?.allowGuestAccess, true);
    assert.strictEqual(updated.settings?.requireApprovalForProjects, true);
  });

  test('10. Archive Workspace Name Mismatch: Rejects archive attempt if confirmation name does not match', async () => {
    await assert.rejects(
      async () => {
        await WorkspaceService.archiveWorkspace(
          primaryWorkspace._id.toString(),
          ownerUser._id.toString(),
          {
            confirmationName: 'WRONG_NAME'
          }
        );
      },
      (err: any) => {
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.code, 'CONFIRMATION_MISMATCH');
        return true;
      }
    );
  });

  test('11. Archive Workspace Success: Soft-archives workspace when confirmation name matches', async () => {
    const archived = await WorkspaceService.archiveWorkspace(
      primaryWorkspace._id.toString(),
      ownerUser._id.toString(),
      {
        confirmationName: 'Core Engineering Platform'
      }
    );

    assert.strictEqual(archived.status, 'archived');
    assert.ok(archived.archivedAt);
    assert.strictEqual(archived.archivedBy?.toString(), ownerUser._id.toString());

    // Verify audit log
    const audit = await AuditLogModel.findOne({
      entityId: primaryWorkspace._id,
      action: 'WORKSPACE_ARCHIVED'
    });
    assert.ok(audit, 'WORKSPACE_ARCHIVED audit log must exist');
  });

  test('12. Archived Workspace Mutation Guard: Cannot update an archived workspace', async () => {
    await assert.rejects(
      async () => {
        await WorkspaceService.updateWorkspace(
          primaryWorkspace._id.toString(),
          ownerUser._id.toString(),
          { name: 'Attempted Renaming' }
        );
      },
      (err: any) => {
        assert.strictEqual(err.statusCode, 403);
        assert.strictEqual(err.code, 'WORKSPACE_ARCHIVED');
        return true;
      }
    );
  });

  test('13. Restore Workspace: Reactivates an archived workspace', async () => {
    const restored = await WorkspaceService.restoreWorkspace(
      primaryWorkspace._id.toString(),
      ownerUser._id.toString()
    );

    assert.strictEqual(restored.status, 'active');
    assert.strictEqual(restored.archivedAt, undefined);

    const audit = await AuditLogModel.findOne({
      entityId: primaryWorkspace._id,
      action: 'WORKSPACE_RESTORED'
    });
    assert.ok(audit, 'WORKSPACE_RESTORED audit log must exist');
  });
});
