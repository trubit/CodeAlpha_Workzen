import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { ENV } from '../config/env.js';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, ENV.BCRYPT_SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateOTP = (length: number = 6): string => {
  const digits = '0123456789';
  let otp = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    otp += digits[bytes[i] % 10];
  }
  return otp;
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

