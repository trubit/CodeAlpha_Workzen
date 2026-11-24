import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ResponseEnvelope } from '../../shared/types/index.js';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response<ResponseEnvelope>,
  next: NextFunction
): void => {
  const errDesc = err?.stack || err?.message || String(err);
  console.error(`[WORKZEN Error] ${req.method} ${req.url} - ${errDesc}`);

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request payload',
        details: err.flatten().fieldErrors
      }
    });
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message
    }
  });
};

