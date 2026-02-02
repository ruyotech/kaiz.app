-- ============================================================================
-- V18: Add missing columns discovered from entity-database mismatch
-- ============================================================================

-- Add event_end_time to tasks table (event support)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS event_end_time TIMESTAMP WITH TIME ZONE;

-- Add celebrate_count and comment_count to community_stories
ALTER TABLE community_stories ADD COLUMN IF NOT EXISTS celebrate_count INTEGER DEFAULT 0;
ALTER TABLE community_stories ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- Create story_celebrates table (for SuccessStory.celebratedByMemberIds collection)
CREATE TABLE IF NOT EXISTS story_celebrates (
    story_id UUID NOT NULL REFERENCES community_stories(id) ON DELETE CASCADE,
    member_id UUID NOT NULL,
    PRIMARY KEY (story_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_story_celebrates_story ON story_celebrates(story_id);
CREATE INDEX IF NOT EXISTS idx_story_celebrates_member ON story_celebrates(member_id);

-- Create story_image_urls table (for SuccessStory.imageUrls collection)
CREATE TABLE IF NOT EXISTS story_image_urls (
    story_id UUID NOT NULL REFERENCES community_stories(id) ON DELETE CASCADE,
    image_url VARCHAR(500)
);

CREATE INDEX IF NOT EXISTS idx_story_image_urls_story ON story_image_urls(story_id);

-- Create story_metrics table (for SuccessStory.metrics collection)
CREATE TABLE IF NOT EXISTS story_metrics (
    story_id UUID NOT NULL REFERENCES community_stories(id) ON DELETE CASCADE,
    metric_label VARCHAR(100),
    metric_value VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_story_metrics_story ON story_metrics(story_id);
