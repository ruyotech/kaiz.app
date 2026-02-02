-- V19: CRM/Leads Management System
-- Creates tables for lead tracking, sales pipeline, and conversion analytics

-- ============================================================================
-- Lead Status enum-like behavior through check constraint
-- ============================================================================

-- Lead sources
CREATE TABLE IF NOT EXISTS lead_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default lead sources
INSERT INTO lead_sources (name, description) VALUES
    ('WEBSITE', 'Organic website signup'),
    ('REFERRAL', 'Referred by existing user'),
    ('SOCIAL_MEDIA', 'Social media campaigns'),
    ('PAID_ADS', 'Paid advertising campaigns'),
    ('EMAIL_CAMPAIGN', 'Email marketing campaigns'),
    ('APP_DOWNLOAD', 'Mobile app install'),
    ('PARTNER', 'Partner referrals'),
    ('DIRECT', 'Direct contact'),
    ('OTHER', 'Other sources')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- Leads table - core CRM entity
-- ============================================================================
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Contact information
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    job_title VARCHAR(255),
    
    -- Lead classification
    status VARCHAR(50) NOT NULL DEFAULT 'NEW',
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    source VARCHAR(100),
    
    -- Lifecycle tracking
    lifecycle_stage VARCHAR(50) DEFAULT 'SUBSCRIBER',
    assigned_to UUID REFERENCES admin_users(id),
    
    -- Scoring
    lead_score INTEGER DEFAULT 0,
    
    -- Engagement data
    last_activity_at TIMESTAMP WITH TIME ZONE,
    first_contact_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Conversion tracking
    converted_at TIMESTAMP WITH TIME ZONE,
    converted_user_id UUID REFERENCES users(id),
    conversion_value DECIMAL(10, 2),
    
    -- Notes and metadata
    notes TEXT,
    tags TEXT[], -- Array of tags
    custom_fields JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT leads_status_check CHECK (status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST', 'NURTURING')),
    CONSTRAINT leads_priority_check CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    CONSTRAINT leads_lifecycle_check CHECK (lifecycle_stage IN ('SUBSCRIBER', 'LEAD', 'MARKETING_QUALIFIED', 'SALES_QUALIFIED', 'OPPORTUNITY', 'CUSTOMER', 'EVANGELIST'))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_converted ON leads(converted_at) WHERE converted_at IS NOT NULL;

-- ============================================================================
-- Lead activities - interaction history
-- ============================================================================
CREATE TABLE IF NOT EXISTS lead_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    
    -- Activity details
    activity_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Metadata
    performed_by UUID REFERENCES admin_users(id),
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT lead_activities_type_check CHECK (activity_type IN ('CALL', 'EMAIL', 'MEETING', 'NOTE', 'TASK', 'STATUS_CHANGE', 'DEMO', 'FOLLOW_UP', 'OTHER'))
);

CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_type ON lead_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_lead_activities_performed_at ON lead_activities(performed_at);

-- ============================================================================
-- Lead tasks - follow-up reminders
-- ============================================================================
CREATE TABLE IF NOT EXISTS lead_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    
    -- Task details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(50) DEFAULT 'FOLLOW_UP',
    
    -- Assignment and scheduling
    assigned_to UUID REFERENCES admin_users(id),
    due_date TIMESTAMP WITH TIME ZONE,
    
    -- Status
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID REFERENCES admin_users(id),
    
    -- Priority
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT lead_tasks_type_check CHECK (task_type IN ('CALL', 'EMAIL', 'MEETING', 'FOLLOW_UP', 'DEMO', 'OTHER')),
    CONSTRAINT lead_tasks_priority_check CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT'))
);

CREATE INDEX IF NOT EXISTS idx_lead_tasks_lead_id ON lead_tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_tasks_assigned_to ON lead_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_lead_tasks_due_date ON lead_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_lead_tasks_incomplete ON lead_tasks(is_completed, due_date) WHERE is_completed = false;

-- ============================================================================
-- Email campaigns tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    content TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'DRAFT',
    
    -- Scheduling
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Stats
    recipients_count INTEGER DEFAULT 0,
    opens_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    conversions_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT email_campaigns_status_check CHECK (status IN ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'CANCELLED'))
);

-- ============================================================================
-- Trigger to update updated_at timestamps
-- ============================================================================
CREATE OR REPLACE FUNCTION update_crm_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_leads_updated_at ON leads;
CREATE TRIGGER trigger_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_crm_updated_at();

DROP TRIGGER IF EXISTS trigger_lead_tasks_updated_at ON lead_tasks;
CREATE TRIGGER trigger_lead_tasks_updated_at
    BEFORE UPDATE ON lead_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_crm_updated_at();

DROP TRIGGER IF EXISTS trigger_email_campaigns_updated_at ON email_campaigns;
CREATE TRIGGER trigger_email_campaigns_updated_at
    BEFORE UPDATE ON email_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_crm_updated_at();

-- ============================================================================
-- Lead scoring function (optional - for future use)
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_lead_score(lead_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    lead_record RECORD;
    activity_count INTEGER;
BEGIN
    SELECT * INTO lead_record FROM leads WHERE id = lead_uuid;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Base score for having contact info
    IF lead_record.full_name IS NOT NULL THEN score := score + 10; END IF;
    IF lead_record.phone IS NOT NULL THEN score := score + 15; END IF;
    IF lead_record.company IS NOT NULL THEN score := score + 10; END IF;
    
    -- Lifecycle stage scoring
    CASE lead_record.lifecycle_stage
        WHEN 'MARKETING_QUALIFIED' THEN score := score + 20;
        WHEN 'SALES_QUALIFIED' THEN score := score + 35;
        WHEN 'OPPORTUNITY' THEN score := score + 50;
        ELSE score := score + 5;
    END CASE;
    
    -- Activity engagement scoring
    SELECT COUNT(*) INTO activity_count FROM lead_activities WHERE lead_id = lead_uuid;
    score := score + LEAST(activity_count * 5, 25);
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;
