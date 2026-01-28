-- ============================================================================
-- V13: Extended Task/Event Templates System
-- Adds: type, event fields, recurrence, ratings, favorites, global templates
-- ============================================================================

-- Add new columns to task_templates table
ALTER TABLE task_templates
    -- Template type (task or event)
    ADD COLUMN type VARCHAR(10) NOT NULL DEFAULT 'task',
    
    -- Event-specific defaults
    ADD COLUMN default_duration INT, -- minutes
    ADD COLUMN default_location VARCHAR(500),
    ADD COLUMN is_all_day BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN default_attendees TEXT[], -- array of attendee names
    
    -- Recurrence settings
    ADD COLUMN is_recurring BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN recurrence_frequency VARCHAR(20), -- daily, weekly, biweekly, monthly, yearly
    ADD COLUMN recurrence_interval INT DEFAULT 1,
    ADD COLUMN recurrence_end_date DATE,
    
    -- Sprint placement suggestion
    ADD COLUMN suggested_sprint VARCHAR(20) NOT NULL DEFAULT 'backlog',
    
    -- Ownership (system = global admin templates, user = user-created)
    ADD COLUMN creator_type VARCHAR(10) NOT NULL DEFAULT 'user',
    
    -- Community metrics
    ADD COLUMN rating DECIMAL(2,1) NOT NULL DEFAULT 0,
    ADD COLUMN rating_count INT NOT NULL DEFAULT 0,
    ADD COLUMN usage_count INT NOT NULL DEFAULT 0,
    
    -- Display customization
    ADD COLUMN icon VARCHAR(50) DEFAULT '📋',
    ADD COLUMN color VARCHAR(7) DEFAULT '#3B82F6',
    
    -- Custom tags (JSON array of strings)
    ADD COLUMN tags JSONB DEFAULT '[]'::jsonb;

-- Allow null user_id for system templates
ALTER TABLE task_templates ALTER COLUMN user_id DROP NOT NULL;

-- Add constraints
ALTER TABLE task_templates
    ADD CONSTRAINT chk_template_type CHECK (type IN ('task', 'event')),
    ADD CONSTRAINT chk_creator_type CHECK (creator_type IN ('system', 'user')),
    ADD CONSTRAINT chk_suggested_sprint CHECK (suggested_sprint IN ('current', 'next', 'backlog')),
    ADD CONSTRAINT chk_recurrence_frequency CHECK (
        recurrence_frequency IS NULL OR 
        recurrence_frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'yearly')
    ),
    ADD CONSTRAINT chk_rating_range CHECK (rating >= 0 AND rating <= 5);

-- Add indexes for common queries
CREATE INDEX idx_task_templates_type ON task_templates(type);
CREATE INDEX idx_task_templates_creator_type ON task_templates(creator_type);
CREATE INDEX idx_task_templates_life_wheel_area ON task_templates(default_life_wheel_area_id);
CREATE INDEX idx_task_templates_rating ON task_templates(rating DESC);
CREATE INDEX idx_task_templates_usage ON task_templates(usage_count DESC);

-- Template Favorites (user bookmarked templates)
CREATE TABLE template_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES task_templates(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_template_favorite UNIQUE (user_id, template_id)
);

CREATE INDEX idx_template_favorites_user ON template_favorites(user_id);
CREATE INDEX idx_template_favorites_template ON template_favorites(template_id);

CREATE TRIGGER update_template_favorites_updated_at
    BEFORE UPDATE ON template_favorites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Template Ratings (user ratings for templates)
CREATE TABLE template_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES task_templates(id) ON DELETE CASCADE,
    rating INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_template_rating UNIQUE (user_id, template_id),
    CONSTRAINT chk_user_rating CHECK (rating >= 1 AND rating <= 5)
);

CREATE INDEX idx_template_ratings_user ON template_ratings(user_id);
CREATE INDEX idx_template_ratings_template ON template_ratings(template_id);

CREATE TRIGGER update_template_ratings_updated_at
    BEFORE UPDATE ON template_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update template average rating
CREATE OR REPLACE FUNCTION update_template_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE task_templates
    SET rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM template_ratings
        WHERE template_id = COALESCE(NEW.template_id, OLD.template_id)
    ),
    rating_count = (
        SELECT COUNT(*)
        FROM template_ratings
        WHERE template_id = COALESCE(NEW.template_id, OLD.template_id)
    )
    WHERE id = COALESCE(NEW.template_id, OLD.template_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers to maintain rating aggregates
CREATE TRIGGER trigger_template_rating_insert
    AFTER INSERT ON template_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_template_rating();

CREATE TRIGGER trigger_template_rating_update
    AFTER UPDATE ON template_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_template_rating();

CREATE TRIGGER trigger_template_rating_delete
    AFTER DELETE ON template_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_template_rating();

-- Seed some default global templates
INSERT INTO task_templates (
    name, description, type, creator_type, user_id,
    default_story_points, default_life_wheel_area_id, default_eisenhower_quadrant_id,
    is_recurring, recurrence_frequency, recurrence_interval, suggested_sprint,
    icon, color, tags
) VALUES
    -- Health templates (lw-1 = Health & Fitness)
    ('Morning Workout', 'Start your day with 30 minutes of exercise', 'task', 'system', NULL,
     2, 'lw-1', 'eq-2', true, 'daily', 1, 'current',
     '💪', '#10b981', '["fitness", "morning", "routine"]'),
    
    ('Weekly Meal Prep', 'Prepare healthy meals for the week ahead', 'task', 'system', NULL,
     3, 'lw-1', 'eq-2', true, 'weekly', 1, 'current',
     '🥗', '#10b981', '["nutrition", "planning", "health"]'),
    
    ('Sleep Routine Check', 'Review and optimize your sleep schedule', 'task', 'system', NULL,
     1, 'lw-1', 'eq-2', true, 'weekly', 1, 'next',
     '😴', '#10b981', '["sleep", "health", "routine"]'),

    -- Career templates (lw-2 = Career & Work)
    ('Weekly Goals Review', 'Review progress on career goals and plan next steps', 'task', 'system', NULL,
     2, 'lw-2', 'eq-2', true, 'weekly', 1, 'current',
     '🎯', '#3b82f6', '["goals", "review", "planning"]'),
    
    ('Learn New Skill', 'Dedicate time to learning a new professional skill', 'task', 'system', NULL,
     3, 'lw-2', 'eq-2', true, 'weekly', 1, 'current',
     '📚', '#3b82f6', '["learning", "growth", "skills"]'),
    
    ('Networking Session', 'Connect with a colleague or industry peer', 'event', 'system', NULL,
     2, 'lw-2', 'eq-2', false, NULL, NULL, 'next',
     '🤝', '#3b82f6', '["networking", "career", "relationships"]'),

    -- Finance templates (lw-3 = Finance & Money)
    ('Budget Review', 'Review monthly spending and adjust budget', 'task', 'system', NULL,
     2, 'lw-3', 'eq-2', true, 'monthly', 1, 'current',
     '💰', '#f59e0b', '["budget", "finance", "review"]'),
    
    ('Investment Check', 'Review investment portfolio and rebalance if needed', 'task', 'system', NULL,
     3, 'lw-3', 'eq-2', true, 'monthly', 1, 'next',
     '📈', '#f59e0b', '["investing", "finance", "portfolio"]'),

    -- Family templates (lw-5 = Relationships & Family)
    ('Family Dinner', 'Quality time with family over a meal', 'event', 'system', NULL,
     1, 'lw-5', 'eq-2', true, 'weekly', 1, 'current',
     '👨‍👩‍👧‍👦', '#ec4899', '["family", "quality-time", "connection"]'),
    
    ('Call Parents/Relatives', 'Stay connected with extended family', 'task', 'system', NULL,
     1, 'lw-5', 'eq-2', true, 'weekly', 1, 'current',
     '📞', '#ec4899', '["family", "connection", "communication"]'),

    -- Personal Growth templates (lw-4 = Personal Growth)
    ('Daily Journaling', 'Reflect on the day and capture thoughts', 'task', 'system', NULL,
     1, 'lw-4', 'eq-2', true, 'daily', 1, 'current',
     '📓', '#06b6d4', '["journaling", "reflection", "mindfulness"]'),
    
    ('Read for 30 Minutes', 'Personal development through reading', 'task', 'system', NULL,
     1, 'lw-4', 'eq-2', true, 'daily', 1, 'current',
     '📖', '#06b6d4', '["reading", "learning", "growth"]'),
    
    ('Meditation Session', 'Mindfulness and mental clarity practice', 'task', 'system', NULL,
     1, 'lw-4', 'eq-2', true, 'daily', 1, 'current',
     '🧘', '#06b6d4', '["meditation", "mindfulness", "wellness"]'),

    -- Fun & Recreation templates (lw-7 = Fun & Recreation)
    ('Hobby Time', 'Dedicate time to your favorite hobby', 'task', 'system', NULL,
     2, 'lw-7', 'eq-2', true, 'weekly', 1, 'current',
     '🎨', '#f97316', '["hobby", "fun", "recreation"]'),
    
    -- Social Life templates (lw-6 = Social Life)
    ('Social Outing', 'Plan an activity with friends', 'event', 'system', NULL,
     2, 'lw-6', 'eq-2', true, 'biweekly', 1, 'next',
     '🎉', '#8b5cf6', '["social", "friends", "fun"]'),

    -- Environment templates (lw-8 = Environment & Home)
    ('Weekly Clean-up', 'Organize and clean living space', 'task', 'system', NULL,
     2, 'lw-8', 'eq-2', true, 'weekly', 1, 'current',
     '🧹', '#84cc16', '["cleaning", "organization", "home"]'),
    
    ('Digital Declutter', 'Clean up emails, files, and digital spaces', 'task', 'system', NULL,
     2, 'lw-8', 'eq-2', true, 'monthly', 1, 'next',
     '🗂️', '#84cc16', '["digital", "organization", "productivity"]');
