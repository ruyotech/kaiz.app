-- V47: Seed Essentia Books — lw-8 Environment & Home (10 books)
-- Organization, home design, sustainability, spaces, and living environment

-- ── 1. The Life-Changing Magic of Tidying Up ────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000008-0001-4000-8000-000000000001'::UUID, 'The Life-Changing Magic of Tidying Up', 'Marie Kondo', 'lw-8', 'Environment & Home', 7, 5, 'BEGINNER',
 'The KonMari method. Kondo''s radical approach: keep only what "sparks joy" and let go of everything else — transforming your space and your life.',
 'Marie Kondo''s KonMari method has revolutionized how millions think about their possessions. The core principle: hold every item and ask "Does this spark joy?" If yes, keep it. If no, thank it and let it go. Tidy by category (not location), and tidy once — completely.',
 'KonMari Method: Joy-Based Decluttering',
 'Start with clothes. Take EVERY piece of clothing you own and pile it in one spot. Hold each item. Does it spark joy? If yes, keep. If no, thank and donate. This is category one of five.',
 2011, 4.40, 0, TRUE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000008-0001-4000-8000-000000000001'::UUID, 'organization'),
('a0000008-0001-4000-8000-000000000001'::UUID, 'minimalism'),
('a0000008-0001-4000-8000-000000000001'::UUID, 'decluttering');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000008-0001-4000-8000-000000000001'::UUID, 'The question is not "What should I throw away?" but "What do I want to keep?" Shift from elimination to selection — choose joy.', 0),
('a0000008-0001-4000-8000-000000000001'::UUID, 'Tidy by CATEGORY, not by room: 1. Clothes, 2. Books, 3. Papers, 4. Komono (miscellaneous), 5. Sentimental items. This order builds your "joy-sensing" muscle.', 1),
('a0000008-0001-4000-8000-000000000001'::UUID, 'Every item you own demands your energy — storing, cleaning, thinking about it. Letting go of what doesn''t spark joy frees mental bandwidth you didn''t know was occupied.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000008-0001-4000-8000-000000000001'::UUID, 'a0000008-0001-4000-8000-000000000001'::UUID, 'INTRO', 0, 'The Joy Test', 'Marie Kondo began organizing at age 5. By 15 she had read every organizing book ever published. The KonMari method is what emerged — a radical departure from traditional organizing that doesn''t ask "Do I need this?" but "Does this spark joy?"'),
('b0000008-0001-4000-8000-000000000002'::UUID, 'a0000008-0001-4000-8000-000000000001'::UUID, 'CONCEPT', 1, 'Tidy by Category', 'Most people tidy room by room — bedroom today, kitchen tomorrow. This fails because the same categories are scattered everywhere. Instead: gather ALL clothes from every room into one pile. Then ALL books. This reveals the true volume of what you own — and makes decisions clearer.'),
('b0000008-0001-4000-8000-000000000003'::UUID, 'a0000008-0001-4000-8000-000000000001'::UUID, 'CONCEPT', 2, 'Thank and Release', 'When you decide to let go of an item, hold it and say "Thank you for your service." This isn''t just politeness — it''s psychological closure. You''re acknowledging the item''s purpose (warmth, education, enjoyment) and releasing it with gratitude instead of guilt.'),
('b0000008-0001-4000-8000-000000000004'::UUID, 'a0000008-0001-4000-8000-000000000001'::UUID, 'QUOTE', 3, 'Kondo on Joy', '"The question of what you want to own is actually the question of how you want to live your life. Keep only those things that speak to your heart."'),
('b0000008-0001-4000-8000-000000000005'::UUID, 'a0000008-0001-4000-8000-000000000001'::UUID, 'SUMMARY', 4, 'The KonMari Method', '1. Commit to tidying completely — not "a little at a time."\n2. Follow the order: Clothes → Books → Papers → Komono → Sentimental.\n3. For each item, hold it and ask: "Does this spark joy?"\n4. Everything you keep must have a designated home. No homeless objects.');

-- ── 2. Atomic Habits (Environment Design) ───────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000008-0001-4000-8000-000000000002'::UUID, 'Atomic Habits (Environment Design)', 'James Clear', 'lw-8', 'Environment & Home', 7, 5, 'BEGINNER',
 'The environment design chapter from Atomic Habits. Clear shows that your environment is the invisible hand shaping every habit.',
 'James Clear''s Atomic Habits dedicates a powerful chapter to environment design: the idea that you don''t rise to the level of your goals — you fall to the level of your systems. And your physical environment IS your most powerful system.',
 'Environment as Habit Architecture',
 'Redesign one room to support your goals: put fruit on the counter (health), books on the nightstand (reading), gym bag by the door (exercise). Make good habits obvious.',
 2018, 4.65, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000008-0001-4000-8000-000000000002'::UUID, 'habits'),
('a0000008-0001-4000-8000-000000000002'::UUID, 'environment-design'),
('a0000008-0001-4000-8000-000000000002'::UUID, 'behavior-change');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000008-0001-4000-8000-000000000002'::UUID, 'Every habit is initiated by a cue. Most cues are visual. Redesign your environment to make good cues obvious and bad cues invisible.', 0),
('a0000008-0001-4000-8000-000000000002'::UUID, 'You don''t need more discipline — you need a better environment. Put the guitar in the living room (you''ll play it), put the TV remote in a drawer (you''ll watch less).', 1),
('a0000008-0001-4000-8000-000000000002'::UUID, '"One space, one use." If you work, eat, and relax in the same spot, your brain can''t distinguish between activities. Assign zones to specific behaviors.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000008-0002-4000-8000-000000000001'::UUID, 'a0000008-0001-4000-8000-000000000002'::UUID, 'INTRO', 0, 'Your Environment Decides For You', 'You think you choose your habits. You don''t. Your environment does. James Clear shows that the most disciplined people aren''t more willful — they''ve structured their surroundings so the right choice is the easiest choice.'),
('b0000008-0002-4000-8000-000000000002'::UUID, 'a0000008-0001-4000-8000-000000000002'::UUID, 'CONCEPT', 1, 'Make It Obvious / Invisible', 'Good habits: make cues visible. Water bottle on your desk = more water. Running shoes by the door = more runs. Bad habits: hide cues. Phone charger in another room = less scrolling. Junk food on the top shelf behind the oats = less snacking. The environment does the work.'),
('b0000008-0002-4000-8000-000000000003'::UUID, 'a0000008-0001-4000-8000-000000000002'::UUID, 'CONCEPT', 2, 'Context Encoding', 'Your brain links behaviors to locations. If you watch TV in bed, your brain associates the bed with wakefulness. If you only work at a specific desk, your brain enters "work mode" when you sit there. Solution: "One space, one use." Separate your contexts.'),
('b0000008-0002-4000-8000-000000000004'::UUID, 'a0000008-0001-4000-8000-000000000002'::UUID, 'QUOTE', 3, 'Clear on Environment', '"You do not rise to the level of your goals. You fall to the level of your systems. And your environment is the most powerful system you have."'),
('b0000008-0002-4000-8000-000000000005'::UUID, 'a0000008-0001-4000-8000-000000000002'::UUID, 'SUMMARY', 4, 'Redesign Your Space', '1. Walk through your home. For each room, ask: "What behavior does this room encourage?"\n2. Make good-habit cues visible: fruit on counter, book on pillow, yoga mat unrolled.\n3. Make bad-habit cues invisible: phone charger in another room, no TV in bedroom.\n4. One space, one use: sleep in the bedroom, work at the desk, eat at the table.');

-- ── 3. Essentialism ─────────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000008-0001-4000-8000-000000000003'::UUID, 'Essentialism', 'Greg McKeown', 'lw-8', 'Environment & Home', 8, 5, 'INTERMEDIATE',
 'The disciplined pursuit of less. McKeown argues that doing fewer things better is the path to contribution, meaning, and a less cluttered life.',
 'Greg McKeown argues that the modern disease is "the undisciplined pursuit of more." Essentialism is the antidote: systematically identifying the vital few activities that create the highest contribution, and eliminating everything else — in your schedule, your possessions, and your commitments.',
 'Less but Better — Edited Life Design',
 'Audit your commitments this week. For each one, ask: "If I wasn''t already doing this, would I say yes today?" If no, it''s a candidate for elimination.',
 2014, 4.55, 0, TRUE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000008-0001-4000-8000-000000000003'::UUID, 'essentialism'),
('a0000008-0001-4000-8000-000000000003'::UUID, 'minimalism'),
('a0000008-0001-4000-8000-000000000003'::UUID, 'focus');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000008-0001-4000-8000-000000000003'::UUID, '"If it isn''t a clear YES, it''s a clear NO." Apply this filter to commitments, possessions, and opportunities. The pain of saying no is less than the pain of overcommitment.', 0),
('a0000008-0001-4000-8000-000000000003'::UUID, 'Essentialism is not about doing LESS — it''s about doing the RIGHT things. Identify the 20% of activities that produce 80% of your results and go all-in.', 1),
('a0000008-0001-4000-8000-000000000003'::UUID, 'Your environment reflects your priorities. A cluttered space = cluttered mind = cluttered schedule. Simplify all three simultaneously.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000008-0003-4000-8000-000000000001'::UUID, 'a0000008-0001-4000-8000-000000000003'::UUID, 'INTRO', 0, 'The Disciplined Pursuit of Less', 'Greg McKeown asked Silicon Valley executives: "What happens when successful people get more options and opportunities?" Answer: they say yes to too many things and dilute their impact. Essentialism is the systematic correction.'),
('b0000008-0003-4000-8000-000000000002'::UUID, 'a0000008-0001-4000-8000-000000000003'::UUID, 'CONCEPT', 1, 'The 90% Rule', 'When evaluating an opportunity, give it a score from 0-100. If it''s below 90, it''s a 0. Only "HELL YES!" opportunities deserve your time and energy. Everything else is a distraction disguised as an opportunity. Apply this to: job offers, social invitations, purchases, and projects.'),
('b0000008-0003-4000-8000-000000000003'::UUID, 'a0000008-0001-4000-8000-000000000003'::UUID, 'CONCEPT', 2, 'Edit Your Life', 'An editor makes a film great by cutting scenes — even good ones. An essentialist does the same with life: cut good-but-not-great activities, possessions, and commitments to make room for the truly essential. Editing is not subtraction — it''s refinement.'),
('b0000008-0003-4000-8000-000000000004'::UUID, 'a0000008-0001-4000-8000-000000000003'::UUID, 'QUOTE', 3, 'McKeown on Priorities', '"If you don''t prioritize your life, someone else will. The word ''priority'' was singular until the 1900s — it meant THE one thing. Now we have ''priorities.'' The very concept is an oxymoron."'),
('b0000008-0003-4000-8000-000000000005'::UUID, 'a0000008-0001-4000-8000-000000000003'::UUID, 'SUMMARY', 4, 'Apply the Essential Filter', '1. Use the 90% Rule: if it''s not a 90+, it''s a 0.\n2. Audit: list all commitments. For each: "Would I sign up for this TODAY?" If no → exit.\n3. Create buffers: schedule 50% more time than you think you need.\n4. Protect whitespace in your schedule and your home — space is not wasted, it''s essential.');

-- ── 4. Goodbye, Things ──────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000008-0001-4000-8000-000000000004'::UUID, 'Goodbye, Things', 'Fumio Sasaki', 'lw-8', 'Environment & Home', 6, 5, 'BEGINNER',
 'The Japanese art of radical minimalism. Sasaki went from a cluttered apartment to owning 150 items — and found freedom, not deprivation.',
 'Fumio Sasaki was a miserable, cluttered hoarder who transformed his life by reducing his possessions to the essentials. His thesis: our things don''t make us happy — they''re anchors disguised as treasures. Letting go of things creates space for experiences.',
 '55 Tips for Letting Go',
 'Pick one drawer. Remove everything that you haven''t used in the past year. That''s it. Start there.',
 2015, 4.25, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000008-0001-4000-8000-000000000004'::UUID, 'minimalism'),
('a0000008-0001-4000-8000-000000000004'::UUID, 'japan'),
('a0000008-0001-4000-8000-000000000004'::UUID, 'letting-go');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000008-0001-4000-8000-000000000004'::UUID, 'You are not your things. Possessions create the illusion of identity — "I''m the person who owns these books" — but they are just storage, not self.', 0),
('a0000008-0001-4000-8000-000000000004'::UUID, 'Most things you own exist in a "someday" category: "I might need this someday." Someday never comes. The cost of storing "someday" items is real.', 1),
('a0000008-0001-4000-8000-000000000004'::UUID, 'Minimalism is not deprivation — it''s clarity. When you own less, you notice more. You appreciate more. You have more space for experiences.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000008-0004-4000-8000-000000000001'::UUID, 'a0000008-0001-4000-8000-000000000004'::UUID, 'INTRO', 0, 'A Hoarder''s Awakening', 'Fumio Sasaki''s apartment was filled wall-to-wall with books, DVDs, clothes, and gadgets. He was unhappy, comparing himself to others on social media. Then he discovered minimalism and began letting go. A year later, he owned 150 items and was happier than ever.'),
('b0000008-0004-4000-8000-000000000002'::UUID, 'a0000008-0001-4000-8000-000000000004'::UUID, 'CONCEPT', 1, 'You Are Not Your Things', 'We buy things to express identity: "I''m cultured" (books), "I''m fit" (exercise equipment), "I''m successful" (expensive clothes). But owning these things doesn''t make any of it true. Your identity lives in your ACTIONS, not your possessions. Let go of the props.'),
('b0000008-0004-4000-8000-000000000003'::UUID, 'a0000008-0001-4000-8000-000000000004'::UUID, 'CONCEPT', 2, 'The Minimalist Shift', 'Before minimalism: Sasaki spent weekends cleaning, organizing, and shopping. After: he spends weekends walking, reading in cafes, and meeting friends. The time you save by owning less is enormous — no cleaning, no organizing, no deciding what to wear from 80 options.'),
('b0000008-0004-4000-8000-000000000004'::UUID, 'a0000008-0001-4000-8000-000000000004'::UUID, 'QUOTE', 3, 'Sasaki on Possessions', '"The things we own end up owning us. We think we possess our things, but our things possess our time, our space, and our attention."'),
('b0000008-0004-4000-8000-000000000005'::UUID, 'a0000008-0001-4000-8000-000000000004'::UUID, 'SUMMARY', 4, 'Start Letting Go', '1. Pick one category today: clothes, books, kitchen gadgets.\n2. Remove anything unused in the past year.\n3. "Someday" items → donate or discard. Someday never comes.\n4. Notice what happens: more space, more time, more clarity.');

-- ── 5. The Home Edit ────────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000008-0001-4000-8000-000000000005'::UUID, 'The Home Edit', 'Clea Shearer & Joanna Teplin', 'lw-8', 'Environment & Home', 6, 5, 'BEGINNER',
 'A practical, colorful guide to home organization. The ROYGBIV method turns organizing into a joyful, visual experience.',
 'Netflix stars Clea Shearer and Joanna Teplin bring color-coded, visually stunning organization to every room. Their STAR method (Sort, Toss, Arrange, Revise) combined with rainbow color ordering makes organizing feel less like a chore and more like an art project.',
 'STAR Method + ROYGBIV Color Coding',
 'Pick one shelf. Sort everything into categories. Toss what''s expired or unused. Arrange remaining items in rainbow color order. Revise monthly.',
 2019, 4.20, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000008-0001-4000-8000-000000000005'::UUID, 'organization'),
('a0000008-0001-4000-8000-000000000005'::UUID, 'home'),
('a0000008-0001-4000-8000-000000000005'::UUID, 'visual');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000008-0001-4000-8000-000000000005'::UUID, 'STAR method: Sort (group similar items), Toss (remove expired/broken/unused), Arrange (give everything a home), Revise (monthly maintenance check).', 0),
('a0000008-0001-4000-8000-000000000005'::UUID, 'Color-code everything — books, spice jars, pantry items, closets. ROYGBIV (rainbow) order is visually pleasing and makes finding things instant.', 1),
('a0000008-0001-4000-8000-000000000005'::UUID, 'Containment is key: use clear bins, labels, and dividers. If it doesn''t have a container, it becomes clutter within a week.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000008-0005-4000-8000-000000000001'::UUID, 'a0000008-0001-4000-8000-000000000005'::UUID, 'INTRO', 0, 'Organization as Art', 'Clea and Joanna organize celebrity homes and their results look like magazine spreads. But their system isn''t just pretty — it''s practical. The STAR method makes organization maintainable, not just achievable for one Instagram photo.'),
('b0000008-0005-4000-8000-000000000002'::UUID, 'a0000008-0001-4000-8000-000000000005'::UUID, 'CONCEPT', 1, 'The STAR Method', 'Sort: Take everything out. Group into categories (all spices together, all sauces together). Toss: expired? broken? duplicated? gone. Arrange: put categories back in clear, labeled containers, in rainbow color order where possible. Revise: monthly 10-minute review.'),
('b0000008-0005-4000-8000-000000000003'::UUID, 'a0000008-0001-4000-8000-000000000005'::UUID, 'CONCEPT', 2, 'Contain and Label', 'The secret to staying organized: containment. Every category gets a container — preferably clear so you can see contents. Every container gets a label. When space runs out, that''s your signal to edit. The container is the boundary. No buying bigger containers.'),
('b0000008-0005-4000-8000-000000000004'::UUID, 'a0000008-0001-4000-8000-000000000005'::UUID, 'QUOTE', 3, 'Shearer & Teplin on Order', '"Organizing isn''t about perfection. It''s about making your home work for YOUR life. The best system is one you''ll actually maintain."'),
('b0000008-0005-4000-8000-000000000005'::UUID, 'a0000008-0001-4000-8000-000000000005'::UUID, 'SUMMARY', 4, 'Organize One Space', '1. Choose one area (pantry, closet, bathroom cabinet).\n2. SORT: take everything out, group by category.\n3. TOSS: expired, broken, unused — gone.\n4. ARRANGE: clear containers, labels, rainbow order.\n5. REVISE: set a monthly 10-minute review.');

-- ── 6. Decluttering at the Speed of Life ────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000008-0001-4000-8000-000000000006'::UUID, 'Decluttering at the Speed of Life', 'Dana K. White', 'lw-8', 'Environment & Home', 6, 5, 'BEGINNER',
 'Decluttering for people who hate decluttering. White''s "container concept" eliminates the need for perfectionism and transforms overwhelm into simple decisions.',
 'Dana K. White is a self-described "decluttering non-expert" who developed a system for real people in real homes. Her container concept: your house IS the container. You don''t need to organize what doesn''t fit. Reduce until it does.',
 'Container Concept + Two Decluttering Questions',
 'Walk to your most cluttered spot. Ask two questions about each item: 1. Where would I look for this? 2. If I needed this, would I remember I have it? If no to either, it goes.',
 2018, 4.35, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000008-0001-4000-8000-000000000006'::UUID, 'decluttering'),
('a0000008-0001-4000-8000-000000000006'::UUID, 'practical'),
('a0000008-0001-4000-8000-000000000006'::UUID, 'no-perfectionism');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000008-0001-4000-8000-000000000006'::UUID, 'Your house is the container. You don''t need to organize what overflows — you need to reduce until everything has a natural home.', 0),
('a0000008-0001-4000-8000-000000000006'::UUID, 'Two decluttering questions: "Where would I look for this?" (put it there) and "If I needed this, would I remember I have it?" (if no → donate).', 1),
('a0000008-0001-4000-8000-000000000006'::UUID, 'You don''t need a "decluttering weekend." Pick up one item, make a decision, and move on. Tiny decisions repeated daily = transformed home.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000008-0006-4000-8000-000000000001'::UUID, 'a0000008-0001-4000-8000-000000000006'::UUID, 'INTRO', 0, 'Decluttering for Real People', 'Dana K. White didn''t start as an organizing expert — she was a messy person with a messy house and three kids. Her system emerged from desperation, not expertise. It works BECAUSE it''s designed for imperfect humans.'),
('b0000008-0006-4000-8000-000000000002'::UUID, 'a0000008-0001-4000-8000-000000000006'::UUID, 'CONCEPT', 1, 'The Container Concept', 'Your shelf IS the limit. If your books don''t fit on the bookshelf, you don''t buy a bigger bookshelf — you have fewer books. Your closet IS the container. If clothes overflow, you have too many clothes. The container concept eliminates the need for complex organizing systems.'),
('b0000008-0006-4000-8000-000000000003'::UUID, 'a0000008-0001-4000-8000-000000000006'::UUID, 'CONCEPT', 2, 'Two Magic Questions', 'Question 1: "Where would I look for this?" → Put it there. That''s its home. Question 2: "If I needed this, would I remember I own it?" → If no, it serves no purpose. Donate it. These two questions replace every complex decluttering methodology.'),
('b0000008-0006-4000-8000-000000000004'::UUID, 'a0000008-0001-4000-8000-000000000006'::UUID, 'QUOTE', 3, 'White on Decluttering', '"I don''t need to love decluttering. I just need to make one decision at a time. Pick up the thing. Decide. Move on. That''s all there is to it."'),
('b0000008-0006-4000-8000-000000000005'::UUID, 'a0000008-0001-4000-8000-000000000006'::UUID, 'SUMMARY', 4, 'Start Right Now', '1. Walk to your most cluttered surface (counter, desk, shelf).\n2. Pick up ONE item. Ask: "Where would I look for this?"\n3. Put it there. Pick up the next item. Repeat.\n4. If you wouldn''t remember you own it → donate. Don''t overthink.');

-- ── 7. How to Make Your Bed ─────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000008-0001-4000-8000-000000000007'::UUID, 'Make Your Bed', 'Admiral William H. McRaven', 'lw-8', 'Environment & Home', 5, 5, 'BEGINNER',
 'Little things that can change your life. McRaven''s Navy SEAL wisdom shows that one small act of order in the morning sets the tone for the entire day.',
 'Admiral McRaven''s viral commencement speech became this book: 10 life lessons from Navy SEAL training. The first and most famous: make your bed every morning. It''s a tiny act of discipline that creates a cascade of order, accomplishment, and momentum.',
 'Small Wins → Big Momentum',
 'Tomorrow morning: make your bed immediately after getting up. Do this for 7 days straight. Notice how it affects the rest of your day.',
 2017, 4.35, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000008-0001-4000-8000-000000000007'::UUID, 'discipline'),
('a0000008-0001-4000-8000-000000000007'::UUID, 'military'),
('a0000008-0001-4000-8000-000000000007'::UUID, 'morning-routine');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000008-0001-4000-8000-000000000007'::UUID, 'Making your bed is the first win of the day. It creates a micro-sense of accomplishment that cascades through every subsequent task.', 0),
('a0000008-0001-4000-8000-000000000007'::UUID, 'Small tasks completed with excellence set the standard for all tasks. If you can''t do the little things right, you won''t do the big things right.', 1),
('a0000008-0001-4000-8000-000000000007'::UUID, 'At the end of a bad day, you come home to a made bed — proof that at least one thing went right. Sometimes, that''s enough.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000008-0007-4000-8000-000000000001'::UUID, 'a0000008-0001-4000-8000-000000000007'::UUID, 'INTRO', 0, 'The First Task of the Day', 'In Navy SEAL training, your day starts with an inspection — of your bed. Corners tight. Pillow centered. Hospital corners precise. It seems absurd. But McRaven says: if you do the first task of the day correctly, it leads to the second, then the third. Small wins create momentum.'),
('b0000008-0007-4000-8000-000000000002'::UUID, 'a0000008-0001-4000-8000-000000000007'::UUID, 'CONCEPT', 1, 'The Cascade Effect', 'Making your bed takes 3 minutes. But psychologically, it creates the identity of "someone who gets things done." You made your bed → you eat a good breakfast → you start work on time → you tackle the hardest task first. One tiny act of order starts the cascade.'),
('b0000008-0007-4000-8000-000000000003'::UUID, 'a0000008-0001-4000-8000-000000000007'::UUID, 'CONCEPT', 2, 'Control What You Can', 'SEAL training teaches: you can''t control the ocean, the enemy, or the weather. But you CAN control your bed. In chaotic, stressful times, controlling your immediate environment — tidying your desk, making your bed, organizing your space — is a grounding anchor.'),
('b0000008-0007-4000-8000-000000000004'::UUID, 'a0000008-0001-4000-8000-000000000007'::UUID, 'QUOTE', 3, 'McRaven on Discipline', '"If you want to change the world, start off by making your bed. If you can''t do the little things right, you''ll never do the big things right."'),
('b0000008-0007-4000-8000-000000000005'::UUID, 'a0000008-0001-4000-8000-000000000007'::UUID, 'SUMMARY', 4, 'Win Your Morning', '1. Tomorrow: make your bed within 2 minutes of getting up.\n2. Do it every day for 7 days — no exceptions.\n3. Notice the cascade: does it affect your mood, productivity, or follow-through?\n4. Expand: add one more tiny morning discipline each week.');

-- ── 8. Cozy Minimalist Home ─────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000008-0001-4000-8000-000000000008'::UUID, 'Cozy Minimalist Home', 'Myquillyn Smith', 'lw-8', 'Environment & Home', 6, 5, 'BEGINNER',
 'Minimalism that feels warm, not sterile. Smith proves that less stuff + more intention = a home that actually looks and feels good.',
 'Myquillyn Smith (The Nester) bridges the gap between cold minimalism and overwhelming maximalism. Her approach: edit first, then style. Remove what doesn''t serve the room, then add back only what makes it feel warm, personal, and inviting.',
 'Quiet the Room → Style the Room',
 'Pick one room. Remove half the decorative items and store them. Live with the "quieted" room for a week. Only add back items you genuinely miss.',
 2018, 4.30, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000008-0001-4000-8000-000000000008'::UUID, 'home-design'),
('a0000008-0001-4000-8000-000000000008'::UUID, 'cozy'),
('a0000008-0001-4000-8000-000000000008'::UUID, 'minimalism');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000008-0001-4000-8000-000000000008'::UUID, 'Step 1: "Quiet the room" — remove everything that isn''t essential. Step 2: Live with the empty space. Step 3: Only add back what you genuinely miss.', 0),
('a0000008-0001-4000-8000-000000000008'::UUID, 'A room should have a purpose: what do you DO in this room? Every object should serve that purpose or bring genuine beauty. If it does neither → it''s clutter.', 1),
('a0000008-0001-4000-8000-000000000008'::UUID, 'Cozy ≠ cluttered. A few well-chosen items (a soft blanket, a plant, warm lighting) create more warmth than 50 random decorations ever could.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000008-0008-4000-8000-000000000001'::UUID, 'a0000008-0001-4000-8000-000000000008'::UUID, 'INTRO', 0, 'Not Too Much, Not Too Little', 'Myquillyn Smith hated sterile minimalism — all white walls and empty shelves. But she also hated visual chaos. She found the sweet spot: edit ruthlessly, then style intentionally. The result: rooms that are both calm AND warm.'),
('b0000008-0008-4000-8000-000000000002'::UUID, 'a0000008-0001-4000-8000-000000000008'::UUID, 'CONCEPT', 1, 'Quiet the Room', 'Before you ADD anything, SUBTRACT. Take every decorative item out of a room. Store it all in a box. Live with the "quiet" room for a week. You''ll be surprised: most of what you removed, you don''t miss. Only bring back the items that you genuinely felt were absent.'),
('b0000008-0008-4000-8000-000000000003'::UUID, 'a0000008-0001-4000-8000-000000000008'::UUID, 'CONCEPT', 2, 'Style with Intention', 'A cozy room has: one large statement piece (a piece of art, a plant, a bold pillow). Texture variety (a wool throw, a wooden tray, a linen curtain). Warm lighting (no overhead fluorescents — use lamps). These 3 elements create warmth without clutter.'),
('b0000008-0008-4000-8000-000000000004'::UUID, 'a0000008-0001-4000-8000-000000000008'::UUID, 'QUOTE', 3, 'Smith on Home Design', '"Your home doesn''t have to be perfect. It has to be yours. The most beautiful rooms are the ones that reflect the person who lives in them — not a magazine."'),
('b0000008-0008-4000-8000-000000000005'::UUID, 'a0000008-0001-4000-8000-000000000008'::UUID, 'SUMMARY', 4, 'Create Cozy Minimalism', '1. Pick one room to "quiet" — remove all decorative items.\n2. Live with the quiet room for 7 days.\n3. Add back ONLY what you miss: one statement piece, textures, warm lighting.\n4. Rule of thumb: if removing it doesn''t change how the room feels, it doesn''t belong.');

-- ── 9. Digital Minimalism ───────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000008-0001-4000-8000-000000000009'::UUID, 'Digital Minimalism', 'Cal Newport', 'lw-8', 'Environment & Home', 8, 5, 'INTERMEDIATE',
 'Declutter your digital life. Newport argues that the most important environment to organize is the one you carry in your pocket.',
 'Cal Newport extends minimalism to the digital realm. His argument: your phone is an environment too — and it''s the most cluttered space you own. A 30-day digital declutter, followed by intentional rebuilding of your digital life, reclaims hours and attention.',
 'Digital Declutter Protocol',
 'For 30 days, remove all optional technology from your life (social media, news apps, streaming). After 30 days, add back ONLY what serves a specific value.',
 2019, 4.50, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000008-0001-4000-8000-000000000009'::UUID, 'digital-minimalism'),
('a0000008-0001-4000-8000-000000000009'::UUID, 'technology'),
('a0000008-0001-4000-8000-000000000009'::UUID, 'attention');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000008-0001-4000-8000-000000000009'::UUID, 'Your phone is an environment — and it''s the most cluttered space you own. 80 apps, thousands of notifications, infinite scroll feeds. It needs the KonMari treatment.', 0),
('a0000008-0001-4000-8000-000000000009'::UUID, 'The 30-Day Digital Declutter: remove ALL optional tech for 30 days. After the detox, add back ONLY tools that serve a specific value — with specific rules for how and when.', 1),
('a0000008-0001-4000-8000-000000000009'::UUID, '"Solitude deprivation" — never being alone with your thoughts — is a modern epidemic. A phone-free walk, a quiet commute, or 10 minutes of silence daily is essential.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000008-0009-4000-8000-000000000001'::UUID, 'a0000008-0001-4000-8000-000000000009'::UUID, 'INTRO', 0, 'Your Digital Junk Drawer', 'How many apps are on your phone? How many do you actually use daily? Cal Newport argues that most people''s phones are digital hoarder homes — stuffed with unused apps, notification-spewing services, and infinite-scroll feeds that drain attention and add nothing.'),
('b0000008-0009-4000-8000-000000000002'::UUID, 'a0000008-0001-4000-8000-000000000009'::UUID, 'CONCEPT', 1, 'The 30-Day Declutter', 'For 30 days: delete or disable all optional technology — social media, news apps, streaming services, unnecessary notifications. This isn''t punishment; it''s a reset. After 30 days, you add back ONLY what genuinely serves your values, with clear rules: "I''ll check Instagram once on Sunday evenings."'),
('b0000008-0009-4000-8000-000000000003'::UUID, 'a0000008-0001-4000-8000-000000000009'::UUID, 'CONCEPT', 2, 'Solitude Deprivation', 'Humans need time alone with their thoughts. But smartphones have eliminated solitude: every moment of waiting, walking, or commuting is now filled with content. Newport warns: this "solitude deprivation" causes anxiety, restlessness, and shallow thinking. Fix: phone-free walks, daily.'),
('b0000008-0009-4000-8000-000000000004'::UUID, 'a0000008-0001-4000-8000-000000000009'::UUID, 'QUOTE', 3, 'Newport on Attention', '"The key to thriving in our high-tech world is to spend much less time using technology. Digital minimalists see new technologies as tools to be used to support things they deeply value — not as sources of value themselves."'),
('b0000008-0009-4000-8000-000000000005'::UUID, 'a0000008-0001-4000-8000-000000000009'::UUID, 'SUMMARY', 4, 'Declutter Your Digital Life', '1. Count your apps. How many do you actually need daily?\n2. Try a 30-day digital detox: remove optional apps and services.\n3. After 30 days, add back only what serves a named value, with rules.\n4. Take one phone-free walk per day — reclaim solitude.');

-- ── 10. Outer Order, Inner Calm ─────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000008-0001-4000-8000-000000000010'::UUID, 'Outer Order, Inner Calm', 'Gretchen Rubin', 'lw-8', 'Environment & Home', 5, 5, 'BEGINNER',
 'The connection between physical order and mental peace. Rubin provides actionable tips for creating calm through environmental control.',
 'Gretchen Rubin (The Happiness Project) distills a simple truth: for most people, outer order contributes to inner calm. Not everyone needs minimalism, but everyone benefits from knowing where things are, having surfaces clear, and feeling in control of their space.',
 'Outer Order = Inner Calm',
 'Do a 10-minute evening reset: clear all surfaces, return items to their homes, set out tomorrow''s outfit. Wake up to order instead of chaos.',
 2019, 4.25, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000008-0001-4000-8000-000000000010'::UUID, 'order'),
('a0000008-0001-4000-8000-000000000010'::UUID, 'calm'),
('a0000008-0001-4000-8000-000000000010'::UUID, 'habits');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000008-0001-4000-8000-000000000010'::UUID, 'For most people, external disorder creates internal anxiety — even if they can''t name it. Clearing one surface can shift your entire mood.', 0),
('a0000008-0001-4000-8000-000000000010'::UUID, '"The one-minute rule" — if a task takes less than one minute (hang up a coat, file a paper, put away dishes), do it immediately. Never defer a 60-second task.', 1),
('a0000008-0001-4000-8000-000000000010'::UUID, 'Evening reset: 10 minutes before bed, clear all surfaces, return everything to its home. Waking up to order sets a calm, focused tone for the day.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000008-0010-4000-8000-000000000001'::UUID, 'a0000008-0001-4000-8000-000000000010'::UUID, 'INTRO', 0, 'The Order-Calm Connection', 'Gretchen Rubin noticed something consistent in her happiness research: people who maintained physical order in their homes reported higher calm, focus, and satisfaction. Not minimalism — just knowing where things are. Order as a foundation for mental clarity.'),
('b0000008-0010-4000-8000-000000000002'::UUID, 'a0000008-0001-4000-8000-000000000010'::UUID, 'CONCEPT', 1, 'The One-Minute Rule', 'If it takes less than one minute, do it NOW. Hang up the coat. Put the dish in the dishwasher. File the paper. Open the mail. These tiny tasks, when deferred, stack into overwhelming clutter. Done immediately, they prevent clutter from forming.'),
('b0000008-0010-4000-8000-000000000003'::UUID, 'a0000008-0001-4000-8000-000000000010'::UUID, 'CONCEPT', 2, 'The Evening Reset', 'Every night, spend 10 minutes on a "closing ceremony": clear all surfaces, return items to their homes, wipe down the kitchen counter, set out tomorrow''s outfit. This tiny ritual means you wake up to calm instead of chaos — and the psychological difference is enormous.'),
('b0000008-0010-4000-8000-000000000004'::UUID, 'a0000008-0001-4000-8000-000000000010'::UUID, 'QUOTE', 3, 'Rubin on Order', '"Outer order contributes to inner calm. For most of us, a messy desk or a cluttered closet creates a nagging sense of unease. Restoring order restores peace."'),
('b0000008-0010-4000-8000-000000000005'::UUID, 'a0000008-0001-4000-8000-000000000010'::UUID, 'SUMMARY', 4, 'Create Calm Tonight', '1. Apply the One-Minute Rule all day: if it takes less than 60 seconds, do it now.\n2. Tonight: 10-minute evening reset — clear surfaces, return items, set out tomorrow''s clothes.\n3. Identify your "clutter hot spots" — where does mess accumulate? Address those first.\n4. Remember: order isn''t about perfection. It''s about peace.');
