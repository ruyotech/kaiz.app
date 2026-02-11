/**
 * Metro configuration for KAIZ mobile app.
 *
 * Key customisation: redirects @noble/ciphers/crypto and @noble/hashes/crypto
 * to our shim (shims/noble-crypto.js) so that noble's randomBytes() uses
 * expo-crypto instead of the missing globalThis.crypto on Hermes.
 *
 * @see https://docs.expo.dev/guides/customizing-metro/
 */
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Path to our crypto shim
const nobleCryptoShim = path.resolve(__dirname, 'shims', 'noble-crypto.js');

// Intercept noble's internal crypto.js imports and redirect to our shim
const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Match: @noble/ciphers/crypto or @noble/hashes/crypto (with or without .js)
  if (
    moduleName === '@noble/ciphers/crypto' ||
    moduleName === '@noble/ciphers/crypto.js' ||
    moduleName === '@noble/hashes/crypto' ||
    moduleName === '@noble/hashes/crypto.js'
  ) {
    return {
      filePath: nobleCryptoShim,
      type: 'sourceFile',
    };
  }

  // Also catch the require("./crypto.js") from within noble packages
  if (
    moduleName === './crypto.js' &&
    context.originModulePath &&
    (context.originModulePath.includes('@noble/ciphers') ||
      context.originModulePath.includes('@noble/hashes'))
  ) {
    return {
      filePath: nobleCryptoShim,
      type: 'sourceFile',
    };
  }

  // Fall through to default resolution
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
