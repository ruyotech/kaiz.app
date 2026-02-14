-- V51: Create draft_feedback_records table for tracking user feedback on AI drafts
-- Used by the feedback loop to learn user preferences

CREATE TABLE IF NOT EXISTS draft_feedback_records (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_id            UUID NOT NULL REFERENCES command_center_drafts(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id          UUID REFERENCES conversation_sessions(id) ON DELETE SET NULL,
    action              VARCHAR(20) NOT NULL
                        CHECK (action IN ('APPROVED', 'MODIFIED', 'REJECTED')),
    original_draft_json JSONB,
    modified_draft_json JSONB,
    user_comment        TEXT,
    time_to_decide_ms   BIGINT,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by          VARCHAR(36),
    updated_by          VARCHAR(36)
);

-- Indexes for feedback analysis
CREATE INDEX IF NOT EXISTS idx_draft_feedback_user
    ON draft_feedback_records(user_id, action);

CREATE INDEX IF NOT EXISTS idx_draft_feedback_created
    ON draft_feedback_records(created_at);
