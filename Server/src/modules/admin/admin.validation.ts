import { z } from 'zod';

export const verifyEnrollmentValidationSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED'] as const, {
    required_error: 'স্ট্যাটাস (APPROVED অথবা REJECTED) আবশ্যক',
  }),
  rejectionReason: z.string().optional(),
});

export const updateUserRoleValidationSchema = z.object({
  role: z.enum(['STUDENT', 'ADMIN'] as const, {
    required_error: 'রোল (STUDENT অথবা ADMIN) প্রদান করা আবশ্যক।',
  }),
});

export const updateUserStatusValidationSchema = z.object({
  isSuspended: z.boolean({
    required_error: 'স্থগিতকরণ স্ট্যাটাস (true অথবা false) প্রদান করা আবশ্যক।',
  }),
});
