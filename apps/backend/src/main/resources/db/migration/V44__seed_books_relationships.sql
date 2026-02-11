-- V44: Seed Essentia Books — lw-5 Relationships & Family (10 books)
-- Love, attachment, communication, and family dynamics

-- ── 1. The 5 Love Languages ─────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000005-0001-4000-8000-000000000001'::UUID, 'The 5 Love Languages', 'Gary Chapman', 'lw-5', 'Relationships & Family', 7, 5, 'BEGINNER',
 'The decoder ring for romantic relationships. Chapman shows that people speak different "love languages" — and mismatched languages cause most relationship conflict.',
 'Gary Chapman''s framework reveals that people express and receive love in five distinct ways: Words of Affirmation, Acts of Service, Receiving Gifts, Quality Time, and Physical Touch. Most relationship conflict stems from partners speaking different languages.',
 'Five Love Languages Framework',
 'Identify your love language AND your partner''s. Practice "speaking" their language daily, even if it''s not natural to you.',
 1992, 4.60, 0, TRUE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000005-0001-4000-8000-000000000001'::UUID, 'love'),
('a0000005-0001-4000-8000-000000000001'::UUID, 'communication'),
('a0000005-0001-4000-8000-000000000001'::UUID, 'relationships');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000005-0001-4000-8000-000000000001'::UUID, 'The five love languages: Words of Affirmation, Acts of Service, Receiving Gifts, Quality Time, and Physical Touch. Everyone has a primary language.', 0),
('a0000005-0001-4000-8000-000000000001'::UUID, 'Most relationship frustration = speaking YOUR love language instead of THEIRS. You''re cooking dinner (Acts of Service) while they crave a hug (Physical Touch).', 1),
('a0000005-0001-4000-8000-000000000001'::UUID, 'Love languages apply to all relationships — children, friends, coworkers, parents. Not just romantic partners.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000005-0001-4000-8000-000000000001'::UUID, 'a0000005-0001-4000-8000-000000000001'::UUID, 'INTRO', 0, 'Why Love Gets Lost in Translation', 'You''re doing everything right. Cooking, cleaning, working hard. But your partner says they don''t feel loved. Why? Because your love language is Acts of Service and theirs is Words of Affirmation. You''re shouting love — in a language they don''t speak.'),
('b0000005-0001-4000-8000-000000000002'::UUID, 'a0000005-0001-4000-8000-000000000001'::UUID, 'CONCEPT', 1, 'The Five Languages', 'Words of Affirmation: "I love you." "I''m proud of you." Acts of Service: Doing the dishes. Filling the gas tank. Receiving Gifts: Thoughtful presents (cost doesn''t matter — thought does). Quality Time: Undivided attention. Physical Touch: Hugs, holding hands, sitting close.'),
('b0000005-0001-4000-8000-000000000003'::UUID, 'a0000005-0001-4000-8000-000000000001'::UUID, 'CONCEPT', 2, 'Speak Their Language', 'The key insight: loving someone in YOUR language is easy but ineffective. Loving them in THEIR language requires effort but transforms the relationship. Ask: "What makes you feel most loved?" Then do THAT — even if it feels foreign to you.'),
('b0000005-0001-4000-8000-000000000004'::UUID, 'a0000005-0001-4000-8000-000000000001'::UUID, 'QUOTE', 3, 'Chapman on Love', '"People tend to give love in the way they prefer to receive it. But what makes YOU feel loved may not be what makes THEM feel loved."'),
('b0000005-0001-4000-8000-000000000005'::UUID, 'a0000005-0001-4000-8000-000000000001'::UUID, 'SUMMARY', 4, 'Love in Their Language', '1. Take the love language quiz (both of you).\n2. Identify your primary language and your partner''s.\n3. Practice ONE act in their language daily.\n4. When you feel unloved, ask: "Am I expecting MY language or accepting THEIRS?"');

-- ── 2. Attached ─────────────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000005-0001-4000-8000-000000000002'::UUID, 'Attached', 'Amir Levine & Rachel Heller', 'lw-5', 'Relationships & Family', 8, 5, 'INTERMEDIATE',
 'Attachment theory applied to adult relationships. Understanding whether you''re Secure, Anxious, or Avoidant transforms how you date and love.',
 'Levine and Heller bring neuroscience to dating. Their framework reveals three attachment styles — Secure, Anxious, and Avoidant — that predict relationship patterns. Understanding your style (and your partner''s) explains why some relationships feel effortless and others feel impossible.',
 'Adult Attachment Theory',
 'Identify your attachment style. Learn the "protest behaviors" of Anxious types and the "deactivation strategies" of Avoidant types. Build toward Secure.',
 2010, 4.55, 0, TRUE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000005-0001-4000-8000-000000000002'::UUID, 'attachment'),
('a0000005-0001-4000-8000-000000000002'::UUID, 'dating'),
('a0000005-0001-4000-8000-000000000002'::UUID, 'neuroscience');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000005-0001-4000-8000-000000000002'::UUID, 'Three attachment styles: Secure (comfortable with intimacy), Anxious (crave closeness, fear abandonment), Avoidant (value independence, uncomfortable with closeness).', 0),
('a0000005-0001-4000-8000-000000000002'::UUID, 'The "Anxious-Avoidant Trap": Anxious and Avoidant types are magnetically attracted to each other — and create relationships that feel intensely passionate but deeply unstable.', 1),
('a0000005-0001-4000-8000-000000000002'::UUID, 'Attachment style is NOT fixed — you can move toward Secure through awareness, therapy, and choosing secure partners or friends.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000005-0002-4000-8000-000000000001'::UUID, 'a0000005-0001-4000-8000-000000000002'::UUID, 'INTRO', 0, 'Why You Love the Way You Do', 'Ever wondered why some relationships feel easy and others feel like an emotional rollercoaster? The answer isn''t compatibility or chemistry — it''s attachment style. Levine and Heller decode the neuroscience behind your relationship patterns.'),
('b0000005-0002-4000-8000-000000000002'::UUID, 'a0000005-0001-4000-8000-000000000002'::UUID, 'CONCEPT', 1, 'The Three Styles', 'Secure (~50%): "I trust that closeness is safe." Comfortable with intimacy and independence. Anxious (~20%): "I need reassurance that you won''t leave." Hypervigilant about partner''s mood. Avoidant (~25%): "I need space; closeness feels suffocating." Pulls away when things get serious.'),
('b0000005-0002-4000-8000-000000000003'::UUID, 'a0000005-0001-4000-8000-000000000002'::UUID, 'CONCEPT', 2, 'The Anxious-Avoidant Trap', 'Anxious: sends 5 texts, Avoidant: pulls away. Anxious panics: sends 10 more. Avoidant suffocates: goes silent. The "passion" is actually dysregulated attachment. Real love doesn''t feel like a panic attack. If it does, check your attachment styles.'),
('b0000005-0002-4000-8000-000000000004'::UUID, 'a0000005-0001-4000-8000-000000000002'::UUID, 'QUOTE', 3, 'On Attachment', '"Dependency is not a weakness. It is a biological fact. We are wired to depend on a few select individuals — and when that bond is threatened, our brain treats it like a survival emergency."'),
('b0000005-0002-4000-8000-000000000005'::UUID, 'a0000005-0001-4000-8000-000000000002'::UUID, 'SUMMARY', 4, 'Know Your Style', '1. Take an attachment style quiz — identify your dominant pattern.\n2. If Anxious: learn your "protest behaviors" (excessive texting, jealousy, testing).\n3. If Avoidant: learn your "deactivating strategies" (nitpicking, pulling away, fantasizing about exes).\n4. Seek Secure partners — they regulate the nervous system of both styles.');

-- ── 3. Nonviolent Communication ─────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000005-0001-4000-8000-000000000003'::UUID, 'Nonviolent Communication', 'Marshall B. Rosenberg', 'lw-5', 'Relationships & Family', 8, 5, 'INTERMEDIATE',
 'The communication system that prevents 90% of arguments. Rosenberg''s 4-step process separates observation from judgment and requests from demands.',
 'Marshall Rosenberg developed a communication framework used in conflict zones worldwide. NVC separates observation from evaluation, connects feelings to needs, and transforms demands into requests — preventing escalation before it starts.',
 'Observation → Feeling → Need → Request',
 'In your next conflict, use the NVC formula: "When I see/hear [observation], I feel [feeling], because I need [need]. Would you be willing to [request]?"',
 1999, 4.50, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000005-0001-4000-8000-000000000003'::UUID, 'communication'),
('a0000005-0001-4000-8000-000000000003'::UUID, 'conflict-resolution'),
('a0000005-0001-4000-8000-000000000003'::UUID, 'empathy');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000005-0001-4000-8000-000000000003'::UUID, 'Most arguments escalate because we mix observations with judgments: "You never listen" (judgment) vs. "When I spoke and you looked at your phone" (observation).', 0),
('a0000005-0001-4000-8000-000000000003'::UUID, 'Behind every anger is an unmet need — safety, respect, connection, autonomy. Express the need, not the anger.', 1),
('a0000005-0001-4000-8000-000000000003'::UUID, 'A request says "Would you be willing to...?" A demand says "You need to..." Requests invite cooperation. Demands invite resistance.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000005-0003-4000-8000-000000000001'::UUID, 'a0000005-0001-4000-8000-000000000003'::UUID, 'INTRO', 0, 'Words That Heal or Harm', 'Marshall Rosenberg used this communication method to mediate between warring factions in Rwanda, Palestine, and inner-city gangs. If it works there, it can work in your marriage, your office, and your family dinner table.'),
('b0000005-0003-4000-8000-000000000002'::UUID, 'a0000005-0001-4000-8000-000000000003'::UUID, 'CONCEPT', 1, 'The 4 Steps', 'Step 1: Observation (what you see/hear, no judgment). Step 2: Feeling (how it makes you feel). Step 3: Need (what underlying need is connected). Step 4: Request (a concrete, doable ask). Example: "When I see dishes in the sink (observation), I feel overwhelmed (feeling), because I need order to relax (need). Would you be willing to do them before dinner? (request)"'),
('b0000005-0003-4000-8000-000000000003'::UUID, 'a0000005-0001-4000-8000-000000000003'::UUID, 'CONCEPT', 2, 'Empathic Listening', 'NVC isn''t just about speaking — it''s about hearing. When someone attacks you, translate: "You''re so selfish!" → They might be saying: "I feel lonely because I need connection." Hear the need behind the words. Respond to the need, not the attack.'),
('b0000005-0003-4000-8000-000000000004'::UUID, 'a0000005-0001-4000-8000-000000000003'::UUID, 'QUOTE', 3, 'Rosenberg on Language', '"Every criticism, judgment, diagnosis, and expression of anger is the tragic expression of an unmet need."'),
('b0000005-0003-4000-8000-000000000005'::UUID, 'a0000005-0001-4000-8000-000000000003'::UUID, 'SUMMARY', 4, 'Communicate Without Violence', '1. Replace judgments with observations: "You always..." → "I noticed that..."\n2. Name your feeling: not "I feel that you..." but "I feel sad/frustrated/anxious."\n3. Connect to the need: "...because I need respect/connection/safety."\n4. Make a request, not a demand: "Would you be willing to...?"');

-- ── 4. Hold Me Tight ────────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000005-0001-4000-8000-000000000004'::UUID, 'Hold Me Tight', 'Dr. Sue Johnson', 'lw-5', 'Relationships & Family', 8, 5, 'INTERMEDIATE',
 'Emotionally Focused Therapy (EFT) for couples. Johnson reveals that beneath every fight is a desperate plea: "Are you there for me?"',
 'Dr. Sue Johnson, creator of Emotionally Focused Therapy, reveals that beneath every argument — about dishes, money, or kids — is a deeper question: "Are you there for me? Can I count on you?" Learning to hear (and answer) this question transforms relationships.',
 'Emotionally Focused Therapy (EFT)',
 'In your next argument, pause and ask your partner: "What are you really afraid of right now?" The surface argument is never the real issue.',
 2008, 4.55, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000005-0001-4000-8000-000000000004'::UUID, 'couples-therapy'),
('a0000005-0001-4000-8000-000000000004'::UUID, 'emotional-bonding'),
('a0000005-0001-4000-8000-000000000004'::UUID, 'attachment');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000005-0001-4000-8000-000000000004'::UUID, 'Every couple fight follows a "Demon Dialogue" — a repeating pattern where both partners trigger each other''s deepest fears (abandonment vs. inadequacy).', 0),
('a0000005-0001-4000-8000-000000000004'::UUID, 'The question beneath every argument: "Are you there for me? Do I matter to you? Will you respond when I need you?"', 1),
('a0000005-0001-4000-8000-000000000004'::UUID, 'Vulnerability is the bridge to connection. The partner who says "I''m scared you don''t love me" creates more intimacy than the one who says "You never pay attention."', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000005-0004-4000-8000-000000000001'::UUID, 'a0000005-0001-4000-8000-000000000004'::UUID, 'INTRO', 0, 'The Hidden Conversation', 'Sue Johnson has spent 30 years helping couples on the brink of divorce. Her discovery: every fight about money, chores, or parenting is actually a fight about emotional safety. "Hold Me Tight" reveals the hidden conversation — and how to have it.'),
('b0000005-0004-4000-8000-000000000002'::UUID, 'a0000005-0001-4000-8000-000000000004'::UUID, 'CONCEPT', 1, 'Demon Dialogues', 'Three destructive patterns: 1. "Find the Bad Guy" — both partners blame each other. 2. "Protest Polka" — one pursues (anxious), the other withdraws (avoidant). 3. "Freeze and Flee" — both withdraw into silence. Recognizing YOUR pattern is the first step to breaking it.'),
('b0000005-0004-4000-8000-000000000003'::UUID, 'a0000005-0001-4000-8000-000000000004'::UUID, 'CONCEPT', 2, 'A.R.E. — The Bonding Conversation', 'To build secure attachment: A — Accessibility ("Can I reach you?"), R — Responsiveness ("Can I rely on you to respond?"), E — Engagement ("Do I know you will value me and stay close?"). When all three are present, the relationship feels safe. When any is missing, the Demon Dialogues emerge.'),
('b0000005-0004-4000-8000-000000000004'::UUID, 'a0000005-0001-4000-8000-000000000004'::UUID, 'QUOTE', 3, 'Johnson on Connection', '"The most functional way to regulate difficult emotions is to share them with someone you trust. Human connection is not a luxury. It is a biological imperative."'),
('b0000005-0004-4000-8000-000000000005'::UUID, 'a0000005-0001-4000-8000-000000000004'::UUID, 'SUMMARY', 4, 'Build Secure Bonds', '1. Identify your Demon Dialogue (Blame/Pursue-Withdraw/Freeze-Flee).\n2. In your next argument, pause: "What am I REALLY afraid of right now?"\n3. Share the fear, not the complaint: "I''m afraid you don''t need me" vs. "You never help."\n4. Practice A.R.E.: Be Accessible, Responsive, and Engaged.');

-- ── 5. The Whole-Brain Child ────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000005-0001-4000-8000-000000000005'::UUID, 'The Whole-Brain Child', 'Daniel J. Siegel & Tina Payne Bryson', 'lw-5', 'Relationships & Family', 7, 5, 'BEGINNER',
 'Neuroscience-based parenting. Siegel''s "Name It to Tame It" technique and whole-brain integration strategies transform tantrums into teaching moments.',
 'Siegel and Bryson translate brain science into practical parenting. Their key insight: children (and adults) have an "upstairs brain" (logical) and a "downstairs brain" (emotional). Tantrums happen when the downstairs brain hijacks. The solution: connect emotionally FIRST, then redirect logically.',
 'Connect and Redirect',
 'During a child''s meltdown, connect first ("I see you''re really upset"), then redirect ("Let''s figure this out together"). Logic doesn''t work on a flooded brain.',
 2011, 4.60, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000005-0001-4000-8000-000000000005'::UUID, 'parenting'),
('a0000005-0001-4000-8000-000000000005'::UUID, 'neuroscience'),
('a0000005-0001-4000-8000-000000000005'::UUID, 'child-development');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000005-0001-4000-8000-000000000005'::UUID, '"Name It to Tame It" — when a child (or adult) labels an emotion, the prefrontal cortex activates and calms the amygdala. Simply naming "I''m angry" reduces anger.', 0),
('a0000005-0001-4000-8000-000000000005'::UUID, '"Connect and Redirect" — during emotional flooding, connect with empathy FIRST (right brain), then redirect with logic (left brain). Logic fails on a flooded brain.', 1),
('a0000005-0001-4000-8000-000000000005'::UUID, 'Every meltdown is a brain-building opportunity — how you respond to a child''s dysregulation literally wires their brain for emotional regulation.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000005-0005-4000-8000-000000000001'::UUID, 'a0000005-0001-4000-8000-000000000005'::UUID, 'INTRO', 0, 'Your Child''s Brain, Explained', 'Your 3-year-old is screaming in the grocery store. Your instinct: lecture, threaten, or bribe. Siegel and Bryson reveal why none of those work — and what does. It starts with understanding which part of your child''s brain is in charge right now.'),
('b0000005-0005-4000-8000-000000000002'::UUID, 'a0000005-0001-4000-8000-000000000005'::UUID, 'CONCEPT', 1, 'Upstairs vs. Downstairs Brain', 'The "downstairs brain" (brainstem + limbic) is the emotional reactor — fight, flight, freeze. The "upstairs brain" (prefrontal cortex) is the rational thinker — empathy, planning, self-control. During a tantrum, the downstairs brain has locked the upstairs brain out. You can''t reason with a locked-out brain.'),
('b0000005-0005-4000-8000-000000000003'::UUID, 'a0000005-0001-4000-8000-000000000005'::UUID, 'CONCEPT', 2, 'Name It to Tame It', 'When your child is upset, help them name the feeling: "You''re really frustrated that your tower fell down." This activates the left brain (language) and creates a bridge to the upstairs brain. Research shows that labeling emotions reduces their intensity by up to 50%.'),
('b0000005-0005-4000-8000-000000000004'::UUID, 'a0000005-0001-4000-8000-000000000005'::UUID, 'QUOTE', 3, 'On Parenting Through Meltdowns', '"When your child is drowning in an emotional flood, don''t start with teaching. Start with a life raft. Connect first. Redirect second."'),
('b0000005-0005-4000-8000-000000000005'::UUID, 'a0000005-0001-4000-8000-000000000005'::UUID, 'SUMMARY', 4, 'Whole-Brain Parenting', '1. During meltdowns: Connect first ("I see you''re upset"), Redirect second ("Let''s solve this").\n2. Name It to Tame It: help children label emotions.\n3. Engage, don''t enrage: get on their physical level (kneel down).\n4. After calm, retell the story: "Remember when you were angry? You calmed yourself down. That was brave."');

-- ── 6. Set Boundaries, Find Peace ───────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000005-0001-4000-8000-000000000006'::UUID, 'Set Boundaries, Find Peace', 'Nedra Glennon Tawwab', 'lw-5', 'Relationships & Family', 7, 5, 'BEGINNER',
 'The practical guide to boundaries. Tawwab identifies 6 types of boundaries and provides scripts for every difficult conversation.',
 'Therapist Nedra Glennon Tawwab provides the definitive guide to setting and maintaining boundaries in every relationship. She identifies six types of boundaries (physical, sexual, intellectual, emotional, material, time) and provides word-for-word scripts for the hardest conversations.',
 'Six Types of Boundaries',
 'Identify your weakest boundary type. Write a script for ONE boundary conversation this week. Practice it. Have it.',
 2021, 4.45, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000005-0001-4000-8000-000000000006'::UUID, 'boundaries'),
('a0000005-0001-4000-8000-000000000006'::UUID, 'self-care'),
('a0000005-0001-4000-8000-000000000006'::UUID, 'therapy');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000005-0001-4000-8000-000000000006'::UUID, 'Boundaries are not walls — they''re bridges. They tell people how to have a healthy relationship with you, not to stay away.', 0),
('a0000005-0001-4000-8000-000000000006'::UUID, 'If you feel resentment, you have a boundary problem. Resentment is the alarm bell that says "I''m giving more than I want to."', 1),
('a0000005-0001-4000-8000-000000000006'::UUID, 'The six boundary types: Physical, Sexual, Intellectual, Emotional, Material, and Time. Most people have one strong type and one dangerously weak one.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000005-0006-4000-8000-000000000001'::UUID, 'a0000005-0001-4000-8000-000000000006'::UUID, 'INTRO', 0, 'The Resentment Signal', 'If you constantly feel drained, used, or resentful in relationships, you don''t have a "people problem" — you have a boundary problem. Nedra Tawwab provides the framework and exact words to fix it.'),
('b0000005-0006-4000-8000-000000000002'::UUID, 'a0000005-0001-4000-8000-000000000006'::UUID, 'CONCEPT', 1, 'Six Boundary Types', 'Physical: personal space, touch preferences. Sexual: consent, comfort levels. Intellectual: respect for ideas and opinions. Emotional: not absorbing others'' feelings. Material: lending money, sharing possessions. Time: how you spend your hours. Which type do you neglect?'),
('b0000005-0006-4000-8000-000000000003'::UUID, 'a0000005-0001-4000-8000-000000000006'::UUID, 'CONCEPT', 2, 'The Boundary Script', 'Template: "I feel [emotion] when [situation]. I need [boundary]. Going forward, I will [action]." Example: "I feel overwhelmed when you call after 9 PM. I need evenings to recharge. Going forward, I''ll return calls the next morning." State it. Don''t apologize for it.'),
('b0000005-0006-4000-8000-000000000004'::UUID, 'a0000005-0001-4000-8000-000000000006'::UUID, 'QUOTE', 3, 'Tawwab on Boundaries', '"Boundaries aren''t mean. They''re not selfish. And they''re not optional. They are the foundation of every healthy relationship you will ever have."'),
('b0000005-0006-4000-8000-000000000005'::UUID, 'a0000005-0001-4000-8000-000000000006'::UUID, 'SUMMARY', 4, 'Set Your Boundaries', '1. Identify where you feel resentment — that''s where boundaries are missing.\n2. Determine the boundary type (physical, emotional, time, etc.).\n3. Write your script: "I feel... when... I need... Going forward, I will..."\n4. Deliver it calmly. Don''t apologize. Don''t over-explain.');

-- ── 7. Mating in Captivity ──────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000005-0001-4000-8000-000000000007'::UUID, 'Mating in Captivity', 'Esther Perel', 'lw-5', 'Relationships & Family', 8, 5, 'ADVANCED',
 'Why desire fades in long-term relationships and how to reignite it. Perel reveals the paradox between security and eroticism.',
 'Esther Perel addresses the uncomfortable truth: the qualities that make a great partnership (safety, predictability, closeness) are the OPPOSITE of what fuels desire (mystery, novelty, distance). Maintaining both requires deliberate practice, not more date nights.',
 'Security vs. Desire Paradox',
 'Cultivate "erotic separateness" — maintain individual interests, friendships, and mystery within the relationship. Predictability kills desire.',
 2006, 4.50, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000005-0001-4000-8000-000000000007'::UUID, 'intimacy'),
('a0000005-0001-4000-8000-000000000007'::UUID, 'desire'),
('a0000005-0001-4000-8000-000000000007'::UUID, 'long-term-relationships');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000005-0001-4000-8000-000000000007'::UUID, 'Security and desire need different conditions: security needs closeness, desire needs distance. This is the central paradox of long-term relationships.', 0),
('a0000005-0001-4000-8000-000000000007'::UUID, 'Desire is not spontaneous after the first year — it must be CULTIVATED through novelty, anticipation, and maintaining individual identities.', 1),
('a0000005-0001-4000-8000-000000000007'::UUID, '"Erotic separateness" — maintaining your own world, interests, and mystery — is more effective than more "togetherness" for reigniting desire.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000005-0007-4000-8000-000000000001'::UUID, 'a0000005-0001-4000-8000-000000000007'::UUID, 'INTRO', 0, 'The Domestication of Desire', 'Esther Perel, the world''s foremost relationship therapist, asks: why does desire fade in happy relationships? Her answer challenges everything we think we know about love — because the problem isn''t the relationship. It''s the very closeness we worked so hard to build.'),
('b0000005-0007-4000-8000-000000000002'::UUID, 'a0000005-0001-4000-8000-000000000007'::UUID, 'CONCEPT', 1, 'The Paradox', 'Love seeks closeness: "I know everything about you." Desire seeks mystery: "I don''t fully know you." When partners merge completely — finishing each other''s sentences, sharing every thought — they eliminate the distance that desire needs to travel.'),
('b0000005-0007-4000-8000-000000000003'::UUID, 'a0000005-0001-4000-8000-000000000007'::UUID, 'CONCEPT', 2, 'Erotic Separateness', 'The antidote: maintain your own world. Have friends your partner doesn''t know. Pursue hobbies they don''t share. When you watch your partner doing something they''re passionate about — in their element, not "yours" — desire reignites because you see them as a separate, interesting person again.'),
('b0000005-0007-4000-8000-000000000004'::UUID, 'a0000005-0001-4000-8000-000000000007'::UUID, 'QUOTE', 3, 'Perel on Desire', '"Fire needs air. Take two logs and put them right next to each other — the fire goes out. Give them some space and the flame reignites."'),
('b0000005-0007-4000-8000-000000000005'::UUID, 'a0000005-0001-4000-8000-000000000007'::UUID, 'SUMMARY', 4, 'Reignite the Flame', '1. Maintain individual interests and friendships — closeness ≠ merger.\n2. Create anticipation: plan experiences, not just routines.\n3. Watch your partner "in their element" — doing what they love, away from you.\n4. Replace "How was your day?" with "What surprised you today?"');

-- ── 8. How to Talk So Kids Will Listen ──────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000005-0001-4000-8000-000000000008'::UUID, 'How to Talk So Kids Will Listen', 'Adele Faber & Elaine Mazlish', 'lw-5', 'Relationships & Family', 7, 5, 'BEGINNER',
 'The parenting communication bible. Faber and Mazlish provide scripts that replace threats, lectures, and punishment with cooperation and respect.',
 'The most practical parenting book ever written. Faber and Mazlish provide word-for-word scripts for the 10 most common parent-child conflicts — replacing lectures, threats, and punishment with techniques that actually produce cooperation.',
 'Acknowledge Feelings → Describe Problem → Give Information',
 'Replace "Don''t do that!" with "I see [problem]. The rule is [information]. Can you think of a solution?" Kids cooperate more when they''re problem-solvers, not rule-followers.',
 1980, 4.65, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000005-0001-4000-8000-000000000008'::UUID, 'parenting'),
('a0000005-0001-4000-8000-000000000008'::UUID, 'communication'),
('a0000005-0001-4000-8000-000000000008'::UUID, 'cooperation');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000005-0001-4000-8000-000000000008'::UUID, 'When a child says "I hate my brother," don''t correct the feeling ("No you don''t!"). Acknowledge it: "You''re really angry with him right now." Acknowledged feelings dissipate. Denied feelings intensify.', 0),
('a0000005-0001-4000-8000-000000000008'::UUID, 'Describe the problem instead of blaming the child: "I see a wet towel on the bed" works better than "You always leave your towel on the bed!" One invites action; the other invites defensiveness.', 1),
('a0000005-0001-4000-8000-000000000008'::UUID, 'Give information instead of orders: "Milk turns sour when it''s not refrigerated" is more effective than "Put the milk away!" Information empowers; orders provoke resistance.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000005-0008-4000-8000-000000000001'::UUID, 'a0000005-0001-4000-8000-000000000008'::UUID, 'INTRO', 0, 'Parenting Without Yelling', 'Every parent eventually resorts to yelling, threatening, or bribing. Faber and Mazlish discovered that children don''t respond to those because they trigger defense, not cooperation. This book provides the alternative — and it works within the first week.'),
('b0000005-0008-4000-8000-000000000002'::UUID, 'a0000005-0001-4000-8000-000000000008'::UUID, 'CONCEPT', 1, 'Acknowledge, Don''t Deny', 'Child: "I hate school!" Wrong: "No you don''t, school is great!" Right: "Sounds like you had a really tough day." When feelings are acknowledged, children feel heard and calm down. When denied, they escalate to prove their feelings are real.'),
('b0000005-0008-4000-8000-000000000003'::UUID, 'a0000005-0001-4000-8000-000000000008'::UUID, 'CONCEPT', 2, 'Describe, Don''t Blame', 'Instead of "You never put your shoes away!" say "I see shoes in the hallway." Instead of "Stop hitting your sister!" say "I see two kids who need help solving a problem." Describing the situation invites the child to be part of the solution. Blaming makes them the problem.'),
('b0000005-0008-4000-8000-000000000004'::UUID, 'a0000005-0001-4000-8000-000000000008'::UUID, 'QUOTE', 3, 'On Feelings', '"When children feel right, they behave right. When they feel wrong, they behave wrong. The fastest path to good behavior is acknowledging how they feel."'),
('b0000005-0008-4000-8000-000000000005'::UUID, 'a0000005-0001-4000-8000-000000000008'::UUID, 'SUMMARY', 4, 'Talk So They Listen', '1. Acknowledge feelings: "You''re really frustrated right now."\n2. Describe the problem: "I see a jacket on the floor."\n3. Give information: "Jackets last longer in the closet."\n4. Invite solutions: "What can we do about this?"');

-- ── 9. The Seven Principles for Making Marriage Work ─────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000005-0001-4000-8000-000000000009'::UUID, 'The Seven Principles for Making Marriage Work', 'John Gottman', 'lw-5', 'Relationships & Family', 9, 5, 'INTERMEDIATE',
 'The gold-standard relationship science. Gottman can predict divorce with 94% accuracy — and his 7 principles prevent it.',
 'John Gottman''s "Love Lab" research can predict divorce with 94% accuracy. His 7 principles, backed by 40+ years of data, focus on building "love maps" (deep knowledge of your partner), maintaining a 5:1 positivity ratio, and turning TOWARD your partner''s bids for connection.',
 'The Gottman Method — Sound Relationship House',
 'Track your "Turning Toward" ratio this week. Every time your partner makes a bid for attention, respond positively. The magic ratio is 5 positive for every 1 negative.',
 1999, 4.70, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000005-0001-4000-8000-000000000009'::UUID, 'marriage'),
('a0000005-0001-4000-8000-000000000009'::UUID, 'research'),
('a0000005-0001-4000-8000-000000000009'::UUID, 'relationships');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000005-0001-4000-8000-000000000009'::UUID, 'The "Four Horsemen" that predict divorce: Criticism, Contempt, Defensiveness, and Stonewalling. Contempt is the #1 predictor — it communicates disgust.', 0),
('a0000005-0001-4000-8000-000000000009'::UUID, 'Happy couples have a 5:1 ratio of positive to negative interactions. It''s not about avoiding conflict — it''s about maintaining the positive balance.', 1),
('a0000005-0001-4000-8000-000000000009'::UUID, '"Turning toward" — responding to your partner''s small bids for connection (a comment, a touch, a question) — is the single most important daily practice.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000005-0009-4000-8000-000000000001'::UUID, 'a0000005-0001-4000-8000-000000000009'::UUID, 'INTRO', 0, 'The Love Lab', 'John Gottman can watch a couple argue for 15 minutes and predict with 94% accuracy whether they''ll divorce. His Seattle "Love Lab" has studied thousands of couples over 40 years. These 7 principles are what separates the "masters" from the "disasters" of relationships.'),
('b0000005-0009-4000-8000-000000000002'::UUID, 'a0000005-0001-4000-8000-000000000009'::UUID, 'CONCEPT', 1, 'The Four Horsemen', 'Criticism: attacking character ("You always..."). Contempt: expressing disgust (eye-rolling, mockery). Defensiveness: deflecting responsibility ("It''s not my fault"). Stonewalling: shutting down completely. If contempt is present, the relationship is in critical condition.'),
('b0000005-0009-4000-8000-000000000003'::UUID, 'a0000005-0001-4000-8000-000000000009'::UUID, 'CONCEPT', 2, 'Turning Toward', 'Your partner says "Look at that bird!" This is a "bid for connection." You can turn toward ("Oh wow, it''s beautiful"), turn away (silence), or turn against ("I''m busy"). Gottman found that couples who divorce turn toward bids 33% of the time. Couples who stay together: 86%.'),
('b0000005-0009-4000-8000-000000000004'::UUID, 'a0000005-0001-4000-8000-000000000009'::UUID, 'QUOTE', 3, 'Gottman on Contempt', '"Contempt is the sulfuric acid of love. If you treat your partner with contempt, you are communicating: you are beneath me. No relationship survives sustained contempt."'),
('b0000005-0009-4000-8000-000000000005'::UUID, 'a0000005-0001-4000-8000-000000000009'::UUID, 'SUMMARY', 4, 'The Marriage Essentials', '1. Build Love Maps: know your partner''s world (friends, stresses, dreams).\n2. Maintain 5:1 positive-to-negative ratio — even during conflict.\n3. Turn toward bids for connection — the small moments matter most.\n4. Replace the Four Horsemen with antidotes: Gentle Startup, Appreciation, Responsibility, Self-Soothing.');

-- ── 10. Adult Children of Emotionally Immature Parents ───────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000005-0001-4000-8000-000000000010'::UUID, 'Adult Children of Emotionally Immature Parents', 'Lindsay C. Gibson', 'lw-5', 'Relationships & Family', 8, 5, 'INTERMEDIATE',
 'The healing guide for those raised by emotionally unavailable parents. Gibson identifies 4 types of immature parents and the recovery path.',
 'Lindsay Gibson helps adults understand why their childhood felt lonely despite having "good enough" parents. She identifies four types of emotionally immature parents (Emotional, Driven, Passive, Rejecting) and provides a recovery framework for reclaiming your emotional life.',
 'Emotional Maturity Recovery',
 'Identify which of the 4 immature parent types raised you. Recognize the survival patterns you developed. Begin replacing them with authentic self-expression.',
 2015, 4.55, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000005-0001-4000-8000-000000000010'::UUID, 'healing'),
('a0000005-0001-4000-8000-000000000010'::UUID, 'family-of-origin'),
('a0000005-0001-4000-8000-000000000010'::UUID, 'emotional-maturity');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000005-0001-4000-8000-000000000010'::UUID, 'Emotionally immature parents aren''t necessarily abusive — they''re emotionally unavailable. The child learns: "My feelings don''t matter." This pattern persists into adulthood.', 0),
('a0000005-0001-4000-8000-000000000010'::UUID, 'Four types: Emotional (reactive, dramatic), Driven (perfectionistic, controlling), Passive (avoidant, uninvolved), Rejecting (dismissive, hostile). Each creates different survival patterns in children.', 1),
('a0000005-0001-4000-8000-000000000010'::UUID, 'Recovery begins with recognizing your "role self" (the adapted persona you created to survive) vs. your "true self" (who you actually are underneath).', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000005-0010-4000-8000-000000000001'::UUID, 'a0000005-0001-4000-8000-000000000010'::UUID, 'INTRO', 0, 'The Invisible Wound', 'You had food, shelter, and school supplies. But something was missing. You couldn''t name it as a child. Lindsay Gibson names it: emotional attunement. Your parents were there physically but absent emotionally — and that absence shaped everything about how you relate to others.'),
('b0000005-0010-4000-8000-000000000002'::UUID, 'a0000005-0001-4000-8000-000000000010'::UUID, 'CONCEPT', 1, 'The Four Types', 'Emotional Parent: their feelings fill the room — you learned to manage THEIR emotions. Driven Parent: achievement was love — you learned to perform, not to feel. Passive Parent: they were physically present but emotionally absent — you learned you don''t matter. Rejecting Parent: closeness was punished — you learned to hide.'),
('b0000005-0010-4000-8000-000000000003'::UUID, 'a0000005-0001-4000-8000-000000000010'::UUID, 'CONCEPT', 2, 'Role Self vs. True Self', 'To survive an emotionally immature parent, you developed a "role self" — the person who keeps the peace, achieves to earn love, or disappears to avoid conflict. Recovery means recognizing: "That''s my survival mode, not my identity." The true self — with its own needs, opinions, and feelings — is still underneath.'),
('b0000005-0010-4000-8000-000000000004'::UUID, 'a0000005-0001-4000-8000-000000000010'::UUID, 'QUOTE', 3, 'Gibson on Healing', '"You don''t have to forgive your parents to heal. You have to understand them — and then choose to no longer sacrifice your emotional life to accommodate their limitations."'),
('b0000005-0010-4000-8000-000000000005'::UUID, 'a0000005-0001-4000-8000-000000000010'::UUID, 'SUMMARY', 4, 'Reclaim Your True Self', '1. Identify your parent''s type (Emotional, Driven, Passive, Rejecting).\n2. Name your "role self" — the persona you created to survive.\n3. Ask: "What do I actually feel/want/need?" — not what I was trained to feel.\n4. Practice expressing authentic feelings in safe relationships first.');
