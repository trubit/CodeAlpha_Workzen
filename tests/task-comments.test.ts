// tests/task-comments.test.ts
// WORKZEN Phase 16: Task Comments & Discussions Integration Test Suite

import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { AuthService } from '../src/server/services/authService.js';
import { OrganisationService } from '../src/server/services/orgService.js';
import { WorkspaceService } from '../src/server/services/workspaceService.js';
import { ProjectService } from '../src/server/services/projectService.js';
import { TaskService } from '../src/server/services/taskService.js';
import { CommentService } from '../src/server/services/commentService.js';
import { UserModel } from '../src/server/models/User.js';
import { TaskModel } from '../src/server/models/Task.js';
import { CommentModel } from '../src/server/models/Comment.js';
import { NotificationModel } from '../src/server/models/Notification.js';
import { ENV } from '../src/server/config/env.js';
import { TASK_STATUS, TASK_PRIORITY } from '../src/shared/constants/status.js';

describe('Phase 16 — Task Comments & Discussions Enterprise Suite', () => {
  let authorUser: any;
  let colleagueUser: any;
  let outsiderUser: any;
  let testOrg: any;
  let outsiderOrg: any;
  let testWorkspace: any;
  let testProject: any;
  let testTask: any;
  let secondTask: any;

  before(async () => {
    try {
      if (mongoose.connection.readyState !== 1) {
        if (mongoose.connection.readyState !== 0) {
          await mongoose.disconnect();
        }
        await mongoose.connect(ENV.MONGODB_URI);
      }

      const ts = Date.now();

      // 1. Author and Primary Organization
      const authorReg = await AuthService.register({
        email: `comments.author.${ts}@workzen.io`,
        password: 'Password123!',
        firstName: 'Alex',
        lastName: 'Author',
        organisationName: `Comments Org ${ts}`
      });
      authorUser = await UserModel.findById(authorReg.id);

      const orgs = await OrganisationService.getUserOrganisations(authorUser._id.toString());
      testOrg = orgs[0];

      // 2. Colleague in same organization for @mentions
      const colleagueReg = await AuthService.register({
        email: `comments.colleague.${ts}@workzen.io`,
        password: 'Password123!',
        firstName: 'Sarah',
        lastName: 'Connor',
        organisationName: `Temp Org ${ts}`
      });
      colleagueUser = await UserModel.findById(colleagueReg.id);

      // Add colleague to testOrg
      const { OrganisationMembershipModel } = await import('../src/server/models/OrganisationMembership.js');
      await OrganisationMembershipModel.create({
        organisationId: testOrg._id,
        userId: colleagueUser._id,
        role: 'member',
        status: 'active'
      });

      // 3. Outsider user and separate organization
      const outsiderReg = await AuthService.register({
        email: `comments.outsider.${ts}@workzen.io`,
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Outsider',
        organisationName: `Outsider Org ${ts}`
      });
      outsiderUser = await UserModel.findById(outsiderReg.id);
      const outOrgs = await OrganisationService.getUserOrganisations(outsiderUser._id.toString());
      outsiderOrg = outOrgs[0];

      // 4. Create Workspace and Project
      testWorkspace = await WorkspaceService.createWorkspace(
        testOrg._id.toString(),
        authorUser._id.toString(),
        {
          name: `Core Systems ${ts}`,
          slug: `core-sys-${ts}`,
          department: 'Engineering'
        }
      );

      testProject = await ProjectService.createProject(
        authorUser._id.toString(),
        testOrg._id.toString(),
        {
          name: `Authentication Infra ${ts}`,
          key: `AUTH`,
          workspaceId: testWorkspace._id.toString(),
          visibility: 'workspace',
          priority: 'high'
        }
      );

      const testProjectId = (testProject.id || testProject._id).toString();

      // 5. Create Test Task
      testTask = await TaskService.createTask(
        authorUser._id.toString(),
        testOrg._id.toString(),
        {
          title: 'Implement Redis Token Blacklist Discussion',
          description: 'Evaluate failover behavior and token revocation cache.',
          projectId: testProjectId,
          workspaceId: testWorkspace._id.toString(),
          status: TASK_STATUS.IN_PROGRESS,
          priority: TASK_PRIORITY.HIGH,
          assigneeIds: [colleagueUser._id.toString()]
        }
      );

      // Create a second task to test cross-task constraints
      secondTask = await TaskService.createTask(
        authorUser._id.toString(),
        testOrg._id.toString(),
        {
          title: 'Second Task For Boundary Checks',
          projectId: testProjectId,
          workspaceId: testWorkspace._id.toString(),
          status: TASK_STATUS.TODO
        }
      );
    } catch (err) {
      console.error('Test before hook failed:', err);
      throw err;
    }
  });

  test('1. Create Root Comment on Task with Real Author Association', async () => {
    const comment = await CommentService.createComment(
      authorUser._id.toString(),
      testOrg._id.toString(),
      testTask.id,
      {
        content: 'Initial architecture review of the Redis sentinel cluster.'
      }
    );

    assert.ok(comment.id, 'Comment ID should be generated');
    assert.strictEqual(comment.author.id, authorUser._id.toString(), 'Author must match creator');
    assert.strictEqual(comment.content, 'Initial architecture review of the Redis sentinel cluster.');
    assert.strictEqual(comment.isEdited, false, 'New comment should not be marked edited');
    assert.strictEqual(comment.isDeleted, false, 'New comment should not be deleted');
    assert.strictEqual(comment.replyCount, 0, 'New comment starts with 0 replies');

    // Verify Task commentCount was incremented
    const updatedTask = await TaskModel.findById(testTask.id);
    assert.strictEqual(updatedTask?.commentCount, 1, 'Task commentCount should be 1');
  });

  test('2. Content Validation Enforces Non-Empty and Reasonable Bounds', async () => {
    // Empty content rejection
    await assert.rejects(
      async () => {
        const { createCommentSchema } = await import('../src/shared/validation/comment.js');
        createCommentSchema.parse({ content: '   ' });
      },
      (err: any) => {
        return err.name === 'ZodError';
      },
      'Should reject empty whitespace comment'
    );

    // Max length rejection (> 5000 chars)
    await assert.rejects(
      async () => {
        const { createCommentSchema } = await import('../src/shared/validation/comment.js');
        createCommentSchema.parse({ content: 'a'.repeat(5001) });
      },
      (err: any) => {
        return err.name === 'ZodError';
      },
      'Should reject comment exceeding 5000 characters'
    );
  });

  test('3. 1-Level Threaded Reply Creation and Parent ReplyCount Increment', async () => {
    // Post root comment
    const rootComment = await CommentService.createComment(
      authorUser._id.toString(),
      testOrg._id.toString(),
      testTask.id,
      { content: 'Root discussion topic: memory limits.' }
    );

    // Post reply from colleague
    const reply = await CommentService.createComment(
      colleagueUser._id.toString(),
      testOrg._id.toString(),
      testTask.id,
      {
        content: 'We configured maxmemory to 2GB with allkeys-lru eviction.',
        parentId: rootComment.id
      }
    );

    assert.ok(reply.id, 'Reply ID should exist');
    assert.strictEqual(reply.parentId, rootComment.id, 'Reply parentId must match root comment');

    // Verify parent comment replyCount
    const parentDoc = await CommentModel.findById(rootComment.id);
    assert.strictEqual(parentDoc?.replyCount, 1, 'Parent replyCount should increment to 1');
  });

  test('4. Deep Nesting Guard Flattens Reply-to-Reply into 1-Level Threading', async () => {
    // Create root
    const root = await CommentService.createComment(
      authorUser._id.toString(),
      testOrg._id.toString(),
      testTask.id,
      { content: 'Base question about latency.' }
    );

    // Create child reply
    const child1 = await CommentService.createComment(
      colleagueUser._id.toString(),
      testOrg._id.toString(),
      testTask.id,
      { content: 'First reply to latency question.', parentId: root.id }
    );

    // Attempt to reply to child1 (depth 2)
    const child2 = await CommentService.createComment(
      authorUser._id.toString(),
      testOrg._id.toString(),
      testTask.id,
      { content: 'Second response.', parentId: child1.id }
    );

    // Must be threaded into the root comment, not nested deeper
    assert.strictEqual(child2.parentId, root.id, 'Reply to a reply must resolve to root parent');
  });

  test('5. Cross-Task Parent Comment Rejection', async () => {
    // Root comment on task 1
    const rootOnTask1 = await CommentService.createComment(
      authorUser._id.toString(),
      testOrg._id.toString(),
      testTask.id,
      { content: 'Comment on task 1.' }
    );

    // Attempt to reply on secondTask using parentId from testTask
    await assert.rejects(
      async () => {
        await CommentService.createComment(
          authorUser._id.toString(),
          testOrg._id.toString(),
          secondTask.id,
          { content: 'Invalid cross-task reply', parentId: rootOnTask1.id }
        );
      },
      /Parent comment not found on this task/,
      'Should reject parentId from a different task'
    );
  });

  test('6. Edit Comment by Author Updates Content and Sets isEdited Timestamp', async () => {
    const comment = await CommentService.createComment(
      authorUser._id.toString(),
      testOrg._id.toString(),
      testTask.id,
      { content: 'Original text before revision.' }
    );

    const updated = await CommentService.updateComment(
      authorUser._id.toString(),
      testOrg._id.toString(),
      comment.id,
      { content: 'Revised technical specification after team review.' }
    );

    assert.strictEqual(updated.content, 'Revised technical specification after team review.');
    assert.strictEqual(updated.isEdited, true, 'isEdited should be true');
    assert.ok(updated.editedAt, 'editedAt date must be present');
  });

  test('7. Unauthorized User Cannot Edit Someone Else\'s Comment', async () => {
    const comment = await CommentService.createComment(
      authorUser._id.toString(),
      testOrg._id.toString(),
      testTask.id,
      { content: 'Author protected statement.' }
    );

    await assert.rejects(
      async () => {
        await CommentService.updateComment(
          colleagueUser._id.toString(),
          testOrg._id.toString(),
          comment.id,
          { content: 'Malicious modification attempt.' }
        );
      },
      /Unauthorized/,
      'Non-author user must be rejected with Unauthorized'
    );
  });

  test('8. Soft-Deletion Preserves Thread Hierarchy When Replies Exist', async () => {
    const root = await CommentService.createComment(
      authorUser._id.toString(),
      testOrg._id.toString(),
      testTask.id,
      { content: 'Root comment with critical replies.' }
    );

    await CommentService.createComment(
      colleagueUser._id.toString(),
      testOrg._id.toString(),
      testTask.id,
      { content: 'Important child reply that must not be orphaned.', parentId: root.id }
    );

    // Delete the root comment
    const delResult = await CommentService.deleteComment(
      authorUser._id.toString(),
      testOrg._id.toString(),
      root.id
    );

    assert.strictEqual(delResult.success, true);
    assert.strictEqual(delResult.isSoftDeleted, true, 'Comment should be soft deleted');

    // Retrieve comments: the root comment should render placeholder text, but replies remain intact
    const fetched = await CommentService.getTaskComments(
      authorUser._id.toString(),
      testOrg._id.toString(),
      testTask.id
    );

    const deletedRoot = fetched.comments.find((c) => c.id === root.id);
    assert.ok(deletedRoot, 'Deleted root comment must remain in tree to anchor replies');
    assert.strictEqual(deletedRoot?.isDeleted, true);
    assert.strictEqual(deletedRoot?.content, '[This comment was deleted by author]');
    assert.strictEqual(deletedRoot?.replies?.length, 1, 'Replies should be preserved under root');
  });

  test('9. User Mentions Trigger In-App Notification Delivery', async () => {
    const comment = await CommentService.createComment(
      authorUser._id.toString(),
      testOrg._id.toString(),
      testTask.id,
      {
        content: `Checking in with @${colleagueUser.firstName} on performance metrics.`,
        mentions: [colleagueUser._id.toString()]
      }
    );

    assert.ok(comment.mentions.length > 0, 'Comment should contain resolved mentions');

    // Verify Notification document in MongoDB
    const notif = await NotificationModel.findOne({
      userId: colleagueUser._id,
      type: 'mention',
      entityId: testTask.id
    });

    assert.ok(notif, 'Mentioned user should have a notification record');
    assert.strictEqual(notif?.title, 'Mentioned in Task Discussion');
    assert.ok(notif?.message.includes('Alex Author mentioned you'));
  });

  test('10. Multi-Tenant Isolation: Cross-Org Task Access Denied', async () => {
    // Outsider from different org attempts to create a comment on testTask
    await assert.rejects(
      async () => {
        await CommentService.createComment(
          outsiderUser._id.toString(),
          outsiderOrg._id.toString(),
          testTask.id,
          { content: 'Attempt to inject comment into another tenant.' }
        );
      },
      /Task not found or access denied/,
      'Must reject comment creation across tenant boundaries'
    );

    // Outsider attempts to list comments for testTask
    await assert.rejects(
      async () => {
        await CommentService.getTaskComments(
          outsiderUser._id.toString(),
          outsiderOrg._id.toString(),
          testTask.id
        );
      },
      /Task not found or access denied/,
      'Must reject reading comments across tenant boundaries'
    );
  });
});
