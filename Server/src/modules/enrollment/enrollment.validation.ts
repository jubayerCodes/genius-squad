import { z } from 'zod';

const bdPhoneRegex = /^01[3-9]\d{8}$/;

export const createEnrollmentValidationSchema = z.object({
  courseId: z.string({ required_error: 'কোর্স আইডি প্রদান করুন' }).min(1),
  paymentMethod: z.enum(['BKASH', 'NAGAD'] as const, {
    required_error: 'পেমেন্ট মেথড নির্বাচন করুন (bKash অথবা Nagad)',
  }),
  senderNumber: z
    .string({ required_error: 'প্রেরক মোবাইল নম্বর আবশ্যক' })
    .regex(bdPhoneRegex, 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01700000000)'),
  transactionId: z
    .string({ required_error: 'ট্রানজেকশন আইডি (TrxID) আবশ্যক' })
    .min(6, 'সঠিক ট্রানজেকশন আইডি লিখুন')
    .max(20, 'ট্রানজেকশন আইডি সর্বোচ্চ ২০ অক্ষরের হতে পারে')
    .toUpperCase()
    .trim(),
});
