-- ============================================================================
-- KAIZ: DROP ALL TABLES FOR FRESH FLYWAY MIGRATION
-- ============================================================================
-- Run this on GCP Cloud SQL when you need to reset the database
-- WARNING: This will delete ALL data!
-- 
-- How to run:
-- 1. Connect via GCP Cloud SQL Studio or psql
-- 2. Execute this script
-- ============================================================================

-- Drop all tables in the correct order (respecting FK dependencies)
-- Using CASCADE to handle any remaining constraints

-- Legacy tables (from old migrations, not in new structure)
DROP TABLE IF EXISTS story_image_urls CASCADE;
DROP TABLE IF EXISTS story_metrics CASCADE;
DROP TABLE IF EXISTS story_celebrates CASCADE;
DROP TABLE IF EXISTS community_story_comments CASCADE;
DROP TABLE IF EXISTS community_kudos CASCADE;
DROP TABLE IF EXISTS community_compliments CASCADE;
DROP TABLE IF EXISTS community_activities CASCADE;
DROP TABLE IF EXISTS activity_celebrates CASCADE;
DROP TABLE IF EXISTS leaderboard_entries CASCADE;
DROP TABLE IF EXISTS sensai_ceremonies CASCADE;
DROP TABLE IF EXISTS sensai_lifewheel_metrics CASCADE;
DROP TABLE IF EXISTS viral_hooks CASCADE;
DROP TABLE IF EXISTS scheduled_communications CASCADE;
DROP TABLE IF EXISTS admin_activity_log CASCADE;

-- Module: Family (V13)
DROP TABLE IF EXISTS family_invites CASCADE;
DROP TABLE IF EXISTS family_members CASCADE;
DROP TABLE IF EXISTS families CASCADE;

-- Module: Admin (V12)
DROP TABLE IF EXISTS admin_audit_logs CASCADE;
DROP TABLE IF EXISTS marketing_campaigns CASCADE;
DROP TABLE IF EXISTS pricing_tiers CASCADE;
DROP TABLE IF EXISTS faqs CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS about_features CASCADE;
DROP TABLE IF EXISTS site_content CASCADE;

-- Module: SensAI (V11)
DROP TABLE IF EXISTS sensai_velocity_records CASCADE;
DROP TABLE IF EXISTS sensai_interventions CASCADE;
DROP TABLE IF EXISTS sensai_standups CASCADE;
DROP TABLE IF EXISTS sensai_settings CASCADE;

-- Module: Command Center (V10)
DROP TABLE IF EXISTS command_center_drafts CASCADE;

-- Module: Community (V9)
DROP TABLE IF EXISTS community_leaderboard_entries CASCADE;
DROP TABLE IF EXISTS feature_request_comments CASCADE;
DROP TABLE IF EXISTS feature_request_upvotes CASCADE;
DROP TABLE IF EXISTS community_feature_requests CASCADE;
DROP TABLE IF EXISTS weekly_challenge_completions CASCADE;
DROP TABLE IF EXISTS weekly_challenge_participants CASCADE;
DROP TABLE IF EXISTS community_weekly_challenges CASCADE;
DROP TABLE IF EXISTS poll_votes CASCADE;
DROP TABLE IF EXISTS poll_options CASCADE;
DROP TABLE IF EXISTS community_polls CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS group_tags CASCADE;
DROP TABLE IF EXISTS community_groups CASCADE;
DROP TABLE IF EXISTS template_bookmarks CASCADE;
DROP TABLE IF EXISTS template_tags CASCADE;
DROP TABLE IF EXISTS community_templates CASCADE;
DROP TABLE IF EXISTS community_partner_requests CASCADE;
DROP TABLE IF EXISTS partner_shared_challenges CASCADE;
DROP TABLE IF EXISTS community_partners CASCADE;
DROP TABLE IF EXISTS story_likes CASCADE;
DROP TABLE IF EXISTS community_stories CASCADE;
DROP TABLE IF EXISTS answer_upvotes CASCADE;
DROP TABLE IF EXISTS community_answers CASCADE;
DROP TABLE IF EXISTS question_upvotes CASCADE;
DROP TABLE IF EXISTS question_tags CASCADE;
DROP TABLE IF EXISTS community_questions CASCADE;
DROP TABLE IF EXISTS article_bookmarks CASCADE;
DROP TABLE IF EXISTS article_likes CASCADE;
DROP TABLE IF EXISTS article_tags CASCADE;
DROP TABLE IF EXISTS community_articles CASCADE;
DROP TABLE IF EXISTS community_badges CASCADE;
DROP TABLE IF EXISTS community_member_badges CASCADE;
DROP TABLE IF EXISTS community_members CASCADE;

-- Module: Essentia (V8)
DROP TABLE IF EXISTS essentia_user_progress CASCADE;
DROP TABLE IF EXISTS essentia_cards CASCADE;
DROP TABLE IF EXISTS essentia_book_takeaways CASCADE;
DROP TABLE IF EXISTS essentia_book_tags CASCADE;
DROP TABLE IF EXISTS essentia_books CASCADE;

-- Module: Mindset (V7)
DROP TABLE IF EXISTS mindset_content_tags CASCADE;
DROP TABLE IF EXISTS mindset_contents CASCADE;
DROP TABLE IF EXISTS mindset_theme_gradient_colors CASCADE;
DROP TABLE IF EXISTS mindset_themes CASCADE;

-- Module: Notifications (V6)
DROP TABLE IF EXISTS notification_preferences CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- Module: Challenges (V5)
DROP TABLE IF EXISTS challenge_entries CASCADE;
DROP TABLE IF EXISTS challenge_participants CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS challenge_templates CASCADE;

-- Module: Tasks (V4)
DROP TABLE IF EXISTS task_history CASCADE;
DROP TABLE IF EXISTS task_comment_attachments CASCADE;
DROP TABLE IF EXISTS task_comments CASCADE;
DROP TABLE IF EXISTS task_attachments CASCADE;
DROP TABLE IF EXISTS task_recurrences CASCADE;
DROP TABLE IF EXISTS task_tags CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS user_tags CASCADE;
DROP TABLE IF EXISTS user_template_tags CASCADE;
DROP TABLE IF EXISTS template_ratings CASCADE;
DROP TABLE IF EXISTS template_favorites CASCADE;
DROP TABLE IF EXISTS task_template_tags CASCADE;
DROP TABLE IF EXISTS task_templates CASCADE;
DROP TABLE IF EXISTS epics CASCADE;
DROP TABLE IF EXISTS sprints CASCADE;

-- Module: Life Wheel (V3)
DROP TABLE IF EXISTS eisenhower_quadrants CASCADE;
DROP TABLE IF EXISTS life_wheel_areas CASCADE;

-- Module: Identity (V2)
DROP TABLE IF EXISTS email_verification_codes CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop functions (V1)
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS get_user_family_membership(UUID) CASCADE;

-- CRITICAL: Drop Flyway schema history to allow fresh migration
DROP TABLE IF EXISTS flyway_schema_history CASCADE;

-- Verify all tables are dropped
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';
