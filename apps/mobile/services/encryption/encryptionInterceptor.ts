/**
 * Encryption Interceptor — Transparent encrypt/decrypt for Axios requests.
 *
 * Wired into the single Axios instance (apiClient.ts) to automatically:
 * - Encrypt sensitive fields in outgoing request bodies
 * - Decrypt sensitive fields in incoming response bodies
 *
 * Components and hooks never touch encryption directly — this middleware
 * handles it transparently (DRY, KISS).
 *
 * @module services/encryption/encryptionInterceptor
 */

import { logger } from '../../utils/logger';
import { encrypt, decrypt, isEncrypted } from './cryptoService';
import { getEncryptableFields, shouldSkipEncryption } from './encryptedFields';
import { getEncryptionKey } from './encryptionStore';
import type { EncryptionKey } from '../../types/encryption.types';

const TAG = 'EncryptionInterceptor';

// ============================================================================
// Deep Field Encryption/Decryption
// ============================================================================

/**
 * Recursively encrypt specified fields in a data object.
 *
 * Handles:
 * - Single objects: `{ title: "My Task" }` → `{ title: "v1:..." }`
 * - Arrays: `[{ title: "A" }, { title: "B" }]` → each item encrypted
 * - Nested arrays (bulk create): `{ tasks: [{ title: "A" }] }`
 *
 * @param data    Request/response data (object or array)
 * @param fields  Field names to encrypt
 * @param key     AES-256 encryption key
 * @returns       Data with sensitive fields encrypted
 */
function encryptFields(
  data: unknown,
  fields: string[],
  key: EncryptionKey,
): unknown {
  if (data === null || data === undefined) return data;

  // Handle arrays — encrypt each item
  if (Array.isArray(data)) {
    return data.map((item) => encryptFields(item, fields, key));
  }

  // Handle objects — encrypt matching fields
  if (typeof data === 'object') {
    const result = { ...(data as Record<string, unknown>) };

    for (const fieldName of fields) {
      if (fieldName in result && typeof result[fieldName] === 'string') {
        const value = result[fieldName] as string;
        if (value && !isEncrypted(value)) {
          result[fieldName] = encrypt(value, key);
        }
      }
    }

    // Recurse into known nested arrays (bulk operations)
    for (const nestedKey of Object.keys(result)) {
      if (Array.isArray(result[nestedKey])) {
        result[nestedKey] = (result[nestedKey] as unknown[]).map((item) =>
          encryptFields(item, fields, key),
        );
      }
    }

    return result;
  }

  return data;
}

/**
 * Recursively decrypt specified fields in a data object.
 *
 * Safe for unencrypted data — `decrypt()` returns plaintext as-is
 * if it doesn't have the `v1:` prefix.
 *
 * @param data    Response data (object or array)
 * @param fields  Field names to decrypt
 * @param key     AES-256 encryption key
 * @returns       Data with sensitive fields decrypted
 */
function decryptFields(
  data: unknown,
  fields: string[],
  key: EncryptionKey,
): unknown {
  if (data === null || data === undefined) return data;

  // Handle arrays — decrypt each item
  if (Array.isArray(data)) {
    return data.map((item) => decryptFields(item, fields, key));
  }

  // Handle objects — decrypt matching fields
  if (typeof data === 'object') {
    const result = { ...(data as Record<string, unknown>) };

    for (const fieldName of fields) {
      if (fieldName in result && typeof result[fieldName] === 'string') {
        const value = result[fieldName] as string;
        if (value && isEncrypted(value)) {
          try {
            result[fieldName] = decrypt(value, key);
          } catch (error: unknown) {
            logger.error(TAG, `Failed to decrypt field "${fieldName}"`, error);
            // Leave encrypted value as-is rather than corrupting data
          }
        }
      }
    }

    // Recurse into nested arrays
    for (const nestedKey of Object.keys(result)) {
      if (Array.isArray(result[nestedKey])) {
        result[nestedKey] = (result[nestedKey] as unknown[]).map((item) =>
          decryptFields(item, fields, key),
        );
      }
    }

    return result;
  }

  return data;
}

// ============================================================================
// Public API — Called by apiClient.ts interceptors
// ============================================================================

/**
 * Encrypt sensitive fields in an outgoing request body.
 *
 * Called by the Axios request interceptor before sending.
 * Returns the data unchanged if:
 * - No encryption key is available (user not logged in yet)
 * - The path is marked as skipEncryption (AI endpoints)
 * - No encryptable fields for this path
 *
 * @param data  Request body
 * @param url   API path (e.g., '/tasks')
 * @returns     Body with sensitive fields encrypted
 */
export async function encryptRequestPayload(
  data: unknown,
  url: string,
): Promise<unknown> {
  if (!data || typeof data !== 'object') return data;

  // Skip AI endpoints
  if (shouldSkipEncryption(url)) return data;

  // Get encryptable fields for this path
  const fields = getEncryptableFields(url);
  if (fields.length === 0) return data;

  // Get the encryption key from SecureStore
  const key = await getEncryptionKey();
  if (!key) {
    logger.debug(TAG, `No encryption key available, skipping encryption for ${url}`);
    return data;
  }

  try {
    logger.debug(TAG, `Encrypting ${fields.length} fields for ${url}`);
    return encryptFields(data, fields, key);
  } catch (error: unknown) {
    logger.error(TAG, `Encryption failed for ${url}`, error);
    // Fail open — send unencrypted rather than blocking the request
    // This ensures the app remains functional even if encryption fails
    return data;
  }
}

/**
 * Decrypt sensitive fields in an incoming response body.
 *
 * Called by the Axios response handler after receiving.
 * Handles both direct objects and paginated responses (content/items arrays).
 *
 * @param data  Response body (unwrapped from ApiResponse)
 * @param url   API path
 * @returns     Body with sensitive fields decrypted
 */
export async function decryptResponsePayload(
  data: unknown,
  url: string,
): Promise<unknown> {
  if (!data) return data;

  // Skip AI endpoints
  if (shouldSkipEncryption(url)) return data;

  // Get encryptable fields for this path
  const fields = getEncryptableFields(url);
  if (fields.length === 0) return data;

  // Get the encryption key from SecureStore
  const key = await getEncryptionKey();
  if (!key) {
    logger.debug(TAG, `No encryption key available, skipping decryption for ${url}`);
    return data;
  }

  try {
    // Handle paginated responses — { content: [...], page, size, ... }
    if (typeof data === 'object' && !Array.isArray(data)) {
      const obj = data as Record<string, unknown>;

      // Paginated: decrypt items inside content/items array
      if (Array.isArray(obj.content)) {
        return {
          ...obj,
          content: decryptFields(obj.content, fields, key),
        };
      }
      if (Array.isArray(obj.items)) {
        return {
          ...obj,
          items: decryptFields(obj.items, fields, key),
        };
      }
      // data array wrapper (some endpoints)
      if (Array.isArray(obj.data)) {
        return {
          ...obj,
          data: decryptFields(obj.data, fields, key),
        };
      }
    }

    // Direct object or array
    logger.debug(TAG, `Decrypting ${fields.length} fields for ${url}`);
    return decryptFields(data, fields, key);
  } catch (error: unknown) {
    logger.error(TAG, `Decryption failed for ${url}`, error);
    // Fail open — return data as-is (may show encrypted text, but won't crash)
    return data;
  }
}
