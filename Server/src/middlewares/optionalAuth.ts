import { Request, Response, NextFunction } from 'express';
import { verifyToken, AUTH_COOKIE_NAME } from '../lib/auth.js';

/**
 * Attaches req.user if a valid JWT cookie or Bearer token is present,
 * without blocking anonymous requests.
 */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  let token = req.cookies?.[AUTH_COOKIE_NAME] || req.cookies?.token;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (token) {
    try {
      req.user = verifyToken(token);
    } catch {
      // Ignore expired/invalid tokens for optional public browsing
    }
  }

  next();
};

export default optionalAuth;
