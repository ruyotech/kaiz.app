-- V8: Add missing audit columns to task_history and other tables
-- These columns are required by BaseEntity for JPA auditing

-- Fix task_history table
ALTER TABLE task_history 
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(36),
    ADD COLUMN IF NOT EXISTS updated_by VARCHAR(36);

-- Fix sprints table (missing created_by and updated_by)
ALTER TABLE sprints
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(36),
    ADD COLUMN IF NOT EXISTS updated_by VARCHAR(36);

-- Fix challenge_templates table (missing updated_at, created_by, updated_by)
ALTER TABLE challenge_templates
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(36),
    ADD COLUMN IF NOT EXISTS updated_by VARCHAR(36);

-- Fix challenge_participants table (missing created_at, updated_at, created_by, updated_by)
ALTER TABLE challenge_participants
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(36),
    ADD COLUMN IF NOT EXISTS updated_by VARCHAR(36);

-- Create indexes for the new audit columns
CREATE INDEX IF NOT EXISTS idx_task_history_created_by ON task_history(created_by);
CREATE INDEX IF NOT EXISTS idx_task_history_updated_by ON task_history(updated_by);
CREATE INDEX IF NOT EXISTS idx_task_history_updated_at ON task_history(updated_at);

CREATE INDEX IF NOT EXISTS idx_sprints_created_by ON sprints(created_by);
CREATE INDEX IF NOT EXISTS idx_sprints_updated_by ON sprints(updated_by);

CREATE INDEX IF NOT EXISTS idx_challenge_templates_created_by ON challenge_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_challenge_templates_updated_by ON challenge_templates(updated_by);
CREATE INDEX IF NOT EXISTS idx_challenge_templates_updated_at ON challenge_templates(updated_at);

CREATE INDEX IF NOT EXISTS idx_challenge_participants_created_by ON challenge_participants(created_by);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_updated_by ON challenge_participants(updated_by);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_created_at ON challenge_participants(created_at);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_updated_at ON challenge_participants(updated_at);
