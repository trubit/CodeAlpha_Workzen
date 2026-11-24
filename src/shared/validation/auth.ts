import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(1, 'First name is required').trim(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  organisationName: z.string().min(2, 'Organisation name must be at least 2 characters').trim()
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required')
});

export type LoginInput = z.infer<typeof loginSchema>;

export const verifyEmailSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  otp: z.string().length(6, 'OTP must be exactly 6 digits')
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters')
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

