import { Router } from 'express';
import { CourseController } from './course.controller.js';

const router = Router();

router.get('/', CourseController.getCourses);
router.get('/:id', CourseController.getCourseById);

export const CourseRoutes = router;
