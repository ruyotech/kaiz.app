const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API_V1 = `${API_BASE_URL}/api/v1`;

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorCode?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Token management for client-side
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem('accessToken');
  }
  return accessToken;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  requiresAuth: boolean = false
): Promise<T> {
  const url = `${API_V1}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (requiresAuth) {
    const token = getAccessToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || 'Request failed',
      response.status,
      data.errorCode
    );
  }

  return data.data ?? data;
}

// ==========================================
// Auth API
// ==========================================

export const authApi = {
  login: (email: string, password: string) =>
    request<{ accessToken: string; refreshToken: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { email: string; password: string; fullName: string; timezone?: string }) =>
    request<{ accessToken: string; refreshToken: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () => request('/auth/logout', { method: 'POST' }, true),

  getCurrentUser: () => request<any>('/auth/me', {}, true),

  forgotPassword: (email: string) =>
    request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string) =>
    request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),
};

// ==========================================
// Community API (Public endpoints for marketing)
// ==========================================

export const communityApi = {
  getPublicStats: () => request<any>('/community/public/stats'),
  
  getPublicLeaderboard: (period: 'weekly' | 'monthly' | 'all_time' = 'weekly') =>
    request<any[]>(`/community/public/leaderboard?period=${period}`),
  
  getPublicStories: (page = 0, size = 10) =>
    request<any>(`/community/public/stories?page=${page}&size=${size}`),
  
  getPublicActivity: (limit = 20) =>
    request<any[]>(`/community/public/activity?limit=${limit}`),

  // Authenticated endpoints
  getHome: () => request<any>('/community/home', {}, true),
  
  getMembers: (query?: string) =>
    request<any[]>(`/community/members/search${query ? `?q=${query}` : ''}`, {}, true),
  
  postStory: (data: any) =>
    request('/community/stories', { method: 'POST', body: JSON.stringify(data) }, true),
};

// ==========================================
// Tasks API
// ==========================================

export const tasksApi = {
  getAll: (sprintId?: string) =>
    request<any[]>(`/tasks${sprintId ? `?sprintId=${sprintId}` : ''}`, {}, true),
  
  getById: (id: string) => request<any>(`/tasks/${id}`, {}, true),
  
  create: (data: any) =>
    request('/tasks', { method: 'POST', body: JSON.stringify(data) }, true),
  
  update: (id: string, data: any) =>
    request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true),
  
  delete: (id: string) =>
    request(`/tasks/${id}`, { method: 'DELETE' }, true),
};

// ==========================================
// Sprints API
// ==========================================

export const sprintsApi = {
  getAll: () => request<any[]>('/sprints', {}, true),
  getCurrent: () => request<any>('/sprints/current', {}, true),
  getById: (id: string) => request<any>(`/sprints/${id}`, {}, true),
};

// ==========================================
// Challenges API
// ==========================================

export const challengesApi = {
  getAll: () => request<any[]>('/challenges', {}, true),
  getById: (id: string) => request<any>(`/challenges/${id}`, {}, true),
  join: (id: string) => request(`/challenges/${id}/join`, { method: 'POST' }, true),
  logEntry: (id: string, data: any) =>
    request(`/challenges/${id}/entries`, { method: 'POST', body: JSON.stringify(data) }, true),
};

// ==========================================
// Admin API (New endpoints)
// ==========================================

export const adminApi = {
  // Dashboard
  getDashboardStats: () => request<any>('/admin/dashboard/stats', {}, true),
  
  // Users
  getUsers: (page = 0, size = 20, search?: string) =>
    request<any>(`/admin/users?page=${page}&size=${size}${search ? `&search=${search}` : ''}`, {}, true),
  
  getUserById: (id: string) => request<any>(`/admin/users/${id}`, {}, true),
  
  updateUserRole: (id: string, role: string) =>
    request(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }, true),
  
  // Marketing Content
  getMarketingContent: () => request<any[]>('/admin/marketing/content', {}, true),
  
  updateMarketingContent: (id: string, data: any) =>
    request(`/admin/marketing/content/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true),
  
  // Analytics (merged into admin)
  getAnalytics: (period: 'day' | 'week' | 'month' = 'week') =>
    request<any>(`/admin/analytics?period=${period}`, {}, true),
};
