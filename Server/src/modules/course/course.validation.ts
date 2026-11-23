import { z } from 'zod';

export const createCourseValidationSchema = z.object({
  id: z.string().trim().min(2, 'কোর্স আইডি / স্লাগ কমপক্ষে ২ অক্ষরের হতে হবে।').optional(),
  level: z.enum(['SSC', 'HSC'], {
    required_error: 'কোর্সের লেভেল (SSC অথবা HSC) নির্বাচন করুন।',
  }),
  title: z.string().trim().min(3, 'কোর্সের শিরোনাম কমপক্ষে ৩ অক্ষরের হতে হবে।'),
  subtitle: z.string().trim().min(3, 'কোর্সের সাব-টাইটেল কমপক্ষে ৩ অক্ষরের হতে হবে।'),
  subjects: z.array(z.string().trim()).min(1, 'কমপক্ষে একটি বিষয় বা সাবজেক্ট যোগ করুন।'),
  services: z.array(z.string().trim()).min(1, 'কমপক্ষে একটি সুবিধা বা ফিচার যোগ করুন।'),
  price: z.number().int().nonnegative('কোর্সের মূল্য ধনাত্মক সংখ্যা হতে হবে।'),
  oldPrice: z.number().int().nonnegative('আগের মূল্য ধনাত্মক সংখ্যা হতে হবে।'),
  privateGroupUrl: z.string().trim().url('সঠিক ফেসবুক প্রাইভেট গ্রুপ লিংক দিন।'),
  thumbnailUrl: z.string().trim().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const updateCourseValidationSchema = z.object({
  level: z.enum(['SSC', 'HSC']).optional(),
  title: z.string().trim().min(3).optional(),
  subtitle: z.string().trim().min(3).optional(),
  subjects: z.array(z.string().trim()).min(1).optional(),
  services: z.array(z.string().trim()).min(1).optional(),
  price: z.number().int().nonnegative().optional(),
  oldPrice: z.number().int().nonnegative().optional(),
  privateGroupUrl: z.string().trim().url().optional(),
  thumbnailUrl: z.string().trim().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const toggleCourseStatusValidationSchema = z.object({
  isActive: z.boolean().optional(),
});

export const bulkDeleteCoursesValidationSchema = z.object({
  courseIds: z.array(z.string().trim().min(1)).min(1, 'কমপক্ষে একটি কোর্স আইডি প্রদান করুন।'),
});
