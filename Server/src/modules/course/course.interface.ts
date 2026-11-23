export interface ICourseFilter {
  level?: 'SSC' | 'HSC';
}

export interface ICourseResponse {
  id: string;
  level: 'SSC' | 'HSC';
  title: string;
  subtitle: string;
  subjects: string[];
  services: string[];
  price: number;
  oldPrice: number;
  thumbnailUrl?: string | null;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAdminCourseResponse extends ICourseResponse {
  privateGroupUrl: string;
  _count?: {
    enrollments: number;
  };
}

export interface ICreateCoursePayload {
  id?: string;
  level: 'SSC' | 'HSC';
  title: string;
  subtitle: string;
  subjects: string[];
  services: string[];
  price: number;
  oldPrice: number;
  privateGroupUrl: string;
  thumbnailUrl?: string | null;
  isActive?: boolean;
}

export interface IUpdateCoursePayload {
  level?: 'SSC' | 'HSC';
  title?: string;
  subtitle?: string;
  subjects?: string[];
  services?: string[];
  price?: number;
  oldPrice?: number;
  privateGroupUrl?: string;
  thumbnailUrl?: string | null;
  isActive?: boolean;
}
