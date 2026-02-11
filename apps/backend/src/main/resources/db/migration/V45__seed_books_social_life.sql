-- V45: Seed Essentia Books — lw-6 Social Life (10 books)
-- Social skills, influence, connection, and community building

-- ── 1. How to Win Friends and Influence People ──────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000006-0001-4000-8000-000000000001'::UUID, 'How to Win Friends and Influence People', 'Dale Carnegie', 'lw-6', 'Social Life', 8, 5, 'BEGINNER',
 'The timeless manual on human connection. Carnegie''s principles — genuine interest, remembering names, making others feel important — remain as powerful as when written in 1936.',
 'Published in 1936, Carnegie''s social skills manual has sold 30+ million copies because its principles are timeless: show genuine interest, remember names, listen more than you talk, and make others feel important. Not manipulation — authentic connection.',
 'Six Ways to Make People Like You',
 'This week, in every conversation, focus on asking questions about THEM. Count how many questions you ask vs. statements you make. Target 3:1 ratio.',
 1936, 4.55, 0, TRUE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000006-0001-4000-8000-000000000001'::UUID, 'social-skills'),
('a0000006-0001-4000-8000-000000000001'::UUID, 'influence'),
('a0000006-0001-4000-8000-000000000001'::UUID, 'classics');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000006-0001-4000-8000-000000000001'::UUID, 'The most interesting person in any room is the one who is most interested in others — ask questions, listen deeply, and remember what people tell you.', 0),
('a0000006-0001-4000-8000-000000000001'::UUID, 'A person''s name is the sweetest sound in any language — use it. Remembering names signals "you matter to me."', 1),
('a0000006-0001-4000-8000-000000000001'::UUID, 'You can''t win an argument. Even if you "win" logically, you lose relationally. Let the other person save face and they''ll respect you more.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000006-0001-4000-8000-000000000001'::UUID, 'a0000006-0001-4000-8000-000000000001'::UUID, 'INTRO', 0, 'The Original Social Playbook', 'Dale Carnegie wrote this book in 1936 and it still outsells most modern social skills books. Why? Because human nature hasn''t changed. People still want to feel heard, respected, and important. Carnegie provides the simplest path to making that happen.'),
('b0000006-0001-4000-8000-000000000002'::UUID, 'a0000006-0001-4000-8000-000000000001'::UUID, 'CONCEPT', 1, 'Become Genuinely Interested', 'You can make more friends in two months by becoming genuinely interested in other people than you can in two years by trying to get them interested in you. Ask about their work, their passions, their family. Then LISTEN. Don''t wait to talk — actually listen.'),
('b0000006-0001-4000-8000-000000000003'::UUID, 'a0000006-0001-4000-8000-000000000001'::UUID, 'CONCEPT', 2, 'The Name Game', 'Roosevelt was said to know the names of all 10,000+ White House employees. He used a simple system: when introduced, repeat the name, use it in conversation, and associate it with a visual image. This single habit — remembering names — makes people feel valued instantly.'),
('b0000006-0001-4000-8000-000000000004'::UUID, 'a0000006-0001-4000-8000-000000000001'::UUID, 'QUOTE', 3, 'Carnegie on Influence', '"You can make more friends in two months by becoming interested in other people than you can in two years by trying to get other people interested in you."'),
('b0000006-0001-4000-8000-000000000005'::UUID, 'a0000006-0001-4000-8000-000000000001'::UUID, 'SUMMARY', 4, 'Win Friends Today', '1. In your next conversation, ask 3 questions for every 1 statement.\n2. Use people''s names — at least twice in every conversation.\n3. Listen to understand, not to reply. Paraphrase back what you heard.\n4. Make others feel important — and do it sincerely.');

-- ── 2. Never Eat Alone ──────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000006-0001-4000-8000-000000000002'::UUID, 'Never Eat Alone', 'Keith Ferrazzi', 'lw-6', 'Social Life', 8, 5, 'INTERMEDIATE',
 'Networking as relationship-building. Ferrazzi''s approach replaces transactional "networking" with genuine generosity and strategic connection.',
 'Keith Ferrazzi redefines networking from transactional card-swapping to genuine relationship building. His core principle: always lead with generosity — help others FIRST, build real connections, and the professional benefits follow naturally.',
 'Relationship Action Plan + Generosity-First',
 'Identify 5 people you admire but don''t know. Find a way to help each one (introduce them to someone, share an article, offer expertise) before asking for anything.',
 2005, 4.40, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000006-0001-4000-8000-000000000002'::UUID, 'networking'),
('a0000006-0001-4000-8000-000000000002'::UUID, 'generosity'),
('a0000006-0001-4000-8000-000000000002'::UUID, 'career');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000006-0001-4000-8000-000000000002'::UUID, 'Real networking is not collecting contacts — it''s building relationships through genuine generosity. Always give before you ask.', 0),
('a0000006-0001-4000-8000-000000000002'::UUID, 'The "Relationship Action Plan": identify your top goals, then map the people who could help — and how you can help THEM first.', 1),
('a0000006-0001-4000-8000-000000000002'::UUID, 'Never eat alone — every meal is a chance to deepen a connection. Lunch with a new person once a week = 50+ new relationships per year.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000006-0002-4000-8000-000000000001'::UUID, 'a0000006-0001-4000-8000-000000000002'::UUID, 'INTRO', 0, 'Generosity as Strategy', 'Keith Ferrazzi grew up as the son of a steelworker. He got into Yale, built a massive network, and became a bestselling author — not through "networking" but through relentless generosity. Never Eat Alone is his system for building relationships that matter.'),
('b0000006-0002-4000-8000-000000000002'::UUID, 'a0000006-0001-4000-8000-000000000002'::UUID, 'CONCEPT', 1, 'Give Before You Get', 'Before asking for anything, ask: "What can I give?" Introduce people to each other. Share relevant articles. Offer your expertise. When you build a reputation as someone who gives freely, people want to help you in return — not out of obligation, but out of genuine affection.'),
('b0000006-0002-4000-8000-000000000003'::UUID, 'a0000006-0001-4000-8000-000000000002'::UUID, 'CONCEPT', 2, 'The Relationship Action Plan', 'Map your goals. For each goal, identify 5 people who could help. For each person, identify how YOU can help THEM. Lead with your offer. The plan turns "I wish I knew someone" into "I''m building a bridge to someone" with a clear, generous action step.'),
('b0000006-0002-4000-8000-000000000004'::UUID, 'a0000006-0001-4000-8000-000000000002'::UUID, 'QUOTE', 3, 'Ferrazzi on Giving', '"The currency of real networking is not greed but generosity. If you make it a point to help others, you will never have to ask for help yourself."'),
('b0000006-0002-4000-8000-000000000005'::UUID, 'a0000006-0001-4000-8000-000000000002'::UUID, 'SUMMARY', 4, 'Build Your Network', '1. Schedule one lunch/coffee per week with someone outside your usual circle.\n2. Before every meeting, ask: "How can I help this person?"\n3. Follow up within 24 hours — a short, genuine message.\n4. Be a "super connector" — introduce people who should know each other.');

-- ── 3. Influence ─────────────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000006-0001-4000-8000-000000000003'::UUID, 'Influence', 'Robert Cialdini', 'lw-6', 'Social Life', 9, 5, 'INTERMEDIATE',
 'The science of persuasion. Cialdini''s 6 principles explain why we say "yes" — and how to defend against manipulation.',
 'Robert Cialdini, the world''s foremost expert on persuasion, reveals six universal principles that drive compliance: Reciprocity, Commitment, Social Proof, Authority, Liking, and Scarcity. Understanding these principles both increases your influence and protects you from manipulation.',
 'Six Principles of Influence',
 'Identify which influence principles are used on you daily (ads, emails, social media). Awareness is the first defense against manipulation.',
 1984, 4.65, 0, TRUE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000006-0001-4000-8000-000000000003'::UUID, 'persuasion'),
('a0000006-0001-4000-8000-000000000003'::UUID, 'psychology'),
('a0000006-0001-4000-8000-000000000003'::UUID, 'influence');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000006-0001-4000-8000-000000000003'::UUID, 'The 6 principles: Reciprocity (we repay favors), Commitment (we honor our word), Social Proof (we follow the crowd), Authority (we trust experts), Liking (we agree with friends), Scarcity (we want what''s rare).', 0),
('a0000006-0001-4000-8000-000000000003'::UUID, 'Reciprocity is the most powerful: giving a small gift (even a mint with the check) increases compliance by 23%. Always give first.', 1),
('a0000006-0001-4000-8000-000000000003'::UUID, 'These principles work because they''re mental shortcuts — useful 95% of the time. The danger is when someone exploits them deliberately.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000006-0003-4000-8000-000000000001'::UUID, 'a0000006-0001-4000-8000-000000000003'::UUID, 'INTRO', 0, 'The Hidden Triggers', 'Why do you buy things you don''t need? Agree to things you don''t want? Cialdini spent years going undercover — training as a car salesman, telemarketer, and fundraiser — to discover the six hidden triggers that make humans say "yes."'),
('b0000006-0003-4000-8000-000000000002'::UUID, 'a0000006-0001-4000-8000-000000000003'::UUID, 'CONCEPT', 1, 'The Big Six', 'Reciprocity: "They gave me something, I owe them." Commitment: "I already said yes once." Social Proof: "Everyone else is doing it." Authority: "The expert says so." Liking: "I like them, so I agree." Scarcity: "It''s almost gone — I need it now."'),
('b0000006-0003-4000-8000-000000000003'::UUID, 'a0000006-0001-4000-8000-000000000003'::UUID, 'CONCEPT', 2, 'Defense Against Dark Arts', 'When someone gives you a "free" gift, pause: is this reciprocity triggering obligation? When an ad says "Only 3 left!" pause: is this artificial scarcity? When everyone is buying, pause: is this social proof or a bubble? Name the principle. The spell breaks.'),
('b0000006-0003-4000-8000-000000000004'::UUID, 'a0000006-0001-4000-8000-000000000003'::UUID, 'QUOTE', 3, 'Cialdini on Compliance', '"People will do things for those who do things for them. Reciprocity is the most powerful social force — and the most exploited."'),
('b0000006-0003-4000-8000-000000000005'::UUID, 'a0000006-0001-4000-8000-000000000003'::UUID, 'SUMMARY', 4, 'Use Influence Ethically', '1. Use Reciprocity: give genuinely before asking.\n2. Use Social Proof: share testimonials and stories of others succeeding.\n3. Defend yourself: when pressured, name the principle being used.\n4. The golden rule of ethical influence: only persuade people toward outcomes that benefit THEM.');

-- ── 4. Talking to Strangers ─────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000006-0001-4000-8000-000000000004'::UUID, 'Talking to Strangers', 'Malcolm Gladwell', 'lw-6', 'Social Life', 8, 5, 'INTERMEDIATE',
 'Why we are terrible at reading strangers. Gladwell''s "Default to Truth" theory explains why we believe liars and distrust the honest.',
 'Malcolm Gladwell explores why humans are fundamentally bad at reading strangers. His "Default to Truth" theory explains why we believe liars, miss danger signs, and misinterpret people from different cultures — and how awareness of these blind spots makes us better social navigators.',
 'Default to Truth Theory',
 'Recognize that you CANNOT read people as well as you think. Replace snap judgments with curiosity. Ask more questions before forming opinions.',
 2019, 4.35, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000006-0001-4000-8000-000000000004'::UUID, 'social-psychology'),
('a0000006-0001-4000-8000-000000000004'::UUID, 'judgment'),
('a0000006-0001-4000-8000-000000000004'::UUID, 'communication');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000006-0001-4000-8000-000000000004'::UUID, '"Default to Truth" — we are wired to believe people are telling the truth. This is mostly useful, but catastrophic when dealing with liars, con artists, or bad actors.', 0),
('a0000006-0001-4000-8000-000000000004'::UUID, 'We vastly overestimate our ability to read people. Judges, police, and therapists perform barely above chance at detecting lies from body language.', 1),
('a0000006-0001-4000-8000-000000000004'::UUID, 'Context matters more than character. The same person behaves differently in different environments — don''t assume consistency.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000006-0004-4000-8000-000000000001'::UUID, 'a0000006-0001-4000-8000-000000000004'::UUID, 'INTRO', 0, 'We Are Strangers to Strangers', 'Malcolm Gladwell asks a deceptively simple question: why are we so bad at understanding people we don''t know? Through stories of spies, con artists, and wrongful arrests, he reveals that our confident "people-reading" is mostly fiction.'),
('b0000006-0004-4000-8000-000000000002'::UUID, 'a0000006-0001-4000-8000-000000000004'::UUID, 'CONCEPT', 1, 'Default to Truth', 'Humans are biologically wired to believe others. We "default to truth" — assuming people are honest until overwhelmingly proven otherwise. This is why Ponzi schemes work, why spies go undetected for years, and why you believe your friend''s excuse even when it doesn''t add up.'),
('b0000006-0004-4000-8000-000000000003'::UUID, 'a0000006-0001-4000-8000-000000000004'::UUID, 'CONCEPT', 2, 'The Transparency Illusion', 'We think people''s inner states match their outer expressions. Nervous person = guilty. Calm person = innocent. But research shows this is wrong: many truthful people look nervous, many liars look calm. Judging strangers by their "vibe" is a recipe for error.'),
('b0000006-0004-4000-8000-000000000004'::UUID, 'a0000006-0001-4000-8000-000000000004'::UUID, 'QUOTE', 3, 'Gladwell on Judgment', '"We think we can easily see into the hearts of others based on the flimsiest of clues. We jump at the chance to judge strangers. We would never do this to ourselves."'),
('b0000006-0004-4000-8000-000000000005'::UUID, 'a0000006-0001-4000-8000-000000000004'::UUID, 'SUMMARY', 4, 'Navigate the Unknown', '1. Accept you cannot "read" strangers — even experts can''t.\n2. Replace snap judgments with genuine curiosity and questions.\n3. Consider context: people behave differently in different environments.\n4. When your gut says "something''s off," trust it — but verify with evidence, not assumptions.');

-- ── 5. Crucial Conversations ────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000006-0001-4000-8000-000000000005'::UUID, 'Crucial Conversations', 'Kerry Patterson et al.', 'lw-6', 'Social Life', 8, 5, 'INTERMEDIATE',
 'Tools for talking when stakes are high. The STATE method transforms confrontations into productive dialogues.',
 'When opinions vary, stakes are high, and emotions run strong — you''re in a Crucial Conversation. Most people either go silent or go aggressive. This book provides a third option: tools for maintaining dialogue when it matters most.',
 'STATE Method + Pool of Shared Meaning',
 'Before your next difficult conversation, use STATE: Share facts, Tell your story, Ask for theirs, Talk tentatively, Encourage testing.',
 2002, 4.50, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000006-0001-4000-8000-000000000005'::UUID, 'difficult-conversations'),
('a0000006-0001-4000-8000-000000000005'::UUID, 'conflict'),
('a0000006-0001-4000-8000-000000000005'::UUID, 'communication');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000006-0001-4000-8000-000000000005'::UUID, 'When you feel unsafe, you go to Silence (withdrawing) or Violence (attacking). Neither produces good outcomes. The goal: maintain DIALOGUE.', 0),
('a0000006-0001-4000-8000-000000000005'::UUID, 'The "Pool of Shared Meaning" — the more information both parties can contribute to the conversation, the better the decision. Your job is to enlarge the pool.', 1),
('a0000006-0001-4000-8000-000000000005'::UUID, 'Start with facts, not conclusions. "You''ve been late 3 times this week" works. "You don''t care about this team" doesn''t.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000006-0005-4000-8000-000000000001'::UUID, 'a0000006-0001-4000-8000-000000000005'::UUID, 'INTRO', 0, 'When the Stakes Are Highest', 'The most important conversations in your life — about salary, relationships, boundaries — are the ones you handle worst. Why? Because high stakes trigger fight-or-flight. This book gives you the tools to stay in dialogue when every instinct says fight or flee.'),
('b0000006-0005-4000-8000-000000000002'::UUID, 'a0000006-0001-4000-8000-000000000005'::UUID, 'CONCEPT', 1, 'The STATE Method', 'Share your facts (observations, not interpretations). Tell your story (your interpretation — tentatively). Ask for their path (their perspective). Talk tentatively ("I think..." not "You always..."). Encourage testing ("Am I seeing this right?"). This structure prevents escalation.'),
('b0000006-0005-4000-8000-000000000003'::UUID, 'a0000006-0001-4000-8000-000000000005'::UUID, 'CONCEPT', 2, 'Make It Safe', 'When someone goes to Silence or Violence, it means they feel unsafe. Restore safety by: 1. Finding Mutual Purpose ("We both want this project to succeed"). 2. Showing Mutual Respect ("I respect your experience"). Safety = people talk honestly. No safety = people defend or attack.'),
('b0000006-0005-4000-8000-000000000004'::UUID, 'a0000006-0001-4000-8000-000000000005'::UUID, 'QUOTE', 3, 'On Dialogue', '"At the heart of every crucial conversation lies a decision between two choices: win the argument, or win the relationship."'),
('b0000006-0005-4000-8000-000000000005'::UUID, 'a0000006-0001-4000-8000-000000000005'::UUID, 'SUMMARY', 4, 'Master the Crucial Moment', '1. Before the conversation, clarify what you really want (for yourself, for them, for the relationship).\n2. Lead with facts, not conclusions.\n3. Use STATE: Share facts → Tell story → Ask theirs → Talk tentatively → Encourage testing.\n4. Watch for Silence/Violence — if you see it, restore safety first.');

-- ── 6. The Like Switch ──────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000006-0001-4000-8000-000000000006'::UUID, 'The Like Switch', 'Jack Schafer', 'lw-6', 'Social Life', 7, 5, 'BEGINNER',
 'An ex-FBI agent''s guide to making people like you. Schafer''s "Friendship Formula" decodes the unconscious signals that build rapport.',
 'Former FBI behavioral analyst Jack Schafer reveals the science behind instant rapport. His "Friendship Formula" (Proximity + Frequency + Duration + Intensity) explains why some people are naturally magnetic — and how to replicate their techniques.',
 'The Friendship Formula',
 'Practice "eyebrow flash + head tilt + smile" when greeting someone. These three micro-signals tell the brain: this person is safe and friendly.',
 2015, 4.30, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000006-0001-4000-8000-000000000006'::UUID, 'rapport'),
('a0000006-0001-4000-8000-000000000006'::UUID, 'body-language'),
('a0000006-0001-4000-8000-000000000006'::UUID, 'FBI');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000006-0001-4000-8000-000000000006'::UUID, 'The Friendship Formula: Friendship = Proximity × Frequency × Duration × Intensity. All four must be present for a bond to form.', 0),
('a0000006-0001-4000-8000-000000000006'::UUID, 'Three "friend signals" that bypass the brain''s threat detector: the eyebrow flash (quick raise), the head tilt (exposing the neck = vulnerability = trust), and the genuine smile (crinkled eyes).', 1),
('a0000006-0001-4000-8000-000000000006'::UUID, 'People don''t remember what you said — they remember how you made them feel. Focus on making others feel good about THEMSELVES, not about you.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000006-0006-4000-8000-000000000001'::UUID, 'a0000006-0001-4000-8000-000000000006'::UUID, 'INTRO', 0, 'Spy Techniques for Social Life', 'Jack Schafer spent 20 years as an FBI behavioral analyst, recruiting spies and turning enemies into friends. The Like Switch takes his field-tested techniques and adapts them for everyday social situations — from job interviews to first dates.'),
('b0000006-0006-4000-8000-000000000002'::UUID, 'a0000006-0001-4000-8000-000000000006'::UUID, 'CONCEPT', 1, 'The Friendship Formula', 'Proximity: be physically near someone regularly. Frequency: increase the number of contacts over time. Duration: increase the length of each interaction gradually. Intensity: deepen the emotional content of conversations. Skip any variable and the friendship stalls.'),
('b0000006-0006-4000-8000-000000000003'::UUID, 'a0000006-0001-4000-8000-000000000006'::UUID, 'CONCEPT', 2, 'The Friend Signals', 'Before you say a word, your body is talking. Three signals that say "I''m friendly": 1. Eyebrow flash: a quick raise when making eye contact. 2. Head tilt: exposes the carotid artery (vulnerability signal = "I trust you"). 3. Genuine smile: eyes crinkle (Duchenne smile). Practice these and people warm to you before you speak.'),
('b0000006-0006-4000-8000-000000000004'::UUID, 'a0000006-0001-4000-8000-000000000006'::UUID, 'QUOTE', 3, 'Schafer on Rapport', '"If you want people to like you, don''t try to be interesting. Be interested. The quickest path to rapport is making the other person the star of the conversation."'),
('b0000006-0006-4000-8000-000000000005'::UUID, 'a0000006-0001-4000-8000-000000000006'::UUID, 'SUMMARY', 4, 'Flip the Switch', '1. Practice the three friend signals: eyebrow flash, head tilt, genuine smile.\n2. Increase proximity with people you want to befriend (same coffee shop, same gym, same events).\n3. In conversations, use empathic statements: "So you felt..."\n4. Remember: people like those who make them feel good about themselves.');

-- ── 7. Supercommunicators ───────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000006-0001-4000-8000-000000000007'::UUID, 'Supercommunicators', 'Charles Duhigg', 'lw-6', 'Social Life', 8, 5, 'INTERMEDIATE',
 'The science of conversation. Duhigg reveals three conversation types and why mismatching them causes most social friction.',
 'Charles Duhigg (The Power of Habit) reveals that every conversation falls into one of three types: practical, emotional, or social identity. Most miscommunication happens when two people are in different types — you''re solving a problem while they need emotional support.',
 'Three Conversation Types',
 'Before responding in any conversation, ask: "Are they looking for a solution, emotional support, or identity validation?" Match THEIR type, not yours.',
 2024, 4.50, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000006-0001-4000-8000-000000000007'::UUID, 'communication'),
('a0000006-0001-4000-8000-000000000007'::UUID, 'listening'),
('a0000006-0001-4000-8000-000000000007'::UUID, 'connection');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000006-0001-4000-8000-000000000007'::UUID, 'Three conversation types: Practical ("What should we do?"), Emotional ("How do you feel?"), Social Identity ("Who are we?"). Mismatching causes most friction.', 0),
('a0000006-0001-4000-8000-000000000007'::UUID, 'Supercommunicators match the conversation type of their partner — they sense whether someone needs a solution, validation, or belonging.', 1),
('a0000006-0001-4000-8000-000000000007'::UUID, '"Looping for understanding": Repeat back what you heard → Ask if you got it right → Continue only after confirmation. Simple but transformative.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000006-0007-4000-8000-000000000001'::UUID, 'a0000006-0001-4000-8000-000000000007'::UUID, 'INTRO', 0, 'The Conversation Code', 'Charles Duhigg studied people who are inexplicably good at connecting with anyone — from hostage negotiators to doctors to CEOs. The common thread: they intuitively match the TYPE of conversation their partner needs. And this skill can be learned.'),
('b0000006-0007-4000-8000-000000000002'::UUID, 'a0000006-0001-4000-8000-000000000007'::UUID, 'CONCEPT', 1, 'Match the Conversation Type', 'Your partner says: "I had a terrible day at work." Practical response (wrong): "Have you tried talking to your manager?" Emotional response (right): "That sounds really frustrating. Tell me more." Identity response (sometimes right): "That''s not who you are — you deserve better." Matching = connection. Mismatching = frustration.'),
('b0000006-0007-4000-8000-000000000003'::UUID, 'a0000006-0001-4000-8000-000000000007'::UUID, 'CONCEPT', 2, 'Looping for Understanding', 'The most powerful listening technique: 1. Listen to what they say. 2. Repeat it back in your own words: "So what I''m hearing is..." 3. Ask: "Did I get that right?" 4. They either confirm (deepening trust) or correct (preventing misunderstanding). Either way, they feel heard.'),
('b0000006-0007-4000-8000-000000000004'::UUID, 'a0000006-0001-4000-8000-000000000007'::UUID, 'QUOTE', 3, 'Duhigg on Connection', '"The most important thing in communication is hearing what isn''t said. Supercommunicators don''t just listen to words — they listen to what kind of conversation the other person needs."'),
('b0000006-0007-4000-8000-000000000005'::UUID, 'a0000006-0001-4000-8000-000000000007'::UUID, 'SUMMARY', 4, 'Become a Supercommunicator', '1. Before responding, ask: "Do they want a solution, support, or validation?"\n2. Match their type, then gradually shift if needed.\n3. Use Looping: "What I hear is..." → "Did I get that right?"\n4. In disagreements, ask: "What''s this conversation really about for you?"');

-- ── 8. Quiet ─────────────────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000006-0001-4000-8000-000000000008'::UUID, 'Quiet', 'Susan Cain', 'lw-6', 'Social Life', 8, 5, 'BEGINNER',
 'The power of introverts in a world that can''t stop talking. Cain shows that introversion is not a flaw to fix but a strength to leverage.',
 'Susan Cain mounts a passionate defense of introversion in a culture that prizes extroversion. Drawing on neuroscience and cultural analysis, she shows that introverts bring deep thinking, empathy, and creativity — and that forcing them into extroverted molds wastes their greatest strengths.',
 'Introvert Empowerment',
 'Design your social life around your temperament. Create "restorative niches" — time and space for solitude — after social engagements.',
 2012, 4.50, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000006-0001-4000-8000-000000000008'::UUID, 'introversion'),
('a0000006-0001-4000-8000-000000000008'::UUID, 'temperament'),
('a0000006-0001-4000-8000-000000000008'::UUID, 'self-acceptance');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000006-0001-4000-8000-000000000008'::UUID, 'Introversion is not shyness — it''s about where you get energy (from solitude vs. social interaction). Introverts can be great speakers and leaders.', 0),
('a0000006-0001-4000-8000-000000000008'::UUID, 'The "Extrovert Ideal" — the cultural bias toward bold, talkative, assertive people — is a relatively recent invention and ignores half the population''s strengths.', 1),
('a0000006-0001-4000-8000-000000000008'::UUID, '"Restorative niches" — dedicated time for solitude after social engagements — are essential for introverts to recharge and sustain social performance.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000006-0008-4000-8000-000000000001'::UUID, 'a0000006-0001-4000-8000-000000000008'::UUID, 'INTRO', 0, 'The Quiet Revolution', 'One-third to one-half of people are introverts. Yet our schools, offices, and social norms are designed for extroverts. Susan Cain argues this isn''t just unfair — it''s a massive waste of human potential.'),
('b0000006-0008-4000-8000-000000000002'::UUID, 'a0000006-0001-4000-8000-000000000008'::UUID, 'CONCEPT', 1, 'Introversion Is Not a Flaw', 'Introverts are not broken extroverts. They think deeply, listen carefully, and produce some of the world''s most creative work — because they spend time in solitude where deep thinking happens. Einstein, Chopin, Gandhi — all introverts who changed the world.'),
('b0000006-0008-4000-8000-000000000003'::UUID, 'a0000006-0001-4000-8000-000000000008'::UUID, 'CONCEPT', 2, 'Restorative Niches', 'Introverts can "act extroverted" when their values demand it — giving a speech, networking at an event. But this costs energy. The secret: build "restorative niches" into your schedule — 30 minutes of solitude after social events, a quiet workspace, solo walks. Recharge deliberately.'),
('b0000006-0008-4000-8000-000000000004'::UUID, 'a0000006-0001-4000-8000-000000000008'::UUID, 'QUOTE', 3, 'Cain on Introverts', '"There''s zero correlation between being the best talker and having the best ideas. The loudest voice in the room is not always the smartest."'),
('b0000006-0008-4000-8000-000000000005'::UUID, 'a0000006-0001-4000-8000-000000000008'::UUID, 'SUMMARY', 4, 'Leverage Your Quiet', '1. Identify if you''re introvert or extrovert (energy source, not shyness).\n2. If introvert: design restorative niches into your daily schedule.\n3. Use your strengths: deep thinking, active listening, one-on-one connection.\n4. Stop apologizing for needing solitude — it''s your power source.');

-- ── 9. Give and Take ────────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000006-0001-4000-8000-000000000009'::UUID, 'Give and Take', 'Adam Grant', 'lw-6', 'Social Life', 8, 5, 'INTERMEDIATE',
 'Why givers succeed (and why some fail). Grant reveals three reciprocity styles and shows that strategic giving is the ultimate social and professional advantage.',
 'Adam Grant''s research reveals three reciprocity styles: Givers (help freely), Takers (extract value), and Matchers (tit for tat). Surprisingly, Givers occupy BOTH the top AND bottom of success rankings — the difference is whether they give strategically or self-sacrificially.',
 'Strategic Giving — Otherish Givers',
 'Be an "otherish giver" — help generously but protect your time and energy. Set boundaries on giving to avoid burnout.',
 2013, 4.50, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000006-0001-4000-8000-000000000009'::UUID, 'generosity'),
('a0000006-0001-4000-8000-000000000009'::UUID, 'reciprocity'),
('a0000006-0001-4000-8000-000000000009'::UUID, 'success');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000006-0001-4000-8000-000000000009'::UUID, 'Three styles: Givers (help others without expecting return), Takers (try to get more than they give), Matchers (trade evenly). Givers are at BOTH the top and bottom of success.', 0),
('a0000006-0001-4000-8000-000000000009'::UUID, 'The difference between successful and unsuccessful givers: boundaries. "Otherish givers" are generous but protect their energy. "Selfless givers" give until they burn out.', 1),
('a0000006-0001-4000-8000-000000000009'::UUID, '"5-Minute Favors" — help that costs you less than 5 minutes but creates enormous value for others (an introduction, a recommendation, sharing an article) — are the most efficient giving strategy.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000006-0009-4000-8000-000000000001'::UUID, 'a0000006-0001-4000-8000-000000000009'::UUID, 'INTRO', 0, 'The Giving Paradox', 'Wharton''s youngest tenured professor, Adam Grant, discovered something strange: in every field — from engineering to sales — the most successful people were givers. But so were the least successful. What separates the generous winners from the generous losers?'),
('b0000006-0009-4000-8000-000000000002'::UUID, 'a0000006-0001-4000-8000-000000000009'::UUID, 'CONCEPT', 1, 'Otherish vs. Selfless Giving', 'Selfless Givers say yes to everything, sacrifice their own goals, and burn out. Otherish Givers give generously BUT maintain boundaries, batch their giving into dedicated time blocks, and choose high-impact, low-cost favors. The difference: otherish givers serve others AND themselves.'),
('b0000006-0009-4000-8000-000000000003'::UUID, 'a0000006-0001-4000-8000-000000000009'::UUID, 'CONCEPT', 2, 'The 5-Minute Favor', 'The most powerful giving strategy: favors that take you less than 5 minutes but create outsized value. An introduction. A recommendation. A shared resource. These tiny investments build massive goodwill and cost you almost nothing. Batch 3-5 per week.'),
('b0000006-0009-4000-8000-000000000004'::UUID, 'a0000006-0001-4000-8000-000000000009'::UUID, 'QUOTE', 3, 'Grant on Giving', '"Being a giver is not about self-sacrifice. It''s about being generous in ways that are energizing rather than exhausting. The most successful givers are those who look for ways to help that also help themselves."'),
('b0000006-0009-4000-8000-000000000005'::UUID, 'a0000006-0001-4000-8000-000000000009'::UUID, 'SUMMARY', 4, 'Give Strategically', '1. Identify your style: Giver, Taker, or Matcher?\n2. If Giver: add boundaries. Batch giving into specific time blocks.\n3. Practice 5-Minute Favors: introductions, recommendations, shared resources.\n4. Screen for Takers: protect your giving energy from those who only extract.');

-- ── 10. The Art of Gathering ────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000006-0001-4000-8000-000000000010'::UUID, 'The Art of Gathering', 'Priya Parker', 'lw-6', 'Social Life', 7, 5, 'INTERMEDIATE',
 'How to transform any gathering from forgettable to transformative. Parker''s framework starts with purpose and ends with belonging.',
 'Priya Parker, a professional facilitator, reveals why most gatherings (dinners, meetings, parties) are mediocre — and how to make them unforgettable. Her core rule: start with purpose, not logistics. A gathering without a clear reason to exist should not exist.',
 'Purpose-Driven Gathering Design',
 'Before hosting any event, answer: "Why are we gathering? What should be different when we leave?" If you can''t answer, redesign or cancel.',
 2018, 4.45, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000006-0001-4000-8000-000000000010'::UUID, 'hosting'),
('a0000006-0001-4000-8000-000000000010'::UUID, 'community'),
('a0000006-0001-4000-8000-000000000010'::UUID, 'gathering');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000006-0001-4000-8000-000000000010'::UUID, 'Every gathering needs a specific, disputatble purpose — not "Let''s catch up" but "Let''s celebrate Sarah''s new chapter." Purpose filters who''s invited, what happens, and how it ends.', 0),
('a0000006-0001-4000-8000-000000000010'::UUID, '"Generous authority" — the host must actively shape the experience. Not controlling, but guiding. A potluck with no host is just people eating near each other.', 1),
('a0000006-0001-4000-8000-000000000010'::UUID, 'The beginning and ending of a gathering are the most important moments — design them deliberately. How people enter and leave determines what they remember.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000006-0010-4000-8000-000000000001'::UUID, 'a0000006-0001-4000-8000-000000000010'::UUID, 'INTRO', 0, 'Stop Gathering Like Everyone Else', 'Priya Parker is a professional facilitator who has designed gatherings from corporate retreats to dinner parties to peace negotiations. Her diagnosis: most gatherings fail because they have no purpose beyond "we should get together." That vagueness is the enemy.'),
('b0000006-0010-4000-8000-000000000002'::UUID, 'a0000006-0001-4000-8000-000000000010'::UUID, 'CONCEPT', 1, 'Start with Purpose', 'Before sending invitations, answer: "Why are we gathering? What should be TRUE after this event that wasn''t true before?" A birthday party purpose: "Celebrate Emily''s 30th by reminding her how loved she is." This purpose then dictates: WHO comes, WHAT happens, and HOW it ends.'),
('b0000006-0010-4000-8000-000000000003'::UUID, 'a0000006-0001-4000-8000-000000000010'::UUID, 'CONCEPT', 2, 'Generous Authority', 'The host''s job is not to be a passive logistics coordinator. It''s to actively shape the experience with "generous authority" — making introductions, setting the tone, creating moments of connection. A great host protects guests from awkwardness by providing structure.'),
('b0000006-0010-4000-8000-000000000004'::UUID, 'a0000006-0001-4000-8000-000000000010'::UUID, 'QUOTE', 3, 'Parker on Gatherings', '"Gatherings crackle and hum when they are fueled by a bold, sharp purpose. Without one, they just take up time."'),
('b0000006-0010-4000-8000-000000000005'::UUID, 'a0000006-0001-4000-8000-000000000010'::UUID, 'SUMMARY', 4, 'Gather with Purpose', '1. Define your purpose: "After this gathering, [X] should be true."\n2. Guest list follows purpose — exclude generously (not everyone needs to be there).\n3. Design the first and last 10 minutes deliberately — they set the memory.\n4. Exercise generous authority: guide the experience, don''t just watch it happen.');
