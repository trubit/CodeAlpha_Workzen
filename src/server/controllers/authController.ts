// src/server/controllers/authController.ts
// WORKZEN Enterprise Authentication Controller
// Orchestrates request validation, response envelopes & secure HTTP-only cookies

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService.js';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resetPasswordSchema
} from '../../shared/validation/auth.js';
import { ResponseEnvelope } from '../../shared/types/index.js';
import { ENV } from '../config/env.js';

const COOKIE_NAME = 'workzen_refresh_token';

const getCookieOptions = () => ({
  httpOnly: true,
  secure: ENV.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/'
});

export class AuthController {
  /**
   * POST /api/v1/auth/register
   */
  static async register(req: Request, res: Response<ResponseEnvelope>, next: NextFunction): Promise<void> {
    try {
      const validatedInput = registerSchema.parse(req.body);
      const result = await AuthService.register(validatedInput);

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/login
   */
  static async login(req: Request, res: Response<ResponseEnvelope>, next: NextFunction): Promise<void> {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const metadata = {
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      };

      const result = await AuthService.login(email, password, metadata);

      // Set rotating refresh token in secure HTTP-Only cookie
      res.cookie(COOKIE_NAME, result.refreshToken, getCookieOptions());

      res.status(200).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/verify-email
   */
  static async verifyEmail(req: Request, res: Response<ResponseEnvelope>, next: NextFunction): Promise<void> {
    try {
      const email = req.body.email || req.query.email;
      const token = req.body.token || req.body.otp || req.query.token;

      if (!email || !token) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email address and verification code or token are required.'
          }
        });
        return;
      }

      const result = await AuthService.verifyEmail(String(email), String(token));

      // Set session cookie
      res.cookie(COOKIE_NAME, result.refreshToken, getCookieOptions());

      res.status(200).json({
        success: true,
        data: {
          message: 'Email verified successfully. Welcome to WORKZEN!',
          user: result.user,
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/resend-verification
   */
  static async resendVerification(req: Request, res: Response<ResponseEnvelope>, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email address is required'
          }
        });
        return;
      }

      const result = await AuthService.resendVerification(email);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/forgot-password
   */
  static async forgotPassword(req: Request, res: Response<ResponseEnvelope>, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email address is required'
          }
        });
        return;
      }

      const result = await AuthService.forgotPassword(email);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/reset-password
   */
  static async resetPassword(req: Request, res: Response<ResponseEnvelope>, next: NextFunction): Promise<void> {
    try {
      const { email, otp, token, newPassword } = req.body;
      const code = token || otp;

      if (!email || !code || !newPassword) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email, reset token/code, and new password are required'
          }
        });
        return;
      }

      if (newPassword.length < 8) {
        res.status(400).json({
          success: false,
          error: {
            code: 'WEAK_PASSWORD',
            message: 'New password must be at least 8 characters long'
          }
        });
        return;
      }

      const result = await AuthService.resetPassword(email, code, newPassword);

      // Clear any remaining session cookie
      res.clearCookie(COOKIE_NAME, { path: '/' });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/refresh-token
   */
  static async refreshToken(req: Request, res: Response<ResponseEnvelope>, next: NextFunction): Promise<void> {
    try {
      // Extract from cookie or body header
      const rawCookie = req.headers.cookie;
      let tokenFromCookie: string | undefined;

      if (rawCookie) {
        const match = rawCookie
          .split(';')
          .find((c) => c.trim().startsWith(`${COOKIE_NAME}=`));
        if (match) {
          tokenFromCookie = match.split('=')[1].trim();
        }
      }

      const token = tokenFromCookie || req.body.refreshToken;
      if (!token) {
        res.status(401).json({
          success: false,
          error: {
            code: 'REFRESH_TOKEN_MISSING',
            message: 'Session has expired. Please sign in again.'
          }
        });
        return;
      }

      const metadata = {
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      };

      const newTokens = await AuthService.refreshSession(token, metadata);

      // Rotate cookie
      res.cookie(COOKIE_NAME, newTokens.refreshToken, getCookieOptions());

      res.status(200).json({
        success: true,
        data: {
          accessToken: newTokens.accessToken
        }
      });
    } catch (error) {
      res.clearCookie(COOKIE_NAME, { path: '/' });
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   */
  static async logout(req: Request, res: Response<ResponseEnvelope>, next: NextFunction): Promise<void> {
    try {
      const rawCookie = req.headers.cookie;
      let token: string | undefined;

      if (rawCookie) {
        const match = rawCookie
          .split(';')
          .find((c) => c.trim().startsWith(`${COOKIE_NAME}=`));
        if (match) {
          token = match.split('=')[1].trim();
        }
      }

      if (!token && req.body) {
        token = req.body.refreshToken;
      }

      await AuthService.logout(token);

      // Invalidate cookie
      res.clearCookie(COOKIE_NAME, { path: '/' });

      res.status(200).json({
        success: true,
        data: {
          message: 'Signed out successfully. Session invalidated.'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/me
   */
  static async me(req: Request, res: Response<ResponseEnvelope>, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      const user = await AuthService.getCurrentUser(req.user.userId);
      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/dev-session
   * Provides instant dev token and seeds local MongoDB environment
   */
  static async devSession(req: Request, res: Response<ResponseEnvelope>, next: NextFunction): Promise<void> {
    try {
      if (ENV.NODE_ENV === 'production') {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Dev session endpoint is disabled in production'
          }
        });
        return;
      }

      const result = await AuthService.getOrCreateDevSession();

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

