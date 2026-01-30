-- V18: Fix user_template_tags table - Add missing audit columns
-- The table was created without created_by and updated_by columns
-- which are required by the BaseEntity class

ALTER TABLE user_template_tags
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(36),
    ADD COLUMN IF NOT EXISTS updated_by VARCHAR(36);

COMMENT ON COLUMN user_template_tags.created_by IS 'UUID of the user who created this tag entry';
COMMENT ON COLUMN user_template_tags.updated_by IS 'UUID of the user who last updated this tag entry';
