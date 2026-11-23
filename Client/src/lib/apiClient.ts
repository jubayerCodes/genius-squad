export interface ApiResponse<T = any> {
  success: boolean;
  statusCode?: number;
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const baseUrl = rawBaseUrl.replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${cleanEndpoint}`;

  const headers: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(url, {
    credentials: 'include',
    ...options,
    headers,
  });

  const data: ApiResponse<T> = await res.json();

  if (!res.ok || !data.success) {
    const errorMsg =
      data.message ||
      (data.errors && data.errors.length > 0 ? data.errors[0].message : 'অনুরোধটি সম্পন্ন করা যায়নি।');
    throw new Error(errorMsg);
  }

  return data;
}

export const apiClient = {
  // Auth
  register: (payload: any) =>
    request('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (credentials: { email: string; password: string }) =>
    request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  logout: () =>
    request('/api/v1/auth/logout', {
      method: 'POST',
    }),

  getMe: () => request('/api/v1/auth/me'),

  // User Profile
  updateProfile: (profileData: any) =>
    request('/api/v1/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  // Courses
  getCourses: (level?: string) =>
    request(`/api/v1/courses${level && level !== 'ALL' ? `?level=${level}` : ''}`),

  getCourse: (id: string) => request(`/api/v1/courses/${id}`),

  // Enrollments
  createEnrollment: (payload: {
    courseId: string;
    paymentMethod: 'BKASH' | 'NAGAD';
    senderNumber: string;
    transactionId: string;
  }) =>
    request('/api/v1/enrollments', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMyCourses: () => request('/api/v1/enrollments/my-courses'),

  // Admin Enrollments
  getAdminEnrollments: (status?: string) =>
    request(`/api/v1/admin/enrollments${status ? `?status=${status}` : ''}`),

  verifyEnrollment: (
    id: string,
    payload: { status: 'APPROVED' | 'REJECTED'; rejectionReason?: string }
  ) =>
    request(`/api/v1/admin/enrollments/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // Admin Course Management & Uploads
  uploadCourseImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return request('/api/v1/admin/upload', {
      method: 'POST',
      body: formData,
    });
  },

  getAdminCourses: () => request('/api/v1/admin/courses'),

  createCourse: (payload: any) =>
    request('/api/v1/admin/courses', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateCourse: (id: string, payload: any) =>
    request(`/api/v1/admin/courses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  toggleCourseStatus: (id: string, isActive?: boolean) =>
    request(`/api/v1/admin/courses/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),

  deleteCourse: (id: string) =>
    request(`/api/v1/admin/courses/${id}`, {
      method: 'DELETE',
    }),

  bulkDeleteCourses: (courseIds: string[]) =>
    request('/api/v1/admin/courses/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ courseIds }),
    }),

  // Admin User Management
  getAdminUsers: (params?: { role?: string; isSuspended?: string; search?: string }) => {
    const query = new URLSearchParams()
    if (params?.role && params.role !== 'ALL') query.set('role', params.role)
    if (params?.isSuspended && params.isSuspended !== 'ALL') query.set('isSuspended', params.isSuspended)
    if (params?.search) query.set('search', params.search)
    const qs = query.toString() ? `?${query.toString()}` : ''
    return request(`/api/v1/admin/users${qs}`)
  },

  updateUserRole: (id: string, role: 'STUDENT' | 'ADMIN') =>
    request(`/api/v1/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),

  updateUserStatus: (id: string, isSuspended: boolean) =>
    request(`/api/v1/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isSuspended }),
    }),

  deleteUser: (id: string) =>
    request(`/api/v1/admin/users/${id}`, {
      method: 'DELETE',
    }),
};

export default apiClient;
