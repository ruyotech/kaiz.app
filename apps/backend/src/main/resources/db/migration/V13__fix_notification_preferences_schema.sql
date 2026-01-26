-- V13: Fix notification schema to match entities
-- Fixes notification_preferences table and notifications table

-- =====================================================
-- 1. Fix notification_preferences table
-- =====================================================

-- Add missing columns with correct names
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS email_enabled BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS in_app_enabled BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS sound_enabled BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS vibration_enabled BOOLEAN NOT NULL DEFAULT true;

-- Rename category_preferences to category_settings (what the entity expects)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notification_preferences' 
        AND column_name = 'category_preferences'
    ) THEN
        ALTER TABLE notification_preferences RENAME COLUMN category_preferences TO category_settings;
    END IF;
END $$;

-- If category_settings doesn't exist at all, create it
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS category_settings JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Drop columns that were in migration but not in entity
ALTER TABLE notification_preferences DROP COLUMN IF EXISTS enabled;
ALTER TABLE notification_preferences DROP COLUMN IF EXISTS push_sound;
ALTER TABLE notification_preferences DROP COLUMN IF EXISTS push_vibrate;
ALTER TABLE notification_preferences DROP COLUMN IF EXISTS type_preferences;
ALTER TABLE notification_preferences DROP COLUMN IF EXISTS smart_grouping;
ALTER TABLE notification_preferences DROP COLUMN IF EXISTS daily_digest;
ALTER TABLE notification_preferences DROP COLUMN IF EXISTS daily_digest_time;
ALTER TABLE notification_preferences DROP COLUMN IF EXISTS weekly_recap;
ALTER TABLE notification_preferences DROP COLUMN IF EXISTS fcm_token;
ALTER TABLE notification_preferences DROP COLUMN IF EXISTS apns_token;

-- =====================================================
-- 2. Fix notifications table - add missing columns
-- =====================================================

-- Add sender columns
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sender_id BIGINT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sender_name VARCHAR(100);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sender_avatar VARCHAR(500);

-- Add metadata column (JSONB for flexible data)
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Rename 'content' to match entity if needed (body -> content already exists)
-- The entity uses 'content' which should already exist as the main body

-- Drop columns that exist in migration but not in entity
ALTER TABLE notifications DROP COLUMN IF EXISTS icon_color;
ALTER TABLE notifications DROP COLUMN IF EXISTS emoji;
ALTER TABLE notifications DROP COLUMN IF EXISTS image_url;
ALTER TABLE notifications DROP COLUMN IF EXISTS short_body;
ALTER TABLE notifications DROP COLUMN IF EXISTS group_key;
