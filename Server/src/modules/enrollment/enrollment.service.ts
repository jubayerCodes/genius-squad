import { prisma } from '../../lib/prisma.js';
import { memoryStore, isDbConfigured } from '../../lib/dbStore.js';
import { AppError } from '../../lib/AppError.js';
import { TokenPayload } from '../../lib/auth.js';
import { INITIAL_COURSES } from '../../lib/courseCatalog.js';
import { ICreateEnrollment, IEnrollmentResponse } from './enrollment.interface.js';

const createEnrollment = async (userPayload: TokenPayload, payload: ICreateEnrollment) => {
  let course: any = null;
  if (isDbConfigured) {
    course = await prisma.course.findUnique({
      where: { id: payload.courseId },
    });
  }
  if (!course) {
    course = INITIAL_COURSES.find((c) => c.id === payload.courseId);
  }

  if (!course) {
    throw new AppError(404, 'নির্বাচিত কোর্সটি পাওয়া যায়নি।');
  }

  // Deduplication check for TrxID
  if (isDbConfigured) {
    const existingTrx = await prisma.enrollment.findUnique({
      where: { transactionId: payload.transactionId },
    });
    if (existingTrx) {
      throw new AppError(
        409,
        'এই ট্রানজেকশন আইডি (TrxID) দিয়ে ইতিমধ্যে একটি পেমেন্ট রিকোয়েস্ট জমা দেওয়া হয়েছে।'
      );
    }
  } else {
    const existingTrx = Array.from(memoryStore.enrollments.values()).find(
      (e) => e.transactionId.toUpperCase() === payload.transactionId.toUpperCase()
    );
    if (existingTrx) {
      throw new AppError(
        409,
        'এই ট্রানজেকশন আইডি (TrxID) দিয়ে ইতিমধ্যে একটি পেমেন্ট রিকোয়েস্ট জমা দেওয়া হয়েছে।'
      );
    }
  }

  let enrollment: any = null;

  if (isDbConfigured) {
    enrollment = await prisma.enrollment.create({
      data: {
        userId: userPayload.userId,
        courseId: payload.courseId,
        paymentMethod: payload.paymentMethod,
        senderNumber: payload.senderNumber,
        transactionId: payload.transactionId,
        amount: course.price,
        status: 'PENDING',
      },
      include: {
        course: {
          select: {
            title: true,
            level: true,
            price: true,
          },
        },
      },
    });
  } else {
    enrollment = {
      id: 'enr_' + Date.now(),
      userId: userPayload.userId,
      courseId: payload.courseId,
      paymentMethod: payload.paymentMethod,
      senderNumber: payload.senderNumber,
      transactionId: payload.transactionId,
      amount: course.price,
      status: 'PENDING' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      course: {
        title: course.title,
        level: course.level,
        price: course.price,
      },
    };
    memoryStore.enrollments.set(enrollment.id, enrollment);
  }

  return enrollment;
};

const getMyCourses = async (userId: string): Promise<IEnrollmentResponse[]> => {
  let enrollments: any[] = [];

  if (isDbConfigured) {
    enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            level: true,
            subtitle: true,
            price: true,
            privateGroupUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  } else {
    const userEnrs = Array.from(memoryStore.enrollments.values()).filter(
      (e) => e.userId === userId
    );
    enrollments = userEnrs.map((enr) => {
      const course = INITIAL_COURSES.find((c) => c.id === enr.courseId);
      return {
        ...enr,
        course,
      };
    });
  }

  // Security check: Reveal privateGroupUrl ONLY if status is APPROVED
  return enrollments.map((enr) => {
    const isApproved = enr.status === 'APPROVED';
    const course = enr.course;

    return {
      id: enr.id,
      courseId: enr.courseId,
      courseTitle: course?.title || 'কোর্স',
      courseLevel: course?.level || 'SSC',
      amount: enr.amount,
      paymentMethod: enr.paymentMethod,
      senderNumber: enr.senderNumber,
      transactionId: enr.transactionId,
      status: enr.status,
      rejectionReason: enr.rejectionReason,
      createdAt: enr.createdAt,
      verifiedAt: enr.verifiedAt,
      privateGroupUrl: isApproved ? course?.privateGroupUrl : null,
    };
  });
};

export const EnrollmentService = {
  createEnrollment,
  getMyCourses,
};
