import { Role } from '@prisma/client';

export interface IRegisterUser {
  name: string;
  fatherName: string;
  district: string;
  upazila: string;
  institution: string;
  email: string;
  phone: string;
  facebookUrl: string;
  password: string;
}

export interface ILoginUser {
  email: string;
  password: string;
}

export interface IAuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    fatherName: string;
    district: string;
    upazila: string;
    institution: string;
    email: string;
    phone: string;
    facebookUrl: string;
    role: Role;
    createdAt?: Date;
  };
}
