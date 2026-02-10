# KAIZ LifeOS — Zero-Knowledge Encryption

> **Status:** ✅ Production — Deployed  
> **Version:** v1 (AES-256-GCM)  
> **Migration:** V38  
> **Libraries:** `@noble/ciphers@1.2.1` + `@noble/hashes@1.7.1`

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Key Hierarchy](#key-hierarchy)
4. [Ciphertext Format](#ciphertext-format)
5. [What Gets Encrypted](#what-gets-encrypted)
6. [What Does NOT Get Encrypted](#what-does-not-get-encrypted)
7. [File Map](#file-map)
8. [Flow Diagrams](#flow-diagrams)
   - [Registration](#registration-flow)
   - [Login](#login-flow)
   - [Biometric Login](#biometric-login-flow)
   - [API Request (Encrypt)](#api-request-encrypt)
   - [API Response (Decrypt)](#api-response-decrypt)
   - [Recovery Key Setup](#recovery-key-setup-flow)
   - [Recovery Key Restore](#recovery-key-restore-flow)
   - [Password Change](#password-change-flow)
9. [Recovery Key System](#recovery-key-system)
10. [Search on Encrypted Data](#search-on-encrypted-data)
11. [Backend Changes](#backend-changes)
12. [Cross-Platform Support](#cross-platform-support)
13. [Security Properties](#security-properties)
14. [Adding a New Encrypted Field](#adding-a-new-encrypted-field)
15. [FAQ](#faq)

---

## Overview

KAIZ uses **zero-knowledge encryption** (ZKE) — the server never sees, stores, or can derive the user's plaintext data. All encryption and decryption happens **exclusively on the client** (mobile device). The server stores only encrypted blobs.

**What "zero-knowledge" means in practice:**
- The KAIZ server cannot read task titles, descriptions, notes, or any user content
- A database breach exposes only ciphertext — useless without the user's password
- Even KAIZ engineers with full database access cannot read user data
- There is no backdoor — if the user loses both password and recovery key, data is unrecoverable

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        MOBILE CLIENT                         │
│                                                              │
│  ┌──────────┐   ┌────────────────┐   ┌───────────────────┐  │
│  │ Component │──▶│  TanStack Query │──▶│   Axios Client    │  │
│  │  (UI)     │   │  (cache layer)  │   │ (apiClient.ts)    │  │
│  └──────────┘   └────────────────┘   └─────────┬─────────┘  │
│                                                  │           │
│                                    ┌─────────────▼─────────┐ │
│                                    │  Encryption Interceptor│ │
│                                    │  (auto encrypt/decrypt)│ │
│                                    └─────────────┬─────────┘ │
│                                                  │           │
│  ┌──────────────────┐              ┌─────────────▼─────────┐ │
│  │  SecureStore      │◀────────────│  Encryption Store      │ │
│  │  (iOS Keychain /  │  masterKey  │  (key lifecycle mgmt)  │ │
│  │   Android Keystore│             └───────────────────────┘ │
│  └──────────────────┘                                        │
└──────────────────────────────────────────────────────────────┘
                              │
                    HTTPS (encrypted blobs)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         BACKEND                              │
│                                                              │
│  Stores: encrypted ciphertext, encryption_salt,              │
│          wrapped_master_key (encrypted), key_hash,           │
│          recovery_key_blob (encrypted)                       │
│                                                              │
│  ❌ NEVER has: plaintext, master key, wrapping key, password │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Hierarchy

The encryption uses a **double-layer key hierarchy** that decouples the master key from the password. This means password changes are cheap (re-wrap only) and don't require re-encrypting all data.

```
  User's Password   +   Salt (random, stored on server)
         │                    │
         ▼                    ▼
  ┌──────────────────────────────┐
  │  PBKDF2-SHA256 (600k iter)   │
  └──────────────┬───────────────┘
                 ▼
          Wrapping Key (32 bytes)
                 │
                 │  AES-256-GCM wrap/unwrap
                 ▼
          Master Key (32 bytes, random)
                 │
                 │  AES-256-GCM encrypt/decrypt
                 ▼
          User Data (tasks, notes, etc.)
```

| Key | Generated By | Stored Where | Purpose |
|-----|-------------|--------------|---------|
| **Salt** | Server (random 16 bytes hex) | Server DB (`encryption_salt`) | PBKDF2 input — prevents rainbow tables |
| **Wrapping Key** | Derived from password + salt | Never stored (re-derived each login) | Wraps/unwraps the master key |
| **Master Key** | Random 32 bytes (registration) | SecureStore (iOS Keychain / Android Keystore) | Encrypts/decrypts all user data |
| **Wrapped Master Key** | AES-GCM(master, wrapping) | Server DB (`wrapped_master_key`) | Allows master key recovery on login |
| **Key Hash** | SHA-256(master key) | Server DB (`encryption_key_hash`) | Verify correct key without exposing it |
| **Recovery Key** | 24-word mnemonic → PBKDF2 | Paper (user writes it down) | Independent path to unwrap master key |

---

## Ciphertext Format

Every encrypted field value follows this format:

```
v1:{base64(iv)}:{base64(ciphertext + auth_tag)}
```

**Example:**
```
v1:dGhpcyBpcyBhIG5v:U2FsdGVkX1+abc123...
```

| Part | Purpose |
|------|---------|
| `v1` | Version prefix — enables future algorithm rotation (v2 could use XChaCha20) |
| `base64(iv)` | 12-byte random IV (nonce) for AES-GCM — unique per encryption |
| `base64(ciphertext + tag)` | Encrypted data + 16-byte authentication tag (integrity) |

The `isEncrypted()` function detects this format: starts with `v1:` and contains exactly 2 colons.

---

## What Gets Encrypted

All **user-generated text content** is encrypted. The interceptor encrypts on outgoing requests and decrypts on incoming responses — **fully transparent to components**.

| Domain | Encrypted Fields |
|--------|-----------------|
| **Tasks** | `title`, `description`, `notes`, `location` |
| **Task Comments** | `content` |
| **Task Checklist** | `title` |
| **Epics** | `title`, `description` |
| **Sprints** | `goals`, `sprintGoal` |
| **SensAI Conversations** | `content`, `message`, `summary` |
| **SensAI Standups** | `accomplishments`, `blockers`, `plans`, `notes` |
| **Community Stories** | `title`, `content`, `body` |
| **Community Questions** | `title`, `content`, `body` |
| **Community Compliments** | `content`, `message` |
| **Family Members** | `name`, `nickname`, `notes` |
| **Family Invitations** | `message` |
| **Challenge Entries** | `content`, `notes`, `reflection` |
| **Notifications** | `title`, `body`, `message` |
| **Bills** | `description`, `notes` |
| **Command Center Drafts** | `content`, `title`, `description` |

---

## What Does NOT Get Encrypted

| Category | Why |
|----------|-----|
| **IDs** (UUIDs) | Server needs them for foreign keys and lookups |
| **Timestamps** | Server needs them for sorting and filtering |
| **Enums/Status** | Server needs them for queries (`WHERE status = 'ACTIVE'`) |
| **Numeric fields** | Story points, priority levels — needed for aggregation |
| **Foreign keys** | Sprint ID, Epic ID — needed for JOINs |
| **System templates** | Shared across all users — not user-specific |
| **AI endpoints** | `/command-center/smart-input`, `/sensai/chat` — server needs plaintext for AI processing |

---

## File Map

### Mobile (`apps/mobile/`)

| File | Purpose | Lines |
|------|---------|-------|
| `types/encryption.types.ts` | All TypeScript types & constants | ~80 |
| `services/encryption/cryptoService.ts` | Core crypto: AES-GCM, PBKDF2, key wrapping, mnemonic | ~490 |
| `services/encryption/encryptedFields.ts` | Registry: which API paths/fields to encrypt | ~190 |
| `services/encryption/encryptionInterceptor.ts` | Axios middleware: auto encrypt/decrypt | ~200 |
| `services/encryption/encryptionStore.ts` | Zustand store: key lifecycle (SecureStore-backed) | ~330 |
| `services/encryption/index.ts` | Barrel export | ~45 |
| `components/settings/RecoveryKeySetup.tsx` | 4-step modal: generate → display → verify → store | ~430 |
| `components/settings/RecoveryKeyRestore.tsx` | 24-word input with paste support → restore key | ~340 |
| `hooks/useEncryptedSearch.ts` | Client-side search on TanStack Query cache | ~180 |

### Modified Mobile Files

| File | Change |
|------|--------|
| `services/apiClient.ts` | Wired encrypt/decrypt interceptors |
| `services/api.ts` | Added `encryptionApi` namespace + encryption fields in `AuthResponse` |
| `store/authStore.ts` | Init encryption on login/register, clear on logout |
| `store/biometricStore.ts` | ZK-compatible flow (no plaintext password storage) |
| `app/(tabs)/settings/index.tsx` | Added Encryption section with status + recovery actions |

### Backend (`apps/backend/`)

| File | Change |
|------|--------|
| `db/migration/V38__add_encryption_support.sql` | 5 columns: `encryption_salt`, `encryption_key_hash`, `wrapped_master_key`, `encryption_version`, `recovery_key_blob` |
| `identity/domain/User.java` | 5 new fields matching V38 |
| `identity/application/dto/AuthDtos.java` | Updated `AuthResponse` + 4 new DTOs |
| `identity/application/AuthService.java` | Salt generation, 4 encryption methods |
| `identity/api/AuthController.java` | 4 new endpoints under `/api/v1/auth/` |

### Backend API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/auth/encryption-salt` | Get user's encryption salt |
| `POST` | `/api/v1/auth/encryption-key-verify` | Store wrapped master key + key hash |
| `POST` | `/api/v1/auth/recovery-key` | Store recovery key blob |
| `GET` | `/api/v1/auth/recovery-key` | Retrieve recovery key blob for restoration |

---

## Flow Diagrams

### Registration Flow

```
User enters email + password
         │
         ▼
  1. POST /auth/register → server creates user + generates salt
  2. Server returns { accessToken, refreshToken, encryptionSalt }
  3. Client: generateMasterKey() → random 32 bytes
  4. Client: deriveKey(password, salt) → wrappingKey
  5. Client: wrapMasterKey(masterKey, wrappingKey) → wrappedMasterKey
  6. Client: hashKey(masterKey) → keyHash
  7. Client: store masterKey in SecureStore
  8. Client: POST /auth/encryption-key-verify { keyHash, wrappedMasterKey }
  9. ✅ Encryption active — all subsequent requests auto-encrypted
```

### Login Flow

```
User enters email + password
         │
         ▼
  1. POST /auth/login → server returns { encryptionSalt, wrappedMasterKey }
  2. Client: deriveKey(password, salt) → wrappingKey
  3. Client: unwrapMasterKey(wrappedMasterKey, wrappingKey) → masterKey
  4. Client: store masterKey in SecureStore
  5. ✅ Encryption active
```

### Biometric Login Flow

```
User taps Face ID / Touch ID
         │
         ▼
  1. Biometric authentication succeeds (OS-level)
  2. Client: read masterKey from SecureStore (was stored on last login)
  3. Client: initializeFromSecureStore() → marks encryption as active
  4. ✅ Encryption active (no password needed — key already in SecureStore)
```

### API Request (Encrypt)

```
Component calls: taskApi.create({ title: "Buy groceries", description: "Milk, eggs" })
         │
         ▼
  1. Axios request interceptor fires
  2. encryptRequestPayload() matches path /tasks → fields [title, description]
  3. getEncryptionKey() → reads masterKey from SecureStore
  4. encrypt("Buy groceries", masterKey) → "v1:abc123:def456..."
  5. encrypt("Milk, eggs", masterKey) → "v1:xyz789:ghi012..."
  6. Sends: { title: "v1:abc123:def456...", description: "v1:xyz789:ghi012..." }
  7. Server stores encrypted blobs — cannot read them
```

### API Response (Decrypt)

```
Server returns: { title: "v1:abc123:def456...", description: "v1:xyz789:ghi012..." }
         │
         ▼
  1. Axios response interceptor fires (in unwrap helper)
  2. decryptResponsePayload() matches path /tasks → fields [title, description]
  3. getEncryptionKey() → reads masterKey from SecureStore
  4. decrypt("v1:abc123:def456...", masterKey) → "Buy groceries"
  5. decrypt("v1:xyz789:ghi012...", masterKey) → "Milk, eggs"
  6. Component receives: { title: "Buy groceries", description: "Milk, eggs" }
  7. ✅ Transparent — component never knows encryption exists
```

### Recovery Key Setup Flow

```
User opens Settings → Encryption → Set Up Recovery Key
         │
         ▼
  Step 1 (Intro): Explains ZKE and what a recovery key is
  Step 2 (Display): Shows 24 random words in 2-column grid
         - User writes them on paper
         - Optional: copy to clipboard
  Step 3 (Verify): User must enter 3 randomly-selected words
         - Prevents "I'll do it later" → verifies backup exists
  Step 4 (Submit):
         1. deriveKeyFromMnemonic(24 words) → recoveryWrappingKey
         2. wrapMasterKey(masterKey, recoveryWrappingKey) → recoveryBlob
         3. POST /auth/recovery-key { recoveryBlob }
         4. Server stores blob (encrypted — can't read it)
  Step 5 (Success): Confirmation screen
```

### Recovery Key Restore Flow

```
User logs into new device or loses SecureStore access
         │
         ▼
  1. Open Settings → Encryption → Restore from Recovery Key
  2. Enter 24 words (individually or paste all at once)
  3. Client: GET /auth/recovery-key → { recoveryBlob }
  4. Client: deriveKeyFromMnemonic(24 words) → recoveryWrappingKey
  5. Client: unwrapMasterKey(recoveryBlob, recoveryWrappingKey) → masterKey
  6. Client: store masterKey in SecureStore
  7. ✅ Encryption restored — all data accessible again
```

### Password Change Flow

```
User changes password (oldPassword → newPassword)
         │
         ▼
  1. Read masterKey from SecureStore (already unlocked)
  2. Server generates new salt
  3. Client: deriveKey(newPassword, newSalt) → newWrappingKey
  4. Client: wrapMasterKey(masterKey, newWrappingKey) → newWrappedMasterKey
  5. Client: POST /auth/encryption-key-verify { keyHash, newWrappedMasterKey }
  6. ✅ Only the wrapped key changes — data stays encrypted as-is
     (This is the key advantage of double-layer key hierarchy)
```

---

## Recovery Key System

The recovery key is a **24-word mnemonic** (like a Bitcoin seed phrase) that provides an independent path to the master key.

**How it works:**
1. 32 bytes of random entropy → mapped to 24 English words
2. The mnemonic is used as a "password" with a fixed salt → PBKDF2 → recovery wrapping key
3. The recovery wrapping key wraps the same master key → recovery blob
4. The blob is stored on the server (encrypted — server can't read it)
5. Only the 24 words can decrypt it

**Important:**
- The mnemonic is shown exactly once during setup
- The user MUST write it on paper and store securely
- If both password and mnemonic are lost → data is permanently unrecoverable
- There is no backdoor, no admin reset, no "forgot encryption key" flow

---

## Search on Encrypted Data

Since the server stores only ciphertext, server-side `?search=` queries cannot match encrypted field content. The `useEncryptedSearch` hook solves this:

```typescript
const { results, isSearching } = useEncryptedSearch<Task>({
  queryKey: taskKeys.bySprint(sprintId),
  searchTerm: 'grocery',
  searchFields: ['title', 'description'],
});
```

**How it works:**
1. Reads from TanStack Query cache (no extra API call)
2. Decrypts each item's searchable fields in-memory
3. Filters items where any field matches the search term
4. Returns filtered results with debouncing (300ms default)
5. Race-safe — stale searches are discarded

**Limitations:**
- Searches only cached data (already fetched from server)
- Cannot search data that hasn't been loaded yet
- Performance is proportional to cache size (fine for <1000 items)

---

## Backend Changes

### Database (V38 Migration)

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS encryption_salt VARCHAR(64);
ALTER TABLE users ADD COLUMN IF NOT EXISTS encryption_key_hash VARCHAR(128);
ALTER TABLE users ADD COLUMN IF NOT EXISTS wrapped_master_key TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS encryption_version INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS recovery_key_blob TEXT;
```

### AuthService Methods

| Method | Purpose |
|--------|---------|
| `getEncryptionSalt(userId)` | Return salt (generate on first call) |
| `verifyEncryptionKey(userId, request)` | Store wrapped master key + hash |
| `storeRecoveryKey(userId, request)` | Store recovery blob |
| `getRecoveryKey(userId)` | Return recovery blob for restoration |

---

## Cross-Platform Support

The `@noble/ciphers` and `@noble/hashes` libraries are **pure JavaScript** — no native modules, no WebCrypto dependency. This guarantees identical encrypted output across:

| Platform | Status | Notes |
|----------|--------|-------|
| **React Native (iOS)** | ✅ Active | SecureStore → iOS Keychain |
| **React Native (Android)** | ✅ Active | SecureStore → Android Keystore |
| **Web (Next.js)** | 🔜 Ready | Same crypto, use `localStorage` or IndexedDB for keys |
| **Desktop (Electron)** | 🔜 Ready | Same crypto, use OS keychain via `keytar` |

Data encrypted on mobile can be decrypted on web/desktop with the same password — the ciphertext format is platform-agnostic.

---

## Security Properties

| Property | Guarantee |
|----------|-----------|
| **Confidentiality** | AES-256-GCM — 256-bit keys, NIST-approved |
| **Integrity** | GCM authentication tag — detects tampering |
| **Key derivation** | PBKDF2-SHA256 with 600k iterations (OWASP 2024 recommendation) |
| **Unique IVs** | 12-byte random nonce per encryption — no IV reuse |
| **Key isolation** | Master key in SecureStore (hardware-backed on iOS/Android) |
| **Forward secrecy** | Each field encrypted with unique IV — compromising one doesn't reveal others |
| **Password independence** | Password change re-wraps key — no data re-encryption needed |
| **Recovery** | 24-word mnemonic (256 bits entropy) — independent of password |
| **Zero knowledge** | Server stores only ciphertext + encrypted key blobs |
| **No backdoor** | Lost password + lost recovery key = unrecoverable data |

---

## Adding a New Encrypted Field

To encrypt a new field on an existing or new API endpoint:

### Step 1: Add to the Field Registry

Edit `services/encryption/encryptedFields.ts`:

```typescript
// In ENCRYPTED_FIELD_CONFIGS array:
{
  pathPattern: '/your-endpoint',
  fields: ['fieldName1', 'fieldName2'],
  isPaginated: true, // if response uses { content: [] } wrapper
},
```

### Step 2: That's it

The interceptor automatically encrypts those fields on outgoing requests and decrypts on incoming responses. No component changes needed.

**If the field needs client-side search**, add it to a `useEncryptedSearch` call:

```typescript
const { results } = useEncryptedSearch({
  queryKey: yourKeys.list(),
  searchTerm,
  searchFields: ['fieldName1', 'fieldName2'],
});
```

---

## FAQ

### Can the server read my data?
No. The server stores only `v1:{iv}:{ciphertext}` blobs. Without the master key (which never leaves your device), the data is indistinguishable from random bytes.

### What if I forget my password?
If you have a recovery key (24 words), you can restore your master key on any device. If you have neither password nor recovery key, your encrypted data is permanently lost.

### Does encryption slow down the app?
AES-256-GCM encryption/decryption is extremely fast (~1ms per field). PBKDF2 key derivation (600k iterations) takes ~2-3 seconds — but this only happens once at login.

### Can I disable encryption?
No. Encryption is enforced for all users from registration. This is by design — zero-knowledge means the server should never have plaintext.

### What happens during AI interactions?
AI endpoints (`/command-center/smart-input`, `/sensai/chat`) are explicitly marked `skipEncryption: true`. The plaintext is sent to the server for AI processing. AI responses (drafts) are encrypted before being stored.

### How does multi-device work?
Each device derives the wrapping key from the password → unwraps the master key from the server. All devices share the same master key, so data encrypted on one device can be decrypted on another.

### What if someone steals my device?
The master key is in SecureStore (iOS Keychain / Android Keystore), protected by the device's biometric or passcode. Without unlocking the device, the key is inaccessible.

### Can KAIZ support reset my encryption?
No. KAIZ engineers have no access to your master key, wrapping key, or recovery mnemonic. This is the fundamental promise of zero-knowledge encryption.
