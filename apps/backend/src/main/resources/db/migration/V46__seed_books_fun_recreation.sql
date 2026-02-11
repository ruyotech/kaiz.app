-- V46: Seed Essentia Books — lw-7 Fun & Recreation (10 books)
-- Play, creativity, hobbies, joy, flow, and leisure

-- ── 1. Play ─────────────────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000007-0001-4000-8000-000000000001'::UUID, 'Play', 'Stuart Brown', 'lw-7', 'Fun & Recreation', 7, 5, 'BEGINNER',
 'Play is not frivolous — it''s essential. Neuroscientist Stuart Brown shows that play is the engine of creativity, empathy, and resilience.',
 'Neuroscientist Stuart Brown studied thousands of people''s "play histories" and concluded: play is not the opposite of work — it''s the opposite of depression. Animals that don''t play die younger. Humans who don''t play lose creativity, empathy, and joy.',
 'Play History Assessment + Play Types',
 'Write your "play history" — your earliest joyful memories of unstructured play. What activities made time disappear? Those are clues to your adult play needs.',
 2009, 4.40, 0, TRUE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000007-0001-4000-8000-000000000001'::UUID, 'play'),
('a0000007-0001-4000-8000-000000000001'::UUID, 'neuroscience'),
('a0000007-0001-4000-8000-000000000001'::UUID, 'joy');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000007-0001-4000-8000-000000000001'::UUID, 'Play is not a luxury — it''s a biological necessity. Brain scans show that play lights up the same regions as creative problem-solving.', 0),
('a0000007-0001-4000-8000-000000000001'::UUID, 'Eight play types: Body, Object, Social, Imaginative, Storytelling, Creative, Attunement, Rough-and-Tumble. Your childhood favorites predict what you need as an adult.', 1),
('a0000007-0001-4000-8000-000000000001'::UUID, 'Play deprivation in adults leads to depression, rigidity, and burnout. The "cure" is not vacation — it''s regular, unstructured play.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000007-0001-4000-8000-000000000001'::UUID, 'a0000007-0001-4000-8000-000000000001'::UUID, 'INTRO', 0, 'Play Is Not Optional', 'Stuart Brown is a psychiatrist who began studying play after a grim case: Charles Whitman, the Texas Tower sniper, had a childhood devoid of play. Brown went on to collect 6,000+ play histories and found a stunning pattern — the absence of play is not harmless. It''s dangerous.'),
('b0000007-0001-4000-8000-000000000002'::UUID, 'a0000007-0001-4000-8000-000000000001'::UUID, 'CONCEPT', 1, 'The Eight Play Personalities', 'Everyone has a dominant play type: The Joker (humor), The Kinesthete (movement), The Explorer (discovery), The Competitor (games), The Director (planning), The Collector (objects), The Artist (creation), The Storyteller (narrative). Your childhood play memories reveal your type.'),
('b0000007-0001-4000-8000-000000000003'::UUID, 'a0000007-0001-4000-8000-000000000001'::UUID, 'CONCEPT', 2, 'Play as Brain Food', 'In animal studies, rats denied play have smaller brains, more anxiety, and worse problem-solving skills. Rats allowed to play develop larger prefrontal cortexes — the region responsible for executive function and creativity. Play literally grows your brain.'),
('b0000007-0001-4000-8000-000000000004'::UUID, 'a0000007-0001-4000-8000-000000000001'::UUID, 'QUOTE', 3, 'Brown on Play', '"The opposite of play is not work — it''s depression. Play is the basis of all art, games, books, sports, movies, fashion, fun, and wonder — in short, the basis of what we think of as civilization."'),
('b0000007-0001-4000-8000-000000000005'::UUID, 'a0000007-0001-4000-8000-000000000001'::UUID, 'SUMMARY', 4, 'Reclaim Play', '1. Write your Play History: what made time disappear as a child?\n2. Identify your Play Personality (Joker, Kinesthete, Explorer, etc.).\n3. Schedule 30 minutes of unstructured play this week — NO productivity allowed.\n4. If it feels "unproductive," you''re doing it right.');

-- ── 2. Flow ──────────────────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000007-0001-4000-8000-000000000002'::UUID, 'Flow', 'Mihaly Csikszentmihalyi', 'lw-7', 'Fun & Recreation', 9, 5, 'INTERMEDIATE',
 'The psychology of optimal experience. Csikszentmihalyi''s research shows that happiness is not found in passivity but in full absorption.',
 'Mihaly Csikszentmihalyi''s landmark research reveals that the happiest moments in life are not passive — they occur when body or mind is stretched to its limits in a voluntary effort to accomplish something difficult and worthwhile. He calls this state "flow."',
 'Flow State: Challenge-Skill Balance',
 'Find one activity where your skill level and the challenge level are perfectly matched. Practice it for 30 minutes without interruption. Notice the disappearance of time.',
 1990, 4.55, 0, TRUE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000007-0001-4000-8000-000000000002'::UUID, 'flow'),
('a0000007-0001-4000-8000-000000000002'::UUID, 'psychology'),
('a0000007-0001-4000-8000-000000000002'::UUID, 'happiness');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000007-0001-4000-8000-000000000002'::UUID, 'Flow occurs when: the challenge matches your skill, you have clear goals, you get immediate feedback, and you feel a sense of control. If the challenge is too low → boredom. Too high → anxiety.', 0),
('a0000007-0001-4000-8000-000000000002'::UUID, 'Happiness is not something that happens to you — it''s something you engineer through deliberate engagement with challenging activities.', 1),
('a0000007-0001-4000-8000-000000000002'::UUID, 'Passive leisure (TV, scrolling) rarely produces flow. Active leisure (sports, music, crafts, games with clear rules) almost always does.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000007-0002-4000-8000-000000000001'::UUID, 'a0000007-0001-4000-8000-000000000002'::UUID, 'INTRO', 0, 'The Science of Optimal Experience', 'Mihaly Csikszentmihalyi (pronounced "chick-sent-me-high") spent 30 years asking a simple question: when are people happiest? The answer wasn''t "relaxing on a beach." It was during intense, absorbing activity — when challenge and skill align perfectly.'),
('b0000007-0002-4000-8000-000000000002'::UUID, 'a0000007-0001-4000-8000-000000000002'::UUID, 'CONCEPT', 1, 'The Flow Channel', 'Imagine a graph. X-axis: skill level. Y-axis: challenge level. Too much skill + low challenge = boredom. Low skill + high challenge = anxiety. But when challenge rises to meet your skill? That''s the Flow Channel — where time disappears, self-consciousness fades, and you perform at your peak.'),
('b0000007-0002-4000-8000-000000000003'::UUID, 'a0000007-0001-4000-8000-000000000002'::UUID, 'CONCEPT', 2, 'Autotelic Personality', 'An "autotelic" person does activities for their inherent enjoyment, not external rewards. They find flow in mundane situations. They transform boring tasks into challenges. This trait is learnable: approach every task asking "How can I make this more engaging?"'),
('b0000007-0002-4000-8000-000000000004'::UUID, 'a0000007-0001-4000-8000-000000000002'::UUID, 'QUOTE', 3, 'Csikszentmihalyi on Happiness', '"The best moments in our lives are not the passive, receptive, relaxing times. The best moments usually occur when a person''s body or mind is stretched to its limits in a voluntary effort to accomplish something difficult and worthwhile."'),
('b0000007-0002-4000-8000-000000000005'::UUID, 'a0000007-0001-4000-8000-000000000002'::UUID, 'SUMMARY', 4, 'Engineer Flow', '1. Identify activities where you lose track of time — these are your flow activities.\n2. Adjust difficulty: too easy → add constraints. Too hard → break into smaller steps.\n3. Eliminate interruptions during flow activities (phone off, door closed).\n4. Replace passive leisure (scrolling) with active leisure (sports, music, crafts).');

-- ── 3. Big Magic ─────────────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000007-0001-4000-8000-000000000003'::UUID, 'Big Magic', 'Elizabeth Gilbert', 'lw-7', 'Fun & Recreation', 7, 5, 'BEGINNER',
 'Creative living beyond fear. Gilbert''s manifesto frees you from perfectionism and the myth that creativity must involve suffering.',
 'Eat Pray Love author Elizabeth Gilbert argues that creativity is not reserved for geniuses. It''s available to everyone, and the only prerequisite is courage — not talent. Stop waiting for permission. Stop demanding perfection. Start making things because it''s fun.',
 'Curiosity Over Passion',
 'Forget "follow your passion" — follow your CURIOSITY instead. What are you slightly interested in today? Follow that thread. See where it leads.',
 2015, 4.40, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000007-0001-4000-8000-000000000003'::UUID, 'creativity'),
('a0000007-0001-4000-8000-000000000003'::UUID, 'fear'),
('a0000007-0001-4000-8000-000000000003'::UUID, 'inspiration');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000007-0001-4000-8000-000000000003'::UUID, 'Creativity does not require suffering, genius, or permission. It requires curiosity and the willingness to be bad at something new.', 0),
('a0000007-0001-4000-8000-000000000003'::UUID, 'Forget "follow your passion" (too much pressure). Instead: follow your curiosity. Curiosity whispers — passion screams. Listen to the whisper.', 1),
('a0000007-0001-4000-8000-000000000003'::UUID, 'Fear will always be present when you create. Gilbert''s approach: acknowledge fear, let it ride in the car, but never let it drive.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000007-0003-4000-8000-000000000001'::UUID, 'a0000007-0001-4000-8000-000000000003'::UUID, 'INTRO', 0, 'Creative Living Beyond Fear', 'Elizabeth Gilbert wrote Eat Pray Love, one of the biggest bestsellers in history. The follow-up? A book about creativity — not for artists, but for anyone who has stopped making things because they''re afraid they''re not good enough.'),
('b0000007-0003-4000-8000-000000000002'::UUID, 'a0000007-0001-4000-8000-000000000003'::UUID, 'CONCEPT', 1, 'Curiosity Over Passion', '"Follow your passion" is bad advice because it implies you''re supposed to have a burning, singular calling. Most people don''t. Instead, follow curiosity — tiny interests, slight fascinations. "I wonder what would happen if..." is the beginning of every great project.'),
('b0000007-0003-4000-8000-000000000003'::UUID, 'a0000007-0001-4000-8000-000000000003'::UUID, 'CONCEPT', 2, 'Fear Rides Shotgun', 'Gilbert doesn''t try to eliminate fear: "Dear Fear, I know you''re here. You can come on this road trip. But you don''t get to drive. You don''t get to touch the radio. And you definitely don''t get to suggest the route." Acknowledge fear — then create anyway.'),
('b0000007-0003-4000-8000-000000000004'::UUID, 'a0000007-0001-4000-8000-000000000003'::UUID, 'QUOTE', 3, 'Gilbert on Creativity', '"A creative life is an amplified life. It''s a bigger life, a happier life, an expanded life, and a hell of a lot more interesting life."'),
('b0000007-0003-4000-8000-000000000005'::UUID, 'a0000007-0001-4000-8000-000000000003'::UUID, 'SUMMARY', 4, 'Create Something Today', '1. What are you even slightly curious about? Write it down.\n2. Follow that curiosity — take ONE small action today (a class, a YouTube tutorial, a sketch).\n3. Make terrible things. Bad poems. Ugly paintings. That''s the path.\n4. The only creative rule: it has to be fun for YOU.');

-- ── 4. The Artist''s Way ─────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000007-0001-4000-8000-000000000004'::UUID, 'The Artist''s Way', 'Julia Cameron', 'lw-7', 'Fun & Recreation', 8, 5, 'BEGINNER',
 'A 12-week creativity recovery program. Cameron''s Morning Pages and Artist Dates have unblocked millions of creatives worldwide.',
 'Julia Cameron''s 12-week program has helped millions recover their creative selves. Two core tools: Morning Pages (3 pages of longhand stream-of-consciousness writing every morning) and Artist Dates (weekly solo adventures to fill your creative well).',
 'Morning Pages + Artist Dates',
 'Start tomorrow: write 3 pages by hand first thing in the morning. No editing, no stopping. Also: schedule one 2-hour solo "Artist Date" this week to a museum, park, or new part of town.',
 1992, 4.50, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000007-0001-4000-8000-000000000004'::UUID, 'creativity'),
('a0000007-0001-4000-8000-000000000004'::UUID, 'morning-pages'),
('a0000007-0001-4000-8000-000000000004'::UUID, 'self-discovery');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000007-0001-4000-8000-000000000004'::UUID, 'Morning Pages: 3 pages of longhand writing every morning. Not "writing" — brain drain. They clear mental clutter, surface hidden feelings, and unlock creative ideas.', 0),
('a0000007-0001-4000-8000-000000000004'::UUID, 'Artist Dates: a weekly 2-hour solo adventure to fill your creative well. A museum, a bookstore, a nature walk, a cooking class. Alone. No companions.', 1),
('a0000007-0001-4000-8000-000000000004'::UUID, 'Creative blocks are not lack of talent — they''re emotional wounds. Cameron''s program heals the inner critic that says "Who do you think you are?"', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000007-0004-4000-8000-000000000001'::UUID, 'a0000007-0001-4000-8000-000000000004'::UUID, 'INTRO', 0, 'Unblocking the Artist Within', 'Julia Cameron was a filmmaker who hit creative rock bottom after a painful divorce. The Artist''s Way is the recovery program she built for herself — and it has since helped millions of people rediscover their creative selves, from professional artists to accountants.'),
('b0000007-0004-4000-8000-000000000002'::UUID, 'a0000007-0001-4000-8000-000000000004'::UUID, 'CONCEPT', 1, 'Morning Pages', 'Every morning, before anything else: write 3 pages longhand, stream of consciousness. "I don''t know what to write. My coffee is cold. I''m worried about that meeting..." There is no wrong way. The magic: after a few weeks, ideas, insights, and creative impulses start appearing on the page.'),
('b0000007-0004-4000-8000-000000000003'::UUID, 'a0000007-0001-4000-8000-000000000004'::UUID, 'CONCEPT', 2, 'Artist Dates', 'Once a week, take yourself on a 2-hour solo date. A gallery. A jazz club. A nature walk. The toy section of a department store. The purpose: fill your creative well. You cannot create from an empty well. Artist Dates are playtime for your inner artist — and you must go ALONE.'),
('b0000007-0004-4000-8000-000000000004'::UUID, 'a0000007-0001-4000-8000-000000000004'::UUID, 'QUOTE', 3, 'Cameron on Creative Recovery', '"Creativity is our true nature. Blocking it is the unnatural act. We are all creative. Blocking that creativity is a learned behavior."'),
('b0000007-0004-4000-8000-000000000005'::UUID, 'a0000007-0001-4000-8000-000000000004'::UUID, 'SUMMARY', 4, 'Start the 12-Week Journey', '1. Tomorrow morning: 3 pages longhand writing before anything else.\n2. This week: schedule a 2-hour solo Artist Date (no phones, no companions).\n3. Start the 12-week program: one chapter per week with exercises.\n4. When the inner critic says "This is silly" — that means it''s working.');

-- ── 5. Joyful ────────────────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000007-0001-4000-8000-000000000005'::UUID, 'Joyful', 'Ingrid Fetell Lee', 'lw-7', 'Fun & Recreation', 7, 5, 'BEGINNER',
 'The surprising power of ordinary things. Lee discovers that joy is not just an emotion — it lives in the physical world, in shapes, colors, and textures.',
 'Designer Ingrid Fetell Lee discovered that joy has a physical component — certain shapes (round), colors (bright), textures (soft), and patterns (playful) consistently trigger joy across cultures. Your environment is either a joy source or a joy drain.',
 'Ten Aesthetics of Joy',
 'Look around your room right now. What brings you joy? What drains it? Add one small joyful element today: a plant, a colorful mug, or rearrange something.',
 2018, 4.35, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000007-0001-4000-8000-000000000005'::UUID, 'joy'),
('a0000007-0001-4000-8000-000000000005'::UUID, 'design'),
('a0000007-0001-4000-8000-000000000005'::UUID, 'environment');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000007-0001-4000-8000-000000000005'::UUID, 'Joy lives in the physical world: round shapes, bright colors, symmetry, abundance, and nature consistently trigger joy across all cultures.', 0),
('a0000007-0001-4000-8000-000000000005'::UUID, 'The 10 Aesthetics of Joy: Energy, Abundance, Freedom, Harmony, Play, Surprise, Transcendence, Magic, Celebration, Renewal.', 1),
('a0000007-0001-4000-8000-000000000005'::UUID, 'Small environmental changes — a colorful pillow, a plant, a round vase — create disproportionate emotional impact. Your space shapes your mood.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000007-0005-4000-8000-000000000001'::UUID, 'a0000007-0001-4000-8000-000000000005'::UUID, 'INTRO', 0, 'Joy Has a Shape', 'Designer Ingrid Fetell Lee noticed something strange: certain physical objects — balloons, rainbow sprinkles, tree houses — made everyone smile. She spent 10 years researching why, and discovered that joy is not just an emotion. It has a physical fingerprint.'),
('b0000007-0005-4000-8000-000000000002'::UUID, 'a0000007-0001-4000-8000-000000000005'::UUID, 'CONCEPT', 1, 'The Aesthetics of Joy', 'Round shapes = safe (no sharp edges — our brain relaxes). Bright colors = energy (think confetti, flowers, coral reefs). Symmetry = harmony (our brain loves patterns). Nature = renewal (green spaces lower cortisol). These are universal — not cultural — joy triggers.'),
('b0000007-0005-4000-8000-000000000003'::UUID, 'a0000007-0001-4000-8000-000000000005'::UUID, 'CONCEPT', 2, 'Design Joy Into Your Space', 'Most people design for function or aesthetics. Lee says: design for JOY. Put a bright throw pillow on a neutral couch. Add a plant to your desk. Use round containers instead of square ones. Paint one wall a warm color. Tiny changes create outsized emotional shifts.'),
('b0000007-0005-4000-8000-000000000004'::UUID, 'a0000007-0001-4000-8000-000000000005'::UUID, 'QUOTE', 3, 'Lee on Joy', '"Joy is not a luxury. It''s not something to pursue after everything else is taken care of. Joy is a basic human need, and the physical world around us is its greatest untapped source."'),
('b0000007-0005-4000-8000-000000000005'::UUID, 'a0000007-0001-4000-8000-000000000005'::UUID, 'SUMMARY', 4, 'Add Joy to Your World', '1. Audit your space: what objects bring you joy? What feels heavy or dull?\n2. Add one joyful element today: a plant, a bright mug, a funny poster.\n3. Seek round shapes, bright colors, and nature in your daily environment.\n4. Remember: joy isn''t earned. It''s designed.');

-- ── 6. Stolen Focus ──────────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000007-0001-4000-8000-000000000006'::UUID, 'Stolen Focus', 'Johann Hari', 'lw-7', 'Fun & Recreation', 8, 5, 'INTERMEDIATE',
 'Why you can''t pay attention — and how to think deeply again. Hari exposes the 12 factors destroying our focus and enjoyment of life.',
 'Johann Hari investigates the global attention crisis and finds 12 causes — from social media to pollution to sleep deprivation. The solution is not individual willpower but systemic change AND personal strategies to reclaim the deep focus that makes life enjoyable.',
 'Twelve Causes of Lost Focus',
 'This week, try one "focus experiment": put your phone in another room for 2 hours while doing something you enjoy. Notice how your experience of that activity changes.',
 2022, 4.45, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000007-0001-4000-8000-000000000006'::UUID, 'focus'),
('a0000007-0001-4000-8000-000000000006'::UUID, 'attention'),
('a0000007-0001-4000-8000-000000000006'::UUID, 'digital-wellness');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000007-0001-4000-8000-000000000006'::UUID, 'We haven''t lost discipline — our attention has been STOLEN. Tech companies invest billions in capturing your focus. Individual willpower is not enough.', 0),
('a0000007-0001-4000-8000-000000000006'::UUID, 'Flow states are the antidote: deep engagement with one activity makes you immune to distraction. But you need at least 15 uninterrupted minutes to enter flow.', 1),
('a0000007-0001-4000-8000-000000000006'::UUID, 'Sleep, nutrition, and exercise are focus prerequisites. You can''t hack attention on 5 hours of sleep and a sugar crash. Fix the fundamentals first.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000007-0006-4000-8000-000000000001'::UUID, 'a0000007-0001-4000-8000-000000000006'::UUID, 'INTRO', 0, 'Your Attention Was Stolen', 'Johann Hari couldn''t read a book without checking his phone. So he went on a three-month digital detox in Provincetown, Massachusetts, and investigated: why is everyone losing the ability to focus? The answer was bigger — and scarier — than he expected.'),
('b0000007-0006-4000-8000-000000000002'::UUID, 'a0000007-0001-4000-8000-000000000006'::UUID, 'CONCEPT', 1, 'Twelve Thieves of Focus', 'Speed: we switch tasks every 65 seconds on average. Flow collapse: constant interruptions prevent deep engagement. Sleep: 40% of Americans are sleep-deprived. Social media: designed to exploit your attention. These aren''t separate problems — they compound.'),
('b0000007-0006-4000-8000-000000000003'::UUID, 'a0000007-0001-4000-8000-000000000006'::UUID, 'CONCEPT', 2, 'Reclaim Your Focus', 'Three levels of recovery: 1. Personal: phone in another room during focus time, no notifications during meals, protect sleep. 2. Social: discuss screen habits with family, create phone-free zones. 3. Systemic: support regulation of attention-exploiting algorithms. All three matter.'),
('b0000007-0006-4000-8000-000000000004'::UUID, 'a0000007-0001-4000-8000-000000000006'::UUID, 'QUOTE', 3, 'Hari on Attention', '"Your attention didn''t collapse. It was stolen. By powerful forces that profit from keeping you distracted. To get it back, you need to understand how it was taken."'),
('b0000007-0006-4000-8000-000000000005'::UUID, 'a0000007-0001-4000-8000-000000000006'::UUID, 'SUMMARY', 4, 'Protect Your Attention', '1. Create a daily "focus block" — 90 minutes with phone in another room.\n2. Protect your sleep: 7-8 hours, no screens 1 hour before bed.\n3. Replace passive scrolling with active recreation (cooking, sports, music).\n4. If you can''t focus for 15 minutes, start with 5. Build the muscle.');

-- ── 7. The Power of Fun ─────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000007-0001-4000-8000-000000000007'::UUID, 'The Power of Fun', 'Catherine Price', 'lw-7', 'Fun & Recreation', 7, 5, 'BEGINNER',
 'Most of what you think is "fun" isn''t. Price defines true fun as the intersection of playfulness, connection, and flow — and shows how to get more of it.',
 'Catherine Price discovered that most adults confuse "fun" with passive entertainment. True Fun, she argues, is the intersection of three elements: Playfulness (not taking things seriously), Connection (shared experience with others), and Flow (absorption in the moment).',
 'True Fun = Playfulness + Connection + Flow',
 'Keep a "Fun Times Journal" for one week. Note when you experience True Fun (all three: playfulness, connection, flow present). See what patterns emerge.',
 2021, 4.40, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000007-0001-4000-8000-000000000007'::UUID, 'fun'),
('a0000007-0001-4000-8000-000000000007'::UUID, 'play'),
('a0000007-0001-4000-8000-000000000007'::UUID, 'screen-time');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000007-0001-4000-8000-000000000007'::UUID, 'True Fun = Playfulness + Connection + Flow. All three must be present. Scrolling social media has none. Playing a board game with friends has all three.', 0),
('a0000007-0001-4000-8000-000000000007'::UUID, '"Fake fun" — passive activities that feel fun in the moment but leave you empty (binge-watching, doom-scrolling) — displaces True Fun from your life.', 1),
('a0000007-0001-4000-8000-000000000007'::UUID, 'Fun is not frivolous — it reduces stress, deepens relationships, and increases life satisfaction more than relaxation or passive entertainment.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000007-0007-4000-8000-000000000001'::UUID, 'a0000007-0001-4000-8000-000000000007'::UUID, 'INTRO', 0, 'Fun Is Not What You Think', 'Catherine Price is a science journalist who realized she couldn''t remember the last time she had real fun. She spent years studying what "fun" actually means and discovered that most adults have forgotten — and replaced it with passive entertainment that only mimics fun.'),
('b0000007-0007-4000-8000-000000000002'::UUID, 'a0000007-0001-4000-8000-000000000007'::UUID, 'CONCEPT', 1, 'The True Fun Framework', 'True Fun sits at the intersection of three elements: PLAYFULNESS (lighthearted, not taking things seriously), CONNECTION (shared experience with others), and FLOW (absorption, losing track of time). If one is missing, you have good-not-great fun. If all three are present? Unforgettable.'),
('b0000007-0007-4000-8000-000000000003'::UUID, 'a0000007-0001-4000-8000-000000000007'::UUID, 'CONCEPT', 2, 'The Fun Audit', 'Track your activities for a week. Rate each on Playfulness, Connection, and Flow. Notice: the activities with the highest scores are probably NOT what you spend most time on. Scrolling = 0-0-0. Game night with friends = 3-3-3. The audit reveals where to redirect your leisure time.'),
('b0000007-0007-4000-8000-000000000004'::UUID, 'a0000007-0001-4000-8000-000000000007'::UUID, 'QUOTE', 3, 'Price on True Fun', '"We have been duped into thinking that fun is a luxury, something for children and irresponsible adults. In reality, fun is a vital nutrient that most of us are critically deficient in."'),
('b0000007-0007-4000-8000-000000000005'::UUID, 'a0000007-0001-4000-8000-000000000007'::UUID, 'SUMMARY', 4, 'Have More True Fun', '1. Define your "Fun Magnets" — people, activities, and settings that trigger True Fun.\n2. Reduce "Fake Fun": set screen time limits, unfollow accounts that waste your time.\n3. Schedule one True Fun activity per week: game night, pickup sports, cooking together.\n4. Keep a Fun Times Journal — note when all three elements align.');

-- ── 8. Rest ──────────────────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000007-0001-4000-8000-000000000008'::UUID, 'Rest', 'Alex Soojung-Kim Pang', 'lw-7', 'Fun & Recreation', 7, 5, 'INTERMEDIATE',
 'Rest is not the absence of work — it''s a skill. Pang shows that history''s most creative people worked 4-5 hours a day and rested deliberately.',
 'Alex Pang reveals a counterintuitive truth: history''s most prolific creators — Darwin, Dickens, Poincaré — worked only 4-5 hours per day. Their secret? They treated rest as a skill, not as the absence of work. Deliberate rest amplifies creativity and productivity.',
 'Deliberate Rest: Active Recovery',
 'Schedule deliberate rest: a daily walk, a weekly hobby session, an annual sabbatical. Rest is not "doing nothing" — it''s doing something restorative.',
 2016, 4.35, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000007-0001-4000-8000-000000000008'::UUID, 'rest'),
('a0000007-0001-4000-8000-000000000008'::UUID, 'productivity'),
('a0000007-0001-4000-8000-000000000008'::UUID, 'recovery');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000007-0001-4000-8000-000000000008'::UUID, 'History''s most creative people worked 4-5 hours a day — then rested DELIBERATELY. Long walks, naps, hobbies, and vacations were not breaks FROM work but essential parts OF it.', 0),
('a0000007-0001-4000-8000-000000000008'::UUID, 'Four key rest practices: morning routine (focused work early), walking (ideas emerge during motion), napping (consolidates learning), deep play (challenging hobbies that use different skills than work).', 1),
('a0000007-0001-4000-8000-000000000008'::UUID, 'Rest is a SKILL, not an entitlement. You must practice and protect it. Schedule rest like you schedule meetings — or it won''t happen.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000007-0008-4000-8000-000000000001'::UUID, 'a0000007-0001-4000-8000-000000000008'::UUID, 'INTRO', 0, 'The Paradox of Rest', 'Charles Darwin worked 3-4 hours a day. Dickens worked 5. Poincaré, 4. These were among the most prolific minds in history. Their secret was not discipline — it was rest. Deliberate, structured, active rest.'),
('b0000007-0008-4000-8000-000000000002'::UUID, 'a0000007-0001-4000-8000-000000000008'::UUID, 'CONCEPT', 1, 'Deliberate Rest', 'Passive rest (collapsing on the couch) restores energy but not creativity. Deliberate rest — walking, hobbies, napping — actively ENHANCES cognitive performance. Your brain doesn''t stop working during rest; it shifts to "default mode network" — where insight and creativity happen.'),
('b0000007-0008-4000-8000-000000000003'::UUID, 'a0000007-0001-4000-8000-000000000008'::UUID, 'CONCEPT', 2, 'Deep Play', 'The most restful activity is "deep play" — a challenging hobby that uses DIFFERENT skills than your work. A CEO who rock climbs. A surgeon who paints. A programmer who plays jazz. Deep play provides the challenge and flow of work but restores instead of depleting.'),
('b0000007-0008-4000-8000-000000000004'::UUID, 'a0000007-0001-4000-8000-000000000008'::UUID, 'QUOTE', 3, 'Pang on Rest', '"Rest is not work''s adversary. Rest is work''s partner. They complement and complete each other. You cannot work well without resting well."'),
('b0000007-0008-4000-8000-000000000005'::UUID, 'a0000007-0001-4000-8000-000000000008'::UUID, 'SUMMARY', 4, 'Rest Deliberately', '1. Do your most important work in a 4-hour morning block.\n2. Take a 20-30 minute walk after lunch — every day.\n3. Find your "deep play" — a challenging hobby that uses different skills than work.\n4. Nap 10-20 minutes when you hit an afternoon wall. It works.');

-- ── 9. Do Nothing ────────────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000007-0001-4000-8000-000000000009'::UUID, 'Do Nothing', 'Celeste Headlee', 'lw-7', 'Fun & Recreation', 7, 5, 'BEGINNER',
 'How to break free from overwork, overdoing, and underliving. Headlee traces our obsession with productivity to its toxic roots.',
 'Celeste Headlee traces the cult of productivity to the Industrial Revolution and shows that it has made us miserable, not successful. We work more hours than medieval peasants. The solution: stop measuring your worth by your output and rediscover the art of doing nothing.',
 'Anti-Productivity Framework',
 'Schedule one hour of "nothing" this week — no phone, no tasks, no goals. Stare out the window. Walk without a destination. Let yourself be bored.',
 2020, 4.30, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000007-0001-4000-8000-000000000009'::UUID, 'anti-hustle'),
('a0000007-0001-4000-8000-000000000009'::UUID, 'burnout'),
('a0000007-0001-4000-8000-000000000009'::UUID, 'leisure');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000007-0001-4000-8000-000000000009'::UUID, 'We work more hours now than medieval peasants — and we''re not happier. The cult of productivity is a historical accident, not a natural state.', 0),
('a0000007-0001-4000-8000-000000000009'::UUID, 'Idleness is not laziness — it''s essential for creativity and mental health. The brain needs unstructured time to process, integrate, and generate ideas.', 1),
('a0000007-0001-4000-8000-000000000009'::UUID, 'The most radical act in a productivity-obsessed culture: do something for no reason other than enjoyment. No "side hustle" angle. No "content creation." Just joy.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000007-0009-4000-8000-000000000001'::UUID, 'a0000007-0001-4000-8000-000000000009'::UUID, 'INTRO', 0, 'Stop Hustling', 'Celeste Headlee is a journalist who noticed something disturbing: even her friends'' hobbies had become "side hustles." Knitting became an Etsy shop. Running became an Instagram brand. We''ve forgotten how to do things purely for pleasure — and it''s making us miserable.'),
('b0000007-0009-4000-8000-000000000002'::UUID, 'a0000007-0001-4000-8000-000000000009'::UUID, 'CONCEPT', 1, 'The Productivity Trap', 'The average American works 47 hours per week — and feels guilty about resting. Medieval peasants worked about 150 days per year, with extensive holidays and festivals. We''ve been sold a lie that more work = more value. The data says: more work = less creativity and more burnout.'),
('b0000007-0009-4000-8000-000000000003'::UUID, 'a0000007-0001-4000-8000-000000000009'::UUID, 'CONCEPT', 2, 'Reclaim Leisure', 'True leisure is not "time off from work." It''s a state of mind: engaging in activities purely for their own sake. Not to be productive. Not to build a brand. Not to "level up." Just to enjoy. This is the hardest thing for a modern person to do — and the most necessary.'),
('b0000007-0009-4000-8000-000000000004'::UUID, 'a0000007-0001-4000-8000-000000000009'::UUID, 'QUOTE', 3, 'Headlee on Rest', '"We have created a culture in which busyness is a badge of honor and rest is a sign of weakness. This is not just wrong — it''s making us sick."'),
('b0000007-0009-4000-8000-000000000005'::UUID, 'a0000007-0001-4000-8000-000000000009'::UUID, 'SUMMARY', 4, 'Permission to Do Nothing', '1. Set a daily "nothing time" — even 15 minutes of unstructured idleness.\n2. Pursue a hobby with ZERO monetization potential. Do it badly. Do it for fun.\n3. Stop measuring your worth by your output.\n4. When you feel guilty about resting, remember: you are a human being, not a human doing.');

-- ── 10. The Happiness Project ───────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000007-0001-4000-8000-000000000010'::UUID, 'The Happiness Project', 'Gretchen Rubin', 'lw-7', 'Fun & Recreation', 7, 5, 'BEGINNER',
 'One woman''s year-long experiment in happiness. Rubin tests the science of well-being with practical monthly challenges.',
 'Gretchen Rubin decided to spend a year systematically testing what makes people happy. Each month she tackled a different area: energy, marriage, work, play, friends, money, mindfulness. Her approach: small, concrete actions rather than dramatic life overhauls.',
 'Monthly Happiness Resolutions',
 'Pick one area of your life this month (energy, relationships, fun, etc.) and create 3-4 small, specific resolutions to test. Track daily.',
 2009, 4.35, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000007-0001-4000-8000-000000000010'::UUID, 'happiness'),
('a0000007-0001-4000-8000-000000000010'::UUID, 'experiments'),
('a0000007-0001-4000-8000-000000000010'::UUID, 'self-improvement');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000007-0001-4000-8000-000000000010'::UUID, 'Happiness doesn''t require dramatic change. Small daily habits — going to bed earlier, singing in the morning, making your bed — compound into genuine well-being.', 0),
('a0000007-0001-4000-8000-000000000010'::UUID, 'Rubin''s "Four Tendencies": Upholder (meets inner + outer expectations), Questioner (inner only), Obliger (outer only), Rebel (neither). Know your tendency to design better habits.', 1),
('a0000007-0001-4000-8000-000000000010'::UUID, '"The days are long, but the years are short." Don''t postpone happiness to some future milestone. The life you have now is the one to optimize.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000007-0010-4000-8000-000000000001'::UUID, 'a0000007-0001-4000-8000-000000000010'::UUID, 'INTRO', 0, 'A Year of Experiments', 'Gretchen Rubin had a good life — loving husband, two daughters, successful career. But she realized she wasn''t as happy as she could be. So she did what any rational person would: she read 200+ books on happiness, created a 12-month experiment, and tracked everything.'),
('b0000007-0010-4000-8000-000000000002'::UUID, 'a0000007-0001-4000-8000-000000000010'::UUID, 'CONCEPT', 1, 'Small Resolutions, Big Impact', 'January: energy (go to bed earlier, exercise, clear clutter). February: marriage (no nagging, surprise gestures). March: work (launch a blog). Each month, 3-4 tiny, specific resolutions. Tracked on a daily scorecard. The compound effect over 12 months was transformative.'),
('b0000007-0010-4000-8000-000000000003'::UUID, 'a0000007-0001-4000-8000-000000000010'::UUID, 'CONCEPT', 2, 'Know Your Tendency', 'Rubin''s "Four Tendencies" framework: How do you respond to expectations? Upholders meet ALL expectations (both inner and outer). Questioners only meet expectations that make sense to them. Obligers meet outer expectations but struggle with inner ones. Rebels resist all expectations. Your tendency determines your ideal habit strategy.'),
('b0000007-0010-4000-8000-000000000004'::UUID, 'a0000007-0001-4000-8000-000000000010'::UUID, 'QUOTE', 3, 'Rubin on Happiness', '"The days are long, but the years are short. Don''t wait for happiness — it''s not coming to find you. Go out and build it, one small resolution at a time."'),
('b0000007-0010-4000-8000-000000000005'::UUID, 'a0000007-0001-4000-8000-000000000010'::UUID, 'SUMMARY', 4, 'Start Your Own Project', '1. Pick one area of life to focus on this month.\n2. Create 3-4 tiny, concrete resolutions (not "be happier" but "go to bed by 10 PM").\n3. Track daily on a scorecard.\n4. Next month, keep those resolutions and add a new area. Compound the happiness.');
