import { Request, Response } from 'express';
import { catchAsync } from '../../lib/catchAsync.js';
import { sendResponse } from '../../lib/sendResponse.js';
import { AuthService } from './auth.service.js';
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from '../../lib/auth.js';

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.registerUser(req.body);

  // Set auth token in secure HTTP-only cookie
  res.cookie(AUTH_COOKIE_NAME, result.token, getAuthCookieOptions());

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'নিবন্ধন সফল হয়েছে! জিনিয়াস স্কোয়াডে স্বাগতম।',
    data: result,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);

  // Set auth token in secure HTTP-only cookie
  res.cookie(AUTH_COOKIE_NAME, result.token, getAuthCookieOptions());

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'লগইন সফল হয়েছে!',
    data: result,
  });
});

const logout = catchAsync(async (_req: Request, res: Response) => {
  const cookieOptions = getAuthCookieOptions();
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: cookieOptions.path,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'লগআউট সফল হয়েছে।',
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const payload = req.user!;
  const user = await AuthService.getMe(
    payload.userId,
    payload.email,
    payload.role,
    payload.name
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    data: { user },
  });
});

export const AuthController = {
  register,
  login,
  logout,
  getMe,
};
