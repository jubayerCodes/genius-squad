import { z } from 'zod';

const bdPhoneRegex = /^01[3-9]\d{8}$/;
export const facebookUrlRegex =
  /^(https?:\/\/)?((www|web|m)\.)?(facebook\.com|fb\.com)\/(profile\.php\?id=\d+|[a-zA-Z0-9.\-_]{3,})\/?.*$/i;

export const registerValidationSchema = z.object({
  name: z
    .string({ required_error: 'শিক্ষার্থীর নাম আবশ্যক' })
    .min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে')
    .trim(),
  fatherName: z
    .string({ required_error: 'পিতার নাম আবশ্যক' })
    .min(2, 'পিতার নাম কমপক্ষে ২ অক্ষরের হতে হবে')
    .trim(),
  district: z
    .string({ required_error: 'জেলা নির্বাচন করুন' })
    .min(1, 'জেলা নির্বাচন করুন')
    .trim(),
  upazila: z
    .string({ required_error: 'উপজেলা/থানা আবশ্যক' })
    .min(1, 'উপজেলা/থানা লিখুন')
    .trim(),
  institution: z
    .string({ required_error: 'শিক্ষা প্রতিষ্ঠানের নাম আবশ্যক' })
    .min(2, 'শিক্ষা প্রতিষ্ঠানের নাম লিখুন')
    .trim(),
  email: z
    .string({ required_error: 'ইমেইল অ্যাড্রেস আবশ্যক' })
    .email('একটি বৈধ ইমেইল অ্যাড্রেস প্রদান করুন')
    .toLowerCase()
    .trim(),
  phone: z
    .string({ required_error: 'মোবাইল নম্বর আবশ্যক' })
    .regex(bdPhoneRegex, 'সঠিক ১১ ডিজিটের বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 01700000000)'),
  facebookUrl: z
    .string({ required_error: 'ফেসবুক প্রোফাইল লিংক আবশ্যক' })
    .regex(
      facebookUrlRegex,
      'সঠিক ফেসবুক প্রোফাইল লিংক দিন (যেমন: https://facebook.com/yourprofile)'
    )
    .trim(),
  password: z
    .string({ required_error: 'পাসওয়ার্ড আবশ্যক' })
    .min(6, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে'),
});

export const loginValidationSchema = z.object({
  email: z
    .string({ required_error: 'ইমেইল অ্যাড্রেস আবশ্যক' })
    .email('সঠিক ইমেইল অ্যাড্রেস দিন')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'পাসওয়ার্ড আবশ্যক' })
    .min(1, 'পাসওয়ার্ড দিন'),
});
