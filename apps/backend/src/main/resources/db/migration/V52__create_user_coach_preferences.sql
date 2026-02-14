-- V52: Create user_coach_preferences table for personalized AI coaching
-- Stores learned patterns from feedback loop + explicit user preferences

CREATE TABLE IF NOT EXISTS user_coach_preferences (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preferred_tone        VARCHAR(20) NOT NULL DEFAULT 'DIRECT'
                          CHECK (preferred_tone IN ('SUPPORTIVE', 'DIRECT', 'CHALLENGING')),
    default_mode          VARCHAR(30) NOT NULL DEFAULT 'FREEFORM'
                          CHECK (default_mode IN ('FREEFORM', 'CAPTURE', 'PLANNING', 'STANDUP', 'RETROSPECTIVE', 'REVIEW', 'REFINEMENT')),
    correction_patterns   JSONB DEFAULT '[]'::jsonb,
    preferred_categories  JSONB DEFAULT '[]'::jsonb,
    auto_approve_above    DOUBLE PRECISION DEFAULT 0.95,
    morning_standup_time  TIME DEFAULT '09:00',
    planning_day          VARCHAR(10) DEFAULT 'SUNDAY'
                          CHECK (planning_day IN ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY')),
    total_interactions    INTEGER NOT NULL DEFAULT 0,
    total_drafts_approved INTEGER NOT NULL DEFAULT 0,
    total_drafts_modified INTEGER NOT NULL DEFAULT 0,
    total_drafts_rejected INTEGER NOT NULL DEFAULT 0,
    created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by            VARCHAR(36),
    updated_by            VARCHAR(36),
    CONSTRAINT uq_user_coach_preferences UNIQUE (user_id)
);
