/**
 * API Service — Domain APIs powered by the new Axios client (services/apiClient.ts).
 *
 * This file re-exports all domain API namespaces so existing imports continue to work.
 * Tokens are now stored in expo-secure-store, and 401 responses are handled by
 * the mutex-locked interceptor in apiClient.ts.
 */

import {
  api,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  apiGetRaw,
  ApiError,
  AuthExpiredError,
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
  getDeviceInfoString,
  API_V1,
} from './apiClient';

import { User } from '../types/models';
import type {
  MindsetContent as MindsetContentType,
  MindsetTheme as MindsetThemeType,
  ToggleFavoriteResponse as ToggleFavoriteResponseType,
} from '../types/models';
import { UserPreferences } from '../store/preferencesStore';
import { TaskTemplate, RecurrencePattern } from '../types/models';
import type {
  CommandCenterAIResponse,
  Draft,
  DraftType,
  DraftStatus,
} from '../types/commandCenter.types';
import type {
  FamilyRole,
  FamilySettings,
} from '../types/family.types';
import type {
  VelocityMetrics,
  SprintHealth,
  DailyStandup,
  Intervention,
  SprintCeremony,
  LifeWheelMetrics,
  CoachMessage,
  SensAISettings,
  IntakeResult,
  SensAIAnalytics,
  GetStandupResponse,
  CompleteStandupRequest,
  AcknowledgeInterventionRequest,
  ProcessIntakeRequest,
  RecoveryTask,
  SprintCeremonyType,
} from '../types/sensai.types';
import { logger } from '../utils/logger';

// ============================================================================
// Re-export error types & helpers for backward compat
// ============================================================================

export { ApiError, AuthExpiredError };
export type { API_V1 };

/** @deprecated — auth expiration is handled automatically by the Axios interceptor */
export function setOnAuthExpired(_cb: () => void): void { /* no-op */ }
/** @deprecated */
export function resetAuthExpirationFlag(): void { /* no-op */ }

// ============================================================================
// Shared DTO types
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
  deviceInfo?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  timezone?: string;
  deviceInfo?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  accountType: string;
  subscriptionTier: string;
  timezone: string;
  avatarUrl: string | null;
  emailVerified: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string | { code: string; message: string };
  timestamp?: string;
}

export interface RefreshTokenRequest { refreshToken: string; }
export interface TokenResponse { accessToken: string; refreshToken: string; }
export interface ForgotPasswordRequest { email: string; }
export interface ResetPasswordRequest { token: string; newPassword: string; }
export interface VerifyEmailRequest { code: string; }
export interface MessageResponse { message: string; }

// ============================================================================
// User mapper
// ============================================================================

function mapUserResponseToUser(response: UserResponse): User {
  return {
    id: response.id,
    email: response.email,
    fullName: response.fullName,
    accountType: response.accountType as User['accountType'],
    subscriptionTier: response.subscriptionTier as User['subscriptionTier'],
    timezone: response.timezone,
    avatarUrl: response.avatarUrl,
    createdAt: new Date().toISOString(),
  };
}

// ============================================================================
// AUTH API
// ============================================================================

export const authApi = {
  async register(data: RegisterRequest) {
    const deviceInfo = await getDeviceInfoString();
    const response = await apiPost<AuthResponse>('/auth/register', { ...data, deviceInfo });
    await saveTokens(response.accessToken, response.refreshToken);
    return { user: mapUserResponseToUser(response.user), accessToken: response.accessToken, refreshToken: response.refreshToken };
  },

  async login(email: string, password: string) {
    const deviceInfo = await getDeviceInfoString();
    const response = await apiPost<AuthResponse>('/auth/login', { email, password, deviceInfo });
    await saveTokens(response.accessToken, response.refreshToken);
    logger.auth('Tokens saved after login');
    return { user: mapUserResponseToUser(response.user), accessToken: response.accessToken, refreshToken: response.refreshToken };
  },

  async refreshToken(): Promise<TokenResponse> {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) throw new ApiError('No refresh token available', 401, 'NO_REFRESH_TOKEN');
    const response = await apiPost<TokenResponse>('/auth/refresh', { refreshToken });
    await saveTokens(response.accessToken, response.refreshToken);
    return response;
  },

  async logout(): Promise<void> {
    try { await apiPost<void>('/auth/logout'); } catch { /* ignore */ }
    await clearTokens();
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiGet<UserResponse>('/auth/me');
    return mapUserResponseToUser(response);
  },

  async forgotPassword(email: string): Promise<string> {
    const r = await apiPost<MessageResponse>('/auth/forgot-password', { email });
    return r.message;
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiPost<MessageResponse>('/auth/reset-password', { token, newPassword });
  },

  async sendVerificationCode(): Promise<string> {
    const r = await apiPost<MessageResponse>('/auth/verify-email/send');
    return r.message;
  },

  async verifyEmail(code: string): Promise<void> {
    await apiPost<MessageResponse>('/auth/verify-email', { code });
  },

  async hasValidSession(): Promise<boolean> {
    const token = await getAccessToken();
    return !!token;
  },

  getAccessToken,
  clearTokens,
};

// ============================================================================
// ONBOARDING API
// ============================================================================

export interface OnboardingRequest {
  firstName: string;
  lastName?: string;
  planType: 'INDIVIDUAL' | 'FAMILY' | 'CORPORATE';
  corporateCode?: string;
  familyRole?: string;
  selectedTaskTemplateIds: string[];
  selectedEpicTemplateIds?: string[];
  importantDates?: Array<{
    personName: string;
    relationship: string;
    dateType: string;
    date: string;
    year?: number;
    reminderDaysBefore?: number;
  }>;
  preferredWorkStyle?: string;
  weeklyCommitmentHours?: number;
  howDidYouHear?: string;
  mainGoal?: string;
}

export interface OnboardingResponse {
  tasksCreated: number;
  epicsCreated: number;
  eventsCreated: number;
  message: string;
  summary: {
    tasks: Array<{ id: string; title: string; storyPoints: number; sprintId: string; isRecurring: boolean }>;
    epics: Array<{ id: string; title: string; icon: string; taskCount: number }>;
    events: Array<{ id: string; personName: string; dateType: string; date: string }>;
    estimatedWeeklyPoints: number;
  };
}

export interface TaskTemplateCategory {
  id: string; name: string; icon: string; color: string; description: string;
  templates: Array<{
    id: string; title: string; description: string; storyPoints: number;
    lifeWheelAreaId: string; eisenhowerQuadrant: string; isRecurring: boolean;
    recurrencePattern?: { frequency: string; interval: number }; suggestedSprint: string;
  }>;
}

export interface EpicTemplate {
  id: string; title: string; description: string; icon: string; color: string;
  lifeWheelAreaId: string; taskTemplateIds: string[]; estimatedWeeks: number;
}

export const onboardingApi = {
  async completeOnboarding(data: OnboardingRequest): Promise<OnboardingResponse> {
    return apiPost<OnboardingResponse>('/onboarding/setup', data);
  },
  async getTaskTemplates(): Promise<{ categories: TaskTemplateCategory[] }> {
    return apiGet<{ categories: TaskTemplateCategory[] }>('/onboarding/templates/tasks');
  },
  async getEpicTemplates(): Promise<{ epics: EpicTemplate[] }> {
    return apiGet<{ epics: EpicTemplate[] }>('/onboarding/templates/epics');
  },
  async validateCorporateCode(code: string) {
    return apiPost<{ valid: boolean; companyName: string | null; message: string }>('/onboarding/validate-corporate-code', { code });
  },
  async savePreferences(_prefs: Partial<UserPreferences>): Promise<void> { /* handled by completeOnboarding */ },
};

// ============================================================================
// LIFE WHEEL API
// ============================================================================

export const lifeWheelApi = {
  async getLifeWheelAreas() { return apiGet<unknown[]>('/life-wheel-areas'); },
  async getEisenhowerQuadrants() { return apiGet<unknown[]>('/eisenhower-quadrants'); },
};

// ============================================================================
// SPRINT API
// ============================================================================

export const sprintApi = {
  async getSprints(year?: number) { return apiGet<unknown[]>(`/sprints${year ? `?year=${year}` : ''}`); },
  async getAll(year?: number) { return this.getSprints(year); },
  async getCurrentSprint() { return apiGet<unknown>('/sprints/current'); },
  async getUpcomingSprints(limit = 4) { return apiGet<unknown[]>(`/sprints/upcoming?limit=${limit}`); },
  async getSprintById(id: string) { return apiGet<unknown>(`/sprints/${id}`); },
  async activateSprint(id: string) { return apiPost<unknown>(`/sprints/${id}/activate`); },
};

// ============================================================================
// EPIC API
// ============================================================================

export const epicApi = {
  async getEpics(status?: string) { return apiGet<unknown[]>(`/epics${status ? `?status=${status}` : ''}`); },
  async getEpicById(id: string) { return apiGet<unknown>(`/epics/${id}`); },
  async createEpic(data: { title: string; description?: string; lifeWheelAreaId: string; targetSprintId?: string; color?: string; icon?: string }) {
    return apiPost<unknown>('/epics', data);
  },
  async updateEpic(id: string, data: Record<string, unknown>) { return apiPut<unknown>(`/epics/${id}`, data); },
  async deleteEpic(id: string) { return apiDelete(`/epics/${id}`); },
};

// ============================================================================
// TASK API
// ============================================================================

export const taskApi = {
  async getAll(filters?: { sprintId?: string; status?: string; epicId?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    const query = params.toString() ? `?${params.toString()}` : '';
    const result = await apiGet<{ content?: unknown[] }>(`/tasks${query}`);
    return (result as { content?: unknown[] })?.content ?? result ?? [];
  },
  async getTasksBySprint(sprintId: string) { return apiGet<unknown[]>(`/tasks/sprint/${sprintId}`); },
  async getTasksByEpic(epicId: string) { return apiGet<unknown[]>(`/tasks/epic/${epicId}`); },
  async getTasksByStatus(status: string) { return apiGet<unknown[]>(`/tasks/status/${status}`); },
  async getDraftTasks() { return apiGet<unknown[]>('/tasks/drafts'); },
  async getBacklogTasks() { return apiGet<unknown[]>('/tasks/backlog'); },
  async getTaskById(id: string) { return apiGet<unknown>(`/tasks/${id}`); },
  async createTask(data: Record<string, unknown>) { return apiPost<unknown>('/tasks', data); },
  async updateTask(id: string, data: Record<string, unknown>) { return apiPut<unknown>(`/tasks/${id}`, data); },
  async updateTaskStatus(id: string, status: string) { return apiPatch<unknown>(`/tasks/${id}/status`, { status }); },
  async deleteTask(id: string) { return apiDelete(`/tasks/${id}`); },
  async hardDeleteTask(id: string) { return apiDelete(`/tasks/${id}/permanent`); },
  async restoreTask(id: string) { return apiPatch<unknown>(`/tasks/${id}/restore`, {}); },
  async getDeletedTasks() { return apiGet<unknown[]>('/tasks/deleted'); },
  async getTaskHistory(id: string) { return apiGet<unknown[]>(`/tasks/${id}/history`); },
  async getTaskComments(id: string) { return apiGet<unknown[]>(`/tasks/${id}/comments`); },
  async addComment(taskId: string, data: { commentText: string; isAiGenerated?: boolean; attachments?: Array<{ filename: string; fileUrl: string; fileType: string; fileSize: number | null }> }) {
    return apiPost<unknown>(`/tasks/${taskId}/comments`, { commentText: data.commentText, isAiGenerated: data.isAiGenerated ?? false, attachments: data.attachments ?? null });
  },
  // Checklist API
  async getChecklistItems(taskId: string) { return apiGet<unknown[]>(`/tasks/${taskId}/checklist`); },
  async addChecklistItem(taskId: string, text: string) { return apiPost<unknown>(`/tasks/${taskId}/checklist`, { text }); },
  async toggleChecklistItem(taskId: string, itemId: string) { return apiPatch<unknown>(`/tasks/${taskId}/checklist/${itemId}/toggle`, {}); },
  async deleteChecklistItem(taskId: string, itemId: string) { return apiDelete(`/tasks/${taskId}/checklist/${itemId}`); },
};

// ============================================================================
// CHALLENGE API
// ============================================================================

export const challengeApi = {
  async getTemplates(lifeWheelAreaId?: string) { return apiGet<unknown[]>(`/challenges/templates${lifeWheelAreaId ? `?lifeWheelAreaId=${lifeWheelAreaId}` : ''}`); },
  async getTemplateById(id: string) { return apiGet<unknown>(`/challenges/templates/${id}`); },
  async getChallenges(status?: string) { return apiGet<unknown[]>(`/challenges${status ? `?status=${status}` : ''}`); },
  async getActiveChallenges() { return apiGet<unknown[]>('/challenges/active'); },
  async getChallengeById(id: string) { return apiGet<unknown>(`/challenges/${id}`); },
  async createChallenge(data: Record<string, unknown>) { return apiPost<unknown>('/challenges', data); },
  async updateChallenge(id: string, data: Record<string, unknown>) { return apiPut<unknown>(`/challenges/${id}`, data); },
  async deleteChallenge(id: string) { return apiDelete(`/challenges/${id}`); },
  async getEntries(challengeId: string) { return apiGet<unknown[]>(`/challenges/${challengeId}/entries`); },
  async logEntry(challengeId: string, data: { value: number | boolean; note?: string; date: string }) {
    return apiPost<unknown>(`/challenges/${challengeId}/entries`, data);
  },
  async inviteParticipant(challengeId: string, userId: string) {
    return apiPost<unknown>(`/challenges/${challengeId}/participants`, { userId });
  },
};

// ============================================================================
// NOTIFICATION TYPES & API
// ============================================================================

export interface NotificationResponse {
  id: string; type: string; category: string; priority: string;
  title: string; content: string; isRead: boolean; readAt: string | null;
  isPinned: boolean; isArchived: boolean; icon: string; deepLink: string | null;
  expiresAt: string | null;
  sender: { id: number | null; name: string | null; avatar: string | null } | null;
  metadata: Record<string, unknown> | null;
  actions: Array<{ id: string; label: string; action: string; style: string }> | null;
  createdAt: string;
}

export interface NotificationPageResponse {
  content: NotificationResponse[]; totalElements: number; totalPages: number;
  size: number; number: number; hasNext: boolean; hasPrevious: boolean;
}

export interface UnreadCountResponse { total: number; byCategory: Record<string, number>; }

export interface GroupedNotificationsResponse {
  today: NotificationResponse[]; yesterday: NotificationResponse[];
  thisWeek: NotificationResponse[]; older: NotificationResponse[];
}

export interface NotificationPreferencesResponse {
  pushEnabled: boolean; emailEnabled: boolean; inAppEnabled: boolean;
  soundEnabled: boolean; vibrationEnabled: boolean;
  quietHoursEnabled: boolean; quietHoursStart: string | null; quietHoursEnd: string | null;
  categorySettings: Record<string, { enabled: boolean; push: boolean; email: boolean; inApp: boolean }>;
}

export interface UpdatePreferencesRequest {
  pushEnabled?: boolean; emailEnabled?: boolean; inAppEnabled?: boolean;
  soundEnabled?: boolean; vibrationEnabled?: boolean;
  quietHoursEnabled?: boolean; quietHoursStart?: string; quietHoursEnd?: string;
  categorySettings?: Record<string, { enabled?: boolean; push?: boolean; email?: boolean; inApp?: boolean }>;
}

export const notificationApi = {
  async getNotifications(page = 0, size = 20) { return apiGet<NotificationPageResponse>(`/notifications?page=${page}&size=${size}`); },
  async getNotificationsByCategory(cat: string, page = 0, size = 20) { return apiGet<NotificationPageResponse>(`/notifications/category/${cat}?page=${page}&size=${size}`); },
  async getGroupedNotifications() { return apiGet<GroupedNotificationsResponse>('/notifications/grouped'); },
  async getArchivedNotifications(page = 0, size = 20) { return apiGet<NotificationPageResponse>(`/notifications/archived?page=${page}&size=${size}`); },
  async getPinnedNotifications(page = 0, size = 20) { return apiGet<NotificationPageResponse>(`/notifications/pinned?page=${page}&size=${size}`); },
  async getUnreadNotifications() { return apiGet<NotificationResponse[]>('/notifications/unread'); },
  async searchNotifications(q: string, page = 0, size = 20) { return apiGet<NotificationPageResponse>(`/notifications/search?query=${encodeURIComponent(q)}&page=${page}&size=${size}`); },
  async getUnreadCount() { return apiGet<UnreadCountResponse>('/notifications/unread-count'); },
  async markAsRead(id: string) { return apiPut<NotificationResponse>(`/notifications/${id}/read`); },
  async markAsUnread(id: string) { return apiPut<NotificationResponse>(`/notifications/${id}/unread`); },
  async markAllAsRead() { return apiPut<void>('/notifications/read-all'); },
  async markCategoryAsRead(cat: string) { return apiPut<void>(`/notifications/category/${cat}/read-all`); },
  async togglePinned(id: string) { return apiPut<NotificationResponse>(`/notifications/${id}/pin`); },
  async archiveNotification(id: string) { return apiPut<NotificationResponse>(`/notifications/${id}/archive`); },
  async unarchiveNotification(id: string) { return apiPut<NotificationResponse>(`/notifications/${id}/unarchive`); },
  async archiveAllRead() { return apiPut<void>('/notifications/archive-read'); },
  async deleteNotification(id: string) { return apiDelete(`/notifications/${id}`); },
  async getPreferences() { return apiGet<NotificationPreferencesResponse>('/notifications/preferences'); },
  async updatePreferences(data: UpdatePreferencesRequest) { return apiPut<NotificationPreferencesResponse>('/notifications/preferences', data); },
};

// ============================================================================
// TASK TEMPLATE API
// ============================================================================

export interface RatingResponse { templateId: string; averageRating: number; ratingCount: number; userRating: number; }
export interface FavoriteResponse { templateId: string; isFavorite: boolean; }
export interface TagsResponse { templateId: string; tags: string[]; }

export const taskTemplateApi = {
  async getAllTemplates() { return apiGetRaw<TaskTemplate[]>('/templates'); },
  async getGlobalTemplates() { return apiGetRaw<TaskTemplate[]>('/templates/global'); },
  async getGlobalTemplatesByArea(areaId: string) { return apiGetRaw<TaskTemplate[]>(`/templates/global/area/${areaId}`); },
  async getUserTemplates() { return apiGetRaw<TaskTemplate[]>('/templates/user'); },
  async getFavoriteTemplates() { return apiGetRaw<TaskTemplate[]>('/templates/favorites'); },
  async searchTemplates(query: string) { return apiGetRaw<TaskTemplate[]>(`/templates/search?q=${encodeURIComponent(query)}`); },
  async getTemplateById(id: string) { return apiGetRaw<TaskTemplate>(`/templates/${id}`); },
  async createTemplate(data: CreateTemplatePayload) { return apiPost<TaskTemplate>('/templates', data); },
  async updateTemplate(id: string, data: Partial<CreateTemplatePayload>) { return apiPut<TaskTemplate>(`/templates/${id}`, data); },
  async deleteTemplate(id: string) { return apiDelete(`/templates/${id}`); },
  async toggleFavorite(id: string) { return apiPost<FavoriteResponse>(`/templates/${id}/favorite`); },
  async rateTemplate(id: string, rating: number) { return apiPost<RatingResponse>(`/templates/${id}/rate`, { rating }); },
  async cloneTemplate(id: string) { return apiPost<TaskTemplate>(`/templates/${id}/clone`); },
  async useTemplate(id: string) { return apiPost<void>(`/templates/${id}/use`); },
  async addTag(id: string, tag: string) { return apiPost<TagsResponse>(`/templates/${id}/tags`, { tag }); },
  async removeTag(id: string, tag: string) { return apiDelete<TagsResponse>(`/templates/${id}/tags/${encodeURIComponent(tag)}`); },
};

interface CreateTemplatePayload {
  name: string; description: string; type: string;
  content: Record<string, unknown>; lifeWheelAreaId?: string; tags: string[];
}

// ============================================================================
// MINDSET API
// ============================================================================

export const mindsetApi = {
  async getFeed(weakDimensions?: string[]) {
    const params = weakDimensions?.length ? `?weakDimensions=${weakDimensions.join(',')}` : '';
    return apiGet<MindsetContentType[]>(`/mindset/content/feed${params}`);
  },
  async getAllContent(page = 0, size = 20) {
    return apiGet<MindsetContentType[]>(`/mindset/content?page=${page}&size=${size}`);
  },
  async getContentById(id: string) { return apiGet<MindsetContentType>(`/mindset/content/${id}`); },
  async getContentByDimension(areaId: string, page = 0, size = 20) {
    return apiGet<MindsetContentType[]>(`/mindset/content/dimension/${areaId}?page=${page}&size=${size}`);
  },
  async getFavorites(page = 0, size = 20) {
    return apiGet<MindsetContentType[]>(`/mindset/favorites?page=${page}&size=${size}`);
  },
  async toggleFavorite(id: string) { return apiPost<ToggleFavoriteResponseType>(`/mindset/content/${id}/favorite`); },
  async getAllThemes() { return apiGet<MindsetThemeType[]>('/mindset/themes'); },
  async getThemeById(id: string) { return apiGet<MindsetThemeType>(`/mindset/themes/${id}`); },
  async getThemeByName(name: string) { return apiGet<MindsetThemeType>(`/mindset/themes/name/${name}`); },
};

// ============================================================================
// ESSENTIA API
// ============================================================================

export const essentiaApi = {
  async getAllBooks() { return apiGet<unknown[]>('/essentia/books'); },
  async getBookById(id: string) { return apiGet<unknown>(`/essentia/books/${id}`); },
  async getBooksByCategory(cat: string) { return apiGet<unknown[]>(`/essentia/books/category/${cat}`); },
  async getBooksByDifficulty(d: string) { return apiGet<unknown[]>(`/essentia/books/difficulty/${d}`); },
  async getBooksByLifeWheelArea(id: string) { return apiGet<unknown[]>(`/essentia/books/life-wheel/${id}`); },
  async getTopRatedBooks() { return apiGet<unknown[]>('/essentia/books/top-rated'); },
  async getPopularBooks() { return apiGet<unknown[]>('/essentia/books/popular'); },
  async getAllCategories() { return apiGet<string[]>('/essentia/categories'); },
  async getUserProgress() { return apiGet<unknown[]>('/essentia/progress'); },
  async getProgressForBook(bookId: string) { return apiGet<unknown>(`/essentia/progress/${bookId}`); },
  async getCompletedBooks() { return apiGet<unknown[]>('/essentia/progress/completed'); },
  async getFavoriteBooks() { return apiGet<unknown[]>('/essentia/progress/favorites'); },
  async getInProgressBooks() { return apiGet<unknown[]>('/essentia/progress/in-progress'); },
  async startBook(bookId: string) { return apiPost<unknown>(`/essentia/books/${bookId}/start`); },
  async updateProgress(bookId: string, cardIndex: number) { return apiPut<unknown>(`/essentia/books/${bookId}/progress?cardIndex=${cardIndex}`); },
  async toggleFavorite(bookId: string) { return apiPost<unknown>(`/essentia/books/${bookId}/toggle-favorite`); },
};

// ============================================================================
// COMMAND CENTER API
// ============================================================================

export interface CommandInputAttachment { type: 'image' | 'file' | 'voice'; uri: string; name?: string; mimeType?: string; }

/** Shape used by chat screens for smart-input attachments */
export interface SmartInputAttachment {
  type: 'image' | 'audio' | 'pdf' | 'document';
  uri?: string;
  data?: string;
  mimeType: string;
  name: string;
  extractedText?: string;
  testAttachmentId?: string;
}

/** Pending approval task returned by GET /tasks/status/PENDING_APPROVAL */
export interface PendingApprovalTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  draftType?: string;
  lifeWheelAreaId?: string;
  eisenhowerQuadrantId?: string;
  storyPoints?: number;
  targetDate?: string;
  taskType?: string;
  aiConfidence?: number;
  aiReasoning?: string;
  createdAt: string;
  [key: string]: unknown;
}

/** Test attachment uploaded via admin panel */
export interface TestAttachmentItem {
  id: string;
  attachmentName: string;
  attachmentType: 'IMAGE' | 'PDF' | 'AUDIO' | 'VIDEO' | 'DOCUMENT';
  fileUrl?: string;
  hasFileData: boolean;
  mimeType: string;
  fileSizeBytes?: number;
  description?: string;
  useCase?: string;
  displayOrder: number;
  isActive: boolean;
}

/** Payload for creating a pending task directly from draft data */
export interface CreatePendingFromDraftPayload {
  draftType: string;
  title: string;
  description?: string;
  dueDate?: string;
  date?: string;
  priority?: string;
  storyPoints?: number;
  estimatedMinutes?: number;
  eisenhowerQuadrantId?: string;
  lifeWheelAreaId?: string;
  category?: string;
  isRecurring?: boolean;
  startTime?: string;
  endTime?: string;
  location?: string;
  isAllDay?: boolean;
  attendees?: string[];
}

function getFilenameFromUri(uri: string): string { return uri.split('/').pop() ?? 'attachment'; }

function getMimeTypeFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', heic: 'image/heic',
    m4a: 'audio/m4a', mp3: 'audio/mpeg', wav: 'audio/wav', aac: 'audio/aac',
    pdf: 'application/pdf', doc: 'application/msword', txt: 'text/plain',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  return map[ext ?? ''] ?? 'application/octet-stream';
}

export const commandCenterApi = {
  // ---- Chat / AI processing ------------------------------------------------

  /** Send text + JSON attachments via /command-center/smart-input */
  async sendMessage(
    text: string | null,
    attachments: SmartInputAttachment[],
    sessionId?: string,
  ): Promise<ApiResponse<CommandCenterAIResponse>> {
    try {
      const body: Record<string, unknown> = {};
      if (text?.trim()) body.text = text.trim();
      if (attachments.length > 0) body.attachments = attachments;
      if (sessionId) body.sessionId = sessionId;
      const res = await api.post('/command-center/smart-input', body);
      return res.data;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to send message';
      return { success: false, error: msg };
    }
  },

  /** Multipart upload for real files (enables OCR / transcription) via /command-center/process */
  async sendMessageWithFiles(
    text: string | null,
    files: Array<{ uri: string; name?: string; mimeType?: string }>,
    sessionId?: string,
  ): Promise<ApiResponse<CommandCenterAIResponse>> {
    const formData = new FormData();
    if (text?.trim()) formData.append('text', text.trim());
    if (sessionId) formData.append('sessionId', sessionId);
    for (const file of files) {
      const fn = file.name ?? getFilenameFromUri(file.uri);
      formData.append('attachments', { uri: file.uri, name: fn, type: file.mimeType ?? getMimeTypeFromFilename(fn) } as unknown as Blob);
    }
    try {
      const res = await api.post('/command-center/process', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      return res.data;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to process input with AI';
      return { success: false, error: msg };
    }
  },

  /** Alias kept for backward compat — delegates to sendMessageWithFiles */
  async processWithAI(text: string | null, attachments: CommandInputAttachment[]): Promise<ApiResponse<CommandCenterAIResponse>> {
    return this.sendMessageWithFiles(text, attachments);
  },

  // ---- Draft actions --------------------------------------------------------

  async approveDraft(draftId: string): Promise<ApiResponse<{ createdEntityId: string }>> {
    try {
      const res = await api.post(`/command-center/drafts/${draftId}/action`, { draftId, action: 'APPROVE', modifiedDraft: null });
      return res.data;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to approve draft';
      return { success: false, error: msg };
    }
  },

  async rejectDraft(draftId: string): Promise<ApiResponse<void>> {
    try {
      const res = await api.post(`/command-center/drafts/${draftId}/action`, { draftId, action: 'REJECT', modifiedDraft: null });
      return res.data;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to reject draft';
      return { success: false, error: msg };
    }
  },

  async getPendingDrafts(): Promise<ApiResponse<CommandCenterAIResponse[]>> {
    try {
      const res = await api.get('/command-center/drafts/pending');
      return res.data;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch pending drafts';
      return { success: false, error: msg };
    }
  },

  /** Create a pending-approval task directly from draft data (no session needed) */
  async createPendingFromDraft(data: CreatePendingFromDraftPayload): Promise<ApiResponse<{ taskId: string }>> {
    try {
      const res = await api.post('/command-center/drafts/create-pending', data);
      return res.data;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to create pending task from draft';
      return { success: false, error: msg };
    }
  },

  // ---- Pending approval tasks -----------------------------------------------

  /** Fetch tasks with PENDING_APPROVAL status */
  async getPendingApprovalTasks(): Promise<ApiResponse<PendingApprovalTask[]>> {
    try {
      const res = await api.get('/tasks/status/PENDING_APPROVAL');
      return res.data;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch pending approval tasks';
      return { success: false, error: msg };
    }
  },

  /** Reject (delete) a pending-approval task */
  async rejectPendingTask(taskId: string): Promise<ApiResponse<void>> {
    try {
      const res = await api.delete(`/tasks/${taskId}`);
      return { success: true, data: res.data };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to reject pending task';
      return { success: false, error: msg };
    }
  },

  // ---- Test attachments (admin-uploaded) -------------------------------------

  /** Fetch test attachments, optionally filtered by type */
  async getTestAttachments(type?: string): Promise<ApiResponse<TestAttachmentItem[]>> {
    try {
      const query = type ? `?type=${type}` : '';
      const res = await api.get(`/command-center/test-attachments${query}`);
      return res.data;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch test attachments';
      return { success: false, error: msg };
    }
  },
};

// ============================================================================
// FILE UPLOAD API
// ============================================================================

export interface FileUploadResult { filename: string; fileUrl: string; fileType: string; fileSize: number; }

export const fileUploadApi = {
  async uploadFile(file: { uri: string; name?: string; mimeType?: string }): Promise<ApiResponse<FileUploadResult>> {
    const formData = new FormData();
    const fn = file.name ?? getFilenameFromUri(file.uri);
    formData.append('file', { uri: file.uri, name: fn, type: file.mimeType ?? getMimeTypeFromFilename(fn) } as unknown as Blob);
    try {
      const res = await api.post('/files/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      return res.data;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to upload file';
      return { success: false, error: msg };
    }
  },

  async uploadMultipleFiles(files: Array<{ uri: string; name?: string; mimeType?: string }>): Promise<ApiResponse<FileUploadResult[]>> {
    const formData = new FormData();
    for (const f of files) {
      const fn = f.name ?? getFilenameFromUri(f.uri);
      formData.append('files', { uri: f.uri, name: fn, type: f.mimeType ?? getMimeTypeFromFilename(fn) } as unknown as Blob);
    }
    try {
      const res = await api.post('/files/upload-multiple', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      return res.data;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to upload files';
      return { success: false, error: msg };
    }
  },

  async deleteFile(fileUrl: string): Promise<ApiResponse<{ deleted: boolean }>> {
    try {
      const res = await api.delete(`/files/delete?fileUrl=${encodeURIComponent(fileUrl)}`);
      return res.data;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to delete file';
      return { success: false, error: msg };
    }
  },
};

// ============================================================================
// AI API (local parsing placeholder)
// ============================================================================

export const aiApi = {
  async parseInput(input: { type: 'text' | 'image' | 'voice' | 'file'; content: string; source?: string; fileName?: string }) {
    let detectedType = 'task';
    const lc = input.content.toLowerCase();
    if (lc.includes('challenge') || lc.includes('streak') || lc.includes('habit')) detectedType = 'challenge';
    else if (lc.includes('event') || lc.includes('meeting') || lc.includes('appointment')) detectedType = 'event';

    let title = '';
    let description = '';
    switch (input.type) {
      case 'text':
        title = input.content.slice(0, 50).replace(/^(add|create|new)\s+(a\s+)?(task|challenge|event)?\s*/i, '');
        title = title.charAt(0).toUpperCase() + title.slice(1);
        description = input.content.length > 50 ? input.content : '';
        break;
      case 'image':
        title = `Task from ${input.source === 'camera' ? 'photo' : 'image'}`;
        description = 'Created from image input. Please update details.';
        break;
      case 'file':
        title = `Task from ${input.fileName ?? 'document'}`;
        description = `Created from file: ${input.fileName}. Please update details.`;
        break;
      case 'voice':
        title = input.content.slice(0, 50);
        description = input.content.length > 50 ? input.content : '';
        break;
    }
    return { success: true, detectedType, confidence: 0.85, parsedData: { title, description, suggestedPriority: 'medium', suggestedDueDate: new Date(Date.now() + 7 * 86400000).toISOString() } };
  },
};

// ============================================================================
// COMMUNITY API
// ============================================================================

export interface CommunityMemberResponse {
  id: string; userId: string; displayName: string; avatar: string; bio?: string;
  level: number; levelTitle: string; reputationPoints: number; badges: string[];
  role: string; joinedAt: string; isOnline: boolean; sprintsCompleted: number;
  helpfulAnswers: number; templatesShared: number; currentStreak: number;
  showActivity: boolean; acceptPartnerRequests: boolean;
}
export interface CommunityHomeResponse { currentMember: CommunityMemberResponse; featuredArticle: unknown; activePoll: unknown; weeklyChallenge: unknown; recentActivity: unknown[]; topContributors: unknown[]; }
export interface PaginatedResponse<T> { content: T[]; totalElements: number; totalPages: number; page: number; size: number; hasNext: boolean; hasPrevious: boolean; }
export interface CreateQuestionRequest { title: string; body: string; tags: string[]; }
export interface CreateAnswerRequest { body: string; }
export interface CreateStoryRequest { title: string; story: string; category: string; lifeWheelAreaId?: string; metrics?: Array<{ label: string; value: string }>; imageUrls?: string[]; }
export interface CreateTemplateRequest { name: string; description: string; type: string; content: Record<string, unknown>; lifeWheelAreaId?: string; tags: string[]; }
export interface PartnerRequestPayload { toUserId: string; message?: string; }
export interface CreateGroupRequest { name: string; description: string; lifeWheelAreaId?: string; isPrivate: boolean; maxMembers: number; tags: string[]; }
export interface FeatureRequestPayload { title: string; description: string; }
export interface SendComplimentRequest { toUserId: string; message: string; category: string; }

export const communityApi = {
  // Member
  async getCurrentMember() { return apiGet<CommunityMemberResponse>('/community/members/me'); },
  async getMemberById(id: string) { return apiGet<CommunityMemberResponse>(`/community/members/${id}`); },
  async updateProfile(data: Partial<{ displayName: string; avatar: string; bio: string; showActivity: boolean; acceptPartnerRequests: boolean }>) { return apiPatch<CommunityMemberResponse>('/community/members/me', data); },
  async getCommunityHome() { return apiGet<CommunityHomeResponse>('/community/home'); },
  // Knowledge Hub
  async getKnowledgeCategories() { return apiGet<unknown[]>('/public/knowledge/categories'); },
  async getKnowledgeItems(params?: { search?: string; categoryId?: string }) { const q = new URLSearchParams(); if (params?.search) q.append('search', params.search); if (params?.categoryId) q.append('categoryId', params.categoryId); return apiGet<unknown[]>(`/public/knowledge/items${q.toString() ? '?' + q : ''}`); },
  async getFeaturedKnowledgeItems() { return apiGet<unknown[]>('/public/knowledge/items/featured'); },
  async getKnowledgeItemBySlug(slug: string) { return apiGet<unknown>(`/public/knowledge/items/${slug}`); },
  async recordKnowledgeItemView(id: string) { return apiPost<void>(`/public/knowledge/items/${id}/view`); },
  async markKnowledgeItemHelpful(id: string) { return apiPost<void>(`/public/knowledge/items/${id}/helpful`); },
  // Articles
  async getArticles(params?: { category?: string; page?: number; size?: number }) { const q = new URLSearchParams(); if (params?.category) q.append('category', params.category.toUpperCase()); if (params?.page !== undefined) q.append('page', params.page.toString()); if (params?.size) q.append('size', params.size.toString()); return apiGet<PaginatedResponse<unknown>>(`/community/articles${q.toString() ? '?' + q : ''}`); },
  async getFeaturedArticle() { return apiGet<unknown>('/community/articles/featured'); },
  async getArticleById(id: string) { return apiGet<unknown>(`/community/articles/${id}`); },
  async toggleArticleLike(id: string) { return apiPost<{ liked: boolean; likeCount: number }>(`/community/articles/${id}/toggle-like`); },
  async toggleArticleBookmark(id: string) { return apiPost<{ bookmarked: boolean }>(`/community/articles/${id}/toggle-bookmark`); },
  // Release notes / Wiki
  async getReleaseNotes(page = 0, size = 10) { return apiGet<PaginatedResponse<unknown>>(`/community/release-notes?page=${page}&size=${size}`); },
  async getWikiEntries(cat?: string) { return apiGet<unknown[]>(`/community/wiki${cat ? `?category=${cat}` : ''}`); },
  async searchWiki(term: string) { return apiGet<unknown[]>(`/community/wiki/search?q=${encodeURIComponent(term)}`); },
  // Q&A
  async getQuestions(params?: { status?: string; tag?: string; page?: number; size?: number }) { const q = new URLSearchParams(); if (params?.status) q.append('status', params.status); if (params?.tag) q.append('tag', params.tag); if (params?.page !== undefined) q.append('page', params.page.toString()); if (params?.size) q.append('size', params.size.toString()); return apiGet<PaginatedResponse<unknown>>(`/community/questions${q.toString() ? '?' + q : ''}`); },
  async getQuestionById(id: string) { return apiGet<unknown>(`/community/questions/${id}`); },
  async getAnswers(questionId: string) { return apiGet<unknown[]>(`/community/questions/${questionId}/answers`); },
  async createQuestion(data: CreateQuestionRequest) { return apiPost<unknown>('/community/questions', data); },
  async updateQuestion(id: string, data: Partial<CreateQuestionRequest>) { return apiPut<unknown>(`/community/questions/${id}`, data); },
  async deleteQuestion(id: string) { return apiDelete(`/community/questions/${id}`); },
  async toggleQuestionUpvote(id: string) { return apiPost<{ upvoted: boolean; upvoteCount: number }>(`/community/questions/${id}/toggle-upvote`); },
  async createAnswer(questionId: string, data: CreateAnswerRequest) { return apiPost<unknown>(`/community/questions/${questionId}/answers`, data); },
  async toggleAnswerUpvote(id: string) { return apiPost<{ upvoted: boolean; upvoteCount: number }>(`/community/answers/${id}/toggle-upvote`); },
  async acceptAnswer(questionId: string, answerId: string) { return apiPost<void>(`/community/questions/${questionId}/accept/${answerId}`); },
  // Stories
  async getStories(params?: { category?: string; lifeWheelAreaId?: string; page?: number; size?: number }) { const q = new URLSearchParams(); if (params?.category) q.append('category', params.category); if (params?.lifeWheelAreaId) q.append('lifeWheelAreaId', params.lifeWheelAreaId); if (params?.page !== undefined) q.append('page', params.page.toString()); if (params?.size) q.append('size', params.size.toString()); return apiGet<PaginatedResponse<unknown>>(`/community/stories${q.toString() ? '?' + q : ''}`); },
  async getStoryById(id: string) { return apiGet<unknown>(`/community/stories/${id}`); },
  async createStory(data: CreateStoryRequest) { return apiPost<unknown>('/community/stories', data); },
  async updateStory(id: string, data: Partial<CreateStoryRequest>) { return apiPut<unknown>(`/community/stories/${id}`, data); },
  async deleteStory(id: string) { return apiDelete(`/community/stories/${id}`); },
  async toggleStoryLike(id: string) { return apiPost<{ liked: boolean; likeCount: number }>(`/community/stories/${id}/toggle-like`); },
  async toggleStoryCelebrate(id: string) { return apiPost<{ celebrated: boolean; celebrateCount: number }>(`/community/stories/${id}/toggle-celebrate`); },
  async getStoryComments(storyId: string) { return apiGet<unknown[]>(`/community/stories/${storyId}/comments`); },
  async addStoryComment(storyId: string, text: string) { return apiPost<unknown>(`/community/stories/${storyId}/comments`, { text }); },
  // Templates
  async getTemplates(params?: { type?: string; lifeWheelAreaId?: string; page?: number; size?: number }) { const q = new URLSearchParams(); if (params?.type) q.append('type', params.type); if (params?.lifeWheelAreaId) q.append('lifeWheelAreaId', params.lifeWheelAreaId); if (params?.page !== undefined) q.append('page', params.page.toString()); if (params?.size) q.append('size', params.size.toString()); return apiGet<PaginatedResponse<unknown>>(`/community/templates${q.toString() ? '?' + q : ''}`); },
  async getFeaturedTemplates() { return apiGet<unknown[]>('/community/templates/featured'); },
  async getTemplateById(id: string) { return apiGet<unknown>(`/community/templates/${id}`); },
  async createTemplate(data: CreateTemplateRequest) { return apiPost<unknown>('/community/templates', data); },
  async updateTemplate(id: string, data: Partial<CreateTemplateRequest>) { return apiPut<unknown>(`/community/templates/${id}`, data); },
  async deleteTemplate(id: string) { return apiDelete(`/community/templates/${id}`); },
  async downloadTemplate(id: string) { return apiPost<unknown>(`/community/templates/${id}/download`); },
  async rateTemplate(id: string, rating: number) { return apiPost<{ rating: number; ratingCount: number }>(`/community/templates/${id}/rate`, { rating }); },
  async toggleTemplateBookmark(id: string) { return apiPost<{ bookmarked: boolean }>(`/community/templates/${id}/toggle-bookmark`); },
  async getTemplateReviews(templateId: string) { return apiGet<unknown[]>(`/community/templates/${templateId}/reviews`); },
  // Leaderboard
  async getLeaderboard(period: string, category: string) { return apiGet<unknown[]>(`/community/leaderboard?period=${period}&category=${category}`); },
  async getUserRank(period: string, category: string) { return apiGet<unknown>(`/community/leaderboard/me?period=${period}&category=${category}`); },
  // Partners
  async getPartners() { return apiGet<unknown[]>('/community/partners'); },
  async getPartnerById(id: string) { return apiGet<unknown>(`/community/partners/${id}`); },
  async getPartnerRequests() { return apiGet<unknown[]>('/community/partners/requests'); },
  async getSentPartnerRequests() { return apiGet<unknown[]>('/community/partners/requests/sent'); },
  async sendPartnerRequest(data: PartnerRequestPayload) { return apiPost<unknown>('/community/partners/requests', data); },
  async respondToPartnerRequest(requestId: string, accept: boolean) { return apiPost<void>(`/community/partners/requests/${requestId}/${accept ? 'accept' : 'decline'}`); },
  async removePartner(partnerId: string) { return apiDelete(`/community/partners/${partnerId}`); },
  async checkInWithPartner(partnerId: string, message?: string) { return apiPost<unknown>(`/community/partners/${partnerId}/check-in`, { message }); },
  // Groups
  async getGroups(params?: { lifeWheelAreaId?: string; joined?: boolean; page?: number; size?: number }) { const q = new URLSearchParams(); if (params?.lifeWheelAreaId) q.append('lifeWheelAreaId', params.lifeWheelAreaId); if (params?.joined !== undefined) q.append('joined', String(params.joined)); if (params?.page !== undefined) q.append('page', params.page.toString()); if (params?.size) q.append('size', params.size.toString()); return apiGet<PaginatedResponse<unknown>>(`/community/groups${q.toString() ? '?' + q : ''}`); },
  async getGroupById(id: string) { return apiGet<unknown>(`/community/groups/${id}`); },
  async createGroup(data: CreateGroupRequest) { return apiPost<unknown>('/community/groups', data); },
  async updateGroup(id: string, data: Partial<CreateGroupRequest>) { return apiPut<unknown>(`/community/groups/${id}`, data); },
  async deleteGroup(id: string) { return apiDelete(`/community/groups/${id}`); },
  async joinGroup(id: string) { return apiPost<void>(`/community/groups/${id}/join`); },
  async leaveGroup(id: string) { return apiPost<void>(`/community/groups/${id}/leave`); },
  async getGroupMembers(groupId: string) { return apiGet<unknown[]>(`/community/groups/${groupId}/members`); },
  // Activity
  async getActivityFeed(page = 0, size = 20) { return apiGet<PaginatedResponse<unknown>>(`/community/activity?page=${page}&size=${size}`); },
  async celebrateActivity(activityId: string) { return apiPost<{ celebrateCount: number }>(`/community/activity/${activityId}/celebrate`); },
  // Polls
  async getActivePoll() { return apiGet<unknown>('/community/polls/active'); },
  async votePoll(pollId: string, optionId: string) { return apiPost<unknown>(`/community/polls/${pollId}/vote`, { optionId }); },
  async getPollResults(pollId: string) { return apiGet<unknown>(`/community/polls/${pollId}/results`); },
  async getWeeklyChallenge() { return apiGet<unknown>('/community/weekly-challenge'); },
  async joinWeeklyChallenge(challengeId: string) { return apiPost<void>(`/community/weekly-challenge/${challengeId}/join`); },
  async submitWeeklyChallengeProgress(challengeId: string, progress: number) { return apiPost<unknown>(`/community/weekly-challenge/${challengeId}/progress`, { progress }); },
  // Badges
  async getAllBadges() { return apiGet<unknown[]>('/community/badges'); },
  async getUserBadges() { return apiGet<unknown[]>('/community/badges/me'); },
  // Compliments
  async sendCompliment(data: SendComplimentRequest) { return apiPost<void>('/community/compliments', data); },
  async getReceivedCompliments() { return apiGet<unknown[]>('/community/compliments/received'); },
  async markComplimentAsRead(id: string) { return apiPost<void>(`/community/compliments/${id}/read`); },
  async sendKudos(data: SendComplimentRequest) { return apiPost<unknown>('/community/kudos', data); },
  async getKudosFeed(page = 0, size = 20) { return apiGet<PaginatedResponse<unknown>>(`/community/kudos?page=${page}&size=${size}`); },
  async likeKudos(id: string) { return apiPost<{ likeCount: number }>(`/community/kudos/${id}/like`); },
  // Feature Requests
  async getFeatureRequests(params?: { status?: string; page?: number; size?: number }) { const q = new URLSearchParams(); if (params?.status) q.append('status', params.status); if (params?.page !== undefined) q.append('page', params.page.toString()); if (params?.size) q.append('size', params.size.toString()); return apiGet<PaginatedResponse<unknown>>(`/community/feature-requests${q.toString() ? '?' + q : ''}`); },
  async getFeatureRequestById(id: string) { return apiGet<unknown>(`/community/feature-requests/${id}`); },
  async submitFeatureRequest(data: FeatureRequestPayload) { return apiPost<unknown>('/community/feature-requests', data); },
  async toggleFeatureRequestUpvote(id: string) { return apiPost<{ upvoted: boolean; upvoteCount: number }>(`/community/feature-requests/${id}/toggle-upvote`); },
  async addFeatureRequestComment(id: string, text: string) { return apiPost<unknown>(`/community/feature-requests/${id}/comments`, { text }); },
  async submitBugReport(data: { title: string; description: string; stepsToReproduce?: string; severity: string }) { return apiPost<unknown>('/community/bug-reports', data); },
  // Search
  async search(query: string, types?: string[]) { const q = new URLSearchParams(); q.append('q', query); if (types?.length) q.append('types', types.join(',')); return apiGet<unknown>(`/community/search?${q}`); },
  async getPopularTags() { return apiGet<string[]>('/community/tags/popular'); },
};

// ============================================================================
// FAMILY API
// ============================================================================

export interface FamilyResponse { id: string; name: string; ownerId: string; ownerName: string; inviteCode: string; inviteCodeExpiresAt: string; settings: FamilySettings; members: FamilyMemberResponse[]; memberCount: number; createdAt: string; updatedAt: string; }
export interface FamilyMemberResponse { id: string; userId: string; displayName: string; email: string; avatarUrl: string | null; role: FamilyRole; joinedAt: string; isActive: boolean; lastActiveAt: string | null; tasksCompleted: number; currentStreak: number; }
export interface FamilyMembershipResponse { familyId: string; familyName: string; memberId: string; role: FamilyRole; isOwner: boolean; joinedAt: string; permissions: string[]; }
export interface FamilyInviteResponse { id: string; email: string; suggestedRole: FamilyRole; invitedByName: string; status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'; expiresAt: string; createdAt: string; }
export interface CreateFamilyRequest { name: string; settings?: Partial<FamilySettings>; }
export interface UpdateFamilyRequest { name?: string; settings?: Partial<FamilySettings>; }
export interface InviteMemberRequest { email: string; role: FamilyRole; }
export interface JoinFamilyRequest { inviteCode: string; }

export const familyApi = {
  async createFamily(data: CreateFamilyRequest) { return apiPost<FamilyResponse>('/families', data); },
  async getMyFamily() { return apiGet<FamilyResponse>('/families/me'); },
  async getMyMembership() { return apiGet<FamilyMembershipResponse>('/families/me/membership'); },
  async getFamily(familyId: string) { return apiGet<FamilyResponse>(`/families/${familyId}`); },
  async updateFamily(familyId: string, data: UpdateFamilyRequest) { return apiPut<FamilyResponse>(`/families/${familyId}`, data); },
  async deleteFamily(familyId: string) { return apiDelete(`/families/${familyId}`); },
  async regenerateInviteCode(familyId: string) { return apiPost<string>(`/families/${familyId}/invite-code/regenerate`); },
  async joinFamily(data: JoinFamilyRequest) { return apiPost<FamilyMembershipResponse>('/families/join', data); },
  async leaveFamily() { return apiPost<void>('/families/leave'); },
  async getMembers(familyId: string) { return apiGet<FamilyMemberResponse[]>(`/families/${familyId}/members`); },
  async inviteMember(familyId: string, data: InviteMemberRequest) { return apiPost<FamilyInviteResponse>(`/families/${familyId}/members/invite`, data); },
  async updateMemberRole(familyId: string, memberId: string, role: FamilyRole) { return apiPut<FamilyMemberResponse>(`/families/${familyId}/members/${memberId}/role`, { role }); },
  async removeMember(familyId: string, memberId: string) { return apiDelete(`/families/${familyId}/members/${memberId}`); },
  async getPendingInvites(familyId: string) { return apiGet<FamilyInviteResponse[]>(`/families/${familyId}/members/invites`); },
  async cancelInvite(familyId: string, inviteId: string) { return apiDelete(`/families/${familyId}/members/invites/${inviteId}`); },
};

// ============================================================================
// SENSAI API
// ============================================================================

export const sensaiApi = {
  async getVelocityMetrics() { return apiGet<VelocityMetrics>('/sensai/velocity/metrics'); },
  async getSprintHealth(sprintId: string) { return apiGet<SprintHealth>(`/sensai/velocity/sprint-health/${sprintId}`); },
  async getCurrentSprintHealth() { return apiGet<SprintHealth>('/sensai/sprints/current/health'); },
  async getAdjustedCapacity() { return apiGet<{ baseVelocity: number; adjustedCapacity: number; blockedHours: number }>('/sensai/capacity/adjusted'); },
  async getTodayStandup() { return apiGet<GetStandupResponse>('/sensai/standup/today'); },
  async completeStandup(data: CompleteStandupRequest) { return apiPost<DailyStandup>('/sensai/standup/complete', data); },
  async skipStandup(reason?: string) { return apiPost<void>('/sensai/standup/skip', { reason }); },
  async getStandupHistory(startDate: string, endDate: string) { return apiGet<DailyStandup[]>(`/sensai/standup/history?startDate=${startDate}&endDate=${endDate}`); },
  async convertBlockerToTask(blockerId: string) { return apiPost<{ taskId: string }>(`/sensai/standups/blockers/${blockerId}/convert`); },
  async getActiveInterventions() { return apiGet<Intervention[]>('/sensai/interventions/active'); },
  async getInterventionHistory(page = 0, size = 20) { return apiGet<Intervention[]>(`/sensai/interventions/history?page=${page}&size=${size}`); },
  async acknowledgeIntervention(data: AcknowledgeInterventionRequest) { return apiPost<void>(`/sensai/interventions/${data.interventionId}/acknowledge`, { action: data.action, overrideReason: data.overrideReason }); },
  async checkInterventions() { return apiPost<Intervention[]>('/sensai/interventions/check'); },
  async startCeremony(type: SprintCeremonyType) { return apiPost<SprintCeremony>(`/sensai/ceremonies/${type}/start`); },
  async getUpcomingCeremonies() { return apiGet<SprintCeremony[]>('/sensai/ceremonies/upcoming'); },
  async completeSprintPlanning(data: { selectedTaskIds: string[]; notes?: string }) { return apiPost<SprintCeremony>('/sensai/ceremonies/planning/complete', data); },
  async completeSprintReview(notes?: string) { return apiPost<SprintCeremony>('/sensai/ceremonies/review/complete', { notes }); },
  async completeRetrospective(data: { whatWorked: string[]; whatBlocked: string[]; keyLearnings: string[] }) { return apiPost<SprintCeremony>('/sensai/ceremonies/retrospective/complete', data); },
  async getLifeWheelMetrics() { return apiGet<LifeWheelMetrics>('/sensai/lifewheel/metrics'); },
  async getDimensionHistory(dimension: string, sprints = 4) { return apiGet<unknown[]>(`/sensai/lifewheel/dimensions/${dimension}/history?sprints=${sprints}`); },
  async addRecoveryTask(task: RecoveryTask) { return apiPost<{ taskId: string }>('/sensai/lifewheel/recovery-task', task); },
  async processIntake(data: ProcessIntakeRequest) { return apiPost<IntakeResult>('/sensai/intake/process', data); },
  async confirmIntakeSuggestions(intakeId: string, selectedSuggestionIds: string[]) { return apiPost<void>(`/sensai/intake/${intakeId}/confirm`, { selectedSuggestionIds }); },
  async getCoachMessages(unreadOnly = false) { return apiGet<CoachMessage[]>(`/sensai/messages?unreadOnly=${unreadOnly}`); },
  async markMessageRead(messageId: string) { return apiPost<void>(`/sensai/messages/${messageId}/read`); },
  async getSettings() { return apiGet<SensAISettings>('/sensai/settings'); },
  async updateSettings(settings: Partial<SensAISettings>) { return apiPut<SensAISettings>('/sensai/settings', settings); },
  async getAnalytics(period: string) { return apiGet<SensAIAnalytics>(`/sensai/analytics?period=${period}`); },
  async getPatternInsights() { return apiGet<unknown[]>('/sensai/analytics/patterns'); },
  async getMotivationContent() { return apiGet<unknown>('/sensai/motivation/contextual'); },
  async getKnowledgePrescription() { return apiGet<unknown[]>('/sensai/motivation/prescriptions'); },
  async getMicroChallenges() { return apiGet<unknown[]>('/sensai/motivation/micro-challenges'); },
};

// ============================================================================
// CONFIG
// ============================================================================

export const apiConfig = {
  baseUrl: API_V1.replace('/api/v1', ''),
  isProduction: !__DEV__,
};
