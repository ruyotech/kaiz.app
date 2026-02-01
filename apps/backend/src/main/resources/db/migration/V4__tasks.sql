-- ============================================================================
-- V4: Tasks Module
-- Sprints, Epics, Tasks, Task Templates, Comments, History
-- User Tags, Recurrence, Attachments
-- ============================================================================

-- ============================================================================
-- SPRINTS (52 weeks per year)
-- ============================================================================
CREATE TABLE sprints (
    id VARCHAR(20) PRIMARY KEY,
    week_number INT NOT NULL,
    year INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
    total_points INT NOT NULL DEFAULT 0,
    completed_points INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_sprint_status CHECK (status IN ('PLANNED', 'ACTIVE', 'COMPLETED')),
    CONSTRAINT uk_sprint_week_year UNIQUE (week_number, year)
);

CREATE INDEX idx_sprints_year ON sprints(year);
CREATE INDEX idx_sprints_status ON sprints(status);

CREATE TRIGGER update_sprints_updated_at
    BEFORE UPDATE ON sprints
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- EPICS
-- ============================================================================
CREATE TABLE epics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    life_wheel_area_id VARCHAR(10) NOT NULL REFERENCES life_wheel_areas(id),
    target_sprint_id VARCHAR(20) REFERENCES sprints(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PLANNING',
    total_points INT NOT NULL DEFAULT 0,
    completed_points INT NOT NULL DEFAULT 0,
    color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
    icon VARCHAR(50),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    -- Family fields
    family_id UUID,
    visibility VARCHAR(20) DEFAULT 'PRIVATE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    CONSTRAINT chk_epic_status CHECK (status IN ('PLANNING', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
    CONSTRAINT chk_epic_visibility CHECK (visibility IS NULL OR visibility IN ('PRIVATE', 'SHARED', 'ASSIGNED'))
);

CREATE INDEX idx_epics_user_id ON epics(user_id);
CREATE INDEX idx_epics_status ON epics(status);
CREATE INDEX idx_epics_life_wheel_area ON epics(life_wheel_area_id);
CREATE INDEX idx_epics_family_id ON epics(family_id) WHERE family_id IS NOT NULL;
CREATE INDEX idx_epics_visibility ON epics(visibility) WHERE visibility IS NOT NULL;

CREATE TRIGGER update_epics_updated_at
    BEFORE UPDATE ON epics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TASK TEMPLATES (Base table - extended in V4b)
-- ============================================================================
CREATE TABLE task_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL for system templates
    default_story_points INT NOT NULL DEFAULT 3,
    default_life_wheel_area_id VARCHAR(10) REFERENCES life_wheel_areas(id),
    default_eisenhower_quadrant_id VARCHAR(10) REFERENCES eisenhower_quadrants(id),
    -- Template type and ownership
    type VARCHAR(10) NOT NULL DEFAULT 'TASK',
    creator_type VARCHAR(10) NOT NULL DEFAULT 'USER',
    -- Event-specific defaults
    default_duration INT, -- minutes
    default_location VARCHAR(500),
    is_all_day BOOLEAN NOT NULL DEFAULT FALSE,
    default_attendees TEXT[],
    -- Recurrence settings
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    recurrence_frequency VARCHAR(20),
    recurrence_interval INT DEFAULT 1,
    recurrence_end_date DATE,
    -- Sprint placement
    suggested_sprint VARCHAR(20) NOT NULL DEFAULT 'BACKLOG',
    -- Community metrics
    rating DECIMAL(2,1) NOT NULL DEFAULT 0,
    rating_count INT NOT NULL DEFAULT 0,
    usage_count INT NOT NULL DEFAULT 0,
    -- Display
    icon VARCHAR(50) DEFAULT '📋',
    color VARCHAR(7) DEFAULT '#3B82F6',
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    CONSTRAINT chk_template_type CHECK (type IN ('TASK', 'EVENT')),
    CONSTRAINT chk_creator_type CHECK (creator_type IN ('SYSTEM', 'USER')),
    CONSTRAINT chk_suggested_sprint CHECK (suggested_sprint IN ('CURRENT', 'NEXT', 'BACKLOG')),
    CONSTRAINT chk_recurrence_frequency CHECK (
        recurrence_frequency IS NULL OR 
        recurrence_frequency IN ('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'YEARLY')
    ),
    CONSTRAINT chk_rating_range CHECK (rating >= 0 AND rating <= 5)
);

CREATE INDEX idx_task_templates_user_id ON task_templates(user_id);
CREATE INDEX idx_task_templates_type ON task_templates(type);
CREATE INDEX idx_task_templates_creator_type ON task_templates(creator_type);
CREATE INDEX idx_task_templates_life_wheel_area ON task_templates(default_life_wheel_area_id);
CREATE INDEX idx_task_templates_rating ON task_templates(rating DESC);
CREATE INDEX idx_task_templates_usage ON task_templates(usage_count DESC);

CREATE TRIGGER update_task_templates_updated_at
    BEFORE UPDATE ON task_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TASK TEMPLATE TAGS (Many-to-many for system template tags)
-- ============================================================================
CREATE TABLE task_template_tags (
    template_id UUID NOT NULL REFERENCES task_templates(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    PRIMARY KEY (template_id, tag)
);

CREATE INDEX idx_task_template_tags_tag ON task_template_tags(tag);
CREATE INDEX idx_task_template_tags_template ON task_template_tags(template_id);

-- ============================================================================
-- TEMPLATE FAVORITES
-- ============================================================================
CREATE TABLE template_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES task_templates(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    CONSTRAINT uk_template_favorite UNIQUE (user_id, template_id)
);

CREATE INDEX idx_template_favorites_user ON template_favorites(user_id);
CREATE INDEX idx_template_favorites_template ON template_favorites(template_id);

CREATE TRIGGER update_template_favorites_updated_at
    BEFORE UPDATE ON template_favorites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TEMPLATE RATINGS
-- ============================================================================
CREATE TABLE template_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES task_templates(id) ON DELETE CASCADE,
    rating INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    CONSTRAINT uk_template_rating UNIQUE (user_id, template_id),
    CONSTRAINT chk_user_rating CHECK (rating >= 1 AND rating <= 5)
);

CREATE INDEX idx_template_ratings_user ON template_ratings(user_id);
CREATE INDEX idx_template_ratings_template ON template_ratings(template_id);

CREATE TRIGGER update_template_ratings_updated_at
    BEFORE UPDATE ON template_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- USER TEMPLATE TAGS (Personal tags on any template)
-- ============================================================================
CREATE TABLE user_template_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES task_templates(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    CONSTRAINT uk_user_template_tag UNIQUE (user_id, template_id, tag)
);

CREATE INDEX idx_user_template_tags_user_template ON user_template_tags(user_id, template_id);
CREATE INDEX idx_user_template_tags_user ON user_template_tags(user_id);

-- ============================================================================
-- USER TAGS (Reusable tags for tasks)
-- ============================================================================
CREATE TABLE user_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#6B7280',
    usage_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    CONSTRAINT uk_user_tags_name UNIQUE (user_id, name)
);

CREATE INDEX idx_user_tags_user_id ON user_tags(user_id);
CREATE INDEX idx_user_tags_usage ON user_tags(user_id, usage_count DESC);

CREATE TRIGGER update_user_tags_updated_at
    BEFORE UPDATE ON user_tags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TASKS
-- ============================================================================
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    epic_id UUID REFERENCES epics(id) ON DELETE SET NULL,
    life_wheel_area_id VARCHAR(10) NOT NULL REFERENCES life_wheel_areas(id),
    eisenhower_quadrant_id VARCHAR(10) NOT NULL REFERENCES eisenhower_quadrants(id),
    sprint_id VARCHAR(20) REFERENCES sprints(id) ON DELETE SET NULL,
    story_points INT NOT NULL DEFAULT 3,
    status VARCHAR(20) NOT NULL DEFAULT 'TODO',
    is_draft BOOLEAN NOT NULL DEFAULT FALSE,
    ai_confidence DECIMAL(3,2),
    created_from_template_id UUID REFERENCES task_templates(id) ON DELETE SET NULL,
    target_date TIMESTAMP WITH TIME ZONE,
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    -- Family fields
    family_id UUID,
    visibility VARCHAR(20) DEFAULT 'PRIVATE',
    assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    requires_approval BOOLEAN NOT NULL DEFAULT FALSE,
    approved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    CONSTRAINT chk_task_status CHECK (status IN ('DRAFT', 'BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE')),
    CONSTRAINT chk_story_points CHECK (story_points IN (1, 2, 3, 5, 8, 13, 21)),
    CONSTRAINT chk_task_visibility CHECK (visibility IS NULL OR visibility IN ('PRIVATE', 'SHARED', 'ASSIGNED'))
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_epic_id ON tasks(epic_id);
CREATE INDEX idx_tasks_sprint_id ON tasks(sprint_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_family_id ON tasks(family_id) WHERE family_id IS NOT NULL;
CREATE INDEX idx_tasks_visibility ON tasks(visibility) WHERE visibility IS NOT NULL;
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to_user_id) WHERE assigned_to_user_id IS NOT NULL;

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TASK TAGS (Many-to-many junction)
-- ============================================================================
CREATE TABLE task_tags (
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES user_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (task_id, tag_id)
);

CREATE INDEX idx_task_tags_task_id ON task_tags(task_id);
CREATE INDEX idx_task_tags_tag_id ON task_tags(tag_id);

-- ============================================================================
-- TASK RECURRENCES
-- ============================================================================
CREATE TABLE task_recurrences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL UNIQUE REFERENCES tasks(id) ON DELETE CASCADE,
    frequency VARCHAR(20) NOT NULL,
    interval_value INT NOT NULL DEFAULT 1,
    start_date DATE NOT NULL,
    end_date DATE,
    day_of_week INT, -- 0-6 (Sunday-Saturday)
    day_of_month INT, -- 1-31
    yearly_date DATE,
    scheduled_time TIME,
    scheduled_end_time TIME,
    last_generated_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    CONSTRAINT chk_recurrence_frequency CHECK (frequency IN ('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'YEARLY')),
    CONSTRAINT chk_day_of_week CHECK (day_of_week IS NULL OR (day_of_week >= 0 AND day_of_week <= 6)),
    CONSTRAINT chk_day_of_month CHECK (day_of_month IS NULL OR (day_of_month >= 1 AND day_of_month <= 31))
);

CREATE INDEX idx_task_recurrences_task_id ON task_recurrences(task_id);
CREATE INDEX idx_task_recurrences_active ON task_recurrences(is_active) WHERE is_active = TRUE;

CREATE TRIGGER update_task_recurrences_updated_at
    BEFORE UPDATE ON task_recurrences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TASK ATTACHMENTS
-- ============================================================================
CREATE TABLE task_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36)
);

CREATE INDEX idx_task_attachments_task_id ON task_attachments(task_id);

CREATE TRIGGER update_task_attachments_updated_at
    BEFORE UPDATE ON task_attachments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TASK COMMENTS
-- ============================================================================
CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    comment_text TEXT NOT NULL,
    is_ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36)
);

CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);

-- ============================================================================
-- TASK COMMENT ATTACHMENTS
-- ============================================================================
CREATE TABLE task_comment_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES task_comments(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36)
);

CREATE INDEX idx_task_comment_attachments_comment_id ON task_comment_attachments(comment_id);

-- ============================================================================
-- TASK HISTORY (Audit trail)
-- ============================================================================
CREATE TABLE task_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    field_name VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36)
);

CREATE INDEX idx_task_history_task_id ON task_history(task_id);

-- ============================================================================
-- SEED SPRINTS (2025-2027)
-- ============================================================================
INSERT INTO sprints (id, week_number, year, start_date, end_date, status, total_points, completed_points)
SELECT
    'sprint-' || year_val || '-' || week_num,
    week_num,
    year_val,
    DATE '2024-12-30' + ((year_val - 2025) * 52 + (week_num - 1)) * INTERVAL '7 days',
    DATE '2025-01-05' + ((year_val - 2025) * 52 + (week_num - 1)) * INTERVAL '7 days',
    CASE
        WHEN year_val < 2026 THEN 'COMPLETED'
        WHEN year_val = 2026 AND week_num < 5 THEN 'COMPLETED'
        WHEN year_val = 2026 AND week_num = 5 THEN 'ACTIVE'
        ELSE 'PLANNED'
    END,
    0, 0
FROM generate_series(2025, 2027) AS year_val,
     generate_series(1, 52) AS week_num;
