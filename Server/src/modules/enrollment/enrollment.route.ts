import { Router } from 'express';
import { EnrollmentController } from './enrollment.controller.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { authGuard } from '../../middlewares/authGuard.js';
import { createEnrollmentValidationSchema } from './enrollment.validation.js';

const router = Router();

router.post(
  '/',
  authGuard('STUDENT', 'ADMIN'),
  validateRequest(createEnrollmentValidationSchema),
  EnrollmentController.createEnrollment
);

router.get(
  '/my-courses',
  authGuard('STUDENT', 'ADMIN'),
  EnrollmentController.getMyCourses
);

export const EnrollmentRoutes = router;
