import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/auth.route.js';
import { UserRoutes } from '../modules/user/user.route.js';
import { CourseRoutes } from '../modules/course/course.route.js';
import { EnrollmentRoutes } from '../modules/enrollment/enrollment.route.js';
import { AdminRoutes } from '../modules/admin/admin.route.js';

const router = Router();

interface ModuleRoute {
  path: string;
  route: Router;
}

const moduleRoutes: ModuleRoute[] = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/courses',
    route: CourseRoutes,
  },
  {
    path: '/enrollments',
    route: EnrollmentRoutes,
  },
  {
    path: '/admin',
    route: AdminRoutes,
  },
];

moduleRoutes.forEach((item) => {
  router.use(item.path, item.route);
});

export default router;
