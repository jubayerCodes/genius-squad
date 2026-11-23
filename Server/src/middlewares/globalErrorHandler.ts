import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../lib/AppError.js';

export const globalErrorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('[API Error]:', err);

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    res.status(422).json({
      success: false,
      statusCode: 422,
      message: 'ইনপুট তথ্যে ত্রুটি রয়েছে (Validation Error)',
      errors: formattedErrors,
    });
    return;
  }

  // Handle Custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  // Handle Prisma P2002 Unique Constraint Violation
  if (err.code === 'P2002') {
    const target = (err.meta?.target as string[])?.join(', ') || 'field';
    res.status(409).json({
      success: false,
      statusCode: 409,
      message: `এই ${target} ইতিমধ্যে নিবন্ধিত রয়েছে। অনুগ্রহ করে ভিন্ন তথ্য দিন।`,
    });
    return;
  }

  // Handle Prisma DB Connection / General Failure
  if (err.code && typeof err.code === 'string' && err.code.startsWith('P')) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'ডাটাবেস সংযোগে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।',
    });
    return;
  }

  // Generic 500 Internal Server Error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    statusCode,
    message:
      process.env.NODE_ENV === 'production'
        ? 'সার্ভারে অভ্যন্তরীণ ত্রুটি দেখা দিয়েছে (Internal Server Error)'
        : err.message || 'সার্ভারে অভ্যন্তরীণ ত্রুটি দেখা দিয়েছে',
  });
};

export default globalErrorHandler;
