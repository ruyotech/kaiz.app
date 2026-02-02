/**
 * KAIZ Web API Service
 * Mirrors the mobile API service for full feature parity
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kaiz-api-213334506754.us-central1.run.app';
const API_V1 = `${API_BASE_URL}/api/v1`;

// Storage keys
const ACCESS_TOKEN_KEY = 'kaiz_access_token';
const REFRESH_TOKEN_KEY = 'kaiz_refresh_token';

// Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  accountType: 'INDIVIDUAL' | 'FAMILY' | 'CORPORATE';
  subscriptionTier: 'FREE' | 'PREMIUM' | 'ENTERPRISE';
  timezone: string;
  avatarUrl: string | null;
  emailVerified: boolean;
  role?: 'USER' | 'ADMIN';
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string | { code: string; message: string };
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Error classes
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

export class AuthExpiredError extends Error {
  constructor() {
    super('Session expired');
    this.name = 'AuthExpiredError';
  }
}

// Token management
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function saveTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// Auth expiration callback
let onAuthExpired: (() => void) | null = null;
let authExpirationTriggered = false;

export function setOnAuthExpired(callback: () => void): void {
  onAuthExpired = callback;
  authExpirationTriggered = false;
}

async function triggerAuthExpiration(): Promise<void> {
  if (authExpirationTriggered) return;
  authExpirationTriggered = true;
  clearTokens();
  onAuthExpired?.();
}

// HTTP request helper
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  requiresAuth: boolean = false
): Promise<T> {
  const url = `${API_V1}${endpoint}`;

  // Check if this is a login endpoint (should not trigger auth expiration on 401)
  const isLoginEndpoint = endpoint.includes('/auth/login');

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

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();

    const getErrorMessage = (responseData: any): string => {
      // Handle direct message field (API error format)
      if (responseData.message) return responseData.message;
      // Handle error field (legacy format)
      if (typeof responseData.error === 'string') return responseData.error;
      if (responseData.error && typeof responseData.error === 'object') return responseData.error.message;
      return 'Request failed';
    };

    if (!response.ok) {
      // Only trigger auth expiration for non-login 401 errors
      if (response.status === 401 && !isLoginEndpoint) {
        await triggerAuthExpiration();
        throw new AuthExpiredError();
      }
      throw new ApiError(getErrorMessage(data), response.status);
    }

    if (data.success === false) {
      throw new ApiError(getErrorMessage(data), response.status);
    }

    return data.data as T;
  } catch (error) {
    if (error instanceof AuthExpiredError || error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Unable to connect to server', 0, 'NETWORK_ERROR');
  }
}

async function requestRaw<T>(
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

  try {
    const response = await fetch(url, { ...options, headers });

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    if (!text) return undefined as T;

    const data = JSON.parse(text);

    if (!response.ok) {
      if (response.status === 401) {
        await triggerAuthExpiration();
        throw new AuthExpiredError();
      }
      throw new ApiError(data?.error?.message || data?.error || 'Request failed', response.status);
    }

    if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
      return data.data as T;
    }

    return data as T;
  } catch (error) {
    if (error instanceof AuthExpiredError || error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Unable to connect to server', 0, 'NETWORK_ERROR');
  }
}

// Admin-specific request helper that uses admin token
async function adminRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_V1}${endpoint}`;

  const token = getAdminAccessToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  try {
    const response = await fetch(url, { ...options, headers });

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    if (!text) return undefined as T;

    const data = JSON.parse(text);

    if (!response.ok) {
      if (response.status === 401) {
        clearAdminTokens();
        throw new ApiError('Admin session expired. Please log in again.', 401);
      }
      throw new ApiError(data?.message || data?.error || 'Request failed', response.status);
    }

    // Handle wrapped response {success: true, data: ...}
    if (data && typeof data === 'object' && 'success' in data && data.data !== undefined) {
      return data.data as T;
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Unable to connect to server', 0, 'NETWORK_ERROR');
  }
}

// ============================================================
// AUTH API
// ============================================================
export const authApi = {
  async register(data: { email: string; password: string; fullName: string; timezone?: string }) {
    const response = await request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    saveTokens(response.accessToken, response.refreshToken);
    return response;
  },

  async login(email: string, password: string) {
    const response = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    saveTokens(response.accessToken, response.refreshToken);
    return response;
  },

  async logout() {
    try {
      await request<void>('/auth/logout', { method: 'POST' }, true);
    } catch {
      // Clear tokens even if API call fails
    }
    clearTokens();
  },

  async getCurrentUser(): Promise<User> {
    return request<User>('/auth/me', { method: 'GET' }, true);
  },

  async refreshToken() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new ApiError('No refresh token', 401);
    }
    const response = await request<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    saveTokens(response.accessToken, response.refreshToken);
    return response;
  },

  async forgotPassword(email: string) {
    return request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, newPassword: string) {
    return request<void>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },

  hasValidSession(): boolean {
    return !!getAccessToken();
  },
};

// ============================================================
// ADMIN AUTH API (Separate from User Auth)
// ============================================================
const ADMIN_ACCESS_TOKEN_KEY = 'kaiz_admin_access_token';
const ADMIN_REFRESH_TOKEN_KEY = 'kaiz_admin_refresh_token';

export function getAdminAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY);
}

export function getAdminRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_REFRESH_TOKEN_KEY);
}

export function saveAdminTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, refreshToken);
}

export function clearAdminTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
  localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'SUPER_ADMIN' | 'SUPPORT' | 'MARKETING';
  isActive: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}

export interface AdminAuthResponse {
  accessToken: string;
  refreshToken: string;
  admin: AdminUser;
}

export const adminAuthApi = {
  async login(email: string, password: string) {
    const response = await request<AdminAuthResponse>('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    saveAdminTokens(response.accessToken, response.refreshToken);
    return response;
  },

  async logout() {
    const refreshToken = getAdminRefreshToken();
    try {
      if (refreshToken) {
        await request<void>('/admin/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch {
      // Clear tokens even if API call fails
    }
    clearAdminTokens();
  },

  async getCurrentAdmin(): Promise<AdminUser> {
    const url = `${API_V1}/admin/auth/me`;
    const token = getAdminAccessToken();

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });

    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new ApiError(data.message || 'Failed to get admin', response.status);
    }
    return data.data;
  },

  async refreshToken() {
    const refreshToken = getAdminRefreshToken();
    if (!refreshToken) {
      throw new ApiError('No refresh token', 401);
    }
    const response = await request<AdminAuthResponse>('/admin/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    saveAdminTokens(response.accessToken, response.refreshToken);
    return response;
  },

  hasValidSession(): boolean {
    return !!getAdminAccessToken();
  },
};

// ============================================================
// TASK API
// ============================================================
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  storyPoints: number;
  dueDate?: string;
  sprintId?: string;
  epicId?: string;
  lifeWheelAreaId?: string;
  createdAt: string;
  updatedAt: string;
}

export const taskApi = {
  async getAll(filters?: { sprintId?: string; status?: string; epicId?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    const query = params.toString() ? `?${params}` : '';
    const result = await request<any>(`/tasks${query}`, { method: 'GET' }, true);
    return result?.content || result || [];
  },

  async getById(id: string) {
    return request<Task>(`/tasks/${id}`, { method: 'GET' }, true);
  },

  async create(data: Partial<Task>) {
    return request<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }, true);
  },

  async update(id: string, data: Partial<Task>) {
    return request<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true);
  },

  async updateStatus(id: string, status: string) {
    return request<Task>(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }, true);
  },

  async delete(id: string) {
    return request<void>(`/tasks/${id}`, { method: 'DELETE' }, true);
  },

  async getBySprintId(sprintId: string) {
    return request<Task[]>(`/tasks/sprint/${sprintId}`, { method: 'GET' }, true);
  },

  async getBacklog() {
    return request<Task[]>('/tasks/backlog', { method: 'GET' }, true);
  },
};

// ============================================================
// EPIC API
// ============================================================
export interface Epic {
  id: string;
  title: string;
  description?: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  lifeWheelAreaId?: string;
  color?: string;
  icon?: string;
  progress: number;
  taskCount: number;
  completedTaskCount: number;
}

export const epicApi = {
  async getAll(status?: string) {
    const query = status ? `?status=${status}` : '';
    return request<Epic[]>(`/epics${query}`, { method: 'GET' }, true);
  },

  async getById(id: string) {
    return request<Epic>(`/epics/${id}`, { method: 'GET' }, true);
  },

  async create(data: Partial<Epic>) {
    return request<Epic>('/epics', { method: 'POST', body: JSON.stringify(data) }, true);
  },

  async update(id: string, data: Partial<Epic>) {
    return request<Epic>(`/epics/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true);
  },

  async delete(id: string) {
    return request<void>(`/epics/${id}`, { method: 'DELETE' }, true);
  },
};

// ============================================================
// SPRINT API
// ============================================================
export interface Sprint {
  id: string;
  name: string;
  number: number;
  startDate: string;
  endDate: string;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED';
  goal?: string;
  velocity?: number;
  plannedPoints: number;
  completedPoints: number;
}

export const sprintApi = {
  async getAll(year?: number) {
    const query = year ? `?year=${year}` : '';
    return request<Sprint[]>(`/sprints${query}`, { method: 'GET' }, true);
  },

  async getCurrent() {
    return request<Sprint>('/sprints/current', { method: 'GET' }, true);
  },

  async getUpcoming(limit = 4) {
    return request<Sprint[]>(`/sprints/upcoming?limit=${limit}`, { method: 'GET' }, true);
  },

  async getById(id: string) {
    return request<Sprint>(`/sprints/${id}`, { method: 'GET' }, true);
  },

  async activate(id: string) {
    return request<Sprint>(`/sprints/${id}/activate`, { method: 'POST' }, true);
  },
};

// ============================================================
// CHALLENGE API
// ============================================================
export interface Challenge {
  id: string;
  title: string;
  description?: string;
  type: 'STREAK' | 'COUNTER' | 'TIMER';
  targetValue: number;
  currentValue: number;
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'PAUSED';
  startDate: string;
  endDate?: string;
  currentStreak: number;
  longestStreak: number;
  lifeWheelAreaId?: string;
}

export const challengeApi = {
  async getAll(status?: string) {
    const query = status ? `?status=${status}` : '';
    return request<Challenge[]>(`/challenges${query}`, { method: 'GET' }, true);
  },

  async getActive() {
    return request<Challenge[]>('/challenges/active', { method: 'GET' }, true);
  },

  async getById(id: string) {
    return request<Challenge>(`/challenges/${id}`, { method: 'GET' }, true);
  },

  async create(data: Partial<Challenge>) {
    return request<Challenge>('/challenges', { method: 'POST', body: JSON.stringify(data) }, true);
  },

  async update(id: string, data: Partial<Challenge>) {
    return request<Challenge>(`/challenges/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true);
  },

  async delete(id: string) {
    return request<void>(`/challenges/${id}`, { method: 'DELETE' }, true);
  },

  async logEntry(challengeId: string, data: { value: number | boolean; note?: string; date: string }) {
    return request<any>(`/challenges/${challengeId}/entries`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  },

  async getTemplates(lifeWheelAreaId?: string) {
    const query = lifeWheelAreaId ? `?lifeWheelAreaId=${lifeWheelAreaId}` : '';
    return request<any[]>(`/challenges/templates${query}`, { method: 'GET' }, true);
  },
};

// ============================================================
// COMMUNITY API
// ============================================================
export interface CommunityMember {
  id: string;
  userId: string;
  displayName: string;
  avatar: string;
  bio?: string;
  level: number;
  levelTitle: string;
  reputationPoints: number;
  badges: string[];
  role: string;
  joinedAt: string;
  isOnline: boolean;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  author: { name: string; avatar: string };
  readTime: number;
  likeCount: number;
  commentCount: number;
  imageUrl?: string;
  isFeatured: boolean;
  createdAt: string;
}

export interface Story {
  id: string;
  title: string;
  story: string;
  category: string;
  author: CommunityMember;
  likeCount: number;
  celebrateCount: number;
  commentCount: number;
  metrics?: { label: string; value: string }[];
  createdAt: string;
}

export interface Question {
  id: string;
  title: string;
  body: string;
  tags: string[];
  author: CommunityMember;
  upvoteCount: number;
  answerCount: number;
  status: 'OPEN' | 'ANSWERED' | 'CLOSED';
  createdAt: string;
}

export const communityApi = {
  async getCurrentMember() {
    return request<CommunityMember>('/community/members/me', { method: 'GET' }, true);
  },

  async getMemberById(id: string) {
    return request<CommunityMember>(`/community/members/${id}`, { method: 'GET' }, true);
  },

  async getHome() {
    return request<any>('/community/home', { method: 'GET' }, true);
  },

  // Articles
  async getArticles(params?: { category?: string; page?: number; size?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    const query = queryParams.toString() ? `?${queryParams}` : '';
    return request<PaginatedResponse<Article>>(`/community/articles${query}`, { method: 'GET' }, true);
  },

  async getArticleById(id: string) {
    return request<Article>(`/community/articles/${id}`, { method: 'GET' }, true);
  },

  async getFeaturedArticle() {
    return request<Article>('/community/articles/featured', { method: 'GET' }, true);
  },

  async toggleArticleLike(id: string) {
    return request<{ liked: boolean; likeCount: number }>(`/community/articles/${id}/toggle-like`, { method: 'POST' }, true);
  },

  // Stories
  async getStories(params?: { category?: string; page?: number; size?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    const query = queryParams.toString() ? `?${queryParams}` : '';
    return request<PaginatedResponse<Story>>(`/community/stories${query}`, { method: 'GET' }, true);
  },

  async getStoryById(id: string) {
    return request<Story>(`/community/stories/${id}`, { method: 'GET' }, true);
  },

  async createStory(data: { title: string; story: string; category: string; lifeWheelAreaId?: string; metrics?: { label: string; value: string }[] }) {
    return request<Story>('/community/stories', { method: 'POST', body: JSON.stringify(data) }, true);
  },

  async toggleStoryLike(id: string) {
    return request<{ liked: boolean; likeCount: number }>(`/community/stories/${id}/toggle-like`, { method: 'POST' }, true);
  },

  // Questions
  async getQuestions(params?: { status?: string; tag?: string; page?: number; size?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.tag) queryParams.append('tag', params.tag);
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    const query = queryParams.toString() ? `?${queryParams}` : '';
    return request<PaginatedResponse<Question>>(`/community/questions${query}`, { method: 'GET' }, true);
  },

  async getQuestionById(id: string) {
    return request<Question>(`/community/questions/${id}`, { method: 'GET' }, true);
  },

  async createQuestion(data: { title: string; body: string; tags: string[] }) {
    return request<Question>('/community/questions', { method: 'POST', body: JSON.stringify(data) }, true);
  },

  async toggleQuestionUpvote(id: string) {
    return request<{ upvoted: boolean; upvoteCount: number }>(`/community/questions/${id}/toggle-upvote`, { method: 'POST' }, true);
  },

  // Leaderboard
  async getLeaderboard(period: 'weekly' | 'monthly' | 'all_time', category: string) {
    return request<any[]>(`/community/leaderboard?period=${period}&category=${category}`, { method: 'GET' }, true);
  },

  // Templates
  async getTemplates(params?: { type?: string; page?: number; size?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    const query = queryParams.toString() ? `?${queryParams}` : '';
    return request<PaginatedResponse<any>>(`/community/templates${query}`, { method: 'GET' }, true);
  },

  async getFeaturedTemplates() {
    return request<any[]>('/community/templates/featured', { method: 'GET' }, true);
  },

  // Activity
  async getActivityFeed(page = 0, size = 20) {
    return request<PaginatedResponse<any>>(`/community/activity?page=${page}&size=${size}`, { method: 'GET' }, true);
  },

  // Polls
  async getActivePoll() {
    return request<any>('/community/polls/active', { method: 'GET' }, true);
  },

  async votePoll(pollId: string, optionId: string) {
    return request<any>(`/community/polls/${pollId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ optionId }),
    }, true);
  },

  // Search
  async search(query: string, types?: string[]) {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    if (types?.length) queryParams.append('types', types.join(','));
    return request<any>(`/community/search?${queryParams}`, { method: 'GET' }, true);
  },

  // Wiki
  async getWikiEntries(category?: string) {
    const query = category ? `?category=${category}` : '';
    return request<any[]>(`/community/wiki${query}`, { method: 'GET' }, true);
  },

  async searchWiki(term: string) {
    return request<any[]>(`/community/wiki/search?q=${encodeURIComponent(term)}`, { method: 'GET' }, true);
  },

  // Release Notes
  async getReleaseNotes(page = 0, size = 10) {
    return request<PaginatedResponse<any>>(`/community/release-notes?page=${page}&size=${size}`, { method: 'GET' }, true);
  },
};

// ============================================================
// NOTIFICATION API
// ============================================================
export interface Notification {
  id: string;
  type: string;
  category: string;
  priority: string;
  title: string;
  content: string;
  isRead: boolean;
  readAt: string | null;
  isPinned: boolean;
  isArchived: boolean;
  icon: string;
  deepLink: string | null;
  createdAt: string;
}

export const notificationApi = {
  async getAll(page = 0, size = 20) {
    return request<PaginatedResponse<Notification>>(`/notifications?page=${page}&size=${size}`, { method: 'GET' }, true);
  },

  async getGrouped() {
    return request<{ today: Notification[]; yesterday: Notification[]; thisWeek: Notification[]; older: Notification[] }>('/notifications/grouped', { method: 'GET' }, true);
  },

  async getUnreadCount() {
    return request<{ total: number; byCategory: Record<string, number> }>('/notifications/unread-count', { method: 'GET' }, true);
  },

  async markAsRead(id: string) {
    return request<Notification>(`/notifications/${id}/read`, { method: 'PUT' }, true);
  },

  async markAllAsRead() {
    return request<void>('/notifications/read-all', { method: 'PUT' }, true);
  },

  async delete(id: string) {
    return request<void>(`/notifications/${id}`, { method: 'DELETE' }, true);
  },

  async getPreferences() {
    return request<any>('/notifications/preferences', { method: 'GET' }, true);
  },

  async updatePreferences(data: any) {
    return request<any>('/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true);
  },
};

// ============================================================
// ESSENTIA API
// ============================================================
export interface Book {
  id: string;
  title: string;
  author: string;
  summary: string;
  category: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  coverImageUrl: string;
  cardCount: number;
  readTime: number;
  rating: number;
  ratingCount: number;
}

export const essentiaApi = {
  async getAllBooks() {
    return request<Book[]>('/essentia/books', { method: 'GET' }, true);
  },

  async getBookById(id: string) {
    return request<Book>(`/essentia/books/${id}`, { method: 'GET' }, true);
  },

  async getBooksByCategory(category: string) {
    return request<Book[]>(`/essentia/books/category/${category}`, { method: 'GET' }, true);
  },

  async getPopularBooks() {
    return request<Book[]>('/essentia/books/popular', { method: 'GET' }, true);
  },

  async getTopRatedBooks() {
    return request<Book[]>('/essentia/books/top-rated', { method: 'GET' }, true);
  },

  async getUserProgress() {
    return request<any[]>('/essentia/progress', { method: 'GET' }, true);
  },

  async startBook(bookId: string) {
    return request<any>(`/essentia/books/${bookId}/start`, { method: 'POST' }, true);
  },

  async updateProgress(bookId: string, cardIndex: number) {
    return request<any>(`/essentia/books/${bookId}/progress?cardIndex=${cardIndex}`, { method: 'PUT' }, true);
  },

  async toggleFavorite(bookId: string) {
    return request<any>(`/essentia/books/${bookId}/toggle-favorite`, { method: 'POST' }, true);
  },
};

// ============================================================
// MINDSET API
// ============================================================
export const mindsetApi = {
  async getAllContent() {
    return request<any[]>('/mindset/content', { method: 'GET' }, true);
  },

  async getContentByDimension(dimensionTag: string) {
    return request<any[]>(`/mindset/content/dimension/${dimensionTag}`, { method: 'GET' }, true);
  },

  async getContentByTone(tone: string) {
    return request<any[]>(`/mindset/content/tone/${tone}`, { method: 'GET' }, true);
  },

  async getFavorites() {
    return request<any[]>('/mindset/content/favorites', { method: 'GET' }, true);
  },

  async toggleFavorite(id: string) {
    return request<any>(`/mindset/content/${id}/toggle-favorite`, { method: 'POST' }, true);
  },

  async getAllThemes() {
    return request<any[]>('/mindset/themes', { method: 'GET' }, true);
  },
};

// ============================================================
// SENSAI API
// ============================================================
export const sensaiApi = {
  async getVelocityMetrics() {
    return request<any>('/sensai/velocity/metrics', { method: 'GET' }, true);
  },

  async getCurrentSprintHealth() {
    return request<any>('/sensai/sprints/current/health', { method: 'GET' }, true);
  },

  async getTodayStandup() {
    return request<any>('/sensai/standup/today', { method: 'GET' }, true);
  },

  async completeStandup(data: any) {
    return request<any>('/sensai/standup/complete', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  },

  async getActiveInterventions() {
    return request<any[]>('/sensai/interventions/active', { method: 'GET' }, true);
  },

  async getLifeWheelMetrics() {
    return request<any>('/sensai/lifewheel/metrics', { method: 'GET' }, true);
  },

  async getSettings() {
    return request<any>('/sensai/settings', { method: 'GET' }, true);
  },

  async updateSettings(settings: any) {
    return request<any>('/sensai/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }, true);
  },

  async getAnalytics(period: string) {
    return request<any>(`/sensai/analytics?period=${period}`, { method: 'GET' }, true);
  },
};

// ============================================================
// TASK TEMPLATE API
// ============================================================
export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  storyPoints: number;
  lifeWheelAreaId?: string;
  eisenhowerQuadrant?: string;
  isGlobal: boolean;
  isFavorite: boolean;
  usageCount: number;
  averageRating: number;
  tags: string[];
}

export const taskTemplateApi = {
  async getAll() {
    return requestRaw<TaskTemplate[]>('/templates', { method: 'GET' }, true);
  },

  async getGlobal() {
    return requestRaw<TaskTemplate[]>('/templates/global', { method: 'GET' }, true);
  },

  async getUserTemplates() {
    return requestRaw<TaskTemplate[]>('/templates/user', { method: 'GET' }, true);
  },

  async getFavorites() {
    return requestRaw<TaskTemplate[]>('/templates/favorites', { method: 'GET' }, true);
  },

  async search(query: string) {
    return requestRaw<TaskTemplate[]>(`/templates/search?q=${encodeURIComponent(query)}`, { method: 'GET' }, true);
  },

  async getById(id: string) {
    return requestRaw<TaskTemplate>(`/templates/${id}`, { method: 'GET' }, true);
  },

  async create(data: Partial<TaskTemplate>) {
    return requestRaw<TaskTemplate>('/templates', { method: 'POST', body: JSON.stringify(data) }, true);
  },

  async update(id: string, data: Partial<TaskTemplate>) {
    return requestRaw<TaskTemplate>(`/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true);
  },

  async delete(id: string) {
    return requestRaw<void>(`/templates/${id}`, { method: 'DELETE' }, true);
  },

  async toggleFavorite(id: string) {
    return requestRaw<any>(`/templates/${id}/favorite`, { method: 'POST' }, true);
  },

  async rate(id: string, rating: number) {
    return requestRaw<any>(`/templates/${id}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating }),
    }, true);
  },

  async clone(id: string) {
    return requestRaw<TaskTemplate>(`/templates/${id}/clone`, { method: 'POST' }, true);
  },
};

// ============================================================
// ADMIN TEMPLATE TYPES
// ============================================================
export interface AdminTaskTemplate {
  id: string;
  name: string;
  description: string;
  type: 'TASK' | 'EVENT';
  creatorType: 'SYSTEM' | 'USER';
  userId: string | null;
  defaultStoryPoints: number;
  defaultLifeWheelAreaId: string | null;
  defaultEisenhowerQuadrantId: string | null;
  defaultDuration: number | null;
  defaultLocation: string | null;
  isAllDay: boolean;
  defaultAttendees: string[];
  isRecurring: boolean;
  recurrencePattern: {
    frequency: string;
    interval: number;
    endDate: string | null;
  } | null;
  suggestedSprint: 'CURRENT' | 'NEXT' | 'BACKLOG';
  rating: number;
  ratingCount: number;
  usageCount: number;
  icon: string;
  color: string;
  tags: string[];
  isFavorite: boolean;
  userRating: number | null;
  userTags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  type?: 'TASK' | 'EVENT';
  defaultStoryPoints?: number;
  defaultLifeWheelAreaId?: string;
  defaultEisenhowerQuadrantId?: string;
  defaultDuration?: number;
  defaultLocation?: string;
  isAllDay?: boolean;
  defaultAttendees?: string[];
  isRecurring?: boolean;
  recurrencePattern?: {
    frequency: string;
    interval: number;
    endDate?: string;
  };
  suggestedSprint?: 'CURRENT' | 'NEXT' | 'BACKLOG';
  icon?: string;
  color?: string;
  tags?: string[];
}

export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  type?: 'TASK' | 'EVENT';
  defaultStoryPoints?: number;
  defaultLifeWheelAreaId?: string;
  defaultEisenhowerQuadrantId?: string;
  defaultDuration?: number;
  defaultLocation?: string;
  isAllDay?: boolean;
  defaultAttendees?: string[];
  isRecurring?: boolean;
  recurrencePattern?: {
    frequency: string;
    interval: number;
    endDate?: string;
  };
  suggestedSprint?: 'CURRENT' | 'NEXT' | 'BACKLOG';
  icon?: string;
  color?: string;
  tags?: string[];
}

export interface BulkOperationResponse {
  totalRequested: number;
  successCount: number;
  failedCount: number;
  errors: { identifier: string; error: string }[];
  createdTemplates: AdminTaskTemplate[] | null;
}

export interface ArticleResponse {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  coverImageUrl: string;
  author: string;
  tags: string[];
  category: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt: string | null;
  featured: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArticleRequest {
  slug: string;
  title: string;
  summary?: string;
  content?: string;
  coverImageUrl?: string;
  author?: string;
  tags?: string[];
  category?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured?: boolean;
}

export interface UpdateArticleRequest {
  title?: string;
  summary?: string;
  content?: string;
  coverImageUrl?: string;
  author?: string;
  tags?: string[];
  category?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured?: boolean;
}

// ============================================================
// ADMIN API
// ============================================================
export const adminApi = {
  // Site Content
  async getAllSiteContent() {
    return request<any[]>('/admin/content/site', { method: 'GET' }, true);
  },

  async getSiteContent(key: string) {
    return request<any>(`/admin/content/site/${key}`, { method: 'GET' }, true);
  },

  async createSiteContent(data: any) {
    return request<any>('/admin/content/site', { method: 'POST', body: JSON.stringify(data) }, true);
  },

  async updateSiteContent(key: string, data: any) {
    return request<any>(`/admin/content/site/${key}`, { method: 'PUT', body: JSON.stringify(data) }, true);
  },

  // Features
  async getAllFeatures() {
    return request<any[]>('/admin/content/features', { method: 'GET' }, true);
  },

  async createFeature(data: any) {
    return request<any>('/admin/content/features', { method: 'POST', body: JSON.stringify(data) }, true);
  },

  async updateFeature(id: string, data: any) {
    return request<any>(`/admin/content/features/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true);
  },

  async deleteFeature(id: string) {
    return request<void>(`/admin/content/features/${id}`, { method: 'DELETE' }, true);
  },

  // Testimonials
  async getAllTestimonials() {
    return request<any[]>('/admin/content/testimonials', { method: 'GET' }, true);
  },

  async createTestimonial(data: any) {
    return request<any>('/admin/content/testimonials', { method: 'POST', body: JSON.stringify(data) }, true);
  },

  async updateTestimonial(id: string, data: any) {
    return request<any>(`/admin/content/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true);
  },

  async deleteTestimonial(id: string) {
    return request<void>(`/admin/content/testimonials/${id}`, { method: 'DELETE' }, true);
  },

  // FAQs
  async getAllFaqs() {
    return request<any[]>('/admin/content/faqs', { method: 'GET' }, true);
  },

  async createFaq(data: any) {
    return request<any>('/admin/content/faqs', { method: 'POST', body: JSON.stringify(data) }, true);
  },

  async updateFaq(id: string, data: any) {
    return request<any>(`/admin/content/faqs/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true);
  },

  async deleteFaq(id: string) {
    return request<void>(`/admin/content/faqs/${id}`, { method: 'DELETE' }, true);
  },

  // Pricing
  async getAllPricing() {
    return request<any[]>('/admin/content/pricing', { method: 'GET' }, true);
  },

  async createPricing(data: any) {
    return request<any>('/admin/content/pricing', { method: 'POST', body: JSON.stringify(data) }, true);
  },

  async updatePricing(id: string, data: any) {
    return request<any>(`/admin/content/pricing/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true);
  },

  async deletePricing(id: string) {
    return request<void>(`/admin/content/pricing/${id}`, { method: 'DELETE' }, true);
  },

  // Articles
  async getAllArticles() {
    return request<any[]>('/admin/content/articles', { method: 'GET' }, true);
  },

  async getArticleBySlug(slug: string) {
    return request<any>(`/admin/content/articles/${slug}`, { method: 'GET' }, true);
  },

  async createArticle(data: any) {
    return request<any>('/admin/content/articles', { method: 'POST', body: JSON.stringify(data) }, true);
  },

  async updateArticle(id: string, data: any) {
    return request<any>(`/admin/content/articles/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true);
  },

  async deleteArticle(id: string) {
    return request<void>(`/admin/content/articles/${id}`, { method: 'DELETE' }, true);
  },

  // Users Management (for CRM)
  async getAllUsers(params?: { page?: number; size?: number; subscriptionTier?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    if (params?.subscriptionTier) queryParams.append('subscriptionTier', params.subscriptionTier);
    const query = queryParams.toString() ? `?${queryParams}` : '';
    return request<PaginatedResponse<User>>(`/admin/users${query}`, { method: 'GET' }, true);
  },

  async getUserById(id: string) {
    return request<User>(`/admin/users/${id}`, { method: 'GET' }, true);
  },

  async updateUserTier(id: string, tier: string) {
    return request<User>(`/admin/users/${id}/tier`, {
      method: 'PATCH',
      body: JSON.stringify({ subscriptionTier: tier }),
    }, true);
  },

  // Global Templates Management
  async getGlobalTemplates(params?: { page?: number; size?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    const query = queryParams.toString() ? `?${queryParams}` : '';
    return adminRequest<AdminTaskTemplate[]>(`/admin/templates${query}`, { method: 'GET' });
  },

  async getGlobalTemplateById(id: string) {
    return adminRequest<AdminTaskTemplate>(`/admin/templates/${id}`, { method: 'GET' });
  },

  async createGlobalTemplate(data: CreateTemplateRequest) {
    return adminRequest<AdminTaskTemplate>('/admin/templates', { method: 'POST', body: JSON.stringify(data) });
  },

  async updateGlobalTemplate(id: string, data: UpdateTemplateRequest) {
    return adminRequest<AdminTaskTemplate>(`/admin/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  async deleteGlobalTemplate(id: string) {
    return adminRequest<void>(`/admin/templates/${id}`, { method: 'DELETE' });
  },

  async bulkCreateTemplates(templates: CreateTemplateRequest[]) {
    return adminRequest<BulkOperationResponse>('/admin/templates/bulk', {
      method: 'POST',
      body: JSON.stringify({ templates }),
    });
  },

  async bulkUpdateTemplates(templates: { id: string; data: UpdateTemplateRequest }[]) {
    return adminRequest<BulkOperationResponse>('/admin/templates/bulk', {
      method: 'PUT',
      body: JSON.stringify({ templates }),
    });
  },

  async bulkDeleteTemplates(ids: string[]) {
    return adminRequest<BulkOperationResponse>('/admin/templates/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    });
  },

  // Analytics
  async getRevenueStats(period: 'week' | 'month' | 'quarter' | 'year') {
    return request<any>(`/admin/analytics/revenue?period=${period}`, { method: 'GET' }, true);
  },

  async getSubscriberStats() {
    return request<any>('/admin/analytics/subscribers', { method: 'GET' }, true);
  },

  async getUsageStats(period: 'week' | 'month' | 'quarter' | 'year') {
    return request<any>(`/admin/analytics/usage?period=${period}`, { method: 'GET' }, true);
  },
};

// ============================================================
// CRM TYPES
// ============================================================
export interface Lead {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  company: string | null;
  jobTitle: string | null;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST' | 'NURTURING';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  lifecycleStage: 'SUBSCRIBER' | 'LEAD' | 'MARKETING_QUALIFIED' | 'SALES_QUALIFIED' | 'OPPORTUNITY' | 'CUSTOMER' | 'EVANGELIST';
  source: string | null;
  leadScore: number;
  assignedToName: string | null;
  lastActivityAt: string | null;
  createdAt: string;
  isConverted: boolean;
}

export interface LeadDetail extends Lead {
  assignedToId: string | null;
  notes: string | null;
  tags: string[];
  firstContactAt: string | null;
  convertedAt: string | null;
  recentActivities: LeadActivity[];
  pendingTasks: LeadTask[];
}

export interface LeadActivity {
  id: string;
  activityType: 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE' | 'TASK' | 'STATUS_CHANGE' | 'DEMO' | 'FOLLOW_UP' | 'OTHER';
  title: string;
  description: string | null;
  performedByName: string | null;
  performedAt: string;
}

export interface LeadTask {
  id: string;
  title: string;
  description: string | null;
  taskType: 'CALL' | 'EMAIL' | 'MEETING' | 'FOLLOW_UP' | 'DEMO' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedToName: string | null;
  dueDate: string | null;
  isCompleted: boolean;
}

export interface CrmStats {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  wonLeads: number;
  lostLeads: number;
  conversionsLast30Days: number;
  conversionRate: number;
  leadsBySource: Record<string, number>;
  leadsByStatus: Record<string, number>;
}

export interface CreateLeadRequest {
  email: string;
  fullName?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  source?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  notes?: string;
  tags?: string[];
  assignedToId?: string;
}

export interface UpdateLeadRequest {
  fullName?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  status?: Lead['status'];
  priority?: Lead['priority'];
  lifecycleStage?: Lead['lifecycleStage'];
  notes?: string;
  tags?: string[];
  assignedToId?: string;
}

// ============================================================
// CRM API
// ============================================================
export const crmApi = {
  // Leads CRUD
  async getLeads(params?: {
    page?: number;
    size?: number;
    status?: Lead['status'];
    source?: string;
    assignedTo?: string;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page !== undefined) searchParams.set('page', params.page.toString());
    if (params?.size !== undefined) searchParams.set('size', params.size.toString());
    if (params?.status) searchParams.set('status', params.status);
    if (params?.source) searchParams.set('source', params.source);
    if (params?.assignedTo) searchParams.set('assignedTo', params.assignedTo);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortDir) searchParams.set('sortDir', params.sortDir);
    const query = searchParams.toString();
    return adminRequest<{ data: Lead[]; meta: { page: number; size: number; total: number; totalPages: number } }>(
      `/admin/crm/leads${query ? `?${query}` : ''}`,
      { method: 'GET' }
    );
  },

  async searchLeads(query: string, page = 0, size = 20) {
    return adminRequest<{ data: Lead[]; meta: { page: number; size: number; total: number; totalPages: number } }>(
      `/admin/crm/leads/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`,
      { method: 'GET' }
    );
  },

  async getLeadById(id: string) {
    return adminRequest<{ data: LeadDetail }>(`/admin/crm/leads/${id}`, { method: 'GET' });
  },

  async createLead(data: CreateLeadRequest) {
    return adminRequest<{ data: Lead }>('/admin/crm/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateLead(id: string, data: UpdateLeadRequest) {
    return adminRequest<{ data: Lead }>(`/admin/crm/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteLead(id: string) {
    return adminRequest<void>(`/admin/crm/leads/${id}`, { method: 'DELETE' });
  },

  // Activities
  async addActivity(leadId: string, data: { activityType: LeadActivity['activityType']; title: string; description?: string }) {
    return adminRequest<{ data: LeadActivity }>(`/admin/crm/leads/${leadId}/activities`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Tasks
  async addTask(leadId: string, data: {
    title: string;
    description?: string;
    taskType?: LeadTask['taskType'];
    dueDate?: string;
    priority?: Lead['priority'];
  }) {
    return adminRequest<{ data: LeadTask }>(`/admin/crm/leads/${leadId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Conversion
  async convertLead(id: string, conversionValue?: number) {
    return adminRequest<{ data: Lead }>(`/admin/crm/leads/${id}/convert`, {
      method: 'POST',
      body: JSON.stringify({ conversionValue }),
    });
  },

  // Stats & Dashboard
  async getStats() {
    return adminRequest<{ data: CrmStats }>('/admin/crm/stats', { method: 'GET' });
  },

  async getRecentLeads() {
    return adminRequest<{ data: Lead[] }>('/admin/crm/leads/recent', { method: 'GET' });
  },

  async getHighPriorityLeads() {
    return adminRequest<{ data: Lead[] }>('/admin/crm/leads/high-priority', { method: 'GET' });
  },
};

// ============================================================
// FAMILY API
// ============================================================
export const familyApi = {
  async getMyFamily() {
    return request<any>('/families/me', { method: 'GET' }, true);
  },

  async createFamily(data: { name: string }) {
    return request<any>('/families', { method: 'POST', body: JSON.stringify(data) }, true);
  },

  async updateFamily(familyId: string, data: any) {
    return request<any>(`/families/${familyId}`, { method: 'PUT', body: JSON.stringify(data) }, true);
  },

  async joinFamily(inviteCode: string) {
    return request<any>('/families/join', {
      method: 'POST',
      body: JSON.stringify({ inviteCode }),
    }, true);
  },

  async leaveFamily() {
    return request<void>('/families/leave', { method: 'POST' }, true);
  },

  async getMembers(familyId: string) {
    return request<any[]>(`/families/${familyId}/members`, { method: 'GET' }, true);
  },

  async inviteMember(familyId: string, data: { email: string; role: string }) {
    return request<any>(`/families/${familyId}/members/invite`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  },

  async removeMember(familyId: string, memberId: string) {
    return request<void>(`/families/${familyId}/members/${memberId}`, { method: 'DELETE' }, true);
  },
};

// Export configuration
export const apiConfig = {
  baseUrl: API_BASE_URL,
  apiUrl: API_V1,
};
