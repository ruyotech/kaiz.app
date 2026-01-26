-- ============================================================================
-- V10: Command Center Module (AI Input Processing)
-- ============================================================================

-- Command Center Drafts
CREATE TABLE command_center_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    draft_type VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_APPROVAL',
    draft_content JSONB NOT NULL,
    confidence_score DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    ai_reasoning TEXT,
    original_input_text TEXT,
    voice_transcription TEXT,
    attachment_count INTEGER DEFAULT 0,
    processed_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_entity_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    CONSTRAINT valid_draft_type CHECK (draft_type IN ('TASK', 'EPIC', 'CHALLENGE', 'EVENT', 'BILL', 'NOTE', 'CLARIFICATION_NEEDED')),
    CONSTRAINT valid_status CHECK (status IN ('PENDING_APPROVAL', 'APPROVED', 'MODIFIED', 'REJECTED', 'EXPIRED')),
    CONSTRAINT valid_confidence CHECK (confidence_score >= 0 AND confidence_score <= 1)
);

CREATE INDEX idx_drafts_user_status ON command_center_drafts(user_id, status);
CREATE INDEX idx_drafts_user_created ON command_center_drafts(user_id, created_at DESC);
CREATE INDEX idx_drafts_expires ON command_center_drafts(expires_at) WHERE status = 'PENDING_APPROVAL';
CREATE INDEX idx_drafts_type ON command_center_drafts(draft_type);
CREATE INDEX idx_drafts_content ON command_center_drafts USING gin(draft_content);
