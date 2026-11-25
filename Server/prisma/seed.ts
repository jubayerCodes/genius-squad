import { PrismaClient, Level, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const COURSES = [
  {
    id: 'ssc-final-revision',
    level: Level.SSC,
    title: 'Final Revision Batch',
    subtitle: 'SSC ২০২৫ • বিজ্ঞান বিভাগ',
    subjects: ['পদার্থবিজ্ঞান', 'রসায়ন', 'উচ্চতর গণিত', 'জীববিজ্ঞান'],
    services: [
      '১২০+ লাইভ ক্লাস',
      '৪৫০+ লেকচার শিট',
      '২৪/৭ ডাউট সলভ গ্রুপ',
      'কোর্সের মেয়াদ ১ বছর',
      'লাইভ MCQ এক্সাম',
      'সাবজেক্ট ফাইনাল পরীক্ষা',
    ],
    price: 2490,
    oldPrice: 4000,
    privateGroupUrl: 'https://facebook.com/groups/geniussquad-ssc-revision',
    isActive: true,
  },
  {
    id: 'hsc-academic',
    level: Level.HSC,
    title: 'Academic Batch',
    subtitle: 'HSC ২০২৬ • পূর্ণাঙ্গ প্রস্তুতি',
    subjects: ['পদার্থবিজ্ঞান ১ম ও ২য়', 'রসায়ন ১ম ও ২য়', 'উচ্চতর গণিত'],
    services: [
      '১৬০+ ইন্টার‍্যাক্টিভ লাইভ ক্লাস',
      'প্রিন্টেড লেকচার নোট PDF',
      'সাপ্তাহিক মডেল টেস্ট',
      'মেন্টরশিপ সাপোর্ট',
      'চ্যাপ্টারভিত্তিক টেস্ট',
      'রেকর্ডেড ক্লাসের ব্যাকআপ',
    ],
    price: 3990,
    oldPrice: 6000,
    privateGroupUrl: 'https://facebook.com/groups/geniussquad-hsc-academic-2026',
    isActive: true,
  },
  {
    id: 'english-ict',
    level: Level.HSC,
    title: 'English + ICT Course',
    subtitle: 'HSC ২০২৫–২৬ • স্পেশাল কোর্স',
    subjects: ['ইংরেজি ১ম পত্র', 'ইংরেজি ২য় পত্র', 'ICT সম্পূর্ণ'],
    services: [
      '৮০+ স্পেশাল লাইভ ক্লাস',
      'টপিকভিত্তিক প্র্যাকটিস বুক',
      'নিয়মিত কুইজ এক্সাম',
      'টপ স্কোরার গাইডলাইন',
    ],
    price: 1990,
    oldPrice: 3000,
    privateGroupUrl: 'https://facebook.com/groups/geniussquad-english-ict',
    isActive: true,
  },
];

async function seed() {
  try {
    // 1. Seed Courses
    for (const c of COURSES) {
      await prisma.course.upsert({
        where: { id: c.id },
        update: c,
        create: c,
      });
    }

    // 2. Seed Default Super Admin
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
      where: { email: 'admin@geniussquad.com' },
      update: { role: Role.SUPER_ADMIN },
      create: {
        name: 'Genius Squad Super Admin',
        fatherName: 'Director',
        district: 'ঢাকা',
        upazila: 'ধানমন্ডি',
        institution: 'Genius Squad HQ',
        email: 'admin@geniussquad.com',
        phone: '01700000000',
        facebookUrl: 'https://facebook.com/geniussquad.official',
        passwordHash: adminPasswordHash,
        role: Role.SUPER_ADMIN,
      },
    });

    // 3. Seed Sample Open MCQ Model Test (idempotent)
    const demoExamId = 'ssc-physics-demo-test';
    const demoQuestions = [
      {
        id: 'q-demo-phy-1',
        question: 'নিউটনের গতির দ্বিতীয় সূত্র থেকে নিচের কোন সমীকরণটি পাওয়া যায়?',
        options: ['F = ma', 'v = u + at', 'E = mc²', 'P = mv'],
        correctOption: 0,
        explanation: 'বস্তুর ভরবেগের পরিবর্তনের হার এর ওপর প্রযুক্ত বলের সমানুপাতিক (F = ma)।',
        marks: 1,
        orderIndex: 0,
      },
      {
        id: 'q-demo-phy-2',
        question: 'আন্তর্জাতিক পদ্ধতিতে (SI) কাজের একক কোনটি?',
        options: ['ওয়াট (Watt)', 'নিউটন (Newton)', 'জুল (Joule)', 'প্যাসকেল (Pascal)'],
        correctOption: 2,
        explanation: 'কাজ = বল × সরণ; SI পদ্ধতিতে কাজের একক জুল (Joule)।',
        marks: 1,
        orderIndex: 1,
      },
      {
        id: 'q-demo-phy-3',
        question: 'কোনো বস্তু স্থির অবস্থান থেকে ২ m/s² সুষম ত্বরণে চললে ৫ সেকেন্ড পর বেগ কত হবে?',
        options: ['৫ m/s', '১০ m/s', '১৫ m/s', '২০ m/s'],
        correctOption: 1,
        explanation: 'v = u + at = 0 + (2 × 5) = 10 m/s।',
        marks: 1,
        orderIndex: 2,
      },
      {
        id: 'q-demo-phy-4',
        question: 'শব্দের বেগ কোন মাধ্যমে সবচেয়ে বেশি?',
        options: ['বায়বীয় মাধ্যমে', 'তরল মাধ্যমে', 'কঠিন মাধ্যমে', 'শূন্য মাধ্যমে'],
        correctOption: 2,
        explanation: 'কঠিন পদার্থের অণুগুলো সবচেয়ে কাছাকাছি থাকায় কঠিন মাধ্যমে শব্দের বেগ সর্বোচ্চ হয়।',
        marks: 1,
        orderIndex: 3,
      },
      {
        id: 'q-demo-phy-5',
        question: 'ওহমের সূত্র অনুযায়ী পরিবাহীর রোধ স্থির থাকলে প্রবাহমাত্রা (I) ও বিভব পার্থক্য (V)-এর সম্পর্ক কী?',
        options: ['ব্যস্তানুপাতিক', 'সমানুপাতিক', 'বর্গের সমানুপাতিক', 'কোনো সম্পর্ক নেই'],
        correctOption: 1,
        explanation: 'তাপমাত্রা স্থির থাকলে পরিবাহীর তড়িৎ প্রবাহ দুই প্রান্তের বিভব পার্থক্যের সমানুপাতিক (V = IR)।',
        marks: 1,
        orderIndex: 4,
      },
    ];

    await prisma.exam.upsert({
      where: { id: demoExamId },
      update: {},
      create: {
        id: demoExamId,
        courseId: 'ssc-final-revision',
        title: 'SSC পদার্থবিজ্ঞান: গতি, বল ও কাজ ফ্রি মডেল টেস্ট',
        description: 'বোর্ড পরীক্ষার প্রস্তুতি যাচাইয়ের জন্য সবার জন্য উন্মুক্ত ৫ নম্বরের দ্রুত MCQ মডেল টেস্ট।',
        durationMinutes: 10,
        totalMarks: 5,
        passMarks: 2,
        negativeMarking: 0.25,
        isPublic: true,
        isActive: true,
      },
    });

    for (const dq of demoQuestions) {
      await prisma.examQuestion.upsert({
        where: { id: dq.id },
        update: {},
        create: {
          ...dq,
          examId: demoExamId,
        },
      });
    }

    process.exit(0);
  } catch {
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
