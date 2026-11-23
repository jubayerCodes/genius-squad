import { Request, Response } from 'express';
import { catchAsync } from '../../lib/catchAsync.js';
import { sendResponse } from '../../lib/sendResponse.js';
import { EnrollmentService } from './enrollment.service.js';

const createEnrollment = catchAsync(async (req: Request, res: Response) => {
  const enrollment = await EnrollmentService.createEnrollment(req.user!, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message:
      'পেমেন্ট তথ্য সফলভাবে জমা হয়েছে! অ্যাডমিন অনুমোদনের পর ড্যাশবোর্ডে প্রাইভেট গ্রুপের লিংক দেখতে পাবেন।',
    data: { enrollment },
  });
});

const getMyCourses = catchAsync(async (req: Request, res: Response) => {
  const enrollments = await EnrollmentService.getMyCourses(req.user!.userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    data: { enrollments },
  });
});

export const EnrollmentController = {
  createEnrollment,
  getMyCourses,
};
