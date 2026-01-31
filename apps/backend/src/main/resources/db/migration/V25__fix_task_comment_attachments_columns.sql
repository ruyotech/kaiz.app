-- V25: Fix task_comment_attachments table columns
-- Consolidate all manual DB fixes into proper migration

-- Add audit columns if missing
ALTER TABLE task_comment_attachments 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE task_comment_attachments 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE task_comment_attachments 
ADD COLUMN IF NOT EXISTS created_by VARCHAR(36);

ALTER TABLE task_comment_attachments 
ADD COLUMN IF NOT EXISTS updated_by VARCHAR(36);

ALTER TABLE task_comment_attachments 
ADD COLUMN IF NOT EXISTS filename VARCHAR(255);

-- Drop legacy file_name column if exists (was NOT NULL causing issues)
ALTER TABLE task_comment_attachments 
DROP COLUMN IF EXISTS file_name;
