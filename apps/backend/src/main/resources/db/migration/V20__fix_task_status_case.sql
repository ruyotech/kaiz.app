-- ============================================================================
-- V20: Fix Task Status constraint to use uppercase enum values
-- ============================================================================

-- Drop and recreate constraint with uppercase values matching Java enum
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS chk_task_status;
ALTER TABLE tasks ADD CONSTRAINT chk_task_status 
    CHECK (status IN ('DRAFT', 'BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE'));

-- Update any existing lowercase status values to uppercase
UPDATE tasks SET status = UPPER(status) WHERE status != UPPER(status);
