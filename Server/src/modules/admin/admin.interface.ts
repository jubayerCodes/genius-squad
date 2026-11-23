import { EnrollmentStatus } from '@prisma/client';

export interface IVerifyEnrollment {
  status: EnrollmentStatus;
  rejectionReason?: string;
}

export interface IAdminEnrollmentResponse {
  id: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  fatherName: string;
  district: string;
  institution: string;
  facebookUrl: string;
  courseTitle: string;
  courseLevel: string;
  amount: number;
  method: string;
  paymentMethod: string;
  senderNumber: string;
  transactionId: string;
  status: EnrollmentStatus;
  rejectionReason?: string | null;
  createdAt: Date;
  verifiedAt?: Date | null;
}
