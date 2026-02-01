-- ============================================================================
-- V17: Add missing community_activities and activity_celebrates tables
-- ============================================================================

-- CommunityActivity entity table
CREATE TABLE IF NOT EXISTS community_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(500),
    metadata TEXT,
    celebrate_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36)
);

CREATE INDEX IF NOT EXISTS idx_community_activities_member ON community_activities(member_id);
CREATE INDEX IF NOT EXISTS idx_community_activities_type ON community_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_community_activities_created ON community_activities(created_at DESC);

-- Collection table for celebrated by members
CREATE TABLE IF NOT EXISTS activity_celebrates (
    activity_id UUID NOT NULL REFERENCES community_activities(id) ON DELETE CASCADE,
    member_id UUID NOT NULL,
    PRIMARY KEY (activity_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_activity_celebrates_activity ON activity_celebrates(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_celebrates_member ON activity_celebrates(member_id);
