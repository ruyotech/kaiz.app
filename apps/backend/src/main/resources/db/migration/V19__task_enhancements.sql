-- ============================================================================
-- V19: Task Enhancements (Recurrence, Attachments, User Tags, Status Update)
-- ============================================================================

-- 1. Add BACKLOG status to tasks
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS chk_task_status;
ALTER TABLE tasks ADD CONSTRAINT chk_task_status 
    CHECK (status IN ('DRAFT', 'BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE'));

-- 2. Add target_date column to tasks (for non-recurring tasks with due date)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS target_date TIMESTAMP WITH TIME ZONE;

-- 3. User Tags table (reusable across tasks and templates)
CREATE TABLE IF NOT EXISTS user_tags (
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

CREATE INDEX IF NOT EXISTS idx_user_tags_user_id ON user_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tags_usage ON user_tags(user_id, usage_count DESC);

CREATE TRIGGER update_user_tags_updated_at
    BEFORE UPDATE ON user_tags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Task-Tag junction table (many-to-many)
CREATE TABLE IF NOT EXISTS task_tags (
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES user_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (task_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_task_tags_task_id ON task_tags(task_id);
CREATE INDEX IF NOT EXISTS idx_task_tags_tag_id ON task_tags(tag_id);

-- 5. Task Recurrence table
CREATE TABLE IF NOT EXISTS task_recurrences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    frequency VARCHAR(20) NOT NULL,
    interval_value INT NOT NULL DEFAULT 1,
    start_date DATE NOT NULL,
    end_date DATE,
    day_of_week INT, -- 0-6 (Sunday-Saturday) for weekly recurrence
    day_of_month INT, -- 1-31 for monthly recurrence
    yearly_date DATE, -- specific date for yearly recurrence
    scheduled_time TIME, -- time of day for the task
    last_generated_date DATE, -- tracks when last instance was generated
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    CONSTRAINT chk_recurrence_frequency CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'yearly')),
    CONSTRAINT chk_day_of_week CHECK (day_of_week IS NULL OR (day_of_week >= 0 AND day_of_week <= 6)),
    CONSTRAINT chk_day_of_month CHECK (day_of_month IS NULL OR (day_of_month >= 1 AND day_of_month <= 31)),
    CONSTRAINT uk_task_recurrence UNIQUE (task_id)
);

CREATE INDEX IF NOT EXISTS idx_task_recurrences_task_id ON task_recurrences(task_id);
CREATE INDEX IF NOT EXISTS idx_task_recurrences_active ON task_recurrences(is_active) WHERE is_active = true;

CREATE TRIGGER update_task_recurrences_updated_at
    BEFORE UPDATE ON task_recurrences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Task Attachments table
CREATE TABLE IF NOT EXISTS task_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT, -- in bytes
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36)
);

CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON task_attachments(task_id);

CREATE TRIGGER update_task_attachments_updated_at
    BEFORE UPDATE ON task_attachments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Add is_recurring flag to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_tasks_is_recurring ON tasks(is_recurring) WHERE is_recurring = true;

-- 8. Add event fields to tasks (for tasks created from event templates)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_event BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS location VARCHAR(500);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_all_day BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS event_start_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS event_end_time TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_tasks_is_event ON tasks(is_event) WHERE is_event = true;
