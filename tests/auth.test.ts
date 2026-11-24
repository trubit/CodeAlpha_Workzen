// tests/auth.test.ts
// WORKZEN Enterprise Authentication Test Suite
// Verifies registration, password hashing, login, token rotation, verification & logout

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { AuthService } from '../src/server/services/authService.js';
import { UserModel } from '../src/server/models/User.js';
import { SessionModel } from '../src/server/models/Session.js';
import { hashPassword, comparePassword } from '../src/server/utils/crypto.js';
import { generateTokens, verifyAccessToken, verifyRefreshToken } from '../src/server/utils/jwt.js';
import { ENV } from '../src/server/config/env.js';

describe('Phase 5 — Complete Secure Authentication System', () => {
  const testUserEmail = `test.auth.${Date.now()}@workzen.io`;
  const testPassword = 'SecurePassword123!';
  let createdUserId: string;

  before(async () => {
    // Connect to test database if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(ENV.MONGODB_URI);
    }
  });

  after(async () => {
    // Clean up test records
    if (createdUserId) {
      await UserModel.findByIdAndDelete(createdUserId);
      await SessionModel.deleteMany({ userId: new mongoose.Types.ObjectId(createdUserId) });
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  // 1. Password Hashing & Security
  test('should securely hash password with bcrypt and verify comparison', async () => {
    const hash = await hashPassword('TestSecretPass123!');
    assert.notStrictEqual(hash, 'TestSecretPass123!');
    assert.ok(hash.startsWith('$2')); // bcrypt identifier

    const isMatch = await comparePassword('TestSecretPass123!', hash);
    assert.strictEqual(isMatch, true);

    const isWrongMatch = await comparePassword('WrongPassword123!', hash);
    assert.strictEqual(isWrongMatch, false);
  });

  // 2. JWT Access & Refresh Token Generation
  test('should generate and verify JWT token pairs with distinct secrets', () => {
    const payload = { userId: 'usr_test_123', email: 'test@workzen.io' };
    const tokens = generateTokens(payload);

    assert.ok(tokens.accessToken && tokens.refreshToken);

    const decodedAccess = verifyAccessToken(tokens.accessToken);
    assert.strictEqual(decodedAccess.userId, 'usr_test_123');
    assert.strictEqual(decodedAccess.email, 'test@workzen.io');

    const decodedRefresh = verifyRefreshToken(tokens.refreshToken);
    assert.strictEqual(decodedRefresh.userId, 'usr_test_123');
  });

  // 3. User Registration
  test('should register a new user in unverified pending state', async () => {
    const result = await AuthService.register({
      email: testUserEmail,
      password: testPassword,
      firstName: 'Test',
      lastName: 'Engineer',
      organisationName: 'Test Org'
    });

    assert.ok(result.id);
    assert.strictEqual(result.email, testUserEmail);
    createdUserId = result.id;

    const savedUser = await UserModel.findById(result.id);
    assert.ok(savedUser);
    assert.strictEqual(savedUser.isEmailVerified, false);
    assert.strictEqual(savedUser.status, 'pending');
  });

  // 4. Duplicate Registration Rejection
  test('should reject duplicate registration with the same email', async () => {
    await assert.rejects(
      async () => {
        await AuthService.register({
          email: testUserEmail,
          password: testPassword,
          firstName: 'Duplicate',
          lastName: 'User'
        });
      },
      (err: any) => {
        assert.strictEqual(err.statusCode, 409);
        return true;
      }
    );
  });

  // 5. Login without email verification (Confirmation pended as requested)
  test('should allow login without email verification (confirmation pended)', async () => {
    const loginRes = await AuthService.login(testUserEmail, testPassword);
    assert.ok(loginRes.accessToken);
    assert.ok(loginRes.refreshToken);
    assert.strictEqual(loginRes.user.email, testUserEmail);
  });

  // 6. Email Verification Workflow
  test('should verify email and activate user account via OTP', async () => {
    const user = await UserModel.findById(createdUserId).select('+passwordResetOTP');
    assert.ok(user && user.passwordResetOTP);

    const result = await AuthService.verifyEmail(testUserEmail, user.passwordResetOTP);

    assert.strictEqual(result.user.isEmailVerified, true);
    assert.strictEqual(result.user.status, 'active');
    assert.ok(result.accessToken && result.refreshToken);

    const updatedUser = await UserModel.findById(createdUserId);
    assert.strictEqual(updatedUser?.isEmailVerified, true);
    assert.strictEqual(updatedUser?.status, 'active');
  });

  // 7. Successful Login after Verification
  let activeRefreshToken: string;
  test('should successfully authenticate verified user and issue session', async () => {
    const result = await AuthService.login(testUserEmail, testPassword, {
      ipAddress: '127.0.0.1',
      userAgent: 'Automated-Test-Runner'
    });

    assert.ok(result.accessToken);
    assert.ok(result.refreshToken);
    assert.strictEqual(result.user.email, testUserEmail);
    activeRefreshToken = result.refreshToken;

    const sessionCount = await SessionModel.countDocuments({
      userId: new mongoose.Types.ObjectId(createdUserId),
      isRevoked: false
    });
    assert.ok(sessionCount >= 1);
  });

  // 8. Invalid Credentials Rejection
  test('should reject login with incorrect password with generic error', async () => {
    await assert.rejects(
      async () => {
        await AuthService.login(testUserEmail, 'WrongPassword123!');
      },
      (err: any) => {
        assert.strictEqual(err.statusCode, 401);
        assert.strictEqual(err.code, 'INVALID_CREDENTIALS');
        return true;
      }
    );
  });

  // 9. Refresh Token Rotation
  test('should rotate refresh token and return new credentials', async () => {
    const newTokens = await AuthService.refreshSession(activeRefreshToken, {
      ipAddress: '127.0.0.1'
    });

    assert.ok(newTokens.accessToken);
    assert.ok(newTokens.refreshToken);
    assert.notStrictEqual(newTokens.refreshToken, activeRefreshToken);

    activeRefreshToken = newTokens.refreshToken;
  });

  // 10. Password Reset & Session Revocation
  test('should reset password and revoke all existing sessions', async () => {
    // 1. Request forgot password
    await AuthService.forgotPassword(testUserEmail);

    const user = await UserModel.findById(createdUserId).select('+passwordResetOTP');
    assert.ok(user && user.passwordResetOTP);

    // 2. Perform reset
    const newPassword = 'NewlyUpdatedPassword123!';
    const resetResult = await AuthService.resetPassword(testUserEmail, user.passwordResetOTP, newPassword);

    assert.ok(resetResult.message.includes('Password has been reset'));

    // 3. Verify all sessions were revoked
    const activeSessions = await SessionModel.find({
      userId: new mongoose.Types.ObjectId(createdUserId),
      isRevoked: false
    });
    assert.strictEqual(activeSessions.length, 0);

    // 4. Verify login with new credentials works
    const loginResult = await AuthService.login(testUserEmail, newPassword);
    assert.ok(loginResult.accessToken);
  });

  // 11. Logout & Session Invalidation
  test('should invalidate session on logout', async () => {
    const loginRes = await AuthService.login(testUserEmail, 'NewlyUpdatedPassword123!');
    assert.ok(loginRes.refreshToken);

    await AuthService.logout(loginRes.refreshToken);

    // Attempting to refresh with the logged-out token should fail
    await assert.rejects(
      async () => {
        await AuthService.refreshSession(loginRes.refreshToken);
      },
      (err: any) => {
        assert.strictEqual(err.statusCode, 401);
        return true;
      }
    );
  });
});
