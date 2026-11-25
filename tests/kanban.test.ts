// tests/kanban.test.ts
// WORKZEN Phase 13: Project Kanban Board Integration Test Suite

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { AuthService } from '../src/server/services/authService.js';
import { OrganisationService } from '../src/server/services/orgService.js';
import { WorkspaceService } from '../src/server/services/workspaceService.js';
import { ProjectService } from '../src/server/services/projectService.js';
import { KanbanService } from '../src/server/services/kanbanService.js';
import { UserModel } from '../src/server/models/User.js';
import { ProjectModel } from '../src/server/models/Project.js';
import { TaskModel } from '../src/server/models/Task.js';
import { AuditLogModel } from '../src/server/models/AuditLog.js';
import { OrganisationMembershipModel } from '../src/server/models/OrganisationMembership.js';
import { ENV } from '../src/server/config/env.js';
import { TASK_STATUS, TASK_PRIORITY } from '../src/shared/constants/status.js';

describe('Phase 13 — Kanban Board & Sprint Task Workflow Engine', () => {
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
        email: `kanban.owner.${ts}@workzen.io`,
        password: 'Password123!',
        firstName: 'Kanban',
        lastName: 'Lead',
        organisationName: `Kanban Enterprise Org ${ts}`
      });
      ownerUser = await UserModel.findById(ownerReg.id);

      const orgs = await OrganisationService.getUserOrganisations(ownerUser._id.toString());
      testOrg = orgs[0];

      // 2. Create Workspace
      testWorkspace = await WorkspaceService.createWorkspace(
        testOrg._id.toString(),
        ownerUser._id.toString(),
        {
          name: `Kanban Workspace ${ts}`,
          slug: `kanban-ws-${ts}`,
          type: 'engineering',
          isPrivate: false
        }
      );

      // 3. Create Project
      testProject = await ProjectService.createProject(
        ownerUser._id.toString(),
        testOrg._id.toString(),
        {
          name: `Core Platform Sprint ${ts}`,
          key: 'PLAT',
          description: 'Platform infrastructure and core services sprint',
          workspaceId: testWorkspace._id.toString(),
          color: '#4F46E5',
          priority: 'high',
          visibility: 'workspace'
        }
      );
      testProjectId = (testProject.id || testProject._id).toString();

      // 4. Create Member User in Same Org
      const memberReg = await AuthService.register({
        email: `kanban.member.${ts}@workzen.io`,
        password: 'Password123!',
        firstName: 'Dev',
        lastName: 'Engineer',
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
        email: `kanban.outsider.${ts}@workzen.io`,
        password: 'Password123!',
        firstName: 'Outsider',
        lastName: 'User',
        organisationName: `Unrelated Org ${ts}`
      });
      outsiderUser = await UserModel.findById(outsiderReg.id);
      const outsiderOrgs = await OrganisationService.getUserOrganisations(outsiderUser._id.toString());
      outsiderOrg = outsiderOrgs[0];

      const outsiderWs = await WorkspaceService.createWorkspace(
        outsiderOrg._id.toString(),
        outsiderUser._id.toString(),
        {
          name: `Isolated WS ${ts}`,
          slug: `isolated-ws-${ts}`,
          type: 'operations',
          isPrivate: true
        }
      );

      outsiderProject = await ProjectService.createProject(
        outsiderUser._id.toString(),
        outsiderOrg._id.toString(),
        {
          name: `Isolated Project ${ts}`,
          key: 'ISOL',
          workspaceId: outsiderWs._id.toString(),
          color: '#10B981',
          priority: 'medium',
          description: 'Isolated test project',
          visibility: 'restricted'
        }
      );
      outsiderProjectId = (outsiderProject.id || outsiderProject._id).toString();
    } catch (err) {
      console.error('Test Setup Failed:', err);
      throw err;
    }
  });

  // Test 1: Empty Kanban Board Retrieval
  test('1. Get Empty Project Kanban Board with standard columns and 0 telemetry', async () => {
    const board = await KanbanService.getProjectKanbanBoard(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProjectId
    );

    assert.ok(board, 'Board response must exist');
    assert.strictEqual(board.project.key, 'PLAT');
    assert.strictEqual(board.totalTasks, 0);
    assert.strictEqual(board.completedTasks, 0);
    assert.strictEqual(board.progressPercentage, 0);
    assert.strictEqual(board.columns.length, 5, 'Should have standard 5 workflow columns');

    const columnIds = board.columns.map((c) => c.id);
    assert.ok(columnIds.includes(TASK_STATUS.BACKLOG));
    assert.ok(columnIds.includes(TASK_STATUS.TODO));
    assert.ok(columnIds.includes(TASK_STATUS.IN_PROGRESS));
    assert.ok(columnIds.includes(TASK_STATUS.REVIEW));
    assert.ok(columnIds.includes(TASK_STATUS.DONE));
  });

  // Test 2: Sequential Task Creation
  let createdTask1: any;
  let createdTask2: any;
  let createdTask3: any;

  test('2. Create tasks with sequential taskNumber, taskKey, and column order', async () => {
    // Task 1: in TODO
    createdTask1 = await KanbanService.createTask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProjectId,
      {
        title: 'Implement Redis token cache',
        description: 'Cache session tokens for low latency invalidation',
        status: TASK_STATUS.TODO,
        priority: TASK_PRIORITY.HIGH,
        tags: ['backend', 'cache', 'redis'],
        assigneeIds: [memberUser._id.toString()]
      }
    );

    assert.ok(createdTask1);
    assert.strictEqual(createdTask1.taskNumber, 1);
    assert.strictEqual(createdTask1.taskKey, 'PLAT-1');
    assert.strictEqual(createdTask1.status, TASK_STATUS.TODO);
    assert.strictEqual(createdTask1.order, 0);

    // Task 2: in TODO
    createdTask2 = await KanbanService.createTask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProjectId,
      {
        title: 'Design responsive Kanban drag indicators',
        description: 'Provide clear visual feedback when dragging tasks',
        status: TASK_STATUS.TODO,
        priority: TASK_PRIORITY.MEDIUM,
        tags: ['frontend', 'ui']
      }
    );

    assert.strictEqual(createdTask2.taskNumber, 2);
    assert.strictEqual(createdTask2.taskKey, 'PLAT-2');
    assert.strictEqual(createdTask2.status, TASK_STATUS.TODO);
    assert.strictEqual(createdTask2.order, 1, 'Second task in column should have order 1');

    // Task 3: in IN_PROGRESS
    createdTask3 = await KanbanService.createTask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProjectId,
      {
        title: 'Configure automated security scanning',
        description: 'Run Snyk and Dependabot in CI pipeline',
        status: TASK_STATUS.IN_PROGRESS,
        priority: TASK_PRIORITY.URGENT,
        tags: ['devops', 'security']
      }
    );

    assert.strictEqual(createdTask3.taskNumber, 3);
    assert.strictEqual(createdTask3.taskKey, 'PLAT-3');
    assert.strictEqual(createdTask3.status, TASK_STATUS.IN_PROGRESS);
    assert.strictEqual(createdTask3.order, 0);

    // Verify Audit Log for TASK_CREATED
    const auditLogs = await AuditLogModel.find({
      organisationId: testOrg._id,
      action: 'TASK_CREATED'
    });
    assert.ok(auditLogs.length >= 3, 'Audit logs for task creation should be recorded');
  });

  // Test 3: Board Telemetry after creation
  test('3. Verify telemetry counters after task creation', async () => {
    const board = await KanbanService.getProjectKanbanBoard(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProjectId
    );

    assert.strictEqual(board.totalTasks, 3);
    assert.strictEqual(board.todoTasks, 2);
    assert.strictEqual(board.inProgressTasks, 1);
    assert.strictEqual(board.completedTasks, 0);
    assert.strictEqual(board.progressPercentage, 0);

    const todoCol = board.columns.find((c) => c.id === TASK_STATUS.TODO);
    assert.strictEqual(todoCol?.tasks.length, 2);
    assert.strictEqual(todoCol?.tasks[0].taskKey, 'PLAT-1');
    assert.strictEqual(todoCol?.tasks[1].taskKey, 'PLAT-2');
  });

  // Test 4: Task Movement Across Columns
  test('4. Move Task across workflow columns (TODO -> IN_PROGRESS -> REVIEW -> DONE)', async () => {
    // Move Task 1 from TODO to IN_PROGRESS
    const move1 = await KanbanService.moveTask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProjectId,
      createdTask1.id,
      TASK_STATUS.IN_PROGRESS
    );
    assert.strictEqual(move1.status, TASK_STATUS.IN_PROGRESS);

    // Move Task 1 from IN_PROGRESS to REVIEW
    const move2 = await KanbanService.moveTask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProjectId,
      createdTask1.id,
      TASK_STATUS.REVIEW
    );
    assert.strictEqual(move2.status, TASK_STATUS.REVIEW);

    // Move Task 1 from REVIEW to DONE
    const move3 = await KanbanService.moveTask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProjectId,
      createdTask1.id,
      TASK_STATUS.DONE
    );
    assert.strictEqual(move3.status, TASK_STATUS.DONE);

    // Verify progress telemetry updated
    const board = await KanbanService.getProjectKanbanBoard(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProjectId
    );
    assert.strictEqual(board.completedTasks, 1);
    assert.strictEqual(board.todoTasks, 1);
    assert.strictEqual(board.inProgressTasks, 1);
    // 1 completed out of 3 = 33%
    assert.strictEqual(board.progressPercentage, 33);

    // Verify AuditLog for TASK_MOVED
    const moveAudit = await AuditLogModel.findOne({
      organisationId: testOrg._id,
      action: 'TASK_MOVED',
      entityId: new mongoose.Types.ObjectId(createdTask1.id)
    });
    assert.ok(moveAudit, 'Audit log for task movement should exist');
  });

  // Test 5: Reorder Tasks inside Column
  test('5. Reorder tasks within a Kanban column', async () => {
    // Create two more tasks in BACKLOG
    const b1 = await KanbanService.createTask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProjectId,
      { title: 'Backlog Item A', status: TASK_STATUS.BACKLOG }
    );
    const b2 = await KanbanService.createTask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProjectId,
      { title: 'Backlog Item B', status: TASK_STATUS.BACKLOG }
    );
    const b3 = await KanbanService.createTask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProjectId,
      { title: 'Backlog Item C', status: TASK_STATUS.BACKLOG }
    );

    // Reorder: B, C, A
    const reordered = await KanbanService.reorderColumn(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProjectId,
      TASK_STATUS.BACKLOG,
      [b2.id, b3.id, b1.id]
    );

    assert.strictEqual(reordered.reorderedCount, 3);

    // Fetch board and inspect backlog column order
    const board = await KanbanService.getProjectKanbanBoard(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProjectId
    );
    const backlogCol = board.columns.find((c) => c.id === TASK_STATUS.BACKLOG);
    assert.ok(backlogCol);
    assert.strictEqual(backlogCol.tasks[0].id, b2.id);
    assert.strictEqual(backlogCol.tasks[1].id, b3.id);
    assert.strictEqual(backlogCol.tasks[2].id, b1.id);
  });

  // Test 6: Search & Multi-facet Filtering
  test('6. Filter Kanban board by search query, priority, and assignee', async () => {
    // 6a. Search query matching 'Redis'
    const searchRes = await KanbanService.getProjectKanbanBoard(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProjectId,
      { search: 'Redis' }
    );
    assert.strictEqual(searchRes.totalTasks, 1);
    assert.strictEqual(searchRes.columns.find((c) => c.id === TASK_STATUS.DONE)?.tasks.length, 1);

    // 6b. Search query matching tag 'security'
    const tagRes = await KanbanService.getProjectKanbanBoard(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProjectId,
      { search: 'security' }
    );
    assert.strictEqual(tagRes.totalTasks, 1);
    assert.strictEqual(tagRes.columns.find((c) => c.id === TASK_STATUS.IN_PROGRESS)?.tasks[0].id, createdTask3.id);

    // 6c. Filter by priority 'urgent'
    const urgentRes = await KanbanService.getProjectKanbanBoard(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProjectId,
      { priority: TASK_PRIORITY.URGENT }
    );
    assert.strictEqual(urgentRes.totalTasks, 1);

    // 6d. Filter by assignee
    const assigneeRes = await KanbanService.getProjectKanbanBoard(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      testProjectId,
      { assigneeId: memberUser._id.toString() }
    );
    assert.strictEqual(assigneeRes.totalTasks, 1);
    assert.strictEqual(assigneeRes.columns.find((c) => c.id === TASK_STATUS.DONE)?.tasks[0].id, createdTask1.id);
  });

  // Test 7: Multi-Tenant & Cross-Project Isolation
  test('7. Enforce multi-tenant and cross-project security boundaries', async () => {
    // 7a. Outsider from another org cannot get project's board
    await assert.rejects(
      async () => {
        await KanbanService.getProjectKanbanBoard(
          outsiderUser._id.toString(),
          outsiderOrg._id.toString(),
          testProjectId
        );
      },
      (err: any) => err.statusCode === 404 || err.code === 'PROJECT_NOT_FOUND',
      'Outsider cannot access board of another org'
    );

    // 7b. Cannot move task using mismatched projectId
    await assert.rejects(
      async () => {
        await KanbanService.moveTask(
          ownerUser._id.toString(),
          testOrg._id.toString(),
          outsiderProjectId,
          createdTask1.id,
          TASK_STATUS.BACKLOG
        );
      },
      (err: any) => err.statusCode === 404,
      'Cannot move task belonging to a different project'
    );
  });

  after(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
});
