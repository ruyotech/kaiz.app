-- ============================================================================
-- V16: Fix creator_type case sensitivity
-- JPA EnumType.STRING expects uppercase enum values (SYSTEM, USER)
-- but V15 inserted lowercase values (system, user)
-- Also need to update CHECK constraints to accept uppercase
-- ============================================================================

-- Step 1: Drop old CHECK constraints that enforce lowercase
ALTER TABLE task_templates DROP CONSTRAINT IF EXISTS chk_creator_type;
ALTER TABLE task_templates DROP CONSTRAINT IF EXISTS chk_template_type;
ALTER TABLE task_templates DROP CONSTRAINT IF EXISTS chk_suggested_sprint;
ALTER TABLE task_templates DROP CONSTRAINT IF EXISTS chk_recurrence_frequency;

-- Step 2: Update data to uppercase
UPDATE task_templates SET creator_type = 'SYSTEM' WHERE creator_type = 'system';
UPDATE task_templates SET creator_type = 'USER' WHERE creator_type = 'user';
UPDATE task_templates SET type = 'TASK' WHERE type = 'task';
UPDATE task_templates SET type = 'EVENT' WHERE type = 'event';
UPDATE task_templates SET recurrence_frequency = 'DAILY' WHERE recurrence_frequency = 'daily';
UPDATE task_templates SET recurrence_frequency = 'WEEKLY' WHERE recurrence_frequency = 'weekly';
UPDATE task_templates SET recurrence_frequency = 'BIWEEKLY' WHERE recurrence_frequency = 'biweekly';
UPDATE task_templates SET recurrence_frequency = 'MONTHLY' WHERE recurrence_frequency = 'monthly';
UPDATE task_templates SET recurrence_frequency = 'YEARLY' WHERE recurrence_frequency = 'yearly';
UPDATE task_templates SET suggested_sprint = 'CURRENT' WHERE suggested_sprint = 'current';
UPDATE task_templates SET suggested_sprint = 'NEXT' WHERE suggested_sprint = 'next';
UPDATE task_templates SET suggested_sprint = 'BACKLOG' WHERE suggested_sprint = 'backlog';

-- Step 3: Add new CHECK constraints with uppercase values
ALTER TABLE task_templates
    ADD CONSTRAINT chk_creator_type CHECK (creator_type IN ('SYSTEM', 'USER')),
    ADD CONSTRAINT chk_template_type CHECK (type IN ('TASK', 'EVENT')),
    ADD CONSTRAINT chk_suggested_sprint CHECK (suggested_sprint IN ('CURRENT', 'NEXT', 'BACKLOG')),
    ADD CONSTRAINT chk_recurrence_frequency CHECK (
        recurrence_frequency IS NULL OR
        recurrence_frequency IN ('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'YEARLY')
    );
