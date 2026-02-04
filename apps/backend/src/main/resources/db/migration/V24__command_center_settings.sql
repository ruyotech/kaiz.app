-- ============================================================================
-- V24: Command Center Admin Settings
-- LLM Configuration, System Prompts, Test Attachments for Development
-- ============================================================================

-- ============================================================================
-- COMMAND CENTER SETTINGS
-- Stores LLM provider configuration and system settings
-- ============================================================================
CREATE TABLE command_center_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type VARCHAR(50) NOT NULL DEFAULT 'TEXT',
    description TEXT,
    is_secret BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT chk_setting_type CHECK (setting_type IN ('TEXT', 'JSON', 'SECRET', 'NUMBER', 'BOOLEAN'))
);

CREATE INDEX idx_cc_settings_key ON command_center_settings(setting_key);
CREATE INDEX idx_cc_settings_active ON command_center_settings(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- LLM PROVIDERS
-- Configurable AI model providers (Anthropic, OpenAI, etc.)
-- ============================================================================
CREATE TABLE llm_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    provider_type VARCHAR(50) NOT NULL,
    api_base_url VARCHAR(500),
    api_key_reference VARCHAR(255),  -- Reference to secret manager or encrypted value
    default_model VARCHAR(100),
    available_models JSONB DEFAULT '[]',
    rate_limit_rpm INTEGER,  -- Requests per minute
    rate_limit_tpm INTEGER,  -- Tokens per minute
    max_tokens INTEGER DEFAULT 4096,
    temperature DOUBLE PRECISION DEFAULT 0.7,
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT chk_provider_type CHECK (provider_type IN ('ANTHROPIC', 'OPENAI', 'GOOGLE', 'AZURE_OPENAI', 'CUSTOM'))
);

CREATE INDEX idx_llm_providers_active ON llm_providers(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_llm_providers_default ON llm_providers(is_default) WHERE is_default = TRUE;

-- ============================================================================
-- SYSTEM PROMPTS
-- Configurable AI prompts for different app features
-- ============================================================================
CREATE TABLE system_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_key VARCHAR(100) NOT NULL UNIQUE,
    prompt_name VARCHAR(255) NOT NULL,
    prompt_category VARCHAR(100) NOT NULL,
    prompt_content TEXT NOT NULL,
    variables JSONB DEFAULT '[]',  -- List of variables that can be injected
    description TEXT,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT chk_prompt_category CHECK (prompt_category IN (
        'COMMAND_CENTER',
        'SMART_INPUT', 
        'DRAFT_GENERATION',
        'CLARIFICATION',
        'IMAGE_ANALYSIS',
        'VOICE_TRANSCRIPTION',
        'TASK_SUGGESTION',
        'CHALLENGE_SUGGESTION',
        'SENSAI_CHAT',
        'CUSTOM'
    ))
);

CREATE INDEX idx_system_prompts_key ON system_prompts(prompt_key);
CREATE INDEX idx_system_prompts_category ON system_prompts(prompt_category);

-- ============================================================================
-- PROMPT VERSIONS (History)
-- Track changes to prompts for rollback capability
-- ============================================================================
CREATE TABLE prompt_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id UUID NOT NULL REFERENCES system_prompts(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    prompt_content TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    change_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    CONSTRAINT uq_prompt_version UNIQUE (prompt_id, version_number)
);

CREATE INDEX idx_prompt_versions_prompt ON prompt_versions(prompt_id);

-- ============================================================================
-- TEST ATTACHMENTS
-- Pre-uploaded attachments for simulator testing (no camera/mic access)
-- ============================================================================
CREATE TABLE test_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attachment_name VARCHAR(255) NOT NULL,
    attachment_type VARCHAR(50) NOT NULL,
    file_url VARCHAR(1000),
    file_data BYTEA,  -- For small files stored in DB
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT,
    description TEXT,
    use_case VARCHAR(255),  -- e.g., "calendar_screenshot", "receipt", "voice_memo"
    expected_output JSONB,  -- Expected AI output for validation
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT chk_attachment_type CHECK (attachment_type IN ('IMAGE', 'PDF', 'AUDIO', 'VIDEO', 'DOCUMENT'))
);

CREATE INDEX idx_test_attachments_type ON test_attachments(attachment_type);
CREATE INDEX idx_test_attachments_use_case ON test_attachments(use_case);
CREATE INDEX idx_test_attachments_active ON test_attachments(is_active, display_order);

-- ============================================================================
-- COMMAND CENTER ANALYTICS
-- Track AI usage, costs, and performance
-- ============================================================================
CREATE TABLE command_center_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    provider_id UUID REFERENCES llm_providers(id) ON DELETE SET NULL,
    model_used VARCHAR(100),
    input_tokens INTEGER,
    output_tokens INTEGER,
    total_tokens INTEGER,
    estimated_cost_cents INTEGER,
    processing_time_ms INTEGER,
    request_type VARCHAR(50),
    was_successful BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_request_type CHECK (request_type IN (
        'SMART_INPUT',
        'IMAGE_ANALYSIS',
        'VOICE_TRANSCRIPTION',
        'DRAFT_GENERATION',
        'CLARIFICATION',
        'SENSAI_CHAT'
    ))
);

CREATE INDEX idx_cc_analytics_user ON command_center_analytics(user_id);
CREATE INDEX idx_cc_analytics_provider ON command_center_analytics(provider_id);
CREATE INDEX idx_cc_analytics_date ON command_center_analytics(created_at);
CREATE INDEX idx_cc_analytics_type ON command_center_analytics(request_type);

-- ============================================================================
-- FEATURE FLAGS
-- Control Command Center features dynamically
-- ============================================================================
CREATE TABLE command_center_feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flag_key VARCHAR(100) NOT NULL UNIQUE,
    flag_name VARCHAR(255) NOT NULL,
    description TEXT,
    is_enabled BOOLEAN DEFAULT FALSE,
    rollout_percentage INTEGER DEFAULT 0,  -- For gradual rollouts (0-100)
    allowed_user_ids JSONB DEFAULT '[]',  -- Specific users for beta testing
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT chk_rollout_percentage CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100)
);

CREATE INDEX idx_cc_feature_flags_key ON command_center_feature_flags(flag_key);
CREATE INDEX idx_cc_feature_flags_enabled ON command_center_feature_flags(is_enabled) WHERE is_enabled = TRUE;

-- ============================================================================
-- SEED DEFAULT DATA
-- ============================================================================

-- Default Anthropic provider
INSERT INTO llm_providers (provider_name, display_name, provider_type, api_base_url, default_model, available_models, max_tokens, temperature, is_active, is_default)
VALUES (
    'anthropic_claude',
    'Anthropic Claude',
    'ANTHROPIC',
    'https://api.anthropic.com/v1',
    'claude-sonnet-4-20250514',
    '["claude-sonnet-4-20250514", "claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"]',
    4096,
    0.7,
    TRUE,
    TRUE
);

-- OpenAI provider (inactive by default)
INSERT INTO llm_providers (provider_name, display_name, provider_type, api_base_url, default_model, available_models, max_tokens, temperature, is_active, is_default)
VALUES (
    'openai_gpt',
    'OpenAI GPT',
    'OPENAI',
    'https://api.openai.com/v1',
    'gpt-4o',
    '["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"]',
    4096,
    0.7,
    FALSE,
    FALSE
);

-- Default feature flags
INSERT INTO command_center_feature_flags (flag_key, flag_name, description, is_enabled, rollout_percentage) VALUES
('smart_input_enabled', 'Smart Input Feature', 'Enable AI-powered smart input processing', TRUE, 100),
('image_analysis_enabled', 'Image Analysis', 'Enable AI image analysis for calendars, receipts, etc.', TRUE, 100),
('voice_input_enabled', 'Voice Input', 'Enable voice transcription and processing', TRUE, 100),
('challenge_suggestions', 'Challenge Suggestions', 'AI suggests challenges for fitness/habit goals', TRUE, 100),
('clarification_flow', 'Clarification Flow', 'Enable multi-step clarification questions', TRUE, 100),
('cost_tracking', 'Cost Tracking', 'Track AI API costs per user', TRUE, 100),
('test_mode', 'Test Mode', 'Enable test attachments for simulator testing', TRUE, 100);

-- Default settings
INSERT INTO command_center_settings (setting_key, setting_value, setting_type, description, is_secret) VALUES
('max_tokens_per_request', '4096', 'NUMBER', 'Maximum tokens per AI request', FALSE),
('max_requests_per_minute', '60', 'NUMBER', 'Rate limit for AI requests per user per minute', FALSE),
('draft_expiration_hours', '24', 'NUMBER', 'Hours until a draft expires', FALSE),
('max_clarification_questions', '5', 'NUMBER', 'Maximum clarification questions in a flow', FALSE),
('default_confidence_threshold', '0.8', 'NUMBER', 'Minimum confidence to auto-approve drafts', FALSE),
('image_max_size_mb', '10', 'NUMBER', 'Maximum image file size in MB', FALSE),
('voice_max_duration_seconds', '300', 'NUMBER', 'Maximum voice recording duration in seconds', FALSE),
('enable_cost_alerts', 'true', 'BOOLEAN', 'Send alerts when cost thresholds are exceeded', FALSE),
('monthly_cost_alert_threshold', '100', 'NUMBER', 'Monthly cost threshold in dollars for alerts', FALSE);

