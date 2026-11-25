import { Request, Response } from 'express';
import { catchAsync } from '../../lib/catchAsync.js';
import { sendResponse } from '../../lib/sendResponse.js';
import { ExamService } from './exam.service.js';

// ==========================================
// Admin Controllers
// ==========================================

const getAllAdminExams = catchAsync(async (_req: Request, res: Response) => {
  const exams = await ExamService.getAllAdminExams();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    data: { exams },
  });
});

const getAdminExamById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const exam = await ExamService.getAdminExamById(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    data: { exam },
  });
});

const createExam = catchAsync(async (req: Request, res: Response) => {
  const exam = await ExamService.createExam(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'পরীক্ষাটি সফলভাবে তৈরি করা হয়েছে।',
    data: { exam },
  });
});

const updateExam = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const exam = await ExamService.updateExam(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'পরীক্ষার তথ্য সফলভাবে আপডেট করা হয়েছে।',
    data: { exam },
  });
});

const deleteExam = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await ExamService.deleteExam(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: result,
  });
});

const addQuestion = catchAsync(async (req: Request, res: Response) => {
  const examId = req.params.id as string;
  const result = await ExamService.addQuestion(examId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'প্রশ্ন এবং উত্তরমালা সফলভাবে যুক্ত করা হয়েছে।',
    data: result,
  });
});

const bulkAddQuestions = catchAsync(async (req: Request, res: Response) => {
  const examId = req.params.id as string;
  const result = await ExamService.bulkAddQuestions(examId, req.body.questions);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: `${result.addedCount} টি প্রশ্ন সফলভাবে যুক্ত করা হয়েছে।`,
    data: result,
  });
});

const updateQuestion = catchAsync(async (req: Request, res: Response) => {
  const examId = req.params.id as string;
  const questionId = req.params.questionId as string;
  const result = await ExamService.updateQuestion(examId, questionId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'প্রশ্নটি সফলভাবে আপডেট করা হয়েছে।',
    data: result,
  });
});

const deleteQuestion = catchAsync(async (req: Request, res: Response) => {
  const examId = req.params.id as string;
  const questionId = req.params.questionId as string;
  const result = await ExamService.deleteQuestion(examId, questionId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'প্রশ্নটি মুছে ফেলা হয়েছে।',
    data: result,
  });
});

// ==========================================
// Student & Leaderboard Controllers
// ==========================================

const getStudentExams = catchAsync(async (req: Request, res: Response) => {
  const courseId = req.query.courseId as string | undefined;
  const exams = await ExamService.getStudentExams(req.user, courseId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    data: { exams },
  });
});

const startOrResumeExam = catchAsync(async (req: Request, res: Response) => {
  const examId = req.params.id as string;
  const data = await ExamService.startOrResumeExam(examId, req.user!);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    data,
  });
});

const syncExamDraft = catchAsync(async (req: Request, res: Response) => {
  const examId = req.params.id as string;
  const data = await ExamService.syncExamDraft(examId, req.user!.userId, req.body.answers);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    data,
  });
});

const submitExam = catchAsync(async (req: Request, res: Response) => {
  const examId = req.params.id as string;
  const data = await ExamService.submitExam(examId, req.user!.userId, req.body.answers);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'আপনার পরীক্ষাটি সফলভাবে সাবমিট ও মূল্যায়ন করা হয়েছে!',
    data,
  });
});

const getExamResult = catchAsync(async (req: Request, res: Response) => {
  const examId = req.params.id as string;
  const data = await ExamService.getExamResult(examId, req.user!.userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    data,
  });
});

const getExamLeaderboard = catchAsync(async (req: Request, res: Response) => {
  const examId = req.params.id as string;
  const data = await ExamService.getExamLeaderboard(examId, req.user!);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    data,
  });
});

export const ExamController = {
  getAllAdminExams,
  getAdminExamById,
  createExam,
  updateExam,
  deleteExam,
  addQuestion,
  bulkAddQuestions,
  updateQuestion,
  deleteQuestion,
  getStudentExams,
  startOrResumeExam,
  syncExamDraft,
  submitExam,
  getExamResult,
  getExamLeaderboard,
};
