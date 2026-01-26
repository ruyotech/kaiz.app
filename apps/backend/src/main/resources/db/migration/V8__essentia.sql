-- ============================================================================
-- V8: Essentia Module (Micro-Learning)
-- ============================================================================

-- Books
CREATE TABLE essentia_books (
    id UUID PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    author VARCHAR(200) NOT NULL,
    life_wheel_area_id VARCHAR(10) REFERENCES life_wheel_areas(id),
    category VARCHAR(100),
    duration INTEGER,
    card_count INTEGER,
    difficulty VARCHAR(20) DEFAULT 'BEGINNER',
    description TEXT,
    publication_year INTEGER,
    rating DECIMAL(3, 2),
    completion_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36)
);

CREATE INDEX idx_essentia_books_category ON essentia_books(category);
CREATE INDEX idx_essentia_books_difficulty ON essentia_books(difficulty);

-- Book Tags
CREATE TABLE essentia_book_tags (
    book_id UUID NOT NULL REFERENCES essentia_books(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL
);

-- Book Takeaways
CREATE TABLE essentia_book_takeaways (
    book_id UUID NOT NULL REFERENCES essentia_books(id) ON DELETE CASCADE,
    takeaway TEXT NOT NULL,
    sort_order INTEGER NOT NULL
);

-- Cards
CREATE TABLE essentia_cards (
    id UUID PRIMARY KEY,
    book_id UUID NOT NULL REFERENCES essentia_books(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    sort_order INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    text TEXT NOT NULL,
    image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36)
);

CREATE INDEX idx_essentia_cards_book_id ON essentia_cards(book_id);

-- User Progress
CREATE TABLE essentia_user_progress (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES essentia_books(id) ON DELETE CASCADE,
    current_card_index INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    UNIQUE(user_id, book_id)
);

CREATE INDEX idx_essentia_user_progress_user_id ON essentia_user_progress(user_id);

-- Seed Books
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, publication_year, rating, completion_count) VALUES
('33333333-3333-3333-3333-333333333301'::UUID, 'Atomic Habits', 'James Clear', 'lw-4', 'Personal Growth', 8, 6, 'BEGINNER', 'Learn how tiny changes can lead to remarkable results.', 2018, 4.80, 1250),
('33333333-3333-3333-3333-333333333302'::UUID, 'Deep Work', 'Cal Newport', 'lw-2', 'Career & Work', 7, 4, 'INTERMEDIATE', 'The ability to focus deeply is becoming rare and valuable.', 2016, 4.60, 980),
('33333333-3333-3333-3333-333333333303'::UUID, 'The Psychology of Money', 'Morgan Housel', 'lw-3', 'Finance & Money', 6, 4, 'BEGINNER', 'Money decisions are about behavior and emotions.', 2020, 4.70, 1100);

-- Seed Book Tags
INSERT INTO essentia_book_tags (book_id, tag) VALUES
('33333333-3333-3333-3333-333333333301'::UUID, 'habits'),
('33333333-3333-3333-3333-333333333301'::UUID, 'productivity'),
('33333333-3333-3333-3333-333333333302'::UUID, 'focus'),
('33333333-3333-3333-3333-333333333302'::UUID, 'career'),
('33333333-3333-3333-3333-333333333303'::UUID, 'finance'),
('33333333-3333-3333-3333-333333333303'::UUID, 'investing');

-- Seed Cards for Atomic Habits
INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text, image_url) VALUES
('44444444-4444-4444-4444-444444444401'::UUID, '33333333-3333-3333-3333-333333333301'::UUID, 'INTRO', 1, 'Welcome to Atomic Habits', 'James Clear spent years studying the science of habits.', NULL),
('44444444-4444-4444-4444-444444444402'::UUID, '33333333-3333-3333-3333-333333333301'::UUID, 'CONCEPT', 2, 'The 1% Rule', 'Get 1% better each day for a year, you''ll be 37 times better.', NULL),
('44444444-4444-4444-4444-444444444403'::UUID, '33333333-3333-3333-3333-333333333301'::UUID, 'CONCEPT', 3, 'Systems vs Goals', 'Winners and losers have the same goals. The difference is systems.', NULL),
('44444444-4444-4444-4444-444444444404'::UUID, '33333333-3333-3333-3333-333333333301'::UUID, 'SUMMARY', 4, 'Action Steps', '1. Start small\n2. Design your environment\n3. Never miss twice', NULL);
