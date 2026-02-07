/**
 * Admin Mindset API — CRUD for quotes, themes, stats
 */
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  const result: ApiResponse<T> = await response.json();
  return result.data;
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

// ── Content CRUD ────────────────────────────────────────────────────────────

export async function getContentList(token: string): Promise<MindsetContent[]> {
  return fetchApi<MindsetContent[]>('/api/v1/admin/mindset/content', {
    headers: authHeaders(token),
  });
}

export async function createContent(
  token: string,
  data: CreateMindsetContentRequest,
): Promise<MindsetContent> {
  return fetchApi<MindsetContent>('/api/v1/admin/mindset/content', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function updateContent(
  token: string,
  id: string,
  data: UpdateMindsetContentRequest,
): Promise<MindsetContent> {
  return fetchApi<MindsetContent>(`/api/v1/admin/mindset/content/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function deleteContent(token: string, id: string): Promise<void> {
  await fetch(`${API_BASE_URL}/api/v1/admin/mindset/content/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders(token) },
  });
}

export async function bulkCreateContent(
  token: string,
  data: BulkCreateRequest,
): Promise<BulkUploadResult> {
  return fetchApi<BulkUploadResult>('/api/v1/admin/mindset/content/bulk', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

// ── Theme CRUD ──────────────────────────────────────────────────────────────

export async function getThemeList(token: string): Promise<MindsetTheme[]> {
  return fetchApi<MindsetTheme[]>('/api/v1/admin/mindset/themes', {
    headers: authHeaders(token),
  });
}

export async function createTheme(
  token: string,
  data: CreateMindsetThemeRequest,
): Promise<MindsetTheme> {
  return fetchApi<MindsetTheme>('/api/v1/admin/mindset/themes', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function updateTheme(
  token: string,
  id: string,
  data: UpdateMindsetThemeRequest,
): Promise<MindsetTheme> {
  return fetchApi<MindsetTheme>(`/api/v1/admin/mindset/themes/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function deleteTheme(token: string, id: string): Promise<void> {
  await fetch(`${API_BASE_URL}/api/v1/admin/mindset/themes/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders(token) },
  });
}

// ── Stats ───────────────────────────────────────────────────────────────────

export async function getMindsetStats(token: string): Promise<MindsetStats> {
  return fetchApi<MindsetStats>('/api/v1/admin/mindset/stats', {
    headers: authHeaders(token),
  });
}
