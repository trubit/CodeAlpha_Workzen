// tests/subtasks-dependencies.test.ts
// WORKZEN Phase 15: Subtasks & Dependencies Integration Test Suite

import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { AuthService } from '../src/server/services/authService.js';
import { OrganisationService } from '../src/server/services/orgService.js';
import { WorkspaceService } from '../src/server/services/workspaceService.js';
import { ProjectService } from '../src/server/services/projectService.js';
import { TaskService } from '../src/server/services/taskService.js';
import { UserModel } from '../src/server/models/User.js';
import { TaskModel } from '../src/server/models/Task.js';
import { ENV } from '../src/server/config/env.js';
import { TASK_STATUS, TASK_PRIORITY } from '../src/shared/constants/status.js';

describe('Phase 15 — Subtasks & Dependencies Enterprise Suite', () => {
  let ownerUser: any;
  let outsiderUser: any;
  let testOrg: any;
  let testWorkspace: any;
  let testProject: any;
  let testProjectId: string;
  let outsiderOrg: any;

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
        email: `subtasks.owner.${ts}@workzen.io`,
        password: 'Password123!',
        firstName: 'Subtask',
        lastName: 'Manager',
        organisationName: `Subtasks Org ${ts}`
      });
      ownerUser = await UserModel.findById(ownerReg.id);

      const orgs = await OrganisationService.getUserOrganisations(ownerUser._id.toString());
      testOrg = orgs[0];

      // 2. Create Workspace
      testWorkspace = await WorkspaceService.createWorkspace(
        testOrg._id.toString(),
        ownerUser._id.toString(),
        {
          name: `Core Systems ${ts}`,
          slug: `core-sys-${ts}`,
          department: 'Engineering'
        }
      );

      // 3. Create Project
      testProject = await ProjectService.createProject(
        ownerUser._id.toString(),
        testOrg._id.toString(),
        {
          name: `Workflow Core Engine ${ts}`,
          key: 'ENG',
          description: 'Core workflow sprint tasks',
          workspaceId: testWorkspace._id.toString(),
          category: 'development',
          color: '#4F46E5',
          priority: 'high',
          visibility: 'workspace'
        }
      );
      testProjectId = (testProject.id || testProject._id).toString();

      // 4. Create Outsider User & Tenant
      const outsiderReg = await AuthService.register({
        email: `subtasks.outsider.${ts}@workzen.io`,
        password: 'Password123!',
        firstName: 'Outsider',
        lastName: 'User',
        organisationName: `External Boundary Org ${ts}`
      });
      outsiderUser = await UserModel.findById(outsiderReg.id);
      const outsiderOrgs = await OrganisationService.getUserOrganisations(outsiderUser._id.toString());
      outsiderOrg = outsiderOrgs[0];
    } catch (err) {
      console.error('BEFORE HOOK ERROR:', err);
      throw err;
    }
  });

  test('1. Subtask Creation & Parent Relationship', async () => {
    // Create Root Parent Task
    const parent = await TaskService.createTask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      {
        projectId: testProjectId,
        workspaceId: testWorkspace._id.toString(),
        title: 'Parent Task: Implement Security Architecture',
        status: TASK_STATUS.TODO,
        priority: TASK_PRIORITY.HIGH
      }
    );

    assert.ok(parent.id);
    assert.strictEqual(parent.title, 'Parent Task: Implement Security Architecture');

    // Create Subtask 1
    const subtask1 = await TaskService.createSubtask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      parent.id,
      {
        title: 'Subtask 1: Define OAuth2 PKCE flow',
        priority: TASK_PRIORITY.HIGH
      }
    );

    assert.ok(subtask1.id);
    assert.strictEqual(subtask1.parentId, parent.id);
    assert.strictEqual(subtask1.title, 'Subtask 1: Define OAuth2 PKCE flow');

    // Create Subtask 2
    const subtask2 = await TaskService.createSubtask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      parent.id,
      {
        title: 'Subtask 2: Configure Redis token eviction',
        priority: TASK_PRIORITY.MEDIUM
      }
    );

    assert.ok(subtask2.id);
    assert.strictEqual(subtask2.parentId, parent.id);

    // List subtasks
    const subtasks = await TaskService.getSubtasks(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      parent.id
    );

    assert.strictEqual(subtasks.length, 2);
    assert.strictEqual(subtasks[0].title, 'Subtask 1: Define OAuth2 PKCE flow');
    assert.strictEqual(subtasks[1].title, 'Subtask 2: Configure Redis token eviction');
  });

  test('2. Dynamic Subtask Progress Telemetry Calculation', async () => {
    // Create parent with 4 subtasks
    const parent = await TaskService.createTask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      {
        projectId: testProjectId,
        workspaceId: testWorkspace._id.toString(),
        title: 'Parent Progress Evaluation Task',
        status: TASK_STATUS.IN_PROGRESS,
        priority: TASK_PRIORITY.URGENT
      }
    );

    const st1 = await TaskService.createSubtask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      parent.id,
      { title: 'Subtask Step 1' }
    );
    const st2 = await TaskService.createSubtask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      parent.id,
      { title: 'Subtask Step 2' }
    );
    const st3 = await TaskService.createSubtask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      parent.id,
      { title: 'Subtask Step 3' }
    );
    const st4 = await TaskService.createSubtask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      parent.id,
      { title: 'Subtask Step 4' }
    );

    // Initial state: 0/4 (0%)
    let parentFetched = await TaskService.getTaskById(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      parent.id
    );

    assert.deepStrictEqual(parentFetched.subtaskProgress, {
      total: 4,
      completed: 0,
      remaining: 4,
      percentage: 0
    });

    // Complete 1 subtask -> 1/4 (25%)
    await TaskService.updateStatus(ownerUser._id.toString(), testOrg._id.toString(), st1.id, TASK_STATUS.DONE);
    parentFetched = await TaskService.getTaskById(ownerUser._id.toString(), testOrg._id.toString(), parent.id);
    assert.strictEqual(parentFetched.subtaskProgress?.completed, 1);
    assert.strictEqual(parentFetched.subtaskProgress?.percentage, 25);

    // Complete 2nd subtask -> 2/4 (50%)
    await TaskService.updateStatus(ownerUser._id.toString(), testOrg._id.toString(), st2.id, TASK_STATUS.DONE);
    parentFetched = await TaskService.getTaskById(ownerUser._id.toString(), testOrg._id.toString(), parent.id);
    assert.strictEqual(parentFetched.subtaskProgress?.completed, 2);
    assert.strictEqual(parentFetched.subtaskProgress?.percentage, 50);

    // Complete remaining subtasks -> 4/4 (100%)
    await TaskService.updateStatus(ownerUser._id.toString(), testOrg._id.toString(), st3.id, TASK_STATUS.DONE);
    await TaskService.updateStatus(ownerUser._id.toString(), testOrg._id.toString(), st4.id, TASK_STATUS.DONE);
    parentFetched = await TaskService.getTaskById(ownerUser._id.toString(), testOrg._id.toString(), parent.id);
    assert.strictEqual(parentFetched.subtaskProgress?.completed, 4);
    assert.strictEqual(parentFetched.subtaskProgress?.remaining, 0);
    assert.strictEqual(parentFetched.subtaskProgress?.percentage, 100);
  });

  test('3. Max 1-Level Nesting Depth Enforcement', async () => {
    // Create root parent
    const parent = await TaskService.createTask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      {
        projectId: testProjectId,
        workspaceId: testWorkspace._id.toString(),
        title: 'Root Task for Nesting Verification'
      }
    );

    // Create Child Subtask
    const child = await TaskService.createSubtask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      parent.id,
      { title: 'Level 1 Child Subtask' }
    );

    // Attempt to create a nested subtask under child
    await assert.rejects(
      async () => {
        await TaskService.createSubtask(
          ownerUser._id.toString(),
          testOrg._id.toString(),
          child.id,
          { title: 'Illegal Level 2 Subtask' }
        );
      },
      (err: any) => {
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.code, 'SUBTASK_NESTING_LIMIT_EXCEEDED');
        return true;
      }
    );
  });

  test('4. Parent Task Archival & Cascade Synchronization', async () => {
    const parent = await TaskService.createTask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      {
        projectId: testProjectId,
        workspaceId: testWorkspace._id.toString(),
        title: 'Parent Task for Archival Cascade'
      }
    );

    const child = await TaskService.createSubtask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      parent.id,
      { title: 'Cascade Child Subtask' }
    );

    // Archive Parent
    await TaskService.archiveTask(ownerUser._id.toString(), testOrg._id.toString(), parent.id);

    // Verify both parent and child are archived
    const archivedChild: any = await TaskModel.findById(child.id).lean();
    assert.strictEqual(archivedChild.isArchived, true);

    // Restore Parent
    await TaskService.restoreTask(ownerUser._id.toString(), testOrg._id.toString(), parent.id);

    // Verify both parent and child are restored
    const restoredChild: any = await TaskModel.findById(child.id).lean();
    assert.strictEqual(restoredChild.isArchived, false);
  });

  test('5. Task Dependencies: Prerequisites, Dependents & Blocked Telemetry', async () => {
    // Create Task A and Task B
    const taskA = await TaskService.createTask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      {
        projectId: testProjectId,
        workspaceId: testWorkspace._id.toString(),
        title: 'Task A: API Gateway Deployment',
        status: TASK_STATUS.TODO
      }
    );

    const taskB = await TaskService.createTask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      {
        projectId: testProjectId,
        workspaceId: testWorkspace._id.toString(),
        title: 'Task B: Database Migration Schema',
        status: TASK_STATUS.IN_PROGRESS
      }
    );

    // Add Task B as Prerequisite to Task A (Task A is blocked by Task B)
    const depResult = await TaskService.addDependency(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      taskA.id,
      taskB.id
    );

    assert.strictEqual(depResult.prerequisites.length, 1);
    assert.strictEqual(depResult.prerequisites[0].id, taskB.id);
    assert.strictEqual(depResult.isBlocked, true); // Because Task B is IN_PROGRESS, not DONE

    // Verify Task B's dependents
    const bDeps = await TaskService.getDependencies(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      taskB.id
    );
    assert.strictEqual(bDeps.dependents.length, 1);
    assert.strictEqual(bDeps.dependents[0].id, taskA.id);

    // Check Task A details via getTaskById
    let fetchedA = await TaskService.getTaskById(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      taskA.id
    );
    assert.strictEqual(fetchedA.isBlocked, true);
    assert.strictEqual(fetchedA.blockedByTasks?.length, 1);

    // Advance Task B to DONE
    await TaskService.updateStatus(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      taskB.id,
      TASK_STATUS.DONE
    );

    // Task A should now be unblocked!
    fetchedA = await TaskService.getTaskById(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      taskA.id
    );
    assert.strictEqual(fetchedA.isBlocked, false);
  });

  test('6. Circular Dependency Detection (Direct 2-Node Cycle)', async () => {
    // Task A depends on Task B
    const taskA = await TaskService.createTask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      {
        projectId: testProjectId,
        workspaceId: testWorkspace._id.toString(),
        title: 'Task Alpha'
      }
    );

    const taskB = await TaskService.createTask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      {
        projectId: testProjectId,
        workspaceId: testWorkspace._id.toString(),
        title: 'Task Beta'
      }
    );

    // Alpha depends on Beta
    await TaskService.addDependency(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      taskA.id,
      taskB.id
    );

    // Attempting to make Beta depend on Alpha must be rejected with 400
    await assert.rejects(
      async () => {
        await TaskService.addDependency(
          ownerUser._id.toString(),
          testOrg._id.toString(),
          taskB.id,
          taskA.id
        );
      },
      (err: any) => {
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.code, 'CIRCULAR_DEPENDENCY_DETECTED');
        return true;
      }
    );
  });

  test('7. Circular Dependency Detection (Multi-Node Indirect Cycle: X -> Y -> Z -> X)', async () => {
    const taskX = await TaskService.createTask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      { projectId: testProjectId, workspaceId: testWorkspace._id.toString(), title: 'Task X' }
    );
    const taskY = await TaskService.createTask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      { projectId: testProjectId, workspaceId: testWorkspace._id.toString(), title: 'Task Y' }
    );
    const taskZ = await TaskService.createTask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      { projectId: testProjectId, workspaceId: testWorkspace._id.toString(), title: 'Task Z' }
    );

    // X depends on Y
    await TaskService.addDependency(ownerUser._id.toString(), testOrg._id.toString(), taskX.id, taskY.id);

    // Y depends on Z (Path: X -> Y -> Z)
    await TaskService.addDependency(ownerUser._id.toString(), testOrg._id.toString(), taskY.id, taskZ.id);

    // Attempting to make Z depend on X must be rejected with 400
    await assert.rejects(
      async () => {
        await TaskService.addDependency(
          ownerUser._id.toString(),
          testOrg._id.toString(),
          taskZ.id,
          taskX.id
        );
      },
      (err: any) => {
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.code, 'CIRCULAR_DEPENDENCY_DETECTED');
        return true;
      }
    );
  });

  test('8. Self-Dependency Rejection', async () => {
    const taskA = await TaskService.createTask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      {
        projectId: testProjectId,
        workspaceId: testWorkspace._id.toString(),
        title: 'Task Self-Dep Test'
      }
    );

    await assert.rejects(
      async () => {
        await TaskService.addDependency(
          ownerUser._id.toString(),
          testOrg._id.toString(),
          taskA.id,
          taskA.id
        );
      },
      (err: any) => {
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.code, 'CANNOT_DEPEND_ON_SELF');
        return true;
      }
    );
  });

  test('9. Remove Dependency', async () => {
    const taskA = await TaskService.createTask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      { projectId: testProjectId, workspaceId: testWorkspace._id.toString(), title: 'Task Rem A' }
    );
    const taskB = await TaskService.createTask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      { projectId: testProjectId, workspaceId: testWorkspace._id.toString(), title: 'Task Rem B' }
    );

    // Add dependency
    await TaskService.addDependency(ownerUser._id.toString(), testOrg._id.toString(), taskA.id, taskB.id);

    // Remove dependency
    const result = await TaskService.removeDependency(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      taskA.id,
      taskB.id
    );

    assert.strictEqual(result.prerequisites.length, 0);
    assert.strictEqual(result.isBlocked, false);
  });

  test('10. Multi-Tenant Isolation & Boundary Enforcement', async () => {
    const parent = await TaskService.createTask(
      ownerUser._id.toString(),
      testOrg._id.toString(),
      { projectId: testProjectId, workspaceId: testWorkspace._id.toString(), title: 'Isolated Task' }
    );

    // Outsider cannot add subtasks to parent from another tenant
    await assert.rejects(
      async () => {
        await TaskService.createSubtask(
          outsiderUser._id.toString(),
          outsiderOrg._id.toString(),
          parent.id,
          { title: 'Malicious Subtask' }
        );
      },
      (err: any) => {
        assert.strictEqual(err.statusCode, 404);
        assert.strictEqual(err.code, 'PARENT_TASK_NOT_FOUND');
        return true;
      }
    );
  });
});
