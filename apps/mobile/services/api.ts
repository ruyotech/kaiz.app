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
// In production, this would come from environment variables
const getApiUrl = (): string => {
    // You can change this to your local IP for testing
    // e.g., 'http://192.168.1.100:8080'
    return __DEV__ 
        ? 'http://192.168.0.112:8080'  // Your local network IP
        : 'https://api.kaiz-lifeos.com';  // Production URL (placeholder)
};

const API_BASE_URL = getApiUrl();
const API_V1 = `${API_BASE_URL}/api/v1`;

// Types matching backend DTOs
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    fullName: string;
    timezone?: string;
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

export function setOnAuthExpired(callback: () => void): void {
    onAuthExpired = callback;
}

// HTTP request helper
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

    // Add auth header if required
    if (requiresAuth) {
        const token = await getAccessToken();
        if (token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
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
            console.error('🌐 API Error:', data);
            
            // Auto-logout on 401 Unauthorized
            if (response.status === 401) {
                console.log('🔐 Token expired, clearing auth...');
                await clearTokens();
                // Notify app to redirect to login
                if (onAuthExpired) {
                    onAuthExpired();
                }
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
        if (error instanceof ApiError) {
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
     */
    async register(data: RegisterRequest): Promise<{ user: User; accessToken: string; refreshToken: string }> {
        const response = await request<AuthResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
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
     */
    async login(email: string, password: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
        const response = await request<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password } as LoginRequest),
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

// Onboarding API (for saving preferences to backend)
export const onboardingApi = {
    /**
     * Save user preferences after onboarding
     * Note: This endpoint may need to be created on the backend
     */
    async savePreferences(preferences: Partial<UserPreferences>): Promise<void> {
        // TODO: Implement when backend endpoint is ready
        // For now, this is a placeholder
        console.log('📤 Would save preferences to backend:', preferences);
        
        // await request<void>('/users/preferences', {
        //     method: 'PUT',
        //     body: JSON.stringify(preferences),
        // }, true);
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
     * Add comment to task
     */
    async addComment(taskId: string, data: { commentText: string }): Promise<any> {
        return request<any>(`/tasks/${taskId}/comments`, {
            method: 'POST',
            body: JSON.stringify(data),
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

// Notification API
export const notificationApi = {
    /**
     * Get all notifications (paginated)
     */
    async getNotifications(page: number = 0, size: number = 20): Promise<any> {
        return request<any>(`/notifications?page=${page}&size=${size}`, { method: 'GET' }, true);
    },

    /**
     * Get unread notifications
     */
    async getUnreadNotifications(): Promise<any[]> {
        return request<any[]>('/notifications/unread', { method: 'GET' }, true);
    },

    /**
     * Get unread count
     */
    async getUnreadCount(): Promise<number> {
        const response = await request<{ count: number }>('/notifications/unread-count', { method: 'GET' }, true);
        return response.count;
    },

    /**
     * Mark notification as read
     */
    async markAsRead(id: string): Promise<any> {
        return request<any>(`/notifications/${id}/read`, { method: 'PUT' }, true);
    },

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(): Promise<void> {
        await request<void>('/notifications/read-all', { method: 'PUT' }, true);
    },
};

// Task Template API
export const taskTemplateApi = {
    /**
     * Get all templates
     */
    async getTemplates(): Promise<any[]> {
        return request<any[]>('/templates', { method: 'GET' }, true);
    },

    /**
     * Get template by ID
     */
    async getTemplateById(id: string): Promise<any> {
        return request<any>(`/templates/${id}`, { method: 'GET' }, true);
    },

    /**
     * Create a template
     */
    async createTemplate(data: any): Promise<any> {
        return request<any>('/templates', {
            method: 'POST',
            body: JSON.stringify(data),
        }, true);
    },

    /**
     * Update a template
     */
    async updateTemplate(id: string, data: any): Promise<any> {
        return request<any>(`/templates/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }, true);
    },

    /**
     * Delete a template
     */
    async deleteTemplate(id: string): Promise<void> {
        await request<void>(`/templates/${id}`, { method: 'DELETE' }, true);
    },
};

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

    // ========== Knowledge Hub (Articles) ==========

    /**
     * Get all articles with optional filters
     */
    async getArticles(params?: { category?: string; page?: number; size?: number }): Promise<PaginatedResponse<any>> {
        const queryParams = new URLSearchParams();
        if (params?.category) queryParams.append('category', params.category);
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

// Export configuration for debugging
export const apiConfig = {
    baseUrl: API_BASE_URL,
    isProduction: !__DEV__,
};
