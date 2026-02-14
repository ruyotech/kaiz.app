-- V49: Create conversation_sessions table for persistent chat sessions
-- Replaces the in-memory ConversationSessionStore with PostgreSQL persistence

CREATE TABLE IF NOT EXISTS conversation_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mode            VARCHAR(30) NOT NULL
                    CHECK (mode IN ('FREEFORM', 'CAPTURE', 'PLANNING', 'STANDUP', 'RETROSPECTIVE', 'REVIEW', 'REFINEMENT')),
    sprint_id       VARCHAR(50),
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE', 'CLOSED', 'EXPIRED')),
    message_count   INTEGER NOT NULL DEFAULT 0,
    started_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ended_at        TIMESTAMP WITH TIME ZONE,
    last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ceremony_id     UUID,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(36),
    updated_by      VARCHAR(36)
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_conv_sessions_user_status
    ON conversation_sessions(user_id, status);

CREATE INDEX IF NOT EXISTS idx_conv_sessions_user_mode_status
    ON conversation_sessions(user_id, mode, status);

CREATE INDEX IF NOT EXISTS idx_conv_sessions_last_message
    ON conversation_sessions(last_message_at);
