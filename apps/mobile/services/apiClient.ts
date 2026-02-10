/**
 * API Client — Axios instance with SecureStore token management & mutex-locked refresh.
 *
 * Rules (from copilot-instructions):
 * - Tokens stored in expo-secure-store (NEVER AsyncStorage)
 * - 401 → silent refresh → retry original request
 * - Refresh is mutex-locked — one at a time, queue others
 * - If refresh fails → clear tokens → redirect to login
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { logger } from '../utils/logger';
import { getDeviceInfoString } from '../utils/deviceInfo';
import {
  encryptRequestPayload,
  decryptResponsePayload,
} from './encryption/encryptionInterceptor';

// ============================================================================
// Configuration
// ============================================================================

const PRODUCTION_API_URL = 'https://kaiz-api-213334506754.us-central1.run.app';

const getApiUrl = (): string => {
  const easApiUrl = process.env.EXPO_PUBLIC_API_URL || process.env.API_URL;
  return easApiUrl || PRODUCTION_API_URL;
};

const API_BASE_URL = getApiUrl();
export const API_V1 = `${API_BASE_URL}/api/v1`;

// ============================================================================
// Secure Token Storage
// ============================================================================

const TOKEN_KEYS = {
  ACCESS: 'kaiz_access_token',
  REFRESH: 'kaiz_refresh_token',
} as const;

export async function getAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS);
  } catch {
    return null;
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH);
  } catch {
    return null;
  }
}

export async function saveTokens(accessToken: string, refreshToken: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS, accessToken);
  await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH, refreshToken);
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS);
  await SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH);
}

// ============================================================================
// Axios Instance
// ============================================================================

export const api = axios.create({
  baseURL: API_V1,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// ============================================================================
// Request Interceptor — attach Bearer token
// ============================================================================

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Encrypt sensitive fields in outgoing request body (zero-knowledge)
  if (config.data && config.url) {
    config.data = await encryptRequestPayload(config.data, config.url);
  }

  logger.api(config.method?.toUpperCase() ?? 'GET', `${config.baseURL}${config.url}`);
  return config;
});

// ============================================================================
// Response Interceptor — mutex-locked token refresh on 401
// ============================================================================

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null): void {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only handle 401 and only retry once
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If we're already refreshing, queue this request
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      // Call refresh endpoint directly (bypass interceptor to avoid loop)
      const { data } = await axios.post(`${API_V1}/auth/refresh`, { refreshToken });

      const newAccessToken: string = data.data?.accessToken ?? data.accessToken;
      const newRefreshToken: string = data.data?.refreshToken ?? data.refreshToken;

      await saveTokens(newAccessToken, newRefreshToken);
      logger.auth('Token refreshed successfully');

      // Resolve queued requests
      processQueue(null, newAccessToken);

      // Retry original request
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      logger.auth('Token refresh failed, redirecting to login');
      processQueue(refreshError, null);
      await clearTokens();

      // Navigate to login
      try {
        router.replace('/(auth)/login');
      } catch {
        // Router may not be ready during startup
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

// ============================================================================
// Error Types
// ============================================================================

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorCode?: string,
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

// ============================================================================
// Response Helpers
// ============================================================================

/**
 * Unwrap the standard backend ApiResponse wrapper: `{ success, data, error }`.
 * If the response is already raw (no wrapper), returns it as-is.
 * Automatically decrypts sensitive fields in the response (zero-knowledge).
 */
export async function unwrap<T>(response: { data: unknown; config?: { url?: string } }): Promise<T> {
  const body = response.data as Record<string, unknown>;
  let result: unknown;

  if (body && typeof body === 'object' && 'success' in body) {
    if (!body.success) {
      const errMsg =
        typeof body.error === 'string'
          ? body.error
          : (body.error as Record<string, string>)?.message ?? 'Request failed';
      throw new ApiError(errMsg, 0);
    }
    result = body.data;
  } else {
    result = body;
  }

  // Decrypt sensitive fields in response data
  const url = (response as { config?: { url?: string } }).config?.url ?? '';
  if (result && url) {
    result = await decryptResponsePayload(result, url);
  }

  return result as T;
}

/**
 * Unwrap and return data from an api call.
 * Usage: `const sprints = await apiGet<Sprint[]>('/sprints');`
 */
export async function apiGet<T>(url: string): Promise<T> {
  const res = await api.get(url);
  return unwrap<T>({ data: res.data, config: res.config });
}

export async function apiPost<T>(url: string, data?: unknown): Promise<T> {
  const res = await api.post(url, data);
  return unwrap<T>({ data: res.data, config: res.config });
}

export async function apiPut<T>(url: string, data?: unknown): Promise<T> {
  const res = await api.put(url, data);
  return unwrap<T>({ data: res.data, config: res.config });
}

export async function apiPatch<T>(url: string, data?: unknown): Promise<T> {
  const res = await api.patch(url, data);
  return unwrap<T>({ data: res.data, config: res.config });
}

export async function apiDelete<T = void>(url: string): Promise<T> {
  const res = await api.delete(url);
  if (res.status === 204) return undefined as T;
  return unwrap<T>({ data: res.data, config: res.config });
}

/** For endpoints returning raw (non-wrapped) data like paginated lists */
export async function apiGetRaw<T>(url: string): Promise<T> {
  const res = await api.get(url);
  let body = res.data;
  // If it's wrapped, unwrap; otherwise return raw
  if (body && typeof body === 'object' && 'data' in body && Array.isArray(body.data)) {
    body = body.data;
  }
  // Decrypt sensitive fields in response
  if (body && res.config?.url) {
    body = await decryptResponsePayload(body, res.config.url);
  }
  return body as T;
}

// Re-export device info for auth flows
export { getDeviceInfoString };
