-- ============================================================================
-- V1: Core Functions and Extensions
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';
