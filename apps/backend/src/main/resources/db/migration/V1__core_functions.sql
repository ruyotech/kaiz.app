-- ============================================================================
-- V1: Core Functions and Extensions
-- Foundation layer: PostgreSQL extensions and reusable functions
-- ============================================================================

-- Enable cryptographic functions for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TRIGGER FUNCTIONS
-- ============================================================================

-- Automatically update updated_at timestamp on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';
