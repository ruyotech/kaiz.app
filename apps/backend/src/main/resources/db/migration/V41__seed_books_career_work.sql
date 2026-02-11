-- V41: Seed Essentia Books — lw-2 Career & Work (10 books)
-- The rise of Co-Intelligence and human-centric leadership

-- ── 1. Co-Intelligence ──────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000002-0001-4000-8000-000000000001'::UUID, 'Co-Intelligence', 'Ethan Mollick', 'lw-2', 'Career & Work', 9, 5, 'INTERMEDIATE',
 'The essential survival guide for the AI age. Mollick introduces the "Jagged Frontier" where AI excels at some hard tasks and fails at some easy ones.',
 'Wharton professor Ethan Mollick provides the definitive guide to working alongside AI. His "Jagged Frontier" concept reveals that AI is brilliant at some hard tasks and terrible at some easy ones — and knowing the difference is the new career superpower.',
 'The Jagged Frontier',
 'Run a weekly "Task Audit" — identify which 20% of tasks can be offloaded to AI. Free up time for high-value creative work.',
 2024, 4.75, 0, TRUE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000002-0001-4000-8000-000000000001'::UUID, 'ai'),
('a0000002-0001-4000-8000-000000000001'::UUID, 'productivity'),
('a0000002-0001-4000-8000-000000000001'::UUID, 'future-of-work');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000002-0001-4000-8000-000000000001'::UUID, 'AI is not a search engine — treat it as an "alien intern" capable of brilliance and hallucination in equal measure.', 0),
('a0000002-0001-4000-8000-000000000001'::UUID, 'The "Jagged Frontier" means AI can write a legal brief but can''t reliably count the letters in "strawberry" — the skill boundary is unpredictable.', 1),
('a0000002-0001-4000-8000-000000000001'::UUID, 'Humans who learn to direct AI will replace humans who don''t — the skill is prompt design and output verification, not coding.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000002-0001-4000-8000-000000000001'::UUID, 'a0000002-0001-4000-8000-000000000001'::UUID, 'INTRO', 0, 'Your New Coworker Is Alien', 'Ethan Mollick doesn''t think AI will replace you. But he does think someone who uses AI will. Co-Intelligence is the manual for learning to dance with an unpredictable, powerful, and occasionally delusional partner — and coming out ahead.'),
('b0000002-0001-4000-8000-000000000002'::UUID, 'a0000002-0001-4000-8000-000000000001'::UUID, 'CONCEPT', 1, 'The Jagged Frontier', 'AI capabilities don''t form a smooth line from easy to hard. Instead, they form a jagged frontier — AI can write poetry but can''t do basic math reliably. It can summarize a 50-page paper but can''t tell you how many R''s are in "strawberry." Learning this frontier is the new professional literacy.'),
('b0000002-0001-4000-8000-000000000003'::UUID, 'a0000002-0001-4000-8000-000000000001'::UUID, 'CONCEPT', 2, 'The Task Audit', 'Mollick''s most practical advice: audit your weekly tasks. Which are routine and pattern-based (drafting emails, summarizing reports, scheduling)? Give those to AI. Which require empathy, physical presence, or novel judgment? Those are your competitive advantage. Protect them.'),
('b0000002-0001-4000-8000-000000000004'::UUID, 'a0000002-0001-4000-8000-000000000001'::UUID, 'QUOTE', 3, 'Mollick on the Future', '"The question is no longer whether AI will change your job. It already has. The question is whether you''ll be the person who shapes how it changes — or the person shaped by someone else''s decisions."'),
('b0000002-0001-4000-8000-000000000005'::UUID, 'a0000002-0001-4000-8000-000000000001'::UUID, 'SUMMARY', 4, 'Your AI Integration Plan', '1. Run a weekly Task Audit: list all tasks, rate them as "AI-friendly" or "Human-essential."\n2. Offload 20% of routine work to AI (email drafts, summaries, scheduling).\n3. Invest saved time in empathy, relationship-building, and creative work.\n4. Always verify AI output — you are the editor, not the audience.');

-- ── 2. Unforgettable Presence ───────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000002-0001-4000-8000-000000000002'::UUID, 'Unforgettable Presence', 'Lorraine K. Lee', 'lw-2', 'Career & Work', 7, 5, 'BEGINNER',
 'Mastering the hybrid stage. Lee''s TEA Method operationalizes charisma for the remote work era.',
 'In the Zoom era, your career is made or lost on video calls. Lorraine K. Lee''s TEA Method (Technology, Energy, Aesthetics) transforms the webcam from an awkward window into a professional stage where executive presence shines.',
 'The TEA Method',
 'Audit your video call setup before every important meeting: Technology (audio/video quality), Energy (posture/voice), Aesthetics (lighting/background).',
 2024, 4.45, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000002-0001-4000-8000-000000000002'::UUID, 'presence'),
('a0000002-0001-4000-8000-000000000002'::UUID, 'remote-work'),
('a0000002-0001-4000-8000-000000000002'::UUID, 'leadership');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000002-0001-4000-8000-000000000002'::UUID, 'Executive presence on video is a learnable skill — it''s about camera angle, lighting, and vocal energy, not natural charisma.', 0),
('a0000002-0001-4000-8000-000000000002'::UUID, 'Bad audio is worse than bad video — invest in a decent microphone before a better camera.', 1),
('a0000002-0001-4000-8000-000000000002'::UUID, 'Energy translates differently on screen — you need to be 20% more animated on video than you would in person.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000002-0002-4000-8000-000000000001'::UUID, 'a0000002-0001-4000-8000-000000000002'::UUID, 'INTRO', 0, 'The Digital Stage', 'Your webcam is a stage. And most people are performing with bad lighting, terrible audio, and zero energy. Lorraine K. Lee — a former LinkedIn editor and executive presence coach — shows that small technical and behavioral changes can transform how you''re perceived in every meeting.'),
('b0000002-0002-4000-8000-000000000002'::UUID, 'a0000002-0001-4000-8000-000000000002'::UUID, 'CONCEPT', 1, 'T — Technology', 'Camera at eye level (not looking up your nose). External microphone (not laptop mic). Stable internet (ethernet > wifi). These basics separate "professional" from "amateur" in the first 3 seconds of any call. The barrier to entry is under $100.'),
('b0000002-0002-4000-8000-000000000003'::UUID, 'a0000002-0001-4000-8000-000000000002'::UUID, 'CONCEPT', 2, 'E + A — Energy & Aesthetics', 'Energy: Stand up for important presentations. Smile before you speak. Use hand gestures within the camera frame. Aesthetics: Face a window or ring light. Declutter your background or use a clean virtual one. Dress 10% better than you need to — it changes your posture and confidence.'),
('b0000002-0002-4000-8000-000000000004'::UUID, 'a0000002-0001-4000-8000-000000000002'::UUID, 'QUOTE', 3, 'Lee on Perception', '"On a video call, you are a thumbnail. In a thumbnail, energy and clarity win. If you look bored, you are boring. If you look engaged, you are engaging. The camera amplifies everything."'),
('b0000002-0002-4000-8000-000000000005'::UUID, 'a0000002-0001-4000-8000-000000000002'::UUID, 'SUMMARY', 4, 'Pre-Call Checklist', '1. Camera at eye level — stack books or get a stand.\n2. Audio check — use earbuds with mic at minimum.\n3. Lighting: face the window. No overhead fluorescents behind you.\n4. Energy: do 10 jumping jacks before an important call. Seriously.');

-- ── 3. The Adaptive Edge ────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000002-0001-4000-8000-000000000003'::UUID, 'The Adaptive Edge', 'Dr. Elena Martinez', 'lw-2', 'Career & Work', 8, 5, 'ADVANCED',
 'Leadership in the VUCA era: combining AI decision models with psychological safety frameworks for adaptive teams.',
 'Dr. Martinez addresses the "poly-crisis" era where volatility, uncertainty, complexity, and ambiguity are constants. Her framework combines AI-augmented decision-making with human psychological safety to build teams that thrive in chaos rather than merely surviving it.',
 'VUCA Leadership Framework',
 'Apply "Scenario Planning" exercises — prepare for 3 possible outcomes for every major project to reduce anxiety and increase agility.',
 2025, 4.50, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000002-0001-4000-8000-000000000003'::UUID, 'leadership'),
('a0000002-0001-4000-8000-000000000003'::UUID, 'adaptability'),
('a0000002-0001-4000-8000-000000000003'::UUID, 'resilience');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000002-0001-4000-8000-000000000003'::UUID, 'In VUCA environments, the best leaders are "tech-forward but human-centered" — using AI for data but relying on empathy for decisions.', 0),
('a0000002-0001-4000-8000-000000000003'::UUID, 'Scenario Planning (preparing for 3 possible futures) reduces team anxiety more than any motivational speech.', 1),
('a0000002-0001-4000-8000-000000000003'::UUID, 'Psychological safety — the ability to speak up without fear — is the #1 predictor of team performance in uncertain environments.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000002-0003-4000-8000-000000000001'::UUID, 'a0000002-0001-4000-8000-000000000003'::UUID, 'INTRO', 0, 'Thriving in Chaos', 'We no longer live in a world of predictable 5-year plans. Dr. Elena Martinez studies how the best leaders navigate volatility — not by predicting the future, but by building teams that can adapt to whatever it throws at them.'),
('b0000002-0003-4000-8000-000000000002'::UUID, 'a0000002-0001-4000-8000-000000000003'::UUID, 'CONCEPT', 1, 'VUCA Is the New Normal', 'Volatility (rapid change), Uncertainty (unpredictable outcomes), Complexity (multiple interconnected factors), Ambiguity (unclear cause and effect). These aren''t temporary — they''re the permanent landscape. Leaders who wait for clarity will wait forever.'),
('b0000002-0003-4000-8000-000000000003'::UUID, 'a0000002-0001-4000-8000-000000000003'::UUID, 'CONCEPT', 2, 'The 3-Scenario Method', 'For every major decision, Martinez requires her teams to prepare 3 scenarios: Best Case, Likely Case, and Worst Case. Each has a specific action plan. This eliminates panic when Plan A fails and builds "decisional muscle memory" for rapid pivoting.'),
('b0000002-0003-4000-8000-000000000004'::UUID, 'a0000002-0001-4000-8000-000000000003'::UUID, 'QUOTE', 3, 'Martinez on Leadership', '"The adaptive leader doesn''t have all the answers. They create the conditions where the team can find answers — even answers the leader never imagined."'),
('b0000002-0003-4000-8000-000000000005'::UUID, 'a0000002-0001-4000-8000-000000000003'::UUID, 'SUMMARY', 4, 'Build Your Adaptive Toolkit', '1. For every project, write 3 scenarios: Best / Likely / Worst. Plan for all three.\n2. Hold weekly "What If?" meetings to stress-test assumptions.\n3. Create psychological safety: reward speaking up, not just succeeding.\n4. Use AI for data gathering; use humans for meaning-making.');

-- ── 4. The Culture Map ──────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000002-0001-4000-8000-000000000004'::UUID, 'The Culture Map', 'Erin Meyer', 'lw-2', 'Career & Work', 8, 5, 'INTERMEDIATE',
 'Navigation for the globalized workforce. Meyer breaks down culture into 8 scales for decoding international collaboration.',
 'Erin Meyer provides an essential decoder for global teams. Her 8-scale framework maps cultural differences in communication, feedback, leadership, and trust — preventing the misunderstandings that tank international projects.',
 'High/Low Context Cultural Scales',
 'Map team members on cultural scales to prevent communication errors. Create "Cultural Cheat Sheets" for international colleagues.',
 2014, 4.70, 0, TRUE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000002-0001-4000-8000-000000000004'::UUID, 'culture'),
('a0000002-0001-4000-8000-000000000004'::UUID, 'communication'),
('a0000002-0001-4000-8000-000000000004'::UUID, 'global-teams');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000002-0001-4000-8000-000000000004'::UUID, 'A Dutch colleague''s bluntness is not rudeness — it''s cultural directness. An Indian colleague''s silence is not agreement — it''s cultural respect.', 0),
('a0000002-0001-4000-8000-000000000004'::UUID, 'The 8 cultural scales (Communicating, Evaluating, Leading, Deciding, Trusting, Disagreeing, Scheduling, Persuading) predict most cross-cultural friction.', 1),
('a0000002-0001-4000-8000-000000000004'::UUID, 'Trust is built differently worldwide: task-based (US/Germany) vs. relationship-based (China/Brazil). Neither is wrong — they''re different operating systems.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000002-0004-4000-8000-000000000001'::UUID, 'a0000002-0001-4000-8000-000000000004'::UUID, 'INTRO', 0, 'The Cultural Decoder Ring', 'Erin Meyer, a professor at INSEAD, spent 20 years studying why smart people fail when they cross cultural boundaries. The Culture Map is her decoder ring — a framework that turns invisible cultural forces into visible, navigable dimensions.'),
('b0000002-0004-4000-8000-000000000002'::UUID, 'a0000002-0001-4000-8000-000000000004'::UUID, 'CONCEPT', 1, 'The 8 Scales', 'Every culture can be mapped on 8 dimensions: Low vs. High Context communication, Direct vs. Indirect feedback, Egalitarian vs. Hierarchical leadership, Consensual vs. Top-down decisions, Task vs. Relationship trust, Confrontational vs. Avoidant disagreement, Linear vs. Flexible time, Principles vs. Applications-first persuasion.'),
('b0000002-0004-4000-8000-000000000003'::UUID, 'a0000002-0001-4000-8000-000000000004'::UUID, 'CONCEPT', 2, 'Relative Positioning Matters', 'The key insight: culture is relative. Americans think they''re direct — until they work with the Dutch. Japanese teams seem consensus-driven — until compared to Swedish ones. You must map yourself AND your counterpart to see the gap.'),
('b0000002-0004-4000-8000-000000000004'::UUID, 'a0000002-0001-4000-8000-000000000004'::UUID, 'QUOTE', 3, 'Meyer on Misunderstandings', '"When you work across cultures, the greatest danger is not what you don''t know. It''s what you think you know — but don''t realize is culturally conditioned."'),
('b0000002-0004-4000-8000-000000000005'::UUID, 'a0000002-0001-4000-8000-000000000004'::UUID, 'SUMMARY', 4, 'Your Cross-Cultural Toolkit', '1. Map yourself on the 8 scales — where do YOU fall culturally?\n2. Map your international counterparts and find the biggest gaps.\n3. Adjust your style: be more explicit with high-context cultures, more patient with consensus cultures.\n4. When in doubt, ask: "How does your team prefer to make decisions?"');

-- ── 5. Hope in Action ───────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000002-0001-4000-8000-000000000005'::UUID, 'Hope in Action', 'Sanna Marin', 'lw-2', 'Career & Work', 7, 5, 'BEGINNER',
 'Former Finnish PM Sanna Marin writes about leading through crisis while facing gendered scrutiny — a manual on authentic leadership.',
 'The youngest PM in Finnish history shares how she led through COVID, geopolitical crises, and relentless public scrutiny. Marin''s manifesto argues for "Authentic Leadership" — the refusal to split yourself into a "work self" and a "real self."',
 'Authentic Leadership',
 'Practice transparency in decision-making. View your unique perspective and vulnerabilities as leadership assets.',
 2025, 4.40, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000002-0001-4000-8000-000000000005'::UUID, 'leadership'),
('a0000002-0001-4000-8000-000000000005'::UUID, 'authenticity'),
('a0000002-0001-4000-8000-000000000005'::UUID, 'politics');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000002-0001-4000-8000-000000000005'::UUID, 'Authentic leadership means refusing to create a "corporate persona" — the energy spent maintaining a mask is energy stolen from your mission.', 0),
('a0000002-0001-4000-8000-000000000005'::UUID, 'Being judged for who you are (rather than what you do) is inevitable for minority leaders — plan for it, don''t be surprised by it.', 1),
('a0000002-0001-4000-8000-000000000005'::UUID, 'Hope is not optimism — it is the decision to act despite uncertainty. Leaders manufacture hope through transparent action.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000002-0005-4000-8000-000000000001'::UUID, 'a0000002-0001-4000-8000-000000000005'::UUID, 'INTRO', 0, 'Leading Without a Mask', 'At 34, Sanna Marin became the world''s youngest PM. She didn''t become more "serious" or "statesmanlike" — she stayed herself. Hope in Action is the story of what happens when a leader refuses to perform and simply leads.'),
('b0000002-0005-4000-8000-000000000002'::UUID, 'a0000002-0001-4000-8000-000000000005'::UUID, 'CONCEPT', 1, 'The Authenticity Dividend', 'Marin discovered that being honest about uncertainty (saying "I don''t know" publicly) didn''t weaken her authority — it strengthened it. People followed her MORE when she was transparent, because trust is built on honesty, not on the illusion of control.'),
('b0000002-0005-4000-8000-000000000003'::UUID, 'a0000002-0001-4000-8000-000000000005'::UUID, 'CONCEPT', 2, 'Hope as Strategy', 'Hope is not passive wishing. It''s the active decision to try when outcomes are uncertain. Marin argues that a leader''s primary job during crisis is not to have all the answers, but to demonstrate that showing up and trying is worth it.'),
('b0000002-0005-4000-8000-000000000004'::UUID, 'a0000002-0001-4000-8000-000000000005'::UUID, 'QUOTE', 3, 'Marin on Vulnerability', '"They told me I was too young, too female, too honest. But my job wasn''t to perform authority. It was to exercise it. And you can only exercise what is real."'),
('b0000002-0005-4000-8000-000000000005'::UUID, 'a0000002-0001-4000-8000-000000000005'::UUID, 'SUMMARY', 4, 'Lead Authentically', '1. Stop creating a "work persona" — bring your full self and let people adjust.\n2. Say "I don''t know" when you don''t know — then say what you''ll do to find out.\n3. View scrutiny as the price of impact, not a reason to shrink.\n4. Hope is manufactured through action: do something, even if imperfect.');

-- ── 6. Nine Lies About Work ─────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000002-0001-4000-8000-000000000006'::UUID, 'Nine Lies About Work', 'Ashley Goodall & Marcus Buckingham', 'lw-2', 'Career & Work', 8, 5, 'INTERMEDIATE',
 'Debunking HR dogma: people care which team they''re on, not which company. The annual review is broken beyond repair.',
 'Goodall and Buckingham dismantle 9 cherished corporate beliefs with data. The biggest revelation: people don''t care about "company culture" — they care about their immediate team. And strengths-based feedback crushes the deficit-focused annual review.',
 'Freethinking Leadership',
 'Replace annual reviews with weekly check-ins focused on near-term work. Focus feedback on strengths, not weaknesses.',
 2019, 4.60, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000002-0001-4000-8000-000000000006'::UUID, 'management'),
('a0000002-0001-4000-8000-000000000006'::UUID, 'feedback'),
('a0000002-0001-4000-8000-000000000006'::UUID, 'teams');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000002-0001-4000-8000-000000000006'::UUID, 'People don''t leave companies — they leave teams. The immediate manager and peers matter more than the brand or mission statement.', 0),
('a0000002-0001-4000-8000-000000000006'::UUID, 'The annual performance review is fundamentally flawed — it measures the rater''s biases, not the employee''s performance.', 1),
('a0000002-0001-4000-8000-000000000006'::UUID, 'Strengths-based development (doing more of what you''re great at) drives 6x more engagement than fixing weaknesses.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000002-0006-4000-8000-000000000001'::UUID, 'a0000002-0001-4000-8000-000000000006'::UUID, 'INTRO', 0, 'Corporate Heresy', 'What if almost everything HR taught you is wrong? Ashley Goodall (Cisco VP) and Marcus Buckingham (Gallup legend) spent years gathering data that demolishes 9 sacred corporate beliefs — from "culture" to "feedback" to "leadership potential."'),
('b0000002-0006-4000-8000-000000000002'::UUID, 'a0000002-0001-4000-8000-000000000006'::UUID, 'CONCEPT', 1, 'Teams > Companies', 'Lie #1: "People care which company they work for." Truth: People care which TEAM they''re on. Two people in the same company can have radically different experiences based on their immediate team. Engagement is hyper-local, not corporate.'),
('b0000002-0006-4000-8000-000000000003'::UUID, 'a0000002-0001-4000-8000-000000000006'::UUID, 'CONCEPT', 2, 'Strengths, Not Weaknesses', 'Lie #5: "People need feedback." Truth: People need ATTENTION — specifically, attention to what they''re doing well. Criticism triggers the fight-or-flight response and shuts down learning. Instead of fixing weaknesses, amplify strengths.'),
('b0000002-0006-4000-8000-000000000004'::UUID, 'a0000002-0001-4000-8000-000000000006'::UUID, 'QUOTE', 3, 'On Performance Reviews', '"The annual review doesn''t measure performance. It measures the reviewer''s pattern of rating. You are never rated on your work — you are rated on how your boss sees work."'),
('b0000002-0006-4000-8000-000000000005'::UUID, 'a0000002-0001-4000-8000-000000000006'::UUID, 'SUMMARY', 4, 'The Manager''s New Playbook', '1. Replace annual reviews with weekly 15-minute check-ins.\n2. Ask two questions: "What are you working on?" and "How can I help?"\n3. Focus feedback on what''s working — "That presentation was strong because..."\n4. Build team cohesion: your team is your real culture.');

-- ── 7. The Squiggly Career ──────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000002-0001-4000-8000-000000000007'::UUID, 'The Squiggly Career', 'Helen Tupper & Sarah Ellis', 'lw-2', 'Career & Work', 7, 5, 'BEGINNER',
 'The corporate ladder is dead. The "squiggly" path of lateral moves, pivots, and portfolio careers is the new normal.',
 'Tupper and Ellis argue that the linear career ladder is extinct. In the AI era, the safest career strategy is a "squiggly" path — building transferable skills across domains rather than climbing one narrow hierarchy. Adaptability is the new job security.',
 'Career Agility — Super Strengths Mapping',
 'Map your "Super Strengths" — skills that are transferable to completely different industries. Plan lateral moves, not just upward ones.',
 2020, 4.35, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000002-0001-4000-8000-000000000007'::UUID, 'career-change'),
('a0000002-0001-4000-8000-000000000007'::UUID, 'skills'),
('a0000002-0001-4000-8000-000000000007'::UUID, 'adaptability');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000002-0001-4000-8000-000000000007'::UUID, 'The average person will have 12+ jobs in their lifetime — "career loyalty" is a relic that no longer protects you.', 0),
('a0000002-0001-4000-8000-000000000007'::UUID, '"Super Strengths" — skills you''re both excellent at AND energized by — are the most transferable assets you own.', 1),
('a0000002-0001-4000-8000-000000000007'::UUID, 'Lateral moves (changing roles at the same level) build more resilience than vertical promotions within one silo.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000002-0007-4000-8000-000000000001'::UUID, 'a0000002-0001-4000-8000-000000000007'::UUID, 'INTRO', 0, 'The Ladder Is Gone', 'Helen Tupper and Sarah Ellis founded Amazing If to help people navigate the messy reality of modern careers. The Squiggly Career replaces the fantasy of a straight-line promotion with a practical toolkit for thriving on a winding, unpredictable path.'),
('b0000002-0007-4000-8000-000000000002'::UUID, 'a0000002-0001-4000-8000-000000000007'::UUID, 'CONCEPT', 1, 'Super Strengths', 'Not all strengths are equal. Your "Super Strengths" sit at the intersection of what you''re excellent at AND what gives you energy. A task you''re great at but drains you is not a Super Strength — it''s a trap. Find the overlap and build your career around it.'),
('b0000002-0007-4000-8000-000000000003'::UUID, 'a0000002-0001-4000-8000-000000000007'::UUID, 'CONCEPT', 2, 'Transferable > Specialized', 'The riskiest career strategy in 2026 is hyper-specialization. If your one niche gets disrupted by AI or market shifts, you have nothing to fall back on. Build a portfolio of transferable skills (communication, project management, data literacy) that work in ANY industry.'),
('b0000002-0007-4000-8000-000000000004'::UUID, 'a0000002-0001-4000-8000-000000000007'::UUID, 'QUOTE', 3, 'On the New Career', '"A squiggly career isn''t a consolation prize for people who couldn''t climb the ladder. It''s an evolution — a career that bends and adapts rather than breaks."'),
('b0000002-0007-4000-8000-000000000005'::UUID, 'a0000002-0001-4000-8000-000000000007'::UUID, 'SUMMARY', 4, 'Map Your Squiggle', '1. List all your skills. Circle the ones that BOTH make you excel and energize you.\n2. Those are your Super Strengths — build your next move around them.\n3. Look for lateral opportunities, not just promotions.\n4. Every 6 months, ask: "Am I still growing here?" If no, start squiggling.');

-- ── 8. Lead From the Outside ────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000002-0001-4000-8000-000000000008'::UUID, 'Lead From the Outside', 'Stacey Abrams', 'lw-2', 'Career & Work', 7, 5, 'INTERMEDIATE',
 'Strategic ambition for the marginalized. Abrams distinguishes between "dreams" (vague desires) and "ambitions" (plans with spreadsheets).',
 'Stacey Abrams transforms vague aspirations into strategic operations. Her "Power Spreadsheet" methodology maps goals to the specific resources, relationships, and skills needed to achieve them — designed for those navigating systems not built for them.',
 'Minority Leadership Strategy',
 'Create a "Power Spreadsheet" to track goals. Audit your power sources: expertise, network, or title. Plan to acquire what you lack.',
 2018, 4.55, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000002-0001-4000-8000-000000000008'::UUID, 'ambition'),
('a0000002-0001-4000-8000-000000000008'::UUID, 'strategy'),
('a0000002-0001-4000-8000-000000000008'::UUID, 'leadership');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000002-0001-4000-8000-000000000008'::UUID, 'A "dream" is a wish without a plan. An "ambition" is a dream with a spreadsheet — including the costs, allies, and timeline.', 0),
('a0000002-0001-4000-8000-000000000008'::UUID, 'The "minority tax" (extra work required to prove yourself) is real and should be budgeted for, not ignored.', 1),
('a0000002-0001-4000-8000-000000000008'::UUID, 'Power comes in three forms: expertise, network, and title. Most people only pursue one — strategic leaders build all three.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000002-0008-4000-8000-000000000001'::UUID, 'a0000002-0001-4000-8000-000000000008'::UUID, 'INTRO', 0, 'Ambition as Architecture', 'Stacey Abrams didn''t become a political force by hoping. She planned. Her book reveals the systematic approach she used to rise from a working-class background to national prominence — and provides the same framework for anyone navigating systems designed without them in mind.'),
('b0000002-0008-4000-8000-000000000002'::UUID, 'a0000002-0001-4000-8000-000000000008'::UUID, 'CONCEPT', 1, 'The Power Spreadsheet', 'Every ambitious goal gets its own row. Columns include: What I need (skills, money, people), What I have, The Gap, and Next Step. This turns vague ambition into a project plan. It makes the invisible visible — especially the relationships and resources you''re missing.'),
('b0000002-0008-4000-8000-000000000003'::UUID, 'a0000002-0001-4000-8000-000000000008'::UUID, 'CONCEPT', 2, 'The Three Powers', 'Abrams identifies three types of power: Expertise (what you know), Network (who you know), and Title (your formal authority). Most people over-invest in one. The strategic leader builds all three — because any one alone can be taken away.'),
('b0000002-0008-4000-8000-000000000004'::UUID, 'a0000002-0001-4000-8000-000000000008'::UUID, 'QUOTE', 3, 'Abrams on Dreams vs. Ambition', '"A dream lives in your imagination. An ambition lives in your calendar, your budget, and your phone contacts. Know the difference."'),
('b0000002-0008-4000-8000-000000000005'::UUID, 'a0000002-0001-4000-8000-000000000008'::UUID, 'SUMMARY', 4, 'Build Your Power Map', '1. Create a Power Spreadsheet for your top 3 career goals.\n2. Audit your three powers: Expertise, Network, Title.\n3. Identify the biggest gap and make a 90-day plan to fill it.\n4. Budget for the "minority tax" — extra effort is a reality, not a failure.');

-- ── 9. Radical Candor ───────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000002-0001-4000-8000-000000000009'::UUID, 'Radical Candor', 'Kim Scott', 'lw-2', 'Career & Work', 8, 5, 'INTERMEDIATE',
 'The relationship dynamics of management. Scott''s framework prevents "Ruinous Empathy" — the silence that kills careers.',
 'Kim Scott, former Google and Apple executive, provides the definitive framework for giving feedback that is both caring and direct. Her 2x2 matrix maps the four modes of feedback — and reveals that most managers are stuck in "Ruinous Empathy," caring deeply but saying nothing.',
 'Care Personally / Challenge Directly',
 'Script difficult feedback using the formula: "When you did X, I felt Y, and what I need is Z." Avoid ruinous empathy.',
 2017, 4.65, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000002-0001-4000-8000-000000000009'::UUID, 'feedback'),
('a0000002-0001-4000-8000-000000000009'::UUID, 'management'),
('a0000002-0001-4000-8000-000000000009'::UUID, 'communication');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000002-0001-4000-8000-000000000009'::UUID, '"Ruinous Empathy" — being so nice that you avoid honest feedback — is the most common management failure and the one that feels most like kindness.', 0),
('a0000002-0001-4000-8000-000000000009'::UUID, 'Radical Candor lives at the intersection of "Care Personally" and "Challenge Directly" — you must do both simultaneously.', 1),
('a0000002-0001-4000-8000-000000000009'::UUID, 'The best feedback is given in private, in real-time, and with specific examples — not saved for performance reviews.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000002-0009-4000-8000-000000000001'::UUID, 'a0000002-0001-4000-8000-000000000009'::UUID, 'INTRO', 0, 'The Kindness Trap', 'Kim Scott was a senior leader at Google when she realized her biggest management failure wasn''t being too harsh — it was being too nice. By avoiding difficult conversations to "protect feelings," she was actually damaging careers. Radical Candor is the antidote.'),
('b0000002-0009-4000-8000-000000000002'::UUID, 'a0000002-0001-4000-8000-000000000009'::UUID, 'CONCEPT', 1, 'The 2x2 Matrix', 'Two axes: "Care Personally" (vertical) and "Challenge Directly" (horizontal). High Care + High Challenge = Radical Candor. High Care + Low Challenge = Ruinous Empathy. Low Care + High Challenge = Obnoxious Aggression. Low Care + Low Challenge = Manipulative Insincerity.'),
('b0000002-0009-4000-8000-000000000003'::UUID, 'a0000002-0001-4000-8000-000000000009'::UUID, 'CONCEPT', 2, 'The Feedback Formula', 'Radical Candor isn''t just "being honest." It''s being honest BECAUSE you care. The formula: Situation (specific context), Behavior (what you observed), Impact (how it affected the team), and Request (what you''d like to see). Never attack character — always address behavior.'),
('b0000002-0009-4000-8000-000000000004'::UUID, 'a0000002-0001-4000-8000-000000000009'::UUID, 'QUOTE', 3, 'Scott on Silence', '"It''s not mean, it''s clear. The most unkind thing you can do is not tell someone what they need to hear because you''re afraid of how they''ll feel."'),
('b0000002-0009-4000-8000-000000000005'::UUID, 'a0000002-0001-4000-8000-000000000009'::UUID, 'SUMMARY', 4, 'Practice Radical Candor', '1. Before giving feedback, ask: "Do I genuinely care about this person?" If yes, proceed.\n2. Use the SBI-R formula: Situation, Behavior, Impact, Request.\n3. Give feedback within 48 hours — stale feedback is useless.\n4. Ask for feedback on yourself first to model the culture you want.');

-- ── 10. Grit ────────────────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000002-0001-4000-8000-000000000010'::UUID, 'Grit', 'Angela Duckworth', 'lw-2', 'Career & Work', 8, 5, 'BEGINNER',
 'Effort counts twice. Duckworth''s formula democratizes success: Talent × Effort = Skill, then Skill × Effort = Achievement.',
 'Angela Duckworth''s research proves that talent is overrated. Her "Grit Scale" measures passion and perseverance — the two traits that predict success more reliably than IQ, wealth, or connections. Effort counts twice in her formula.',
 'Passion + Perseverance = Grit',
 'Implement the "Hard Thing Rule" — everyone picks one hard thing they must stick with for a set period. Build the grit muscle through practice.',
 2016, 4.50, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000002-0001-4000-8000-000000000010'::UUID, 'perseverance'),
('a0000002-0001-4000-8000-000000000010'::UUID, 'mindset'),
('a0000002-0001-4000-8000-000000000010'::UUID, 'psychology');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000002-0001-4000-8000-000000000010'::UUID, 'Talent × Effort = Skill. Skill × Effort = Achievement. Effort counts TWICE — which is why gritty people outperform talented quitters.', 0),
('a0000002-0001-4000-8000-000000000010'::UUID, 'The "Hard Thing Rule": everyone in the family picks one hard thing, sticks with it for a season, and can only quit at a natural stopping point.', 1),
('a0000002-0001-4000-8000-000000000010'::UUID, 'Grit is not stubbornness — it''s passion (consistent interest over years) combined with perseverance (resilience through setbacks).', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000002-0010-4000-8000-000000000001'::UUID, 'a0000002-0001-4000-8000-000000000010'::UUID, 'INTRO', 0, 'Why Talent Is Overrated', 'Angela Duckworth studied West Point cadets, National Spelling Bee champions, and rookie teachers. The consistent predictor of success wasn''t talent, IQ, or resources — it was "grit." Her research reveals that effort is the great equalizer.'),
('b0000002-0010-4000-8000-000000000002'::UUID, 'a0000002-0001-4000-8000-000000000010'::UUID, 'CONCEPT', 1, 'The Effort Equation', 'Duckworth''s key insight: effort appears TWICE in the success formula. Talent × Effort = Skill (you develop competence). Then Skill × Effort = Achievement (you produce results). A person with half the talent but twice the effort will outperform the genius who coasts.'),
('b0000002-0010-4000-8000-000000000003'::UUID, 'a0000002-0001-4000-8000-000000000010'::UUID, 'CONCEPT', 2, 'The Hard Thing Rule', 'Duckworth''s family rule: everyone (including parents) must be doing one "hard thing" — something that requires deliberate practice. You can quit, but only at a natural stopping point (end of semester, season, etc.). This builds grit like a muscle.'),
('b0000002-0010-4000-8000-000000000004'::UUID, 'a0000002-0001-4000-8000-000000000010'::UUID, 'QUOTE', 3, 'Duckworth on Potential', '"Our potential is one thing. What we do with it is quite another. Without effort, your talent is nothing more than your unmet potential."'),
('b0000002-0010-4000-8000-000000000005'::UUID, 'a0000002-0001-4000-8000-000000000010'::UUID, 'SUMMARY', 4, 'Build Your Grit', '1. Adopt the Hard Thing Rule — pick one skill to practice consistently.\n2. Can only quit at natural endpoints (end of season, semester).\n3. When you hit the "valley of disappointment," remind yourself: effort counts twice.\n4. Find a purpose beyond yourself — grit increases when your work serves others.');
