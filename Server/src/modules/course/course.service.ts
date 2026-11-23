import { prisma } from '../../lib/prisma.js';
import { isDbConfigured } from '../../lib/dbStore.js';
import { AppError } from '../../lib/AppError.js';
import { INITIAL_COURSES } from '../../lib/courseCatalog.js';
import {
  ICourseFilter,
  ICourseResponse,
  IAdminCourseResponse,
  ICreateCoursePayload,
  IUpdateCoursePayload,
} from './course.interface.js';

const generateSlug = (text: string): string => {
  const ascii = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return ascii ? `${ascii}-${Date.now().toString(36).slice(-4)}` : `course-${Date.now().toString(36)}`;
};

const getAllCourses = async (filters: ICourseFilter): Promise<ICourseResponse[]> => {
  const level = filters.level;
  let courses: any[] = [];

  if (isDbConfigured) {
    const where: any = { isActive: true };
    if (level === 'SSC' || level === 'HSC') {
      where.level = level;
    }

    courses = await prisma.course.findMany({
      where,
      select: {
        id: true,
        level: true,
        title: true,
        subtitle: true,
        subjects: true,
        services: true,
        price: true,
        oldPrice: true,
        thumbnailUrl: true,
        isActive: true,
        createdAt: true,
        // Omit privateGroupUrl for public catalog security
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  if (!courses || courses.length === 0) {
    let filtered = INITIAL_COURSES;
    if (level === 'SSC' || level === 'HSC') {
      filtered = filtered.filter((c) => c.level === level);
    }
    courses = filtered.map(({ privateGroupUrl, ...safeCourse }) => safeCourse);
  }

  return courses;
};

const getCourseById = async (id: string): Promise<ICourseResponse> => {
  let course: any = null;

  if (isDbConfigured) {
    course = await prisma.course.findUnique({
      where: { id },
      select: {
        id: true,
        level: true,
        title: true,
        subtitle: true,
        subjects: true,
        services: true,
        price: true,
        oldPrice: true,
        thumbnailUrl: true,
        isActive: true,
        createdAt: true,
        // Omit privateGroupUrl for public view
      },
    });
  }

  if (!course) {
    const found = INITIAL_COURSES.find((c) => c.id === id);
    if (found) {
      const { privateGroupUrl, ...safeCourse } = found;
      course = safeCourse;
    }
  }

  if (!course) {
    throw new AppError(404, 'কোর্সটি খুঁজে পাওয়া যায়নি।');
  }

  return course;
};

// Admin Service Methods
const getAllAdminCourses = async (): Promise<IAdminCourseResponse[]> => {
  if (!isDbConfigured) {
    return INITIAL_COURSES.map((c) => ({
      ...c,
      isActive: true,
      _count: { enrollments: 0 },
    }));
  }

  const courses = await prisma.course.findMany({
    select: {
      id: true,
      level: true,
      title: true,
      subtitle: true,
      subjects: true,
      services: true,
      price: true,
      oldPrice: true,
      privateGroupUrl: true,
      thumbnailUrl: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { enrollments: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return courses;
};

const createCourse = async (payload: ICreateCoursePayload): Promise<any> => {
  const id = payload.id && payload.id.trim().length > 0 ? payload.id.trim() : generateSlug(payload.title);

  if (isDbConfigured) {
    const existing = await prisma.course.findUnique({ where: { id } });
    if (existing) {
      throw new AppError(409, `"${id}" আইডির একটি কোর্স ইতিমধ্যে বিদ্যমান। অন্য একটি আইডি প্রদান করুন।`);
    }

    return await prisma.course.create({
      data: {
        id,
        level: payload.level,
        title: payload.title,
        subtitle: payload.subtitle,
        subjects: payload.subjects,
        services: payload.services,
        price: payload.price,
        oldPrice: payload.oldPrice,
        privateGroupUrl: payload.privateGroupUrl,
        thumbnailUrl: payload.thumbnailUrl || null,
        isActive: payload.isActive !== undefined ? payload.isActive : true,
      },
    });
  }

  throw new AppError(500, 'ডাটাবেজ কনফিগার করা নেই।');
};

const updateCourse = async (id: string, payload: IUpdateCoursePayload): Promise<any> => {
  if (isDbConfigured) {
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError(404, 'আপডেট করার জন্য কোর্সটি খুঁজে পাওয়া যায়নি।');
    }

    return await prisma.course.update({
      where: { id },
      data: {
        ...(payload.level && { level: payload.level }),
        ...(payload.title && { title: payload.title }),
        ...(payload.subtitle && { subtitle: payload.subtitle }),
        ...(payload.subjects && { subjects: payload.subjects }),
        ...(payload.services && { services: payload.services }),
        ...(payload.price !== undefined && { price: payload.price }),
        ...(payload.oldPrice !== undefined && { oldPrice: payload.oldPrice }),
        ...(payload.privateGroupUrl && { privateGroupUrl: payload.privateGroupUrl }),
        ...(payload.thumbnailUrl !== undefined && { thumbnailUrl: payload.thumbnailUrl }),
        ...(payload.isActive !== undefined && { isActive: payload.isActive }),
      },
    });
  }

  throw new AppError(500, 'ডাটাবেজ কনফিগার করা নেই।');
};

const toggleCourseStatus = async (id: string, newStatus?: boolean): Promise<any> => {
  if (isDbConfigured) {
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError(404, 'কোর্সটি খুঁজে পাওয়া যায়নি।');
    }

    const targetStatus = newStatus !== undefined ? newStatus : !existing.isActive;

    return await prisma.course.update({
      where: { id },
      data: { isActive: targetStatus },
    });
  }

  throw new AppError(500, 'ডাটাবেজ কনফিগার করা নেই।');
};

const deleteCourse = async (id: string): Promise<{ deleted: boolean; paused: boolean; message: string }> => {
  if (isDbConfigured) {
    const existing = await prisma.course.findUnique({
      where: { id },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!existing) {
      throw new AppError(404, 'মুছে ফেলার জন্য কোর্সটি খুঁজে পাওয়া যায়নি।');
    }

    if (existing._count.enrollments > 0) {
      // Course has active student enrollments: safe pause to guard student data integrity
      await prisma.course.update({
        where: { id },
        data: { isActive: false },
      });
      return {
        deleted: false,
        paused: true,
        message: `কোর্সটিতে ${existing._count.enrollments} জন শিক্ষার্থীর এনরোলমেন্ট রেকর্ড রয়েছে। ডেটা সুরক্ষার স্বার্থে কোর্সটি মুছে ফেলার পরিবর্তে সাময়িকভাবে পজ (নিষ্ক্রিয়) করা হয়েছে।`,
      };
    }

    // 0 enrollments: Safe hard delete
    await prisma.course.delete({ where: { id } });
    return {
      deleted: true,
      paused: false,
      message: 'কোর্সটি সফলভাবে মুছে ফেলা হয়েছে।',
    };
  }

  throw new AppError(500, 'ডাটাবেজ কনফিগার করা নেই।');
};

const bulkDeleteCourses = async (
  courseIds: string[]
): Promise<{ deletedCount: number; pausedCount: number; details: string[] }> => {
  if (isDbConfigured) {
    let deletedCount = 0;
    let pausedCount = 0;
    const details: string[] = [];

    for (const id of courseIds) {
      const course = await prisma.course.findUnique({
        where: { id },
        include: {
          _count: {
            select: { enrollments: true },
          },
        },
      });

      if (!course) continue;

      if (course._count.enrollments > 0) {
        await prisma.course.update({
          where: { id },
          data: { isActive: false },
        });
        pausedCount++;
        details.push(`"${course.title}" কোর্সটিতে শিক্ষার্থী ভর্তি থাকায় এটি পজ করা হয়েছে।`);
      } else {
        await prisma.course.delete({ where: { id } });
        deletedCount++;
        details.push(`"${course.title}" কোর্সটি স্থায়ীভাবে মুছে ফেলা হয়েছে।`);
      }
    }

    return { deletedCount, pausedCount, details };
  }

  throw new AppError(500, 'ডাটাবেজ কনফিগার করা নেই।');
};

export const CourseService = {
  getAllCourses,
  getCourseById,
  getAllAdminCourses,
  createCourse,
  updateCourse,
  toggleCourseStatus,
  deleteCourse,
  bulkDeleteCourses,
};
