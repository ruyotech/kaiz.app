-- V43: Seed Essentia Books — lw-4 Personal Growth (10 books)
-- Habits, mindset, self-discovery, and human potential

-- ── Update existing seed: Atomic Habits ─────────────────────────────────────
UPDATE essentia_books SET
  summary_text = 'James Clear''s masterwork on behavior change. The core idea: forget goals, build systems. A 1% improvement every day compounds to 37x growth in a year. The Four Laws of Behavior Change provide an operating system for building good habits and breaking bad ones.',
  core_methodology = 'Four Laws of Behavior Change',
  app_application = 'Apply the "Habit Stack" — attach a new habit to an existing one. "After I pour my morning coffee, I will meditate for 2 minutes."',
  is_featured = TRUE,
  is_published = TRUE
WHERE id = '33333333-3333-3333-3333-333333333301'::UUID;

-- Add takeaways for existing Atomic Habits
INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('33333333-3333-3333-3333-333333333301'::UUID, 'You do not rise to the level of your goals — you fall to the level of your systems. Goals are for direction; systems are for progress.', 0),
('33333333-3333-3333-3333-333333333301'::UUID, 'The Four Laws: Make it Obvious (cue), Make it Attractive (craving), Make it Easy (response), Make it Satisfying (reward).', 1),
('33333333-3333-3333-3333-333333333301'::UUID, 'Identity change is the north star: don''t aim to "read more" — aim to "become a reader." Habits stick when they align with who you believe you are.', 2);

-- ── 1. The Courage to Be Disliked ──────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000004-0001-4000-8000-000000000001'::UUID, 'The Courage to Be Disliked', 'Ichiro Kishimi & Fumitake Koga', 'lw-4', 'Personal Growth', 8, 5, 'INTERMEDIATE',
 'Adlerian psychology as dialogue. The philosopher and the youth debate the radical idea that all problems are interpersonal — and happiness requires the courage to be disliked.',
 'Through a Socratic dialogue between a philosopher and a young man, Kishimi and Koga introduce Alfred Adler''s psychology: all suffering stems from interpersonal relationships, trauma doesn''t determine your future, and true freedom requires accepting that not everyone will like you.',
 'Adlerian Psychology — Separation of Tasks',
 'Practice "Separation of Tasks" — identify what is YOUR task (your work, your choices) vs. OTHER people''s tasks (their opinions, reactions). Only focus on yours.',
 2013, 4.60, 0, TRUE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000004-0001-4000-8000-000000000001'::UUID, 'psychology'),
('a0000004-0001-4000-8000-000000000001'::UUID, 'freedom'),
('a0000004-0001-4000-8000-000000000001'::UUID, 'adlerian');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000004-0001-4000-8000-000000000001'::UUID, 'Trauma doesn''t determine your future — you CHOOSE how to interpret past events. "I''m this way because of my past" is a comfortable excuse, not an unchangeable truth.', 0),
('a0000004-0001-4000-8000-000000000001'::UUID, '"Separation of Tasks": Whether someone likes you is THEIR task. How you live is YOUR task. Mixing these up is the source of most suffering.', 1),
('a0000004-0001-4000-8000-000000000001'::UUID, 'Happiness is not the absence of problems — it''s the courage to live authentically despite the certainty of being judged.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000004-0001-4000-8000-000000000001'::UUID, 'a0000004-0001-4000-8000-000000000001'::UUID, 'INTRO', 0, 'A Dangerous Conversation', 'A disillusioned young man visits a philosopher who makes an outrageous claim: "People can change. The world is simple. And everyone can be happy." What follows is a five-night dialogue that systematically demolishes the young man''s excuses — and yours.'),
('b0000004-0001-4000-8000-000000000002'::UUID, 'a0000004-0001-4000-8000-000000000001'::UUID, 'CONCEPT', 1, 'Trauma Is Not Destiny', 'Adler disagreed with Freud: the past doesn''t determine you. You CHOOSE how to interpret your past. A person bullied as a child can choose "I''m damaged" or "I understand outsiders." The past provides material — you write the story.'),
('b0000004-0001-4000-8000-000000000003'::UUID, 'a0000004-0001-4000-8000-000000000001'::UUID, 'CONCEPT', 2, 'Separation of Tasks', 'Every problem involves two parties. Your task: live according to your values. Their task: how they feel about it. A student studies (their task). Whether the teacher approves (teacher''s task). Mixing tasks = anxiety, people-pleasing, and resentment.'),
('b0000004-0001-4000-8000-000000000004'::UUID, 'a0000004-0001-4000-8000-000000000001'::UUID, 'QUOTE', 3, 'The Philosopher on Freedom', '"Freedom is being disliked by other people. If you are not disliked by anyone, you are living not for yourself but for others."'),
('b0000004-0001-4000-8000-000000000005'::UUID, 'a0000004-0001-4000-8000-000000000001'::UUID, 'SUMMARY', 4, 'Live with Courage', '1. Identify one area where you''re blaming your past. Rewrite the narrative.\n2. For every worry, ask: "Whose task is this?" If it''s theirs, let it go.\n3. Accept that being disliked is the price of authenticity — and pay it.\n4. Focus on contribution, not recognition.');

-- ── 2. Thinking, Fast and Slow ──────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000004-0001-4000-8000-000000000002'::UUID, 'Thinking, Fast and Slow', 'Daniel Kahneman', 'lw-4', 'Personal Growth', 10, 5, 'ADVANCED',
 'The Nobel laureate''s magnum opus on cognitive biases. System 1 (fast, intuitive) vs. System 2 (slow, deliberate) — and why most decisions are made by the wrong one.',
 'Daniel Kahneman''s landmark work reveals two modes of thinking: System 1 (fast, automatic, emotional) and System 2 (slow, effortful, logical). Most decisions are made by System 1 — which is brilliant at pattern-matching but terrible at statistics, probability, and long-term planning.',
 'System 1 vs. System 2 Dual-Process Theory',
 'Before any important decision, pause and ask: "Am I thinking fast or slow right now?" If fast, sleep on it.',
 2011, 4.65, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000004-0001-4000-8000-000000000002'::UUID, 'psychology'),
('a0000004-0001-4000-8000-000000000002'::UUID, 'decision-making'),
('a0000004-0001-4000-8000-000000000002'::UUID, 'cognitive-bias');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000004-0001-4000-8000-000000000002'::UUID, 'System 1 (fast thinking) is always running and makes 95% of your decisions — most without your awareness. This is both a superpower and a liability.', 0),
('a0000004-0001-4000-8000-000000000002'::UUID, '"Loss Aversion" — the pain of losing $100 is psychologically twice as intense as the joy of gaining $100 — distorts almost every financial and career decision you make.', 1),
('a0000004-0001-4000-8000-000000000002'::UUID, 'You cannot eliminate cognitive biases — but you can design environments and checklists that force System 2 to engage before important decisions.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000004-0002-4000-8000-000000000001'::UUID, 'a0000004-0001-4000-8000-000000000002'::UUID, 'INTRO', 0, 'Your Brain Has Two Pilots', 'Nobel laureate Daniel Kahneman spent 50 years studying how humans think — and mostly, how they think WRONG. Thinking, Fast and Slow reveals the two systems running your brain, why System 1 (the fast one) keeps making predictable errors, and what you can do about it.'),
('b0000004-0002-4000-8000-000000000002'::UUID, 'a0000004-0001-4000-8000-000000000002'::UUID, 'CONCEPT', 1, 'System 1 vs. System 2', 'System 1: Fast, automatic, emotional. It''s what catches a ball, reads facial expressions, and makes snap judgments. System 2: Slow, effortful, logical. It''s what does math, writes essays, and plans careers. The problem: System 2 is lazy and defaults to System 1 whenever possible.'),
('b0000004-0002-4000-8000-000000000003'::UUID, 'a0000004-0001-4000-8000-000000000002'::UUID, 'CONCEPT', 2, 'Loss Aversion', 'Losing $100 hurts about 2x more than gaining $100 feels good. This asymmetry drives irrational behavior: holding losing stocks too long (avoiding the "loss" of selling), staying in bad jobs (fear of losing security), and turning down good bets (the potential loss looms larger than the gain).'),
('b0000004-0002-4000-8000-000000000004'::UUID, 'a0000004-0001-4000-8000-000000000002'::UUID, 'QUOTE', 3, 'Kahneman on Confidence', '"The confidence that individuals have in their beliefs depends mostly on the quality of the story they can tell about what they see, even if they see very little."'),
('b0000004-0002-4000-8000-000000000005'::UUID, 'a0000004-0001-4000-8000-000000000002'::UUID, 'SUMMARY', 4, 'Think Before You Think', '1. Before big decisions, ask: "Am I using System 1 or System 2?"\n2. Sleep on any decision involving more than $1,000 or that affects more than 1 month.\n3. Create pre-commitment rules for recurring decisions (investing, hiring).\n4. Watch for loss aversion — ask "Would I make this choice if I had no prior stake?"');

-- ── 3. Man''s Search for Meaning ────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000004-0001-4000-8000-000000000003'::UUID, 'Man''s Search for Meaning', 'Viktor E. Frankl', 'lw-4', 'Personal Growth', 7, 5, 'INTERMEDIATE',
 'The foundational text on purpose. Frankl''s concentration camp memoir proves that meaning can be found even in the most extreme suffering.',
 'Viktor Frankl survived Auschwitz and emerged with a profound insight: those who survived the camps were not the strongest or smartest, but those who found MEANING in their suffering. His logotherapy — the "Third Viennese School of Psychotherapy" — places purpose at the center of mental health.',
 'Logotherapy — Will to Meaning',
 'Identify your "Why" — the purpose that would sustain you through any difficulty. Write it down and revisit it weekly.',
 1946, 4.80, 0, TRUE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000004-0001-4000-8000-000000000003'::UUID, 'meaning'),
('a0000004-0001-4000-8000-000000000003'::UUID, 'resilience'),
('a0000004-0001-4000-8000-000000000003'::UUID, 'philosophy');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000004-0001-4000-8000-000000000003'::UUID, '"He who has a Why can endure almost any How." — Purpose doesn''t eliminate suffering, but it makes suffering bearable and meaningful.', 0),
('a0000004-0001-4000-8000-000000000003'::UUID, 'Meaning is found in three ways: through work (creating something), through love (experiencing someone), and through suffering (choosing your attitude in unavoidable pain).', 1),
('a0000004-0001-4000-8000-000000000003'::UUID, 'The "existential vacuum" — the feeling that life is meaningless — is the root cause of most modern depression, addiction, and aggression.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000004-0003-4000-8000-000000000001'::UUID, 'a0000004-0001-4000-8000-000000000003'::UUID, 'INTRO', 0, 'Meaning in the Darkest Place', 'Viktor Frankl was a psychiatrist imprisoned in Auschwitz. In the camps, he observed that survival correlated not with physical strength but with purpose. Those who had a reason to live — a manuscript to finish, a child to reunite with — endured what others could not.'),
('b0000004-0003-4000-8000-000000000002'::UUID, 'a0000004-0001-4000-8000-000000000003'::UUID, 'CONCEPT', 1, 'The Will to Meaning', 'Freud said we''re driven by pleasure. Adler said we''re driven by power. Frankl said we''re driven by MEANING. When life has purpose, we can endure any hardship. When it doesn''t, even comfort feels hollow.'),
('b0000004-0003-4000-8000-000000000003'::UUID, 'a0000004-0001-4000-8000-000000000003'::UUID, 'CONCEPT', 2, 'Three Sources of Meaning', 'Frankl identified three paths to meaning: 1. Creative values — what you give to the world (work, art, service). 2. Experiential values — what you receive from the world (love, beauty, truth). 3. Attitudinal values — the stance you take toward unavoidable suffering.'),
('b0000004-0003-4000-8000-000000000004'::UUID, 'a0000004-0001-4000-8000-000000000003'::UUID, 'QUOTE', 3, 'Frankl on Choice', '"Everything can be taken from a man but one thing: the last of the human freedoms — to choose one''s attitude in any given set of circumstances, to choose one''s own way."'),
('b0000004-0003-4000-8000-000000000005'::UUID, 'a0000004-0001-4000-8000-000000000003'::UUID, 'SUMMARY', 4, 'Find Your Meaning', '1. Write your "Why" — the purpose that would sustain you through hardship.\n2. Identify which source of meaning is strongest for you: creating, experiencing, or enduring.\n3. In moments of suffering, ask: "What is this teaching me? What can I create from this?"\n4. Revisit your "Why" weekly — purpose needs maintenance.');

-- ── 4. Mindset ──────────────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000004-0001-4000-8000-000000000004'::UUID, 'Mindset', 'Carol S. Dweck', 'lw-4', 'Personal Growth', 7, 5, 'BEGINNER',
 'The growth/fixed mindset framework that transformed education, parenting, and leadership.',
 'Stanford psychologist Carol Dweck''s research reveals two belief systems: the "Fixed Mindset" (talent is innate) and the "Growth Mindset" (ability is developed through effort). The difference predicts academic achievement, career success, and relationship quality.',
 'Growth Mindset vs. Fixed Mindset',
 'Add "yet" to every failure statement. "I can''t do this" becomes "I can''t do this YET." Track effort, not just outcomes.',
 2006, 4.55, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000004-0001-4000-8000-000000000004'::UUID, 'mindset'),
('a0000004-0001-4000-8000-000000000004'::UUID, 'learning'),
('a0000004-0001-4000-8000-000000000004'::UUID, 'psychology');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000004-0001-4000-8000-000000000004'::UUID, 'Fixed Mindset: "I''m either smart or I''m not." Growth Mindset: "I can get smarter with effort." The belief itself changes the outcome.', 0),
('a0000004-0001-4000-8000-000000000004'::UUID, 'Praising effort ("You worked really hard on this") builds growth mindset. Praising talent ("You''re so smart") builds fixed mindset — and fragility.', 1),
('a0000004-0001-4000-8000-000000000004'::UUID, 'The word "yet" is the most powerful mindset tool: "I can''t do calculus YET" transforms a dead-end into a journey.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000004-0004-4000-8000-000000000001'::UUID, 'a0000004-0001-4000-8000-000000000004'::UUID, 'INTRO', 0, 'The Power of Belief', 'Carol Dweck spent decades studying why some people thrive on challenges while others collapse. The answer wasn''t talent, IQ, or privilege — it was a simple belief about whether ability is fixed or growable. That belief changes everything.'),
('b0000004-0004-4000-8000-000000000002'::UUID, 'a0000004-0001-4000-8000-000000000004'::UUID, 'CONCEPT', 1, 'Fixed vs. Growth', 'Fixed Mindset: talent is a gift you either have or don''t. Effort is a sign of weakness. Failure is an identity ("I''m a failure"). Growth Mindset: ability is built through practice. Effort is the path to mastery. Failure is an event ("I failed at this task").'),
('b0000004-0004-4000-8000-000000000003'::UUID, 'a0000004-0001-4000-8000-000000000004'::UUID, 'CONCEPT', 2, 'The Praise Problem', 'When you tell a child "You''re so smart!" they learn: my value comes from being smart. So they avoid challenges (might fail and look dumb) and hide mistakes. When you say "You worked really hard!" they learn: my value comes from effort. So they embrace challenges and persist.'),
('b0000004-0004-4000-8000-000000000004'::UUID, 'a0000004-0001-4000-8000-000000000004'::UUID, 'QUOTE', 3, 'Dweck on Failure', '"In a growth mindset, challenges are exciting rather than threatening. So rather than thinking, ''Oh, I''m going to reveal my weaknesses,'' you say, ''Wow, here''s a chance to grow.''"'),
('b0000004-0004-4000-8000-000000000005'::UUID, 'a0000004-0001-4000-8000-000000000004'::UUID, 'SUMMARY', 4, 'Grow Your Mindset', '1. Notice when you think "I''m not good at this." Add "yet."\n2. Praise effort and strategy in yourself and others, not talent.\n3. Reframe failure: "What did I learn?" not "What''s wrong with me?"\n4. Seek challenges that stretch you — comfort is the enemy of growth.');

-- ── 5. The Power of Now ─────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000004-0001-4000-8000-000000000005'::UUID, 'The Power of Now', 'Eckhart Tolle', 'lw-4', 'Personal Growth', 8, 5, 'INTERMEDIATE',
 'The spiritual classic on present-moment awareness. Tolle argues that all suffering exists in the past (regret) or future (anxiety) — never in the now.',
 'Eckhart Tolle''s transformative guide argues that the "thinking mind" is not who you are — it''s a tool that has taken over. By learning to observe your thoughts without identifying with them, you access a deeper awareness where anxiety and regret dissolve.',
 'Present-Moment Awareness',
 'Practice the "5-4-3-2-1" grounding technique: 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste. Return to NOW.',
 1997, 4.50, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000004-0001-4000-8000-000000000005'::UUID, 'mindfulness'),
('a0000004-0001-4000-8000-000000000005'::UUID, 'spirituality'),
('a0000004-0001-4000-8000-000000000005'::UUID, 'presence');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000004-0001-4000-8000-000000000005'::UUID, 'You are not your thoughts — you are the awareness BEHIND your thoughts. Learning to observe thinking without engaging it is the key to inner peace.', 0),
('a0000004-0001-4000-8000-000000000005'::UUID, 'All anxiety lives in the future ("What if...?"). All regret lives in the past ("If only..."). The present moment — right NOW — is always manageable.', 1),
('a0000004-0001-4000-8000-000000000005'::UUID, 'The "pain body" — accumulated emotional pain from the past — feeds on drama, conflict, and negativity. Recognizing it is the first step to dissolving it.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000004-0005-4000-8000-000000000001'::UUID, 'a0000004-0001-4000-8000-000000000005'::UUID, 'INTRO', 0, 'Escape the Time Prison', 'Eckhart Tolle was a depressed academic who, at his lowest point, had an insight: "I cannot live with myself any longer." Then he noticed: who is the "I" and who is the "myself"? That question launched one of the most influential spiritual books of the 21st century.'),
('b0000004-0005-4000-8000-000000000002'::UUID, 'a0000004-0001-4000-8000-000000000005'::UUID, 'CONCEPT', 1, 'The Observer', 'Right now, your mind is generating thoughts. But there''s a "you" that can WATCH those thoughts. That observer — the awareness behind thinking — is your true self. The thoughts are weather. The observer is the sky. You can''t control the weather, but you can stop pretending you ARE the weather.'),
('b0000004-0005-4000-8000-000000000003'::UUID, 'a0000004-0001-4000-8000-000000000005'::UUID, 'CONCEPT', 2, 'The Pain Body', 'Tolle describes the "pain body" — an accumulation of old emotional pain that lives in you and periodically "wakes up" to feed on negativity. When you suddenly feel disproportionate anger, sadness, or drama-seeking, the pain body is active. The cure: watch it without feeding it.'),
('b0000004-0005-4000-8000-000000000004'::UUID, 'a0000004-0001-4000-8000-000000000005'::UUID, 'QUOTE', 3, 'Tolle on Time', '"Time isn''t precious at all, because it is an illusion. What you perceive as precious is not time but the one point that is out of time: the Now."'),
('b0000004-0005-4000-8000-000000000005'::UUID, 'a0000004-0001-4000-8000-000000000005'::UUID, 'SUMMARY', 4, 'Practice Presence', '1. Set 3 daily alarms labeled "NOW." When they ring, take 3 conscious breaths.\n2. Notice when you''re mentally in the past (regret) or future (anxiety) — gently return.\n3. Use the 5-4-3-2-1 grounding: 5 see, 4 hear, 3 touch, 2 smell, 1 taste.\n4. When the pain body activates: watch it. Don''t feed it with stories.');

-- ── 6. Deep Work ────────────────────────────────────────────────────────────
-- (Deep Work already exists as 33333333-3333-3333-3333-333333333302 under lw-2 Career)
-- We keep it under Career since it''s already seeded there. No duplicate needed.

-- ── 6. The Subtle Art of Not Giving a F*ck ──────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000004-0001-4000-8000-000000000006'::UUID, 'The Subtle Art of Not Giving a F*ck', 'Mark Manson', 'lw-4', 'Personal Growth', 7, 5, 'BEGINNER',
 'The anti-self-help self-help book. Manson argues that the desire for a positive experience is itself a negative experience — and acceptance is the path to peace.',
 'Mark Manson flips positive thinking on its head: the constant pursuit of happiness is what makes you unhappy. Instead, choose your struggles wisely. Life is about solving meaningful problems, not avoiding all problems.',
 'Values-Based Living',
 'Identify your top 3 values. For each decision, ask: "Does this align with my values?" If not, don''t give a f*ck about it.',
 2016, 4.40, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000004-0001-4000-8000-000000000006'::UUID, 'values'),
('a0000004-0001-4000-8000-000000000006'::UUID, 'stoicism'),
('a0000004-0001-4000-8000-000000000006'::UUID, 'self-help');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000004-0001-4000-8000-000000000006'::UUID, 'You have a limited number of f*cks to give. Choose wisely. Most things people stress about don''t deserve your emotional energy.', 0),
('a0000004-0001-4000-8000-000000000006'::UUID, 'The "Feedback Loop from Hell": feeling bad about feeling bad about feeling bad. Break the loop by accepting negative emotions as normal, not as problems to fix.', 1),
('a0000004-0001-4000-8000-000000000006'::UUID, 'Good values are reality-based, socially constructive, and controllable. "Popularity" is a bad value (can''t control). "Honesty" is a good one (always controllable).', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000004-0006-4000-8000-000000000001'::UUID, 'a0000004-0001-4000-8000-000000000006'::UUID, 'INTRO', 0, 'The Anti-Self-Help Book', 'Mark Manson was tired of Instagram positivity and "manifest your dreams" nonsense. His thesis: the key to a good life is not giving a f*ck about MORE — it''s about giving a f*ck about LESS. About only the things that truly matter.'),
('b0000004-0006-4000-8000-000000000002'::UUID, 'a0000004-0001-4000-8000-000000000006'::UUID, 'CONCEPT', 1, 'Choose Your Struggle', 'Happiness is not the absence of problems — it''s choosing WHICH problems you want to solve. Everyone wants to be fit; not everyone wants to suffer through workouts. Everyone wants to be rich; not everyone wants to work 80 hours. The question isn''t "What do you want?" It''s "What pain are you willing to endure?"'),
('b0000004-0006-4000-8000-000000000003'::UUID, 'a0000004-0001-4000-8000-000000000006'::UUID, 'CONCEPT', 2, 'The Feedback Loop from Hell', 'Feeling anxious? Now you feel anxious ABOUT feeling anxious. Now you feel guilty about feeling anxious about feeling anxious. This is the Feedback Loop from Hell. The exit: accept the first emotion without judging it. "I feel anxious. That''s okay. Anxiety is human."'),
('b0000004-0006-4000-8000-000000000004'::UUID, 'a0000004-0001-4000-8000-000000000006'::UUID, 'QUOTE', 3, 'Manson on Choice', '"Who you are is defined by what you''re willing to struggle for. If you want the benefits but aren''t willing to accept the costs, you don''t actually want it."'),
('b0000004-0006-4000-8000-000000000005'::UUID, 'a0000004-0001-4000-8000-000000000006'::UUID, 'SUMMARY', 4, 'Choose What Matters', '1. List your top 3 values (honesty, growth, family, etc.).\n2. For each worry, ask: "Does this align with my values?" If no, drop it.\n3. Accept negative emotions without meta-judgment — feel bad, and let it pass.\n4. Ask: "What pain am I willing to endure for what I want?"');

-- ── 7. The 7 Habits of Highly Effective People ──────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000004-0001-4000-8000-000000000007'::UUID, 'The 7 Habits of Highly Effective People', 'Stephen R. Covey', 'lw-4', 'Personal Growth', 9, 5, 'INTERMEDIATE',
 'The timeless principles of personal effectiveness. Covey''s character-based approach moves from dependence to independence to interdependence.',
 'Stephen Covey''s framework organizes personal development into a maturity continuum: from dependence (Habits 1-3: Private Victory), to independence (Habits 4-6: Public Victory), to renewal (Habit 7). The "Circle of Influence" concept alone is worth the read.',
 'Principle-Centered Leadership',
 'Draw your "Circle of Concern" vs. "Circle of Influence." Spend 80% of your energy on what you can actually control.',
 1989, 4.55, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000004-0001-4000-8000-000000000007'::UUID, 'effectiveness'),
('a0000004-0001-4000-8000-000000000007'::UUID, 'character'),
('a0000004-0001-4000-8000-000000000007'::UUID, 'leadership');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000004-0001-4000-8000-000000000007'::UUID, '"Begin with the end in mind" — write your own eulogy. What do you want people to say about you? Live backwards from that vision.', 0),
('a0000004-0001-4000-8000-000000000007'::UUID, 'The "Circle of Influence" vs. "Circle of Concern" — reactive people focus on things they can''t control. Proactive people focus on things they CAN.', 1),
('a0000004-0001-4000-8000-000000000007'::UUID, '"Seek first to understand, then to be understood" — empathic listening (truly hearing someone) is the most underrated leadership skill.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000004-0007-4000-8000-000000000001'::UUID, 'a0000004-0001-4000-8000-000000000007'::UUID, 'INTRO', 0, 'Character Over Personality', 'Stephen Covey noticed that post-1920s success literature shifted from character (integrity, humility, fidelity) to personality (attitude, public image, techniques). The 7 Habits returns to character — the foundation that personality tricks can never replace.'),
('b0000004-0007-4000-8000-000000000002'::UUID, 'a0000004-0001-4000-8000-000000000007'::UUID, 'CONCEPT', 1, 'Circle of Influence', 'Draw two circles. The outer one is your "Circle of Concern" — everything you worry about (economy, weather, other people''s behavior). The inner one is your "Circle of Influence" — what you can actually affect. Effective people spend 80%+ of energy in the inner circle.'),
('b0000004-0007-4000-8000-000000000003'::UUID, 'a0000004-0001-4000-8000-000000000007'::UUID, 'CONCEPT', 2, 'The Maturity Continuum', 'Habits 1-3 (Be Proactive, Begin with End in Mind, Put First Things First) = Private Victory → independence. Habits 4-6 (Think Win-Win, Seek First to Understand, Synergize) = Public Victory → interdependence. Habit 7 (Sharpen the Saw) = Renewal. You must master private victory before public.'),
('b0000004-0007-4000-8000-000000000004'::UUID, 'a0000004-0001-4000-8000-000000000007'::UUID, 'QUOTE', 3, 'Covey on Proactivity', '"Between stimulus and response there is a space. In that space is our power to choose our response. In our response lies our growth and our freedom."'),
('b0000004-0007-4000-8000-000000000005'::UUID, 'a0000004-0001-4000-8000-000000000007'::UUID, 'SUMMARY', 4, 'The 7 Habits Checklist', '1. Be Proactive: focus on your Circle of Influence, not Concern.\n2. Begin with the End in Mind: write your personal mission statement.\n3. Put First Things First: do important-not-urgent before urgent-not-important.\n4. Seek First to Understand: listen to understand, not to reply.');

-- ── 8. Meditations ──────────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000004-0001-4000-8000-000000000008'::UUID, 'Meditations', 'Marcus Aurelius', 'lw-4', 'Personal Growth', 8, 5, 'INTERMEDIATE',
 'The private journal of a Roman emperor. Aurelius''s Stoic reflections on duty, mortality, and composure remain startlingly relevant 2,000 years later.',
 'Written as a private journal never meant for publication, Marcus Aurelius''s Meditations captures the daily Stoic practice of a Roman emperor. His reflections on controlling reactions, accepting mortality, and fulfilling duty provide an ancient operating system for modern stress.',
 'Stoic Philosophy — Dichotomy of Control',
 'Each morning, list 3 things within your control today and 3 things outside it. Invest energy ONLY in the first list.',
 180, 4.70, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000004-0001-4000-8000-000000000008'::UUID, 'stoicism'),
('a0000004-0001-4000-8000-000000000008'::UUID, 'philosophy'),
('a0000004-0001-4000-8000-000000000008'::UUID, 'classics');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000004-0001-4000-8000-000000000008'::UUID, 'You don''t control events — you control your response to events. This is the entire foundation of Stoicism, and it''s the most practical philosophy ever devised.', 0),
('a0000004-0001-4000-8000-000000000008'::UUID, '"Memento mori" — remember you will die. Not as depression, but as urgency. If you had 6 months to live, would you waste today on petty complaints?', 1),
('a0000004-0001-4000-8000-000000000008'::UUID, 'Aurelius ran the Roman Empire while journaling about patience, humility, and controlling his temper. The most powerful man in the world practiced the same self-discipline as a monk.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000004-0008-4000-8000-000000000001'::UUID, 'a0000004-0001-4000-8000-000000000008'::UUID, 'INTRO', 0, 'An Emperor''s Private Journal', 'Marcus Aurelius was the most powerful man in the world — Emperor of Rome. His Meditations was never meant for anyone else''s eyes. It''s a raw, honest record of a man reminding himself, daily, to be patient, to accept what he cannot change, and to fulfill his duty.'),
('b0000004-0008-4000-8000-000000000002'::UUID, 'a0000004-0001-4000-8000-000000000008'::UUID, 'CONCEPT', 1, 'The Dichotomy of Control', 'In your control: your thoughts, your actions, your effort. Not in your control: other people''s behavior, the weather, the economy, the past. Stoicism says: invest 100% of your energy in Column A and 0% in Column B. Everything else is wasted motion.'),
('b0000004-0008-4000-8000-000000000003'::UUID, 'a0000004-0001-4000-8000-000000000008'::UUID, 'CONCEPT', 2, 'Memento Mori', 'Remember you will die. This isn''t morbid — it''s liberating. If today were your last, would you waste it angry at traffic? Jealous of a colleague? Doom-scrolling? Death is the ultimate priority filter. Use it daily.'),
('b0000004-0008-4000-8000-000000000004'::UUID, 'a0000004-0001-4000-8000-000000000008'::UUID, 'QUOTE', 3, 'Aurelius on Obstacles', '"The impediment to action advances action. What stands in the way becomes the way."'),
('b0000004-0008-4000-8000-000000000005'::UUID, 'a0000004-0001-4000-8000-000000000008'::UUID, 'SUMMARY', 4, 'Daily Stoic Practice', '1. Morning: list 3 things in your control today. Focus only on those.\n2. When frustrated: "Is this in my control?" If no, release it.\n3. Evening: "Did I fulfill my duty today? Was I patient? Was I honest?"\n4. Memento mori: one day you won''t be here. Act accordingly.');

-- ── 9. Can''t Hurt Me ────────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000004-0001-4000-8000-000000000009'::UUID, 'Can''t Hurt Me', 'David Goggins', 'lw-4', 'Personal Growth', 8, 5, 'INTERMEDIATE',
 'The memoir of the toughest man alive. Goggins''s story from abused child to Navy SEAL to ultra-endurance legend is a masterclass in mental fortitude.',
 'David Goggins grew up in an abusive household, was overweight and directionless, then became a Navy SEAL, ultra-marathon runner, and the world record holder for pull-ups. His method: the "40% Rule" — when your mind says you''re done, you''re only at 40% of your capacity.',
 'The 40% Rule + Accountability Mirror',
 'When you want to quit, tell yourself: "I''m only at 40%." Push past the mental governor that stops you before physical failure.',
 2018, 4.55, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000004-0001-4000-8000-000000000009'::UUID, 'mental-toughness'),
('a0000004-0001-4000-8000-000000000009'::UUID, 'discipline'),
('a0000004-0001-4000-8000-000000000009'::UUID, 'resilience');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000004-0001-4000-8000-000000000009'::UUID, 'The "40% Rule": when your mind tells you to quit, you''re only at 40% of your capacity. The brain sends "stop" signals long before the body actually needs to stop.', 0),
('a0000004-0001-4000-8000-000000000009'::UUID, 'The "Accountability Mirror": every morning, look in the mirror and tell yourself the truth — what you need to do, what you''re avoiding, and what excuses you''re making.', 1),
('a0000004-0001-4000-8000-000000000009'::UUID, 'Suffering is a choice — not whether it happens, but whether it defines you. Goggins chose to use his worst experiences as fuel rather than excuses.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000004-0009-4000-8000-000000000001'::UUID, 'a0000004-0001-4000-8000-000000000009'::UUID, 'INTRO', 0, 'Forged in Pain', 'David Goggins was beaten by his father, bullied at school, and working as a 300-pound exterminator. Then he decided to become a Navy SEAL. Can''t Hurt Me is the raw, unfiltered story of how he rebuilt himself through sheer will — and the tools he used to do it.'),
('b0000004-0009-4000-8000-000000000002'::UUID, 'a0000004-0001-4000-8000-000000000009'::UUID, 'CONCEPT', 1, 'The 40% Rule', 'Your brain is a survival machine. It sends "quit" signals at 40% capacity to protect you from danger. But in the modern world, those signals fire during workouts, exams, and difficult conversations — not actual danger. Recognize the signal. Override it. You have 60% more in the tank.'),
('b0000004-0009-4000-8000-000000000003'::UUID, 'a0000004-0001-4000-8000-000000000009'::UUID, 'CONCEPT', 2, 'The Accountability Mirror', 'Every morning, Goggins stands in front of a mirror covered in Post-It notes. Each note is a truth: a goal, an insecurity, a task he''s avoiding. He looks himself in the eye and reads them aloud. No excuses. No hiding. The mirror reflects who you ARE, not who you wish you were.'),
('b0000004-0009-4000-8000-000000000004'::UUID, 'a0000004-0001-4000-8000-000000000009'::UUID, 'QUOTE', 3, 'Goggins on Comfort', '"You are in danger of living a life so comfortable and soft, that you will die without ever realizing your potential."'),
('b0000004-0009-4000-8000-000000000005'::UUID, 'a0000004-0001-4000-8000-000000000009'::UUID, 'SUMMARY', 4, 'Harden Your Mind', '1. When you want to quit: "I''m at 40%. I have more." Push 5% further.\n2. Accountability Mirror: Post-it your goals and truths. Read them daily.\n3. Do one uncomfortable thing every day — cold shower, hard workout, difficult conversation.\n4. "Callous your mind" — repeated exposure to discomfort builds mental armor.');
