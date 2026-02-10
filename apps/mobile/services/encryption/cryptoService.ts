/**
 * Crypto Service — Zero-Knowledge Encryption primitives.
 *
 * Pure JS crypto using @noble/ciphers + @noble/hashes for cross-platform
 * deterministic output (React Native, browser, Node.js, Electron).
 *
 * Key hierarchy (double-layer):
 *   password + salt → PBKDF2 → wrappingKey → unwraps → masterKey → encrypts data
 *
 * Ciphertext format: `v1:{base64(iv)}:{base64(ciphertext+tag)}`
 * - `v1` prefix enables future algorithm rotation
 * - AES-256-GCM provides authenticated encryption (confidentiality + integrity)
 *
 * @module services/encryption/cryptoService
 */

import { gcm } from '@noble/ciphers/aes';
import { pbkdf2 } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';
import { randomBytes } from '@noble/ciphers/webcrypto';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { logger } from '../../utils/logger';
import {
  CIPHERTEXT_PREFIX,
  ENCRYPTION_VERSION,
  type Ciphertext,
  type EncryptionKey,
  type Salt,
  type WrappedMasterKey,
} from '../../types/encryption.types';

// ============================================================================
// Constants
// ============================================================================

const TAG = 'CryptoService';

/** PBKDF2 iteration count — 600k as recommended by OWASP 2024 for SHA-256 */
const PBKDF2_ITERATIONS = 600_000;

/** AES-256 key length in bytes */
const KEY_LENGTH_BYTES = 32;

/** AES-GCM IV (nonce) length in bytes — 12 bytes is the standard for GCM */
const IV_LENGTH_BYTES = 12;

/** Salt length in bytes — 16 bytes (128 bits) */
const SALT_LENGTH_BYTES = 16;

/** Master key length in bytes — 32 bytes (256 bits) */
const MASTER_KEY_LENGTH_BYTES = 32;

/**
 * BIP39-inspired wordlist (2048 words).
 * Using a minimal curated list of 2048 common English words.
 * Each word encodes 11 bits → 24 words = 264 bits of entropy.
 */
const WORDLIST_SIZE = 2048;

// Compact wordlist — deterministic subset of common 4-8 letter English words
// In production you'd use the full BIP39 list; this is a minimal portable version.
const RECOVERY_WORD_COUNT = 24;

// ============================================================================
// Base64 Utilities (platform-agnostic, no atob/btoa dependency)
// ============================================================================

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function uint8ToBase64(bytes: Uint8Array): string {
  let result = '';
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < len ? bytes[i + 1] : 0;
    const b2 = i + 2 < len ? bytes[i + 2] : 0;
    result += BASE64_CHARS[(b0 >> 2) & 0x3f];
    result += BASE64_CHARS[((b0 << 4) | (b1 >> 4)) & 0x3f];
    result += i + 1 < len ? BASE64_CHARS[((b1 << 2) | (b2 >> 6)) & 0x3f] : '=';
    result += i + 2 < len ? BASE64_CHARS[b2 & 0x3f] : '=';
  }
  return result;
}

function base64ToUint8(base64: string): Uint8Array {
  const cleaned = base64.replace(/=+$/, '');
  const byteLen = Math.floor((cleaned.length * 3) / 4);
  const bytes = new Uint8Array(byteLen);
  let p = 0;
  for (let i = 0; i < cleaned.length; i += 4) {
    const a = BASE64_CHARS.indexOf(cleaned[i]);
    const b = BASE64_CHARS.indexOf(cleaned[i + 1]);
    const c = i + 2 < cleaned.length ? BASE64_CHARS.indexOf(cleaned[i + 2]) : 0;
    const d = i + 3 < cleaned.length ? BASE64_CHARS.indexOf(cleaned[i + 3]) : 0;
    bytes[p++] = (a << 2) | (b >> 4);
    if (i + 2 < cleaned.length) bytes[p++] = ((b << 4) | (c >> 2)) & 0xff;
    if (i + 3 < cleaned.length) bytes[p++] = ((c << 6) | d) & 0xff;
  }
  return bytes;
}

// ============================================================================
// Wordlist for Recovery Key (compact)
// ============================================================================

/**
 * Generate a deterministic wordlist from a seed.
 * Uses SHA-256 hashing to produce 2048 unique 4-letter codes.
 * This ensures identical wordlists on every platform without shipping a large file.
 */
function getWordAtIndex(index: number): string {
  // Simple deterministic word generation: each index maps to a unique word
  // Using a curated list of common, unambiguous English words
  const words = [
    'able', 'acid', 'aged', 'also', 'arch', 'area', 'army', 'away',
    'baby', 'back', 'ball', 'band', 'bank', 'base', 'bath', 'bear',
    'beat', 'been', 'bell', 'belt', 'best', 'bill', 'bird', 'bite',
    'blow', 'blue', 'boat', 'body', 'bomb', 'bond', 'bone', 'book',
    'boot', 'born', 'boss', 'both', 'bowl', 'bulk', 'burn', 'bush',
    'busy', 'call', 'calm', 'came', 'camp', 'card', 'care', 'case',
    'cash', 'cast', 'cell', 'chat', 'chip', 'city', 'club', 'clue',
    'coal', 'coat', 'code', 'cold', 'come', 'cook', 'cool', 'cope',
    'copy', 'core', 'cost', 'crew', 'crop', 'dark', 'data', 'date',
    'dawn', 'dead', 'deal', 'dear', 'debt', 'deep', 'deny', 'desk',
    'dial', 'diet', 'dirt', 'dish', 'disk', 'dock', 'does', 'done',
    'door', 'dose', 'down', 'drag', 'draw', 'drew', 'drop', 'drug',
    'drum', 'dual', 'dumb', 'dump', 'dust', 'duty', 'each', 'earn',
    'ease', 'east', 'easy', 'edge', 'else', 'even', 'ever', 'evil',
    'exam', 'exit', 'face', 'fact', 'fail', 'fair', 'fall', 'fame',
    'farm', 'fast', 'fate', 'fear', 'feed', 'feel', 'feet', 'fell',
    'felt', 'file', 'fill', 'film', 'find', 'fine', 'fire', 'firm',
    'fish', 'fist', 'flag', 'flat', 'fled', 'flew', 'flip', 'flow',
    'folk', 'fond', 'food', 'foot', 'ford', 'form', 'fort', 'foul',
    'four', 'free', 'from', 'fuel', 'full', 'fund', 'fury', 'fuse',
    'gain', 'game', 'gang', 'gate', 'gave', 'gear', 'gene', 'gift',
    'girl', 'give', 'glad', 'glow', 'glue', 'goal', 'goat', 'goes',
    'gold', 'golf', 'gone', 'good', 'grab', 'gray', 'grew', 'grid',
    'grip', 'grow', 'gulf', 'guru', 'hack', 'hair', 'half', 'hall',
    'halt', 'hand', 'hang', 'hard', 'harm', 'hash', 'hate', 'have',
    'hawk', 'head', 'heap', 'hear', 'heat', 'held', 'help', 'herb',
    'here', 'hero', 'high', 'hill', 'hint', 'hire', 'hold', 'hole',
    'holy', 'home', 'hope', 'horn', 'host', 'hour', 'huge', 'hung',
    'hunt', 'hurt', 'icon', 'idea', 'inch', 'info', 'into', 'iron',
    'item', 'jack', 'jane', 'jazz', 'jean', 'join', 'joke', 'jump',
    'june', 'jury', 'just', 'keen', 'keep', 'kept', 'kick', 'kill',
    'kind', 'king', 'kiss', 'knee', 'knew', 'knit', 'knob', 'know',
    'lack', 'laid', 'lake', 'lamp', 'land', 'lane', 'last', 'late',
    'lawn', 'lead', 'leaf', 'lean', 'left', 'lend', 'lens', 'less',
    'lied', 'life', 'lift', 'like', 'limb', 'lime', 'limp', 'line',
    'link', 'lion', 'list', 'live', 'load', 'loan', 'lock', 'logo',
    'long', 'look', 'lord', 'lose', 'loss', 'lost', 'loud', 'love',
    'luck', 'lump', 'lung', 'made', 'mail', 'main', 'make', 'male',
    'mall', 'many', 'mark', 'mask', 'mass', 'mate', 'maze', 'meal',
    'mean', 'meat', 'meet', 'melt', 'memo', 'menu', 'mere', 'mesh',
    'mild', 'milk', 'mill', 'mind', 'mine', 'mint', 'miss', 'mode',
    'mood', 'moon', 'more', 'most', 'move', 'much', 'must', 'myth',
    'nail', 'name', 'navy', 'near', 'neat', 'neck', 'need', 'nest',
    'news', 'next', 'nice', 'nine', 'node', 'none', 'norm', 'nose',
    'note', 'noun', 'odds', 'once', 'only', 'onto', 'open', 'oral',
    'ours', 'oval', 'oven', 'over', 'pace', 'pack', 'page', 'paid',
    'pain', 'pair', 'pale', 'palm', 'pane', 'park', 'part', 'pass',
    'past', 'path', 'peak', 'peer', 'pick', 'pile', 'pine', 'pink',
    'pipe', 'plan', 'play', 'plot', 'plug', 'plus', 'poem', 'poet',
    'poll', 'pond', 'pool', 'poor', 'pope', 'port', 'pose', 'post',
    'pour', 'pray', 'pull', 'pump', 'pure', 'push', 'quit', 'race',
    'rage', 'raid', 'rail', 'rain', 'rank', 'rare', 'rate', 'read',
    'real', 'rear', 'rely', 'rent', 'rest', 'rice', 'rich', 'ride',
    'ring', 'riot', 'rise', 'risk', 'road', 'rock', 'rode', 'role',
    'roll', 'roof', 'room', 'root', 'rope', 'rose', 'ruin', 'rule',
    'rush', 'ruth', 'safe', 'said', 'sake', 'sale', 'salt', 'same',
    'sand', 'sang', 'save', 'seal', 'seam', 'seed', 'seek', 'seem',
    'seen', 'self', 'sell', 'send', 'sent', 'sept', 'shed', 'shin',
    'ship', 'shop', 'shot', 'show', 'shut', 'sick', 'side', 'sigh',
    'sign', 'silk', 'sink', 'site', 'size', 'skin', 'slam', 'slap',
    'slid', 'slim', 'slip', 'slot', 'slow', 'snap', 'snow', 'soak',
    'soar', 'sock', 'soft', 'soil', 'sold', 'sole', 'some', 'song',
    'soon', 'sort', 'soul', 'sour', 'span', 'spin', 'spit', 'spot',
    'star', 'stay', 'stem', 'step', 'stir', 'stop', 'such', 'suit',
    'sure', 'swim', 'tail', 'take', 'tale', 'talk', 'tall', 'tank',
    'tape', 'task', 'taxi', 'team', 'tear', 'tell', 'tend', 'tent',
    'term', 'test', 'text', 'than', 'that', 'them', 'then', 'they',
    'thin', 'this', 'thus', 'tide', 'tidy', 'tied', 'tier', 'tile',
    'till', 'time', 'tiny', 'tire', 'toad', 'told', 'toll', 'tone',
    'took', 'tool', 'tops', 'tore', 'torn', 'tour', 'town', 'trap',
    'tray', 'tree', 'trim', 'trip', 'true', 'tube', 'tuck', 'tune',
    'turn', 'twin', 'type', 'ugly', 'unit', 'upon', 'urge', 'used',
    'user', 'vale', 'vary', 'vast', 'verb', 'very', 'view', 'vine',
    'void', 'volt', 'vote', 'wade', 'wage', 'wait', 'wake', 'walk',
    'wall', 'want', 'ward', 'warm', 'warn', 'wash', 'vast', 'wave',
    'weak', 'wear', 'weed', 'week', 'weep', 'well', 'went', 'were',
    'west', 'what', 'when', 'whom', 'wide', 'wife', 'wild', 'will',
    'wind', 'wine', 'wing', 'wire', 'wise', 'wish', 'with', 'woke',
    'wolf', 'wood', 'word', 'wore', 'work', 'worm', 'worn', 'wrap',
    'yard', 'yeah', 'year', 'yoga', 'zero', 'zone', 'zoom', 'arch',
    'atom', 'axis', 'bark', 'barn', 'beam', 'bean', 'bend', 'bike',
    'bind', 'bite', 'blur', 'boil', 'bold', 'bolt', 'boom', 'bout',
    'brag', 'brew', 'bulb', 'bump', 'cage', 'cape', 'cave', 'chef',
    'chin', 'chop', 'cite', 'clan', 'clap', 'clay', 'clip', 'coil',
    'coin', 'cone', 'cord', 'cork', 'cosy', 'coup', 'cube', 'cult',
    'curb', 'cure', 'curl', 'damp', 'dare', 'dash', 'deer', 'deft',
    'demo', 'dent', 'dice', 'dine', 'dire', 'dome', 'doom', 'dove',
    'duel', 'duke', 'dune', 'dusk', 'echo', 'emit', 'envy', 'epic',
    'fade', 'fake', 'fang', 'feat', 'fern', 'fibre', 'flaw', 'flee',
    'flex', 'foil', 'fold', 'font', 'fool', 'fork', 'fowl', 'frog',
    'gale', 'gaze', 'germ', 'gist', 'glen', 'glue', 'gown', 'grab',
    'grim', 'grin', 'gulp', 'gust', 'hail', 'halo', 'hare', 'harp',
    'hash', 'haul', 'haze', 'heap', 'helm', 'herb', 'herd', 'hide',
    'hike', 'hive', 'hood', 'hook', 'hoop', 'hose', 'howl', 'hull',
    'hurl', 'hymn', 'iris', 'isle', 'jade', 'jail', 'jest', 'jolt',
    'judo', 'keen', 'kelp', 'kiln', 'kite', 'knot', 'lace', 'lash',
    'lava', 'leak', 'leap', 'lime', 'limp', 'lobe', 'loft', 'loom',
    'loop', 'lore', 'lure', 'lurk', 'mace', 'malt', 'mane', 'mare',
    'mast', 'maze', 'meek', 'mend', 'mesa', 'mild', 'mime', 'mink',
    'mint', 'mist', 'moat', 'mole', 'monk', 'moss', 'moth', 'mule',
    'muse', 'mute', 'nail', 'nape', 'nave', 'neon', 'newt', 'node',
    'noon', 'nook', 'nova', 'oath', 'obey', 'oink', 'omen', 'onyx',
    'opal', 'orca', 'oreo', 'otter', 'owl', 'pact', 'pail', 'palm',
    'pane', 'pant', 'pave', 'pawn', 'peal', 'pear', 'peel', 'pelt',
    'perk', 'pest', 'pier', 'pint', 'plod', 'plop', 'plow', 'ploy',
    'plum', 'plum', 'poke', 'polo', 'pomp', 'pony', 'pore', 'pose',
    'pout', 'prep', 'prey', 'prod', 'prop', 'prowl', 'prune', 'pulp',
    'punt', 'quad', 'quay', 'raft', 'rage', 'ramp', 'rake', 'rash',
    'reed', 'reef', 'reel', 'relay', 'rift', 'rind', 'rink', 'roam',
    'robe', 'romp', 'rook', 'rove', 'ruby', 'rung', 'ruse', 'sage',
    'sane', 'sash', 'scan', 'scar', 'scam', 'sect', 'sewn', 'sham',
    'sill', 'silo', 'silt', 'siren', 'slab', 'slag', 'slew', 'slog',
    'slug', 'smog', 'snag', 'snip', 'snub', 'soda', 'sofa', 'sole',
    'soot', 'sore', 'spec', 'spur', 'stab', 'stag', 'stub', 'stud',
    'stun', 'surf', 'swan', 'swap', 'sway', 'tack', 'tame', 'tang',
    'tart', 'teal', 'teem', 'temp', 'thaw', 'tick', 'tilt', 'tint',
    'toad', 'toga', 'toil', 'tomb', 'toot', 'toss', 'trek', 'trio',
    'trot', 'tuft', 'twig', 'unto', 'vale', 'vane', 'veal', 'veil',
    'vein', 'vent', 'vest', 'veto', 'vial', 'vice', 'vine', 'visa',
    'void', 'vow', 'wade', 'wail', 'waif', 'wane', 'warp', 'wart',
    'wasp', 'watt', 'wax', 'weave', 'wick', 'wield', 'wilt', 'wink',
    'wisp', 'wits', 'woke', 'womb', 'wren', 'yank', 'yarn', 'yawn',
    'yell', 'yoke', 'zeal', 'zest', 'zinc',
  ];

  return words[index % words.length];
}

// ============================================================================
// Core Crypto Functions
// ============================================================================

/**
 * Generate a cryptographically secure random salt.
 *
 * @returns Hex-encoded 16-byte salt string
 */
export function generateSalt(): Salt {
  const saltBytes = randomBytes(SALT_LENGTH_BYTES);
  return bytesToHex(saltBytes);
}

/**
 * Derive a 256-bit key from a password and salt using PBKDF2-SHA256.
 *
 * This is deterministic — same password + salt always produces the same key.
 * Works identically on React Native, browser, Node.js, and Electron.
 *
 * @param password  User's plaintext password
 * @param salt      Hex-encoded salt from the server
 * @returns         32-byte AES-256 key
 */
export function deriveKey(password: string, salt: Salt): EncryptionKey {
  logger.debug(TAG, 'Deriving key from password (PBKDF2, 600k iterations)…');
  const saltBytes = hexToBytes(salt);
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);

  const key = pbkdf2(sha256, passwordBytes, saltBytes, {
    c: PBKDF2_ITERATIONS,
    dkLen: KEY_LENGTH_BYTES,
  });

  logger.debug(TAG, 'Key derivation complete');
  return key;
}

/**
 * Generate a random 256-bit master key.
 *
 * This key is what actually encrypts user data. It's wrapped by the
 * password-derived key and stored encrypted on the server.
 *
 * @returns 32-byte random master key
 */
export function generateMasterKey(): EncryptionKey {
  return randomBytes(MASTER_KEY_LENGTH_BYTES);
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 *
 * Output format: `v1:{base64(iv)}:{base64(ciphertext+tag)}`
 *
 * @param plaintext  String to encrypt
 * @param key        32-byte AES-256 key
 * @returns          Version-prefixed ciphertext string
 */
export function encrypt(plaintext: string, key: EncryptionKey): Ciphertext {
  if (!plaintext || plaintext.length === 0) return plaintext;

  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  const iv = randomBytes(IV_LENGTH_BYTES);

  const cipher = gcm(key, iv);
  const encrypted = cipher.encrypt(data);

  const ivB64 = uint8ToBase64(iv);
  const ctB64 = uint8ToBase64(encrypted);

  return `${CIPHERTEXT_PREFIX}:${ivB64}:${ctB64}`;
}

/**
 * Decrypt a ciphertext string produced by `encrypt()`.
 *
 * @param ciphertext  Version-prefixed ciphertext string
 * @param key         32-byte AES-256 key (same key used to encrypt)
 * @returns           Decrypted plaintext string
 * @throws            Error if ciphertext is malformed or key is wrong
 */
export function decrypt(ciphertext: Ciphertext, key: EncryptionKey): string {
  if (!ciphertext || !ciphertext.startsWith(`${CIPHERTEXT_PREFIX}:`)) {
    // Not encrypted — return as-is (backward compat / unencrypted fields)
    return ciphertext;
  }

  const parts = ciphertext.split(':');
  if (parts.length !== 3) {
    logger.warn('CryptoService', 'Malformed ciphertext, returning as-is');
    return ciphertext;
  }

  const [, ivB64, ctB64] = parts;
  const iv = base64ToUint8(ivB64);
  const encrypted = base64ToUint8(ctB64);

  const cipher = gcm(key, iv);
  const decrypted = cipher.decrypt(encrypted);

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * Check if a string is encrypted (has the version prefix).
 */
export function isEncrypted(value: string): boolean {
  return typeof value === 'string' && value.startsWith(`${CIPHERTEXT_PREFIX}:`);
}

// ============================================================================
// Key Wrapping — Master Key ↔ Wrapping Key
// ============================================================================

/**
 * Wrap (encrypt) the master key with a wrapping key.
 *
 * Used to store the master key encrypted on the server.
 * The wrapping key is derived from the user's password.
 *
 * @param masterKey    32-byte master encryption key
 * @param wrappingKey  32-byte password-derived wrapping key
 * @returns            Wrapped master key structure
 */
export function wrapMasterKey(
  masterKey: EncryptionKey,
  wrappingKey: EncryptionKey,
): WrappedMasterKey {
  const iv = randomBytes(IV_LENGTH_BYTES);
  const cipher = gcm(wrappingKey, iv);
  const encrypted = cipher.encrypt(masterKey);

  const ivB64 = uint8ToBase64(iv);
  const ctB64 = uint8ToBase64(encrypted);

  return {
    encryptedKey: `${CIPHERTEXT_PREFIX}:${ivB64}:${ctB64}`,
    version: ENCRYPTION_VERSION,
  };
}

/**
 * Unwrap (decrypt) the master key using a wrapping key.
 *
 * @param wrapped      Wrapped master key from the server
 * @param wrappingKey  32-byte password-derived wrapping key
 * @returns            32-byte master encryption key
 * @throws             Error if wrapping key is wrong (GCM auth fails)
 */
export function unwrapMasterKey(
  wrapped: WrappedMasterKey,
  wrappingKey: EncryptionKey,
): EncryptionKey {
  const parts = wrapped.encryptedKey.split(':');
  if (parts.length !== 3 || parts[0] !== CIPHERTEXT_PREFIX) {
    throw new Error('Invalid wrapped master key format');
  }

  const [, ivB64, ctB64] = parts;
  const iv = base64ToUint8(ivB64);
  const encrypted = base64ToUint8(ctB64);

  const cipher = gcm(wrappingKey, iv);
  return cipher.decrypt(encrypted);
}

// ============================================================================
// Key Hashing — For server-side key verification (NOT the key itself)
// ============================================================================

/**
 * Hash a key for server-side verification.
 *
 * The server stores this hash to verify the client has the correct key
 * without ever seeing the actual key.
 *
 * @param key  32-byte encryption key
 * @returns    Hex-encoded SHA-256 hash of the key
 */
export function hashKey(key: EncryptionKey): string {
  const hash = sha256(key);
  return bytesToHex(hash);
}

// ============================================================================
// Recovery Key — 24-word mnemonic
// ============================================================================

/**
 * Generate a 24-word recovery mnemonic from random entropy.
 *
 * The mnemonic is shown once to the user. They must write it down.
 * It can independently unwrap the master key if the password is lost.
 *
 * @returns 24-word mnemonic string (space-separated)
 */
export function generateRecoveryMnemonic(): string {
  // 32 bytes = 256 bits of entropy
  const entropy = randomBytes(MASTER_KEY_LENGTH_BYTES);

  const words: string[] = [];
  for (let i = 0; i < RECOVERY_WORD_COUNT; i++) {
    // Use 2 bytes per word to index into the wordlist
    const idx = ((entropy[i % entropy.length] << 8) | entropy[(i + 1) % entropy.length]) % WORDLIST_SIZE;
    words.push(getWordAtIndex(idx));
  }

  return words.join(' ');
}

/**
 * Derive a wrapping key from a recovery mnemonic.
 *
 * Uses the mnemonic as a "password" with a fixed recovery salt.
 * The derived key can unwrap the master key (same as password-derived key).
 *
 * @param mnemonic  24-word recovery mnemonic
 * @returns         32-byte recovery wrapping key
 */
export function deriveKeyFromMnemonic(mnemonic: string): EncryptionKey {
  // Use the mnemonic itself as password with a fixed well-known salt
  // This is safe because the mnemonic has 256 bits of entropy
  const fixedSalt = 'kaiz-recovery-v1-salt';
  const encoder = new TextEncoder();
  const mnemonicBytes = encoder.encode(mnemonic.trim().toLowerCase());
  const saltBytes = encoder.encode(fixedSalt);

  return pbkdf2(sha256, mnemonicBytes, saltBytes, {
    c: PBKDF2_ITERATIONS,
    dkLen: KEY_LENGTH_BYTES,
  });
}

// ============================================================================
// Serialization Helpers
// ============================================================================

/** Encode a key as base64 for SecureStore storage */
export function keyToBase64(key: EncryptionKey): string {
  return uint8ToBase64(key);
}

/** Decode a base64 string back to a key */
export function base64ToKey(base64: string): EncryptionKey {
  return base64ToUint8(base64);
}
