-- ============================================================================
-- V14: Create Command Center AI Drafts Table
-- ============================================================================
-- This migration creates the table to store AI-generated drafts pending user approval.
-- Uses JSONB for flexible draft content storage.
-- ============================================================================

-- Command Center Drafts table
CREATE TABLE command_center_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Draft metadata
    draft_type VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_APPROVAL',

    -- Draft content (polymorphic JSON)
    draft_content JSONB NOT NULL,

    -- AI processing info
    confidence_score DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    ai_reasoning TEXT,

    -- Original input
    original_input_text TEXT,
    voice_transcription TEXT,
    attachment_count INTEGER DEFAULT 0,

    -- Timestamps
    processed_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,

    -- Created entity reference
    created_entity_id VARCHAR(255),

    -- Audit columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0,

    -- Constraints
    CONSTRAINT valid_draft_type CHECK (draft_type IN ('TASK', 'EPIC', 'CHALLENGE', 'EVENT', 'BILL', 'NOTE', 'CLARIFICATION_NEEDED')),
    CONSTRAINT valid_status CHECK (status IN ('PENDING_APPROVAL', 'APPROVED', 'MODIFIED', 'REJECTED', 'EXPIRED')),
    CONSTRAINT valid_confidence CHECK (confidence_score >= 0 AND confidence_score <= 1)
);

-- Indexes for efficient queries
CREATE INDEX idx_drafts_user_status ON command_center_drafts(user_id, status);
CREATE INDEX idx_drafts_user_created ON command_center_drafts(user_id, created_at DESC);
CREATE INDEX idx_drafts_expires ON command_center_drafts(expires_at) WHERE status = 'PENDING_APPROVAL';
CREATE INDEX idx_drafts_type ON command_center_drafts(draft_type);

-- GIN index for JSONB content search (optional, for future features)
CREATE INDEX idx_drafts_content ON command_center_drafts USING gin(draft_content);

-- Comment on table
COMMENT ON TABLE command_center_drafts IS 'Stores AI-generated drafts from Command Center pending user approval';
COMMENT ON COLUMN command_center_drafts.draft_content IS 'Polymorphic JSONB storing TaskDraft, EpicDraft, ChallengeDraft, etc.';
COMMENT ON COLUMN command_center_drafts.confidence_score IS 'AI confidence in the interpretation, 0.0 to 1.0';
