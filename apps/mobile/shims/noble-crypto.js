/**
 * Shim for @noble/ciphers/crypto and @noble/hashes/crypto.
 *
 * These modules export `{ crypto }` which noble's randomBytes() depends on.
 * On Hermes (React Native), `globalThis.crypto` is undefined at module load
 * time, so noble's original crypto.js captures `undefined` and randomBytes
 * always throws "crypto.getRandomValues must be defined".
 *
 * This shim provides a lazy getter that defers to expo-crypto's native
 * getRandomValues (SecureRandom on Android, SecRandomCopyBytes on iOS).
 *
 * Metro's resolver redirects:
 *   @noble/ciphers/crypto → this file
 *   @noble/hashes/crypto  → this file
 */
"use strict";

const { getRandomValues } = require('expo-crypto');

// Build a minimal crypto-like object that noble needs
const cryptoShim = {
  getRandomValues: function (buffer) {
    return getRandomValues(buffer);
  },
};

// Also set globalThis.crypto for any other code that checks it
if (typeof globalThis.crypto === 'undefined' || globalThis.crypto === null) {
  globalThis.crypto = cryptoShim;
} else if (typeof globalThis.crypto.getRandomValues !== 'function') {
  globalThis.crypto.getRandomValues = cryptoShim.getRandomValues;
}

// This is what noble's crypto.js exports
exports.crypto = cryptoShim;
