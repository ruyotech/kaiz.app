/**
 * Real API Service for connecting to the Spring Boot backend
 * 
 * This service handles authentication and onboarding API calls.
 * Other features continue to use mockApi for now.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/models';
import { UserPreferences } from '../store/preferencesStore';

// Storage keys for tokens
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// API Configuration
// For local development, use your machine's IP address
// In production, this uses the Google Cloud Run URL

// 🔧 PRODUCTION URL - Google Cloud Run
const PRODUCTION_API_URL = 'https://kaiz-api-213334506754.us-central1.run.app';

// Use EAS env variable if available, otherwise fallback to production URL
const getApiUrl = (): string => {
    // Check for EAS build environment variable first
    const easApiUrl = process.env.EXPO_PUBLIC_API_URL || process.env.API_URL;
    if (easApiUrl) {
        return easApiUrl;
    }
    
    // For Expo Go and local development, use production URL
    return PRODUCTION_API_URL;
};

const API_BASE_URL = getApiUrl();
const API_V1 = `${API_BASE_URL}/api/v1`;

// Import device info utility
import { getDeviceInfoString } from '../utils/deviceInfo';

// Types matching backend DTOs
export interface LoginRequest {
    email: string;
    password: string;
    deviceInfo?: string; // Device info JSON for session tracking
}

export interface RegisterRequest {
    email: string;
    password: string;
    fullName: string;
    timezone?: string;
    deviceInfo?: string; // Device info JSON for session tracking
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
    error?: string | {
        code: string;
        message: string;
    };
    timestamp?: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}

export interface VerifyEmailRequest {
    code: string;
}

export interface MessageResponse {
    message: string;
}

// Custom API Error
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

// Special error for auth expiration - should be handled silently by components
export class AuthExpiredError extends Error {
    constructor() {
        super('Session expired');
        this.name = 'AuthExpiredError';
    }
}

// Token management
async function getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
}

async function getRefreshToken(): Promise<string | null> {
    return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
}

async function saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await AsyncStorage.multiSet([
        [ACCESS_TOKEN_KEY, accessToken],
        [REFRESH_TOKEN_KEY, refreshToken],
    ]);
}

async function clearTokens(): Promise<void> {
    await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
}

// Callback for handling auth expiration - can be set by the app
let onAuthExpired: (() => void) | null = null;
// Track if we've already triggered auth expiration to avoid multiple calls
let authExpirationTriggered = false;

export function setOnAuthExpired(callback: () => void): void {
    onAuthExpired = callback;
    // Reset the flag when a new callback is set (e.g., after login)
    authExpirationTriggered = false;
}

export function resetAuthExpirationFlag(): void {
    authExpirationTriggered = false;
}

// Helper to trigger auth expiration callback safely
async function triggerAuthExpiration(): Promise<void> {
    if (authExpirationTriggered) {
        console.log('🔐 Auth expiration already triggered, skipping...');
        return;
    }
    
    authExpirationTriggered = true;
    console.log('🔐 Token expired, clearing auth and redirecting...');
    await clearTokens();
    
    if (onAuthExpired) {
        try {
            onAuthExpired();
        } catch (err) {
            console.warn('Failed to execute onAuthExpired callback:', err);
        }
    }
}

// HTTP request helper
async function request<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth: boolean = false,
    suppressErrorLog: boolean = false // Don't log error for expected 404s
): Promise<T> {
    const url = `${API_V1}${endpoint}`;
    
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Add auth header if required
    if (requiresAuth) {
        const token = await getAccessToken();
        if (token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
            console.log('🔐 Token attached to request');
        } else {
            console.warn('⚠️ No access token found for authenticated request to:', endpoint);
        }
    }

    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        const data = await response.json() as ApiResponse<T>;

        // Helper to extract error message from either string or object format
        const getErrorMessage = (error: ApiResponse<T>['error']): string => {
            if (typeof error === 'string') return error;
            if (error && typeof error === 'object') return error.message;
            return 'Request failed';
        };

        const getErrorCode = (error: ApiResponse<T>['error']): string | undefined => {
            if (error && typeof error === 'object') return error.code;
            return undefined;
        };

        if (!response.ok) {
            // Auto-logout on 401 Unauthorized - handle silently
            if (response.status === 401) {
                console.log('🔐 Session expired, redirecting to login...');
                await triggerAuthExpiration();
                // Throw silent error that components should not display
                throw new AuthExpiredError();
            }
            
            // Only log error if not suppressed (used for expected 404s like no family membership)
            if (!suppressErrorLog) {
                console.error('🌐 API Error:', data);
            }
            throw new ApiError(
                getErrorMessage(data.error),
                response.status,
                getErrorCode(data.error)
            );
        }

        console.log('🌐 API Response:', data.success ? 'Success' : 'Failed');
        
        if (!data.success) {
            throw new ApiError(
                getErrorMessage(data.error),
                response.status,
                getErrorCode(data.error)
            );
        }

        return data.data as T;
    } catch (error) {
        // Re-throw auth and API errors as-is
        if (error instanceof AuthExpiredError || error instanceof ApiError) {
            throw error;
        }
        
        // Network error or other issue
        console.error('🌐 Network Error:', error);
        throw new ApiError(
            'Unable to connect to server. Please check your network connection.',
            0,
            'NETWORK_ERROR'
        );
    }
}

/**
 * Request function for endpoints that return raw data (not wrapped in ApiResponse)
 * Used for template endpoints and other non-wrapped responses
 */
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

    // Add auth header if required
    if (requiresAuth) {
        const token = await getAccessToken();
        if (token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
            console.log('🔐 Token attached to request');
        } else {
            console.warn('⚠️ No access token found for authenticated request to:', endpoint);
        }
    }

    console.log(`🌐 API Request (raw): ${options.method || 'GET'} ${url}`);

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        // For DELETE with no content or empty responses
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return undefined as T;
        }

        // Check if response has a body before parsing
        const text = await response.text();
        if (!text || text.trim() === '') {
            console.log('🌐 API Response (raw): Success, empty body');
            return undefined as T;
        }

        const data = JSON.parse(text);

        if (!response.ok) {
            // Auto-logout on 401 Unauthorized - handle silently
            if (response.status === 401) {
                console.log('🔐 Session expired, redirecting to login...');
                await triggerAuthExpiration();
                // Throw silent error that components should not display
                throw new AuthExpiredError();
            }
            
            console.error('🌐 API Error:', data);
            // Handle error response (may or may not be wrapped)
            const errorMsg = data?.error?.message || data?.error || data?.message || 'Request failed';
            throw new ApiError(errorMsg, response.status);
        }

        console.log('🌐 API Response (raw): Success, data:', JSON.stringify(data).substring(0, 500));

        // Check if data is wrapped in a response object and unwrap it
        if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
            console.log('🌐 Unwrapping data from response wrapper');
            return (data as any).data as T;
        }

        // Return raw data directly (not wrapped)
        return data as T;
    } catch (error) {
        // Re-throw auth and API errors as-is
        if (error instanceof AuthExpiredError || error instanceof ApiError) {
            throw error;
        }
        
        console.error('🌐 Network Error:', error);
        throw new ApiError(
            'Unable to connect to server. Please check your network connection.',
            0,
            'NETWORK_ERROR'
        );
    }
}

// Convert backend UserResponse to mobile User model
function mapUserResponseToUser(response: UserResponse): User {
    return {
        id: response.id,
        email: response.email,
        fullName: response.fullName,
        accountType: response.accountType as User['accountType'],
        subscriptionTier: response.subscriptionTier as User['subscriptionTier'],
        timezone: response.timezone,
        avatarUrl: response.avatarUrl,
        createdAt: new Date().toISOString(), // Backend doesn't return this yet
    };
}

// Auth API
export const authApi = {
    /**
     * Register a new user
     * Includes device info for session tracking (App Store compliant)
     */
    async register(data: RegisterRequest): Promise<{ user: User; accessToken: string; refreshToken: string }> {
        // Get device info for session tracking
        const deviceInfo = await getDeviceInfoString();
        
        const response = await request<AuthResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                ...data,
                deviceInfo,
            }),
        });

        // Save tokens
        await saveTokens(response.accessToken, response.refreshToken);

        return {
            user: mapUserResponseToUser(response.user),
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
        };
    },

    /**
     * Login with email and password
     * Includes device info for session tracking (App Store compliant)
     */
    async login(email: string, password: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
        // Get device info for session tracking
        const deviceInfo = await getDeviceInfoString();
        
        const response = await request<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password, deviceInfo } as LoginRequest),
        });

        // Save tokens
        console.log('🔐 Saving tokens after login...');
        await saveTokens(response.accessToken, response.refreshToken);
        
        // Verify tokens were saved
        const savedToken = await getAccessToken();
        console.log('🔐 Token saved successfully:', !!savedToken);

        return {
            user: mapUserResponseToUser(response.user),
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
        };
    },

    /**
     * Refresh access token
     */
    async refreshToken(): Promise<TokenResponse> {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) {
            throw new ApiError('No refresh token available', 401, 'NO_REFRESH_TOKEN');
        }

        const response = await request<TokenResponse>('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken } as RefreshTokenRequest),
        });

        await saveTokens(response.accessToken, response.refreshToken);
        return response;
    },

    /**
     * Logout and revoke tokens
     */
    async logout(): Promise<void> {
        try {
            await request<void>('/auth/logout', {
                method: 'POST',
            }, true);
        } catch (error) {
            // Even if logout fails on server, clear local tokens
            console.warn('Logout API call failed, clearing local tokens anyway');
        }
        await clearTokens();
    },

    /**
     * Get current authenticated user
     */
    async getCurrentUser(): Promise<User> {
        const response = await request<UserResponse>('/auth/me', {
            method: 'GET',
        }, true);

        return mapUserResponseToUser(response);
    },

    /**
     * Request password reset email
     */
    async forgotPassword(email: string): Promise<string> {
        const response = await request<MessageResponse>('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email } as ForgotPasswordRequest),
        });
        return response.message;
    },

    /**
     * Reset password with token
     */
    async resetPassword(token: string, newPassword: string): Promise<void> {
        await request<MessageResponse>('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ token, newPassword } as ResetPasswordRequest),
        });
    },

    /**
     * Send email verification code
     */
    async sendVerificationCode(): Promise<string> {
        const response = await request<MessageResponse>('/auth/verify-email/send', {
            method: 'POST',
        }, true);
        return response.message;
    },

    /**
     * Verify email with code
     */
    async verifyEmail(code: string): Promise<void> {
        await request<MessageResponse>('/auth/verify-email', {
            method: 'POST',
            body: JSON.stringify({ code } as VerifyEmailRequest),
        }, true);
    },

    /**
     * Check if user has valid stored tokens
     */
    async hasValidSession(): Promise<boolean> {
        const token = await getAccessToken();
        return !!token;
    },

    /**
     * Get stored access token
     */
    getAccessToken,

    /**
     * Clear all stored tokens
     */
    clearTokens,
};

// Onboarding API Types
export interface OnboardingRequest {
    firstName: string;
    lastName?: string;
    planType: 'INDIVIDUAL' | 'FAMILY' | 'CORPORATE';
    corporateCode?: string;
    familyRole?: string;
    selectedTaskTemplateIds: string[];
    selectedEpicTemplateIds?: string[];
    importantDates?: {
        personName: string;
        relationship: string;
        dateType: string;
        date: string;
        year?: number;
        reminderDaysBefore?: number;
    }[];
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
    id: string;
    name: string;
    icon: string;
    color: string;
    description: string;
    templates: Array<{
        id: string;
        title: string;
        description: string;
        storyPoints: number;
        lifeWheelAreaId: string;
        eisenhowerQuadrant: string;
        isRecurring: boolean;
        recurrencePattern?: { frequency: string; interval: number };
        suggestedSprint: string;
    }>;
}

export interface EpicTemplate {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    lifeWheelAreaId: string;
    taskTemplateIds: string[];
    estimatedWeeks: number;
}

// Onboarding API
export const onboardingApi = {
    /**
     * Complete onboarding setup - creates tasks, epics, and events
     */
    async completeOnboarding(data: OnboardingRequest): Promise<OnboardingResponse> {
        return request<OnboardingResponse>('/onboarding/setup', {
            method: 'POST',
            body: JSON.stringify(data),
        }, true);
    },

    /**
     * Get task templates for onboarding selection
     */
    async getTaskTemplates(): Promise<{ categories: TaskTemplateCategory[] }> {
        return request<{ categories: TaskTemplateCategory[] }>('/onboarding/templates/tasks', {
            method: 'GET',
        }, true);
    },

    /**
     * Get epic templates for onboarding selection
     */
    async getEpicTemplates(): Promise<{ epics: EpicTemplate[] }> {
        return request<{ epics: EpicTemplate[] }>('/onboarding/templates/epics', {
            method: 'GET',
        }, true);
    },

    /**
     * Validate corporate code
     */
    async validateCorporateCode(code: string): Promise<{ valid: boolean; companyName: string | null; message: string }> {
        return request<{ valid: boolean; companyName: string | null; message: string }>('/onboarding/validate-corporate-code', {
            method: 'POST',
            body: JSON.stringify({ code }),
        });
    },

    /**
     * Save user preferences after onboarding (legacy)
     */
    async savePreferences(preferences: Partial<UserPreferences>): Promise<void> {
        console.log('📤 Saving preferences to backend:', preferences);
        // This is now handled by completeOnboarding
    },
};

// Life Wheel API
export const lifeWheelApi = {
    /**
     * Get all Life Wheel areas
     */
    async getLifeWheelAreas(): Promise<any[]> {
        return request<any[]>('/life-wheel-areas', { method: 'GET' }, true);
    },

    /**
     * Get all Eisenhower Quadrants
     */
    async getEisenhowerQuadrants(): Promise<any[]> {
        return request<any[]>('/eisenhower-quadrants', { method: 'GET' }, true);
    },
};

// Sprint API
export const sprintApi = {
    /**
     * Get all sprints
     */
    async getSprints(year?: number): Promise<any[]> {
        const query = year ? `?year=${year}` : '';
        return request<any[]>(`/sprints${query}`, { method: 'GET' }, true);
    },

    /**
     * Alias for getSprints (used by some components)
     */
    async getAll(year?: number): Promise<any[]> {
        return this.getSprints(year);
    },

    /**
     * Get current active sprint
     */
    async getCurrentSprint(): Promise<any> {
        return request<any>('/sprints/current', { method: 'GET' }, true);
    },

    /**
     * Get upcoming sprints
     */
    async getUpcomingSprints(limit: number = 4): Promise<any[]> {
        return request<any[]>(`/sprints/upcoming?limit=${limit}`, { method: 'GET' }, true);
    },

    /**
     * Get sprint by ID
     */
    async getSprintById(id: string): Promise<any> {
        return request<any>(`/sprints/${id}`, { method: 'GET' }, true);
    },

    /**
     * Activate a sprint
     */
    async activateSprint(id: string): Promise<any> {
        return request<any>(`/sprints/${id}/activate`, { method: 'POST' }, true);
    },
};

// Epic API
export const epicApi = {
    /**
     * Get all epics for the current user
     */
    async getEpics(status?: string): Promise<any[]> {
        const query = status ? `?status=${status}` : '';
        return request<any[]>(`/epics${query}`, { method: 'GET' }, true);
    },

    /**
     * Get epic by ID
     */
    async getEpicById(id: string): Promise<any> {
        return request<any>(`/epics/${id}`, { method: 'GET' }, true);
    },

    /**
     * Create a new epic
     */
    async createEpic(data: {
        title: string;
        description?: string;
        lifeWheelAreaId: string;
        targetSprintId?: string;
        color?: string;
        icon?: string;
    }): Promise<any> {
        return request<any>('/epics', {
            method: 'POST',
            body: JSON.stringify(data),
        }, true);
    },

    /**
     * Update an epic
     */
    async updateEpic(id: string, data: any): Promise<any> {
        return request<any>(`/epics/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }, true);
    },

    /**
     * Delete an epic
     */
    async deleteEpic(id: string): Promise<void> {
        await request<void>(`/epics/${id}`, { method: 'DELETE' }, true);
    },
};

// Task API
export const taskApi = {
    /**
     * Get all tasks with optional filters (returns paginated data)
     */
    async getAll(filters?: { sprintId?: string; status?: string; epicId?: string }): Promise<any[]> {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        const query = params.toString() ? `?${params.toString()}` : '';
        const result = await request<any>(`/tasks${query}`, { method: 'GET' }, true);
        // Handle paginated response - extract content array
        return result?.content || result || [];
    },

    /**
     * Get tasks by sprint
     */
    async getTasksBySprint(sprintId: string): Promise<any[]> {
        return request<any[]>(`/tasks/sprint/${sprintId}`, { method: 'GET' }, true);
    },

    /**
     * Get tasks by epic
     */
    async getTasksByEpic(epicId: string): Promise<any[]> {
        return request<any[]>(`/tasks/epic/${epicId}`, { method: 'GET' }, true);
    },

    /**
     * Get tasks by status
     */
    async getTasksByStatus(status: string): Promise<any[]> {
        return request<any[]>(`/tasks/status/${status}`, { method: 'GET' }, true);
    },

    /**
     * Get draft tasks
     */
    async getDraftTasks(): Promise<any[]> {
        return request<any[]>('/tasks/drafts', { method: 'GET' }, true);
    },

    /**
     * Get backlog tasks (not assigned to sprint)
     */
    async getBacklogTasks(): Promise<any[]> {
        return request<any[]>('/tasks/backlog', { method: 'GET' }, true);
    },

    /**
     * Get task by ID
     */
    async getTaskById(id: string): Promise<any> {
        return request<any>(`/tasks/${id}`, { method: 'GET' }, true);
    },

    /**
     * Create a new task
     */
    async createTask(data: any): Promise<any> {
        return request<any>('/tasks', {
            method: 'POST',
            body: JSON.stringify(data),
        }, true);
    },

    /**
     * Update a task
     */
    async updateTask(id: string, data: any): Promise<any> {
        return request<any>(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }, true);
    },

    /**
     * Update task status
     */
    async updateTaskStatus(id: string, status: string): Promise<any> {
        return request<any>(`/tasks/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        }, true);
    },

    /**
     * Delete a task
     */
    async deleteTask(id: string): Promise<void> {
        await request<void>(`/tasks/${id}`, { method: 'DELETE' }, true);
    },

    /**
     * Get task history
     */
    async getTaskHistory(id: string): Promise<any[]> {
        return request<any[]>(`/tasks/${id}/history`, { method: 'GET' }, true);
    },

    /**
     * Get task comments
     */
    async getTaskComments(id: string): Promise<any[]> {
        return request<any[]>(`/tasks/${id}/comments`, { method: 'GET' }, true);
    },

    /**
     * Add comment to task with optional attachments
     */
    async addComment(taskId: string, data: { 
        commentText: string;
        isAiGenerated?: boolean;
        attachments?: Array<{
            filename: string;
            fileUrl: string;
            fileType: string;
            fileSize: number | null;
        }>;
    }): Promise<any> {
        return request<any>(`/tasks/${taskId}/comments`, {
            method: 'POST',
            body: JSON.stringify({
                commentText: data.commentText,
                isAiGenerated: data.isAiGenerated || false,
                attachments: data.attachments || null,
            }),
        }, true);
    },
};

// Challenge API
export const challengeApi = {
    /**
     * Get challenge templates
     */
    async getTemplates(lifeWheelAreaId?: string): Promise<any[]> {
        const query = lifeWheelAreaId ? `?lifeWheelAreaId=${lifeWheelAreaId}` : '';
        return request<any[]>(`/challenges/templates${query}`, { method: 'GET' }, true);
    },

    /**
     * Get template by ID
     */
    async getTemplateById(id: string): Promise<any> {
        return request<any>(`/challenges/templates/${id}`, { method: 'GET' }, true);
    },

    /**
     * Get all challenges for current user
     */
    async getChallenges(status?: string): Promise<any[]> {
        const query = status ? `?status=${status}` : '';
        return request<any[]>(`/challenges${query}`, { method: 'GET' }, true);
    },

    /**
     * Get active challenges
     */
    async getActiveChallenges(): Promise<any[]> {
        return request<any[]>('/challenges/active', { method: 'GET' }, true);
    },

    /**
     * Get challenge by ID
     */
    async getChallengeById(id: string): Promise<any> {
        return request<any>(`/challenges/${id}`, { method: 'GET' }, true);
    },

    /**
     * Create a new challenge
     */
    async createChallenge(data: any): Promise<any> {
        return request<any>('/challenges', {
            method: 'POST',
            body: JSON.stringify(data),
        }, true);
    },

    /**
     * Update a challenge
     */
    async updateChallenge(id: string, data: any): Promise<any> {
        return request<any>(`/challenges/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }, true);
    },

    /**
     * Delete a challenge
     */
    async deleteChallenge(id: string): Promise<void> {
        await request<void>(`/challenges/${id}`, { method: 'DELETE' }, true);
    },

    /**
     * Get challenge entries
     */
    async getEntries(challengeId: string): Promise<any[]> {
        return request<any[]>(`/challenges/${challengeId}/entries`, { method: 'GET' }, true);
    },

    /**
     * Log a challenge entry
     */
    async logEntry(challengeId: string, data: { value: number | boolean; note?: string; date: string }): Promise<any> {
        return request<any>(`/challenges/${challengeId}/entries`, {
            method: 'POST',
            body: JSON.stringify(data),
        }, true);
    },

    /**
     * Invite accountability partner
     */
    async inviteParticipant(challengeId: string, userId: string): Promise<any> {
        return request<any>(`/challenges/${challengeId}/participants`, {
            method: 'POST',
            body: JSON.stringify({ userId }),
        }, true);
    },
};

// Notification Types (matching backend DTOs)
export interface NotificationResponse {
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
    expiresAt: string | null;
    sender: {
        id: number | null;
        name: string | null;
        avatar: string | null;
    } | null;
    metadata: Record<string, any> | null;
    actions: Array<{
        id: string;
        label: string;
        action: string;
        style: string;
    }> | null;
    createdAt: string;
}

export interface NotificationPageResponse {
    content: NotificationResponse[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

export interface UnreadCountResponse {
    total: number;
    byCategory: Record<string, number>;
}

export interface GroupedNotificationsResponse {
    today: NotificationResponse[];
    yesterday: NotificationResponse[];
    thisWeek: NotificationResponse[];
    older: NotificationResponse[];
}

export interface NotificationPreferencesResponse {
    pushEnabled: boolean;
    emailEnabled: boolean;
    inAppEnabled: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    quietHoursEnabled: boolean;
    quietHoursStart: string | null;
    quietHoursEnd: string | null;
    categorySettings: Record<string, {
        enabled: boolean;
        push: boolean;
        email: boolean;
        inApp: boolean;
    }>;
}

export interface UpdatePreferencesRequest {
    pushEnabled?: boolean;
    emailEnabled?: boolean;
    inAppEnabled?: boolean;
    soundEnabled?: boolean;
    vibrationEnabled?: boolean;
    quietHoursEnabled?: boolean;
    quietHoursStart?: string;
    quietHoursEnd?: string;
    categorySettings?: Record<string, {
        enabled?: boolean;
        push?: boolean;
        email?: boolean;
        inApp?: boolean;
    }>;
}

// Notification API
export const notificationApi = {
    /**
     * Get all notifications (paginated, excludes archived)
     */
    async getNotifications(page: number = 0, size: number = 20): Promise<NotificationPageResponse> {
        return request<NotificationPageResponse>(`/notifications?page=${page}&size=${size}`, { method: 'GET' }, true);
    },

    /**
     * Get notifications by category
     */
    async getNotificationsByCategory(category: string, page: number = 0, size: number = 20): Promise<NotificationPageResponse> {
        return request<NotificationPageResponse>(`/notifications/category/${category}?page=${page}&size=${size}`, { method: 'GET' }, true);
    },

    /**
     * Get grouped notifications (today, yesterday, this week, older)
     */
    async getGroupedNotifications(): Promise<GroupedNotificationsResponse> {
        return request<GroupedNotificationsResponse>('/notifications/grouped', { method: 'GET' }, true);
    },

    /**
     * Get archived notifications
     */
    async getArchivedNotifications(page: number = 0, size: number = 20): Promise<NotificationPageResponse> {
        return request<NotificationPageResponse>(`/notifications/archived?page=${page}&size=${size}`, { method: 'GET' }, true);
    },

    /**
     * Get pinned notifications
     */
    async getPinnedNotifications(page: number = 0, size: number = 20): Promise<NotificationPageResponse> {
        return request<NotificationPageResponse>(`/notifications/pinned?page=${page}&size=${size}`, { method: 'GET' }, true);
    },

    /**
     * Get unread notifications
     */
    async getUnreadNotifications(): Promise<NotificationResponse[]> {
        return request<NotificationResponse[]>('/notifications/unread', { method: 'GET' }, true);
    },

    /**
     * Search notifications
     */
    async searchNotifications(query: string, page: number = 0, size: number = 20): Promise<NotificationPageResponse> {
        return request<NotificationPageResponse>(`/notifications/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`, { method: 'GET' }, true);
    },

    /**
     * Get unread count with category breakdown
     */
    async getUnreadCount(): Promise<UnreadCountResponse> {
        return request<UnreadCountResponse>('/notifications/unread-count', { method: 'GET' }, true);
    },

    /**
     * Mark notification as read
     */
    async markAsRead(id: string): Promise<NotificationResponse> {
        return request<NotificationResponse>(`/notifications/${id}/read`, { method: 'PUT' }, true);
    },

    /**
     * Mark notification as unread
     */
    async markAsUnread(id: string): Promise<NotificationResponse> {
        return request<NotificationResponse>(`/notifications/${id}/unread`, { method: 'PUT' }, true);
    },

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(): Promise<void> {
        await request<void>('/notifications/read-all', { method: 'PUT' }, true);
    },

    /**
     * Mark all notifications in a category as read
     */
    async markCategoryAsRead(category: string): Promise<void> {
        await request<void>(`/notifications/category/${category}/read-all`, { method: 'PUT' }, true);
    },

    /**
     * Toggle notification pinned status
     */
    async togglePinned(id: string): Promise<NotificationResponse> {
        return request<NotificationResponse>(`/notifications/${id}/pin`, { method: 'PUT' }, true);
    },

    /**
     * Archive a notification
     */
    async archiveNotification(id: string): Promise<NotificationResponse> {
        return request<NotificationResponse>(`/notifications/${id}/archive`, { method: 'PUT' }, true);
    },

    /**
     * Unarchive a notification
     */
    async unarchiveNotification(id: string): Promise<NotificationResponse> {
        return request<NotificationResponse>(`/notifications/${id}/unarchive`, { method: 'PUT' }, true);
    },

    /**
     * Archive all read notifications
     */
    async archiveAllRead(): Promise<void> {
        await request<void>('/notifications/archive-read', { method: 'PUT' }, true);
    },

    /**
     * Delete a notification
     */
    async deleteNotification(id: string): Promise<void> {
        await request<void>(`/notifications/${id}`, { method: 'DELETE' }, true);
    },

    /**
     * Get notification preferences
     */
    async getPreferences(): Promise<NotificationPreferencesResponse> {
        return request<NotificationPreferencesResponse>('/notifications/preferences', { method: 'GET' }, true);
    },

    /**
     * Update notification preferences
     */
    async updatePreferences(data: UpdatePreferencesRequest): Promise<NotificationPreferencesResponse> {
        return request<NotificationPreferencesResponse>('/notifications/preferences', {
            method: 'PUT',
            body: JSON.stringify(data),
        }, true);
    },
};

// Task Template API (Extended)
import { TaskTemplate, TemplateFilterOptions, RecurrencePattern } from '../types/models';

export interface RatingResponse {
    templateId: string;
    averageRating: number;
    ratingCount: number;
    userRating: number;
}

export interface FavoriteResponse {
    templateId: string;
    isFavorite: boolean;
}

export const taskTemplateApi = {
    /**
     * Get all available templates (global + user's own)
     */
    async getAllTemplates(): Promise<TaskTemplate[]> {
        return requestRaw<TaskTemplate[]>('/templates', { method: 'GET' }, true);
    },

    /**
     * Get global (system) templates
     */
    async getGlobalTemplates(): Promise<TaskTemplate[]> {
        return requestRaw<TaskTemplate[]>('/templates/global', { method: 'GET' }, true);
    },

    /**
     * Get global templates by life wheel area
     */
    async getGlobalTemplatesByArea(areaId: string): Promise<TaskTemplate[]> {
        return requestRaw<TaskTemplate[]>(`/templates/global/area/${areaId}`, { method: 'GET' }, true);
    },

    /**
     * Get user's own templates
     */
    async getUserTemplates(): Promise<TaskTemplate[]> {
        return requestRaw<TaskTemplate[]>('/templates/user', { method: 'GET' }, true);
    },

    /**
     * Get user's favorite templates
     */
    async getFavoriteTemplates(): Promise<TaskTemplate[]> {
        return requestRaw<TaskTemplate[]>('/templates/favorites', { method: 'GET' }, true);
    },

    /**
     * Search templates by query
     */
    async searchTemplates(query: string): Promise<TaskTemplate[]> {
        return requestRaw<TaskTemplate[]>(`/templates/search?q=${encodeURIComponent(query)}`, { method: 'GET' }, true);
    },

    /**
     * Get template by ID
     */
    async getTemplateById(id: string): Promise<TaskTemplate> {
        return requestRaw<TaskTemplate>(`/templates/${id}`, { method: 'GET' }, true);
    },

    /**
     * Create a new user template
     */
    async createTemplate(data: CreateTemplateRequest): Promise<TaskTemplate> {
        return requestRaw<TaskTemplate>('/templates', {
            method: 'POST',
            body: JSON.stringify(data),
        }, true);
    },

    /**
     * Update a user template
     */
    async updateTemplate(id: string, data: Partial<CreateTemplateRequest>): Promise<TaskTemplate> {
        return requestRaw<TaskTemplate>(`/templates/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }, true);
    },

    /**
     * Delete a user template
     */
    async deleteTemplate(id: string): Promise<void> {
        await requestRaw<void>(`/templates/${id}`, { method: 'DELETE' }, true);
    },

    /**
     * Toggle favorite status
     */
    async toggleFavorite(id: string): Promise<FavoriteResponse> {
        return requestRaw<FavoriteResponse>(`/templates/${id}/favorite`, { method: 'POST' }, true);
    },

    /**
     * Rate a template (1-5 stars)
     */
    async rateTemplate(id: string, rating: number): Promise<RatingResponse> {
        return requestRaw<RatingResponse>(`/templates/${id}/rate`, {
            method: 'POST',
            body: JSON.stringify({ rating }),
        }, true);
    },

    /**
     * Clone a global template to user's templates
     */
    async cloneTemplate(id: string): Promise<TaskTemplate> {
        return requestRaw<TaskTemplate>(`/templates/${id}/clone`, { method: 'POST' }, true);
    },

    /**
     * Increment usage count (called when creating task from template)
     */
    async useTemplate(id: string): Promise<void> {
        await requestRaw<void>(`/templates/${id}/use`, { method: 'POST' }, true);
    },

    /**
     * Add a tag to a template
     */
    async addTag(id: string, tag: string): Promise<TagsResponse> {
        return requestRaw<TagsResponse>(`/templates/${id}/tags`, {
            method: 'POST',
            body: JSON.stringify({ tag }),
        }, true);
    },

    /**
     * Remove a tag from a template
     */
    async removeTag(id: string, tag: string): Promise<TagsResponse> {
        return requestRaw<TagsResponse>(`/templates/${id}/tags/${encodeURIComponent(tag)}`, {
            method: 'DELETE',
        }, true);
    },
};

// Response type for tags operations
export interface TagsResponse {
    templateId: string;
    tags: string[];
}

// Mindset API
export const mindsetApi = {
    /**
     * Get all mindset content
     */
    async getAllContent(): Promise<any[]> {
        return request<any[]>('/mindset/content', { method: 'GET' }, true);
    },

    /**
     * Get mindset content by ID
     */
    async getContentById(id: string): Promise<any> {
        return request<any>(`/mindset/content/${id}`, { method: 'GET' }, true);
    },

    /**
     * Get content by dimension tag (life wheel area)
     */
    async getContentByDimension(dimensionTag: string): Promise<any[]> {
        return request<any[]>(`/mindset/content/dimension/${dimensionTag}`, { method: 'GET' }, true);
    },

    /**
     * Get content by emotional tone
     */
    async getContentByTone(tone: 'MOTIVATIONAL' | 'ACTIONABLE' | 'REFLECTIVE' | 'CALMING'): Promise<any[]> {
        return request<any[]>(`/mindset/content/tone/${tone}`, { method: 'GET' }, true);
    },

    /**
     * Get favorite content
     */
    async getFavorites(): Promise<any[]> {
        return request<any[]>('/mindset/content/favorites', { method: 'GET' }, true);
    },

    /**
     * Toggle favorite status
     */
    async toggleFavorite(id: string): Promise<any> {
        return request<any>(`/mindset/content/${id}/toggle-favorite`, { method: 'POST' }, true);
    },

    /**
     * Get all themes
     */
    async getAllThemes(): Promise<any[]> {
        return request<any[]>('/mindset/themes', { method: 'GET' }, true);
    },

    /**
     * Get theme by ID
     */
    async getThemeById(id: string): Promise<any> {
        return request<any>(`/mindset/themes/${id}`, { method: 'GET' }, true);
    },

    /**
     * Get theme by name
     */
    async getThemeByName(name: string): Promise<any> {
        return request<any>(`/mindset/themes/name/${name}`, { method: 'GET' }, true);
    },
};

// Essentia API
export const essentiaApi = {
    /**
     * Get all books
     */
    async getAllBooks(): Promise<any[]> {
        return request<any[]>('/essentia/books', { method: 'GET' }, true);
    },

    /**
     * Get book by ID (includes cards)
     */
    async getBookById(id: string): Promise<any> {
        return request<any>(`/essentia/books/${id}`, { method: 'GET' }, true);
    },

    /**
     * Get books by category
     */
    async getBooksByCategory(category: string): Promise<any[]> {
        return request<any[]>(`/essentia/books/category/${category}`, { method: 'GET' }, true);
    },

    /**
     * Get books by difficulty
     */
    async getBooksByDifficulty(difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'): Promise<any[]> {
        return request<any[]>(`/essentia/books/difficulty/${difficulty}`, { method: 'GET' }, true);
    },

    /**
     * Get books by life wheel area
     */
    async getBooksByLifeWheelArea(lifeWheelAreaId: string): Promise<any[]> {
        return request<any[]>(`/essentia/books/life-wheel/${lifeWheelAreaId}`, { method: 'GET' }, true);
    },

    /**
     * Get top rated books
     */
    async getTopRatedBooks(): Promise<any[]> {
        return request<any[]>('/essentia/books/top-rated', { method: 'GET' }, true);
    },

    /**
     * Get popular books
     */
    async getPopularBooks(): Promise<any[]> {
        return request<any[]>('/essentia/books/popular', { method: 'GET' }, true);
    },

    /**
     * Get all categories
     */
    async getAllCategories(): Promise<string[]> {
        return request<string[]>('/essentia/categories', { method: 'GET' }, true);
    },

    /**
     * Get user reading progress
     */
    async getUserProgress(): Promise<any[]> {
        return request<any[]>('/essentia/progress', { method: 'GET' }, true);
    },

    /**
     * Get progress for specific book
     */
    async getProgressForBook(bookId: string): Promise<any> {
        return request<any>(`/essentia/progress/${bookId}`, { method: 'GET' }, true);
    },

    /**
     * Get completed books
     */
    async getCompletedBooks(): Promise<any[]> {
        return request<any[]>('/essentia/progress/completed', { method: 'GET' }, true);
    },

    /**
     * Get favorite books
     */
    async getFavoriteBooks(): Promise<any[]> {
        return request<any[]>('/essentia/progress/favorites', { method: 'GET' }, true);
    },

    /**
     * Get in-progress books
     */
    async getInProgressBooks(): Promise<any[]> {
        return request<any[]>('/essentia/progress/in-progress', { method: 'GET' }, true);
    },

    /**
     * Start reading a book
     */
    async startBook(bookId: string): Promise<any> {
        return request<any>(`/essentia/books/${bookId}/start`, { method: 'POST' }, true);
    },

    /**
     * Update reading progress
     */
    async updateProgress(bookId: string, cardIndex: number): Promise<any> {
        return request<any>(`/essentia/books/${bookId}/progress?cardIndex=${cardIndex}`, { method: 'PUT' }, true);
    },

    /**
     * Toggle favorite status
     */
    async toggleFavorite(bookId: string): Promise<any> {
        return request<any>(`/essentia/books/${bookId}/toggle-favorite`, { method: 'POST' }, true);
    },
};

// ==========================================
// Command Center API - Smart Input Processing
// ==========================================

export interface CommandInputAttachment {
    type: 'image' | 'file' | 'voice';
    uri: string;
    name?: string;
    mimeType?: string;
}

// Import command center types
import type {
    CommandCenterAIResponse,
    Draft,
    DraftType,
    DraftStatus,
} from '../types/commandCenter.types';

export const commandCenterApi = {
    /**
     * Process input with AI to generate a draft
     * Uses the /api/v1/command-center/process endpoint
     */
    async processWithAI(
        text: string | null,
        attachments: CommandInputAttachment[]
    ): Promise<ApiResponse<CommandCenterAIResponse>> {
        console.log('🤖 [Command Center AI] Processing input with AI...');
        console.log('🤖 [Command Center AI] Text:', text);
        console.log('🤖 [Command Center AI] Attachments:', attachments.length);

        // Build FormData for multipart request
        const formData = new FormData();

        if (text && text.trim()) {
            formData.append('text', text.trim());
        }

        // Add attachments
        for (const attachment of attachments) {
            const filename = attachment.name || getFilenameFromUri(attachment.uri);
            const mimeType = attachment.mimeType || getMimeTypeFromFilename(filename);

            console.log('🤖 [Command Center AI] Adding attachment:', {
                uri: attachment.uri,
                name: filename,
                type: mimeType,
            });

            formData.append('attachments', {
                uri: attachment.uri,
                name: filename,
                type: mimeType,
            } as any);
        }

        try {
            const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
            
            const response = await fetch(`${API_V1}/command-center/process`, {
                method: 'POST',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData,
            });

            console.log('🤖 [Command Center AI] Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('🤖 [Command Center AI] Error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('🤖 [Command Center AI] Success:', data);
            return data;
        } catch (error: any) {
            console.error('🤖 [Command Center AI] Error:', error);
            return {
                success: false,
                error: error.message || 'Failed to process input with AI',
            };
        }
    },

    /**
     * Approve a pending draft - creates the actual entity
     */
    async approveDraft(draftId: string): Promise<ApiResponse<{ createdEntityId: string }>> {
        console.log('✅ [Command Center] Approving draft:', draftId);
        try {
            const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
            
            const response = await fetch(`${API_V1}/command-center/drafts/${draftId}/action`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    draftId,
                    action: 'APPROVE',
                    modifiedDraft: null,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ [Command Center] Draft approved:', data);
            return data;
        } catch (error: any) {
            console.error('✅ [Command Center] Approve error:', error);
            return {
                success: false,
                error: error.message || 'Failed to approve draft',
            };
        }
    },

    /**
     * Reject a pending draft
     */
    async rejectDraft(draftId: string): Promise<ApiResponse<void>> {
        console.log('❌ [Command Center] Rejecting draft:', draftId);
        try {
            const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
            
            const response = await fetch(`${API_V1}/command-center/drafts/${draftId}/action`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    draftId,
                    action: 'REJECT',
                    modifiedDraft: null,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('❌ [Command Center] Draft rejected:', data);
            return data;
        } catch (error: any) {
            console.error('❌ [Command Center] Reject error:', error);
            return {
                success: false,
                error: error.message || 'Failed to reject draft',
            };
        }
    },

    /**
     * Get pending drafts for the current user
     */
    async getPendingDrafts(): Promise<ApiResponse<CommandCenterAIResponse[]>> {
        console.log('📋 [Command Center] Fetching pending drafts...');
        try {
            const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
            
            const response = await fetch(`${API_V1}/command-center/drafts/pending`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('📋 [Command Center] Pending drafts:', data);
            return data;
        } catch (error: any) {
            console.error('📋 [Command Center] Fetch error:', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch pending drafts',
            };
        }
    },
};

// Helper functions for Command Center
function getFilenameFromUri(uri: string): string {
    const segments = uri.split('/');
    return segments[segments.length - 1] || 'attachment';
}

function getMimeTypeFromFilename(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        heic: 'image/heic',
        m4a: 'audio/m4a',
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
        aac: 'audio/aac',
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        txt: 'text/plain',
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
}

// File Upload API
export interface FileUploadResult {
    filename: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
}

export const fileUploadApi = {
    /**
     * Upload a single file to cloud storage
     */
    async uploadFile(file: {
        uri: string;
        name?: string;
        mimeType?: string;
    }): Promise<ApiResponse<FileUploadResult>> {
        console.log('📤 [File Upload] Uploading file:', file);

        const formData = new FormData();
        const filename = file.name || getFilenameFromUri(file.uri);
        const mimeType = file.mimeType || getMimeTypeFromFilename(filename);

        formData.append('file', {
            uri: file.uri,
            name: filename,
            type: mimeType,
        } as any);

        try {
            const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
            
            const response = await fetch(`${API_V1}/files/upload`, {
                method: 'POST',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData,
            });

            console.log('📤 [File Upload] Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('📤 [File Upload] Error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('📤 [File Upload] Success:', data);
            return data;
        } catch (error: any) {
            console.error('📤 [File Upload] Error:', error);
            return {
                success: false,
                error: error.message || 'Failed to upload file',
            };
        }
    },

    /**
     * Upload multiple files to cloud storage
     */
    async uploadMultipleFiles(files: Array<{
        uri: string;
        name?: string;
        mimeType?: string;
    }>): Promise<ApiResponse<FileUploadResult[]>> {
        console.log('📤 [File Upload] Uploading multiple files:', files.length);

        const formData = new FormData();

        for (const file of files) {
            const filename = file.name || getFilenameFromUri(file.uri);
            const mimeType = file.mimeType || getMimeTypeFromFilename(filename);

            formData.append('files', {
                uri: file.uri,
                name: filename,
                type: mimeType,
            } as any);
        }

        try {
            const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
            
            const response = await fetch(`${API_V1}/files/upload-multiple`, {
                method: 'POST',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData,
            });

            console.log('📤 [File Upload] Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('📤 [File Upload] Error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('📤 [File Upload] Success:', data);
            return data;
        } catch (error: any) {
            console.error('📤 [File Upload] Error:', error);
            return {
                success: false,
                error: error.message || 'Failed to upload files',
            };
        }
    },

    /**
     * Delete a file from cloud storage
     */
    async deleteFile(fileUrl: string): Promise<ApiResponse<{ deleted: boolean }>> {
        console.log('🗑️ [File Upload] Deleting file:', fileUrl);

        try {
            const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
            
            const response = await fetch(`${API_V1}/files/delete?fileUrl=${encodeURIComponent(fileUrl)}`, {
                method: 'DELETE',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            console.log('🗑️ [File Upload] Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('🗑️ [File Upload] Error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('🗑️ [File Upload] Success:', data);
            return data;
        } catch (error: any) {
            console.error('🗑️ [File Upload] Error:', error);
            return {
                success: false,
                error: error.message || 'Failed to delete file',
            };
        }
    },
};

// AI Input Parsing (placeholder until backend AI service is ready)
export const aiApi = {
    /**
     * Parse AI input and detect type (task, challenge, event, etc.)
     * TODO: Implement real AI backend endpoint
     */
    async parseInput(input: { 
        type: 'text' | 'image' | 'voice' | 'file'; 
        content: string; 
        source?: string;
        fileName?: string;
    }): Promise<{
        success: boolean;
        detectedType: string;
        confidence: number;
        parsedData: {
            title: string;
            description?: string;
            suggestedPriority?: string;
            suggestedDueDate?: string;
        };
    }> {
        // Simple local parsing until AI backend is ready
        let detectedType = 'task';
        const contentLower = input.content.toLowerCase();
        
        if (contentLower.includes('challenge') || contentLower.includes('streak') || contentLower.includes('habit')) {
            detectedType = 'challenge';
        } else if (contentLower.includes('event') || contentLower.includes('meeting') || contentLower.includes('appointment')) {
            detectedType = 'event';
        }
        
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
                title = `Task from ${input.fileName || 'document'}`;
                description = `Created from file: ${input.fileName}. Please update details.`;
                break;
            case 'voice':
                title = input.content.slice(0, 50);
                description = input.content.length > 50 ? input.content : '';
                break;
        }
        
        return {
            success: true,
            detectedType,
            confidence: 0.85,
            parsedData: {
                title,
                description,
                suggestedPriority: 'medium',
                suggestedDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
        };
    },
};

// ==========================================
// Community API - Clean, DRY, SOLID
// ==========================================

// Response Types for Community API
export interface CommunityMemberResponse {
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
    sprintsCompleted: number;
    helpfulAnswers: number;
    templatesShared: number;
    currentStreak: number;
    showActivity: boolean;
    acceptPartnerRequests: boolean;
}

export interface CommunityHomeResponse {
    currentMember: CommunityMemberResponse;
    featuredArticle: any;
    activePoll: any;
    weeklyChallenge: any;
    recentActivity: any[];
    topContributors: any[];
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

export interface CreateQuestionRequest {
    title: string;
    body: string;
    tags: string[];
}

export interface CreateAnswerRequest {
    body: string;
}

export interface CreateStoryRequest {
    title: string;
    story: string;
    category: string;
    lifeWheelAreaId?: string;
    metrics?: Array<{ label: string; value: string }>;
    imageUrls?: string[];
}

export interface CreateTemplateRequest {
    name: string;
    description: string;
    type: string;
    content: Record<string, any>;
    lifeWheelAreaId?: string;
    tags: string[];
}

export interface PartnerRequestPayload {
    toUserId: string;
    message?: string;
}

export interface CreateGroupRequest {
    name: string;
    description: string;
    lifeWheelAreaId?: string;
    isPrivate: boolean;
    maxMembers: number;
    tags: string[];
}

export interface FeatureRequestPayload {
    title: string;
    description: string;
}

export interface SendComplimentRequest {
    toUserId: string;
    message: string;
    category: string;
}

// Community API Service
export const communityApi = {
    // ========== Member Profile ==========
    
    /**
     * Get current user's community profile
     */
    async getCurrentMember(): Promise<CommunityMemberResponse> {
        return request<CommunityMemberResponse>('/community/members/me', { method: 'GET' }, true);
    },

    /**
     * Get member by ID
     */
    async getMemberById(id: string): Promise<CommunityMemberResponse> {
        return request<CommunityMemberResponse>(`/community/members/${id}`, { method: 'GET' }, true);
    },

    /**
     * Update member profile
     */
    async updateProfile(data: Partial<{ displayName: string; avatar: string; bio: string; showActivity: boolean; acceptPartnerRequests: boolean }>): Promise<CommunityMemberResponse> {
        return request<CommunityMemberResponse>('/community/members/me', {
            method: 'PATCH',
            body: JSON.stringify(data),
        }, true);
    },

    /**
     * Get community home data (featured content, poll, challenge, activity)
     */
    async getCommunityHome(): Promise<CommunityHomeResponse> {
        return request<CommunityHomeResponse>('/community/home', { method: 'GET' }, true);
    },

    // ========== Knowledge Hub (Public Knowledge Items) ==========

    /**
     * Get knowledge categories
     */
    async getKnowledgeCategories(): Promise<any[]> {
        return request<any[]>('/public/knowledge/categories', { method: 'GET' });
    },

    /**
     * Get knowledge items with optional filters
     */
    async getKnowledgeItems(params?: { search?: string; categoryId?: string }): Promise<any[]> {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append('search', params.search);
        if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
        const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
        return request<any[]>(`/public/knowledge/items${query}`, { method: 'GET' });
    },

    /**
     * Get featured knowledge items
     */
    async getFeaturedKnowledgeItems(): Promise<any[]> {
        return request<any[]>('/public/knowledge/items/featured', { method: 'GET' });
    },

    /**
     * Get knowledge item by slug
     */
    async getKnowledgeItemBySlug(slug: string): Promise<any> {
        return request<any>(`/public/knowledge/items/${slug}`, { method: 'GET' });
    },

    /**
     * Record knowledge item view
     */
    async recordKnowledgeItemView(id: string): Promise<void> {
        return request<void>(`/public/knowledge/items/${id}/view`, { method: 'POST' });
    },

    /**
     * Mark knowledge item as helpful
     */
    async markKnowledgeItemHelpful(id: string): Promise<void> {
        return request<void>(`/public/knowledge/items/${id}/helpful`, { method: 'POST' });
    },

    // ========== Knowledge Hub (Articles) ==========

    /**
     * Get all articles with optional filters
     */
    async getArticles(params?: { category?: string; page?: number; size?: number }): Promise<PaginatedResponse<any>> {
        const queryParams = new URLSearchParams();
        // Convert category to UPPERCASE for backend enum compatibility
        if (params?.category) queryParams.append('category', params.category.toUpperCase());
        if (params?.page !== undefined) queryParams.append('page', params.page.toString());
        if (params?.size) queryParams.append('size', params.size.toString());
        const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
        return request<PaginatedResponse<any>>(`/community/articles${query}`, { method: 'GET' }, true);
    },

    /**
     * Get featured article
     */
    async getFeaturedArticle(): Promise<any> {
        return request<any>('/community/articles/featured', { method: 'GET' }, true);
    },

    /**
     * Get article by ID
     */
    async getArticleById(id: string): Promise<any> {
        return request<any>(`/community/articles/${id}`, { method: 'GET' }, true);
    },

    /**
     * Like/unlike article
     */
    async toggleArticleLike(id: string): Promise<{ liked: boolean; likeCount: number }> {
        return request<{ liked: boolean; likeCount: number }>(`/community/articles/${id}/toggle-like`, { method: 'POST' }, true);
    },

    /**
     * Bookmark/unbookmark article
     */
    async toggleArticleBookmark(id: string): Promise<{ bookmarked: boolean }> {
        return request<{ bookmarked: boolean }>(`/community/articles/${id}/toggle-bookmark`, { method: 'POST' }, true);
    },

    // ========== Release Notes & Wiki ==========

    /**
     * Get release notes
     */
    async getReleaseNotes(page: number = 0, size: number = 10): Promise<PaginatedResponse<any>> {
        return request<PaginatedResponse<any>>(`/community/release-notes?page=${page}&size=${size}`, { method: 'GET' }, true);
    },

    /**
     * Get wiki entries
     */
    async getWikiEntries(category?: string): Promise<any[]> {
        const query = category ? `?category=${category}` : '';
        return request<any[]>(`/community/wiki${query}`, { method: 'GET' }, true);
    },

    /**
     * Search wiki
     */
    async searchWiki(term: string): Promise<any[]> {
        return request<any[]>(`/community/wiki/search?q=${encodeURIComponent(term)}`, { method: 'GET' }, true);
    },

    // ========== Q&A Forum ==========

    /**
     * Get questions with filters
     */
    async getQuestions(params?: { status?: string; tag?: string; page?: number; size?: number }): Promise<PaginatedResponse<any>> {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append('status', params.status);
        if (params?.tag) queryParams.append('tag', params.tag);
        if (params?.page !== undefined) queryParams.append('page', params.page.toString());
        if (params?.size) queryParams.append('size', params.size.toString());
        const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
        return request<PaginatedResponse<any>>(`/community/questions${query}`, { method: 'GET' }, true);
    },

    /**
     * Get question by ID with answers
     */
    async getQuestionById(id: string): Promise<any> {
        return request<any>(`/community/questions/${id}`, { method: 'GET' }, true);
    },

    /**
     * Get answers for a question
     */
    async getAnswers(questionId: string): Promise<any[]> {
        return request<any[]>(`/community/questions/${questionId}/answers`, { method: 'GET' }, true);
    },

    /**
     * Create a new question
     */
    async createQuestion(data: CreateQuestionRequest): Promise<any> {
        return request<any>('/community/questions', {
            method: 'POST',
            body: JSON.stringify(data),
        }, true);
    },

    /**
     * Update a question
     */
    async updateQuestion(id: string, data: Partial<CreateQuestionRequest>): Promise<any> {
        return request<any>(`/community/questions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }, true);
    },

    /**
     * Delete a question
     */
    async deleteQuestion(id: string): Promise<void> {
        await request<void>(`/community/questions/${id}`, { method: 'DELETE' }, true);
    },

    /**
     * Upvote/downvote question
     */
    async toggleQuestionUpvote(id: string): Promise<{ upvoted: boolean; upvoteCount: number }> {
        return request<{ upvoted: boolean; upvoteCount: number }>(`/community/questions/${id}/toggle-upvote`, { method: 'POST' }, true);
    },

    /**
     * Create an answer
     */
    async createAnswer(questionId: string, data: CreateAnswerRequest): Promise<any> {
        return request<any>(`/community/questions/${questionId}/answers`, {
            method: 'POST',
            body: JSON.stringify(data),
        }, true);
    },

    /**
     * Upvote/downvote answer
     */
    async toggleAnswerUpvote(id: string): Promise<{ upvoted: boolean; upvoteCount: number }> {
        return request<{ upvoted: boolean; upvoteCount: number }>(`/community/answers/${id}/toggle-upvote`, { method: 'POST' }, true);
    },

    /**
     * Accept an answer (question author only)
     */
    async acceptAnswer(questionId: string, answerId: string): Promise<void> {
        await request<void>(`/community/questions/${questionId}/accept/${answerId}`, { method: 'POST' }, true);
    },

    // ========== Success Stories ==========

    /**
     * Get success stories
     */
    async getStories(params?: { category?: string; lifeWheelAreaId?: string; page?: number; size?: number }): Promise<PaginatedResponse<any>> {
        const queryParams = new URLSearchParams();
        if (params?.category) queryParams.append('category', params.category);
        if (params?.lifeWheelAreaId) queryParams.append('lifeWheelAreaId', params.lifeWheelAreaId);
        if (params?.page !== undefined) queryParams.append('page', params.page.toString());
        if (params?.size) queryParams.append('size', params.size.toString());
        const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
        return request<PaginatedResponse<any>>(`/community/stories${query}`, { method: 'GET' }, true);
    },

    /**
     * Get story by ID
     */
    async getStoryById(id: string): Promise<any> {
        return request<any>(`/community/stories/${id}`, { method: 'GET' }, true);
    },

    /**
     * Create a success story
     */
    async createStory(data: CreateStoryRequest): Promise<any> {
        return request<any>('/community/stories', {
            method: 'POST',
            body: JSON.stringify(data),
        }, true);
    },

    /**
     * Update a story
     */
    async updateStory(id: string, data: Partial<CreateStoryRequest>): Promise<any> {
        return request<any>(`/community/stories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }, true);
    },

    /**
     * Delete a story
     */
    async deleteStory(id: string): Promise<void> {
        await request<void>(`/community/stories/${id}`, { method: 'DELETE' }, true);
    },

    /**
     * Like a story
     */
    async toggleStoryLike(id: string): Promise<{ liked: boolean; likeCount: number }> {
        return request<{ liked: boolean; likeCount: number }>(`/community/stories/${id}/toggle-like`, { method: 'POST' }, true);
    },

    /**
     * Celebrate a story
     */
    async toggleStoryCelebrate(id: string): Promise<{ celebrated: boolean; celebrateCount: number }> {
        return request<{ celebrated: boolean; celebrateCount: number }>(`/community/stories/${id}/toggle-celebrate`, { method: 'POST' }, true);
    },

    /**
     * Get story comments
     */
    async getStoryComments(storyId: string): Promise<any[]> {
        return request<any[]>(`/community/stories/${storyId}/comments`, { method: 'GET' }, true);
    },

    /**
     * Add comment to story
     */
    async addStoryComment(storyId: string, text: string): Promise<any> {
        return request<any>(`/community/stories/${storyId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ text }),
        }, true);
    },

    // ========== Community Templates ==========

    /**
     * Get templates with filters
     */
    async getTemplates(params?: { type?: string; lifeWheelAreaId?: string; page?: number; size?: number }): Promise<PaginatedResponse<any>> {
        const queryParams = new URLSearchParams();
        if (params?.type) queryParams.append('type', params.type);
        if (params?.lifeWheelAreaId) queryParams.append('lifeWheelAreaId', params.lifeWheelAreaId);
        if (params?.page !== undefined) queryParams.append('page', params.page.toString());
        if (params?.size) queryParams.append('size', params.size.toString());
        const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
        return request<PaginatedResponse<any>>(`/community/templates${query}`, { method: 'GET' }, true);
    },

    /**
     * Get featured templates
     */
    async getFeaturedTemplates(): Promise<any[]> {
        return request<any[]>('/community/templates/featured', { method: 'GET' }, true);
    },

    /**
     * Get template by ID
     */
    async getTemplateById(id: string): Promise<any> {
        return request<any>(`/community/templates/${id}`, { method: 'GET' }, true);
    },

    /**
     * Create a template
     */
    async createTemplate(data: CreateTemplateRequest): Promise<any> {
        return request<any>('/community/templates', {
            method: 'POST',
            body: JSON.stringify(data),
        }, true);
    },

    /**
     * Update a template
     */
    async updateTemplate(id: string, data: Partial<CreateTemplateRequest>): Promise<any> {
        return request<any>(`/community/templates/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }, true);
    },

    /**
     * Delete a template
     */
    async deleteTemplate(id: string): Promise<void> {
        await request<void>(`/community/templates/${id}`, { method: 'DELETE' }, true);
    },

    /**
     * Download/use a template
     */
    async downloadTemplate(id: string): Promise<any> {
        return request<any>(`/community/templates/${id}/download`, { method: 'POST' }, true);
    },

    /**
     * Rate a template
     */
    async rateTemplate(id: string, rating: number): Promise<{ rating: number; ratingCount: number }> {
        return request<{ rating: number; ratingCount: number }>(`/community/templates/${id}/rate`, {
            method: 'POST',
            body: JSON.stringify({ rating }),
        }, true);
    },

    /**
     * Bookmark/unbookmark template
     */
    async toggleTemplateBookmark(id: string): Promise<{ bookmarked: boolean }> {
        return request<{ bookmarked: boolean }>(`/community/templates/${id}/toggle-bookmark`, { method: 'POST' }, true);
    },

    /**
     * Get template reviews
     */
    async getTemplateReviews(templateId: string): Promise<any[]> {
        return request<any[]>(`/community/templates/${templateId}/reviews`, { method: 'GET' }, true);
    },

    // ========== Leaderboard ==========

    /**
     * Get leaderboard
     */
    async getLeaderboard(period: 'weekly' | 'monthly' | 'all_time', category: 'reputation' | 'helpful' | 'streaks' | 'velocity'): Promise<any[]> {
        return request<any[]>(`/community/leaderboard?period=${period}&category=${category}`, { method: 'GET' }, true);
    },

    /**
     * Get current user's rank
     */
    async getUserRank(period: 'weekly' | 'monthly' | 'all_time', category: 'reputation' | 'helpful' | 'streaks' | 'velocity'): Promise<any> {
        return request<any>(`/community/leaderboard/me?period=${period}&category=${category}`, { method: 'GET' }, true);
    },

    // ========== Support Circle (Accountability Partners) ==========

    /**
     * Get accountability partners
     */
    async getPartners(): Promise<any[]> {
        return request<any[]>('/community/partners', { method: 'GET' }, true);
    },

    /**
     * Get partner by ID
     */
    async getPartnerById(id: string): Promise<any> {
        return request<any>(`/community/partners/${id}`, { method: 'GET' }, true);
    },

    /**
     * Get incoming partner requests
     */
    async getPartnerRequests(): Promise<any[]> {
        return request<any[]>('/community/partners/requests', { method: 'GET' }, true);
    },

    /**
     * Get sent partner requests
     */
    async getSentPartnerRequests(): Promise<any[]> {
        return request<any[]>('/community/partners/requests/sent', { method: 'GET' }, true);
    },

    /**
     * Send partner request
     */
    async sendPartnerRequest(data: PartnerRequestPayload): Promise<any> {
        return request<any>('/community/partners/requests', {
            method: 'POST',
            body: JSON.stringify(data),
        }, true);
    },

    /**
     * Respond to partner request
     */
    async respondToPartnerRequest(requestId: string, accept: boolean): Promise<void> {
        await request<void>(`/community/partners/requests/${requestId}/${accept ? 'accept' : 'decline'}`, {
            method: 'POST',
        }, true);
    },

    /**
     * Remove partner
     */
    async removePartner(partnerId: string): Promise<void> {
        await request<void>(`/community/partners/${partnerId}`, { method: 'DELETE' }, true);
    },

    /**
     * Check-in with partner
     */
    async checkInWithPartner(partnerId: string, message?: string): Promise<any> {
        return request<any>(`/community/partners/${partnerId}/check-in`, {
            method: 'POST',
            body: JSON.stringify({ message }),
        }, true);
    },

    // ========== Motivation Groups ==========

    /**
     * Get motivation groups
     */
    async getGroups(params?: { lifeWheelAreaId?: string; joined?: boolean; page?: number; size?: number }): Promise<PaginatedResponse<any>> {
        const queryParams = new URLSearchParams();
        if (params?.lifeWheelAreaId) queryParams.append('lifeWheelAreaId', params.lifeWheelAreaId);
        if (params?.joined !== undefined) queryParams.append('joined', params.joined.toString());
        if (params?.page !== undefined) queryParams.append('page', params.page.toString());
        if (params?.size) queryParams.append('size', params.size.toString());
        const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
        return request<PaginatedResponse<any>>(`/community/groups${query}`, { method: 'GET' }, true);
    },

    /**
     * Get group by ID
     */
    async getGroupById(id: string): Promise<any> {
        return request<any>(`/community/groups/${id}`, { method: 'GET' }, true);
    },

    /**
     * Create a group
     */
    async createGroup(data: CreateGroupRequest): Promise<any> {
        return request<any>('/community/groups', {
            method: 'POST',
            body: JSON.stringify(data),
        }, true);
    },

    /**
     * Update a group
     */
    async updateGroup(id: string, data: Partial<CreateGroupRequest>): Promise<any> {
        return request<any>(`/community/groups/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }, true);
    },

    /**
     * Delete a group
     */
    async deleteGroup(id: string): Promise<void> {
        await request<void>(`/community/groups/${id}`, { method: 'DELETE' }, true);
    },

    /**
     * Join a group
     */
    async joinGroup(id: string): Promise<void> {
        await request<void>(`/community/groups/${id}/join`, { method: 'POST' }, true);
    },

    /**
     * Leave a group
     */
    async leaveGroup(id: string): Promise<void> {
        await request<void>(`/community/groups/${id}/leave`, { method: 'POST' }, true);
    },

    /**
     * Get group members
     */
    async getGroupMembers(groupId: string): Promise<any[]> {
        return request<any[]>(`/community/groups/${groupId}/members`, { method: 'GET' }, true);
    },

    // ========== Activity Feed ==========

    /**
     * Get activity feed
     */
    async getActivityFeed(page: number = 0, size: number = 20): Promise<PaginatedResponse<any>> {
        return request<PaginatedResponse<any>>(`/community/activity?page=${page}&size=${size}`, { method: 'GET' }, true);
    },

    /**
     * Celebrate an activity
     */
    async celebrateActivity(activityId: string): Promise<{ celebrateCount: number }> {
        return request<{ celebrateCount: number }>(`/community/activity/${activityId}/celebrate`, { method: 'POST' }, true);
    },

    // ========== Polls & Weekly Challenges ==========

    /**
     * Get active poll
     */
    async getActivePoll(): Promise<any | null> {
        return request<any>('/community/polls/active', { method: 'GET' }, true);
    },

    /**
     * Vote on a poll
     */
    async votePoll(pollId: string, optionId: string): Promise<any> {
        return request<any>(`/community/polls/${pollId}/vote`, {
            method: 'POST',
            body: JSON.stringify({ optionId }),
        }, true);
    },

    /**
     * Get poll results
     */
    async getPollResults(pollId: string): Promise<any> {
        return request<any>(`/community/polls/${pollId}/results`, { method: 'GET' }, true);
    },

    /**
     * Get current weekly challenge
     */
    async getWeeklyChallenge(): Promise<any | null> {
        return request<any>('/community/weekly-challenge', { method: 'GET' }, true);
    },

    /**
     * Join weekly challenge
     */
    async joinWeeklyChallenge(challengeId: string): Promise<void> {
        await request<void>(`/community/weekly-challenge/${challengeId}/join`, { method: 'POST' }, true);
    },

    /**
     * Submit weekly challenge progress
     */
    async submitWeeklyChallengeProgress(challengeId: string, progress: number): Promise<any> {
        return request<any>(`/community/weekly-challenge/${challengeId}/progress`, {
            method: 'POST',
            body: JSON.stringify({ progress }),
        }, true);
    },

    // ========== Badges ==========

    /**
     * Get all badges definitions
     */
    async getAllBadges(): Promise<any[]> {
        return request<any[]>('/community/badges', { method: 'GET' }, true);
    },

    /**
     * Get user's earned badges
     */
    async getUserBadges(): Promise<any[]> {
        return request<any[]>('/community/badges/me', { method: 'GET' }, true);
    },

    // ========== Compliments & Kudos ==========

    /**
     * Send secret compliment
     */
    async sendCompliment(data: SendComplimentRequest): Promise<void> {
        await request<void>('/community/compliments', {
            method: 'POST',
            body: JSON.stringify(data),
        }, true);
    },

    /**
     * Get received compliments
     */
    async getReceivedCompliments(): Promise<any[]> {
        return request<any[]>('/community/compliments/received', { method: 'GET' }, true);
    },

    /**
     * Mark compliment as read
     */
    async markComplimentAsRead(id: string): Promise<void> {
        await request<void>(`/community/compliments/${id}/read`, { method: 'POST' }, true);
    },

    /**
     * Send public kudos
     */
    async sendKudos(data: SendComplimentRequest): Promise<any> {
        return request<any>('/community/kudos', {
            method: 'POST',
            body: JSON.stringify(data),
        }, true);
    },

    /**
     * Get public kudos feed
     */
    async getKudosFeed(page: number = 0, size: number = 20): Promise<PaginatedResponse<any>> {
        return request<PaginatedResponse<any>>(`/community/kudos?page=${page}&size=${size}`, { method: 'GET' }, true);
    },

    /**
     * Like a kudos post
     */
    async likeKudos(id: string): Promise<{ likeCount: number }> {
        return request<{ likeCount: number }>(`/community/kudos/${id}/like`, { method: 'POST' }, true);
    },

    // ========== Feature Requests & Feedback ==========

    /**
     * Get feature requests
     */
    async getFeatureRequests(params?: { status?: string; page?: number; size?: number }): Promise<PaginatedResponse<any>> {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append('status', params.status);
        if (params?.page !== undefined) queryParams.append('page', params.page.toString());
        if (params?.size) queryParams.append('size', params.size.toString());
        const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
        return request<PaginatedResponse<any>>(`/community/feature-requests${query}`, { method: 'GET' }, true);
    },

    /**
     * Get feature request by ID
     */
    async getFeatureRequestById(id: string): Promise<any> {
        return request<any>(`/community/feature-requests/${id}`, { method: 'GET' }, true);
    },

    /**
     * Submit feature request
     */
    async submitFeatureRequest(data: FeatureRequestPayload): Promise<any> {
        return request<any>('/community/feature-requests', {
            method: 'POST',
            body: JSON.stringify(data),
        }, true);
    },

    /**
     * Upvote feature request
     */
    async toggleFeatureRequestUpvote(id: string): Promise<{ upvoted: boolean; upvoteCount: number }> {
        return request<{ upvoted: boolean; upvoteCount: number }>(`/community/feature-requests/${id}/toggle-upvote`, { method: 'POST' }, true);
    },

    /**
     * Add comment to feature request
     */
    async addFeatureRequestComment(id: string, text: string): Promise<any> {
        return request<any>(`/community/feature-requests/${id}/comments`, {
            method: 'POST',
            body: JSON.stringify({ text }),
        }, true);
    },

    /**
     * Submit bug report
     */
    async submitBugReport(data: { title: string; description: string; stepsToReproduce?: string; severity: string }): Promise<any> {
        return request<any>('/community/bug-reports', {
            method: 'POST',
            body: JSON.stringify(data),
        }, true);
    },

    // ========== Search ==========

    /**
     * Search community content
     */
    async search(query: string, types?: string[]): Promise<any> {
        const queryParams = new URLSearchParams();
        queryParams.append('q', query);
        if (types?.length) queryParams.append('types', types.join(','));
        return request<any>(`/community/search?${queryParams.toString()}`, { method: 'GET' }, true);
    },

    /**
     * Get popular tags
     */
    async getPopularTags(): Promise<string[]> {
        return request<string[]>('/community/tags/popular', { method: 'GET' }, true);
    },
};

// ============================================================================
// FAMILY API - Family Workspace Management
// ============================================================================

import type {
    FamilyRole,
    FamilySettings,
    FamilyMember,
    ViewScope,
} from '../types/family.types';

// Family API Response Types
export interface FamilyResponse {
    id: string;
    name: string;
    ownerId: string;
    ownerName: string;
    inviteCode: string;
    inviteCodeExpiresAt: string;
    settings: FamilySettings;
    members: FamilyMemberResponse[];
    memberCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface FamilyMemberResponse {
    id: string;
    userId: string;
    displayName: string;
    email: string;
    avatarUrl: string | null;
    role: FamilyRole;
    joinedAt: string;
    isActive: boolean;
    lastActiveAt: string | null;
    tasksCompleted: number;
    currentStreak: number;
}

export interface FamilyMembershipResponse {
    familyId: string;
    familyName: string;
    memberId: string;
    role: FamilyRole;
    isOwner: boolean;
    joinedAt: string;
    permissions: string[];
}

export interface FamilyInviteResponse {
    id: string;
    email: string;
    suggestedRole: FamilyRole;
    invitedByName: string;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
    expiresAt: string;
    createdAt: string;
}

// Family API Request Types
export interface CreateFamilyRequest {
    name: string;
    settings?: Partial<FamilySettings>;
}

export interface UpdateFamilyRequest {
    name?: string;
    settings?: Partial<FamilySettings>;
}

export interface InviteMemberRequest {
    email: string;
    role: FamilyRole;
}

export interface JoinFamilyRequest {
    inviteCode: string;
}

export const familyApi = {
    // ========== Family CRUD ==========

    /**
     * Create a new family workspace
     */
    async createFamily(data: CreateFamilyRequest): Promise<FamilyResponse> {
        return request<FamilyResponse>('/families', {
            method: 'POST',
            body: JSON.stringify(data),
        }, true);
    },

    /**
     * Get current user's family
     * Note: 404 is expected if user has no family - we suppress error logging
     */
    async getMyFamily(): Promise<FamilyResponse> {
        return request<FamilyResponse>('/families/me', { method: 'GET' }, true, true);
    },

    /**
     * Get current user's membership info
     * Note: 404 is expected if user has no family - we suppress error logging
     */
    async getMyMembership(): Promise<FamilyMembershipResponse> {
        return request<FamilyMembershipResponse>('/families/me/membership', { method: 'GET' }, true, true);
    },

    /**
     * Get family by ID
     */
    async getFamily(familyId: string): Promise<FamilyResponse> {
        return request<FamilyResponse>(`/families/${familyId}`, { method: 'GET' }, true);
    },

    /**
     * Update family settings
     */
    async updateFamily(familyId: string, data: UpdateFamilyRequest): Promise<FamilyResponse> {
        return request<FamilyResponse>(`/families/${familyId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }, true);
    },

    /**
     * Delete family (owner only)
     */
    async deleteFamily(familyId: string): Promise<void> {
        await request<void>(`/families/${familyId}`, { method: 'DELETE' }, true);
    },

    /**
     * Regenerate invite code
     */
    async regenerateInviteCode(familyId: string): Promise<string> {
        return request<string>(`/families/${familyId}/invite-code/regenerate`, { method: 'POST' }, true);
    },

    /**
     * Join a family using invite code
     */
    async joinFamily(data: JoinFamilyRequest): Promise<FamilyMembershipResponse> {
        return request<FamilyMembershipResponse>('/families/join', {
            method: 'POST',
            body: JSON.stringify(data),
        }, true);
    },

    /**
     * Leave current family
     */
    async leaveFamily(): Promise<void> {
        await request<void>('/families/leave', { method: 'POST' }, true);
    },

    // ========== Member Management ==========

    /**
     * Get all family members
     */
    async getMembers(familyId: string): Promise<FamilyMemberResponse[]> {
        return request<FamilyMemberResponse[]>(`/families/${familyId}/members`, { method: 'GET' }, true);
    },

    /**
     * Invite a new member
     */
    async inviteMember(familyId: string, data: InviteMemberRequest): Promise<FamilyInviteResponse> {
        return request<FamilyInviteResponse>(`/families/${familyId}/members/invite`, {
            method: 'POST',
            body: JSON.stringify(data),
        }, true);
    },

    /**
     * Update member role
     */
    async updateMemberRole(familyId: string, memberId: string, role: FamilyRole): Promise<FamilyMemberResponse> {
        return request<FamilyMemberResponse>(`/families/${familyId}/members/${memberId}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role }),
        }, true);
    },

    /**
     * Remove member from family
     */
    async removeMember(familyId: string, memberId: string): Promise<void> {
        await request<void>(`/families/${familyId}/members/${memberId}`, { method: 'DELETE' }, true);
    },

    /**
     * Get pending invites
     */
    async getPendingInvites(familyId: string): Promise<FamilyInviteResponse[]> {
        return request<FamilyInviteResponse[]>(`/families/${familyId}/members/invites`, { method: 'GET' }, true);
    },

    /**
     * Cancel a pending invite
     */
    async cancelInvite(familyId: string, inviteId: string): Promise<void> {
        await request<void>(`/families/${familyId}/members/invites/${inviteId}`, { method: 'DELETE' }, true);
    },
};

// ============================================================================
// SENSAI API - AI Scrum Master & Life Coach
// ============================================================================

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

export const sensaiApi = {
    // ========== Velocity & Capacity ==========

    /**
     * Get user's velocity metrics
     */
    async getVelocityMetrics(): Promise<VelocityMetrics> {
        return request<VelocityMetrics>('/sensai/velocity/metrics', { method: 'GET' }, true);
    },

    /**
     * Get sprint health for a specific sprint
     */
    async getSprintHealth(sprintId: string): Promise<SprintHealth> {
        return request<SprintHealth>(`/sensai/velocity/sprint-health/${sprintId}`, { method: 'GET' }, true);
    },

    /**
     * Get current sprint health
     */
    async getCurrentSprintHealth(): Promise<SprintHealth> {
        return request<SprintHealth>('/sensai/sprints/current/health', { method: 'GET' }, true);
    },

    /**
     * Calculate adjusted capacity based on calendar
     */
    async getAdjustedCapacity(): Promise<{ baseVelocity: number; adjustedCapacity: number; blockedHours: number }> {
        return request<any>('/sensai/capacity/adjusted', { method: 'GET' }, true);
    },

    // ========== Daily Standup ==========

    /**
     * Get today's standup (or create if not exists)
     */
    async getTodayStandup(): Promise<GetStandupResponse> {
        return request<GetStandupResponse>('/sensai/standup/today', { method: 'GET' }, true);
    },

    /**
     * Complete today's standup
     */
    async completeStandup(data: CompleteStandupRequest): Promise<DailyStandup> {
        return request<DailyStandup>('/sensai/standup/complete', {
            method: 'POST',
            body: JSON.stringify(data),
        }, true);
    },

    /**
     * Skip today's standup
     */
    async skipStandup(reason?: string): Promise<void> {
        await request<void>('/sensai/standup/skip', {
            method: 'POST',
            body: JSON.stringify({ reason }),
        }, true);
    },

    /**
     * Get standup history
     */
    async getStandupHistory(startDate: string, endDate: string): Promise<DailyStandup[]> {
        return request<DailyStandup[]>(`/sensai/standup/history?startDate=${startDate}&endDate=${endDate}`, { method: 'GET' }, true);
    },

    /**
     * Convert blocker to task
     */
    async convertBlockerToTask(blockerId: string): Promise<{ taskId: string }> {
        return request<{ taskId: string }>(`/sensai/standups/blockers/${blockerId}/convert`, {
            method: 'POST',
        }, true);
    },

    // ========== Interventions ==========

    /**
     * Get active interventions
     */
    async getActiveInterventions(): Promise<Intervention[]> {
        return request<Intervention[]>('/sensai/interventions/active', { method: 'GET' }, true);
    },

    /**
     * Get intervention history
     */
    async getInterventionHistory(page: number = 0, size: number = 20): Promise<Intervention[]> {
        return request<Intervention[]>(`/sensai/interventions/history?page=${page}&size=${size}`, { method: 'GET' }, true);
    },

    /**
     * Acknowledge/override/defer an intervention
     */
    async acknowledgeIntervention(data: AcknowledgeInterventionRequest): Promise<void> {
        await request<void>(`/sensai/interventions/${data.interventionId}/acknowledge`, {
            method: 'POST',
            body: JSON.stringify({
                action: data.action,
                overrideReason: data.overrideReason,
            }),
        }, true);
    },

    /**
     * Check for new interventions (triggered on data changes)
     */
    async checkInterventions(): Promise<Intervention[]> {
        return request<Intervention[]>('/sensai/interventions/check', { method: 'POST' }, true);
    },

    // ========== Sprint Ceremonies ==========

    /**
     * Start a ceremony
     */
    async startCeremony(type: SprintCeremonyType): Promise<SprintCeremony> {
        return request<SprintCeremony>(`/sensai/ceremonies/${type}/start`, { method: 'POST' }, true);
    },

    /**
     * Get upcoming ceremonies
     */
    async getUpcomingCeremonies(): Promise<SprintCeremony[]> {
        return request<SprintCeremony[]>('/sensai/ceremonies/upcoming', { method: 'GET' }, true);
    },

    /**
     * Complete sprint planning
     */
    async completeSprintPlanning(data: { selectedTaskIds: string[]; notes?: string }): Promise<SprintCeremony> {
        return request<SprintCeremony>('/sensai/ceremonies/planning/complete', {
            method: 'POST',
            body: JSON.stringify(data),
        }, true);
    },

    /**
     * Complete sprint review
     */
    async completeSprintReview(notes?: string): Promise<SprintCeremony> {
        return request<SprintCeremony>('/sensai/ceremonies/review/complete', {
            method: 'POST',
            body: JSON.stringify({ notes }),
        }, true);
    },

    /**
     * Complete retrospective
     */
    async completeRetrospective(data: { whatWorked: string[]; whatBlocked: string[]; keyLearnings: string[] }): Promise<SprintCeremony> {
        return request<SprintCeremony>('/sensai/ceremonies/retrospective/complete', {
            method: 'POST',
            body: JSON.stringify(data),
        }, true);
    },

    // ========== Life Wheel ==========

    /**
     * Get life wheel metrics
     */
    async getLifeWheelMetrics(): Promise<LifeWheelMetrics> {
        return request<LifeWheelMetrics>('/sensai/lifewheel/metrics', { method: 'GET' }, true);
    },

    /**
     * Get dimension history
     */
    async getDimensionHistory(dimension: string, sprints: number = 4): Promise<any[]> {
        return request<any[]>(`/sensai/lifewheel/dimensions/${dimension}/history?sprints=${sprints}`, { method: 'GET' }, true);
    },

    /**
     * Add recovery task
     */
    async addRecoveryTask(task: RecoveryTask): Promise<{ taskId: string }> {
        return request<{ taskId: string }>('/sensai/lifewheel/recovery-task', {
            method: 'POST',
            body: JSON.stringify(task),
        }, true);
    },

    // ========== Universal Intake ==========

    /**
     * Process intake (voice, text, image, etc.)
     */
    async processIntake(data: ProcessIntakeRequest): Promise<IntakeResult> {
        return request<IntakeResult>('/sensai/intake/process', {
            method: 'POST',
            body: JSON.stringify(data),
        }, true);
    },

    /**
     * Confirm intake suggestions
     */
    async confirmIntakeSuggestions(intakeId: string, selectedSuggestionIds: string[]): Promise<void> {
        await request<void>(`/sensai/intake/${intakeId}/confirm`, {
            method: 'POST',
            body: JSON.stringify({ selectedSuggestionIds }),
        }, true);
    },

    // ========== Coach Messages ==========

    /**
     * Get coach messages
     */
    async getCoachMessages(unreadOnly: boolean = false): Promise<CoachMessage[]> {
        return request<CoachMessage[]>(`/sensai/messages?unreadOnly=${unreadOnly}`, { method: 'GET' }, true);
    },

    /**
     * Mark message as read
     */
    async markMessageRead(messageId: string): Promise<void> {
        await request<void>(`/sensai/messages/${messageId}/read`, { method: 'POST' }, true);
    },

    // ========== Settings ==========

    /**
     * Get SensAI settings
     */
    async getSettings(): Promise<SensAISettings> {
        return request<SensAISettings>('/sensai/settings', { method: 'GET' }, true);
    },

    /**
     * Update SensAI settings
     */
    async updateSettings(settings: Partial<SensAISettings>): Promise<SensAISettings> {
        return request<SensAISettings>('/sensai/settings', {
            method: 'PUT',
            body: JSON.stringify(settings),
        }, true);
    },

    // ========== Analytics ==========

    /**
     * Get SensAI analytics
     */
    async getAnalytics(period: 'week' | 'month' | 'quarter' | 'year'): Promise<SensAIAnalytics> {
        return request<SensAIAnalytics>(`/sensai/analytics?period=${period}`, { method: 'GET' }, true);
    },

    /**
     * Get pattern insights
     */
    async getPatternInsights(): Promise<any[]> {
        return request<any[]>('/sensai/analytics/patterns', { method: 'GET' }, true);
    },

    // ========== Motivation Integration ==========

    /**
     * Get contextual motivation content
     */
    async getMotivationContent(): Promise<any> {
        return request<any>('/sensai/motivation/contextual', { method: 'GET' }, true);
    },

    /**
     * Get knowledge prescription based on patterns
     */
    async getKnowledgePrescription(): Promise<any[]> {
        return request<any[]>('/sensai/motivation/prescriptions', { method: 'GET' }, true);
    },

    /**
     * Get micro-challenges
     */
    async getMicroChallenges(): Promise<any[]> {
        return request<any[]>('/sensai/motivation/micro-challenges', { method: 'GET' }, true);
    },
};

// Export configuration for debugging
export const apiConfig = {
    baseUrl: API_BASE_URL,
    isProduction: !__DEV__,
};
