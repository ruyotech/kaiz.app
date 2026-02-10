-- =============================================
-- WIPE USER DATA ONLY
-- Preserves: task_templates, task_template_tags, life_wheel_areas,
--   eisenhower_quadrants, mindset_themes, mindset_contents,
--   essentia_books, essentia_cards, essentia_book_tags,
--   challenge_templates, system_prompts, llm_providers,
--   admin_users, admin_refresh_tokens, knowledge_categories,
--   knowledge_items, lead_sources, flyway_schema_history
-- =============================================
BEGIN;

-- 1. Tasks & related
DELETE FROM task_comment_attachments;
DELETE FROM task_comments;
DELETE FROM task_checklist_items;
DELETE FROM task_attachments;
DELETE FROM task_recurrences;
DELETE FROM task_tags;
DELETE FROM task_history;
DELETE FROM tasks;

-- 2. SensAI
DELETE FROM sensai_velocity_records;
DELETE FROM sensai_standups;
DELETE FROM sensai_ceremonies;
DELETE FROM sensai_interventions;
DELETE FROM sensai_lifewheel_metrics;
DELETE FROM sensai_settings;

-- 3. Sprints / Epics / Tags
DELETE FROM sprints;
DELETE FROM epics;
DELETE FROM user_tags;

-- 4. Command center (user data)
DELETE FROM command_center_analytics;
DELETE FROM command_center_drafts;
DELETE FROM command_center_settings;
DELETE FROM command_center_feature_flags;

-- 5. Challenges (user data, not templates)
DELETE FROM challenge_entries;
DELETE FROM challenge_participants;
DELETE FROM challenges;

-- 6. Community (all user-generated)
DELETE FROM answer_upvotes;
DELETE FROM community_answers;
DELETE FROM question_tags;
DELETE FROM question_upvotes;
DELETE FROM community_questions;
DELETE FROM article_bookmarks;
DELETE FROM article_likes;
DELETE FROM article_tags;
DELETE FROM community_articles;
DELETE FROM articles;
DELETE FROM story_celebrates;
DELETE FROM story_image_urls;
DELETE FROM story_likes;
DELETE FROM story_metrics;
DELETE FROM community_stories;
DELETE FROM community_activities;
DELETE FROM community_badges;
DELETE FROM community_member_badges;
DELETE FROM community_members;
DELETE FROM activity_celebrates;
DELETE FROM community_feature_requests;
DELETE FROM feature_request_comments;
DELETE FROM feature_request_upvotes;
DELETE FROM group_members;
DELETE FROM group_tags;
DELETE FROM community_groups;
DELETE FROM community_partner_requests;
DELETE FROM partner_shared_challenges;
DELETE FROM community_partners;
DELETE FROM community_polls;
DELETE FROM poll_options;
DELETE FROM poll_votes;
DELETE FROM template_bookmarks;
DELETE FROM template_favorites;
DELETE FROM template_ratings;
DELETE FROM template_tags;
DELETE FROM community_templates;
DELETE FROM community_leaderboard_entries;
DELETE FROM weekly_challenge_completions;
DELETE FROM weekly_challenge_participants;
DELETE FROM community_weekly_challenges;

-- 7. Family
DELETE FROM family_invites;
DELETE FROM family_members;
DELETE FROM families;

-- 8. Essentia (user progress only, not book catalog)
DELETE FROM essentia_user_progress;

-- 9. Mindset (user favorites only, not themes/content)
DELETE FROM user_mindset_favorites;

-- 10. Notifications
DELETE FROM notification_preferences;
DELETE FROM notifications;

-- 11. Auth tokens
DELETE FROM refresh_tokens;
DELETE FROM password_reset_tokens;
DELETE FROM email_verification_codes;

-- 12. Test data
DELETE FROM test_attachments;

-- 13. User template associations
DELETE FROM user_template_tags;

-- 14. Finally, delete users
DELETE FROM users;

COMMIT;

-- Verify
SELECT 'users' AS tbl, COUNT(*) FROM users
UNION ALL SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL SELECT 'sprints', COUNT(*) FROM sprints
UNION ALL SELECT 'task_templates (preserved)', COUNT(*) FROM task_templates
UNION ALL SELECT 'life_wheel_areas (preserved)', COUNT(*) FROM life_wheel_areas
UNION ALL SELECT 'mindset_themes (preserved)', COUNT(*) FROM mindset_themes
UNION ALL SELECT 'challenge_templates (preserved)', COUNT(*) FROM challenge_templates;
