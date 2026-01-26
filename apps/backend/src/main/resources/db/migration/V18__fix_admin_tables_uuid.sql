-- =====================================================
-- V18: Fix Admin Content Tables - Convert ID columns from BIGSERIAL to UUID
-- The JPA entities use UUID for id, but V16 created tables with BIGSERIAL
-- =====================================================

-- Helper: Enable uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- Fix about_features table
-- =====================================================
-- Drop the old primary key constraint
ALTER TABLE about_features DROP CONSTRAINT IF EXISTS about_features_pkey;

-- Add new UUID column
ALTER TABLE about_features ADD COLUMN new_id UUID DEFAULT gen_random_uuid();

-- Update existing rows with UUIDs (if any)
UPDATE about_features SET new_id = gen_random_uuid() WHERE new_id IS NULL;

-- Drop old id column and rename new one
ALTER TABLE about_features DROP COLUMN id;
ALTER TABLE about_features RENAME COLUMN new_id TO id;
ALTER TABLE about_features ALTER COLUMN id SET NOT NULL;
ALTER TABLE about_features ADD PRIMARY KEY (id);

-- =====================================================
-- Fix testimonials table
-- =====================================================
ALTER TABLE testimonials DROP CONSTRAINT IF EXISTS testimonials_pkey;
ALTER TABLE testimonials ADD COLUMN new_id UUID DEFAULT gen_random_uuid();
UPDATE testimonials SET new_id = gen_random_uuid() WHERE new_id IS NULL;
ALTER TABLE testimonials DROP COLUMN id;
ALTER TABLE testimonials RENAME COLUMN new_id TO id;
ALTER TABLE testimonials ALTER COLUMN id SET NOT NULL;
ALTER TABLE testimonials ADD PRIMARY KEY (id);

-- =====================================================
-- Fix faqs table
-- =====================================================
ALTER TABLE faqs DROP CONSTRAINT IF EXISTS faqs_pkey;
ALTER TABLE faqs ADD COLUMN new_id UUID DEFAULT gen_random_uuid();
UPDATE faqs SET new_id = gen_random_uuid() WHERE new_id IS NULL;
ALTER TABLE faqs DROP COLUMN id;
ALTER TABLE faqs RENAME COLUMN new_id TO id;
ALTER TABLE faqs ALTER COLUMN id SET NOT NULL;
ALTER TABLE faqs ADD PRIMARY KEY (id);

-- =====================================================
-- Fix pricing_tiers table
-- =====================================================
ALTER TABLE pricing_tiers DROP CONSTRAINT IF EXISTS pricing_tiers_pkey;
ALTER TABLE pricing_tiers ADD COLUMN new_id UUID DEFAULT gen_random_uuid();
UPDATE pricing_tiers SET new_id = gen_random_uuid() WHERE new_id IS NULL;
ALTER TABLE pricing_tiers DROP COLUMN id;
ALTER TABLE pricing_tiers RENAME COLUMN new_id TO id;
ALTER TABLE pricing_tiers ALTER COLUMN id SET NOT NULL;
ALTER TABLE pricing_tiers ADD PRIMARY KEY (id);

-- =====================================================
-- Fix site_content table
-- =====================================================
ALTER TABLE site_content DROP CONSTRAINT IF EXISTS site_content_pkey;
ALTER TABLE site_content ADD COLUMN new_id UUID DEFAULT gen_random_uuid();
UPDATE site_content SET new_id = gen_random_uuid() WHERE new_id IS NULL;
ALTER TABLE site_content DROP COLUMN id;
ALTER TABLE site_content RENAME COLUMN new_id TO id;
ALTER TABLE site_content ALTER COLUMN id SET NOT NULL;
ALTER TABLE site_content ADD PRIMARY KEY (id);

-- =====================================================
-- Fix scheduled_communications table (admin_communications in entity)
-- =====================================================
ALTER TABLE scheduled_communications DROP CONSTRAINT IF EXISTS scheduled_communications_pkey;
ALTER TABLE scheduled_communications ADD COLUMN new_id UUID DEFAULT gen_random_uuid();
UPDATE scheduled_communications SET new_id = gen_random_uuid() WHERE new_id IS NULL;
ALTER TABLE scheduled_communications DROP COLUMN id;
ALTER TABLE scheduled_communications RENAME COLUMN new_id TO id;
ALTER TABLE scheduled_communications ALTER COLUMN id SET NOT NULL;
ALTER TABLE scheduled_communications ADD PRIMARY KEY (id);

-- =====================================================
-- Fix marketing_campaigns table
-- =====================================================
ALTER TABLE marketing_campaigns DROP CONSTRAINT IF EXISTS marketing_campaigns_pkey;
ALTER TABLE marketing_campaigns ADD COLUMN new_id UUID DEFAULT gen_random_uuid();
UPDATE marketing_campaigns SET new_id = gen_random_uuid() WHERE new_id IS NULL;
ALTER TABLE marketing_campaigns DROP COLUMN id;
ALTER TABLE marketing_campaigns RENAME COLUMN new_id TO id;
ALTER TABLE marketing_campaigns ALTER COLUMN id SET NOT NULL;
ALTER TABLE marketing_campaigns ADD PRIMARY KEY (id);

-- =====================================================
-- Fix viral_hooks table
-- =====================================================
ALTER TABLE viral_hooks DROP CONSTRAINT IF EXISTS viral_hooks_pkey;
ALTER TABLE viral_hooks ADD COLUMN new_id UUID DEFAULT gen_random_uuid();
UPDATE viral_hooks SET new_id = gen_random_uuid() WHERE new_id IS NULL;
ALTER TABLE viral_hooks DROP COLUMN id;
ALTER TABLE viral_hooks RENAME COLUMN new_id TO id;
ALTER TABLE viral_hooks ALTER COLUMN id SET NOT NULL;
ALTER TABLE viral_hooks ADD PRIMARY KEY (id);

-- =====================================================
-- Fix admin_activity_log table
-- =====================================================
ALTER TABLE admin_activity_log DROP CONSTRAINT IF EXISTS admin_activity_log_pkey;
ALTER TABLE admin_activity_log ADD COLUMN new_id UUID DEFAULT gen_random_uuid();
UPDATE admin_activity_log SET new_id = gen_random_uuid() WHERE new_id IS NULL;
ALTER TABLE admin_activity_log DROP COLUMN id;
ALTER TABLE admin_activity_log RENAME COLUMN new_id TO id;
ALTER TABLE admin_activity_log ALTER COLUMN id SET NOT NULL;
ALTER TABLE admin_activity_log ADD PRIMARY KEY (id);
