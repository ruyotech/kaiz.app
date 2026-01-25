-- V6: Add missing audit columns to task_comments table
-- These columns are required by BaseEntity for JPA auditing

ALTER TABLE task_comments 
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(36),
    ADD COLUMN IF NOT EXISTS updated_by VARCHAR(36);

-- Create indexes for audit columns
CREATE INDEX IF NOT EXISTS idx_task_comments_created_by ON task_comments(created_by);
CREATE INDEX IF NOT EXISTS idx_task_comments_updated_by ON task_comments(updated_by);
