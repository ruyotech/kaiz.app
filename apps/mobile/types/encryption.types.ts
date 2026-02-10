/**
 * Encryption Types — Zero-Knowledge Encryption type definitions.
 *
 * These types define the contract for the client-side encryption system.
 * The server never sees plaintext — all encryption/decryption happens on-device.
 */

// ============================================================================
// Core Encryption Types
// ============================================================================

/** Version-prefixed ciphertext: `v1:{base64(iv)}:{base64(ciphertext+tag)}` */
export type Ciphertext = string;

/** 32-byte AES-256 key as Uint8Array */
export type EncryptionKey = Uint8Array;

/** Hex-encoded salt string */
export type Salt = string;

/** Current encryption algorithm version */
export const ENCRYPTION_VERSION = 1;

/** Ciphertext format prefix for algorithm rotation */
export const CIPHERTEXT_PREFIX = 'v1' as const;

// ============================================================================
// Key Hierarchy (double-layer)
//
// password → PBKDF2 → wrappingKey → unwraps → masterKey → encrypts data
//
// Benefits:
// - Password change only re-wraps masterKey (cheap, no data re-encryption)
// - Recovery key independently wraps the same masterKey
// - masterKey is random, not password-derived (stronger)
// ============================================================================

/** Encrypted master key blob stored on the server */
export interface WrappedMasterKey {
  /** Ciphertext of the master key encrypted with the wrapping key */
  encryptedKey: Ciphertext;
  /** Version of the wrapping algorithm */
  version: number;
}

/** Recovery key material returned once to the user */
export interface RecoveryKeyData {
  /** 24-word mnemonic phrase */
  mnemonic: string;
  /** The recovery wrapping key derived from the mnemonic (ephemeral, shown once) */
  wrappedMasterKey: Ciphertext;
}

// ============================================================================
// API Types — match backend DTOs
// ============================================================================

/** Response from GET /api/v1/auth/encryption-salt */
export interface EncryptionSaltResponse {
  salt: string;
  encryptionVersion: number;
  hasRecoveryKey: boolean;
}

/** Request for POST /api/v1/auth/encryption-key-verify */
export interface EncryptionKeyVerifyRequest {
  keyHash: string;
  wrappedMasterKey: string;
  encryptionVersion: number;
}

/** Request for POST /api/v1/auth/recovery-key */
export interface RecoveryKeyStoreRequest {
  recoveryBlob: string;
}

/** Response from GET /api/v1/auth/recovery-key */
export interface RecoveryKeyRetrieveResponse {
  recoveryBlob: string;
}

// ============================================================================
// Encryption Store State
// ============================================================================

export interface EncryptionState {
  /** Whether the encryption system is initialized and ready */
  isInitialized: boolean;
  /** Current encryption version */
  encryptionVersion: number;
  /** Whether the user has set up a recovery key */
  hasRecoveryKey: boolean;
  /** Whether encryption operations are in progress */
  isProcessing: boolean;
  /** Last error message */
  error: string | null;
}

// ============================================================================
// Encrypted Field Configuration
// ============================================================================

/** Configuration for which fields to encrypt per API path */
export interface FieldEncryptionConfig {
  /** API path pattern (e.g., '/tasks', '/epics') */
  pathPattern: string;
  /** Field names to encrypt in request/response bodies */
  fields: string[];
  /** Whether to skip encryption for this path (e.g., AI endpoints) */
  skipEncryption?: boolean;
  /** Whether the response is paginated (data in content/items array) */
  isPaginated?: boolean;
  /** Nested object path where fields live (e.g., for array responses) */
  nestedPath?: string;
}

// ============================================================================
// SecureStore Keys
// ============================================================================

export const ENCRYPTION_STORE_KEYS = {
  /** AES-256 master encryption key (32 bytes, base64) */
  MASTER_KEY: 'kaiz_encryption_master_key',
  /** User's encryption salt (hex string) */
  SALT: 'kaiz_encryption_salt',
  /** Wrapped master key blob (for password change scenarios) */
  WRAPPED_MASTER_KEY: 'kaiz_wrapped_master_key',
} as const;
