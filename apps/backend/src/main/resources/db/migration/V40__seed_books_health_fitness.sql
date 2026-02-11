-- V40: Seed Essentia Books — lw-1 Health & Fitness (10 books)
-- The shift from aesthetic reductionism to biological capacity

-- ── Update existing seed books with new V39 columns ─────────────────────────
UPDATE essentia_books SET
    summary_text = 'Learn how tiny changes can lead to remarkable results through the science of habit formation.',
    core_methodology = 'The 4 Laws of Behavior Change',
    app_application = 'Use "Habit Stacking" (After [Current Habit], I will [New Habit]).',
    is_featured = TRUE, is_published = TRUE
WHERE id = '33333333-3333-3333-3333-333333333301'::UUID;

UPDATE essentia_books SET
    summary_text = 'The ability to focus deeply is becoming increasingly rare and valuable in our distracted economy.',
    core_methodology = 'Monastic vs. Bimodal Deep Work',
    app_application = 'Block 90 minutes daily for distraction-free cognitive tasks.',
    is_featured = TRUE, is_published = TRUE
WHERE id = '33333333-3333-3333-3333-333333333302'::UUID;

UPDATE essentia_books SET
    summary_text = 'Financial success is a soft skill driven by behavior and emotions, not intelligence.',
    core_methodology = 'Behavioral Finance',
    app_application = 'Focus on "survival" mindset to allow compounding to work over decades.',
    is_featured = TRUE, is_published = TRUE
WHERE id = '33333333-3333-3333-3333-333333333303'::UUID;

-- ── 1. The Forever Strong Playbook ──────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000001-0001-4000-8000-000000000001'::UUID, 'The Forever Strong Playbook', 'Dr. Gabrielle Lyon', 'lw-1', 'Health & Fitness', 10, 5, 'INTERMEDIATE',
 'The operational manual for "Muscle-Centric Medicine." Dr. Lyon shifts the focus from adiposity to sarcopenia, arguing muscle is the organ of longevity.',
 'Dr. Gabrielle Lyon redefines health by focusing on muscle as the organ of longevity. The book provides the practical blueprint for building metabolic resilience through protein-first nutrition and resistance training, moving readers beyond weight loss toward structural integrity.',
 'Muscle-Centric Medicine',
 'Track daily protein intake (30g/meal threshold) to prevent sarcopenia. Gamify "threshold crossing" for muscle protein synthesis.',
 2025, 4.70, 0, TRUE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000001-0001-4000-8000-000000000001'::UUID, 'muscle'),
('a0000001-0001-4000-8000-000000000001'::UUID, 'protein'),
('a0000001-0001-4000-8000-000000000001'::UUID, 'longevity'),
('a0000001-0001-4000-8000-000000000001'::UUID, 'nutrition');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000001-0001-4000-8000-000000000001'::UUID, 'Muscle protein synthesis is an all-or-nothing event — 15g protein gives near zero benefit for MPS; you need 30g+ per meal.', 0),
('a0000001-0001-4000-8000-000000000001'::UUID, 'Muscle is the largest endocrine organ and the primary site for glucose disposal, making it the foundation of metabolic health.', 1),
('a0000001-0001-4000-8000-000000000001'::UUID, 'Sarcopenia (muscle loss) begins in your 30s and accelerates after 60 — resistance training is non-negotiable for aging well.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000001-0001-4000-8000-000000000001'::UUID, 'a0000001-0001-4000-8000-000000000001'::UUID, 'INTRO', 0, 'The Muscle Revolution', 'Dr. Gabrielle Lyon is not a weight loss doctor. She is a muscle doctor. Her radical thesis: the problem isn''t that we have too much fat — it''s that we have too little muscle. This reframe changes everything about how we eat, train, and age.'),
('b0000001-0001-4000-8000-000000000002'::UUID, 'a0000001-0001-4000-8000-000000000001'::UUID, 'CONCEPT', 1, 'The 30-Gram Threshold', 'Muscle protein synthesis (MPS) works like a light switch, not a dimmer. Eating 15g of protein gives you almost zero MPS benefit. You need to cross the ~30g threshold at each meal to "flip the switch." This is why grazing on small amounts of protein throughout the day fails.'),
('b0000001-0001-4000-8000-000000000003'::UUID, 'a0000001-0001-4000-8000-000000000001'::UUID, 'CONCEPT', 2, 'Muscle as Your Metabolic Armor', 'Skeletal muscle is the largest organ in the body and the primary disposal site for blood glucose. The more muscle you carry, the more metabolic currency you have — protecting against Type 2 diabetes, Alzheimer''s, and cardiovascular disease.'),
('b0000001-0001-4000-8000-000000000004'::UUID, 'a0000001-0001-4000-8000-000000000001'::UUID, 'QUOTE', 3, 'Dr. Lyon''s Core Insight', '"The trajectory of your health is not determined by how much fat you lose, but by how much muscle you build and maintain. Muscle is the currency of longevity."'),
('b0000001-0001-4000-8000-000000000005'::UUID, 'a0000001-0001-4000-8000-000000000001'::UUID, 'SUMMARY', 4, 'Your Action Plan', '1. Aim for 30g+ protein at every meal — start with breakfast.\n2. Prioritize resistance training 3-4x per week over cardio.\n3. Think of muscle as a retirement account: invest now, withdraw later.\n4. Track your protein "threshold crossings" daily, not just total grams.');

-- ── 2. Outlive ──────────────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000001-0001-4000-8000-000000000002'::UUID, 'Outlive', 'Peter Attia, MD', 'lw-1', 'Health & Fitness', 12, 5, 'ADVANCED',
 'The definitive text on "Medicine 3.0" — a proactive approach to preventing the Four Horsemen of chronic disease before they become acute.',
 'Peter Attia dismantles the reactive "Medicine 2.0" model and replaces it with a proactive longevity framework targeting the four horsemen: cardiovascular disease, cancer, neurodegeneration, and metabolic dysfunction. The book is a masterclass in treating your body as a system to be optimized over decades.',
 'Medicine 3.0 — Proactive Prevention',
 'Calculate Zone 2 training hours weekly. Track ApoB and VO2 Max as your top longevity biomarkers. Train for the "Centenarian Decathlon."',
 2023, 4.85, 0, TRUE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000001-0001-4000-8000-000000000002'::UUID, 'longevity'),
('a0000001-0001-4000-8000-000000000002'::UUID, 'medicine'),
('a0000001-0001-4000-8000-000000000002'::UUID, 'prevention'),
('a0000001-0001-4000-8000-000000000002'::UUID, 'exercise');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000001-0001-4000-8000-000000000002'::UUID, 'VO2 Max is the single highest correlate with all-cause longevity — improving it is more impactful than any drug.', 0),
('a0000001-0001-4000-8000-000000000002'::UUID, 'ApoB (not LDL cholesterol) is the key biomarker for cardiovascular risk — get tested and track it.', 1),
('a0000001-0001-4000-8000-000000000002'::UUID, 'The "Centenarian Decathlon" framework: define the 10 physical tasks you want to do at age 100, then train backwards from there.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000001-0002-4000-8000-000000000001'::UUID, 'a0000001-0001-4000-8000-000000000002'::UUID, 'INTRO', 0, 'Beyond Medicine 2.0', 'Peter Attia spent decades in surgery before realizing modern medicine has a fatal flaw: it waits until you''re sick to act. "Medicine 3.0" is his framework for shifting from reactive treatment to proactive longevity engineering.'),
('b0000001-0002-4000-8000-000000000002'::UUID, 'a0000001-0001-4000-8000-000000000002'::UUID, 'CONCEPT', 1, 'The Four Horsemen', 'Cardiovascular disease, cancer, neurodegenerative disease, and Type 2 diabetes kill 80% of people over 50. Attia argues we can detect and intervene against all four decades before symptoms appear — but only if we stop waiting for the annual physical to catch them.'),
('b0000001-0002-4000-8000-000000000003'::UUID, 'a0000001-0001-4000-8000-000000000002'::UUID, 'CONCEPT', 2, 'The Centenarian Decathlon', 'Imagine the 10 physical tasks you want to do at 100: carry groceries, climb stairs, play with grandchildren. Now work backwards — if you lose 1-2% strength per year after 50, you need to be significantly "over-engineered" at 40. This reframes training from vanity to function.'),
('b0000001-0002-4000-8000-000000000004'::UUID, 'a0000001-0001-4000-8000-000000000002'::UUID, 'QUOTE', 3, 'Attia on VO2 Max', '"Improving your VO2 Max from the bottom 25th percentile to the 50th percentile reduces your risk of all-cause mortality by nearly 50%. No drug on earth can match that."'),
('b0000001-0002-4000-8000-000000000005'::UUID, 'a0000001-0001-4000-8000-000000000002'::UUID, 'SUMMARY', 4, 'Your Longevity Protocol', '1. Get ApoB tested — it''s the best marker for cardiovascular risk.\n2. Measure and improve VO2 Max with Zone 2 training (3-4 hrs/week).\n3. Define your personal "Centenarian Decathlon" and train for it.\n4. Schedule proactive cancer screenings (colonoscopy, DEXA, etc.).');

-- ── 3. Hormone Havoc ────────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000001-0001-4000-8000-000000000003'::UUID, 'Hormone Havoc', 'Dr. Amy Shah', 'lw-1', 'Health & Fitness', 8, 5, 'BEGINNER',
 'Bridging gastroenterology and endocrinology, this book addresses hormonal health through the gut-hormone axis with a simple daily protocol.',
 'Dr. Amy Shah reveals how the gut microbiome directly controls hormonal balance through the "estrobolome." Her 30-30-3 protocol simplifies complex endocrinology into a daily checklist: 30g protein, 30g fiber, and 3 servings of probiotics — stabilizing mood, energy, and metabolism.',
 'The 30-30-3 Protocol',
 'Log daily: 30g protein at breakfast, 30g fiber, 3 servings of fermented foods. Track gut-hormone axis health.',
 2026, 4.50, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000001-0001-4000-8000-000000000003'::UUID, 'hormones'),
('a0000001-0001-4000-8000-000000000003'::UUID, 'gut-health'),
('a0000001-0001-4000-8000-000000000003'::UUID, 'nutrition');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000001-0001-4000-8000-000000000003'::UUID, 'The "estrobolome" — a subset of the gut microbiome — metabolizes estrogen; disrupting it creates hormonal chaos.', 0),
('a0000001-0001-4000-8000-000000000003'::UUID, 'Blood sugar spikes cause cortisol spikes, which suppress progesterone — the breakfast you eat shapes the hormones you produce all day.', 1),
('a0000001-0001-4000-8000-000000000003'::UUID, 'Fermented foods (yogurt, kimchi, sauerkraut) directly feed the estrobolome and improve hormonal clearance.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000001-0003-4000-8000-000000000001'::UUID, 'a0000001-0001-4000-8000-000000000003'::UUID, 'INTRO', 0, 'The Gut-Hormone Connection', 'Dr. Amy Shah is a double-board-certified physician who discovered that her patients'' hormonal problems almost always traced back to their gut. Hormone Havoc reveals the hidden axis between your microbiome and your endocrine system.'),
('b0000001-0003-4000-8000-000000000002'::UUID, 'a0000001-0001-4000-8000-000000000003'::UUID, 'CONCEPT', 1, 'The Estrobolome', 'Deep inside your gut lives a collection of bacteria called the estrobolome. Its sole job is to metabolize estrogen. When it''s disrupted by poor diet, antibiotics, or stress, estrogen builds up — causing weight gain, mood swings, and fatigue. Healing the gut heals the hormones.'),
('b0000001-0003-4000-8000-000000000003'::UUID, 'a0000001-0001-4000-8000-000000000003'::UUID, 'CONCEPT', 2, 'The 30-30-3 Protocol', 'Every day, hit three numbers: 30g of protein at breakfast (to stabilize blood sugar), 30g of fiber throughout the day (to feed the estrobolome), and 3 servings of probiotics/fermented foods. This simple checklist addresses the root cause of most hormonal imbalances.'),
('b0000001-0003-4000-8000-000000000004'::UUID, 'a0000001-0001-4000-8000-000000000003'::UUID, 'QUOTE', 3, 'Shah on Food as Medicine', '"Your hormones are not broken — they are responding to signals. Change the signal (what you eat), and you change the response (how you feel)."'),
('b0000001-0003-4000-8000-000000000005'::UUID, 'a0000001-0001-4000-8000-000000000003'::UUID, 'SUMMARY', 4, 'Daily Hormone Checklist', '1. Protein-first breakfast: eggs, Greek yogurt, or a protein shake (30g+).\n2. Hit 30g fiber: vegetables, berries, chia seeds, lentils.\n3. Three fermented servings: kimchi, kefir, sauerkraut, or miso.\n4. Avoid blood sugar spikes: pair carbs with protein and fat.');

-- ── 4. The High-Protein Plate ───────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000001-0001-4000-8000-000000000004'::UUID, 'The High-Protein Plate', 'Rachael DeVaux, RD', 'lw-1', 'Health & Fitness', 6, 5, 'BEGINNER',
 'The culinary execution of the muscle-centric thesis. DeVaux solves the #1 friction point in high-protein diets: meal prep time.',
 'Rachael DeVaux provides the practical "how" to protein-first nutrition. Her "Protein Anchor" system eliminates decision fatigue: pre-cook one protein component, then assemble 5 different meals around it throughout the week. Simple, fast, and effective.',
 'Protein Anchoring',
 'Pick a "Protein of the Week" (e.g., turkey chili). Meal prep on Sunday. Assemble 5 different plates through the week.',
 2025, 4.40, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000001-0001-4000-8000-000000000004'::UUID, 'meal-prep'),
('a0000001-0001-4000-8000-000000000004'::UUID, 'protein'),
('a0000001-0001-4000-8000-000000000004'::UUID, 'cooking');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000001-0001-4000-8000-000000000004'::UUID, 'The "Protein Anchor" eliminates daily cooking decisions by pre-cooking one protein to use in 5+ different meals.', 0),
('a0000001-0001-4000-8000-000000000004'::UUID, 'Time is the #1 barrier to healthy eating — solving prep time solves adherence.', 1),
('a0000001-0001-4000-8000-000000000004'::UUID, 'Consistency (eating well 80% of the time) beats perfection (eating perfectly 40% of the time).', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000001-0004-4000-8000-000000000001'::UUID, 'a0000001-0001-4000-8000-000000000004'::UUID, 'INTRO', 0, 'The Missing Piece', 'You know you should eat more protein. But who has time? Rachael DeVaux, a registered dietitian and fitness creator, bridges the gap between nutritional science and real-world kitchens. Her system is designed for busy people who want results without hours of cooking.'),
('b0000001-0004-4000-8000-000000000002'::UUID, 'a0000001-0001-4000-8000-000000000004'::UUID, 'CONCEPT', 1, 'The Protein Anchor System', 'Pick one protein, cook it once, eat it five ways. Example: slow-cooker carnitas become taco bowls (Monday), salads (Tuesday), quesadillas (Wednesday), grain bowls (Thursday), and lettuce wraps (Friday). One batch = five meals with zero decision fatigue.'),
('b0000001-0004-4000-8000-000000000003'::UUID, 'a0000001-0001-4000-8000-000000000004'::UUID, 'CONCEPT', 2, 'Building Your Plate', 'Every plate follows a formula: 1/3 protein anchor, 1/3 vegetables or greens, 1/3 smart carbs (rice, sweet potato, quinoa). Add a healthy fat (avocado, olive oil, nuts). This template removes the need for recipes and calorie counting.'),
('b0000001-0004-4000-8000-000000000004'::UUID, 'a0000001-0001-4000-8000-000000000004'::UUID, 'QUOTE', 3, 'DeVaux on Simplicity', '"The best diet is the one you actually follow. If your meal plan requires a PhD in nutrition, you''ll abandon it by Wednesday."'),
('b0000001-0004-4000-8000-000000000005'::UUID, 'a0000001-0001-4000-8000-000000000004'::UUID, 'SUMMARY', 4, 'Your Weekly Prep Blueprint', '1. Sunday: choose and cook your Protein Anchor (batch cook 2-3 lbs).\n2. Prep 2-3 vegetable sides (roast, steam, or chop raw).\n3. Cook a batch of grains or starches.\n4. Assemble different combinations each day — never eat the "same meal" twice.');

-- ── 5. Everything Is Tuberculosis ───────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000001-0001-4000-8000-000000000005'::UUID, 'Everything Is Tuberculosis', 'John Green', 'lw-1', 'Health & Fitness', 7, 5, 'BEGINNER',
 'John Green chronicles the history of TB to illustrate the fragility of human health and the miracle of antibiotics — health as a collective, historical narrative.',
 'John Green uses the devastating history of tuberculosis as a lens to understand modern public health. By tracing how one disease shaped civilizations, he reveals that personal health is inseparable from collective action — vaccines, sanitation, and antibiotics are miracles we take for granted.',
 'Public Health Literacy',
 'Contextualize personal health within global history. Schedule preventive care and vaccinations as acts of civic responsibility.',
 2025, 4.30, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000001-0001-4000-8000-000000000005'::UUID, 'public-health'),
('a0000001-0001-4000-8000-000000000005'::UUID, 'history'),
('a0000001-0001-4000-8000-000000000005'::UUID, 'gratitude');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000001-0001-4000-8000-000000000005'::UUID, 'Tuberculosis has killed more humans than any other disease in history — and it''s still not eradicated.', 0),
('a0000001-0001-4000-8000-000000000005'::UUID, 'The antibiotics and vaccines we take for granted were developed within the last 100 years — a blink in human history.', 1),
('a0000001-0001-4000-8000-000000000005'::UUID, 'Personal health optimization is meaningless without public health infrastructure — your health depends on everyone else''s.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000001-0005-4000-8000-000000000001'::UUID, 'a0000001-0001-4000-8000-000000000005'::UUID, 'INTRO', 0, 'A Disease That Shaped the World', 'John Green, beloved author and historian, turns his gaze to tuberculosis — not just as a disease, but as a force that shaped art, architecture, cities, and the very concept of public health. This is health literacy as storytelling.'),
('b0000001-0005-4000-8000-000000000002'::UUID, 'a0000001-0001-4000-8000-000000000005'::UUID, 'CONCEPT', 1, 'Health Is Collective', 'We think of health as personal: my diet, my exercise, my doctor. But TB teaches us that health is fundamentally social. Sanitation, clean water, vaccination programs, and hospital systems are the invisible infrastructure that allows personal optimization to even be possible.'),
('b0000001-0005-4000-8000-000000000003'::UUID, 'a0000001-0001-4000-8000-000000000005'::UUID, 'CONCEPT', 2, 'The Miracle We Forget', 'Before antibiotics, a simple cut could be a death sentence. Before vaccines, every parent lived in terror of polio and measles. Green''s history forces us to feel the gratitude we''ve lost — and the responsibility that comes with it.'),
('b0000001-0005-4000-8000-000000000004'::UUID, 'a0000001-0001-4000-8000-000000000005'::UUID, 'QUOTE', 3, 'Green on Gratitude', '"We are living in the best time in human history to be sick. The question is whether we will remain grateful enough to protect the systems that made it so."'),
('b0000001-0005-4000-8000-000000000005'::UUID, 'a0000001-0001-4000-8000-000000000005'::UUID, 'SUMMARY', 4, 'Health as Citizenship', '1. Schedule your vaccinations and preventive screenings — they are miracles of science.\n2. Support public health infrastructure through civic engagement.\n3. Practice gratitude for antibiotics, sanitation, and modern medicine.\n4. View your health as part of a larger ecosystem, not just a personal project.');

-- ── 6. Why We Drink Too Much ────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000001-0001-4000-8000-000000000006'::UUID, 'Why We Drink Too Much', 'Dr. Charles Knowles', 'lw-1', 'Health & Fitness', 8, 5, 'INTERMEDIATE',
 'A non-judgmental deep dive into the neuroscience of alcohol and why sobriety is becoming the ultimate performance hack.',
 'Dr. Knowles offers a compassionate, science-based exploration of alcohol''s grip on the brain. He explains how ethanol hijacks dopamine pathways, destroys sleep architecture, and elevates baseline anxiety — reframing sobriety from deprivation to performance enhancement.',
 'Neurobiology of Addiction',
 'Track "alcohol-free days" to reset dopamine reward pathways. Monitor sleep quality improvement over dry periods.',
 2025, 4.55, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000001-0001-4000-8000-000000000006'::UUID, 'alcohol'),
('a0000001-0001-4000-8000-000000000006'::UUID, 'neuroscience'),
('a0000001-0001-4000-8000-000000000006'::UUID, 'sobriety');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000001-0001-4000-8000-000000000006'::UUID, 'Alcohol suppresses REM sleep for up to 3 nights after drinking — one night out costs you 3 nights of recovery.', 0),
('a0000001-0001-4000-8000-000000000006'::UUID, 'The "anxiolytic rebound" effect means that alcohol-reduced anxiety today creates MORE anxiety tomorrow — it borrows calm from the future.', 1),
('a0000001-0001-4000-8000-000000000006'::UUID, 'Dopamine tolerance from regular drinking means you need more alcohol to feel normal — sobriety is the only way to reset baseline happiness.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000001-0006-4000-8000-000000000001'::UUID, 'a0000001-0001-4000-8000-000000000006'::UUID, 'INTRO', 0, 'The Sobriety Upgrade', 'Dr. Charles Knowles isn''t anti-alcohol. He''s pro-information. By understanding exactly what ethanol does to your brain — the dopamine hijack, the GABA disruption, the sleep destruction — you can make a truly informed choice rather than following cultural autopilot.'),
('b0000001-0006-4000-8000-000000000002'::UUID, 'a0000001-0001-4000-8000-000000000006'::UUID, 'CONCEPT', 1, 'The Dopamine Trap', 'Alcohol floods the brain with dopamine, creating a temporary euphoria. But the brain adapts by reducing dopamine receptors. Over time, you need more alcohol to feel the same high — and sober life feels increasingly flat. This is tolerance, and it''s a one-way ratchet unless you reset.'),
('b0000001-0006-4000-8000-000000000003'::UUID, 'a0000001-0001-4000-8000-000000000006'::UUID, 'CONCEPT', 2, 'Sleep Destruction', 'Alcohol doesn''t help you sleep — it sedates you. There''s a critical difference. Sedation skips the deep sleep stages your brain needs for consolidation. Even moderate drinking eliminates 20-30% of your REM sleep, impairing memory, emotional regulation, and creativity the next day.'),
('b0000001-0006-4000-8000-000000000004'::UUID, 'a0000001-0001-4000-8000-000000000006'::UUID, 'QUOTE', 3, 'Knowles on the Reframe', '"The question is not ''Why should I stop drinking?'' The question is ''What would I gain if I did?'' — and the answer is: your best sleep, your sharpest mind, and your lowest anxiety."'),
('b0000001-0006-4000-8000-000000000005'::UUID, 'a0000001-0001-4000-8000-000000000006'::UUID, 'SUMMARY', 4, 'Your Reset Protocol', '1. Try a 30-day alcohol-free experiment — track mood, sleep quality, and energy.\n2. Show the "recovery cost" — 1 night of drinking = 3 nights of disrupted sleep.\n3. Replace the ritual, not just the substance (see: Mocktail Hour).\n4. Journal your baseline anxiety levels during the experiment.');

-- ── 7. Mocktail Hour ────────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000001-0001-4000-8000-000000000007'::UUID, 'Mocktail Hour', 'Callie Gullickson', 'lw-1', 'Health & Fitness', 5, 5, 'BEGINNER',
 'Social lubrication without the toxicity. The "Bring Your Own Energy" philosophy for replacing the alcohol ritual with functional alternatives.',
 'Peloton instructor Callie Gullickson bridges fitness and nightlife with her "Bring Your Own Energy" philosophy. Her functional mocktail recipes serve as transition rituals between work and evening rest — proving you don''t need ethanol to be charismatic or relaxed.',
 'BYOE — Bring Your Own Energy',
 'Replace your evening alcohol ritual with a functional mocktail. Schedule "Elixir Hour" as a wind-down transition.',
 2025, 4.20, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000001-0001-4000-8000-000000000007'::UUID, 'mocktails'),
('a0000001-0001-4000-8000-000000000007'::UUID, 'sobriety'),
('a0000001-0001-4000-8000-000000000007'::UUID, 'social');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000001-0001-4000-8000-000000000007'::UUID, 'The ritual matters more than the substance — a beautiful drink in a nice glass at 6 PM signals "work is over" to the brain.', 0),
('a0000001-0001-4000-8000-000000000007'::UUID, 'Functional ingredients (magnesium, tart cherry, L-theanine) can actually improve sleep and relaxation instead of impairing them.', 1),
('a0000001-0001-4000-8000-000000000007'::UUID, 'Social confidence comes from energy management (rest, exercise, nutrition), not from chemical disinhibition.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000001-0007-4000-8000-000000000001'::UUID, 'a0000001-0001-4000-8000-000000000007'::UUID, 'INTRO', 0, 'Beyond the Buzz', 'Callie Gullickson doesn''t preach. She provides alternatives. As a Peloton instructor who regularly shows up at social events without drinking, she''s proof that energy and charisma come from within — and that a beautifully crafted mocktail is more interesting than any beer.'),
('b0000001-0007-4000-8000-000000000002'::UUID, 'a0000001-0001-4000-8000-000000000007'::UUID, 'CONCEPT', 1, 'The Ritual Replacement', 'The reason people drink at 6 PM isn''t the alcohol — it''s the ritual. The sound of a cap opening, the act of pouring, the signal to the brain that says "you''re off duty." Mocktail Hour keeps the ritual but removes the damage. Think of it as upgrading the signal, not eliminating it.'),
('b0000001-0007-4000-8000-000000000003'::UUID, 'a0000001-0001-4000-8000-000000000007'::UUID, 'CONCEPT', 2, 'Functional Elixirs', 'Gullickson''s recipes go beyond "juice in a fancy glass." They use functional ingredients: magnesium citrate for muscle relaxation, tart cherry for melatonin production, adaptogens like ashwagandha for stress reduction. Your evening drink can actually improve tomorrow.'),
('b0000001-0007-4000-8000-000000000004'::UUID, 'a0000001-0001-4000-8000-000000000007'::UUID, 'QUOTE', 3, 'The BYOE Manifesto', '"Bring Your Own Energy. The room doesn''t need another drunk person. It needs someone who is fully alive, present, and interesting. That''s you — without the hangover."'),
('b0000001-0007-4000-8000-000000000005'::UUID, 'a0000001-0001-4000-8000-000000000007'::UUID, 'SUMMARY', 4, 'Your Mocktail Starter Kit', '1. Invest in nice glassware — aesthetics matter for the ritual.\n2. Stock 3 base ingredients: sparkling water, tart cherry juice, fresh citrus.\n3. Add one functional ingredient: magnesium, L-theanine, or ashwagandha.\n4. Schedule "Elixir Hour" at 6 PM as your official work-life transition.');

-- ── 8. Did You Stretch Tho? ─────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000001-0001-4000-8000-000000000008'::UUID, 'Did You Stretch Tho?', 'Hannah Corbin', 'lw-1', 'Health & Fitness', 5, 5, 'BEGINNER',
 'Mobility as the new cardio. Color-coded stretching routines for nervous system regulation throughout the day.',
 'Peloton instructor Hannah Corbin redefines fitness by putting mobility at the center. Her color-coded stretch system matches routines to your day — blue for desk work, red for post-workout, green for morning activation — validating maintenance as a legitimate form of fitness.',
 'Nervous System Regulation via Stretching',
 'Perform color-coded stretches based on daily activity (e.g., "Tech Neck Release" after 4 hours of screen time).',
 2026, 4.35, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000001-0001-4000-8000-000000000008'::UUID, 'stretching'),
('a0000001-0001-4000-8000-000000000008'::UUID, 'mobility'),
('a0000001-0001-4000-8000-000000000008'::UUID, 'recovery');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000001-0001-4000-8000-000000000008'::UUID, 'Stretching isn''t just for flexibility — it directly regulates the nervous system, shifting you from fight-or-flight to rest-and-digest.', 0),
('a0000001-0001-4000-8000-000000000008'::UUID, '"Exercise snacking" (5-minute stretch breaks throughout the day) is more effective than one long session for office workers.', 1),
('a0000001-0001-4000-8000-000000000008'::UUID, 'Maintenance is a legitimate form of fitness — not every movement needs to be "intense" to count.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000001-0008-4000-8000-000000000001'::UUID, 'a0000001-0001-4000-8000-000000000008'::UUID, 'INTRO', 0, 'The Anti-Grind', 'Hannah Corbin is tired of the "no pain, no gain" myth. As a Peloton stretching instructor with a devoted following, she''s proof that the most popular workout isn''t always the hardest — sometimes it''s the gentlest. Her deck-of-cards format makes stretching playful and accessible.'),
('b0000001-0008-4000-8000-000000000002'::UUID, 'a0000001-0001-4000-8000-000000000008'::UUID, 'CONCEPT', 1, 'Color-Coded Movement', 'Blue stretches are for desk workers (neck, hip flexors, wrists). Red stretches are post-workout (quads, hamstrings, shoulders). Green stretches are morning activators (spinal twists, sun salutations). Match the color to your day and you never have to think about what to do.'),
('b0000001-0008-4000-8000-000000000003'::UUID, 'a0000001-0001-4000-8000-000000000008'::UUID, 'CONCEPT', 2, 'Nervous System Regulation', 'Long, slow stretches activate the parasympathetic nervous system — the "rest and digest" mode. In a world where we''re chronically stressed, 10 minutes of stretching can lower cortisol more effectively than scrolling social media for an hour.'),
('b0000001-0008-4000-8000-000000000004'::UUID, 'a0000001-0001-4000-8000-000000000008'::UUID, 'QUOTE', 3, 'Corbin on Permission', '"You don''t need to earn rest with intensity. Stretching IS the workout. Your nervous system will thank you more than your ego ever could."'),
('b0000001-0008-4000-8000-000000000005'::UUID, 'a0000001-0001-4000-8000-000000000008'::UUID, 'SUMMARY', 4, 'Your Daily Stretch Menu', '1. Morning (Green): 5-min spinal mobility and hip openers.\n2. Midday (Blue): "Tech Neck Release" — chin tucks, chest openers, wrist circles.\n3. Post-workout (Red): Hold each stretch 60 seconds for recovery.\n4. Evening: 10-min full-body wind-down for sleep quality.');

-- ── 9. Protein In 15 ────────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000001-0001-4000-8000-000000000009'::UUID, 'Protein In 15', 'Joe Wicks', 'lw-1', 'Health & Fitness', 5, 5, 'BEGINNER',
 'Joe Wicks proves that healthy eating doesn''t need to be slow. 15-minute high-protein meals for busy people who value consistency over perfection.',
 'Joe Wicks continues his mission of making healthy eating effortless. Protein In 15 provides rapid-fire recipes that can be made faster than ordering delivery — removing the time excuse that derails most nutrition plans. Consistency through speed.',
 'High-Velocity Nutrition',
 'Cook 15-minute high-protein meals to eliminate the "I don''t have time" excuse. Use the "Emergency Button" for fast healthy options.',
 2025, 4.25, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000001-0001-4000-8000-000000000009'::UUID, 'quick-meals'),
('a0000001-0001-4000-8000-000000000009'::UUID, 'protein'),
('a0000001-0001-4000-8000-000000000009'::UUID, 'cooking');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000001-0001-4000-8000-000000000009'::UUID, 'The biggest barrier to healthy eating isn''t knowledge — it''s time. Solve time, and you solve adherence.', 0),
('a0000001-0001-4000-8000-000000000009'::UUID, 'A "good enough" meal in 15 minutes beats a "perfect" meal you never cook.', 1),
('a0000001-0001-4000-8000-000000000009'::UUID, 'Having 3-5 "Emergency Meals" memorized means you never need to order junk food out of desperation.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000001-0009-4000-8000-000000000001'::UUID, 'a0000001-0001-4000-8000-000000000009'::UUID, 'INTRO', 0, 'The Speed-Health Connection', 'Joe Wicks understands something most nutritionists don''t: your recipe is only as good as the probability you''ll actually make it. If a healthy meal takes 45 minutes, it''s competing with a delivery app that takes 2 taps. Protein In 15 wins by being faster than fast food.'),
('b0000001-0009-4000-8000-000000000002'::UUID, 'a0000001-0001-4000-8000-000000000009'::UUID, 'CONCEPT', 1, 'The Emergency Button', 'Every person needs 3-5 meals they can make with their eyes closed in under 15 minutes. Wicks calls these "Emergency Meals" — the recipes you turn to when willpower is low and hunger is high. Memorize them like emergency numbers.'),
('b0000001-0009-4000-8000-000000000003'::UUID, 'a0000001-0001-4000-8000-000000000009'::UUID, 'CONCEPT', 2, 'Consistency > Perfection', 'The fitness industry sells perfection: perfectly measured macros, organic ingredients, scheduled meal times. Wicks sells reality: a pan-fried chicken breast with frozen vegetables and sriracha, done in 12 minutes, eaten in front of Netflix. It''s not Instagram-worthy, but it works.'),
('b0000001-0009-4000-8000-000000000004'::UUID, 'a0000001-0001-4000-8000-000000000009'::UUID, 'QUOTE', 3, 'Wicks on Barriers', '"The recipe that takes 45 minutes and uses 20 ingredients is a fantasy. The one that takes 15 minutes and uses 5 ingredients? That''s the one that changes your life."'),
('b0000001-0009-4000-8000-000000000005'::UUID, 'a0000001-0001-4000-8000-000000000009'::UUID, 'SUMMARY', 4, 'Build Your Emergency Kit', '1. Memorize 3 meals you can make in under 15 minutes (e.g., stir-fry, omelet, Greek bowl).\n2. Keep a "protein pantry" stocked: canned tuna, eggs, pre-cooked chicken, Greek yogurt.\n3. Frozen vegetables are nutritionally equal to fresh — keep bags in the freezer.\n4. Speed is the ultimate health hack: if it''s fast, you''ll do it.');

-- ── 10. Eat Your Ice Cream ──────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000001-0001-4000-8000-000000000010'::UUID, 'Eat Your Ice Cream', 'Ezekiel Emanuel', 'lw-1', 'Health & Fitness', 6, 5, 'BEGINNER',
 'The philosophical defense of pleasure. Emanuel argues against the biohacking extreme that views the body solely as a machine to be optimized.',
 'Bioethicist Ezekiel Emanuel delivers a necessary counterweight to the optimization-obsessed health culture. He argues that a life without pleasure is not worth extending — and that scheduling "joy foods" actually improves long-term adherence and prevents orthorexic burnout.',
 'Anti-Optimization — Joy as Medicine',
 'Schedule "Joy Foods" weekly alongside macro tracking. Track life satisfaction, not just nutrient compliance.',
 2025, 4.15, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000001-0001-4000-8000-000000000010'::UUID, 'joy'),
('a0000001-0001-4000-8000-000000000010'::UUID, 'balance'),
('a0000001-0001-4000-8000-000000000010'::UUID, 'philosophy');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000001-0001-4000-8000-000000000010'::UUID, 'Orthorexia (obsessive "healthy" eating) is a recognized disorder — the pursuit of perfect nutrition can itself become unhealthy.', 0),
('a0000001-0001-4000-8000-000000000010'::UUID, 'Planned "joy meals" actually improve dietary adherence because they prevent the binge-restrict cycle.', 1),
('a0000001-0001-4000-8000-000000000010'::UUID, 'The purpose of longevity is to live well, not merely to live long — pleasure is a legitimate health outcome.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000001-0010-4000-8000-000000000001'::UUID, 'a0000001-0001-4000-8000-000000000010'::UUID, 'INTRO', 0, 'The Permission Slip', 'In a world of biohackers and macro-trackers, Ezekiel Emanuel — a physician and bioethicist — asks a dangerous question: what if the healthiest thing you can do is eat the damn ice cream? His argument isn''t against health; it''s against the tyranny of optimization.'),
('b0000001-0010-4000-8000-000000000002'::UUID, 'a0000001-0001-4000-8000-000000000010'::UUID, 'CONCEPT', 1, 'The Optimization Trap', 'When every meal is optimized, every workout tracked, every biomarker monitored — life becomes a science experiment, not a life. Emanuel argues that the stress of perfect eating often causes more cortisol damage than the "bad" food it avoids.'),
('b0000001-0010-4000-8000-000000000003'::UUID, 'a0000001-0001-4000-8000-000000000010'::UUID, 'CONCEPT', 2, 'Joy as a Health Metric', 'Studies show that people who eat with joy and social connection have better health outcomes than those who eat "perfectly" but anxiously. The French Paradox isn''t about wine — it''s about pleasure, community, and savoring. Joy is not the enemy of health; it is a component of it.'),
('b0000001-0010-4000-8000-000000000004'::UUID, 'a0000001-0001-4000-8000-000000000010'::UUID, 'QUOTE', 3, 'Emanuel on Living', '"A life extended by 10 years but spent obsessing over every morsel is not 10 years gained. It is decades lost to anxiety. Eat the ice cream. Hug your kids. That is the real medicine."'),
('b0000001-0010-4000-8000-000000000005'::UUID, 'a0000001-0001-4000-8000-000000000010'::UUID, 'SUMMARY', 4, 'The Joy Protocol', '1. Schedule 2-3 "Joy Meals" per week — eat whatever you love, guilt-free.\n2. Track satisfaction alongside macros — how did the meal make you feel?\n3. Eat socially at least 3 times per week — community is a nutrient.\n4. If tracking food makes you anxious, stop tracking. Peace > perfection.');
