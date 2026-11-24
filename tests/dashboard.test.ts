// tests/dashboard.test.ts
// WORKZEN Enterprise Dashboard Test Suite (Phase 10)

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { AuthService } from '../src/server/services/authService.js';
import { OrganisationService } from '../src/server/services/orgService.js';
import { WorkspaceService } from '../src/server/services/workspaceService.js';
import { DashboardService } from '../src/server/services/dashboardService.js';
import { UserModel } from '../src/server/models/User.js';
import { ProjectModel } from '../src/server/models/Project.js';
import { TaskModel } from '../src/server/models/Task.js';
import { AuditLogModel } from '../src/server/models/AuditLog.js';
import { ENV } from '../src/server/config/env.js';
import { TASK_STATUS, TASK_PRIORITY, PROJECT_STATUS } from '../src/shared/constants/status.js';

describe('Phase 10 — Enterprise Dashboard & Real Telemetry System', () => {
  let ownerUser: any;
  let memberUser: any;
  let testOrg: any;
  let otherOrg: any;
  let testWorkspace: any;
  let otherWorkspace: any;
  let testProject: any;
  let overdueTask: any;
  let dueTodayTask: any;
  let completedTask: any;

  before(async () => {
    try {
      if (mongoose.connection.readyState !== 1) {
        if (mongoose.connection.readyState !== 0) {
          await mongoose.disconnect();
        }
        await mongoose.connect(ENV.MONGODB_URI);
      }

      const ts = Date.now();

      // 1. Create Users
      const ownerReg = await AuthService.register({
        email: `dash.owner.${ts}@workzen.io`,
        password: 'Password123!',
        firstName: 'Diana',
        lastName: 'Owner',
        organisationName: `Dashboard Corp Init ${ts}`
      });
      ownerUser = await UserModel.findById(ownerReg.id);

      const memberReg = await AuthService.register({
        email: `dash.member.${ts}@workzen.io`,
        password: 'Password123!',
        firstName: 'Mark',
        lastName: 'Member',
        organisationName: `Member Corp Init ${ts}`
      });
      memberUser = await UserModel.findById(memberReg.id);

      // 2. Create Primary Org and Secondary Org for isolation tests
      const orgRes = await OrganisationService.createOrganisation(ownerUser._id.toString(), {
        name: `Dashboard Corp ${ts}`,
        slug: `dash-corp-${ts}`,
        industry: 'Technology & Software',
        organizationSize: '11-50',
        country: 'United States',
        timezone: 'UTC-05:00 Eastern Time'
      });
      testOrg = orgRes.organisation;

      const otherOrgRes = await OrganisationService.createOrganisation(ownerUser._id.toString(), {
        name: `Other Corp ${ts}`,
        slug: `other-corp-${ts}`,
        industry: 'Finance & Banking',
        organizationSize: '1-10',
        country: 'United States',
        timezone: 'UTC-05:00 Eastern Time'
      });
      otherOrg = otherOrgRes.organisation;

      // 3. Create Workspaces
      testWorkspace = await WorkspaceService.createWorkspace(testOrg._id.toString(), ownerUser._id.toString(), {
        name: 'Engineering Hub',
        slug: `eng-hub-${ts}`,
        description: 'Primary software engineering team workspace'
      });

      otherWorkspace = await WorkspaceService.createWorkspace(testOrg._id.toString(), ownerUser._id.toString(), {
        name: 'Design Ops',
        slug: `design-ops-${ts}`,
        description: 'Product design and creative operations'
      });

      // 4. Create Project
      testProject = await ProjectModel.create({
        organisationId: testOrg._id,
        workspaceId: testWorkspace._id,
        name: 'Core Platform v2',
        key: 'PLAT',
        status: PROJECT_STATUS.IN_PROGRESS,
        priority: TASK_PRIORITY.HIGH,
        color: '#4F46E5',
        leadId: ownerUser._id
      });

      // 5. Seed Real Tasks for Telemetry (Overdue, Due Today, Completed)
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0, 0);

      overdueTask = await TaskModel.create({
        organisationId: testOrg._id,
        workspaceId: testWorkspace._id,
        projectId: testProject._id,
        taskNumber: 1,
        title: 'Fix Critical Token Rotation Edge Case',
        status: TASK_STATUS.IN_PROGRESS,
        priority: TASK_PRIORITY.URGENT,
        assigneeIds: [memberUser._id],
        reporterId: ownerUser._id,
        dueDate: yesterday,
        tags: ['security', 'urgent'],
        order: 1
      });

      dueTodayTask = await TaskModel.create({
        organisationId: testOrg._id,
        workspaceId: testWorkspace._id,
        projectId: testProject._id,
        taskNumber: 2,
        title: 'Deliver Dashboard Telemetry Pipeline',
        status: TASK_STATUS.TODO,
        priority: TASK_PRIORITY.HIGH,
        assigneeIds: [memberUser._id],
        reporterId: ownerUser._id,
        dueDate: today,
        tags: ['dashboard'],
        order: 2
      });

      completedTask = await TaskModel.create({
        organisationId: testOrg._id,
        workspaceId: testWorkspace._id,
        projectId: testProject._id,
        taskNumber: 3,
        title: 'Audit Logging Migration Verification',
        status: TASK_STATUS.DONE,
        priority: TASK_PRIORITY.MEDIUM,
        assigneeIds: [ownerUser._id],
        reporterId: ownerUser._id,
        dueDate: today,
        tags: ['audit'],
        order: 3
      });

      // 6. Seed Real Audit Log Entry
      await AuditLogModel.create({
        organisationId: testOrg._id,
        userId: ownerUser._id,
        action: 'task:completed',
        entityType: 'Task',
        entityId: completedTask._id,
        changes: { status: 'done' }
      });
    } catch (e: any) {
      console.error('*** ERROR IN BEFORE HOOK ***:', e.message, e.stack);
      throw e;
    }
  });

  after(async () => {
    // Clean up test records
    await TaskModel.deleteMany({ organisationId: { $in: [testOrg?._id, otherOrg?._id] } });
    await ProjectModel.deleteMany({ organisationId: { $in: [testOrg?._id, otherOrg?._id] } });
    await AuditLogModel.deleteMany({ organisationId: { $in: [testOrg?._id, otherOrg?._id] } });
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  test('1. Dashboard Overview: Accurately calculates real project and task metrics', async () => {
    const overview = await DashboardService.getOverview(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      { dateRange: '30d' }
    );

    assert.ok(overview);
    assert.strictEqual(overview.metrics.projects.total, 1);
    assert.strictEqual(overview.metrics.projects.active, 1);
    assert.strictEqual(overview.metrics.projects.completed, 0);

    assert.strictEqual(overview.metrics.tasks.total, 3);
    assert.strictEqual(overview.metrics.tasks.completed, 1);
    assert.strictEqual(overview.metrics.tasks.inProgress, 1);
    assert.strictEqual(overview.metrics.tasks.todo, 1);
    assert.strictEqual(overview.metrics.tasks.overdue, 1, 'Should detect exactly 1 overdue task');
    assert.strictEqual(overview.metrics.tasks.dueToday, 1, 'Should detect exactly 1 task due today');
    assert.strictEqual(overview.metrics.tasks.completionRate, 33, '1 of 3 tasks completed = 33%');
  });

  test('2. Empty Dashboard: Returns honest zero counts when no projects or tasks exist in org', async () => {
    const overview = await DashboardService.getOverview(
      ownerUser._id.toString(),
      otherOrg._id.toString(),
      { dateRange: '30d' }
    );

    assert.ok(overview);
    assert.strictEqual(overview.metrics.projects.total, 0);
    assert.strictEqual(overview.metrics.projects.active, 0);
    assert.strictEqual(overview.metrics.tasks.total, 0);
    assert.strictEqual(overview.metrics.tasks.completed, 0);
    assert.strictEqual(overview.metrics.tasks.completionRate, 0);
    assert.strictEqual(overview.projects.length, 0);
    assert.strictEqual(overview.upcomingDeadlines.length, 0);
  });

  test('3. Workspace Scoping & Isolation: Filters metrics strictly by workspace', async () => {
    // Querying testWorkspace should include the project & tasks
    const wsOverview = await DashboardService.getOverview(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      { workspaceId: testWorkspace._id.toString(), dateRange: '30d' }
    );
    assert.strictEqual(wsOverview.metrics.tasks.total, 3);
    assert.strictEqual(wsOverview.context.workspaceName, 'Engineering Hub');

    // Querying otherWorkspace (Design Ops) should show 0 tasks and 0 projects
    const otherWsOverview = await DashboardService.getOverview(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      { workspaceId: otherWorkspace._id.toString(), dateRange: '30d' }
    );
    assert.strictEqual(otherWsOverview.metrics.tasks.total, 0);
    assert.strictEqual(otherWsOverview.metrics.projects.total, 0);
  });

  test('4. Organization Isolation: Organization A metrics never leak to Organization B', async () => {
    const orgAOverview = await DashboardService.getOverview(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      { dateRange: '30d' }
    );
    const orgBOverview = await DashboardService.getOverview(
      ownerUser._id.toString(),
      otherOrg._id.toString(),
      { dateRange: '30d' }
    );

    assert.notStrictEqual(orgAOverview.context.organisationId, orgBOverview.context.organisationId);
    assert.strictEqual(orgAOverview.metrics.tasks.total, 3);
    assert.strictEqual(orgBOverview.metrics.tasks.total, 0);
  });

  test('5. My Tasks Queue: Returns only deliverables assigned to authenticated user', async () => {
    // Member should only see tasks assigned to memberUser (2 tasks: overdue + dueToday)
    const memberTasks = await DashboardService.getMyTasks(
      memberUser._id.toString(),
      testOrg._id.toString(),
      { status: 'all', priority: 'all', limit: 20 }
    );

    assert.strictEqual(memberTasks.length, 2);
    const titles = memberTasks.map((t) => t.title);
    assert.ok(titles.includes('Fix Critical Token Rotation Edge Case'));
    assert.ok(titles.includes('Deliver Dashboard Telemetry Pipeline'));

    // Owner should only see completedTask assigned to ownerUser
    const ownerTasks = await DashboardService.getMyTasks(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      { status: 'all', priority: 'all', limit: 20 }
    );
    assert.strictEqual(ownerTasks.length, 1);
    assert.strictEqual(ownerTasks[0].title, 'Audit Logging Migration Verification');
  });

  test('6. My Tasks Filtering: Correctly filters assigned queue by status and priority', async () => {
    // Filter member tasks by status 'in_progress'
    const inProgressTasks = await DashboardService.getMyTasks(
      memberUser._id.toString(),
      testOrg._id.toString(),
      { status: 'in_progress', priority: 'all', limit: 20 }
    );
    assert.strictEqual(inProgressTasks.length, 1);
    assert.strictEqual(inProgressTasks[0].status, TASK_STATUS.IN_PROGRESS);

    // Filter member tasks by priority 'urgent'
    const urgentTasks = await DashboardService.getMyTasks(
      memberUser._id.toString(),
      testOrg._id.toString(),
      { status: 'all', priority: 'urgent', limit: 20 }
    );
    assert.strictEqual(urgentTasks.length, 1);
    assert.strictEqual(urgentTasks[0].priority, TASK_PRIORITY.URGENT);
  });

  test('7. Upcoming Deadlines: Returns sorted deadlines with accurate urgency flags', async () => {
    const overview = await DashboardService.getOverview(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      { dateRange: '30d' }
    );

    const deadlines = overview.upcomingDeadlines;
    assert.strictEqual(deadlines.length, 2, 'Should return the 2 non-completed tasks with due dates');

    // First deadline should be the overdue one
    assert.strictEqual(deadlines[0].isOverdue, true);
    assert.strictEqual(deadlines[0].isDueToday, false);

    // Second deadline should be due today
    assert.strictEqual(deadlines[1].isOverdue, false);
    assert.strictEqual(deadlines[1].isDueToday, true);
  });

  test('8. Real Activity Stream: Retrieves genuine audit records with actor attribution', async () => {
    const activities = await DashboardService.getActivity(testOrg._id.toString(), { limit: 10 });
    assert.ok(activities.length >= 1);

    const targetActivity = activities.find((a) => a.action === 'task:completed');
    assert.ok(targetActivity, 'Should find the seeded task completion activity');
    assert.strictEqual(targetActivity.actor.email, ownerUser.email);
    assert.strictEqual(targetActivity.entityType, 'Task');
  });

  test('9. Analytics Matrix: Aggregates genuine status and priority distributions', async () => {
    const analytics = await DashboardService.getAnalytics(testOrg._id.toString(), { dateRange: '30d' });

    assert.strictEqual(analytics.totalTasks, 3);
    assert.strictEqual(analytics.statusDistribution[TASK_STATUS.DONE], 1);
    assert.strictEqual(analytics.statusDistribution[TASK_STATUS.IN_PROGRESS], 1);
    assert.strictEqual(analytics.statusDistribution[TASK_STATUS.TODO], 1);

    assert.strictEqual(analytics.priorityDistribution[TASK_PRIORITY.URGENT], 1);
    assert.strictEqual(analytics.priorityDistribution[TASK_PRIORITY.HIGH], 1);
    assert.strictEqual(analytics.priorityDistribution[TASK_PRIORITY.MEDIUM], 1);

    assert.strictEqual(analytics.projectProgress.length, 1);
    assert.strictEqual(analytics.projectProgress[0].total, 3);
    assert.strictEqual(analytics.projectProgress[0].completed, 1);
    assert.strictEqual(analytics.projectProgress[0].percentage, 33);
  });

  test('10. Invalid Organization Handling: Throws ORGANISATION_NOT_FOUND error', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    await assert.rejects(
      async () => {
        await DashboardService.getOverview(ownerUser._id.toString(), nonExistentId, { dateRange: '30d' });
      },
      (err: any) => {
        assert.strictEqual(err.code, 'ORGANISATION_NOT_FOUND');
        assert.strictEqual(err.statusCode, 404);
        return true;
      }
    );
  });
});
