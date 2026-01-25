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

// Export configuration for debugging
export const apiConfig = {
    baseUrl: API_BASE_URL,
    isProduction: !__DEV__,
};
