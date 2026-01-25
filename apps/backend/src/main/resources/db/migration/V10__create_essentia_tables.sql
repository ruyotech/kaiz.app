-- Create essentia books table
CREATE TABLE essentia_books (
    id UUID PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    author VARCHAR(200) NOT NULL,
    life_wheel_area_id UUID REFERENCES life_wheel_areas(id),
    category VARCHAR(100),
    duration INTEGER,
    card_count INTEGER,
    difficulty VARCHAR(20) DEFAULT 'BEGINNER',
    description TEXT,
    publication_year INTEGER,
    rating DECIMAL(3, 2),
    completion_count INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create book tags table
CREATE TABLE essentia_book_tags (
    book_id UUID NOT NULL REFERENCES essentia_books(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL
);

-- Create book takeaways table
CREATE TABLE essentia_book_takeaways (
    book_id UUID NOT NULL REFERENCES essentia_books(id) ON DELETE CASCADE,
    takeaway TEXT NOT NULL,
    sort_order INTEGER NOT NULL
);

-- Create essentia cards table
CREATE TABLE essentia_cards (
    id UUID PRIMARY KEY,
    book_id UUID NOT NULL REFERENCES essentia_books(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    sort_order INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    text TEXT NOT NULL,
    image_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create user progress table
CREATE TABLE essentia_user_progress (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES essentia_books(id) ON DELETE CASCADE,
    current_card_index INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, book_id)
);

-- Create indexes
CREATE INDEX idx_essentia_books_category ON essentia_books(category);
CREATE INDEX idx_essentia_books_difficulty ON essentia_books(difficulty);
CREATE INDEX idx_essentia_books_life_wheel_area ON essentia_books(life_wheel_area_id);
CREATE INDEX idx_essentia_cards_book_id ON essentia_cards(book_id);
CREATE INDEX idx_essentia_user_progress_user_id ON essentia_user_progress(user_id);
CREATE INDEX idx_essentia_user_progress_book_id ON essentia_user_progress(book_id);

-- Insert seed data for books

-- Book 1: Atomic Habits
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, publication_year, rating, completion_count)
SELECT 
    '33333333-3333-3333-3333-333333333301'::UUID,
    'Atomic Habits',
    'James Clear',
    id,
    'Personal Growth',
    8,
    6,
    'BEGINNER',
    'Learn how tiny changes can lead to remarkable results. James Clear reveals the surprising science behind habit formation and provides practical strategies to build good habits and break bad ones.',
    2018,
    4.80,
    1250
FROM life_wheel_areas WHERE display_id = 'lw-4' LIMIT 1;

-- Book 2: Deep Work
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, publication_year, rating, completion_count)
SELECT 
    '33333333-3333-3333-3333-333333333302'::UUID,
    'Deep Work',
    'Cal Newport',
    id,
    'Career & Work',
    7,
    4,
    'INTERMEDIATE',
    'In a world of distraction, the ability to focus deeply is becoming rare and valuable. Cal Newport shows how to cultivate deep work and produce your best results.',
    2016,
    4.60,
    980
FROM life_wheel_areas WHERE display_id = 'lw-2' LIMIT 1;

-- Book 3: The Psychology of Money
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, publication_year, rating, completion_count)
SELECT 
    '33333333-3333-3333-3333-333333333303'::UUID,
    'The Psychology of Money',
    'Morgan Housel',
    id,
    'Finance & Money',
    6,
    4,
    'BEGINNER',
    'Money decisions are rarely about math. They''re about behavior, emotions, and how we think. Morgan Housel shares timeless lessons on wealth, greed, and happiness.',
    2020,
    4.70,
    1100
FROM life_wheel_areas WHERE display_id = 'lw-3' LIMIT 1;

-- Book 4: Cant Hurt Me
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, publication_year, rating, completion_count)
SELECT 
    '33333333-3333-3333-3333-333333333304'::UUID,
    'Cant Hurt Me',
    'David Goggins',
    id,
    'Health & Fitness',
    9,
    4,
    'INTERMEDIATE',
    'From poverty and abuse to Navy SEAL and ultramarathon runner, David Goggins shares his journey of transforming himself through self-discipline and mental toughness.',
    2018,
    4.75,
    890
FROM life_wheel_areas WHERE display_id = 'lw-1' LIMIT 1;

-- Insert book tags
INSERT INTO essentia_book_tags (book_id, tag) VALUES
('33333333-3333-3333-3333-333333333301'::UUID, 'habits'),
('33333333-3333-3333-3333-333333333301'::UUID, 'productivity'),
('33333333-3333-3333-3333-333333333301'::UUID, 'self-improvement'),
('33333333-3333-3333-3333-333333333302'::UUID, 'productivity'),
('33333333-3333-3333-3333-333333333302'::UUID, 'focus'),
('33333333-3333-3333-3333-333333333302'::UUID, 'career'),
('33333333-3333-3333-3333-333333333303'::UUID, 'finance'),
('33333333-3333-3333-3333-333333333303'::UUID, 'investing'),
('33333333-3333-3333-3333-333333333303'::UUID, 'money-mindset'),
('33333333-3333-3333-3333-333333333304'::UUID, 'mental-toughness'),
('33333333-3333-3333-3333-333333333304'::UUID, 'fitness'),
('33333333-3333-3333-3333-333333333304'::UUID, 'resilience');

-- Insert book takeaways
INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('33333333-3333-3333-3333-333333333301'::UUID, 'Small habits make a big difference over time', 0),
('33333333-3333-3333-3333-333333333301'::UUID, 'Focus on systems, not goals', 1),
('33333333-3333-3333-3333-333333333301'::UUID, 'Make habits obvious, attractive, easy, and satisfying', 2),
('33333333-3333-3333-3333-333333333301'::UUID, 'Environment shapes behavior more than motivation', 3),
('33333333-3333-3333-3333-333333333302'::UUID, 'Deep work produces rare and valuable outcomes', 0),
('33333333-3333-3333-3333-333333333302'::UUID, 'Shallow work is inevitable but should be minimized', 1),
('33333333-3333-3333-3333-333333333302'::UUID, 'Schedule every minute of your day', 2),
('33333333-3333-3333-3333-333333333302'::UUID, 'Embrace boredom to strengthen focus', 3),
('33333333-3333-3333-3333-333333333303'::UUID, 'Wealth is what you don''t see', 0),
('33333333-3333-3333-3333-333333333303'::UUID, 'Enough is realizing when to stop taking risks', 1),
('33333333-3333-3333-3333-333333333303'::UUID, 'Compounding is the most powerful force', 2),
('33333333-3333-3333-3333-333333333303'::UUID, 'Save money without a specific goal', 3),
('33333333-3333-3333-3333-333333333304'::UUID, 'Mental toughness can be developed', 0),
('33333333-3333-3333-3333-333333333304'::UUID, 'Embrace discomfort to grow', 1),
('33333333-3333-3333-3333-333333333304'::UUID, 'Your mind gives up before your body', 2),
('33333333-3333-3333-3333-333333333304'::UUID, 'Accountability mirrors help you stay honest', 3);

-- Insert cards for Atomic Habits
INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text, image_url) VALUES
('44444444-4444-4444-4444-444444444401'::UUID, '33333333-3333-3333-3333-333333333301'::UUID, 'INTRO', 1, 'Welcome to Atomic Habits', 'James Clear spent years studying the science of habits. After a devastating injury ended his baseball career, he discovered that small, consistent improvements could lead to extraordinary results. This book reveals his proven system for building better habits.', 'https://via.placeholder.com/400x600/8B5CF6/FFFFFF?text=Atomic+Habits'),
('44444444-4444-4444-4444-444444444402'::UUID, '33333333-3333-3333-3333-333333333301'::UUID, 'CONCEPT', 2, 'The 1% Rule', 'If you get 1% better each day for a year, you''ll be 37 times better by the end. Small changes seem insignificant, but they compound over time. Success is the product of daily habits, not once-in-a-lifetime transformations.', 'https://via.placeholder.com/400x600/8B5CF6/FFFFFF?text=1%25+Better'),
('44444444-4444-4444-4444-444444444403'::UUID, '33333333-3333-3333-3333-333333333301'::UUID, 'CONCEPT', 3, 'Systems vs Goals', 'Winners and losers have the same goals. The difference is in their systems. Goals are about the results you want to achieve. Systems are about the processes that lead to those results. Focus on building better systems.', 'https://via.placeholder.com/400x600/8B5CF6/FFFFFF?text=Systems'),
('44444444-4444-4444-4444-444444444404'::UUID, '33333333-3333-3333-3333-333333333301'::UUID, 'QUOTE', 4, 'Identity Change', '"The ultimate form of intrinsic motivation is when a habit becomes part of your identity. It''s one thing to say I''m the type of person who wants this. It''s something very different to say I''m the type of person who is this."', 'https://via.placeholder.com/400x600/8B5CF6/FFFFFF?text=Identity'),
('44444444-4444-4444-4444-444444444405'::UUID, '33333333-3333-3333-3333-333333333301'::UUID, 'CONCEPT', 5, 'The Four Laws', 'Every habit follows the same pattern: Cue → Craving → Response → Reward. To build good habits: Make it obvious, make it attractive, make it easy, make it satisfying. To break bad habits, invert these laws.', 'https://via.placeholder.com/400x600/8B5CF6/FFFFFF?text=Four+Laws'),
('44444444-4444-4444-4444-444444444406'::UUID, '33333333-3333-3333-3333-333333333301'::UUID, 'SUMMARY', 6, 'Your Action Steps', '1. Start with a habit that takes less than 2 minutes
2. Design your environment to make good habits obvious
3. Join a culture where your desired behavior is normal
4. Never miss twice - get back on track immediately', 'https://via.placeholder.com/400x600/8B5CF6/FFFFFF?text=Take+Action');

-- Insert cards for Deep Work
INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text, image_url) VALUES
('44444444-4444-4444-4444-444444444407'::UUID, '33333333-3333-3333-3333-333333333302'::UUID, 'INTRO', 1, 'The Deep Work Hypothesis', 'Deep Work is professional activities performed in a state of distraction-free concentration that push your cognitive capabilities to their limit. These efforts create new value and improve your skill.', 'https://via.placeholder.com/400x600/3B82F6/FFFFFF?text=Deep+Work'),
('44444444-4444-4444-4444-444444444408'::UUID, '33333333-3333-3333-3333-333333333302'::UUID, 'CONCEPT', 2, 'Why Deep Work Matters', 'In our economy, three groups will thrive: those who can work with intelligent machines, those who are the best in their field, and those with capital. The first two require deep work to master complex systems and produce at an elite level.', 'https://via.placeholder.com/400x600/3B82F6/FFFFFF?text=Why+It+Matters'),
('44444444-4444-4444-4444-444444444409'::UUID, '33333333-3333-3333-3333-333333333302'::UUID, 'CONCEPT', 3, 'The Four Philosophies', 'Monastic: Eliminate all shallow work. Bimodal: Deep work in chunks. Rhythmic: Daily deep work habit. Journalistic: Fit deep work wherever you can. Choose the philosophy that fits your life.', 'https://via.placeholder.com/400x600/3B82F6/FFFFFF?text=Philosophies'),
('44444444-4444-4444-4444-444444444410'::UUID, '33333333-3333-3333-3333-333333333302'::UUID, 'SUMMARY', 4, 'Start Today', 'Schedule deep work blocks on your calendar. Quit social media. Embrace boredom instead of checking your phone. Drain the shallows from your day. Your career will thank you.', 'https://via.placeholder.com/400x600/3B82F6/FFFFFF?text=Action');

-- Insert cards for Psychology of Money
INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text, image_url) VALUES
('44444444-4444-4444-4444-444444444411'::UUID, '33333333-3333-3333-3333-333333333303'::UUID, 'INTRO', 1, 'It''s Not About Math', 'Financial success is not about what you know. It''s about how you behave. A genius who loses control of their emotions will be a financial disaster. An average person with good behavior will be wealthy.', 'https://via.placeholder.com/400x600/F59E0B/FFFFFF?text=Psychology+of+Money'),
('44444444-4444-4444-4444-444444444412'::UUID, '33333333-3333-3333-3333-333333333303'::UUID, 'CONCEPT', 2, 'Luck and Risk', 'Nothing is as good or as bad as it seems. Bill Gates and his friend both went to one of the only high schools with a computer. Bill became the richest man. His friend died in a mountaineering accident. Luck and risk are twins.', 'https://via.placeholder.com/400x600/F59E0B/FFFFFF?text=Luck'),
('44444444-4444-4444-4444-444444444413'::UUID, '33333333-3333-3333-3333-333333333303'::UUID, 'QUOTE', 3, 'Enough', '"The hardest financial skill is getting the goalpost to stop moving. Modern capitalism makes you think you need more. But the only way to know how much you need is to know when you have enough."', 'https://via.placeholder.com/400x600/F59E0B/FFFFFF?text=Enough'),
('44444444-4444-4444-4444-444444444414'::UUID, '33333333-3333-3333-3333-333333333303'::UUID, 'SUMMARY', 4, 'Build Wealth', 'Save more than you think you need. Invest in low-cost index funds. Be patient. Don''t confuse being rich (income) with being wealthy (assets). Wealth is what you don''t see.', 'https://via.placeholder.com/400x600/F59E0B/FFFFFF?text=Build+Wealth');

-- Insert cards for Cant Hurt Me
INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text, image_url) VALUES
('44444444-4444-4444-4444-444444444415'::UUID, '33333333-3333-3333-3333-333333333304'::UUID, 'INTRO', 1, 'The Impossible', 'David Goggins went from being an abused, obese young man with no future to becoming one of the world''s toughest humans - a Navy SEAL, Army Ranger, and ultramarathon runner.', 'https://via.placeholder.com/400x600/EF4444/FFFFFF?text=Cant+Hurt+Me'),
('44444444-4444-4444-4444-444444444416'::UUID, '33333333-3333-3333-3333-333333333304'::UUID, 'CONCEPT', 2, 'The 40% Rule', 'When your mind is telling you that you''re done, that you''re exhausted, that you cannot possibly go any further, you''re only actually 40% done. Your mind gives up long before your body needs to.', 'https://via.placeholder.com/400x600/EF4444/FFFFFF?text=40%25+Rule'),
('44444444-4444-4444-4444-444444444417'::UUID, '33333333-3333-3333-3333-333333333304'::UUID, 'CONCEPT', 3, 'Callusing the Mind', 'Just like your hands develop calluses from hard work, your mind can develop calluses from pushing through discomfort. Each time you do something hard, you get mentally tougher.', 'https://via.placeholder.com/400x600/EF4444/FFFFFF?text=Callusing'),
('44444444-4444-4444-4444-444444444418'::UUID, '33333333-3333-3333-3333-333333333304'::UUID, 'SUMMARY', 4, 'Take Souls', 'Outwork everyone. When people expect you to quit, keep going. When your body says stop, push through. Use the Accountability Mirror to face your demons. Become uncommon among uncommon people.', 'https://via.placeholder.com/400x600/EF4444/FFFFFF?text=Take+Souls');
