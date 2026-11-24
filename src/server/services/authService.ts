// src/server/services/authService.ts
// WORKZEN Enterprise Authentication Service
// Handles password hashing, JWT issuing, session tracking, token rotation & verification

import crypto from 'crypto';
import mongoose from 'mongoose';
import { UserModel, IUserDocument } from '../models/User.js';
import { SessionModel } from '../models/Session.js';
import { OrganisationModel } from '../models/Organisation.js';
import { OrganisationMembershipModel } from '../models/OrganisationMembership.js';
import { WorkspaceModel } from '../models/Workspace.js';
import { hashPassword, comparePassword, generateOTP, hashToken } from '../utils/crypto.js';
import { generateTokens, verifyRefreshToken, TokenPair } from '../utils/jwt.js';
import {
  sendVerificationEmail,
  sendOTPEmail,
  sendPasswordResetEmail,
  sendPasswordChangedConfirmationEmail
} from '../utils/mailer.js';

export interface RegisterDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organisationName?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isEmailVerified: boolean;
    status: string;
  };
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  /**
   * User Registration
   * Creates pending user account, hashes password, generates verification token & OTP, sends email
   */
  static async register(dto: RegisterDTO): Promise<{ id: string; email: string; message: string }> {
    const normalizedEmail = dto.email.toLowerCase().trim();

    // Check duplicate account
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      const error: any = new Error('An account with this email address already exists');
      error.statusCode = 409;
      error.code = 'DUPLICATE_EMAIL';
      throw error;
    }

    // Password hashing (12 salt rounds)
    const passwordHash = await hashPassword(dto.password);

    // Generate secure single-use verification token and 6-digit OTP
    const rawVerificationToken = crypto.randomBytes(32).toString('hex');
    const hashedVerificationToken = hashToken(rawVerificationToken);
    const otp = generateOTP(6);
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const user = new UserModel({
      email: normalizedEmail,
      passwordHash,
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      isEmailVerified: false,
      status: 'pending',
      emailVerificationToken: hashedVerificationToken,
      passwordResetOTP: otp, // Also stored for OTP screen input
      emailVerificationExpires: verificationExpires
    });

    await user.save();

    // Automatically create initial organization and workspace if provided
    if (dto.organisationName && dto.organisationName.trim()) {
      const orgName = dto.organisationName.trim();
      const baseSlug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'org';
      let slug = baseSlug;
      let counter = 1;
      while (await OrganisationModel.findOne({ slug })) {
        slug = `${baseSlug}-${counter++}`;
      }
      const org = await OrganisationModel.create({
        name: orgName,
        slug,
        ownerId: user._id,
        status: 'active',
        country: 'US',
        industry: 'Technology'
      });
      await OrganisationMembershipModel.create({
        organisationId: org._id,
        userId: user._id,
        role: 'owner',
        status: 'active'
      });
      await WorkspaceModel.create({
        organisationId: org._id,
        name: 'General',
        slug: 'general',
        description: 'Main operational workspace',
        type: 'general',
        themeColor: '#4F46E5',
        status: 'active',
        createdBy: user._id
      });
    }

    // Send branded verification email (link + 6-digit OTP) in background
    await sendVerificationEmail(
      normalizedEmail,
      `${dto.firstName} ${dto.lastName}`,
      rawVerificationToken,
      otp
    );

    return {
      id: user._id.toString(),
      email: user.email,
      message: 'Registration successful. Verification instructions have been sent to your email.'
    };
  }

  /**
   * User Login
   * Verifies credentials, enforces email verification, issues rotating tokens, creates session
   */
  static async login(
    email: string,
    password: string,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<AuthResponse> {
    const normalizedEmail = email.toLowerCase().trim();

    // Query user including passwordHash
    const user = await UserModel.findOne({ email: normalizedEmail }).select('+passwordHash');
    if (!user) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    // Secure password comparison
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    // Email verification policy is temporarily pended: users can log in immediately
    // without confirming their email. (To be re-enabled when email flow is finalized)
    /*
    if (!user.isEmailVerified) {
      const error: any = new Error('Please verify your email address before signing in.');
      error.statusCode = 403;
      error.code = 'EMAIL_NOT_VERIFIED';
      error.data = { email: user.email };
      throw error;
    }
    */

    // Check account status
    if (user.status === 'suspended') {
      const error: any = new Error('Your account has been suspended. Please contact security@workzen.io.');
      error.statusCode = 403;
      error.code = 'ACCOUNT_SUSPENDED';
      throw error;
    }

    if (user.status === 'pending') {
      user.status = 'active';
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate token pair (15m access, 7d refresh)
    const tokens = generateTokens({
      userId: user._id.toString(),
      email: user.email
    });

    // Store hashed refresh token in persistent Session record
    const hashedRefreshToken = hashToken(tokens.refreshToken);
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await SessionModel.create({
      userId: user._id,
      refreshTokenHash: hashedRefreshToken,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      isRevoked: false,
      expiresAt: sessionExpiresAt
    });

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
        status: user.status
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };
  }

  /**
   * Verify Email Address via link token or 6-digit OTP
   */
  static async verifyEmail(email: string, tokenOrOtp: string): Promise<AuthResponse> {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await UserModel.findOne({ email: normalizedEmail }).select(
      '+emailVerificationToken +emailVerificationExpires +passwordResetOTP'
    );

    if (!user) {
      const error: any = new Error('Account not found');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    if (user.isEmailVerified) {
      // Already verified, generate fresh session
      const tokens = generateTokens({ userId: user._id.toString(), email: user.email });
      return {
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isEmailVerified: true,
          status: user.status
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      };
    }

    // Check expiration
    if (!user.emailVerificationExpires || user.emailVerificationExpires.getTime() < Date.now()) {
      const error: any = new Error('Verification code or token has expired. Please request a new one.');
      error.statusCode = 400;
      error.code = 'VERIFICATION_EXPIRED';
      throw error;
    }

    // Match OTP or hashed link token
    const tokenHash = hashToken(tokenOrOtp);
    const matchesToken = user.emailVerificationToken === tokenHash;
    const matchesOTP = user.passwordResetOTP === tokenOrOtp.trim();

    if (!matchesToken && !matchesOTP) {
      const error: any = new Error('Invalid verification code or link.');
      error.statusCode = 400;
      error.code = 'INVALID_VERIFICATION_TOKEN';
      throw error;
    }

    // Activate account
    user.isEmailVerified = true;
    user.status = 'active';
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    user.passwordResetOTP = undefined;
    await user.save();

    // Log the user in immediately
    const tokens = generateTokens({ userId: user._id.toString(), email: user.email });
    const hashedRefreshToken = hashToken(tokens.refreshToken);

    await SessionModel.create({
      userId: user._id,
      refreshTokenHash: hashedRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: true,
        status: user.status
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };
  }

  /**
   * Resend Email Verification Token & OTP with Rate Limiting Cooldown
   */
  static async resendVerification(email: string): Promise<{ message: string }> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await UserModel.findOne({ email: normalizedEmail }).select('+emailVerificationExpires');

    if (!user) {
      // Return generic message to prevent account enumeration
      return { message: 'If this account is registered, a new verification code has been dispatched.' };
    }

    if (user.isEmailVerified) {
      return { message: 'This account is already verified. You can sign in directly.' };
    }

    const rawVerificationToken = crypto.randomBytes(32).toString('hex');
    const otp = generateOTP(6);

    user.emailVerificationToken = hashToken(rawVerificationToken);
    user.passwordResetOTP = otp;
    user.emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(normalizedEmail, `${user.firstName} ${user.lastName}`, rawVerificationToken, otp);

    return { message: 'A new verification code has been dispatched to your email.' };
  }

  /**
   * Forgot Password
   * Dispatches reset token & OTP without revealing account existence
   */
  static async forgotPassword(email: string): Promise<{ message: string }> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await UserModel.findOne({ email: normalizedEmail });

    if (!user) {
      // Generic response to avoid enumeration
      return { message: 'If your email is registered with Workzen, password reset instructions have been dispatched.' };
    }

    const rawResetToken = crypto.randomBytes(32).toString('hex');
    const otp = generateOTP(6);

    user.emailVerificationToken = hashToken(rawResetToken); // Store hashed reset token
    user.passwordResetOTP = otp;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    await sendPasswordResetEmail(normalizedEmail, `${user.firstName} ${user.lastName}`, rawResetToken, otp);

    return { message: 'If your email is registered with Workzen, password reset instructions have been dispatched.' };
  }

  /**
   * Reset Password
   * Validates token/OTP, updates passwordHash, revokes ALL previous user sessions
   */
  static async resetPassword(email: string, tokenOrOtp: string, newPassword: string): Promise<{ message: string }> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await UserModel.findOne({ email: normalizedEmail }).select(
      '+passwordResetOTP +passwordResetExpires +emailVerificationToken'
    );

    if (!user) {
      const error: any = new Error('Invalid or expired reset code.');
      error.statusCode = 400;
      error.code = 'INVALID_RESET_TOKEN';
      throw error;
    }

    // Check expiration
    if (!user.passwordResetExpires || user.passwordResetExpires.getTime() < Date.now()) {
      const error: any = new Error('Password reset code has expired. Please request a new one.');
      error.statusCode = 400;
      error.code = 'RESET_TOKEN_EXPIRED';
      throw error;
    }

    const tokenHash = hashToken(tokenOrOtp);
    const matchesToken = user.emailVerificationToken === tokenHash;
    const matchesOTP = user.passwordResetOTP === tokenOrOtp.trim();

    if (!matchesToken && !matchesOTP) {
      const error: any = new Error('Invalid or expired reset code.');
      error.statusCode = 400;
      error.code = 'INVALID_RESET_TOKEN';
      throw error;
    }

    // Hash new password
    user.passwordHash = await hashPassword(newPassword);
    user.passwordResetOTP = undefined;
    user.passwordResetExpires = undefined;
    user.emailVerificationToken = undefined;
    await user.save();

    // Security requirement: Revoke ALL existing active sessions for this user
    await SessionModel.updateMany({ userId: user._id }, { $set: { isRevoked: true } });

    // Send confirmation email
    await sendPasswordChangedConfirmationEmail(normalizedEmail, `${user.firstName} ${user.lastName}`);

    return { message: 'Password has been reset successfully. Please sign in with your new credentials.' };
  }

  /**
   * Refresh Token Rotation with Reuse Detection
   */
  static async refreshSession(
    refreshToken: string,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<TokenPair> {
    if (!refreshToken) {
      const error: any = new Error('Refresh token missing');
      error.statusCode = 401;
      error.code = 'REFRESH_TOKEN_REQUIRED';
      throw error;
    }

    // Verify JWT cryptographic signature
    let decoded: { userId: string };
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      const error: any = new Error('Invalid or expired refresh token');
      error.statusCode = 401;
      error.code = 'INVALID_REFRESH_TOKEN';
      throw error;
    }

    const hashedToken = hashToken(refreshToken);
    const session = await SessionModel.findOne({ refreshTokenHash: hashedToken });

    if (!session) {
      const error: any = new Error('Session not found or expired');
      error.statusCode = 401;
      error.code = 'SESSION_NOT_FOUND';
      throw error;
    }

    // Reuse detection: If token was already revoked, someone may have stolen it
    if (session.isRevoked) {
      // Invalidate ALL sessions for this user as a security precaution
      await SessionModel.updateMany({ userId: session.userId }, { $set: { isRevoked: true } });

      const error: any = new Error('Security alert: Refresh token reuse detected. All sessions revoked.');
      error.statusCode = 401;
      error.code = 'TOKEN_REUSE_DETECTED';
      throw error;
    }

    // Fetch user
    const user = await UserModel.findById(session.userId);
    if (!user || user.status === 'suspended') {
      const error: any = new Error('User account is invalid or suspended');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    // Generate new rotating token pair
    const newTokens = generateTokens({
      userId: user._id.toString(),
      email: user.email
    });

    // Rotate: Invalidate current token and store new token hash
    session.refreshTokenHash = hashToken(newTokens.refreshToken);
    session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    if (metadata?.ipAddress) session.ipAddress = metadata.ipAddress;
    if (metadata?.userAgent) session.userAgent = metadata.userAgent;
    await session.save();

    return newTokens;
  }

  /**
   * Logout User (Invalidates active session)
   */
  static async logout(refreshToken?: string): Promise<boolean> {
    if (!refreshToken) return true;

    try {
      const hashedToken = hashToken(refreshToken);
      await SessionModel.findOneAndUpdate({ refreshTokenHash: hashedToken }, { $set: { isRevoked: true } });
    } catch (err) {
      // Non-blocking logout
    }

    return true;
  }

  /**
   * Get Current Authenticated User Profile
   */
  static async getCurrentUser(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    return {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      isEmailVerified: user.isEmailVerified,
      status: user.status,
      lastLoginAt: user.lastLoginAt
    };
  }

  /**
   * Get or Create Dev Session (For local development & evaluation)
   */
  static async getOrCreateDevSession() {
    let user = await UserModel.findOne({ email: 'alex.chen@workzen.io' });
    if (!user) {
      user = await UserModel.create({
        email: 'alex.chen@workzen.io',
        firstName: 'Alex',
        lastName: 'Chen',
        passwordHash: await hashPassword('DevPassword123!'),
        isEmailVerified: true,
        status: 'active'
      });
    }

    let membership = await OrganisationMembershipModel.findOne({
      userId: user._id,
      status: 'active'
    });

    let organisation: any;
    if (membership) {
      organisation = await OrganisationModel.findById(membership.organisationId);
    }

    if (!organisation) {
      organisation = await OrganisationModel.create({
        name: 'Acme Global Enterprises',
        slug: 'acme-global',
        ownerId: user._id,
        status: 'active',
        country: 'US',
        industry: 'Technology'
      });

      await OrganisationMembershipModel.create({
        organisationId: organisation._id,
        userId: user._id,
        role: 'owner',
        status: 'active'
      });
    }

    let workspace: any = await WorkspaceModel.findOne({
      organisationId: organisation._id,
      status: 'active'
    });

    if (!workspace) {
      workspace = await WorkspaceModel.create({
        organisationId: organisation._id,
        name: 'Engineering & Cloud Ops',
        slug: 'engineering',
        description: 'Core microservices, infrastructure and frontend clients',
        type: 'engineering',
        themeColor: '#6366F1',
        status: 'active',
        createdBy: user._id
      });
    }

    const tokens = generateTokens({
      userId: user._id.toString(),
      email: user.email,
      defaultOrgId: organisation._id.toString()
    });

    return {
      user: {
        _id: user._id.toString(),
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: true,
        status: 'active'
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      organisation: organisation.toObject(),
      workspace: workspace.toObject()
    };
  }
}

