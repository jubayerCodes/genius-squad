import { prisma } from '../../lib/prisma.js';
import { memoryStore, isDbConfigured } from '../../lib/dbStore.js';
import { AppError } from '../../lib/AppError.js';
import { TokenPayload } from '../../lib/auth.js';
import { INITIAL_COURSES } from '../../lib/courseCatalog.js';
import { IVerifyEnrollment, IAdminEnrollmentResponse } from './admin.interface.js';

const getAdminEnrollments = async (statusFilter?: string): Promise<IAdminEnrollmentResponse[]> => {
  let enrollments: any[] = [];

  if (isDbConfigured) {
    const where: any = {};
    if (statusFilter && ['PENDING', 'APPROVED', 'REJECTED'].includes(statusFilter)) {
      where.status = statusFilter;
    }

    enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            fatherName: true,
            district: true,
            upazila: true,
            institution: true,
            email: true,
            phone: true,
            facebookUrl: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            level: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  } else {
    let list = Array.from(memoryStore.enrollments.values());
    if (statusFilter && ['PENDING', 'APPROVED', 'REJECTED'].includes(statusFilter)) {
      list = list.filter((e) => e.status === statusFilter);
    }

    enrollments = list.map((enr) => {
      const user = memoryStore.users.get(enr.userId);
      const course = INITIAL_COURSES.find((c) => c.id === enr.courseId);
      return {
        ...enr,
        user,
        course,
      };
    });
  }

  return enrollments.map((enr) => ({
    id: enr.id,
    studentName: enr.user?.name || 'শিক্ষার্থী',
    studentEmail: enr.user?.email || '',
    studentPhone: enr.user?.phone || enr.senderNumber,
    fatherName: enr.user?.fatherName || '',
    district: enr.user?.district || '',
    institution: enr.user?.institution || '',
    facebookUrl: enr.user?.facebookUrl || '',
    courseTitle: enr.course?.title || '',
    courseLevel: enr.course?.level || '',
    amount: enr.amount,
    method: enr.paymentMethod,
    paymentMethod: enr.paymentMethod,
    senderNumber: enr.senderNumber,
    transactionId: enr.transactionId,
    status: enr.status,
    rejectionReason: enr.rejectionReason,
    createdAt: enr.createdAt,
    verifiedAt: enr.verifiedAt,
  }));
};

const verifyEnrollment = async (
  adminPayload: TokenPayload,
  id: string,
  payload: IVerifyEnrollment
) => {
  let updated: any = null;

  if (isDbConfigured) {
    updated = await prisma.enrollment.update({
      where: { id },
      data: {
        status: payload.status,
        rejectionReason:
          payload.status === 'REJECTED' ? payload.rejectionReason || 'তথ্য অমিল থাকায় বাতিল' : null,
        verifiedBy: adminPayload.name || adminPayload.email,
        verifiedAt: new Date(),
      },
    });
  } else {
    const existing = memoryStore.enrollments.get(id);
    if (!existing) {
      throw new AppError(404, 'এনরোলমেন্ট রিকোয়েস্ট পাওয়া যায়নি।');
    }

    updated = {
      ...existing,
      status: payload.status,
      rejectionReason:
        payload.status === 'REJECTED' ? payload.rejectionReason || 'তথ্য অমিল থাকায় বাতিল' : null,
      verifiedBy: adminPayload.name || adminPayload.email,
      verifiedAt: new Date(),
      updatedAt: new Date(),
    };

    memoryStore.enrollments.set(id, updated);
  }

  if (!updated) {
    throw new AppError(404, 'এনরোলমেন্ট রিকোয়েস্ট পাওয়া যায়নি।');
  }

  return updated;
};

// ==========================================
// User Management Service
// ==========================================
const getAllUsers = async (filters: { role?: string; isSuspended?: string; search?: string }) => {
  if (!isDbConfigured) {
    return [];
  }

  const where: any = {};
  if (filters.role && ['STUDENT', 'ADMIN', 'SUPER_ADMIN'].includes(filters.role)) {
    where.role = filters.role;
  }
  if (filters.isSuspended !== undefined && filters.isSuspended !== 'ALL') {
    where.isSuspended = filters.isSuspended === 'true';
  }
  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim();
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q, mode: 'insensitive' } },
      { district: { contains: q, mode: 'insensitive' } },
      { institution: { contains: q, mode: 'insensitive' } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      fatherName: true,
      district: true,
      upazila: true,
      institution: true,
      email: true,
      phone: true,
      facebookUrl: true,
      role: true,
      isSuspended: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { enrollments: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return users;
};

const updateUserRole = async (
  requester: TokenPayload,
  targetUserId: string,
  newRole: 'STUDENT' | 'ADMIN'
) => {
  if (!isDbConfigured) {
    throw new AppError(500, 'ডাটাবেজ কনফিগার করা নেই।');
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!targetUser) {
    throw new AppError(404, 'ব্যবহারকারী খুঁজে পাওয়া যায়নি।');
  }

  if (targetUser.role === 'SUPER_ADMIN') {
    throw new AppError(403, 'সুপার অ্যাডমিনের রোল পরিবর্তন করা সম্ভব নয়।');
  }

  // Rule: "The admins can take the user and make them an admin."
  // "After making them an admin only a super admin can downgrade an admin or delete."
  if (targetUser.role === 'ADMIN' && newRole === 'STUDENT') {
    if (requester.role !== 'SUPER_ADMIN') {
      throw new AppError(
        403,
        'অ্যাডমিনকে ডাউনগ্রেড করার অনুমতি শুধুমাত্র সুপার অ্যাডমিনের রয়েছে।'
      );
    }
  }

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: { role: newRole },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isSuspended: true,
      updatedAt: true,
    },
  });

  return updated;
};

const updateUserStatus = async (
  requester: TokenPayload,
  targetUserId: string,
  isSuspended: boolean
) => {
  if (!isDbConfigured) {
    throw new AppError(500, 'ডাটাবেজ কনফিগার করা নেই।');
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!targetUser) {
    throw new AppError(404, 'ব্যবহারকারী খুঁজে পাওয়া যায়নি।');
  }

  if (targetUser.role === 'SUPER_ADMIN') {
    throw new AppError(403, 'সুপার অ্যাডমিন অ্যাকাউন্ট স্থগিত করা সম্ভব নয়।');
  }

  // If target is ADMIN, only SUPER_ADMIN can suspend them
  if (targetUser.role === 'ADMIN' && requester.role !== 'SUPER_ADMIN') {
    throw new AppError(
      403,
      'অন্য কোনো অ্যাডমিনের অ্যাকাউন্ট স্থগিত করার অনুমতি শুধুমাত্র সুপার অ্যাডমিনের রয়েছে।'
    );
  }

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: { isSuspended },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isSuspended: true,
      updatedAt: true,
    },
  });

  return updated;
};

const deleteUser = async (requester: TokenPayload, targetUserId: string) => {
  if (!isDbConfigured) {
    throw new AppError(500, 'ডাটাবেজ কনফিগার করা নেই।');
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: {
      _count: {
        select: { enrollments: true },
      },
    },
  });

  if (!targetUser) {
    throw new AppError(404, 'ব্যবহারকারী খুঁজে পাওয়া যায়নি।');
  }

  if (targetUser.role === 'SUPER_ADMIN') {
    throw new AppError(403, 'সুপার অ্যাডমিন অ্যাকাউন্ট মুছে ফেলা সম্ভব নয়।');
  }

  // Rule: "After making them an admin only a super admin can downgrade an admin or delete."
  if (targetUser.role === 'ADMIN' && requester.role !== 'SUPER_ADMIN') {
    throw new AppError(
      403,
      'অ্যাডমিন অ্যাকাউন্ট মুছে ফেলার অনুমতি শুধুমাত্র সুপার অ্যাডমিনের রয়েছে।'
    );
  }

  if (targetUser._count.enrollments > 0) {
    await prisma.user.update({
      where: { id: targetUserId },
      data: { isSuspended: true },
    });
    return {
      deleted: false,
      suspended: true,
      message: `ব্যবহারকারীর ${targetUser._count.enrollments} টি এনরোলমেন্ট ও পেমেন্ট রেকর্ড থাকায় স্থায়ীভাবে মুছে ফেলার পরিবর্তে অ্যাকাউন্টটি স্থগিত (Suspended) করা হয়েছে।`,
    };
  }

  await prisma.user.delete({
    where: { id: targetUserId },
  });

  return {
    deleted: true,
    suspended: false,
    message: 'ব্যবহারকারী অ্যাকাউন্ট সফলভাবে মুছে ফেলা হয়েছে।',
  };
};

export const AdminService = {
  getAdminEnrollments,
  verifyEnrollment,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
};
