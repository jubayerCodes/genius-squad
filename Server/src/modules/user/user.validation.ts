import { z } from 'zod';

const bdPhoneRegex = /^01[3-9]\d{8}$/;
export const facebookUrlRegex =
  /^(https?:\/\/)?((www|web|m)\.)?(facebook\.com|fb\.com)\/(profile\.php\?id=\d+|[a-zA-Z0-9.\-_]{3,})\/?.*$/i;

export const updateProfileValidationSchema = z.object({
  name: z.string().min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে').trim().optional(),
  fatherName: z.string().min(2, 'পিতার নাম কমপক্ষে ২ অক্ষরের হতে হবে').trim().optional(),
  district: z.string().min(1, 'জেলা নির্বাচন করুন').trim().optional(),
  upazila: z.string().min(1, 'উপজেলা/থানা লিখুন').trim().optional(),
  institution: z.string().min(2, 'শিক্ষা প্রতিষ্ঠানের নাম লিখুন').trim().optional(),
  phone: z
    .string()
    .regex(bdPhoneRegex, 'সঠিক ১১ ডিজিটের বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 01700000000)')
    .optional(),
  facebookUrl: z
    .string()
    .regex(
      facebookUrlRegex,
      'সঠিক ফেসবুক প্রোফাইল লিংক দিন (যেমন: https://facebook.com/yourprofile)'
    )
    .trim()
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(6, 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে')
    .optional()
    .or(z.literal('')),
});
