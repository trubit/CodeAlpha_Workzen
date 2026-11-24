import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { ResponseEnvelope } from '../../shared/types/index.js';

export interface AuthenticatedUserPayload {
  userId: string;
  email: string;
  defaultOrgId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUserPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response<ResponseEnvelope>,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token missing or invalid'
      }
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, ENV.JWT_ACCESS_SECRET) as AuthenticatedUserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED_OR_INVALID',
        message: 'Session has expired or token is invalid. Please log in again.'
      }
    });
  }
};

