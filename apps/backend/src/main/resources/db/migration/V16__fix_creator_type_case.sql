-- ============================================================================
-- V16: Fix creator_type case sensitivity
-- JPA EnumType.STRING expects uppercase enum values (SYSTEM, USER)
-- but V15 inserted lowercase values (system, user)
-- ============================================================================

-- Fix creator_type values to uppercase for JPA compatibility
UPDATE task_templates SET creator_type = 'SYSTEM' WHERE creator_type = 'system';
UPDATE task_templates SET creator_type = 'USER' WHERE creator_type = 'user';

-- Also fix type column if needed
UPDATE task_templates SET type = 'TASK' WHERE type = 'task';
UPDATE task_templates SET type = 'EVENT' WHERE type = 'event';

-- Fix recurrence_frequency column if needed
UPDATE task_templates SET recurrence_frequency = 'DAILY' WHERE recurrence_frequency = 'daily';
UPDATE task_templates SET recurrence_frequency = 'WEEKLY' WHERE recurrence_frequency = 'weekly';
UPDATE task_templates SET recurrence_frequency = 'BIWEEKLY' WHERE recurrence_frequency = 'biweekly';
UPDATE task_templates SET recurrence_frequency = 'MONTHLY' WHERE recurrence_frequency = 'monthly';
UPDATE task_templates SET recurrence_frequency = 'YEARLY' WHERE recurrence_frequency = 'yearly';

-- Fix suggested_sprint column if needed
UPDATE task_templates SET suggested_sprint = 'CURRENT' WHERE suggested_sprint = 'current';
UPDATE task_templates SET suggested_sprint = 'NEXT' WHERE suggested_sprint = 'next';
UPDATE task_templates SET suggested_sprint = 'BACKLOG' WHERE suggested_sprint = 'backlog';
