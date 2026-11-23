import { PaymentMethod, EnrollmentStatus } from '@prisma/client';

export interface ICreateEnrollment {
  courseId: string;
  paymentMethod: PaymentMethod;
  senderNumber: string;
  transactionId: string;
}

export interface IEnrollmentResponse {
  id: string;
  courseId: string;
  courseTitle: string;
  courseLevel: string;
  amount: number;
  paymentMethod: PaymentMethod;
  senderNumber: string;
  transactionId: string;
  status: EnrollmentStatus;
  rejectionReason?: string | null;
  createdAt: Date;
  verifiedAt?: Date | null;
  privateGroupUrl?: string | null;
}
