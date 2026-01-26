-- ============================================================================
-- V15: Add Audit Columns to Command Center Drafts Table
-- ============================================================================
-- This migration adds the missing audit columns (created_by, updated_by)
-- that are required by the BaseEntity class.
-- ============================================================================

-- Add audit columns
ALTER TABLE command_center_drafts
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(36),
    ADD COLUMN IF NOT EXISTS updated_by VARCHAR(36);

-- Comment on new columns
COMMENT ON COLUMN command_center_drafts.created_by IS 'User ID who created this draft (from BaseEntity audit)';
COMMENT ON COLUMN command_center_drafts.updated_by IS 'User ID who last updated this draft (from BaseEntity audit)';
