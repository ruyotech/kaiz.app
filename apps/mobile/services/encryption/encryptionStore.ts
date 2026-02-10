/**
 * Encryption Store — Key lifecycle management backed by expo-secure-store.
 *
 * This module manages the encryption master key lifecycle:
 * - Initialize: derive wrapping key from password → unwrap/create master key
 * - Get: read master key from SecureStore (for interceptor use)
 * - Clear: wipe key from SecureStore on logout
 *
 * The master key NEVER leaves SecureStore (iOS Keychain / Android Keystore).
 * The encryption interceptor calls `getEncryptionKey()` per-request.
 *
 * Key hierarchy:
 *   password + salt → PBKDF2 → wrappingKey → unwraps → masterKey → encrypts data
 *
 * State is NOT persisted to AsyncStorage — only SecureStore.
 *
 * @module services/encryption/encryptionStore
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { logger } from '../../utils/logger';
import {
  deriveKey,
  generateMasterKey,
  generateSalt,
  wrapMasterKey,
  unwrapMasterKey,
  hashKey,
  keyToBase64,
  base64ToKey,
} from './cryptoService';
import {
  ENCRYPTION_STORE_KEYS,
  ENCRYPTION_VERSION,
  type EncryptionKey,
  type EncryptionState,
  type WrappedMasterKey,
} from '../../types/encryption.types';

const TAG = 'EncryptionStore';

// ============================================================================
// SecureStore Helpers
// ============================================================================

async function storeMasterKey(key: EncryptionKey): Promise<void> {
  await SecureStore.setItemAsync(
    ENCRYPTION_STORE_KEYS.MASTER_KEY,
    keyToBase64(key),
  );
}

async function readMasterKey(): Promise<EncryptionKey | null> {
  try {
    const b64 = await SecureStore.getItemAsync(ENCRYPTION_STORE_KEYS.MASTER_KEY);
    if (!b64) return null;
    return base64ToKey(b64);
  } catch {
    return null;
  }
}

async function deleteMasterKey(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(ENCRYPTION_STORE_KEYS.MASTER_KEY);
  } catch {
    // Ignore — key may not exist
  }
}

async function storeSalt(salt: string): Promise<void> {
  await SecureStore.setItemAsync(ENCRYPTION_STORE_KEYS.SALT, salt);
}

async function readSalt(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(ENCRYPTION_STORE_KEYS.SALT);
  } catch {
    return null;
  }
}

async function deleteSalt(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(ENCRYPTION_STORE_KEYS.SALT);
  } catch {
    // Ignore
  }
}

async function storeWrappedKey(wrapped: string): Promise<void> {
  await SecureStore.setItemAsync(ENCRYPTION_STORE_KEYS.WRAPPED_MASTER_KEY, wrapped);
}

async function readWrappedKey(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(ENCRYPTION_STORE_KEYS.WRAPPED_MASTER_KEY);
  } catch {
    return null;
  }
}

async function deleteWrappedKey(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(ENCRYPTION_STORE_KEYS.WRAPPED_MASTER_KEY);
  } catch {
    // Ignore
  }
}

// ============================================================================
// Zustand Store
// ============================================================================

interface EncryptionActions {
  /**
   * Initialize encryption for a NEW user (registration).
   *
   * 1. Generate random master key
   * 2. Derive wrapping key from password + salt
   * 3. Wrap master key with wrapping key
   * 4. Store master key in SecureStore
   * 5. Return wrapped key + key hash for server storage
   */
  initializeNewUser: (
    password: string,
    salt: string,
  ) => Promise<{
    wrappedMasterKey: string;
    keyHash: string;
  }>;

  /**
   * Initialize encryption for an EXISTING user (login).
   *
   * 1. Derive wrapping key from password + salt
   * 2. Unwrap master key using wrapping key
   * 3. Store master key in SecureStore
   */
  initializeExistingUser: (
    password: string,
    salt: string,
    wrappedMasterKey: string,
  ) => Promise<void>;

  /**
   * Initialize encryption from a stored key (biometric login / session restore).
   *
   * Master key already in SecureStore — just mark as initialized.
   */
  initializeFromSecureStore: () => Promise<boolean>;

  /**
   * Re-wrap master key with a new password (password change).
   *
   * 1. Read existing master key from SecureStore
   * 2. Derive new wrapping key from new password + new salt
   * 3. Wrap master key with new wrapping key
   * 4. Return new wrapped key + key hash for server update
   */
  rewrapForPasswordChange: (
    newPassword: string,
    newSalt: string,
  ) => Promise<{
    wrappedMasterKey: string;
    keyHash: string;
  } | null>;

  /** Clear all encryption keys from SecureStore (logout) */
  clearEncryption: () => Promise<void>;

  /** Set whether the user has a recovery key */
  setHasRecoveryKey: (has: boolean) => void;
}

export const useEncryptionStore = create<EncryptionState & EncryptionActions>()(
  (set) => ({
    // ── State ──────────────────────────────────────────────────────────
    isInitialized: false,
    encryptionVersion: ENCRYPTION_VERSION,
    hasRecoveryKey: false,
    isProcessing: false,
    error: null,

    // ── Actions ────────────────────────────────────────────────────────

    initializeNewUser: async (password, salt) => {
      set({ isProcessing: true, error: null });
      try {
        logger.info(TAG, 'Initializing encryption for new user…');

        // Generate random master key
        const masterKey = generateMasterKey();

        // Derive wrapping key from password
        const wrappingKey = deriveKey(password, salt);

        // Wrap master key
        const wrapped = wrapMasterKey(masterKey, wrappingKey);

        // Hash key for server-side verification
        const keyHash = hashKey(masterKey);

        // Store master key + salt in SecureStore
        await storeMasterKey(masterKey);
        await storeSalt(salt);
        await storeWrappedKey(wrapped.encryptedKey);

        set({ isInitialized: true, isProcessing: false });
        logger.info(TAG, 'Encryption initialized for new user');

        return {
          wrappedMasterKey: wrapped.encryptedKey,
          keyHash,
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Encryption init failed';
        logger.error(TAG, 'Failed to initialize encryption for new user', error);
        set({ isProcessing: false, error: message });
        throw error;
      }
    },

    initializeExistingUser: async (password, salt, wrappedMasterKey) => {
      set({ isProcessing: true, error: null });
      try {
        logger.info(TAG, 'Initializing encryption for existing user (login)…');

        // Derive wrapping key from password
        const wrappingKey = deriveKey(password, salt);

        // Unwrap master key
        const wrapped: WrappedMasterKey = {
          encryptedKey: wrappedMasterKey,
          version: ENCRYPTION_VERSION,
        };
        const masterKey = unwrapMasterKey(wrapped, wrappingKey);

        // Store in SecureStore
        await storeMasterKey(masterKey);
        await storeSalt(salt);
        await storeWrappedKey(wrappedMasterKey);

        set({ isInitialized: true, isProcessing: false });
        logger.info(TAG, 'Encryption initialized for existing user');
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Decryption key init failed';
        logger.error(TAG, 'Failed to initialize encryption (wrong password?)', error);
        set({ isProcessing: false, error: message });
        throw error;
      }
    },

    initializeFromSecureStore: async () => {
      try {
        const key = await readMasterKey();
        if (key && key.length === 32) {
          set({ isInitialized: true });
          logger.info(TAG, 'Encryption restored from SecureStore');
          return true;
        }
        logger.debug(TAG, 'No encryption key in SecureStore');
        return false;
      } catch {
        return false;
      }
    },

    rewrapForPasswordChange: async (newPassword, newSalt) => {
      try {
        logger.info(TAG, 'Re-wrapping master key for password change…');

        const masterKey = await readMasterKey();
        if (!masterKey) {
          logger.error(TAG, 'No master key found for re-wrapping');
          return null;
        }

        const newWrappingKey = deriveKey(newPassword, newSalt);
        const wrapped = wrapMasterKey(masterKey, newWrappingKey);
        const keyHash = hashKey(masterKey);

        // Update salt + wrapped key in SecureStore
        await storeSalt(newSalt);
        await storeWrappedKey(wrapped.encryptedKey);

        logger.info(TAG, 'Master key re-wrapped for new password');
        return {
          wrappedMasterKey: wrapped.encryptedKey,
          keyHash,
        };
      } catch (error: unknown) {
        logger.error(TAG, 'Failed to re-wrap master key', error);
        return null;
      }
    },

    clearEncryption: async () => {
      logger.info(TAG, 'Clearing all encryption keys');
      await deleteMasterKey();
      await deleteSalt();
      await deleteWrappedKey();
      set({
        isInitialized: false,
        hasRecoveryKey: false,
        isProcessing: false,
        error: null,
      });
    },

    setHasRecoveryKey: (has) => {
      set({ hasRecoveryKey: has });
    },
  }),
);

// ============================================================================
// Module-level accessor — used by encryptionInterceptor (non-React context)
// ============================================================================

/**
 * Get the current encryption key from SecureStore.
 *
 * Called by the Axios interceptor on every request/response.
 * Returns null if encryption is not initialized (pre-login).
 */
export async function getEncryptionKey(): Promise<EncryptionKey | null> {
  const { isInitialized } = useEncryptionStore.getState();
  if (!isInitialized) return null;
  return readMasterKey();
}
