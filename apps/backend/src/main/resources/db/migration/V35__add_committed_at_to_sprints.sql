-- V35: Add committed_at column to sprints table for tracking sprint commitment state.
-- Previously, commitment info only lived on sensai_velocity_records.
-- This allows direct check on the sprint entity.

ALTER TABLE sprints ADD COLUMN IF NOT EXISTS committed_at TIMESTAMPTZ;

-- Index for efficient filtering of committed vs uncommitted sprints
CREATE INDEX IF NOT EXISTS idx_sprints_committed_at ON sprints (committed_at);
