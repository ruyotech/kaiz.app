/**
 * Admin Essentia API — CRUD for books, cards, bulk ops, stats
 *
 * Uses the same adminRequest pattern as mindset/command-center admin pages
 * so auth tokens, response unwrapping, and error handling are consistent.
 */
import { getAdminAccessToken } from '@/lib/api';
import type {
  EssentiaBook,
  EssentiaCard,
  CreateBookRequest,
  UpdateBookRequest,
  CreateCardRequest,
  UpdateCardRequest,
  BulkImportRequest,
  BulkUpdateRequest,
  BookStats,
} from '@/types/essentia';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://kaiz-api-213334506754.us-central1.run.app';
const API_V1 = `${API_BASE_URL}/api/v1`;

/**
 * Mirrors adminRequest() from other admin API modules — auto-attaches admin
 * token, properly unwraps { success, data } responses.
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
    throw new Error(
      data?.message || data?.error || `API Error ${response.status}`,
    );
  }

  // Unwrap { success, data } wrapper (matches backend ApiResponse<T>)
  if (
    data &&
    typeof data === 'object' &&
    'success' in data &&
    data.data !== undefined
  ) {
    return data.data as T;
  }

  return data as T;
}

// ── Book CRUD ───────────────────────────────────────────────────────────────

export async function getAllBooks(): Promise<EssentiaBook[]> {
  return adminRequest<EssentiaBook[]>('/admin/essentia/books');
}

export async function getBooksByLifeWheelArea(
  areaId: string,
): Promise<EssentiaBook[]> {
  return adminRequest<EssentiaBook[]>(
    `/admin/essentia/books/life-wheel/${areaId}`,
  );
}

export async function getBookById(id: string): Promise<EssentiaBook> {
  return adminRequest<EssentiaBook>(`/admin/essentia/books/${id}`);
}

export async function createBook(
  data: CreateBookRequest,
): Promise<EssentiaBook> {
  return adminRequest<EssentiaBook>('/admin/essentia/books', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateBook(
  id: string,
  data: UpdateBookRequest,
): Promise<EssentiaBook> {
  return adminRequest<EssentiaBook>(`/admin/essentia/books/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteBook(id: string): Promise<void> {
  await adminRequest<void>(`/admin/essentia/books/${id}`, {
    method: 'DELETE',
  });
}

// ── Card CRUD ───────────────────────────────────────────────────────────────

export async function createCard(
  bookId: string,
  data: CreateCardRequest,
): Promise<EssentiaCard> {
  return adminRequest<EssentiaCard>(
    `/admin/essentia/books/${bookId}/cards`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  );
}

export async function updateCard(
  cardId: string,
  data: UpdateCardRequest,
): Promise<EssentiaCard> {
  return adminRequest<EssentiaCard>(`/admin/essentia/cards/${cardId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCard(cardId: string): Promise<void> {
  await adminRequest<void>(`/admin/essentia/cards/${cardId}`, {
    method: 'DELETE',
  });
}

// ── Bulk Operations ─────────────────────────────────────────────────────────

export async function bulkImportBooks(
  data: BulkImportRequest,
): Promise<EssentiaBook[]> {
  return adminRequest<EssentiaBook[]>('/admin/essentia/books/bulk-import', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function bulkUpdateBooks(
  data: BulkUpdateRequest,
): Promise<EssentiaBook[]> {
  return adminRequest<EssentiaBook[]>('/admin/essentia/books/bulk-update', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ── Stats ───────────────────────────────────────────────────────────────────

export async function getBookStats(): Promise<BookStats> {
  return adminRequest<BookStats>('/admin/essentia/stats');
}
