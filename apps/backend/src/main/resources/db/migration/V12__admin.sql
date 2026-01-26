-- ============================================================================
-- V12: Admin Module (Content Management)
-- ============================================================================

-- Site Content
CREATE TABLE site_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_key VARCHAR(255) NOT NULL UNIQUE,
    content_type VARCHAR(50) NOT NULL DEFAULT 'TEXT',
    content TEXT,
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT chk_content_type CHECK (content_type IN ('TEXT', 'HTML', 'JSON', 'MARKDOWN'))
);

CREATE INDEX idx_site_content_key ON site_content(content_key);

-- About Features
CREATE TABLE about_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(500),
    description TEXT,
    bullet_points JSONB DEFAULT '[]',
    example JSONB,
    icon VARCHAR(100),
    color VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX idx_about_features_slug ON about_features(slug);

-- Testimonials
CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    company VARCHAR(255),
    avatar_url VARCHAR(500),
    quote TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    metrics JSONB DEFAULT '{}',
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT chk_rating CHECK (rating >= 1 AND rating <= 5)
);

-- FAQs
CREATE TABLE faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Pricing Tiers
CREATE TABLE pricing_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    billing_period VARCHAR(50) NOT NULL DEFAULT 'month',
    description TEXT,
    features JSONB DEFAULT '[]',
    cta_text VARCHAR(100) DEFAULT 'Get Started',
    cta_link VARCHAR(500) DEFAULT '/signup',
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT chk_billing_period CHECK (billing_period IN ('month', 'year', 'lifetime', 'free'))
);

-- Marketing Campaigns
CREATE TABLE marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    target_audience JSONB DEFAULT '{}',
    metrics JSONB DEFAULT '{}',
    content JSONB DEFAULT '{}',
    budget DECIMAL(12, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT chk_campaign_status CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'))
);

-- Viral Hooks
CREATE TABLE viral_hooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    media_url VARCHAR(500),
    target_platform VARCHAR(100),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'draft',
    metrics JSONB DEFAULT '{}',
    tags JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT chk_hook_status CHECK (status IN ('draft', 'scheduled', 'published', 'archived'))
);

-- Scheduled Communications
CREATE TABLE scheduled_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    subject VARCHAR(500),
    content TEXT NOT NULL,
    recipient_filter JSONB DEFAULT '{}',
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'scheduled',
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT chk_comm_status CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled'))
);

-- Admin Activity Log
CREATE TABLE admin_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255),
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_activity_admin_id ON admin_activity_log(admin_id);
CREATE INDEX idx_admin_activity_created_at ON admin_activity_log(created_at);
