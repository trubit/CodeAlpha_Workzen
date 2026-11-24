// tests/projectMembers.test.ts
// WORKZEN Phase 12: Project Members & Collaboration Test Suite

import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { AuthService } from '../src/server/services/authService.js';
import { OrganisationService } from '../src/server/services/orgService.js';
import { WorkspaceService } from '../src/server/services/workspaceService.js';
import { ProjectService } from '../src/server/services/projectService.js';
import { UserModel } from '../src/server/models/User.js';
import { ProjectModel } from '../src/server/models/Project.js';
import { OrganisationMembershipModel } from '../src/server/models/OrganisationMembership.js';
import { ENV } from '../src/server/config/env.js';

describe('Phase 12 — Project Members & Collaboration Engine', () => {
  let ownerUser: any;
  let memberUser1: any;
  let memberUser2: any;
  let outsiderUser: any;
  let testOrg: any;
  let testWorkspace: any;
  let testProject: any;

  before(async () => {
    try {
      if (mongoose.connection.readyState !== 1) {
        if (mongoose.connection.readyState !== 0) {
          await mongoose.disconnect();
        }
        await mongoose.connect(ENV.MONGODB_URI);
      }

      const ts = Date.now();

      // 1. Create Owner User and Organization
      const ownerReg = await AuthService.register({
        email: `proj.owner.${ts}@workzen.io`,
        password: 'Password123!',
        firstName: 'Project',
        lastName: 'Owner',
        organisationName: `Project Collaboration Org ${ts}`
      });
      ownerUser = await UserModel.findById(ownerReg.id);

      const orgs = await OrganisationService.getUserOrganisations(ownerUser._id.toString());
      testOrg = orgs[0];

      // 2. Create Workspace
      testWorkspace = await WorkspaceService.createWorkspace(
        testOrg._id.toString(),
        ownerUser._id.toString(),
        {
          name: `Engineering Squad ${ts}`,
          slug: `eng-squad-${ts}`,
          department: 'Engineering'
        }
      );

      // 3. Create Additional Teammates in Same Org
      const reg1 = await AuthService.register({
        email: `teammate1.${ts}@workzen.io`,
        password: 'Password123!',
        firstName: 'Alex',
        lastName: 'Kim',
        organisationName: `Temporary Corp 1 ${ts}`
      });
      memberUser1 = await UserModel.findById(reg1.id);

      // Add memberUser1 to testOrg
      await OrganisationMembershipModel.create({
        organisationId: testOrg._id,
        userId: memberUser1._id,
        role: 'member',
        status: 'active'
      });

      const reg2 = await AuthService.register({
        email: `teammate2.${ts}@workzen.io`,
        password: 'Password123!',
        firstName: 'Elena',
        lastName: 'Rostova',
        organisationName: `Temporary Corp 2 ${ts}`
      });
      memberUser2 = await UserModel.findById(reg2.id);

      // Add memberUser2 to testOrg
      await OrganisationMembershipModel.create({
        organisationId: testOrg._id,
        userId: memberUser2._id,
        role: 'member',
        status: 'active'
      });

      // 4. Create an Outsider User (Different Org)
      const outsiderReg = await AuthService.register({
        email: `outsider.${ts}@workzen.io`,
        password: 'Password123!',
        firstName: 'Victor',
        lastName: 'Outsider',
        organisationName: `Outsider Corp ${ts}`
      });
      outsiderUser = await UserModel.findById(outsiderReg.id);

      // 5. Initialize Test Project
      testProject = await ProjectService.createProject(
        ownerUser._id.toString(),
        testOrg._id.toString(),
        {
          name: `Core Infrastructure Alpha ${ts}`,
          key: `INF${Math.floor(Math.random() * 899 + 100)}`,
          workspaceId: testWorkspace._id.toString(),
          description: 'Collaborative infrastructure roadmap.',
          ownerId: ownerUser._id.toString()
        }
      );
    } catch (err: any) {
      console.error('BEFORE HOOK ERROR:', err?.message || err);
      throw err;
    }
  });

  test('1. Initial Member Roster: Project creator is registered as Lead and Owner', async () => {
    const res = await ProjectService.listProjectMembers(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProject.id
    );

    assert.ok(res);
    assert.strictEqual(res.members.length, 1);
    assert.strictEqual(res.members[0].id, ownerUser._id.toString());
    assert.strictEqual(res.members[0].role, 'lead');
    assert.strictEqual(res.members[0].isOwner, true);
    assert.strictEqual(res.members[0].status, 'active');
  });

  test('2. Eligible Teammates Discovery: Excludes current members and includes active org teammates', async () => {
    const eligible = await ProjectService.getEligibleOrganisationMembers(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProject.id
    );

    assert.ok(Array.isArray(eligible));
    // Teammate1 and Teammate2 must be in eligible list, but owner must NOT be
    const eligibleIds = eligible.map((e) => e.id);
    assert.ok(!eligibleIds.includes(ownerUser._id.toString()), 'Owner must be excluded from eligible list');
    assert.ok(eligibleIds.includes(memberUser1._id.toString()), 'Teammate 1 must be eligible');
    assert.ok(eligibleIds.includes(memberUser2._id.toString()), 'Teammate 2 must be eligible');
    assert.ok(!eligibleIds.includes(outsiderUser._id.toString()), 'Outsider from another org must NOT be eligible');
  });

  test('3. Add Member: Successfully adds teammate with Contributor role', async () => {
    await ProjectService.addMembers(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProject.id,
      [memberUser1._id.toString()],
      'contributor'
    );

    const res = await ProjectService.listProjectMembers(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProject.id
    );

    assert.strictEqual(res.members.length, 2);
    const added = res.members.find((m) => m.id === memberUser1._id.toString());
    assert.ok(added, 'Teammate 1 must be in member roster');
    assert.strictEqual(added?.role, 'contributor');
    assert.strictEqual(added?.isOwner, false);
  });

  test('4. Duplicate Prevention: Adding already-added member does not duplicate roster', async () => {
    await ProjectService.addMembers(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProject.id,
      [memberUser1._id.toString()],
      'contributor'
    );

    const res = await ProjectService.listProjectMembers(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProject.id
    );

    assert.strictEqual(res.members.length, 2, 'Roster count must remain 2');
  });

  test('5. Multi-Member Addition: Successfully adds second teammate with Observer role', async () => {
    await ProjectService.addMembers(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProject.id,
      [memberUser2._id.toString()],
      'observer'
    );

    const res = await ProjectService.listProjectMembers(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProject.id
    );

    assert.strictEqual(res.members.length, 3);
    const observer = res.members.find((m) => m.id === memberUser2._id.toString());
    assert.ok(observer);
    assert.strictEqual(observer?.role, 'observer');
  });

  test('6. Role Update: Promotes Contributor to Observer and back', async () => {
    await ProjectService.updateMemberRole(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProject.id,
      memberUser1._id.toString(),
      'observer'
    );

    let res = await ProjectService.listProjectMembers(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProject.id
    );
    let m1 = res.members.find((m) => m.id === memberUser1._id.toString());
    assert.strictEqual(m1?.role, 'observer');

    // Switch back to contributor
    await ProjectService.updateMemberRole(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProject.id,
      memberUser1._id.toString(),
      'contributor'
    );

    res = await ProjectService.listProjectMembers(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProject.id
    );
    m1 = res.members.find((m) => m.id === memberUser1._id.toString());
    assert.strictEqual(m1?.role, 'contributor');
  });

  test('7. Owner Demotion Protection: Cannot demote project owner from Lead', async () => {
    await assert.rejects(
      async () => {
        await ProjectService.updateMemberRole(
          ownerUser._id.toString(),
          testOrg._id.toString(),
          testProject.id,
          ownerUser._id.toString(),
          'observer'
        );
      },
      (err: any) => {
        assert.strictEqual(err.code, 'CANNOT_DEMOTE_PROJECT_OWNER');
        assert.strictEqual(err.statusCode, 400);
        return true;
      }
    );
  });

  test('8. Owner Removal Protection: Cannot remove project owner from roster', async () => {
    await assert.rejects(
      async () => {
        await ProjectService.removeMember(
          ownerUser._id.toString(),
          testOrg._id.toString(),
          testProject.id,
          ownerUser._id.toString()
        );
      },
      (err: any) => {
        assert.strictEqual(err.code, 'CANNOT_REMOVE_PROJECT_OWNER');
        assert.strictEqual(err.statusCode, 400);
        return true;
      }
    );
  });

  test('9. Remove Member: Successfully removes member while preserving global account', async () => {
    await ProjectService.removeMember(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProject.id,
      memberUser2._id.toString()
    );

    const res = await ProjectService.listProjectMembers(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProject.id
    );

    assert.strictEqual(res.members.length, 2);
    const removed = res.members.find((m) => m.id === memberUser2._id.toString());
    assert.strictEqual(removed, undefined, 'Teammate 2 must no longer be in project roster');

    // Verify memberUser2 still exists in database
    const userDoc = await UserModel.findById(memberUser2._id);
    assert.ok(userDoc, 'User document must remain preserved in database');
  });

  test('10. Membership Audit Activity: Records additions, role updates, and removals', async () => {
    const activity = await ProjectService.getProjectMemberActivity(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProject.id,
      20
    );

    assert.ok(Array.isArray(activity));
    assert.ok(activity.length >= 3, 'Must record at least addition, role change, and removal events');

    const actions = activity.map((a) => a.action);
    assert.ok(actions.includes('PROJECT_MEMBERS_ADDED'));
    assert.ok(actions.includes('PROJECT_MEMBER_ROLE_UPDATED'));
    assert.ok(actions.includes('PROJECT_MEMBER_REMOVED'));
  });

  test('11. Tenant Isolation: Outsider from different org cannot be added to project', async () => {
    // Attempting to add outsiderUser to testProject
    await ProjectService.addMembers(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProject.id,
      [outsiderUser._id.toString()],
      'contributor'
    );

    // Outsider must NOT have been added because they are not in testOrg
    const res = await ProjectService.listProjectMembers(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProject.id
    );

    const outsiderInRoster = res.members.find((m) => m.id === outsiderUser._id.toString());
    assert.strictEqual(outsiderInRoster, undefined, 'Outsider must not be added to project roster');
  });

  test('12. Search & Role Filtering: Filters roster results accurately', async () => {
    // Filter by role: lead
    const leads = await ProjectService.listProjectMembers(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProject.id,
      { role: 'lead' }
    );
    assert.strictEqual(leads.members.length, 1);
    assert.strictEqual(leads.members[0].role, 'lead');

    // Filter by search query
    const searchMatch = await ProjectService.listProjectMembers(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProject.id,
      { search: 'Alex' }
    );
    assert.strictEqual(searchMatch.members.length, 1);
    assert.strictEqual(searchMatch.members[0].id, memberUser1._id.toString());
  });
});
