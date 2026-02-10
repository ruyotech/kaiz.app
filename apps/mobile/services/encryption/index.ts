/**
 * Encryption Module — Barrel export (allowed exception per copilot-instructions).
 *
 * Re-exports all encryption-related modules for clean imports:
 *   import { encrypt, decrypt, useEncryptionStore } from '../services/encryption';
 */

// Core crypto primitives
export {
  deriveKey,
  encrypt,
  decrypt,
  isEncrypted,
  generateMasterKey,
  generateSalt,
  wrapMasterKey,
  unwrapMasterKey,
  hashKey,
  keyToBase64,
  base64ToKey,
  generateRecoveryMnemonic,
  deriveKeyFromMnemonic,
} from './cryptoService';

// Encrypted field registry
export {
  findFieldConfig,
  shouldSkipEncryption,
  getEncryptableFields,
} from './encryptedFields';

// Axios interceptor functions
export {
  encryptRequestPayload,
  decryptResponsePayload,
} from './encryptionInterceptor';

// Encryption store (Zustand)
export {
  useEncryptionStore,
  getEncryptionKey,
} from './encryptionStore';
