// tests/team.test.ts
// WORKZEN Enterprise Team Management Test Suite (Phase 9)

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { AuthService } from '../src/server/services/authService.js';
import { OrganisationService } from '../src/server/services/orgService.js';
import { WorkspaceService } from '../src/server/services/workspaceService.js';
import { TeamService } from '../src/server/services/teamService.js';
import { UserModel } from '../src/server/models/User.js';
import { OrganisationModel } from '../src/server/models/Organisation.js';
import { OrganisationMembershipModel } from '../src/server/models/OrganisationMembership.js';
import { WorkspaceModel } from '../src/server/models/Workspace.js';
import { WorkspaceMembershipModel } from '../src/server/models/WorkspaceMembership.js';
import { InvitationModel } from '../src/server/models/Invitation.js';
import { AuditLogModel } from '../src/server/models/AuditLog.js';
import { ORG_ROLES, WORKSPACE_ROLES } from '../src/shared/constants/roles.js';
import { ENV } from '../src/server/config/env.js';

describe('Phase 9 — Enterprise Team Management System', () => {
  let ownerUser: any;
  let adminUser: any;
  let memberUser: any;
  let candidateUser: any;
  let testOrg: any;
  let secondOrg: any;
  let testWorkspace: any;
  let createdInvite: any;

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(ENV.MONGODB_URI);
    }

    // 1. Create Org Owner
    const ownerEmail = `team.owner.${Date.now()}@workzen.io`;
    const ownerReg = await AuthService.register({
      email: ownerEmail,
      password: 'OwnerPassword123!',
      firstName: 'Alex',
      lastName: 'Owner'
    });
    ownerUser = await UserModel.findById(ownerReg.id);

    // 2. Create Admin User
    const adminEmail = `team.admin.${Date.now()}@workzen.io`;
    const adminReg = await AuthService.register({
      email: adminEmail,
      password: 'AdminPassword123!',
      firstName: 'Sarah',
      lastName: 'Admin'
    });
    adminUser = await UserModel.findById(adminReg.id);

    // 3. Create Regular Member User
    const memberEmail = `team.member.${Date.now()}@workzen.io`;
    const memberReg = await AuthService.register({
      email: memberEmail,
      password: 'MemberPassword123!',
      firstName: 'Marcus',
      lastName: 'Vance'
    });
    memberUser = await UserModel.findById(memberReg.id);

    // 4. Create Candidate User for Invitation Acceptance
    const candidateEmail = `team.candidate.${Date.now()}@workzen.io`;
    const candidateReg = await AuthService.register({
      email: candidateEmail,
      password: 'CandidatePassword123!',
      firstName: 'Elena',
      lastName: 'Rostova'
    });
    candidateUser = await UserModel.findById(candidateReg.id);

    // 5. Create Test Organization (owner is ownerUser)
    const orgRes1 = await OrganisationService.createOrganisation(ownerUser._id.toString(), {
      name: `Acme Team Corp ${Date.now()}`,
      industry: 'technology',
      organizationSize: '11-50'
    });
    testOrg = orgRes1.organisation;

    // 6. Create Second Organization (for tenant isolation tests)
    const orgRes2 = await OrganisationService.createOrganisation(ownerUser._id.toString(), {
      name: `Second Isolation Corp ${Date.now()}`,
      industry: 'technology',
      organizationSize: '1-10'
    });
    secondOrg = orgRes2.organisation;

    // 7. Add admin and member to testOrg
    await OrganisationMembershipModel.create({
      organisationId: testOrg._id,
      userId: adminUser._id,
      role: ORG_ROLES.ADMIN,
      status: 'active'
    });

    await OrganisationMembershipModel.create({
      organisationId: testOrg._id,
      userId: memberUser._id,
      role: ORG_ROLES.MEMBER,
      status: 'active'
    });

    // 8. Create a test workspace in testOrg
    testWorkspace = await WorkspaceService.createWorkspace(
      testOrg._id.toString(),
      ownerUser._id.toString(),
      {
        name: 'Engineering Workspace',
        type: 'engineering',
        themeColor: '#6366F1'
      }
    );
  });

  after(async () => {
    // Clean up test data
    if (testOrg) {
      await OrganisationModel.deleteMany({ _id: { $in: [testOrg._id, secondOrg?._id] } });
      await OrganisationMembershipModel.deleteMany({ organisationId: { $in: [testOrg._id, secondOrg?._id] } });
      await WorkspaceModel.deleteMany({ organisationId: { $in: [testOrg._id, secondOrg?._id] } });
      await WorkspaceMembershipModel.deleteMany({ organisationId: { $in: [testOrg._id, secondOrg?._id] } });
      await InvitationModel.deleteMany({ organisationId: { $in: [testOrg._id, secondOrg?._id] } });
      await AuditLogModel.deleteMany({ organisationId: { $in: [testOrg._id, secondOrg?._id] } });
    }
    if (ownerUser) {
      await UserModel.deleteMany({
        _id: { $in: [ownerUser._id, adminUser?._id, memberUser?._id, candidateUser?._id] }
      });
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  test('1. Member Directory: Lists all members with pagination and search', async () => {
    const result = await TeamService.listMembers(testOrg._id.toString(), { page: 1, limit: 10 });
    assert.strictEqual(result.members.length, 3, 'Should list exactly 3 members in test organization');
    assert.strictEqual(result.meta.total, 3);

    // Search by name
    const searchByName = await TeamService.listMembers(testOrg._id.toString(), { search: 'Marcus' });
    assert.strictEqual(searchByName.members.length, 1);
    assert.strictEqual(searchByName.members[0].user.firstName, 'Marcus');

    // Search by email
    const searchByEmail = await TeamService.listMembers(testOrg._id.toString(), { search: adminUser.email });
    assert.strictEqual(searchByEmail.members.length, 1);
    assert.strictEqual(searchByEmail.members[0].user.email, adminUser.email);
  });

  test('2. Tenant Isolation: Members of other orgs are not exposed', async () => {
    const secondOrgMembers = await TeamService.listMembers(secondOrg._id.toString());
    assert.strictEqual(secondOrgMembers.members.length, 1, 'Second org should only have its owner');
    assert.strictEqual(secondOrgMembers.members[0].user.email, ownerUser.email);
  });

  test('3. Workspace Membership: Assigns workspace access to active member', async () => {
    const updated = await TeamService.updateMemberWorkspaces(
      testOrg._id.toString(),
      ownerUser._id.toString(),
      memberUser._id.toString(),
      [{ workspaceId: testWorkspace._id.toString(), role: WORKSPACE_ROLES.MEMBER }]
    );

    assert.strictEqual(updated.length, 1);
    assert.strictEqual(updated[0].workspaceId.toString(), testWorkspace._id.toString());

    // Verify member details reflects the workspace assignment
    const details = await TeamService.getMemberDetails(testOrg._id.toString(), memberUser._id.toString());
    assert.strictEqual(details.workspaces.length, 1);
    assert.strictEqual(details.workspaces[0].name, 'Engineering Workspace');
  });

  test('4. Cross-Tenant Workspace Rejection: Cannot assign workspace from another org', async () => {
    const otherWs = await WorkspaceService.createWorkspace(
      secondOrg._id.toString(),
      ownerUser._id.toString(),
      { name: 'Second Org Secret Ws' }
    );

    await assert.rejects(
      async () => {
        await TeamService.updateMemberWorkspaces(
          testOrg._id.toString(),
          ownerUser._id.toString(),
          memberUser._id.toString(),
          [{ workspaceId: otherWs._id.toString(), role: WORKSPACE_ROLES.MEMBER }]
        );
      },
      (err: any) => err.code === 'INVALID_WORKSPACE_SELECTION'
    );
  });

  test('5. Invitation Creation: Creates cryptographically hashed invitation and emails user', async () => {
    const candidateEmail = candidateUser.email;
    createdInvite = await TeamService.createInvitation(
      testOrg._id.toString(),
      ownerUser._id.toString(),
      {
        email: candidateEmail,
        role: ORG_ROLES.MANAGER,
        workspaceIds: [testWorkspace._id.toString()]
      }
    );

    assert.ok(createdInvite._id);
    assert.strictEqual(createdInvite.email, candidateEmail);
    assert.strictEqual(createdInvite.role, ORG_ROLES.MANAGER);
    assert.strictEqual(createdInvite.status, 'pending');
    assert.ok(createdInvite.tokenHash, 'Must have cryptographic tokenHash');
    assert.ok(createdInvite.token, 'Raw token generated');
    assert.ok(createdInvite.expiresAt > new Date(), 'Expires in future');
  });

  test('6. Duplicate Invitation Prevention: Throws 409 when invite is already active', async () => {
    await assert.rejects(
      async () => {
        await TeamService.createInvitation(
          testOrg._id.toString(),
          ownerUser._id.toString(),
          { email: candidateUser.email, role: ORG_ROLES.MEMBER }
        );
      },
      (err: any) => err.code === 'INVITATION_ALREADY_PENDING'
    );
  });

  test('7. Existing Member Invitation Prevention: Throws 409 if user is already a member', async () => {
    await assert.rejects(
      async () => {
        await TeamService.createInvitation(
          testOrg._id.toString(),
          ownerUser._id.toString(),
          { email: adminUser.email, role: ORG_ROLES.MEMBER }
        );
      },
      (err: any) => err.code === 'MEMBER_ALREADY_EXISTS'
    );
  });

  test('8. Invitation Verification: Retrieves public-safe details by token', async () => {
    const details = await TeamService.getInvitationByToken(createdInvite.token);
    assert.strictEqual(details.email, candidateUser.email);
    assert.strictEqual(details.role, ORG_ROLES.MANAGER);
    assert.strictEqual((details.organisation as any).name, testOrg.name);
    assert.strictEqual(details.workspaces.length, 1);
  });

  test('9. Invitation Resend: Refreshes token and resets expiration window', async () => {
    const originalToken = createdInvite.token;
    const resent = await TeamService.resendInvitation(
      testOrg._id.toString(),
      ownerUser._id.toString(),
      createdInvite._id.toString()
    );

    assert.notStrictEqual(resent.token, originalToken, 'Must generate new token on resend');
    assert.strictEqual(resent.status, 'pending');
    createdInvite = resent; // Update reference with refreshed token
  });

  test('10. Invitation Acceptance: Provisions org and workspace memberships safely', async () => {
    const result = await TeamService.acceptInvitation(candidateUser._id.toString(), createdInvite.token);
    assert.strictEqual(result.accepted, true);
    assert.strictEqual(result.role, ORG_ROLES.MANAGER);

    // Verify candidate is now an active member
    const candidateMembership = await OrganisationMembershipModel.findOne({
      organisationId: testOrg._id,
      userId: candidateUser._id
    });
    assert.ok(candidateMembership);
    assert.strictEqual(candidateMembership.status, 'active');
    assert.strictEqual(candidateMembership.role, ORG_ROLES.MANAGER);

    // Verify candidate has workspace access
    const candidateWs = await WorkspaceMembershipModel.findOne({
      workspaceId: testWorkspace._id,
      userId: candidateUser._id
    });
    assert.ok(candidateWs);
    assert.strictEqual(candidateWs.status, 'active');

    // Verify invitation is now marked accepted
    const inviteDoc = await InvitationModel.findById(createdInvite._id);
    assert.strictEqual(inviteDoc.status, 'accepted');
  });

  test('11. Reuse Prevention: Cannot accept an already accepted invitation', async () => {
    await assert.rejects(
      async () => {
        await TeamService.acceptInvitation(candidateUser._id.toString(), createdInvite.token);
      },
      (err: any) => err.code === 'INVITATION_INACTIVE'
    );
  });

  test('12. Invitation Cancellation: Revokes pending invitation', async () => {
    const cancelInvite = await TeamService.createInvitation(
      testOrg._id.toString(),
      ownerUser._id.toString(),
      { email: `temporary.${Date.now()}@test.io`, role: ORG_ROLES.VIEWER }
    );

    const cancelled = await TeamService.cancelInvitation(
      testOrg._id.toString(),
      ownerUser._id.toString(),
      cancelInvite._id.toString()
    );
    assert.strictEqual(cancelled.cancelled, true);

    const doc = await InvitationModel.findById(cancelInvite._id);
    assert.strictEqual(doc.status, 'revoked');
  });

  test('13. Member Role Mutation: Updates role and blocks owner demotion', async () => {
    // 1. Promote member to manager
    const updated = await TeamService.updateMemberRole(
      testOrg._id.toString(),
      ownerUser._id.toString(),
      memberUser._id.toString(),
      ORG_ROLES.MANAGER
    );
    assert.strictEqual(updated.role, ORG_ROLES.MANAGER);

    // 2. Anti-Privilege Escalation: Cannot grant owner role via member role update
    await assert.rejects(
      async () => {
        await TeamService.updateMemberRole(
          testOrg._id.toString(),
          ownerUser._id.toString(),
          memberUser._id.toString(),
          ORG_ROLES.OWNER
        );
      },
      (err: any) => err.code === 'OWNER_ROLE_FORBIDDEN'
    );

    // 3. Last-Owner Protection Invariant: Cannot mutate owner role
    await assert.rejects(
      async () => {
        await TeamService.updateMemberRole(
          testOrg._id.toString(),
          ownerUser._id.toString(),
          ownerUser._id.toString(),
          ORG_ROLES.MEMBER
        );
      },
      (err: any) => err.code === 'CANNOT_MUTATE_OWNER_ROLE'
    );
  });

  test('14. Member Status Lifecycle: Deactivates and reactivates member', async () => {
    // 1. Deactivate candidate
    const deactivated = await TeamService.updateMemberStatus(
      testOrg._id.toString(),
      ownerUser._id.toString(),
      candidateUser._id.toString(),
      'deactivated'
    );
    assert.strictEqual(deactivated.status, 'deactivated');

    // 2. Reactivate candidate
    const reactivated = await TeamService.updateMemberStatus(
      testOrg._id.toString(),
      ownerUser._id.toString(),
      candidateUser._id.toString(),
      'active'
    );
    assert.strictEqual(reactivated.status, 'active');

    // 3. Last-Owner Protection Invariant: Cannot deactivate Organization Owner
    await assert.rejects(
      async () => {
        await TeamService.updateMemberStatus(
          testOrg._id.toString(),
          ownerUser._id.toString(),
          ownerUser._id.toString(),
          'deactivated'
        );
      },
      (err: any) => err.code === 'CANNOT_DEACTIVATE_OWNER'
    );
  });

  test('15. Safe Member Removal: Evicts member and cascades workspace cleanup', async () => {
    // Remove candidateUser
    const res = await TeamService.removeMember(
      testOrg._id.toString(),
      ownerUser._id.toString(),
      candidateUser._id.toString()
    );
    assert.strictEqual(res.removed, true);

    // Membership should no longer exist
    const membership = await OrganisationMembershipModel.findOne({
      organisationId: testOrg._id,
      userId: candidateUser._id
    });
    assert.strictEqual(membership, null);

    // Workspace membership should be cleaned up
    const wsMem = await WorkspaceMembershipModel.findOne({
      organisationId: testOrg._id,
      userId: candidateUser._id
    });
    assert.strictEqual(wsMem, null);

    // Last-Owner Protection Invariant: Cannot remove Organization Owner
    await assert.rejects(
      async () => {
        await TeamService.removeMember(
          testOrg._id.toString(),
          ownerUser._id.toString(),
          ownerUser._id.toString()
        );
      },
      (err: any) => err.code === 'CANNOT_REMOVE_OWNER'
    );
  });

  test('16. Team Audit Trail: Captures all team mutations with actor metadata', async () => {
    const logs = await TeamService.getTeamAuditHistory(testOrg._id.toString(), 20);
    assert.ok(logs.length > 0, 'Audit history should record team events');

    const actions = logs.map((l: any) => l.action);
    assert.ok(actions.includes('INVITATION_CREATED'), 'Should have INVITATION_CREATED audit');
    assert.ok(actions.includes('MEMBER_ROLE_CHANGED'), 'Should have MEMBER_ROLE_CHANGED audit');
    assert.ok(actions.includes('MEMBER_REMOVED'), 'Should have MEMBER_REMOVED audit');
  });
});
