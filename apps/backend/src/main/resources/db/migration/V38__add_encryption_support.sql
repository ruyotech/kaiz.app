-- V38: Add zero-knowledge encryption support to users table.
--
-- Key hierarchy:
--   password + salt → PBKDF2 → wrappingKey → unwraps → masterKey → encrypts data
--
-- The server stores:
--   - encryption_salt: random per-user salt for PBKDF2 key derivation
--   - encryption_key_hash: SHA-256 of the master key (for verification, NOT the key)
--   - wrapped_master_key: master key encrypted with the password-derived wrapping key
--   - encryption_version: algorithm version for future rotation
--   - recovery_key_blob: master key encrypted with recovery-mnemonic-derived key
--
-- The server NEVER sees the plaintext master key or user data.

ALTER TABLE users ADD COLUMN IF NOT EXISTS encryption_salt VARCHAR(64);

ALTER TABLE users ADD COLUMN IF NOT EXISTS encryption_key_hash VARCHAR(128);

ALTER TABLE users ADD COLUMN IF NOT EXISTS wrapped_master_key TEXT;

ALTER TABLE users ADD COLUMN IF NOT EXISTS encryption_version INTEGER DEFAULT 1;

ALTER TABLE users ADD COLUMN IF NOT EXISTS recovery_key_blob TEXT;
