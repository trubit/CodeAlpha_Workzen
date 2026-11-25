// tests/tasks.test.ts
// WORKZEN Phase 14: Task Management Integration Test Suite

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { AuthService } from '../src/server/services/authService.js';
import { OrganisationService } from '../src/server/services/orgService.js';
import { WorkspaceService } from '../src/server/services/workspaceService.js';
import { ProjectService } from '../src/server/services/projectService.js';
import { TaskService } from '../src/server/services/taskService.js';
import { UserModel } from '../src/server/models/User.js';
import { TaskModel } from '../src/server/models/Task.js';
import { AuditLogModel } from '../src/server/models/AuditLog.js';
import { OrganisationMembershipModel } from '../src/server/models/OrganisationMembership.js';
import { ENV } from '../src/server/config/env.js';
import { TASK_STATUS, TASK_PRIORITY } from '../src/shared/constants/status.js';

describe('Phase 14 — Task Management Lifecycle & Enterprise Capabilities', () => {
  let ownerUser: any;
  let memberUser: any;
  let outsiderUser: any;
  let testOrg: any;
  let testWorkspace: any;
  let testProject: any;
  let testProjectId: string;
  let outsiderOrg: any;
  let outsiderProject: any;
  let outsiderProjectId: string;

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
        email: `task.owner.${ts}@workzen.io`,
        password: 'Password123!',
        firstName: 'Task',
        lastName: 'Manager',
        organisationName: `Task Enterprise Org ${ts}`
      });
      ownerUser = await UserModel.findById(ownerReg.id);

      const orgs = await OrganisationService.getUserOrganisations(ownerUser._id.toString());
      testOrg = orgs[0];

      // 2. Create Workspace
      testWorkspace = await WorkspaceService.createWorkspace(
        testOrg._id.toString(),
        ownerUser._id.toString(),
        {
          name: `Core Engineering ${ts}`,
          slug: `core-eng-${ts}`,
          department: 'Engineering'
        }
      );

      // 3. Create Project
      testProject = await ProjectService.createProject(
        ownerUser._id.toString(),
        testOrg._id.toString(),
        {
          name: `Backend Infra Sprint ${ts}`,
          key: 'INFRA',
          description: 'Production infrastructure and reliability tasks',
          workspaceId: testWorkspace._id.toString(),
          category: 'development',
          color: '#4F46E5',
          priority: 'high',
          visibility: 'workspace'
        }
      );
      testProjectId = (testProject.id || testProject._id).toString();

      // 4. Create Member User in Same Org
      const memberReg = await AuthService.register({
        email: `task.member.${ts}@workzen.io`,
        password: 'Password123!',
        firstName: 'Senior',
        lastName: 'Architect',
        organisationName: `Temporary Corp ${ts}`
      });
      memberUser = await UserModel.findById(memberReg.id);

      // Add memberUser to testOrg
      await OrganisationMembershipModel.create({
        organisationId: testOrg._id,
        userId: memberUser._id,
        role: 'member',
        status: 'active'
      });

      // Add member to Project
      await ProjectService.addMembers(
        ownerUser._id.toString(),
        testOrg._id.toString(),
        testProjectId,
        [memberUser._id.toString()],
        'contributor'
      );

      // 5. Create Outsider in different org for Isolation Tests
      const outsiderReg = await AuthService.register({
        email: `task.outsider.${ts}@workzen.io`,
        password: 'Password123!',
        firstName: 'Outsider',
        lastName: 'Spy',
        organisationName: `Isolated Org ${ts}`
      });
      outsiderUser = await UserModel.findById(outsiderReg.id);
      const outsiderOrgs = await OrganisationService.getUserOrganisations(outsiderUser._id.toString());
      outsiderOrg = outsiderOrgs[0];

      const outsiderWs = await WorkspaceService.createWorkspace(
        outsiderOrg._id.toString(),
        outsiderUser._id.toString(),
        {
          name: `Outsider WS ${ts}`,
          slug: `outsider-ws-${ts}`,
          department: 'Security'
        }
      );

      outsiderProject = await ProjectService.createProject(
        outsiderUser._id.toString(),
        outsiderOrg._id.toString(),
        {
          name: `Isolated Project ${ts}`,
          key: 'ISOL',
          workspaceId: outsiderWs._id.toString(),
          category: 'operations',
          visibility: 'restricted'
        }
      );
      outsiderProjectId = (outsiderProject.id || outsiderProject._id).toString();
    } catch (err) {
      console.error('Test Setup Failed:', err);
      throw err;
    }
  });

  let task1: any;
  let task2: any;
  let task3: any;

  // Test 1: Task Creation
  test('1. Create tasks with sequential taskNumber, taskKey, and full metadata', async () => {
    task1 = await TaskService.createTask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      {
        projectId: testProjectId,
        workspaceId: testWorkspace._id.toString(),
        title: 'Implement Redis token revocation blacklist',
        description: 'Store revoked JWT identifiers in Redis clustered cache',
        status: TASK_STATUS.TODO,
        priority: TASK_PRIORITY.HIGH,
        assigneeIds: [memberUser._id.toString()],
        startDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedHours: 8,
        tags: ['backend', 'redis', 'auth']
      }
    );

    assert.ok(task1);
    assert.strictEqual(task1.taskNumber, 1);
    assert.strictEqual(task1.taskKey, 'INFRA-1');
    assert.strictEqual(task1.status, TASK_STATUS.TODO);
    assert.strictEqual(task1.priority, TASK_PRIORITY.HIGH);
    assert.strictEqual(task1.estimatedHours, 8);
    assert.strictEqual(task1.assignees.length, 1);
    assert.strictEqual(task1.assignees[0].id, memberUser._id.toString());
    assert.strictEqual(task1.isArchived, false);

    // Create Task 2
    task2 = await TaskService.createTask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      {
        projectId: testProjectId,
        workspaceId: testWorkspace._id.toString(),
        title: 'Configure automated Snyk security scanner',
        description: 'Integrate Snyk vulnerability detection in GitHub CI',
        status: TASK_STATUS.IN_PROGRESS,
        priority: TASK_PRIORITY.URGENT,
        tags: ['devops', 'security']
      }
    );

    assert.strictEqual(task2.taskNumber, 2);
    assert.strictEqual(task2.taskKey, 'INFRA-2');
    assert.strictEqual(task2.status, TASK_STATUS.IN_PROGRESS);

    // Create Task 3
    task3 = await TaskService.createTask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      {
        projectId: testProjectId,
        workspaceId: testWorkspace._id.toString(),
        title: 'Optimize MongoDB index hit ratios',
        description: 'Add compound indexes on organisationId and status',
        status: TASK_STATUS.DONE,
        priority: TASK_PRIORITY.MEDIUM,
        tags: ['database', 'performance']
      }
    );

    assert.strictEqual(task3.taskNumber, 3);
    assert.strictEqual(task3.taskKey, 'INFRA-3');
    assert.strictEqual(task3.status, TASK_STATUS.DONE);

    // Check AuditLog
    const audits = await AuditLogModel.find({
      organisationId: testOrg._id,
      action: 'TASK_CREATED'
    });
    assert.ok(audits.length >= 3, 'Audit logs for task creation should be recorded');
  });

  // Test 2: Paginated Task List & Telemetry
  test('2. Retrieve paginated task list with telemetry counters', async () => {
    const res = await TaskService.getTasks(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      {
        projectId: testProjectId,
        page: 1,
        limit: 10
      }
    );

    assert.ok(res.tasks);
    assert.strictEqual(res.tasks.length, 3);
    assert.strictEqual(res.pagination.total, 3);
    assert.strictEqual(res.pagination.page, 1);
    assert.strictEqual(res.pagination.totalPages, 1);
    assert.strictEqual(res.pagination.hasMore, false);

    // Telemetry
    assert.strictEqual(res.telemetry.total, 3);
    assert.strictEqual(res.telemetry.todoCount, 1);
    assert.strictEqual(res.telemetry.inProgressCount, 1);
    assert.strictEqual(res.telemetry.doneCount, 1);
    assert.strictEqual(res.telemetry.urgentCount, 1);
  });

  // Test 3: Search and Multi-Facet Filtering
  test('3. Filter task list by search query, status, priority, and assignee', async () => {
    // 3a. Search text 'Redis'
    const searchRes = await TaskService.getTasks(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      {
        search: 'Redis',
        page: 1,
        limit: 10
      }
    );
    assert.strictEqual(searchRes.tasks.length, 1);
    assert.strictEqual(searchRes.tasks[0].id, task1.id);

    // 3b. Search tag 'security'
    const tagRes = await TaskService.getTasks(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      {
        search: 'security',
        page: 1,
        limit: 10
      }
    );
    assert.strictEqual(tagRes.tasks.length, 1);
    assert.strictEqual(tagRes.tasks[0].id, task2.id);

    // 3c. Filter by Priority 'urgent'
    const urgentRes = await TaskService.getTasks(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      {
        priority: TASK_PRIORITY.URGENT,
        page: 1,
        limit: 10
      }
    );
    assert.strictEqual(urgentRes.tasks.length, 1);
    assert.strictEqual(urgentRes.tasks[0].id, task2.id);

    // 3d. Filter by Status 'done'
    const doneRes = await TaskService.getTasks(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      {
        status: TASK_STATUS.DONE,
        page: 1,
        limit: 10
      }
    );
    assert.strictEqual(doneRes.tasks.length, 1);
    assert.strictEqual(doneRes.tasks[0].id, task3.id);

    // 3e. Filter by Assignee
    const assigneeRes = await TaskService.getTasks(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      {
        assigneeId: memberUser._id.toString(),
        page: 1,
        limit: 10
      }
    );
    assert.strictEqual(assigneeRes.tasks.length, 1);
    assert.strictEqual(assigneeRes.tasks[0].id, task1.id);
  });

  // Test 4: Single Task Retrieval
  test('4. Retrieve single task details with populated relations', async () => {
    const fetched = await TaskService.getTaskById(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      task1.id
    );

    assert.ok(fetched);
    assert.strictEqual(fetched.id, task1.id);
    assert.strictEqual(fetched.title, 'Implement Redis token revocation blacklist');
    assert.strictEqual(fetched.project.name, `Backend Infra Sprint ${testProject.name.split(' ').pop()}`);
    assert.strictEqual(fetched.project.key, 'INFRA');
    assert.ok(fetched.reporter);
    assert.strictEqual(fetched.reporter?.id, ownerUser._id.toString());
  });

  // Test 5: Task Editing (Fields, Status, Priority, Assignees)
  test('5. Update task title, status, priority, and assignees', async () => {
    // 5a. Full update
    const updated = await TaskService.updateTask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      task1.id,
      {
        title: 'Implement Redis token revocation blacklist with cluster failover',
        description: 'Enhanced cluster failover acceptance criteria',
        estimatedHours: 12
      }
    );

    assert.strictEqual(updated.title, 'Implement Redis token revocation blacklist with cluster failover');
    assert.strictEqual(updated.estimatedHours, 12);

    // 5b. Quick Status Update
    const statusUpdated = await TaskService.updateStatus(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      task1.id,
      TASK_STATUS.IN_PROGRESS
    );
    assert.strictEqual(statusUpdated.status, TASK_STATUS.IN_PROGRESS);

    // 5c. Quick Priority Update
    const prioUpdated = await TaskService.updatePriority(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      task1.id,
      TASK_PRIORITY.URGENT
    );
    assert.strictEqual(prioUpdated.priority, TASK_PRIORITY.URGENT);

    // 5d. Assignment update
    const unassigned = await TaskService.assignTask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      task1.id,
      []
    );
    assert.strictEqual(unassigned.assignees.length, 0);

    // Re-assign member
    const reassigned = await TaskService.assignTask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      task1.id,
      [memberUser._id.toString()]
    );
    assert.strictEqual(reassigned.assignees.length, 1);
  });

  // Test 6: Safe Archiving & Restoring
  test('6. Safe task archiving and restoration lifecycle', async () => {
    // Archive Task 3
    const archived = await TaskService.archiveTask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      task3.id
    );
    assert.strictEqual(archived.isArchived, true);
    assert.ok(archived.archivedAt);

    // Active task query should NOT return Task 3
    const activeTasks = await TaskService.getTasks(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      { isArchived: false }
    );
    assert.strictEqual(activeTasks.tasks.some((t) => t.id === task3.id), false);

    // Archived task query SHOULD return Task 3
    const archivedTasks = await TaskService.getTasks(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      { isArchived: true }
    );
    assert.strictEqual(archivedTasks.tasks.some((t) => t.id === task3.id), true);

    // Restore Task 3
    const restored = await TaskService.restoreTask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      task3.id
    );
    assert.strictEqual(restored.isArchived, false);

    // Now active task query should return Task 3 again
    const activeAgain = await TaskService.getTasks(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      { isArchived: false }
    );
    assert.strictEqual(activeAgain.tasks.some((t) => t.id === task3.id), true);
  });

  // Test 7: Task Activity Trail
  test('7. Retrieve real immutable audit activity history for task', async () => {
    const activity = await TaskService.getTaskActivity(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      task1.id,
      20
    );

    assert.ok(activity);
    assert.ok(activity.length >= 3, 'Must record creation and subsequent update activities');

    const actions = activity.map((a) => a.action);
    assert.ok(actions.includes('TASK_CREATED'));
    assert.ok(actions.includes('TASK_UPDATED'));
  });

  // Test 8: Permanent Task Deletion
  test('8. Permanent task deletion and 404 confirmation', async () => {
    // Create temporary task to delete
    const tempTask = await TaskService.createTask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      {
        projectId: testProjectId,
        workspaceId: testWorkspace._id.toString(),
        title: 'Temporary task for deletion test',
        status: TASK_STATUS.BACKLOG
      }
    );

    // Delete it permanently
    const delRes = await TaskService.deleteTask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      tempTask.id
    );
    assert.strictEqual(delRes.success, true);
    assert.strictEqual(delRes.taskId, tempTask.id);

    // Attempt to retrieve should throw 404
    await assert.rejects(
      async () => {
        await TaskService.getTaskById(
          ownerUser._id.toString(),
          testOrg._id.toString(),
          tempTask.id
        );
      },
      (err: any) => err.statusCode === 404 || err.code === 'TASK_NOT_FOUND',
      'Deleted task must return 404'
    );
  });

  // Test 9: Multi-Tenant & Cross-Project Isolation
  test('9. Enforce strict multi-tenant and organization isolation', async () => {
    // 9a. Outsider cannot retrieve task of another org
    await assert.rejects(
      async () => {
        await TaskService.getTaskById(
          outsiderUser._id.toString(),
          outsiderOrg._id.toString(),
          task1.id
        );
      },
      (err: any) => err.statusCode === 404 || err.code === 'TASK_NOT_FOUND',
      'Outsider cannot access task from another organization'
    );

    // 9b. Cannot create task in a project from another organization
    await assert.rejects(
      async () => {
        await TaskService.createTask(
          ownerUser._id.toString(),
          testOrg._id.toString(),
          {
            projectId: outsiderProjectId,
            workspaceId: testWorkspace._id.toString(),
            title: 'Malicious cross-tenant task injection'
          }
        );
      },
      (err: any) => err.statusCode === 404 || err.code === 'PROJECT_NOT_FOUND',
      'Cannot create task inside a project of another organization'
    );
  });

  after(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
});

