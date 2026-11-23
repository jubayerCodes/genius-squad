import { Request, Response } from 'express';
import { catchAsync } from '../../lib/catchAsync.js';
import { sendResponse } from '../../lib/sendResponse.js';
import { CourseService } from './course.service.js';

const getCourses = catchAsync(async (req: Request, res: Response) => {
  const level = (req.query.level as string)?.toUpperCase() as 'SSC' | 'HSC' | undefined;
  const courses = await CourseService.getAllCourses({ level });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    data: { courses },
  });
});

const getCourseById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const course = await CourseService.getCourseById(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    data: { course },
  });
});

// Admin Controllers
const getAllAdminCourses = catchAsync(async (_req: Request, res: Response) => {
  const courses = await CourseService.getAllAdminCourses();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    data: { courses },
  });
});

const createCourse = catchAsync(async (req: Request, res: Response) => {
  const course = await CourseService.createCourse(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'কোর্স সফলভাবে তৈরি করা হয়েছে।',
    data: { course },
  });
});

const updateCourse = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const course = await CourseService.updateCourse(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'কোর্স সফলভাবে আপডেট করা হয়েছে।',
    data: { course },
  });
});

const toggleCourseStatus = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { isActive } = req.body;
  const course = await CourseService.toggleCourseStatus(id, isActive);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: course.isActive ? 'কোর্সটি সক্রিয় করা হয়েছে।' : 'কোর্সটি সাময়িকভাবে পজ (নিষ্ক্রিয়) করা হয়েছে।',
    data: { course },
  });
});

const deleteCourse = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await CourseService.deleteCourse(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: result,
  });
});

const bulkDeleteCourses = catchAsync(async (req: Request, res: Response) => {
  const { courseIds } = req.body;
  const result = await CourseService.bulkDeleteCourses(courseIds);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `${result.deletedCount} টি কোর্স মুছে ফেলা হয়েছে এবং ${result.pausedCount} টি কোর্স পজ করা হয়েছে।`,
    data: result,
  });
});

export const CourseController = {
  getCourses,
  getCourseById,
  getAllAdminCourses,
  createCourse,
  updateCourse,
  toggleCourseStatus,
  deleteCourse,
  bulkDeleteCourses,
};
