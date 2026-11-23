import { INITIAL_COURSES } from './courseCatalog.js';

export interface UserEntity {
  id: string;
  name: string;
  fatherName: string;
  district: string;
  upazila: string;
  institution: string;
  email: string;
  phone: string;
  facebookUrl: string;
  passwordHash: string;
  role: 'STUDENT' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

export interface EnrollmentEntity {
  id: string;
  userId: string;
  courseId: string;
  paymentMethod: 'BKASH' | 'NAGAD';
  senderNumber: string;
  transactionId: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string | null;
  verifiedBy?: string | null;
  verifiedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

class MemoryStore {
  public users: Map<string, UserEntity> = new Map();
  public enrollments: Map<string, EnrollmentEntity> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    // Seed Demo Student
    this.users.set('usr_student_demo', {
      id: 'usr_student_demo',
      name: 'আব্দুল করিম',
      fatherName: 'রফিকুল ইসলাম',
      district: 'ঢাকা',
      upazila: 'মিরপুর',
      institution: 'মিরপুর ক্যান্টনমেন্ট পাবলিক স্কুল ও কলেজ',
      email: 'student@geniussquad.com',
      phone: '01711223344',
      facebookUrl: 'https://facebook.com/abdul.karim.demo',
      passwordHash: '$2a$10$wT0o1K5s5vU07cZ1UvWkqu5v1vL8z5aB8qL5vU07cZ1UvWkqu5v1v', // student123
      role: 'STUDENT',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed Demo Admin
    this.users.set('usr_admin_master', {
      id: 'usr_admin_master',
      name: 'প্রধান অ্যাডমিন (Admin)',
      fatherName: 'অ্যাডমিন পরিচালক',
      district: 'ঢাকা',
      upazila: 'ধানমন্ডি',
      institution: 'জিনিয়াস স্কোয়াড কেন্দ্রীয় কার্যালয়',
      email: 'admin@geniussquad.com',
      phone: '01700000000',
      facebookUrl: 'https://facebook.com/geniussquad',
      passwordHash: '$2a$10$wT0o1K5s5vU07cZ1UvWkqu5v1vL8z5aB8qL5vU07cZ1UvWkqu5v1v', // admin123
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed existing pending enrollment for demo student
    this.enrollments.set('enr_seed_1', {
      id: 'enr_seed_1',
      userId: 'usr_student_demo',
      courseId: 'ssc-full-prep-2026',
      paymentMethod: 'BKASH',
      senderNumber: '01711223344',
      transactionId: 'TRX99887766',
      amount: 2990,
      status: 'PENDING',
      createdAt: new Date(Date.now() - 3600000),
      updatedAt: new Date(Date.now() - 3600000),
    });
  }
}

const globalForStore = globalThis as unknown as {
  dbStore: MemoryStore | undefined;
};

export const memoryStore = globalForStore.dbStore ?? new MemoryStore();
if (process.env.NODE_ENV !== 'production') globalForStore.dbStore = memoryStore;

export const isDbConfigured = Boolean(
  process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.includes('123456') &&
    !process.env.DATABASE_URL.includes('dummy') &&
    !process.env.DATABASE_URL.includes('secret@')
);
