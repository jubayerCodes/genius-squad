import { Router } from 'express';
import { ExamController } from './exam.controller.js';
import { authGuard } from '../../middlewares/authGuard.js';
import { optionalAuth } from '../../middlewares/optionalAuth.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import {
  submitExamValidationSchema,
  syncDraftValidationSchema,
} from './exam.validation.js';

const router = Router();

// Browse available active exams (attaches eligibility if authenticated)
router.get('/', optionalAuth, ExamController.getStudentExams);

// Start or resume timed MCQ session (Students only, strips answer sheet)
router.post('/:id/start', authGuard('STUDENT'), ExamController.startOrResumeExam);

// Sync draft answers periodically during active timer
router.patch(
  '/:id/sync',
  authGuard('STUDENT'),
  validateRequest(syncDraftValidationSchema),
  ExamController.syncExamDraft
);

// Submit exam for automated grading and instant result
router.post(
  '/:id/submit',
  authGuard('STUDENT'),
  validateRequest(submitExamValidationSchema),
  ExamController.submitExam
);

// View graded result & detailed answer sheet
router.get('/:id/result', authGuard('STUDENT'), ExamController.getExamResult);

// View live leaderboard (for students who submitted, or admins)
router.get(
  '/:id/leaderboard',
  authGuard('STUDENT', 'ADMIN'),
  ExamController.getExamLeaderboard
);

export const ExamRoutes = router;
