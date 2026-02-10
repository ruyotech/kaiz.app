/**
 * useEncryptedSearch — Client-side search across encrypted cached data.
 *
 * Since encrypted fields cannot be searched server-side, this hook:
 * 1. Reads TanStack Query cache for the given query keys
 * 2. Decrypts the searchable fields in-memory using the master key
 * 3. Filters items matching the search term
 * 4. Returns the filtered results
 *
 * Usage:
 * ```tsx
 * const { results, isSearching } = useEncryptedSearch({
 *   queryKey: taskKeys.bySprint(sprintId),
 *   searchTerm: 'grocery',
 *   searchFields: ['title', 'description'],
 * });
 * ```
 *
 * @module hooks/useEncryptedSearch
 */

import { useMemo, useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { decrypt, isEncrypted } from '../services/encryption/cryptoService';
import { getEncryptionKey } from '../services/encryption/encryptionStore';
import { logger } from '../utils/logger';
import type { EncryptionKey } from '../types/encryption.types';

const TAG = 'useEncryptedSearch';
const MIN_SEARCH_LENGTH = 2;

interface UseEncryptedSearchOptions<T> {
  /** The TanStack Query key whose cache data to search */
  queryKey: readonly unknown[];
  /** The search term (user input). Empty = no filtering. */
  searchTerm: string;
  /** Which fields on each item to search (these may be encrypted) */
  searchFields: (keyof T)[];
  /** Optional: debounce delay in ms (default: 300) */
  debounceMs?: number;
  /** Optional: maximum results to return (default: 50) */
  maxResults?: number;
  /** Optional: extract the items array from the cached query data */
  extractItems?: (data: unknown) => T[];
}

interface UseEncryptedSearchResult<T> {
  /** Filtered results matching the search term */
  results: T[];
  /** Whether decryption + search is in progress */
  isSearching: boolean;
  /** Total items in cache (before filtering) */
  totalItems: number;
}

/**
 * Default extractor: handles common response shapes:
 * - Array directly
 * - { content: T[] } (Spring Page)
 * - { data: T[] }
 * - { items: T[] }
 */
function defaultExtractItems<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.content)) return obj.content as T[];
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
  }
  return [];
}

/**
 * Decrypt a single field value if it's encrypted, otherwise return as-is.
 */
async function decryptFieldValue(
  value: unknown,
  key: EncryptionKey,
): Promise<string> {
  if (typeof value !== 'string') return '';
  if (!isEncrypted(value)) return value;
  try {
    return decrypt(value, key);
  } catch {
    // Field may not actually be encrypted (e.g., legacy data)
    return value;
  }
}

export function useEncryptedSearch<T extends Record<string, unknown>>({
  queryKey,
  searchTerm,
  searchFields,
  debounceMs = 300,
  maxResults = 50,
  extractItems = defaultExtractItems,
}: UseEncryptedSearchOptions<T>): UseEncryptedSearchResult<T> {
  const queryClient = useQueryClient();
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const searchIdRef = useRef(0);

  // Debounced search term
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  // Perform the search
  useEffect(() => {
    const term = debouncedTerm.trim().toLowerCase();

    // Clear results if search term too short
    if (term.length < MIN_SEARCH_LENGTH) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const currentSearchId = ++searchIdRef.current;

    async function performSearch() {
      setIsSearching(true);
      try {
        // Read from TanStack Query cache
        const cachedData = queryClient.getQueryData(queryKey);
        if (!cachedData) {
          setResults([]);
          setTotalItems(0);
          return;
        }

        const items = extractItems(cachedData);
        setTotalItems(items.length);

        if (items.length === 0) {
          setResults([]);
          return;
        }

        // Get encryption key
        const encryptionKey = await getEncryptionKey();

        const matched: T[] = [];

        for (const item of items) {
          if (matched.length >= maxResults) break;

          let isMatch = false;

          for (const field of searchFields) {
            const rawValue = item[field];
            let searchableValue: string;

            if (encryptionKey && typeof rawValue === 'string' && isEncrypted(rawValue)) {
              searchableValue = await decryptFieldValue(rawValue, encryptionKey);
            } else {
              searchableValue = typeof rawValue === 'string' ? rawValue : '';
            }

            if (searchableValue.toLowerCase().includes(term)) {
              isMatch = true;
              break;
            }
          }

          if (isMatch) {
            matched.push(item);
          }
        }

        // Only update if this is still the latest search
        if (currentSearchId === searchIdRef.current) {
          setResults(matched);
        }
      } catch (error: unknown) {
        logger.error(TAG, 'Encrypted search failed', error);
        if (currentSearchId === searchIdRef.current) {
          setResults([]);
        }
      } finally {
        if (currentSearchId === searchIdRef.current) {
          setIsSearching(false);
        }
      }
    }

    performSearch();
  }, [debouncedTerm, queryKey, searchFields, maxResults, queryClient, extractItems]);

  return useMemo(
    () => ({ results, isSearching, totalItems }),
    [results, isSearching, totalItems],
  );
}
