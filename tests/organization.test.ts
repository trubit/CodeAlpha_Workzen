// tests/organization.test.ts
// WORKZEN Enterprise Organization Management & Multi-Tenant Isolation Test Suite

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { AuthService } from '../src/server/services/authService.js';
import { OrganisationService } from '../src/server/services/orgService.js';
import { UserModel } from '../src/server/models/User.js';
import { OrganisationModel } from '../src/server/models/Organisation.js';
import { OrganisationMembershipModel } from '../src/server/models/OrganisationMembership.js';
import { SessionModel } from '../src/server/models/Session.js';
import { AuditLogModel } from '../src/server/models/AuditLog.js';
import { ENV } from '../src/server/config/env.js';
import { ORG_ROLES } from '../src/shared/constants/roles.js';

describe('Phase 6 — Complete Organization Management System', () => {
  let ownerUser: any;
  let memberUser: any;
  let outsiderUser: any;
  let testOrg: any;

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(ENV.MONGODB_URI);
    }

    // 1. Create Verified Owner User
    const ownerEmail = `org.owner.${Date.now()}@workzen.io`;
    const ownerReg = await AuthService.register({
      email: ownerEmail,
      password: 'OwnerPassword123!',
      firstName: 'Alex',
      lastName: 'Owner'
    });
    const ownerDoc = await UserModel.findById(ownerReg.id).select('+passwordResetOTP');
    await AuthService.verifyEmail(ownerEmail, ownerDoc!.passwordResetOTP!);
    ownerUser = await UserModel.findById(ownerReg.id);

    // 2. Create Verified Member User
    const memberEmail = `org.member.${Date.now()}@workzen.io`;
    const memberReg = await AuthService.register({
      email: memberEmail,
      password: 'MemberPassword123!',
      firstName: 'Sarah',
      lastName: 'Member'
    });
    const memberDoc = await UserModel.findById(memberReg.id).select('+passwordResetOTP');
    await AuthService.verifyEmail(memberEmail, memberDoc!.passwordResetOTP!);
    memberUser = await UserModel.findById(memberReg.id);

    // 3. Create Verified Outsider User (Belongs to different tenant)
    const outsiderEmail = `org.outsider.${Date.now()}@workzen.io`;
    const outsiderReg = await AuthService.register({
      email: outsiderEmail,
      password: 'OutsiderPassword123!',
      firstName: 'David',
      lastName: 'Outsider'
    });
    const outsiderDoc = await UserModel.findById(outsiderReg.id).select('+passwordResetOTP');
    await AuthService.verifyEmail(outsiderEmail, outsiderDoc!.passwordResetOTP!);
    outsiderUser = await UserModel.findById(outsiderReg.id);
  });

  after(async () => {
    // Cleanup test users, orgs, memberships, sessions, and audits
    const userIds = [ownerUser?._id, memberUser?._id, outsiderUser?._id].filter(Boolean);
    if (userIds.length > 0) {
      await UserModel.deleteMany({ _id: { $in: userIds } });
      await SessionModel.deleteMany({ userId: { $in: userIds } });
      await OrganisationMembershipModel.deleteMany({ userId: { $in: userIds } });
      await OrganisationModel.deleteMany({ ownerId: { $in: userIds } });
      await AuditLogModel.deleteMany({ userId: { $in: userIds } });
    }

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  // 1. Organization Creation
  test('should create a new organization and assign creator as initial owner', async () => {
    const orgData = {
      name: 'Stellar Tech Enterprise',
      description: 'Unified autonomous enterprise orchestration',
      industry: 'Technology & Software',
      organizationSize: '11-50' as const,
      website: 'https://stellar.example.com',
      country: 'United States',
      timezone: 'UTC-05:00 Eastern Time'
    };

    const result = await OrganisationService.createOrganisation(ownerUser._id.toString(), orgData);
    assert.ok(result.organisation._id);
    assert.strictEqual(result.organisation.name, 'Stellar Tech Enterprise');
    assert.strictEqual(result.organisation.slug, 'stellar-tech-enterprise');
    assert.strictEqual(result.organisation.ownerId.toString(), ownerUser._id.toString());
    assert.strictEqual(result.organisation.status, 'active');

    // Verify creator membership
    assert.strictEqual(result.membership.role, ORG_ROLES.OWNER);
    assert.strictEqual(result.membership.status, 'active');
    assert.strictEqual(result.membership.userId.toString(), ownerUser._id.toString());

    testOrg = result.organisation;
  });

  // 2. Duplicate Slug Avoidance
  test('should resolve duplicate slugs automatically with sequential numeric suffix', async () => {
    const duplicateInput = {
      name: 'Stellar Tech Enterprise', // Same name
      industry: 'Technology & Software'
    };

    const secondOrg = await OrganisationService.createOrganisation(ownerUser._id.toString(), duplicateInput);
    assert.ok(secondOrg.organisation.slug.startsWith('stellar-tech-enterprise-'));
    assert.notStrictEqual(secondOrg.organisation.slug, testOrg.slug);

    // Clean up second org
    await OrganisationModel.findByIdAndDelete(secondOrg.organisation._id);
    await OrganisationMembershipModel.deleteMany({ organisationId: secondOrg.organisation._id });
  });

  // 3. User Organization Listing
  test('should list all active organizations accessible to the user with caller role', async () => {
    const orgs = await OrganisationService.getUserOrganisations(ownerUser._id.toString());
    assert.ok(Array.isArray(orgs));
    assert.ok(orgs.length >= 1);

    const found = orgs.find((o) => o._id.toString() === testOrg._id.toString());
    assert.ok(found);
    assert.strictEqual(found.callerRole, 'owner');
  });

  // 4. Organization Details Retrieval
  test('should retrieve organization details including active member counts', async () => {
    const details = await OrganisationService.getOrganisationById(
      testOrg._id.toString(),
      ownerUser._id.toString()
    );

    assert.strictEqual(details.name, 'Stellar Tech Enterprise');
    assert.strictEqual(details.isOwner, true);
    assert.strictEqual(details.callerRole, 'owner');
    assert.strictEqual(details.memberCount, 1);
  });

  // 5. Cross-Tenant IDOR Protection
  test('should strictly block non-member from accessing another tenant (IDOR Prevention)', async () => {
    await assert.rejects(
      async () => {
        await OrganisationService.getOrganisationById(
          testOrg._id.toString(),
          outsiderUser._id.toString()
        );
      },
      (err: any) => {
        assert.strictEqual(err.statusCode, 403);
        assert.strictEqual(err.code, 'FORBIDDEN_CROSS_TENANT');
        return true;
      }
    );
  });

  // 6. Organization Profile Update (Owner Allowed)
  test('should allow authorized owner to update organization profile', async () => {
    const updated = await OrganisationService.updateOrganisation(
      testOrg._id.toString(),
      ownerUser._id.toString(),
      {
        description: 'Updated enterprise mission description',
        organizationSize: '51-200' as const,
        website: 'https://updated-stellar.example.com'
      }
    );

    assert.strictEqual(updated.description, 'Updated enterprise mission description');
    assert.strictEqual(updated.organizationSize, '51-200');
    assert.strictEqual(updated.website, 'https://updated-stellar.example.com');
  });

  // 7. Organization Profile Update (Non-Owner Blocked)
  test('should prevent non-owner from updating organization profile', async () => {
    // Add memberUser as ordinary member
    await OrganisationMembershipModel.create({
      organisationId: testOrg._id,
      userId: memberUser._id,
      role: ORG_ROLES.MEMBER,
      status: 'active'
    });

    await assert.rejects(
      async () => {
        await OrganisationService.updateOrganisation(
          testOrg._id.toString(),
          memberUser._id.toString(),
          { name: 'Unauthorized Name Change' }
        );
      },
      (err: any) => {
        assert.strictEqual(err.statusCode, 403);
        assert.strictEqual(err.code, 'FORBIDDEN_NOT_OWNER');
        return true;
      }
    );
  });

  // 8. Organization Settings Update (Owner Only)
  test('should allow owner to update security settings and enforce 2FA', async () => {
    const updatedSettings = await OrganisationService.updateSettings(
      testOrg._id.toString(),
      ownerUser._id.toString(),
      {
        enforce2FA: true,
        allowedDomains: ['stellar.example.com', 'workzen.io'],
        defaultMemberRole: 'member'
      }
    );

    assert.strictEqual(updatedSettings.settings.enforce2FA, true);
    assert.deepStrictEqual(updatedSettings.settings.allowedDomains, ['stellar.example.com', 'workzen.io']);
  });

  // 9. Ownership Transfer Workflow
  test('should safely transfer ownership to another active member with role demotion', async () => {
    const transferResult = await OrganisationService.transferOwnership(
      testOrg._id.toString(),
      ownerUser._id.toString(),
      memberUser._id.toString()
    );

    assert.ok(transferResult.message.includes('transferred successfully'));

    // Verify in database
    const refreshedOrg = await OrganisationModel.findById(testOrg._id);
    assert.strictEqual(refreshedOrg?.ownerId.toString(), memberUser._id.toString());

    // Verify new owner membership
    const newOwnerMembership = await OrganisationMembershipModel.findOne({
      organisationId: testOrg._id,
      userId: memberUser._id
    });
    assert.strictEqual(newOwnerMembership?.role, ORG_ROLES.OWNER);

    // Verify previous owner demotion to admin
    const prevOwnerMembership = await OrganisationMembershipModel.findOne({
      organisationId: testOrg._id,
      userId: ownerUser._id
    });
    assert.strictEqual(prevOwnerMembership?.role, ORG_ROLES.ADMIN);
  });

  // 10. Rejection of Ownership Transfer to Non-Member
  test('should reject ownership transfer to an outsider who is not an active member', async () => {
    await assert.rejects(
      async () => {
        await OrganisationService.transferOwnership(
          testOrg._id.toString(),
          memberUser._id.toString(), // Current owner
          outsiderUser._id.toString() // Not a member
        );
      },
      (err: any) => {
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.code, 'RECIPIENT_NOT_MEMBER');
        return true;
      }
    );
  });

  // 11. Organization Deletion / Archival Confirmation
  test('should reject organization archival if confirmation name does not match exactly', async () => {
    await assert.rejects(
      async () => {
        await OrganisationService.archiveOrganisation(
          testOrg._id.toString(),
          memberUser._id.toString(),
          'Wrong Org Name'
        );
      },
      (err: any) => {
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.code, 'CONFIRMATION_MISMATCH');
        return true;
      }
    );
  });

  // 12. Safe Organization Archival
  test('should safely archive organization when owner confirms exact name', async () => {
    const archiveResult = await OrganisationService.archiveOrganisation(
      testOrg._id.toString(),
      memberUser._id.toString(),
      testOrg.name
    );

    assert.ok(archiveResult.message.includes('safely archived'));

    const archivedOrg = await OrganisationModel.findById(testOrg._id);
    assert.strictEqual(archivedOrg?.status, 'archived');
    assert.ok(archivedOrg?.archivedAt);

    // Verify archived org cannot be accessed as active
    await assert.rejects(
      async () => {
        await OrganisationService.getOrganisationById(
          testOrg._id.toString(),
          memberUser._id.toString()
        );
      },
      (err: any) => {
        assert.strictEqual(err.statusCode, 404);
        assert.strictEqual(err.code, 'ORGANISATION_NOT_FOUND');
        return true;
      }
    );

    // Verify archived org is excluded from active user list
    const activeOrgs = await OrganisationService.getUserOrganisations(memberUser._id.toString());
    const isPresent = activeOrgs.some((o) => o._id.toString() === testOrg._id.toString());
    assert.strictEqual(isPresent, false);
  });
});

