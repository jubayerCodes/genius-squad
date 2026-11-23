import { Router } from 'express';
import { AdminController } from './admin.controller.js';
import { CourseController } from '../course/course.controller.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { authGuard } from '../../middlewares/authGuard.js';
import { courseImageUpload } from '../../middlewares/upload.js';
import {
  verifyEnrollmentValidationSchema,
  updateUserRoleValidationSchema,
  updateUserStatusValidationSchema,
} from './admin.validation.js';
import {
  createCourseValidationSchema,
  updateCourseValidationSchema,
  toggleCourseStatusValidationSchema,
  bulkDeleteCoursesValidationSchema,
} from '../course/course.validation.js';

const router = Router();

// ========================
// Enrollment Management
// ========================
router.get('/enrollments', authGuard('ADMIN'), AdminController.getEnrollments);
router.patch(
  '/enrollments/:id/verify',
  authGuard('ADMIN'),
  validateRequest(verifyEnrollmentValidationSchema),
  AdminController.verifyEnrollment
);

// ========================
// Media / Image Upload
// ========================
router.post(
  '/upload',
  authGuard('ADMIN'),
  courseImageUpload.single('image'),
  AdminController.uploadCourseImage
);

// ========================
// Course Management (CRUD)
// ========================
router.get('/courses', authGuard('ADMIN'), CourseController.getAllAdminCourses);

router.post(
  '/courses',
  authGuard('ADMIN'),
  validateRequest(createCourseValidationSchema),
  CourseController.createCourse
);

router.patch(
  '/courses/:id',
  authGuard('ADMIN'),
  validateRequest(updateCourseValidationSchema),
  CourseController.updateCourse
);

router.patch(
  '/courses/:id/status',
  authGuard('ADMIN'),
  validateRequest(toggleCourseStatusValidationSchema),
  CourseController.toggleCourseStatus
);

router.delete('/courses/:id', authGuard('ADMIN'), CourseController.deleteCourse);

router.post(
  '/courses/bulk-delete',
  authGuard('ADMIN'),
  validateRequest(bulkDeleteCoursesValidationSchema),
  CourseController.bulkDeleteCourses
);

// ========================
// User Management
// ========================
router.get('/users', authGuard('ADMIN'), AdminController.getUsers);

router.patch(
  '/users/:id/role',
  authGuard('ADMIN'),
  validateRequest(updateUserRoleValidationSchema),
  AdminController.updateUserRole
);

router.patch(
  '/users/:id/status',
  authGuard('ADMIN'),
  validateRequest(updateUserStatusValidationSchema),
  AdminController.updateUserStatus
);

router.delete('/users/:id', authGuard('ADMIN'), AdminController.deleteUser);

export const AdminRoutes = router;
