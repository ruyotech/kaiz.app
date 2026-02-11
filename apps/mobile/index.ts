/**
 * Custom entry point — MUST polyfill crypto BEFORE expo-router loads.
 *
 * @noble/ciphers and @noble/hashes capture `globalThis.crypto` in a
 * module-level const the first time they are evaluated. If that happens
 * before the polyfill runs, their local `crypto` stays `undefined` forever
 * and `randomBytes()` throws "crypto.getRandomValues must be defined".
 *
 * By importing the polyfill HERE (the true `"main"` entry point), we
 * guarantee it runs before any require chain can touch @noble/*.
 */

// ⚠️ MUST be the very first import — nothing else above this line!
import './utils/cryptoPolyfill';

// Now safe to load expo-router (and everything else)
import 'expo-router/entry';
