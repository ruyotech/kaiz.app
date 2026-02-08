-- V34: Sprint planning settings, ceremonies table, and velocity commitment tracking
-- Adds target velocity, planning day/time to sensai_settings
-- Creates sensai_ceremonies table (entity existed but no migration)
-- Adds committed_at to velocity records for formal sprint commitment tracking

-- ============================================================================
-- 1. Add sprint planning fields to sensai_settings
-- ============================================================================
ALTER TABLE sensai_settings ADD COLUMN IF NOT EXISTS target_velocity INT NOT NULL DEFAULT 56;
ALTER TABLE sensai_settings ADD COLUMN IF NOT EXISTS planning_day_of_week VARCHAR(10) NOT NULL DEFAULT 'SUNDAY';
ALTER TABLE sensai_settings ADD COLUMN IF NOT EXISTS planning_time VARCHAR(5) NOT NULL DEFAULT '10:00';

-- Add CHECK constraints (use DO block for IF NOT EXISTS on constraints)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_target_velocity') THEN
        ALTER TABLE sensai_settings ADD CONSTRAINT chk_target_velocity
            CHECK (target_velocity >= 20 AND target_velocity <= 100);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_planning_day') THEN
        ALTER TABLE sensai_settings ADD CONSTRAINT chk_planning_day
            CHECK (planning_day_of_week IN ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_planning_time') THEN
        ALTER TABLE sensai_settings ADD CONSTRAINT chk_planning_time
            CHECK (planning_time ~ '^([01]\d|2[0-3]):[0-5]\d$');
    END IF;
END $$;

-- ============================================================================
-- 2. Create sensai_ceremonies table
-- ============================================================================
CREATE TABLE IF NOT EXISTS sensai_ceremonies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sprint_id VARCHAR(20) NOT NULL,
    ceremony_type VARCHAR(20) NOT NULL
        CHECK (ceremony_type IN ('PLANNING', 'STANDUP', 'REVIEW', 'RETROSPECTIVE', 'REFINEMENT')),
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED'
        CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'CANCELLED')),
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_minutes INT,
    notes TEXT,
    outcomes TEXT,
    action_items TEXT,
    coach_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by VARCHAR(36),
    updated_by VARCHAR(36)
);

-- Indexes for ceremony lookups
CREATE INDEX IF NOT EXISTS idx_ceremonies_user_sprint
    ON sensai_ceremonies(user_id, sprint_id);

CREATE INDEX IF NOT EXISTS idx_ceremonies_user_type_status
    ON sensai_ceremonies(user_id, ceremony_type, status);

-- Unique: one ceremony per type per user per sprint
CREATE UNIQUE INDEX IF NOT EXISTS uk_ceremony_user_sprint_type
    ON sensai_ceremonies(user_id, sprint_id, ceremony_type);

-- ============================================================================
-- 3. Add committed_at to velocity records for formal sprint commitment tracking
-- ============================================================================
ALTER TABLE sensai_velocity_records ADD COLUMN IF NOT EXISTS committed_at TIMESTAMPTZ;
ALTER TABLE sensai_velocity_records ADD COLUMN IF NOT EXISTS sprint_goal TEXT;
