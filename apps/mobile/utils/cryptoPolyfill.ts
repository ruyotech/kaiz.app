/**
 * Crypto Polyfill for React Native (Hermes).
 *
 * Hermes does NOT provide `globalThis.crypto.getRandomValues` which is
 * required by @noble/ciphers and @noble/hashes. This polyfill bridges
 * the gap using expo-crypto (which delegates to native SecureRandom on
 * Android and SecRandomCopyBytes on iOS).
 *
 * MUST be imported at the very top of `app/_layout.tsx` — before any
 * other import that touches @noble/* (directly or transitively).
 *
 * @module utils/cryptoPolyfill
 */

import { getRandomValues } from 'expo-crypto';

// Polyfill globalThis.crypto if missing (React Native / Hermes)
if (typeof globalThis.crypto === 'undefined') {
  // @ts-expect-error — partial Crypto implementation, only what noble needs
  globalThis.crypto = {};
}

if (typeof globalThis.crypto.getRandomValues !== 'function') {
  // expo-crypto's getRandomValues has the same signature as Web Crypto
  // @ts-expect-error — TypeScript expects the full Crypto type
  globalThis.crypto.getRandomValues = getRandomValues;
}
