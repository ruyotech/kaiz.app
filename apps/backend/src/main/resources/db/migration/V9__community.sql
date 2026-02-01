-- ============================================================================
-- V9: Community Module
-- Members, Badges, Articles, Questions, Answers, Stories, Partners,
-- Templates, Groups, Polls, Weekly Challenges, Feature Requests
-- ============================================================================

-- ============================================================================
-- COMMUNITY MEMBERS
-- ============================================================================
CREATE TABLE community_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id),
    display_name VARCHAR(100) NOT NULL,
    avatar VARCHAR(50) DEFAULT '👤',
    bio VARCHAR(500),
    level INTEGER DEFAULT 1,
    level_title VARCHAR(50) DEFAULT 'Novice',
    reputation_points INTEGER DEFAULT 0,
    role VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    is_online BOOLEAN DEFAULT FALSE,
    sprints_completed INTEGER DEFAULT 0,
    helpful_answers INTEGER DEFAULT 0,
    templates_shared INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    show_activity BOOLEAN DEFAULT TRUE,
    accept_partner_requests BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    CONSTRAINT valid_role CHECK (role IN ('MEMBER', 'CONTRIBUTOR', 'MENTOR', 'MODERATOR', 'ADMIN'))
);

-- ============================================================================
-- MEMBER BADGES
-- ============================================================================
CREATE TABLE community_member_badges (
    member_id UUID NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
    badge_type VARCHAR(50) NOT NULL,
    PRIMARY KEY (member_id, badge_type)
);

-- ============================================================================
-- BADGE DEFINITIONS
-- ============================================================================
CREATE TABLE community_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_type VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500) NOT NULL,
    icon VARCHAR(100),
    rarity VARCHAR(20) NOT NULL DEFAULT 'COMMON',
    xp_reward INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    CONSTRAINT valid_rarity CHECK (rarity IN ('COMMON', 'RARE', 'EPIC', 'LEGENDARY'))
);

-- ============================================================================
-- ARTICLES
-- ============================================================================
CREATE TABLE community_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    excerpt VARCHAR(500),
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    cover_image_url VARCHAR(500),
    author_id UUID NOT NULL REFERENCES community_members(id),
    published_at TIMESTAMP WITH TIME ZONE,
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    read_time_minutes INTEGER DEFAULT 5,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    CONSTRAINT valid_article_category CHECK (category IN ('FEATURE', 'STRATEGY', 'PRODUCTIVITY', 'WELLNESS', 'FINANCE', 'ANNOUNCEMENT'))
);

CREATE TABLE article_tags (
    article_id UUID NOT NULL REFERENCES community_articles(id) ON DELETE CASCADE,
    tag VARCHAR(255) NOT NULL
);

CREATE TABLE article_likes (
    article_id UUID NOT NULL REFERENCES community_articles(id) ON DELETE CASCADE,
    member_id UUID NOT NULL,
    PRIMARY KEY (article_id, member_id)
);

CREATE TABLE article_bookmarks (
    article_id UUID NOT NULL REFERENCES community_articles(id) ON DELETE CASCADE,
    member_id UUID NOT NULL,
    PRIMARY KEY (article_id, member_id)
);

-- ============================================================================
-- QUESTIONS (Q&A)
-- ============================================================================
CREATE TABLE community_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(300) NOT NULL,
    body TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES community_members(id),
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    view_count INTEGER DEFAULT 0,
    upvote_count INTEGER DEFAULT 0,
    answer_count INTEGER DEFAULT 0,
    accepted_answer_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    CONSTRAINT valid_question_status CHECK (status IN ('OPEN', 'ANSWERED', 'CLOSED'))
);

CREATE TABLE question_tags (
    question_id UUID NOT NULL REFERENCES community_questions(id) ON DELETE CASCADE,
    tag VARCHAR(255) NOT NULL
);

CREATE TABLE question_upvotes (
    question_id UUID NOT NULL REFERENCES community_questions(id) ON DELETE CASCADE,
    member_id UUID NOT NULL,
    PRIMARY KEY (question_id, member_id)
);

-- ============================================================================
-- ANSWERS
-- ============================================================================
CREATE TABLE community_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES community_questions(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES community_members(id),
    upvote_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36)
);

CREATE TABLE answer_upvotes (
    answer_id UUID NOT NULL REFERENCES community_answers(id) ON DELETE CASCADE,
    member_id UUID NOT NULL,
    PRIMARY KEY (answer_id, member_id)
);

-- ============================================================================
-- SUCCESS STORIES
-- ============================================================================
CREATE TABLE community_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES community_members(id),
    title VARCHAR(200) NOT NULL,
    story TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'OTHER',
    life_wheel_area_id VARCHAR(50),
    like_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    CONSTRAINT valid_story_category CHECK (category IN ('HABIT', 'MILESTONE', 'TRANSFORMATION', 'LEARNING', 'OTHER'))
);

CREATE TABLE story_likes (
    story_id UUID NOT NULL REFERENCES community_stories(id) ON DELETE CASCADE,
    member_id UUID NOT NULL,
    PRIMARY KEY (story_id, member_id)
);

-- ============================================================================
-- ACCOUNTABILITY PARTNERS
-- ============================================================================
CREATE TABLE community_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member1_id UUID NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
    member2_id UUID NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    connected_since TIMESTAMP WITH TIME ZONE NOT NULL,
    last_interaction TIMESTAMP WITH TIME ZONE,
    check_in_streak INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36)
);

CREATE TABLE partner_shared_challenges (
    partnership_id UUID NOT NULL REFERENCES community_partners(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL
);

-- ============================================================================
-- PARTNER REQUESTS
-- ============================================================================
CREATE TABLE community_partner_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_member_id UUID NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
    to_member_id UUID NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
    message VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    CONSTRAINT valid_partner_request_status CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED'))
);

-- ============================================================================
-- COMMUNITY TEMPLATES
-- ============================================================================
CREATE TABLE community_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    template_type VARCHAR(50) NOT NULL,
    author_id UUID NOT NULL REFERENCES community_members(id),
    content TEXT NOT NULL,
    life_wheel_area_id VARCHAR(50),
    download_count INTEGER DEFAULT 0,
    rating DOUBLE PRECISION DEFAULT 0.0,
    rating_count INTEGER DEFAULT 0,
    rating_sum INTEGER DEFAULT 0,
    preview_image_url VARCHAR(500),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    CONSTRAINT valid_template_type CHECK (template_type IN ('SPRINT_PLAN', 'DAILY_RITUAL', 'WEEKLY_REVIEW', 'HABIT_STACK', 'GOAL_FRAMEWORK', 'CHALLENGE_TEMPLATE'))
);

CREATE TABLE template_tags (
    template_id UUID NOT NULL REFERENCES community_templates(id) ON DELETE CASCADE,
    tag VARCHAR(255) NOT NULL
);

CREATE TABLE template_bookmarks (
    template_id UUID NOT NULL REFERENCES community_templates(id) ON DELETE CASCADE,
    member_id UUID NOT NULL,
    PRIMARY KEY (template_id, member_id)
);

-- ============================================================================
-- MOTIVATION GROUPS
-- ============================================================================
CREATE TABLE community_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    cover_image_url VARCHAR(500),
    life_wheel_area_id VARCHAR(50),
    member_count INTEGER DEFAULT 0,
    max_members INTEGER DEFAULT 100,
    is_private BOOLEAN DEFAULT FALSE,
    creator_id UUID NOT NULL REFERENCES community_members(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36)
);

CREATE TABLE group_tags (
    group_id UUID NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
    tag VARCHAR(255) NOT NULL
);

CREATE TABLE group_members (
    group_id UUID NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
    member_id UUID NOT NULL,
    PRIMARY KEY (group_id, member_id)
);

-- ============================================================================
-- POLLS
-- ============================================================================
CREATE TABLE community_polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question VARCHAR(500) NOT NULL,
    total_votes INTEGER DEFAULT 0,
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36)
);

CREATE TABLE poll_options (
    poll_id UUID NOT NULL REFERENCES community_polls(id) ON DELETE CASCADE,
    option_order INTEGER NOT NULL,
    option_id UUID,
    option_text VARCHAR(200),
    vote_count INTEGER DEFAULT 0,
    PRIMARY KEY (poll_id, option_order)
);

CREATE TABLE poll_votes (
    poll_id UUID NOT NULL REFERENCES community_polls(id) ON DELETE CASCADE,
    member_id UUID NOT NULL,
    option_id UUID,
    PRIMARY KEY (poll_id, member_id)
);

-- ============================================================================
-- WEEKLY CHALLENGES
-- ============================================================================
CREATE TABLE community_weekly_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    life_wheel_area_id VARCHAR(50),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    participant_count INTEGER DEFAULT 0,
    completion_count INTEGER DEFAULT 0,
    reward_xp INTEGER DEFAULT 100,
    reward_badge VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36)
);

CREATE TABLE weekly_challenge_participants (
    challenge_id UUID NOT NULL REFERENCES community_weekly_challenges(id) ON DELETE CASCADE,
    member_id UUID NOT NULL,
    PRIMARY KEY (challenge_id, member_id)
);

CREATE TABLE weekly_challenge_completions (
    challenge_id UUID NOT NULL REFERENCES community_weekly_challenges(id) ON DELETE CASCADE,
    member_id UUID NOT NULL,
    PRIMARY KEY (challenge_id, member_id)
);

-- ============================================================================
-- FEATURE REQUESTS
-- ============================================================================
CREATE TABLE community_feature_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED',
    author_id UUID NOT NULL REFERENCES community_members(id),
    upvote_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    CONSTRAINT valid_feature_status CHECK (status IN ('SUBMITTED', 'UNDER_REVIEW', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DECLINED'))
);

CREATE TABLE feature_request_upvotes (
    request_id UUID NOT NULL REFERENCES community_feature_requests(id) ON DELETE CASCADE,
    member_id UUID NOT NULL,
    PRIMARY KEY (request_id, member_id)
);

CREATE TABLE feature_request_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES community_feature_requests(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES community_members(id),
    body TEXT NOT NULL,
    is_official BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36)
);

-- ============================================================================
-- LEADERBOARD ENTRIES
-- ============================================================================
CREATE TABLE community_leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
    period VARCHAR(20) NOT NULL,
    period_start DATE NOT NULL,
    points INTEGER DEFAULT 0,
    rank INTEGER,
    tasks_completed INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    CONSTRAINT valid_period CHECK (period IN ('WEEKLY', 'MONTHLY', 'ALL_TIME')),
    UNIQUE(member_id, period, period_start)
);

CREATE INDEX idx_leaderboard_period ON community_leaderboard_entries(period, period_start);
CREATE INDEX idx_leaderboard_rank ON community_leaderboard_entries(period, period_start, rank);
