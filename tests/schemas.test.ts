import { describe, it } from 'node:test';
import assert from 'node:assert';
import { registerSchema, loginSchema, verifyEmailSchema } from '../src/shared/validation/auth.js';
import { createTaskSchema } from '../src/shared/validation/task.js';
import { TASK_STATUS, TASK_PRIORITY } from '../src/shared/constants/status.js';

describe('Shared Zod Schemas Validation', () => {
  describe('Authentication Schemas', () => {
    it('should validate a valid registration payload', () => {
      const payload = {
        email: 'founder@workzen.io',
        password: 'SecurePassword123!',
        firstName: 'Elena',
        lastName: 'Rostova',
        organisationName: 'Workzen Technologies'
      };

      const result = registerSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    it('should reject invalid registration email and short password', () => {
      const payload = {
        email: 'invalid-email-format',
        password: 'short',
        firstName: 'Elena',
        lastName: 'Rostova',
        organisationName: 'W'
      };

      const result = registerSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
      if (!result.success) {
        const issues = result.error.flatten().fieldErrors;
        assert.ok(issues.email);
        assert.ok(issues.password);
        assert.ok(issues.organisationName);
      }
    });

    it('should validate a 6-digit numeric OTP', () => {
      assert.strictEqual(verifyEmailSchema.safeParse({ email: 'user@workzen.io', otp: '123456' }).success, true);
      assert.strictEqual(verifyEmailSchema.safeParse({ email: 'user@workzen.io', otp: '12345' }).success, false);
      assert.strictEqual(verifyEmailSchema.safeParse({ email: 'user@workzen.io', otp: '1234567' }).success, false);
    });
  });

  describe('Task Schemas', () => {
    it('should validate valid task creation and supply defaults', () => {
      const payload = {
        projectId: 'prj_001',
        workspaceId: 'ws_001',
        title: 'Configure Socket.IO cluster'
      };

      const result = createTaskSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data.status, TASK_STATUS.TODO);
        assert.strictEqual(result.data.priority, TASK_PRIORITY.MEDIUM);
        assert.deepStrictEqual(result.data.assigneeIds, []);
      }
    });
  });
});

