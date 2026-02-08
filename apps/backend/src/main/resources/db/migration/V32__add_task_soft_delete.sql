-- V32: Add soft delete support to tasks table
-- Adds a deleted_at timestamp column for soft-delete functionality.
-- Tasks with deleted_at IS NOT NULL are considered soft-deleted.
-- Hard delete permanently removes from DB; only allowed on soft-deleted tasks.

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Index for efficient filtering of non-deleted tasks
CREATE INDEX IF NOT EXISTS idx_tasks_deleted_at ON tasks (deleted_at);

-- Composite index for common query: user's non-deleted tasks
CREATE INDEX IF NOT EXISTS idx_tasks_user_deleted ON tasks (user_id, deleted_at);
