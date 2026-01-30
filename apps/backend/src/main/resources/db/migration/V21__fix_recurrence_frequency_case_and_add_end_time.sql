-- V21: Fix recurrence frequency constraint to accept uppercase enum values and add scheduled_end_time

-- 1. Drop the existing lowercase constraint
ALTER TABLE task_recurrences DROP CONSTRAINT IF EXISTS chk_recurrence_frequency;

-- 2. Add new constraint that accepts uppercase values (matching Java enum)
ALTER TABLE task_recurrences ADD CONSTRAINT chk_recurrence_frequency 
    CHECK (frequency IN ('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'YEARLY'));

-- 3. Add scheduled_end_time column for time ranges (e.g., 8:30 to 9:30)
ALTER TABLE task_recurrences ADD COLUMN IF NOT EXISTS scheduled_end_time TIME;
