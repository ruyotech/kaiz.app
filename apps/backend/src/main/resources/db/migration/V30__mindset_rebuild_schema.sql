-- =============================================================================
-- V30: Mindset Rebuild — Per-user favorites table, schema improvements
-- =============================================================================

-- 1. Create per-user favorites table (replaces global is_favorite boolean)
CREATE TABLE IF NOT EXISTS user_mindset_favorites (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id      UUID NOT NULL REFERENCES mindset_contents(id) ON DELETE CASCADE,
    note            TEXT,
    saved_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(36),
    updated_by      VARCHAR(36),
    CONSTRAINT uq_user_mindset_favorite UNIQUE (user_id, content_id)
);

CREATE INDEX IF NOT EXISTS idx_user_mindset_favorites_user ON user_mindset_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mindset_favorites_content ON user_mindset_favorites(content_id);

-- 2. Add background_image_url column to mindset_contents
ALTER TABLE mindset_contents ADD COLUMN IF NOT EXISTS background_image_url VARCHAR(500);

-- 3. Drop the global is_favorite column (now per-user in user_mindset_favorites)
ALTER TABLE mindset_contents DROP COLUMN IF EXISTS is_favorite;

-- 4. Populate life_wheel_area_id on existing seed rows (currently NULL)
UPDATE mindset_contents SET life_wheel_area_id = 'lw-4', dimension_tag = 'lw-4'
WHERE author = 'Steve Jobs' AND life_wheel_area_id IS NULL;

UPDATE mindset_contents SET life_wheel_area_id = 'lw-4', dimension_tag = 'lw-4'
WHERE author = 'Winston Churchill' AND life_wheel_area_id IS NULL;

UPDATE mindset_contents SET life_wheel_area_id = 'lw-2', dimension_tag = 'lw-2'
WHERE author = 'Sheryl Sandberg' AND life_wheel_area_id IS NULL;

UPDATE mindset_contents SET life_wheel_area_id = 'lw-4', dimension_tag = 'lw-4'
WHERE author = 'Chinese Proverb' AND life_wheel_area_id IS NULL;

UPDATE mindset_contents SET life_wheel_area_id = 'lw-4', dimension_tag = 'lw-4'
WHERE author IS NULL AND life_wheel_area_id IS NULL;

-- 5. Seed 45 additional quotes across all 8 life wheel dimensions
-- lw-1: Health & Fitness
INSERT INTO mindset_contents (id, body, author, life_wheel_area_id, dimension_tag, theme_preset, intervention_weight, emotional_tone, dwell_time_ms, created_at, updated_at)
VALUES
(gen_random_uuid(), 'Take care of your body. It''s the only place you have to live.', 'Jim Rohn', 'lw-1', 'lw-1', 'nature', 70, 'MOTIVATIONAL', 4000, NOW(), NOW()),
(gen_random_uuid(), 'The greatest wealth is health.', 'Virgil', 'lw-1', 'lw-1', 'minimalist', 60, 'REFLECTIVE', 4000, NOW(), NOW()),
(gen_random_uuid(), 'Physical fitness is the first requisite of happiness.', 'Joseph Pilates', 'lw-1', 'lw-1', 'gradient-blue', 65, 'ACTIONABLE', 4000, NOW(), NOW()),
(gen_random_uuid(), 'A healthy outside starts from the inside.', 'Robert Urich', 'lw-1', 'lw-1', 'dark', 55, 'CALMING', 4000, NOW(), NOW()),
(gen_random_uuid(), 'Exercise is a celebration of what your body can do. Not a punishment for what you ate.', 'Unknown', 'lw-1', 'lw-1', 'gradient-sunset', 75, 'MOTIVATIONAL', 4000, NOW(), NOW()),
(gen_random_uuid(), 'Your body hears everything your mind says. Stay positive.', 'Unknown', 'lw-1', 'lw-1', 'nature', 50, 'CALMING', 4000, NOW(), NOW());

-- lw-2: Career & Work
INSERT INTO mindset_contents (id, body, author, life_wheel_area_id, dimension_tag, theme_preset, intervention_weight, emotional_tone, dwell_time_ms, created_at, updated_at)
VALUES
(gen_random_uuid(), 'The only way to do great work is to love what you do.', 'Steve Jobs', 'lw-2', 'lw-2', 'dark', 80, 'MOTIVATIONAL', 4000, NOW(), NOW()),
(gen_random_uuid(), 'Success is not the key to happiness. Happiness is the key to success.', 'Albert Schweitzer', 'lw-2', 'lw-2', 'gradient-purple', 70, 'REFLECTIVE', 4000, NOW(), NOW()),
(gen_random_uuid(), 'Don''t be afraid to give up the good to go for the great.', 'John D. Rockefeller', 'lw-2', 'lw-2', 'minimalist', 65, 'ACTIONABLE', 4000, NOW(), NOW()),
(gen_random_uuid(), 'Your work is going to fill a large part of your life. Don''t settle.', 'Steve Jobs', 'lw-2', 'lw-2', 'cyberpunk', 75, 'MOTIVATIONAL', 4000, NOW(), NOW()),
(gen_random_uuid(), 'Opportunities don''t happen. You create them.', 'Chris Grosser', 'lw-2', 'lw-2', 'gradient-blue', 85, 'ACTIONABLE', 4000, NOW(), NOW()),
(gen_random_uuid(), 'The future depends on what you do today.', 'Mahatma Gandhi', 'lw-2', 'lw-2', 'nature', 60, 'REFLECTIVE', 4000, NOW(), NOW());

-- lw-3: Finance & Money
INSERT INTO mindset_contents (id, body, author, life_wheel_area_id, dimension_tag, theme_preset, intervention_weight, emotional_tone, dwell_time_ms, created_at, updated_at)
VALUES
(gen_random_uuid(), 'Do not save what is left after spending, but spend what is left after saving.', 'Warren Buffett', 'lw-3', 'lw-3', 'minimalist', 80, 'ACTIONABLE', 4000, NOW(), NOW()),
(gen_random_uuid(), 'An investment in knowledge pays the best interest.', 'Benjamin Franklin', 'lw-3', 'lw-3', 'dark', 70, 'REFLECTIVE', 4000, NOW(), NOW()),
(gen_random_uuid(), 'Financial freedom is available to those who learn about it and work for it.', 'Robert Kiyosaki', 'lw-3', 'lw-3', 'gradient-blue', 75, 'MOTIVATIONAL', 4000, NOW(), NOW()),
(gen_random_uuid(), 'The habit of saving is itself an education. It fosters every virtue.', 'T.T. Munger', 'lw-3', 'lw-3', 'nature', 55, 'CALMING', 4000, NOW(), NOW()),
(gen_random_uuid(), 'Wealth consists not in having great possessions, but in having few wants.', 'Epictetus', 'lw-3', 'lw-3', 'gradient-purple', 60, 'REFLECTIVE', 4000, NOW(), NOW());

-- lw-4: Personal Growth
INSERT INTO mindset_contents (id, body, author, life_wheel_area_id, dimension_tag, theme_preset, intervention_weight, emotional_tone, dwell_time_ms, created_at, updated_at)
VALUES
(gen_random_uuid(), 'The only person you are destined to become is the person you decide to be.', 'Ralph Waldo Emerson', 'lw-4', 'lw-4', 'gradient-purple', 85, 'MOTIVATIONAL', 4000, NOW(), NOW()),
(gen_random_uuid(), 'Growth is painful. Change is painful. But nothing is as painful as staying stuck.', 'Mandy Hale', 'lw-4', 'lw-4', 'dark', 90, 'ACTIONABLE', 4000, NOW(), NOW()),
(gen_random_uuid(), 'What lies behind us and what lies before us are tiny matters compared to what lies within us.', 'Ralph Waldo Emerson', 'lw-4', 'lw-4', 'nature', 70, 'REFLECTIVE', 4000, NOW(), NOW()),
(gen_random_uuid(), 'Be not afraid of growing slowly, be afraid only of standing still.', 'Chinese Proverb', 'lw-4', 'lw-4', 'minimalist', 65, 'CALMING', 4000, NOW(), NOW()),
(gen_random_uuid(), 'In the middle of difficulty lies opportunity.', 'Albert Einstein', 'lw-4', 'lw-4', 'cyberpunk', 80, 'MOTIVATIONAL', 4000, NOW(), NOW()),
(gen_random_uuid(), 'You don''t have to be great to start, but you have to start to be great.', 'Zig Ziglar', 'lw-4', 'lw-4', 'gradient-sunset', 75, 'ACTIONABLE', 4000, NOW(), NOW());

-- lw-5: Relationships & Family
INSERT INTO mindset_contents (id, body, author, life_wheel_area_id, dimension_tag, theme_preset, intervention_weight, emotional_tone, dwell_time_ms, created_at, updated_at)
VALUES
(gen_random_uuid(), 'The quality of your life is the quality of your relationships.', 'Tony Robbins', 'lw-5', 'lw-5', 'gradient-sunset', 80, 'REFLECTIVE', 4000, NOW(), NOW()),
(gen_random_uuid(), 'The greatest gift of life is friendship, and I have received it.', 'Hubert H. Humphrey', 'lw-5', 'lw-5', 'nature', 60, 'CALMING', 4000, NOW(), NOW()),
(gen_random_uuid(), 'In family life, love is the oil that eases friction.', 'Friedrich Nietzsche', 'lw-5', 'lw-5', 'minimalist', 65, 'REFLECTIVE', 4000, NOW(), NOW()),
(gen_random_uuid(), 'A loving family provides the foundation children need to succeed in life.', 'Unknown', 'lw-5', 'lw-5', 'dark', 55, 'MOTIVATIONAL', 4000, NOW(), NOW()),
(gen_random_uuid(), 'The best thing to hold onto in life is each other.', 'Audrey Hepburn', 'lw-5', 'lw-5', 'gradient-purple', 70, 'CALMING', 4000, NOW(), NOW());

-- lw-6: Social Life
INSERT INTO mindset_contents (id, body, author, life_wheel_area_id, dimension_tag, theme_preset, intervention_weight, emotional_tone, dwell_time_ms, created_at, updated_at)
VALUES
(gen_random_uuid(), 'Alone we can do so little; together we can do so much.', 'Helen Keller', 'lw-6', 'lw-6', 'gradient-blue', 75, 'MOTIVATIONAL', 4000, NOW(), NOW()),
(gen_random_uuid(), 'The only way to have a friend is to be one.', 'Ralph Waldo Emerson', 'lw-6', 'lw-6', 'nature', 60, 'REFLECTIVE', 4000, NOW(), NOW()),
(gen_random_uuid(), 'No one can whistle a symphony. It takes a whole orchestra to play it.', 'H.E. Luccock', 'lw-6', 'lw-6', 'dark', 65, 'ACTIONABLE', 4000, NOW(), NOW()),
(gen_random_uuid(), 'Surround yourself with only people who are going to lift you higher.', 'Oprah Winfrey', 'lw-6', 'lw-6', 'cyberpunk', 80, 'MOTIVATIONAL', 4000, NOW(), NOW()),
(gen_random_uuid(), 'We rise by lifting others.', 'Robert Ingersoll', 'lw-6', 'lw-6', 'minimalist', 55, 'CALMING', 4000, NOW(), NOW());

-- lw-7: Fun & Recreation
INSERT INTO mindset_contents (id, body, author, life_wheel_area_id, dimension_tag, theme_preset, intervention_weight, emotional_tone, dwell_time_ms, created_at, updated_at)
VALUES
(gen_random_uuid(), 'Almost everything will work again if you unplug it for a few minutes, including you.', 'Anne Lamott', 'lw-7', 'lw-7', 'nature', 70, 'CALMING', 4000, NOW(), NOW()),
(gen_random_uuid(), 'Play is the highest form of research.', 'Albert Einstein', 'lw-7', 'lw-7', 'cyberpunk', 65, 'REFLECTIVE', 4000, NOW(), NOW()),
(gen_random_uuid(), 'Rest when you''re weary. Refresh and renew yourself, your body, your mind, your spirit.', 'Ralph Marston', 'lw-7', 'lw-7', 'gradient-sunset', 60, 'CALMING', 4000, NOW(), NOW()),
(gen_random_uuid(), 'Life is either a daring adventure or nothing at all.', 'Helen Keller', 'lw-7', 'lw-7', 'gradient-blue', 75, 'MOTIVATIONAL', 4000, NOW(), NOW()),
(gen_random_uuid(), 'Do more things that make you forget to check your phone.', 'Unknown', 'lw-7', 'lw-7', 'minimalist', 80, 'ACTIONABLE', 4000, NOW(), NOW());

-- lw-8: Environment & Home
INSERT INTO mindset_contents (id, body, author, life_wheel_area_id, dimension_tag, theme_preset, intervention_weight, emotional_tone, dwell_time_ms, created_at, updated_at)
VALUES
(gen_random_uuid(), 'Your home should be your sanctuary. Make it a place of peace.', 'Unknown', 'lw-8', 'lw-8', 'nature', 65, 'CALMING', 4000, NOW(), NOW()),
(gen_random_uuid(), 'The environment you create is a reflection of your state of mind.', 'Unknown', 'lw-8', 'lw-8', 'minimalist', 70, 'REFLECTIVE', 4000, NOW(), NOW()),
(gen_random_uuid(), 'Simplicity is the ultimate sophistication.', 'Leonardo da Vinci', 'lw-8', 'lw-8', 'dark', 60, 'REFLECTIVE', 4000, NOW(), NOW()),
(gen_random_uuid(), 'Have nothing in your house that you do not know to be useful or believe to be beautiful.', 'William Morris', 'lw-8', 'lw-8', 'gradient-purple', 75, 'ACTIONABLE', 4000, NOW(), NOW()),
(gen_random_uuid(), 'The objective of cleaning is not just to clean, but to feel happiness living within that environment.', 'Marie Kondo', 'lw-8', 'lw-8', 'gradient-blue', 55, 'CALMING', 4000, NOW(), NOW());
