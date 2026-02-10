/**
 * Encrypted Fields Registry — Maps API paths to their sensitive field names.
 *
 * This registry drives the automatic encryption/decryption interceptor.
 * Only user-generated content is encrypted. System fields (IDs, timestamps,
 * enums, foreign keys) are never encrypted — the server needs them for
 * queries, sorting, and filtering.
 *
 * Adding a new encrypted field:
 * 1. Add the path + field name here
 * 2. That's it — the interceptor handles the rest (DRY, KISS)
 *
 * @module services/encryption/encryptedFields
 */

import type { FieldEncryptionConfig } from '../../types/encryption.types';

// ============================================================================
// Encrypted Field Configurations
// ============================================================================

const ENCRYPTED_FIELD_CONFIGS: FieldEncryptionConfig[] = [
  // ── Tasks ─────────────────────────────────────────────────────────────
  {
    pathPattern: '/tasks',
    fields: ['title', 'description', 'notes', 'location'],
    isPaginated: true,
  },
  {
    pathPattern: '/tasks/bulk',
    fields: ['title', 'description', 'notes', 'location'],
  },

  // ── Task Comments ─────────────────────────────────────────────────────
  {
    pathPattern: '/tasks/.*/comments',
    fields: ['content'],
    isPaginated: true,
  },

  // ── Task Checklist Items ──────────────────────────────────────────────
  {
    pathPattern: '/tasks/.*/checklist',
    fields: ['title'],
  },

  // ── Epics ─────────────────────────────────────────────────────────────
  {
    pathPattern: '/epics',
    fields: ['title', 'description'],
    isPaginated: true,
  },

  // ── Sprints ───────────────────────────────────────────────────────────
  {
    pathPattern: '/sprints',
    fields: ['goals', 'sprintGoal'],
  },

  // ── SensAI Conversations ──────────────────────────────────────────────
  {
    pathPattern: '/sensai/conversations',
    fields: ['content', 'message', 'summary'],
  },
  {
    pathPattern: '/sensai/messages',
    fields: ['content', 'message'],
  },
  {
    pathPattern: '/sensai/standup',
    fields: ['accomplishments', 'blockers', 'plans', 'notes'],
  },

  // ── Community ─────────────────────────────────────────────────────────
  {
    pathPattern: '/community/stories',
    fields: ['title', 'content', 'body'],
    isPaginated: true,
  },
  {
    pathPattern: '/community/questions',
    fields: ['title', 'content', 'body'],
    isPaginated: true,
  },
  {
    pathPattern: '/community/compliments',
    fields: ['content', 'message'],
  },

  // ── Family ────────────────────────────────────────────────────────────
  {
    pathPattern: '/family/members',
    fields: ['name', 'nickname', 'notes'],
  },
  {
    pathPattern: '/family/invitations',
    fields: ['message'],
  },

  // ── Challenges ────────────────────────────────────────────────────────
  {
    pathPattern: '/challenges/.*/entries',
    fields: ['content', 'notes', 'reflection'],
  },

  // ── Notifications ─────────────────────────────────────────────────────
  {
    pathPattern: '/notifications',
    fields: ['title', 'body', 'message'],
    isPaginated: true,
  },

  // ── Bills ─────────────────────────────────────────────────────────────
  {
    pathPattern: '/bills',
    fields: ['description', 'notes'],
  },

  // ── Command Center Drafts ─────────────────────────────────────────────
  {
    pathPattern: '/command-center/drafts',
    fields: ['content', 'title', 'description'],
  },

  // ── AI Endpoints — SKIP ENCRYPTION (server needs plaintext for AI) ───
  {
    pathPattern: '/command-center/smart-input',
    fields: [],
    skipEncryption: true,
  },
  {
    pathPattern: '/command-center/stream',
    fields: [],
    skipEncryption: true,
  },
  {
    pathPattern: '/sensai/chat',
    fields: [],
    skipEncryption: true,
  },
  {
    pathPattern: '/sensai/smart-input',
    fields: [],
    skipEncryption: true,
  },
];

// ============================================================================
// Lookup Helpers
// ============================================================================

/**
 * Find the encryption config for a given API path.
 *
 * @param path  The API path (e.g., '/tasks', '/epics/123')
 * @returns     The matching config, or null if no encryption needed
 */
export function findFieldConfig(path: string): FieldEncryptionConfig | null {
  // Strip query params and API version prefix
  const cleanPath = path.split('?')[0].replace(/^\/api\/v\d+/, '');

  for (const config of ENCRYPTED_FIELD_CONFIGS) {
    const regex = new RegExp(`^${config.pathPattern}(/[^/]+)?$`);
    if (regex.test(cleanPath)) {
      return config;
    }
  }

  return null;
}

/**
 * Check if a path should skip encryption entirely (AI endpoints).
 */
export function shouldSkipEncryption(path: string): boolean {
  const config = findFieldConfig(path);
  return config?.skipEncryption === true;
}

/**
 * Get the list of field names to encrypt for a given API path.
 *
 * @param path  The API path
 * @returns     Array of field names, or empty array if none
 */
export function getEncryptableFields(path: string): string[] {
  const config = findFieldConfig(path);
  if (!config || config.skipEncryption) return [];
  return config.fields;
}
