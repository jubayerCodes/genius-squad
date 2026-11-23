import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { authGuard } from '../../middlewares/authGuard.js';
import { registerValidationSchema, loginValidationSchema } from './auth.validation.js';

const router = Router();

router.post(
  '/register',
  validateRequest(registerValidationSchema),
  AuthController.register
);

router.post(
  '/login',
  validateRequest(loginValidationSchema),
  AuthController.login
);

router.post('/logout', AuthController.logout);

router.get('/me', authGuard(), AuthController.getMe);

export const AuthRoutes = router;
