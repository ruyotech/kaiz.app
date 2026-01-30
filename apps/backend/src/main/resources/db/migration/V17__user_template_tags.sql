-- V17: User Template Tags
-- Creates a table for user-specific tags on templates
-- These are personal tags that users can add to any template (including global ones)
-- without modifying the template itself

CREATE TABLE IF NOT EXISTS user_template_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES task_templates(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_template_tag UNIQUE (user_id, template_id, tag)
);

-- Index for fast lookups by user and template
CREATE INDEX IF NOT EXISTS idx_user_template_tags_user_template 
    ON user_template_tags(user_id, template_id);

-- Index for finding all templates with user tags
CREATE INDEX IF NOT EXISTS idx_user_template_tags_user 
    ON user_template_tags(user_id);

COMMENT ON TABLE user_template_tags IS 'User-specific tags for templates. Each user can add their own personal tags to organize templates.';
COMMENT ON COLUMN user_template_tags.tag IS 'The tag text, normalized to lowercase';
