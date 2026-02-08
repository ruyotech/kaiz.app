-- ============================================================================
-- V31: Replace is_event boolean with task_type enum, add alert_before
-- ============================================================================

-- 1. Add task_type column with CHECK constraint
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_type VARCHAR(20) DEFAULT 'TASK' NOT NULL
  CHECK (task_type IN ('TASK', 'EVENT', 'BIRTHDAY'));

-- 2. Migrate existing data: is_event=true → EVENT, else TASK
UPDATE tasks SET task_type = 'EVENT' WHERE is_event = true;

-- 3. Drop the old is_event column
ALTER TABLE tasks DROP COLUMN IF EXISTS is_event;

-- 4. Add alert_before column with CHECK constraint
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS alert_before VARCHAR(20) DEFAULT 'NONE' NOT NULL
  CHECK (alert_before IN (
    'NONE', 'AT_TIME', 'MINUTES_5', 'MINUTES_10', 'MINUTES_15', 'MINUTES_30',
    'HOURS_1', 'HOURS_2', 'DAYS_1', 'DAYS_2', 'WEEKS_1'
  ));

-- 5. Add index on task_type for filtering queries
CREATE INDEX IF NOT EXISTS idx_tasks_task_type ON tasks(task_type);

-- 6. Add index on alert_before for notification scheduling queries
CREATE INDEX IF NOT EXISTS idx_tasks_alert_before ON tasks(alert_before)
  WHERE alert_before != 'NONE';
