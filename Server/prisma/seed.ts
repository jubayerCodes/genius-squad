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

    process.exit(0);
  } catch {
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
