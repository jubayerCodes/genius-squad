import { Request, Response } from 'express';
import { catchAsync } from '../../lib/catchAsync.js';
import { sendResponse } from '../../lib/sendResponse.js';
import { UserService } from './user.service.js';

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const updatedUser = await UserService.updateUserProfile(req.user!, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে।',
    data: { user: updatedUser },
  });
});

export const UserController = {
  updateProfile,
};
