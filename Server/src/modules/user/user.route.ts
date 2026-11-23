import { Router } from 'express';
import { UserController } from './user.controller.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { authGuard } from '../../middlewares/authGuard.js';
import { updateProfileValidationSchema } from './user.validation.js';

const router = Router();

router.put(
  '/profile',
  authGuard(),
  validateRequest(updateProfileValidationSchema),
  UserController.updateProfile
);

export const UserRoutes = router;
