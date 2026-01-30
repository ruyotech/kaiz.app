-- V23: Add missing audit columns to task_comment_attachments
-- BaseEntity expects created_by and updated_by columns

ALTER TABLE task_comment_attachments
ADD COLUMN created_by VARCHAR(36),
ADD COLUMN updated_by VARCHAR(36);
