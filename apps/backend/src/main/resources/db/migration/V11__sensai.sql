-- ============================================================================
-- V11: SensAI Module
-- AI Scrum Master / Life Coach: Settings, Standups, Interventions, Velocity
-- ============================================================================

-- ============================================================================
-- SENSAI SETTINGS
-- ============================================================================
CREATE TABLE sensai_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    coach_tone VARCHAR(20) NOT NULL DEFAULT 'DIRECT',
    interventions_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    daily_standup_time VARCHAR(5) DEFAULT '09:00',
    sprint_length_days INTEGER NOT NULL DEFAULT 14,
    max_daily_capacity INTEGER NOT NULL DEFAULT 8,
    overcommit_threshold DECIMAL(4,2) NOT NULL DEFAULT 0.15,
    dimension_alert_threshold INTEGER NOT NULL DEFAULT 5,
    dimension_priorities TEXT,
    standup_reminders_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    ceremony_reminders_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    weekly_digest_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX idx_sensai_settings_user ON sensai_settings(user_id);

-- ============================================================================
-- DAILY STANDUPS
-- ============================================================================
CREATE TABLE sensai_standups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    standup_date DATE NOT NULL,
    yesterday_summary TEXT,
    today_plan TEXT,
    blockers TEXT,
    mood_score INTEGER,
    energy_level INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE,
    coach_response TEXT,
    is_skipped BOOLEAN NOT NULL DEFAULT FALSE,
    skip_reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    UNIQUE(user_id, standup_date)
);

CREATE INDEX idx_sensai_standups_user_date ON sensai_standups(user_id, standup_date);

-- ============================================================================
-- INTERVENTIONS
-- ============================================================================
CREATE TABLE sensai_interventions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    intervention_type VARCHAR(30) NOT NULL,
    urgency VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_suggestion TEXT,
    data_context TEXT,
    triggered_at TIMESTAMP WITH TIME ZONE NOT NULL,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    action_taken TEXT,
    dismissed_at TIMESTAMP WITH TIME ZONE,
    dismiss_reason VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    related_sprint_id VARCHAR(50),
    related_dimension VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX idx_sensai_interventions_user_active ON sensai_interventions(user_id, is_active);
CREATE INDEX idx_sensai_interventions_user_urgency ON sensai_interventions(user_id, urgency);

-- ============================================================================
-- VELOCITY RECORDS
-- ============================================================================
CREATE TABLE sensai_velocity_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sprint_id VARCHAR(50) NOT NULL,
    sprint_start_date DATE NOT NULL,
    sprint_end_date DATE NOT NULL,
    committed_points INTEGER NOT NULL DEFAULT 0,
    completed_points INTEGER NOT NULL DEFAULT 0,
    carried_over_points INTEGER NOT NULL DEFAULT 0,
    added_mid_sprint INTEGER NOT NULL DEFAULT 0,
    completion_rate DECIMAL(5,2),
    focus_factor DECIMAL(5,2),
    is_overcommitted BOOLEAN NOT NULL DEFAULT FALSE,
    overcommit_percentage DECIMAL(5,2),
    dimension_distribution TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    UNIQUE(user_id, sprint_id)
);

CREATE INDEX idx_sensai_velocity_user ON sensai_velocity_records(user_id);
CREATE INDEX idx_sensai_velocity_sprint ON sensai_velocity_records(sprint_id);
