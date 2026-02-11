/**
 * Crypto Polyfill for React Native (Hermes).
 *
 * Hermes does NOT provide `globalThis.crypto.getRandomValues` which is
 * required by @noble/ciphers and @noble/hashes. This polyfill bridges
 * the gap using expo-crypto (which delegates to native SecureRandom on
 * Android and SecRandomCopyBytes on iOS).
 *
 * MUST be imported at the very top of the app entry point (`index.ts`)
 * — before expo-router or any module that transitively imports @noble/*.
 *
 * @noble/ciphers/crypto.js captures `globalThis.crypto` in a module-level
 * const at first evaluation. If that const is captured as `undefined`, no
 * later mutation of `globalThis.crypto` will fix it. That is why this
 * polyfill MUST run before any @noble module is required.
 *
 * @module utils/cryptoPolyfill
 */

import { getRandomValues as expoGetRandomValues } from 'expo-crypto';

// Step 1: Ensure globalThis.crypto exists as a mutable object
if (typeof globalThis.crypto === 'undefined' || globalThis.crypto === null) {
  // @ts-expect-error — partial Crypto implementation, only what @noble needs
  globalThis.crypto = {} as Crypto;
}

// Step 2: Patch getRandomValues if missing or non-functional
if (typeof globalThis.crypto.getRandomValues !== 'function') {
  // @ts-expect-error — TypeScript expects the full Crypto type
  globalThis.crypto.getRandomValues = expoGetRandomValues;
}

// Step 3: Verify the polyfill actually works (catch frozen-object edge cases)
try {
  const test = new Uint8Array(4);
  globalThis.crypto.getRandomValues(test);
} catch {
  // If the existing crypto object is frozen / non-extensible, replace it
  // @ts-expect-error — forcibly replacing the crypto object
  globalThis.crypto = {
    getRandomValues: expoGetRandomValues,
  } as Crypto;
}
