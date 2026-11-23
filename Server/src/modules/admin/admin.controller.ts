import { Request, Response } from 'express';
import { catchAsync } from '../../lib/catchAsync.js';
import { sendResponse } from '../../lib/sendResponse.js';
import { AppError } from '../../lib/AppError.js';
import { AdminService } from './admin.service.js';

const getEnrollments = catchAsync(async (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const enrollments = await AdminService.getAdminEnrollments(status);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    data: {
      enrollments,
      total: enrollments.length,
    },
  });
});

const verifyEnrollment = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const updated = await AdminService.verifyEnrollment(req.user!, id, req.body);
  const actionText = req.body.status === 'APPROVED' ? 'অনুমোদন (Approved)' : 'বাতিল (Rejected)';

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `পেমেন্ট রিকোয়েস্ট সফলভাবে ${actionText} করা হয়েছে।`,
    data: { enrollment: updated },
  });
});

const uploadCourseImage = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError(400, 'অনুগ্রহ করে একটি ছবি ফাইল সিলেক্ট করুন।');
  }

  const fileUrl = `/uploads/courses/${req.file.filename}`;

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'ছবি সফলভাবে আপলোড করা হয়েছে।',
    data: {
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
  });
});

// User Management Controllers
const getUsers = catchAsync(async (req: Request, res: Response) => {
  const { role, isSuspended, search } = req.query;
  const users = await AdminService.getAllUsers({
    role: role as string | undefined,
    isSuspended: isSuspended as string | undefined,
    search: search as string | undefined,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    data: {
      users,
      total: users.length,
    },
  });
});

const updateUserRole = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { role } = req.body;
  const updated = await AdminService.updateUserRole(req.user!, id, role);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message:
      role === 'ADMIN'
        ? `ব্যবহারকারীকে সফলভাবে অ্যাডমিন হিসেবে পদোন্নতি দেওয়া হয়েছে।`
        : `ব্যবহারকারীকে সফলভাবে সাধারণ শিক্ষার্থী হিসেবে ডাউনগ্রেড করা হয়েছে।`,
    data: { user: updated },
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { isSuspended } = req.body;
  const updated = await AdminService.updateUserStatus(req.user!, id, isSuspended);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: isSuspended
      ? 'ব্যবহারকারীর অ্যাকাউন্ট সফলভাবে স্থগিত (Suspended) করা হয়েছে।'
      : 'ব্যবহারকারীর অ্যাকাউন্ট পুনরায় সক্রিয় করা হয়েছে।',
    data: { user: updated },
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await AdminService.deleteUser(req.user!, id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: result,
  });
});

export const AdminController = {
  getEnrollments,
  verifyEnrollment,
  uploadCourseImage,
  getUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
};
