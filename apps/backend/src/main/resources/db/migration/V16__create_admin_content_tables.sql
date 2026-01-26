-- =====================================================
-- V16: Admin Content Management Tables
-- Create tables for managing website content from admin
-- =====================================================

-- Site Content: Key-value store for general site content
CREATE TABLE site_content (
    id BIGSERIAL PRIMARY KEY,
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

-- About Features: Features displayed on the about page
CREATE TABLE about_features (
    id BIGSERIAL PRIMARY KEY,
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

-- Testimonials: Customer testimonials
CREATE TABLE testimonials (
    id BIGSERIAL PRIMARY KEY,
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

-- FAQs: Frequently asked questions
CREATE TABLE faqs (
    id BIGSERIAL PRIMARY KEY,
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

-- Pricing Tiers: Subscription plans
CREATE TABLE pricing_tiers (
    id BIGSERIAL PRIMARY KEY,
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
    id BIGSERIAL PRIMARY KEY,
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

-- Viral Hooks: Growth hacking content pieces
CREATE TABLE viral_hooks (
    id BIGSERIAL PRIMARY KEY,
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

-- Scheduled Communications: Newsletters, notifications, etc.
CREATE TABLE scheduled_communications (
    id BIGSERIAL PRIMARY KEY,
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

-- Admin Activity Log: Track admin actions
CREATE TABLE IF NOT EXISTS admin_activity_log (
    id BIGSERIAL PRIMARY KEY,
    admin_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255),
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin_user FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- Indexes for better query performance
-- =====================================================

CREATE INDEX idx_site_content_key ON site_content(content_key);
CREATE INDEX idx_site_content_active ON site_content(is_active);

CREATE INDEX idx_about_features_slug ON about_features(slug);
CREATE INDEX idx_about_features_order ON about_features(display_order);
CREATE INDEX idx_about_features_active ON about_features(is_active);

CREATE INDEX idx_testimonials_featured ON testimonials(is_featured);
CREATE INDEX idx_testimonials_active ON testimonials(is_active);
CREATE INDEX idx_testimonials_order ON testimonials(display_order);

CREATE INDEX idx_faqs_category ON faqs(category);
CREATE INDEX idx_faqs_active ON faqs(is_active);

CREATE INDEX idx_pricing_order ON pricing_tiers(display_order);
CREATE INDEX idx_pricing_active ON pricing_tiers(is_active);

CREATE INDEX idx_campaigns_status ON marketing_campaigns(status);
CREATE INDEX idx_campaigns_dates ON marketing_campaigns(start_date, end_date);

CREATE INDEX idx_hooks_status ON viral_hooks(status);
CREATE INDEX idx_hooks_platform ON viral_hooks(target_platform);
CREATE INDEX idx_hooks_scheduled ON viral_hooks(scheduled_at);

CREATE INDEX idx_comms_status ON scheduled_communications(status);
CREATE INDEX idx_comms_scheduled ON scheduled_communications(scheduled_at);

CREATE INDEX idx_admin_log_admin ON admin_activity_log(admin_id);
CREATE INDEX idx_admin_log_entity ON admin_activity_log(entity_type, entity_id);
CREATE INDEX idx_admin_log_created ON admin_activity_log(created_at);

-- =====================================================
-- Seed data for about features (matching KAIZ_FEATURES)
-- =====================================================

INSERT INTO about_features (slug, title, subtitle, description, bullet_points, example, icon, color, display_order, is_active) VALUES
('life-wheel', 'Life Wheel – Your Life, Visualized', 'Focus on the dimensions of your life that need the most attention', 
'The Life Wheel gives you a bird''s eye view of all major life areas—Career, Health, Finances, Relationships, and more—letting you see at a glance what''s flourishing and what needs more love. Regular check-ins reveal trends and patterns, so you can celebrate progress or adjust course before small issues snowball into big ones.',
'["Track all 8 life dimensions in one visual","Monthly check-ins reveal patterns over time","Balanced growth means a happier, more fulfilled you"]',
'{"scenario": "You notice your Health dimension dropped from 8 to 5 over two months.","action": "Kaiz suggests scheduling gym sessions and links to your meal-planning toolkit.","result": "By the next check-in, you''re back to 7 and climbing."}',
'Circle', 'blue', 1, true),

('weekly-sprints', 'Weekly Sprints – Momentum Made Simple', 'Batch your tasks into focused weekly cycles', 
'Inspired by agile methodologies, Weekly Sprints help you break big dreams into bite-sized chunks. Each Sunday (or whenever you choose), plan your week with clear goals. By the end of the sprint, celebrate wins and reflect on what you learned.',
'["Plan what you''ll accomplish each week, not just each day","Built-in retrospectives help you improve sprint over sprint","See your velocity grow as you master consistent progress"]',
'{"scenario": "You have a goal to write a book.","action": "Sprint 1: Outline chapters. Sprint 2: Draft chapter 1.","result": "In 12 weeks, you''ve got half a manuscript."}',
'Zap', 'purple', 2, true),

('eisenhower-matrix', 'Eisenhower Matrix – Work on What Matters', 'Stop firefighting. Start prioritizing.', 
'The Eisenhower Matrix separates the urgent from the important, so you stop spending your days on busywork. Kaiz uses this proven framework to help you see at a glance what deserves your energy—and what can wait, be delegated, or dropped entirely.',
'["Four quadrants: Do, Schedule, Delegate, Eliminate","AI suggestions to help you categorize tasks","Focus energy on high-impact items"]',
'{"scenario": "You have 30 tasks on your to-do list.","action": "Kaiz helps you sort them into quadrants.","result": "You realize only 7 tasks truly need your attention today."}',
'Grid3X3', 'green', 3, true),

('command-center', 'Command Center – Your Mission Control', 'One place to capture everything that matters', 
'The Command Center is where your tasks, notes, ideas, and reminders converge. Capture anything quickly—via voice, text, or camera—and let Kaiz route it to the right place. Never lose a thought again.',
'["Universal inbox for all your inputs","Smart sorting powered by AI","Quick capture via voice, text, or photo"]',
'{"scenario": "You''re in a meeting and remember you need to buy groceries.","action": "Quick-add ''groceries'' to Command Center.","result": "Kaiz files it under your personal errands list, ready when you need it."}',
'LayoutDashboard', 'orange', 4, true),

('focus-mode', 'Focus Mode – Deep Work, No Distractions', 'When it''s time to work, it''s time to work.', 
'Focus Mode blocks distractions and guides you through deep work sessions using Pomodoro timers or custom intervals. Track your focused time and watch your productivity soar.',
'["Pomodoro timers, customizable intervals","Track focused hours per day/week","Integrate with calendar for scheduled deep work"]',
'{"scenario": "You struggle to focus on writing for more than 10 minutes.","action": "Start a 25-minute Focus session with breaks built in.","result": "You finish a 2,000-word draft in one morning."}',
'Focus', 'red', 5, true),

('universal-intake', 'Universal Intake – Capture Every Idea', 'Voice, text, photo—capture anything, anywhere.', 
'Life doesn''t wait for you to open an app. Universal Intake lets you capture ideas instantly via voice memo, quick text, or a snapshot. Kaiz processes and categorizes inputs, so nothing falls through the cracks.',
'["Voice memos transcribed and categorized","Photo capture for receipts, whiteboards, notes","Text input for quick thoughts"]',
'{"scenario": "You''re jogging and have an idea for a project.","action": "Voice-capture: ''New marketing campaign: run social ads in Q2.''","result": "Kaiz files it under your Marketing epic, ready to review later."}',
'Inbox', 'cyan', 6, true),

('finance-hub', 'Finance Hub – Money, Managed', 'Budget, track, and grow your wealth.', 
'Finance Hub connects to your accounts (or lets you log manually) to give you a clear picture of where your money goes. Set budgets, track expenses, and watch your savings grow.',
'["Automatic expense categorization","Budget alerts and savings goals","Net worth tracking over time"]',
'{"scenario": "You''re not sure where $500 went last month.","action": "Finance Hub shows you spent it on dining out.","result": "You set a dining budget and save $300 next month."}',
'Wallet', 'emerald', 7, true),

('family-squads', 'Family Squads – Teamwork at Home', 'Coordinate with loved ones like a pro.', 
'Family Squads bring agile to the household. Assign chores, share shopping lists, plan events, and keep everyone on the same page—without the nagging.',
'["Shared task boards for the family","Chore assignments with gamification","Shared calendars and event planning"]',
'{"scenario": "Saturday chores always cause arguments.","action": "Create a Family Sprint board, assign tasks, add point rewards.","result": "Kids compete to finish chores first. Peace is restored."}',
'Users', 'pink', 8, true),

('challenges', '30-Day Challenges – Build Better Habits', 'Short sprints, lasting change.', 
'30-Day Challenges help you build habits through focused, time-boxed efforts. Whether you want to read more, exercise daily, or learn a new skill, Challenges keep you accountable.',
'["Pre-built challenges for common goals","Custom challenge creator","Community leaderboards for motivation"]',
'{"scenario": "You want to start meditating.","action": "Join the ''30 Days of Calm'' challenge.","result": "After 30 days, meditation is part of your morning routine."}',
'Trophy', 'amber', 9, true),

('ai-scrum-master', 'AI Scrum Master – Your Personal Coach', 'Guidance when you need it, silence when you don''t.', 
'The AI Scrum Master nudges you when you''re off track, celebrates your wins, and helps you plan your next move. It learns your patterns and adapts to your style.',
'["Smart reminders based on your habits","Weekly planning assistance","Personalized productivity tips"]',
'{"scenario": "You''ve been procrastinating on a report for three days.","action": "Kaiz gently nudges: ''That report is still waiting. Ready to tackle it?''","result": "You finish it before lunch."}',
'Bot', 'violet', 10, true),

('motivation-hub', 'Motivation Hub – Stay Inspired', 'Quotes, streaks, and micro-rewards.', 
'Motivation Hub keeps you going with daily quotes, streak tracking, and small celebrations for your wins. It''s your personal cheerleader, always ready with encouragement.',
'["Daily motivational quotes tailored to your goals","Streak tracking for habits","Badges and micro-rewards for milestones"]',
'{"scenario": "You''ve worked out 7 days in a row.","action": "Motivation Hub awards you a ''Weekly Warrior'' badge.","result": "You feel proud and keep the streak going."}',
'Sparkles', 'yellow', 11, true),

('knowledge-hub', 'Knowledge Hub – Learn & Grow', 'Resources curated for your journey.', 
'Knowledge Hub surfaces articles, videos, and courses relevant to your goals. Whether you''re learning to invest, cook, or lead, Kaiz finds content that fits your path.',
'["Personalized content recommendations","Save and organize resources","Track learning progress"]',
'{"scenario": "You want to learn about investing.","action": "Knowledge Hub recommends a beginner investing course.","result": "In a month, you''ve opened your first brokerage account."}',
'BookOpen', 'teal', 12, true),

('reports', 'Reports & Insights – Data-Driven Growth', 'See your progress, spot your patterns.', 
'Reports give you a dashboard view of your productivity, habits, and life balance. Spot trends, celebrate wins, and course-correct before small issues become big problems.',
'["Weekly and monthly progress reports","Trend analysis across all life dimensions","Exportable data for deeper analysis"]',
'{"scenario": "You feel like you''re not making progress.","action": "Check your monthly report: 47 tasks completed, 12 habits maintained.","result": "You realize you''ve done more than you thought."}',
'BarChart3', 'indigo', 13, true),

('community', 'Community – You''re Not Alone', 'Connect, share, and grow together.', 
'The Kaiz Community connects you with others on similar journeys. Share wins, ask for advice, and find accountability partners who get it.',
'["Public and private groups","Challenge leaderboards","Mentorship matching"]',
'{"scenario": "You''re struggling to stay motivated on your fitness goal.","action": "Join the ''Fitness Warriors'' group, post your struggles.","result": "You get tips, encouragement, and an accountability buddy."}',
'Globe', 'rose', 14, true),

('privacy-trust', 'Privacy & Trust – Your Data, Your Rules', 'We take privacy as seriously as you do.', 
'Kaiz is built with privacy-first principles. Your data is encrypted, never sold, and you control what''s shared. Optional AI features process data locally when possible.',
'["End-to-end encryption for sensitive data","No selling of personal data, ever","Granular privacy controls"]',
'{"scenario": "You''re worried about your financial data.","action": "Review privacy settings, see exactly what''s stored and encrypted.","result": "Peace of mind knowing your data is secure."}',
'Shield', 'slate', 15, true);

-- =====================================================
-- Seed data for site content
-- =====================================================

INSERT INTO site_content (content_key, content_type, content, is_active) VALUES
('site_tagline', 'TEXT', 'Own Your Day. Design Your Life.', true),
('hero_title', 'TEXT', 'Kaiz LifeOS', true),
('hero_subtitle', 'TEXT', 'The operating system for your life—where productivity meets purpose, and every day becomes a step toward the person you want to be.', true),
('philosophy_title', 'TEXT', 'Our Philosophy', true),
('philosophy_content', 'HTML', '<p>Kaiz LifeOS was born from a simple frustration: life is complex, but your tools shouldn''t be. We believe that everyone deserves a system that respects their time, adapts to their rhythms, and empowers them to live intentionally—without requiring a PhD in productivity hacking.</p>', true),
('footer_copyright', 'TEXT', '© 2025 Kaiz LifeOS. All rights reserved.', true);

-- =====================================================
-- Seed data for testimonials
-- =====================================================

INSERT INTO testimonials (name, role, company, quote, rating, metrics, is_featured, display_order, is_active) VALUES
('Sarah Chen', 'Product Manager', 'TechCorp', 'Kaiz completely transformed how I manage my work and personal life. The Life Wheel visualization finally helped me see where I was neglecting important areas.', 5, '{"tasksCompleted": 1247, "streakDays": 89}', true, 1, true),
('Marcus Johnson', 'Entrepreneur', 'Self-employed', 'As a solopreneur, I was drowning in tasks. The AI Scrum Master keeps me accountable without being annoying. It''s like having a coach in my pocket.', 5, '{"productivityIncrease": "40%", "hoursReclaimed": 15}', true, 2, true),
('Emily Rodriguez', 'Working Mom', 'Healthcare', 'Family Squads changed our household dynamics. The kids actually compete to do chores now! Saturday mornings went from stressful to fun.', 5, '{"familyMembersActive": 4, "tasksShared": 523}', true, 3, true);

-- =====================================================
-- Seed data for FAQs
-- =====================================================

INSERT INTO faqs (question, answer, category, display_order, is_active) VALUES
('What is Kaiz LifeOS?', 'Kaiz LifeOS is a comprehensive life operating system that combines task management, habit tracking, goal setting, and personal development tools into one seamless experience. It''s designed to help you balance all areas of your life while making meaningful progress toward your goals.', 'General', 1, true),
('Is my data secure?', 'Absolutely. We use end-to-end encryption for sensitive data, never sell your personal information, and give you full control over your privacy settings. You can export or delete your data at any time.', 'Privacy', 2, true),
('Can I use Kaiz with my family?', 'Yes! Family Squads let you create shared task boards, assign chores, plan events, and keep everyone coordinated. Each family member has their own account while sharing what matters.', 'Features', 3, true),
('What platforms is Kaiz available on?', 'Kaiz is available as a mobile app for iOS and Android, and as a web application. All platforms sync seamlessly, so you can access your data anywhere.', 'General', 4, true),
('Is there a free plan?', 'Yes, Kaiz offers a free tier with core features. Premium plans unlock advanced features like AI coaching, unlimited challenges, and detailed analytics.', 'Pricing', 5, true);

-- =====================================================
-- Seed data for pricing tiers
-- =====================================================

INSERT INTO pricing_tiers (name, price, billing_period, description, features, cta_text, cta_link, is_popular, display_order, is_active) VALUES
('Free', 0, 'free', 'Perfect for getting started', '["Life Wheel tracking","Basic task management","Up to 3 active goals","Weekly sprints","Community access"]', 'Get Started Free', '/signup', false, 1, true),
('Pro', 9.99, 'month', 'For individuals serious about growth', '["Everything in Free","AI Scrum Master","Unlimited goals & challenges","Advanced analytics","Focus Mode with stats","Knowledge Hub access","Priority support"]', 'Start Pro Trial', '/signup?plan=pro', true, 2, true),
('Family', 19.99, 'month', 'Grow together as a family', '["Everything in Pro","Up to 6 family members","Family Squads","Shared task boards","Chore gamification","Family calendar sync"]', 'Start Family Trial', '/signup?plan=family', false, 3, true);
