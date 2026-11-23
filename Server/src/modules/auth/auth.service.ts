import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import { memoryStore, isDbConfigured } from '../../lib/dbStore.js';
import { AppError } from '../../lib/AppError.js';
import { signToken } from '../../lib/auth.js';
import { IRegisterUser, ILoginUser, IAuthResponse } from './auth.interface.js';

const registerUser = async (payload: IRegisterUser): Promise<IAuthResponse> => {
  // Check existing email
  if (isDbConfigured) {
    const existing = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (existing) {
      throw new AppError(409, 'এই ইমেইল অ্যাড্রেস দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা হয়েছে।');
    }
  } else {
    const existing = Array.from(memoryStore.users.values()).find(
      (u) => u.email.toLowerCase() === payload.email.toLowerCase()
    );
    if (existing) {
      throw new AppError(409, 'এই ইমেইল অ্যাড্রেস দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা হয়েছে।');
    }
  }

  // Hash password
  const passwordHash = await bcrypt.hash(payload.password, 10);
  let user: any = null;

  if (isDbConfigured) {
    user = await prisma.user.create({
      data: {
        name: payload.name,
        fatherName: payload.fatherName,
        district: payload.district,
        upazila: payload.upazila,
        institution: payload.institution,
        email: payload.email,
        phone: payload.phone,
        facebookUrl: payload.facebookUrl,
        passwordHash,
        role: 'STUDENT',
      },
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
        createdAt: true,
      },
    });
  } else {
    user = {
      id: 'usr_' + Date.now(),
      name: payload.name,
      fatherName: payload.fatherName,
      district: payload.district,
      upazila: payload.upazila,
      institution: payload.institution,
      email: payload.email,
      phone: payload.phone,
      facebookUrl: payload.facebookUrl,
      passwordHash,
      role: 'STUDENT' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.users.set(user.id, user);
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  const { passwordHash: _, ...safeUser } = user;
  return { token, user: safeUser };
};

const loginUser = async (credentials: ILoginUser): Promise<IAuthResponse> => {
  const { email, password } = credentials;

  // Look up user in database
  let user: any = null;
  if (isDbConfigured) {
    user = await prisma.user.findUnique({
      where: { email },
    });
  } else {
    user = Array.from(memoryStore.users.values()).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
  }

  if (!user) {
    throw new AppError(401, 'ভুল ইমেইল অথবা পাসওয়ার্ড প্রদান করা হয়েছে।');
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError(401, 'ভুল ইমেইল অথবা পাসওয়ার্ড প্রদান করা হয়েছে।');
  }

  // Check account suspension status
  if (user.isSuspended) {
    throw new AppError(403, 'আপনার অ্যাকাউন্টটি স্থগিত (Suspended) করা হয়েছে। সহায়তার জন্য কর্তৃপক্ষের সাথে যোগাযোগ করুন।');
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  const { passwordHash: _, ...safeUser } = user;
  return { token, user: safeUser };
};

const getMe = async (userId: string, email: string, role: any, name: string) => {
  let user: any = null;

  if (isDbConfigured) {
    user = await prisma.user.findUnique({
      where: { id: userId },
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
      },
    });
  } else {
    user = memoryStore.users.get(userId);
    if (user) {
      const { passwordHash: _, ...safeUser } = user;
      user = safeUser;
    }
  }

  if (user && user.isSuspended) {
    throw new AppError(403, 'আপনার অ্যাকাউন্টটি স্থগিত করা হয়েছে।');
  }

  if (!user) {
    user = {
      id: userId,
      name,
      fatherName: 'প্রযোজ্য নয়',
      district: 'ঢাকা',
      upazila: 'ধানমন্ডি',
      institution: 'শিক্ষা প্রতিষ্ঠান',
      email,
      phone: '01700000000',
      facebookUrl: 'https://facebook.com',
      role,
      isSuspended: false,
      createdAt: new Date(),
    };
  }

  return user;
};

export const AuthService = {
  registerUser,
  loginUser,
  getMe,
};
