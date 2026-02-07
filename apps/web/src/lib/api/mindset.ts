/**
 * Admin Mindset API — CRUD for quotes, themes, stats
 *
 * Uses the same adminRequest pattern as the templates/CRM admin pages
 * so auth tokens, response unwrapping, and error handling are consistent.
 */
import { getAdminAccessToken } from '@/lib/api';
import type {
  MindsetContent,
  MindsetTheme,
  MindsetStats,
  CreateMindsetContentRequest,
  UpdateMindsetContentRequest,
  BulkCreateRequest,
  BulkUploadResult,
  CreateMindsetThemeRequest,
  UpdateMindsetThemeRequest,
} from '@/types/mindset';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kaiz-api-213334506754.us-central1.run.app';
const API_V1 = `${API_BASE_URL}/api/v1`;

/**
 * Mirrors adminRequest() from @/lib/api — auto-attaches admin token,
 * properly unwraps { success, data, meta } responses.
 */
async function adminRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_V1}${endpoint}`;

  const token = getAdminAccessToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  if (!text) return undefined as T;

  const data = JSON.parse(text);

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Admin session expired. Please log in again.');
    }
    throw new Error(data?.message || data?.error || `API Error ${response.status}`);
  }

  // Unwrap { success, data, meta } wrapper (matches backend ApiResponse<T>)
  if (data && typeof data === 'object' && 'success' in data && data.data !== undefined) {
    return data.data as T;
  }

  return data as T;
}

// ── Content CRUD ────────────────────────────────────────────────────────────

export async function getContentList(_token: string): Promise<MindsetContent[]> {
  return adminRequest<MindsetContent[]>('/admin/mindset/content?size=200');
}

export async function createContent(
  _token: string,
  data: CreateMindsetContentRequest,
): Promise<MindsetContent> {
  return adminRequest<MindsetContent>('/admin/mindset/content', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateContent(
  _token: string,
  id: string,
  data: UpdateMindsetContentRequest,
): Promise<MindsetContent> {
  return adminRequest<MindsetContent>(`/admin/mindset/content/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteContent(_token: string, id: string): Promise<void> {
  await adminRequest<void>(`/admin/mindset/content/${id}`, { method: 'DELETE' });
}

export async function bulkCreateContent(
  _token: string,
  data: BulkCreateRequest,
): Promise<BulkUploadResult> {
  return adminRequest<BulkUploadResult>('/admin/mindset/content/bulk', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── Theme CRUD ──────────────────────────────────────────────────────────────

export async function getThemeList(_token: string): Promise<MindsetTheme[]> {
  return adminRequest<MindsetTheme[]>('/admin/mindset/themes');
}

export async function createTheme(
  _token: string,
  data: CreateMindsetThemeRequest,
): Promise<MindsetTheme> {
  return adminRequest<MindsetTheme>('/admin/mindset/themes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTheme(
  _token: string,
  id: string,
  data: UpdateMindsetThemeRequest,
): Promise<MindsetTheme> {
  return adminRequest<MindsetTheme>(`/admin/mindset/themes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteTheme(_token: string, id: string): Promise<void> {
  await adminRequest<void>(`/admin/mindset/themes/${id}`, { method: 'DELETE' });
}

// ── Stats ───────────────────────────────────────────────────────────────────

export async function getMindsetStats(_token: string): Promise<MindsetStats> {
  return adminRequest<MindsetStats>('/admin/mindset/stats');
}
