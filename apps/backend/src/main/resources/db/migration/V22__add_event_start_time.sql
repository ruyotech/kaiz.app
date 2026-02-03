-- ============================================================================
-- V22: Add missing columns to tasks table for event support
-- The Task entity has these fields but they were never added to database
-- ============================================================================

-- Add event_start_time column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS event_start_time TIMESTAMP WITH TIME ZONE;

-- Add is_event column (marks task as an event type)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_event BOOLEAN DEFAULT false NOT NULL;

-- Add index for event time range queries
CREATE INDEX IF NOT EXISTS idx_tasks_event_time ON tasks(event_start_time, event_end_time) 
WHERE event_start_time IS NOT NULL;

-- Also add missing columns for task event support if needed
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_all_day BOOLEAN DEFAULT false;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS location VARCHAR(500);
