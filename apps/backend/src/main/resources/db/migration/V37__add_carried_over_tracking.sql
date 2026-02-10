-- V37: Add carried-over tracking to tasks table for Agile carry-over methodology
-- When a sprint is completed, incomplete tasks are carried over to the next sprint.
-- Users can re-estimate story points during planning.

-- 1. Track which sprint a task was carried over from
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS carried_over_from_sprint_id VARCHAR(20)
    REFERENCES sprints(id) ON DELETE SET NULL;

-- 2. Store original story points before re-estimation (so user sees what changed)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS original_story_points INTEGER;

-- 3. Index for efficient carry-over queries
CREATE INDEX IF NOT EXISTS idx_tasks_carried_over ON tasks(carried_over_from_sprint_id)
    WHERE carried_over_from_sprint_id IS NOT NULL;

-- 4. Add sprint_goal column to sprints table for display in reviews
ALTER TABLE sprints ADD COLUMN IF NOT EXISTS sprint_goal TEXT;
