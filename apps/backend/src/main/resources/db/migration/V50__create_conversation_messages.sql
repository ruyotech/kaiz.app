-- V50: Create conversation_messages table for chat message history
-- Each message belongs to a conversation_session

CREATE TABLE IF NOT EXISTS conversation_messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID NOT NULL REFERENCES conversation_sessions(id) ON DELETE CASCADE,
    role            VARCHAR(20) NOT NULL
                    CHECK (role IN ('USER', 'ASSISTANT', 'SYSTEM')),
    content         TEXT NOT NULL,
    drafts_json     JSONB,
    intent          VARCHAR(50),
    tokens_used     INTEGER,
    latency_ms      BIGINT,
    sequence_number INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(36),
    updated_by      VARCHAR(36)
);

-- Index for fetching messages by session in order
CREATE INDEX IF NOT EXISTS idx_conv_messages_session_seq
    ON conversation_messages(session_id, sequence_number);
