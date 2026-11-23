import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import { memoryStore, isDbConfigured } from '../../lib/dbStore.js';
import { TokenPayload } from '../../lib/auth.js';
import { IUpdateProfile } from './user.interface.js';

const updateUserProfile = async (userPayload: TokenPayload, payload: IUpdateProfile) => {
  const updateData: any = {};
  if (payload.name) updateData.name = payload.name;
  if (payload.fatherName) updateData.fatherName = payload.fatherName;
  if (payload.district) updateData.district = payload.district;
  if (payload.upazila) updateData.upazila = payload.upazila;
  if (payload.institution) updateData.institution = payload.institution;
  if (payload.phone) updateData.phone = payload.phone;
  if (payload.facebookUrl) updateData.facebookUrl = payload.facebookUrl;

  let updatedUser: any = null;

  if (isDbConfigured) {
    if (payload.password && payload.password.length >= 6) {
      updateData.passwordHash = await bcrypt.hash(payload.password, 10);
    }

    updatedUser = await prisma.user.update({
      where: { id: userPayload.userId },
      data: updateData,
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
        updatedAt: true,
      },
    });
  } else {
    const existing = memoryStore.users.get(userPayload.userId);
    let newHash = existing?.passwordHash;
    if (payload.password && payload.password.length >= 6) {
      newHash = await bcrypt.hash(payload.password, 10);
    }

    updatedUser = {
      ...(existing || {
        id: userPayload.userId,
        email: userPayload.email,
        role: userPayload.role,
        createdAt: new Date(),
      }),
      ...updateData,
      passwordHash: newHash,
      updatedAt: new Date(),
    };

    memoryStore.users.set(userPayload.userId, updatedUser);
    const { passwordHash: _, ...safeUser } = updatedUser;
    updatedUser = safeUser;
  }

  return updatedUser;
};

export const UserService = {
  updateUserProfile,
};
