-- ============================================================================
-- V7: Mindset Module
-- Motivational Content, Themes
-- ============================================================================

-- ============================================================================
-- MINDSET THEMES
-- ============================================================================
CREATE TABLE mindset_themes (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    background_color VARCHAR(20),
    text_color VARCHAR(20),
    accent_color VARCHAR(20),
    default_asset VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36)
);

-- ============================================================================
-- THEME GRADIENT COLORS
-- ============================================================================
CREATE TABLE mindset_theme_gradient_colors (
    mindset_theme_id UUID NOT NULL REFERENCES mindset_themes(id) ON DELETE CASCADE,
    color VARCHAR(20) NOT NULL,
    sort_order INTEGER NOT NULL,
    PRIMARY KEY (mindset_theme_id, sort_order)
);

-- ============================================================================
-- MINDSET CONTENTS
-- ============================================================================
CREATE TABLE mindset_contents (
    id UUID PRIMARY KEY,
    body TEXT NOT NULL,
    author VARCHAR(200),
    life_wheel_area_id VARCHAR(10) REFERENCES life_wheel_areas(id),
    dimension_tag VARCHAR(50),
    theme_preset VARCHAR(50),
    intervention_weight INTEGER DEFAULT 50,
    emotional_tone VARCHAR(20) DEFAULT 'MOTIVATIONAL',
    dwell_time_ms INTEGER DEFAULT 4000,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36)
);

CREATE INDEX idx_mindset_contents_dimension_tag ON mindset_contents(dimension_tag);
CREATE INDEX idx_mindset_contents_emotional_tone ON mindset_contents(emotional_tone);

-- ============================================================================
-- CONTENT TAGS
-- ============================================================================
CREATE TABLE mindset_content_tags (
    mindset_content_id UUID NOT NULL REFERENCES mindset_contents(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL
);

-- ============================================================================
-- SEED THEMES
-- ============================================================================
INSERT INTO mindset_themes (id, name, background_color, text_color, accent_color, default_asset) VALUES
('11111111-1111-1111-1111-111111111101'::UUID, 'dark', '#0a0a0a', '#ffffff', '#8B5CF6', 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800'),
('11111111-1111-1111-1111-111111111102'::UUID, 'nature', '#1a2f1a', '#e8f5e9', '#66BB6A', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800'),
('11111111-1111-1111-1111-111111111103'::UUID, 'cyberpunk', '#0d001a', '#00ffff', '#ff00ff', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800'),
('11111111-1111-1111-1111-111111111104'::UUID, 'minimalist', '#fafafa', '#1a1a1a', '#6366F1', 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=800'),
('11111111-1111-1111-1111-111111111105'::UUID, 'gradient-blue', '#0f172a', '#e2e8f0', '#38bdf8', 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800'),
('11111111-1111-1111-1111-111111111106'::UUID, 'gradient-purple', '#1e1b4b', '#e9d5ff', '#a855f7', 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800'),
('11111111-1111-1111-1111-111111111107'::UUID, 'gradient-sunset', '#1c1917', '#fef3c7', '#f97316', 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800');

-- ============================================================================
-- SEED THEME GRADIENTS
-- ============================================================================
INSERT INTO mindset_theme_gradient_colors (mindset_theme_id, color, sort_order) VALUES
('11111111-1111-1111-1111-111111111101'::UUID, '#1a1a2e', 0),
('11111111-1111-1111-1111-111111111101'::UUID, '#16213e', 1),
('11111111-1111-1111-1111-111111111105'::UUID, '#0f172a', 0),
('11111111-1111-1111-1111-111111111105'::UUID, '#1e3a5f', 1),
('11111111-1111-1111-1111-111111111106'::UUID, '#1e1b4b', 0),
('11111111-1111-1111-1111-111111111106'::UUID, '#312e81', 1);

-- ============================================================================
-- SEED CONTENT
-- ============================================================================
INSERT INTO mindset_contents (id, body, author, dimension_tag, theme_preset, intervention_weight, emotional_tone, dwell_time_ms) VALUES
('22222222-2222-2222-2222-222222222201'::UUID, 'The only way to do great work is to love what you do.', 'Steve Jobs', 'lw-2', 'dark', 85, 'MOTIVATIONAL', 5000),
('22222222-2222-2222-2222-222222222202'::UUID, 'Success is not final, failure is not fatal: it is the courage to continue that counts.', 'Winston Churchill', 'lw-4', 'gradient-purple', 90, 'MOTIVATIONAL', 6000),
('22222222-2222-2222-2222-222222222203'::UUID, 'Your body hears everything your mind says. Stay positive.', NULL, 'lw-1', 'nature', 75, 'CALMING', 4000),
('22222222-2222-2222-2222-222222222204'::UUID, 'The best time to plant a tree was 20 years ago. The second best time is now.', 'Chinese Proverb', 'q2_growth', 'minimalist', 88, 'ACTIONABLE', 5000),
('22222222-2222-2222-2222-222222222205'::UUID, 'What would you do if you weren''t afraid?', 'Sheryl Sandberg', 'generic', 'gradient-blue', 70, 'REFLECTIVE', 7000);
