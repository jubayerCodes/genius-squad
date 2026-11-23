import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import type { CookieOptions } from 'express';
import { AppError } from './AppError.js';

const JWT_SECRET = process.env.JWT_SECRET || 'genius_squad_jwt_super_secret_dev_key_2026_xyz';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const AUTH_COOKIE_NAME = 'genius_token';

export function getAuthCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/',
  };
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
  name: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as any,
  });
}

export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError(401, 'আপনার সেশনের মেয়াদ শেষ হয়েছে। অনুগ্রহ করে আবার লগইন করুন।');
    }
    throw new AppError(401, 'অবৈধ অথেনটিকেশন টোকেন। আবার লগইন করুন।');
  }
}
