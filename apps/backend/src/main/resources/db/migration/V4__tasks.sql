-- ============================================================================
-- V4: Tasks Module (Sprints, Epics, Tasks, Templates)
-- Naming: "tasks" module (not "sdlc")
-- ============================================================================

-- Sprints (52 weeks per year)
CREATE TABLE sprints (
    id VARCHAR(20) PRIMARY KEY,
    week_number INT NOT NULL,
    year INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'planned',
    total_points INT NOT NULL DEFAULT 0,
    completed_points INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_sprint_status CHECK (status IN ('planned', 'active', 'completed')),
    CONSTRAINT uk_sprint_week_year UNIQUE (week_number, year)
);

CREATE INDEX idx_sprints_year ON sprints(year);
CREATE INDEX idx_sprints_status ON sprints(status);

CREATE TRIGGER update_sprints_updated_at
    BEFORE UPDATE ON sprints
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Epics
CREATE TABLE epics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    life_wheel_area_id VARCHAR(10) NOT NULL REFERENCES life_wheel_areas(id),
    target_sprint_id VARCHAR(20) REFERENCES sprints(id),
    status VARCHAR(20) NOT NULL DEFAULT 'planning',
    total_points INT NOT NULL DEFAULT 0,
    completed_points INT NOT NULL DEFAULT 0,
    color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
    icon VARCHAR(50),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    CONSTRAINT chk_epic_status CHECK (status IN ('planning', 'active', 'completed', 'cancelled'))
);

CREATE INDEX idx_epics_user_id ON epics(user_id);
CREATE INDEX idx_epics_status ON epics(status);
CREATE INDEX idx_epics_life_wheel_area ON epics(life_wheel_area_id);

CREATE TRIGGER update_epics_updated_at
    BEFORE UPDATE ON epics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Task Templates
CREATE TABLE task_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    default_story_points INT NOT NULL DEFAULT 3,
    default_life_wheel_area_id VARCHAR(10) REFERENCES life_wheel_areas(id),
    default_eisenhower_quadrant_id VARCHAR(10) REFERENCES eisenhower_quadrants(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36)
);

CREATE INDEX idx_task_templates_user_id ON task_templates(user_id);

CREATE TRIGGER update_task_templates_updated_at
    BEFORE UPDATE ON task_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Tasks
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
    status VARCHAR(20) NOT NULL DEFAULT 'todo',
    is_draft BOOLEAN NOT NULL DEFAULT false,
    ai_confidence DECIMAL(3,2),
    created_from_template_id UUID REFERENCES task_templates(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    CONSTRAINT chk_task_status CHECK (status IN ('draft', 'todo', 'in_progress', 'done')),
    CONSTRAINT chk_story_points CHECK (story_points IN (1, 2, 3, 5, 8, 13, 21))
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_epic_id ON tasks(epic_id);
CREATE INDEX idx_tasks_sprint_id ON tasks(sprint_id);
CREATE INDEX idx_tasks_status ON tasks(status);

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Task Comments
CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    comment_text TEXT NOT NULL,
    is_ai_generated BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36)
);

CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);

-- Task History (audit trail)
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

-- Seed sprints for 2025 and 2026
INSERT INTO sprints (id, week_number, year, start_date, end_date, status, total_points, completed_points)
SELECT
    'sprint-' || year_val || '-' || week_num,
    week_num,
    year_val,
    DATE '2024-12-30' + ((year_val - 2025) * 52 + (week_num - 1)) * INTERVAL '7 days',
    DATE '2025-01-05' + ((year_val - 2025) * 52 + (week_num - 1)) * INTERVAL '7 days',
    CASE
        WHEN year_val = 2025 THEN 'completed'
        WHEN year_val = 2026 AND week_num < 4 THEN 'completed'
        WHEN year_val = 2026 AND week_num = 4 THEN 'active'
        ELSE 'planned'
    END,
    0, 0
FROM generate_series(2025, 2026) AS year_val,
     generate_series(1, 52) AS week_num;
