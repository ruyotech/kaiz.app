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
    error?: {
        code: string;
        message: string;
    };
    timestamp: string;
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

        if (!response.ok) {
            console.error('🌐 API Error:', data);
            throw new ApiError(
                data.error?.message || 'Request failed',
                response.status,
                data.error?.code
            );
        }

        console.log('🌐 API Response:', data.success ? 'Success' : 'Failed');
        
        if (!data.success) {
            throw new ApiError(
                data.error?.message || 'Request failed',
                response.status,
                data.error?.code
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
        return request<any[]>('/life-wheel-areas', { method: 'GET' });
    },

    /**
     * Get all Eisenhower Quadrants
     */
    async getEisenhowerQuadrants(): Promise<any[]> {
        return request<any[]>('/eisenhower-quadrants', { method: 'GET' });
    },
};

// Sprint API
export const sprintApi = {
    /**
     * Get all sprints
     */
    async getSprints(year?: number): Promise<any[]> {
        const query = year ? `?year=${year}` : '';
        return request<any[]>(`/sprints${query}`, { method: 'GET' });
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
        return request<any>('/sprints/current', { method: 'GET' });
    },

    /**
     * Get upcoming sprints
     */
    async getUpcomingSprints(limit: number = 4): Promise<any[]> {
        return request<any[]>(`/sprints/upcoming?limit=${limit}`, { method: 'GET' });
    },

    /**
     * Get sprint by ID
     */
    async getSprintById(id: string): Promise<any> {
        return request<any>(`/sprints/${id}`, { method: 'GET' });
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
     * Get all tasks with optional filters
     */
    async getAll(filters?: { sprintId?: string; status?: string; epicId?: string }): Promise<any[]> {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        const query = params.toString() ? `?${params.toString()}` : '';
        return request<any[]>(`/tasks${query}`, { method: 'GET' }, true);
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
        return request<any[]>(`/challenges/templates${query}`, { method: 'GET' });
    },

    /**
     * Get template by ID
     */
    async getTemplateById(id: string): Promise<any> {
        return request<any>(`/challenges/templates/${id}`, { method: 'GET' });
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
        return request<any[]>('/mindset/content', { method: 'GET' });
    },

    /**
     * Get mindset content by ID
     */
    async getContentById(id: string): Promise<any> {
        return request<any>(`/mindset/content/${id}`, { method: 'GET' });
    },

    /**
     * Get content by dimension tag (life wheel area)
     */
    async getContentByDimension(dimensionTag: string): Promise<any[]> {
        return request<any[]>(`/mindset/content/dimension/${dimensionTag}`, { method: 'GET' });
    },

    /**
     * Get content by emotional tone
     */
    async getContentByTone(tone: 'MOTIVATIONAL' | 'ACTIONABLE' | 'REFLECTIVE' | 'CALMING'): Promise<any[]> {
        return request<any[]>(`/mindset/content/tone/${tone}`, { method: 'GET' });
    },

    /**
     * Get favorite content
     */
    async getFavorites(): Promise<any[]> {
        return request<any[]>('/mindset/content/favorites', { method: 'GET' });
    },

    /**
     * Toggle favorite status
     */
    async toggleFavorite(id: string): Promise<any> {
        return request<any>(`/mindset/content/${id}/toggle-favorite`, { method: 'POST' });
    },

    /**
     * Get all themes
     */
    async getAllThemes(): Promise<any[]> {
        return request<any[]>('/mindset/themes', { method: 'GET' });
    },

    /**
     * Get theme by ID
     */
    async getThemeById(id: string): Promise<any> {
        return request<any>(`/mindset/themes/${id}`, { method: 'GET' });
    },

    /**
     * Get theme by name
     */
    async getThemeByName(name: string): Promise<any> {
        return request<any>(`/mindset/themes/name/${name}`, { method: 'GET' });
    },
};

// Essentia API
export const essentiaApi = {
    /**
     * Get all books
     */
    async getAllBooks(): Promise<any[]> {
        return request<any[]>('/essentia/books', { method: 'GET' });
    },

    /**
     * Get book by ID (includes cards)
     */
    async getBookById(id: string): Promise<any> {
        return request<any>(`/essentia/books/${id}`, { method: 'GET' });
    },

    /**
     * Get books by category
     */
    async getBooksByCategory(category: string): Promise<any[]> {
        return request<any[]>(`/essentia/books/category/${category}`, { method: 'GET' });
    },

    /**
     * Get books by difficulty
     */
    async getBooksByDifficulty(difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'): Promise<any[]> {
        return request<any[]>(`/essentia/books/difficulty/${difficulty}`, { method: 'GET' });
    },

    /**
     * Get books by life wheel area
     */
    async getBooksByLifeWheelArea(lifeWheelAreaId: string): Promise<any[]> {
        return request<any[]>(`/essentia/books/life-wheel/${lifeWheelAreaId}`, { method: 'GET' });
    },

    /**
     * Get top rated books
     */
    async getTopRatedBooks(): Promise<any[]> {
        return request<any[]>('/essentia/books/top-rated', { method: 'GET' });
    },

    /**
     * Get popular books
     */
    async getPopularBooks(): Promise<any[]> {
        return request<any[]>('/essentia/books/popular', { method: 'GET' });
    },

    /**
     * Get all categories
     */
    async getAllCategories(): Promise<string[]> {
        return request<string[]>('/essentia/categories', { method: 'GET' });
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

// Export configuration for debugging
export const apiConfig = {
    baseUrl: API_BASE_URL,
    isProduction: !__DEV__,
};
