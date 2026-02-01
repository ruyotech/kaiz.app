-- ============================================================================
-- V5: Challenges Module
-- Challenge Templates, Challenges, Participants, Entries
-- ============================================================================

-- ============================================================================
-- CHALLENGE TEMPLATES
-- ============================================================================
CREATE TABLE challenge_templates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    life_wheel_area_id VARCHAR(10) REFERENCES life_wheel_areas(id),
    metric_type VARCHAR(20) NOT NULL,
    target_value DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50),
    suggested_duration INT NOT NULL DEFAULT 30,
    recurrence VARCHAR(20) NOT NULL DEFAULT 'DAILY',
    difficulty VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    popularity_score INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_template_metric_type CHECK (metric_type IN ('COUNT', 'YESNO', 'STREAK', 'TIME', 'COMPLETION')),
    CONSTRAINT chk_template_recurrence CHECK (recurrence IN ('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'CUSTOM')),
    CONSTRAINT chk_template_difficulty CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD', 'EXPERT'))
);

CREATE INDEX idx_challenge_templates_area ON challenge_templates(life_wheel_area_id);

-- ============================================================================
-- CHALLENGES
-- ============================================================================
CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    life_wheel_area_id VARCHAR(10) NOT NULL REFERENCES life_wheel_areas(id),
    metric_type VARCHAR(20) NOT NULL,
    target_value DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50),
    duration INT NOT NULL DEFAULT 30,
    recurrence VARCHAR(20) NOT NULL DEFAULT 'DAILY',
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    why_statement TEXT,
    reward_description TEXT,
    grace_days INT NOT NULL DEFAULT 0,
    current_streak INT NOT NULL DEFAULT 0,
    best_streak INT NOT NULL DEFAULT 0,
    challenge_type VARCHAR(20) NOT NULL DEFAULT 'SOLO',
    visibility VARCHAR(20) NOT NULL DEFAULT 'PRIVATE',
    created_from_template_id VARCHAR(50) REFERENCES challenge_templates(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    CONSTRAINT chk_challenge_metric_type CHECK (metric_type IN ('COUNT', 'YESNO', 'STREAK', 'TIME', 'COMPLETION')),
    CONSTRAINT chk_challenge_recurrence CHECK (recurrence IN ('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'CUSTOM')),
    CONSTRAINT chk_challenge_status CHECK (status IN ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ABANDONED')),
    CONSTRAINT chk_challenge_type CHECK (challenge_type IN ('SOLO', 'GROUP', 'ACCOUNTABILITY')),
    CONSTRAINT chk_challenge_visibility CHECK (visibility IN ('PRIVATE', 'FRIENDS', 'PUBLIC'))
);

CREATE INDEX idx_challenges_user_id ON challenges(user_id);
CREATE INDEX idx_challenges_status ON challenges(status);
CREATE INDEX idx_challenges_life_wheel_area ON challenges(life_wheel_area_id);

CREATE TRIGGER update_challenges_updated_at
    BEFORE UPDATE ON challenges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- CHALLENGE PARTICIPANTS
-- ============================================================================
CREATE TABLE challenge_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    current_progress DECIMAL(10,2) NOT NULL DEFAULT 0,
    streak_days INT NOT NULL DEFAULT 0,
    is_accountability_partner BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    CONSTRAINT uk_challenge_participant UNIQUE (challenge_id, user_id)
);

CREATE INDEX idx_challenge_participants_challenge ON challenge_participants(challenge_id);
CREATE INDEX idx_challenge_participants_user ON challenge_participants(user_id);

CREATE TRIGGER update_challenge_participants_updated_at
    BEFORE UPDATE ON challenge_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- CHALLENGE ENTRIES
-- ============================================================================
CREATE TABLE challenge_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    value_numeric DECIMAL(10,2),
    value_boolean BOOLEAN,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    CONSTRAINT uk_challenge_entry_date UNIQUE (challenge_id, user_id, entry_date)
);

CREATE INDEX idx_challenge_entries_challenge ON challenge_entries(challenge_id);
CREATE INDEX idx_challenge_entries_user ON challenge_entries(user_id);
CREATE INDEX idx_challenge_entries_date ON challenge_entries(entry_date);

-- ============================================================================
-- SEED CHALLENGE TEMPLATES
-- ============================================================================
INSERT INTO challenge_templates (id, name, description, life_wheel_area_id, metric_type, target_value, unit, suggested_duration, recurrence, difficulty) VALUES
('tpl-water', '8 Glasses of Water', 'Drink at least 8 glasses of water daily', 'lw-1', 'COUNT', 8, 'glasses', 30, 'DAILY', 'EASY'),
('tpl-steps', '10K Steps Challenge', 'Walk 10,000 steps every day', 'lw-1', 'COUNT', 10000, 'steps', 30, 'DAILY', 'MEDIUM'),
('tpl-workout', 'Daily Workout', 'Complete at least 30 minutes of exercise', 'lw-1', 'TIME', 30, 'minutes', 30, 'DAILY', 'MEDIUM'),
('tpl-sleep', 'Sleep 8 Hours', 'Get at least 8 hours of sleep each night', 'lw-1', 'TIME', 8, 'hours', 30, 'DAILY', 'MEDIUM'),
('tpl-nosugar', 'No Sugar Challenge', 'Avoid added sugar for the entire duration', 'lw-1', 'YESNO', 1, NULL, 21, 'DAILY', 'HARD'),
('tpl-reading', 'Read 30 Minutes', 'Read for at least 30 minutes daily', 'lw-2', 'TIME', 30, 'minutes', 30, 'DAILY', 'EASY'),
('tpl-learn', 'Learn Something New', 'Learn one new thing every day', 'lw-2', 'YESNO', 1, NULL, 30, 'DAILY', 'EASY'),
('tpl-meditation', 'Daily Meditation', 'Meditate for at least 10 minutes', 'lw-5', 'TIME', 10, 'minutes', 30, 'DAILY', 'EASY'),
('tpl-gratitude', 'Gratitude Journal', 'Write 3 things you are grateful for', 'lw-5', 'COUNT', 3, 'items', 30, 'DAILY', 'EASY'),
('tpl-hobby', 'Hobby Time', 'Spend at least 30 minutes on a hobby', 'lw-8', 'TIME', 30, 'minutes', 30, 'DAILY', 'EASY'),
('tpl-nature', 'Nature Time', 'Spend time outdoors in nature', 'lw-8', 'YESNO', 1, NULL, 30, 'DAILY', 'EASY');
