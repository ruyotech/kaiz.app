-- V27: Fix task status constraint - drop old constraint that was missed in V26
-- The original constraint was named chk_task_status (singular), not chk_tasks_status (plural)

-- Drop the OLD constraint that doesn't include PENDING_APPROVAL
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS chk_task_status;

-- The correct constraint chk_tasks_status was already added in V26 and includes:
-- 'DRAFT', 'PENDING_APPROVAL', 'BACKLOG', 'TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE'
