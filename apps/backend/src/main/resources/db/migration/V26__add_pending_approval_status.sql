-- V26: Add PENDING_APPROVAL and BLOCKED statuses to tasks table
-- PENDING_APPROVAL: Tasks created from AI Command Center go through approval workflow
-- BLOCKED: Tasks that are blocked by dependencies or other issues

-- Drop the existing status constraint
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS chk_tasks_status;

-- Add new constraint with PENDING_APPROVAL and BLOCKED statuses
ALTER TABLE tasks ADD CONSTRAINT chk_tasks_status 
CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'BACKLOG', 'TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE'));

-- Add index for pending approval tasks (commonly queried)
CREATE INDEX IF NOT EXISTS idx_tasks_pending_approval 
ON tasks(user_id, status) 
WHERE status = 'PENDING_APPROVAL';

-- Add ai_session_id to track which AI session created the task
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS ai_session_id UUID;

COMMENT ON COLUMN tasks.ai_session_id IS 'UUID of the AI session that created this task (for Command Center tracking)';
