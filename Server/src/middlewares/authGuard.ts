import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AppError } from '../lib/AppError.js';
import { verifyToken, TokenPayload, AUTH_COOKIE_NAME } from '../lib/auth.js';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authGuard = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // 1. Extract token from cookie (primary)
    let token = req.cookies?.[AUTH_COOKIE_NAME] || req.cookies?.token;

    // 2. Fallback to Authorization header if cookie is absent
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return next(new AppError(401, 'অনুমতি নেই। অনুগ্রহ করে প্রথমে লগইন করুন।'));
    }

    try {
      const payload = verifyToken(token);

      // Super Admin inherits all Admin rights
      const hasPermission =
        allowedRoles.length === 0 ||
        allowedRoles.includes(payload.role) ||
        (payload.role === 'SUPER_ADMIN' && allowedRoles.includes('ADMIN'));

      if (!hasPermission) {
        return next(new AppError(403, 'আপনার এই পেইজ বা ডেটা দেখার অনুমতি নেই (Forbidden)।'));
      }

      req.user = payload;
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default authGuard;
