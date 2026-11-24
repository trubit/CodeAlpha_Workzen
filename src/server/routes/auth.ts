// src/server/routes/auth.ts
// WORKZEN Enterprise Authentication Routes

import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

export const authRouter = Router();

// Apply auth rate limiter to public authentication endpoints
authRouter.post('/register', authRateLimiter, AuthController.register);
authRouter.post('/login', authRateLimiter, AuthController.login);
authRouter.post('/verify-email', authRateLimiter, AuthController.verifyEmail);
authRouter.get('/verify-email', AuthController.verifyEmail);
authRouter.post('/resend-verification', authRateLimiter, AuthController.resendVerification);
authRouter.post('/forgot-password', authRateLimiter, AuthController.forgotPassword);
authRouter.post('/reset-password', authRateLimiter, AuthController.resetPassword);

// Session endpoints
authRouter.post('/refresh-token', AuthController.refreshToken);
authRouter.post('/logout', AuthController.logout);
authRouter.post('/dev-session', AuthController.devSession);

// Protected user profile
authRouter.get('/me', authenticate, AuthController.me);

