import { z } from 'zod';

export const createExamValidationSchema = z.object({
  courseId: z.string().trim().optional().nullable(),
  title: z.string().trim().min(3, 'পরীক্ষার শিরোনাম কমপক্ষে ৩ অক্ষরের হতে হবে।'),
  description: z.string().trim().optional().nullable(),
  durationMinutes: z
    .number({ required_error: 'পরীক্ষার সময় (মিনিট) নির্ধারণ করা আবশ্যক।' })
    .int('সময় পূর্ণ সংখ্যায় (মিনিট) হতে হবে।')
    .min(1, 'পরীক্ষার সময় কমপক্ষে ১ মিনিট হতে হবে।')
    .max(300, 'পরীক্ষার সময় সর্বোচ্চ ৩০০ মিনিট হতে পারবে।'),
  passMarks: z.number().nonnegative('পাস মার্কস ঋণাত্মক হতে পারবে না।').optional(),
  negativeMarking: z
    .number()
    .nonnegative('নেগেটিভ মার্কিং ঋণাত্মক হতে পারবে না।')
    .max(5, 'নেগেটিভ মার্কিং সর্বোচ্চ ৫ হতে পারবে।')
    .optional(),
  isPublic: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const updateExamValidationSchema = z.object({
  courseId: z.string().trim().optional().nullable(),
  title: z.string().trim().min(3, 'পরীক্ষার শিরোনাম কমপক্ষে ৩ অক্ষরের হতে হবে।').optional(),
  description: z.string().trim().optional().nullable(),
  durationMinutes: z.number().int().min(1).max(300).optional(),
  passMarks: z.number().nonnegative().optional(),
  negativeMarking: z.number().nonnegative().max(5).optional(),
  isPublic: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const createQuestionValidationSchema = z.object({
  question: z.string().trim().min(2, 'প্রশ্নটি কমপক্ষে ২ অক্ষরের হতে হবে।'),
  options: z
    .array(z.string().trim().min(1, 'প্রতিটি অপশন পূরণ করা আবশ্যক।'))
    .min(2, 'কমপক্ষে ২টি অপশন প্রদান করতে হবে।')
    .max(5, 'সর্বোচ্চ ৫টি অপশন দেওয়া যাবে।'),
  correctOption: z
    .number({ required_error: 'অবশ্যই সঠিক উত্তর (Answer Sheet) নির্বাচন করতে হবে।' })
    .int()
    .nonnegative(),
  explanation: z.string().trim().optional().nullable(),
  marks: z.number().positive('প্রশ্নের নম্বর ০-এর বেশি হতে হবে।').optional(),
  orderIndex: z.number().int().nonnegative().optional(),
});

export const bulkCreateQuestionsValidationSchema = z.object({
  questions: z
    .array(createQuestionValidationSchema)
    .min(1, 'কমপক্ষে ১টি প্রশ্ন প্রদান করা আবশ্যক।')
    .max(100, 'একসাথে সর্বোচ্চ ১০০টি প্রশ্ন যোগ করা যাবে।'),
});

export const updateQuestionValidationSchema = z.object({
  question: z.string().trim().min(2).optional(),
  options: z.array(z.string().trim().min(1)).min(2).max(5).optional(),
  correctOption: z.number().int().nonnegative().optional(),
  explanation: z.string().trim().optional().nullable(),
  marks: z.number().positive().optional(),
  orderIndex: z.number().int().nonnegative().optional(),
});

export const submitExamValidationSchema = z.object({
  answers: z.record(z.string(), z.number().int().nonnegative().nullable()).default({}),
});

export const syncDraftValidationSchema = z.object({
  answers: z.record(z.string(), z.number().int().nonnegative().nullable()),
});
