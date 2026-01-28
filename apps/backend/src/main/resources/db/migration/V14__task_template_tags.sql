-- ============================================================================
-- V14: Task Template Tags & Fix Missing Audit Columns
-- Replaces JSONB tags column with a proper many-to-many relationship
-- Adds missing created_by and updated_by columns to favorites/ratings
-- ============================================================================

-- Add missing audit columns to template_favorites
ALTER TABLE template_favorites 
    ADD COLUMN created_by VARCHAR(36),
    ADD COLUMN updated_by VARCHAR(36);

-- Add missing audit columns to template_ratings
ALTER TABLE template_ratings 
    ADD COLUMN created_by VARCHAR(36),
    ADD COLUMN updated_by VARCHAR(36);

-- Create task_template_tags table for ElementCollection
CREATE TABLE task_template_tags (
    template_id UUID NOT NULL REFERENCES task_templates(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    PRIMARY KEY (template_id, tag)
);

-- Create index for tag searches
CREATE INDEX idx_task_template_tags_tag ON task_template_tags(tag);
CREATE INDEX idx_task_template_tags_template ON task_template_tags(template_id);

-- Migrate existing tags from JSONB to the new table
INSERT INTO task_template_tags (template_id, tag)
SELECT 
    id as template_id,
    jsonb_array_elements_text(COALESCE(tags, '[]'::jsonb)) as tag
FROM task_templates
WHERE tags IS NOT NULL AND tags != '[]'::jsonb;

-- We keep the old tags column for now (in case we need rollback)
-- It can be dropped in a future migration after confirming everything works
-- ALTER TABLE task_templates DROP COLUMN tags;
