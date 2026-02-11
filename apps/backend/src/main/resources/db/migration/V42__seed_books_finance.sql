-- V42: Seed Essentia Books — lw-3 Finance & Money (10 books)
-- Behavioral finance, wealth-building, and financial independence

-- ── Update existing seed: The Psychology of Money ───────────────────────────
UPDATE essentia_books SET
  summary_text = 'Morgan Housel reveals that financial success has little to do with intelligence and everything to do with behavior. Through 19 short stories, he shows how fear, greed, ego, and identity shape every money decision — for better or worse.',
  core_methodology = 'Behavioral Finance',
  app_application = 'Identify your personal "money story" — the emotional narrative driving your financial decisions. Then design rules that bypass emotion.',
  is_featured = TRUE,
  is_published = TRUE
WHERE id = '33333333-3333-3333-3333-333333333303'::UUID;

-- Add takeaways for existing Psychology of Money
INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('33333333-3333-3333-3333-333333333303'::UUID, 'No one is crazy with money — everyone makes decisions that make sense based on their unique life experience and emotional relationship with risk.', 0),
('33333333-3333-3333-3333-333333333303'::UUID, 'Wealth is what you DON''T see — it''s the cars not bought, the watches not worn, the homes not upgraded. Wealth is the money that''s invested and growing.', 1),
('33333333-3333-3333-3333-333333333303'::UUID, 'Compounding is the most powerful force in finance, but humans struggle to grasp it because we think linearly while money grows exponentially.', 2);

-- ── 1. The Algebra of Wealth ────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000003-0001-4000-8000-000000000001'::UUID, 'The Algebra of Wealth', 'Scott Galloway', 'lw-3', 'Finance & Money', 8, 5, 'BEGINNER',
 'Galloway''s irreverent formula: Focus + Stoicism + Time + Diversification = Economic security.',
 'NYU professor Scott Galloway strips wealth-building to its fundamentals: Focus (pick a field and get exceptional), Stoicism (spend less than you earn), Time (start investing early and let compounding work), and Diversification (never concentrate risk). No crypto, no shortcuts.',
 'Focus × Stoicism × Time × Diversification',
 'Calculate your "Financial Runway" — months you can survive with zero income. Target 12 months. Below 3 months = financial emergency.',
 2024, 4.55, 0, TRUE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000003-0001-4000-8000-000000000001'::UUID, 'wealth'),
('a0000003-0001-4000-8000-000000000001'::UUID, 'investing'),
('a0000003-0001-4000-8000-000000000001'::UUID, 'personal-finance');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000003-0001-4000-8000-000000000001'::UUID, 'Your career is the most powerful wealth-building tool — invest in skills that compound (sales, coding, leadership).', 0),
('a0000003-0001-4000-8000-000000000001'::UUID, 'Economic security = 12+ months of runway. Below 3 months, you make fear-based decisions that destroy long-term wealth.', 1),
('a0000003-0001-4000-8000-000000000001'::UUID, 'Diversification is the only free lunch in finance — spread risk across index funds, real estate, and human capital.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000003-0001-4000-8000-000000000001'::UUID, 'a0000003-0001-4000-8000-000000000001'::UUID, 'INTRO', 0, 'Wealth Without the BS', 'Scott Galloway built and lost fortunes. Now an NYU professor, he distills wealth creation into four variables. No crypto tips, no "hustle harder" nonsense — just the algebra that actually produces economic security over a lifetime.'),
('b0000003-0001-4000-8000-000000000002'::UUID, 'a0000003-0001-4000-8000-000000000001'::UUID, 'CONCEPT', 1, 'The Four Variables', 'Focus: Pick an industry and become excellent — generalists earn less. Stoicism: The wealth equation''s multiplier — spend 80% of what you earn, ALWAYS. Time: Start investing at 25, not 35 — the decade matters more than the amount. Diversification: Never bet everything on one stock, one property, one income stream.'),
('b0000003-0001-4000-8000-000000000003'::UUID, 'a0000003-0001-4000-8000-000000000001'::UUID, 'CONCEPT', 2, 'The Runway Rule', 'Calculate how many months you can survive with zero income. Below 3 months: you''re in financial danger and will accept bad deals. 6 months: stable. 12+ months: you have "F-you money" — the freedom to walk away from toxic jobs, bad relationships, and stupid risks.'),
('b0000003-0001-4000-8000-000000000004'::UUID, 'a0000003-0001-4000-8000-000000000001'::UUID, 'QUOTE', 3, 'Galloway on Wealth', '"Money is the oxygen of capitalism. You don''t need to love it, but you''ll suffocate without it. The algebra is simple: earn, save, invest, diversify. The hard part is doing it for 30 years."'),
('b0000003-0001-4000-8000-000000000005'::UUID, 'a0000003-0001-4000-8000-000000000001'::UUID, 'SUMMARY', 4, 'Your Wealth Formula', '1. Calculate your runway (monthly expenses × savings = months). Target 12.\n2. Automate savings: 20% of income, pre-tax if possible.\n3. Invest in low-cost index funds — don''t stock-pick.\n4. Your career IS your wealth — invest in skills that compound.');

-- ── 2. Mere Mortals ─────────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000003-0001-4000-8000-000000000002'::UUID, 'Mere Mortals', 'Alexandra Killewald & Others', 'lw-3', 'Finance & Money', 7, 5, 'INTERMEDIATE',
 'How structural forces shape the "American Dream" — revealing the systemic factors that make mobility harder for some than others.',
 'An unflinching analysis of how race, geography, and family wealth predict economic outcomes more than individual effort. Mere Mortals argues that personal finance advice is incomplete without understanding the structural headwinds and tailwinds that shape who gets ahead.',
 'Structural Mobility Analysis',
 'Identify YOUR structural advantages and disadvantages. Plan around them instead of pretending the playing field is level.',
 2024, 4.30, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000003-0001-4000-8000-000000000002'::UUID, 'economics'),
('a0000003-0001-4000-8000-000000000002'::UUID, 'inequality'),
('a0000003-0001-4000-8000-000000000002'::UUID, 'social-mobility');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000003-0001-4000-8000-000000000002'::UUID, 'The zip code you''re born in predicts your income more reliably than your grades, work ethic, or college degree.', 0),
('a0000003-0001-4000-8000-000000000002'::UUID, 'Family wealth compounds across generations — children of homeowners are 4x more likely to become homeowners, regardless of individual effort.', 1),
('a0000003-0001-4000-8000-000000000002'::UUID, 'Understanding structural forces isn''t defeatism — it''s strategic intelligence that lets you plan around obstacles others don''t even see.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000003-0002-4000-8000-000000000001'::UUID, 'a0000003-0001-4000-8000-000000000002'::UUID, 'INTRO', 0, 'The Invisible Headwinds', 'Why do some people seem to "make it" easily while others struggle despite working just as hard? Mere Mortals pulls back the curtain on the structural forces — zip code, race, family wealth — that shape economic outcomes before you ever send your first resume.'),
('b0000003-0002-4000-8000-000000000002'::UUID, 'a0000003-0001-4000-8000-000000000002'::UUID, 'CONCEPT', 1, 'The Zip Code Lottery', 'Where you grow up determines the quality of your schools, your exposure to opportunity, your social network, and even your health. Moving from a low-mobility area to a high-mobility one before age 13 increases lifetime earnings by $300K+ on average.'),
('b0000003-0002-4000-8000-000000000003'::UUID, 'a0000003-0001-4000-8000-000000000002'::UUID, 'CONCEPT', 2, 'Intergenerational Wealth', 'Wealth transfers across generations through three channels: direct inheritance, access to networks ("my dad knows someone"), and stress reduction (not worrying about rent frees cognitive capacity for ambition). Understanding which channels you have — and lack — is strategic intelligence.'),
('b0000003-0002-4000-8000-000000000004'::UUID, 'a0000003-0001-4000-8000-000000000002'::UUID, 'QUOTE', 3, 'On Structural Reality', '"Individual effort matters. But pretending that effort is all that matters is like saying a swimmer''s speed has nothing to do with the current. Understand the current, then swim."'),
('b0000003-0002-4000-8000-000000000005'::UUID, 'a0000003-0001-4000-8000-000000000002'::UUID, 'SUMMARY', 4, 'Navigate Your Structure', '1. Audit your structural advantages (family support, geography, networks) — use them without guilt.\n2. Audit your disadvantages — plan around them with eyes open.\n3. If you have children, invest in "high-mobility zip codes" and network exposure.\n4. Advocate for systemic change while playing the game as it exists.');

-- ── 3. Missing Billionaires ─────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000003-0001-4000-8000-000000000003'::UUID, 'Missing Billionaires', 'Victor Haghani & James White', 'lw-3', 'Finance & Money', 9, 5, 'ADVANCED',
 'Why most wealthy families go broke within generations. Haghani (LTCM survivor) introduces lifecycle utility to protect multigenerational wealth.',
 'Victor Haghani — one of the LTCM survivors — asks: why aren''t there more dynastic billionaires? The answer is bad spending policy. "Missing Billionaires" provides a utility-based framework for deciding how much to save, spend, and insure at each life stage.',
 'Lifecycle Utility Spending Framework',
 'Calculate your "Safe Spending Rate" — the percentage of wealth you can spend annually without risk of ruin. Typically 3-4% for retirees.',
 2023, 4.40, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000003-0001-4000-8000-000000000003'::UUID, 'wealth-management'),
('a0000003-0001-4000-8000-000000000003'::UUID, 'investing'),
('a0000003-0001-4000-8000-000000000003'::UUID, 'risk-management');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000003-0001-4000-8000-000000000003'::UUID, 'If the Vanderbilts had invested their fortune in index funds and spent 3% annually, they''d have $4 billion today. Instead, they went broke — because they had no spending policy.', 0),
('a0000003-0001-4000-8000-000000000003'::UUID, 'The "Safe Spending Rate" (3-4% of portfolio annually) is the single most important number in retirement planning.', 1),
('a0000003-0001-4000-8000-000000000003'::UUID, 'Most financial ruin comes not from bad investments but from bad spending — lifestyle inflation that scales faster than returns.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000003-0003-4000-8000-000000000001'::UUID, 'a0000003-0001-4000-8000-000000000003'::UUID, 'INTRO', 0, 'Where Did All the Billionaires Go?', 'Victor Haghani helped blow up Long-Term Capital Management in 1998 — then spent 25 years studying why wealthy families go broke. The answer isn''t bad investments. It''s bad spending. Missing Billionaires provides the framework to avoid the same fate.'),
('b0000003-0003-4000-8000-000000000002'::UUID, 'a0000003-0001-4000-8000-000000000003'::UUID, 'CONCEPT', 1, 'The Safe Spending Rate', 'The "4% Rule" says you can withdraw 4% of your portfolio annually in retirement without running out. Haghani refines this: 3% is safer for longer horizons, 5% is fine if you''re older. The key insight: have a RULE, not a "feel." Feelings overspend.'),
('b0000003-0003-4000-8000-000000000003'::UUID, 'a0000003-0001-4000-8000-000000000003'::UUID, 'CONCEPT', 2, 'Lifestyle Inflation Is the Killer', 'Every raise triggers a spending upgrade: bigger house, nicer car, fancier vacations. Within 2 years, the raise is "absorbed" and you feel no richer. Haghani''s solution: automate savings BEFORE lifestyle inflation kicks in. When you get a raise, invest 50% of it immediately.'),
('b0000003-0003-4000-8000-000000000004'::UUID, 'a0000003-0001-4000-8000-000000000003'::UUID, 'QUOTE', 3, 'On Wealth Destruction', '"The Vanderbilts didn''t go broke because of bad investments. They went broke because every generation spent more than the last. Wealth without a spending policy is a countdown timer."'),
('b0000003-0003-4000-8000-000000000005'::UUID, 'a0000003-0001-4000-8000-000000000003'::UUID, 'SUMMARY', 4, 'Protect Your Wealth', '1. Set your Safe Spending Rate: 3-4% of investable assets annually.\n2. When you get a raise, invest 50% before you adjust your lifestyle.\n3. Automate: payroll → savings → investments → spending (in that order).\n4. Review spending annually — lifestyle inflation is invisible.');

-- ── 4. The Wealth Decision ──────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000003-0001-4000-8000-000000000004'::UUID, 'The Wealth Decision', 'Dominique Broadway', 'lw-3', 'Finance & Money', 7, 5, 'BEGINNER',
 'Finance meets identity work. Broadway merges money management with the emotional and cultural baggage around wealth.',
 'Dominique Broadway — named America''s #1 financial educator — addresses the emotional and cultural barriers to wealth that most finance books ignore. Her approach combines practical budgeting with identity-level work on money shame, scarcity mindset, and generational money patterns.',
 'Identity-Based Financial Planning',
 'Write your "Money Story" — the narrative you inherited about wealth from your family. Then consciously choose which parts to keep and which to rewrite.',
 2024, 4.35, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000003-0001-4000-8000-000000000004'::UUID, 'personal-finance'),
('a0000003-0001-4000-8000-000000000004'::UUID, 'mindset'),
('a0000003-0001-4000-8000-000000000004'::UUID, 'wealth-building');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000003-0001-4000-8000-000000000004'::UUID, 'Your "money story" — the narrative your family taught you about wealth — runs your financial decisions on autopilot unless you consciously rewrite it.', 0),
('a0000003-0001-4000-8000-000000000004'::UUID, 'Budgeting fails when it''s punitive. Broadway''s approach: give yourself a "Joy Line Item" — guilt-free spending that prevents binge spending.', 1),
('a0000003-0001-4000-8000-000000000004'::UUID, 'Wealth is a decision you make daily, not an event that happens to you. Every purchase is a vote for or against your financial future.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000003-0004-4000-8000-000000000001'::UUID, 'a0000003-0001-4000-8000-000000000004'::UUID, 'INTRO', 0, 'Your Money Has a Story', 'Dominique Broadway grew up watching her family struggle with money despite working hard. She realized that financial literacy alone wasn''t enough — people needed to heal their relationship with money before any budget would stick.'),
('b0000003-0004-4000-8000-000000000002'::UUID, 'a0000003-0001-4000-8000-000000000004'::UUID, 'CONCEPT', 1, 'The Money Story', 'Everyone inherits a "money story" — a set of beliefs about wealth from their upbringing. "Rich people are greedy." "We''re just not money people." "Save everything, enjoy nothing." These stories run on autopilot. Step one is identifying YOUR story and deciding if it serves you.'),
('b0000003-0004-4000-8000-000000000003'::UUID, 'a0000003-0001-4000-8000-000000000004'::UUID, 'CONCEPT', 2, 'The Joy Line Item', 'Broadway''s budget has a non-negotiable "Joy" category — money allocated to things that make you happy with zero guilt. This prevents the binge-spending that happens when budgets are all restriction and no reward. Fun isn''t frivolous — it''s what makes the budget sustainable.'),
('b0000003-0004-4000-8000-000000000004'::UUID, 'a0000003-0001-4000-8000-000000000004'::UUID, 'QUOTE', 3, 'Broadway on Wealth', '"Wealth isn''t about deprivation. It''s about decision. Every time you choose your future self over your impulse self, you''re building wealth. But you have to enjoy the journey, or you''ll quit."'),
('b0000003-0004-4000-8000-000000000005'::UUID, 'a0000003-0001-4000-8000-000000000004'::UUID, 'SUMMARY', 4, 'Rewrite Your Money Story', '1. Write down 3 beliefs about money you inherited from family.\n2. For each: "Does this serve my goals?" If no, write a replacement belief.\n3. Create a Joy Line Item in your budget — 5-10% for guilt-free spending.\n4. Track spending weekly, not monthly — monthly is too late to course-correct.');

-- ── 5. Quit Like a Millionaire ──────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000003-0001-4000-8000-000000000005'::UUID, 'Quit Like a Millionaire', 'Kristy Shen & Bryce Leung', 'lw-3', 'Finance & Money', 7, 5, 'INTERMEDIATE',
 'The FIRE movement from childhood poverty. Shen retired at 31 by engineering her savings rate and investment strategy.',
 'Kristy Shen grew up in rural China drinking water from a river with dead fish. She retired at 31 as a millionaire. Her system: engineering a 50-70% savings rate, investing in index funds, and building a "Yield Shield" of dividend income to weather market downturns.',
 'FIRE — Savings Rate Engineering',
 'Calculate your FIRE number: annual expenses × 25. Then calculate your savings rate and how many years to reach it.',
 2019, 4.50, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000003-0001-4000-8000-000000000005'::UUID, 'FIRE'),
('a0000003-0001-4000-8000-000000000005'::UUID, 'early-retirement'),
('a0000003-0001-4000-8000-000000000005'::UUID, 'index-investing');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000003-0001-4000-8000-000000000005'::UUID, 'Your savings rate — not your income — determines when you can retire. A 50% savings rate means retirement in ~17 years regardless of salary.', 0),
('a0000003-0001-4000-8000-000000000005'::UUID, 'The "Yield Shield" — dividends, interest, and rental income — protects your portfolio from sequence-of-returns risk in early retirement.', 1),
('a0000003-0001-4000-8000-000000000005'::UUID, 'Geographic arbitrage (earning in a high-cost city, living in a low-cost one) can accelerate FIRE by 5-10 years.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000003-0005-4000-8000-000000000001'::UUID, 'a0000003-0001-4000-8000-000000000005'::UUID, 'INTRO', 0, 'From Poverty to Freedom', 'Kristy Shen grew up drinking river water in rural China. By 31, she was a millionaire who never had to work again. Her story isn''t about luck or inheritance — it''s about ruthless savings rate engineering and boring index fund investing.'),
('b0000003-0005-4000-8000-000000000002'::UUID, 'a0000003-0001-4000-8000-000000000005'::UUID, 'CONCEPT', 1, 'The Savings Rate Is Everything', 'At a 10% savings rate, you''ll work for 50+ years. At 50%, about 17 years. At 70%, about 8 years. The math is simple — the gap between income and expenses is the only number that matters. Shen optimized ruthlessly: house-hacking, cooking all meals, and saying no to lifestyle inflation.'),
('b0000003-0005-4000-8000-000000000003'::UUID, 'a0000003-0001-4000-8000-000000000005'::UUID, 'CONCEPT', 2, 'The Yield Shield', 'The scariest part of early retirement is a market crash right after you quit. Shen''s solution: the Yield Shield — allocating part of your portfolio to dividend stocks and bonds that produce income regardless of market price. This cash flow covers expenses while you wait for stocks to recover.'),
('b0000003-0005-4000-8000-000000000004'::UUID, 'a0000003-0001-4000-8000-000000000005'::UUID, 'QUOTE', 3, 'Shen on Freedom', '"I didn''t retire because I hated work. I retired because I loved freedom more. The math said I could, so I did. The hardest part wasn''t the math — it was ignoring everyone who said it was impossible."'),
('b0000003-0005-4000-8000-000000000005'::UUID, 'a0000003-0001-4000-8000-000000000005'::UUID, 'SUMMARY', 4, 'Your FIRE Path', '1. Calculate your FIRE number: annual expenses × 25.\n2. Calculate your savings rate: (income - expenses) / income × 100.\n3. Invest the difference in low-cost index funds (total market + international).\n4. Build a Yield Shield when within 5 years of FIRE.');

-- ── 6. Die With Zero ────────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000003-0001-4000-8000-000000000006'::UUID, 'Die With Zero', 'Bill Perkins', 'lw-3', 'Finance & Money', 7, 5, 'INTERMEDIATE',
 'The counterargument to extreme saving. Perkins argues you should optimize for life experiences, not for the largest possible grave balance.',
 'Bill Perkins challenges the cult of saving by asking: what good is dying with $2 million in the bank? His framework allocates "experience dividends" across life seasons — spending more on travel at 30 (when you have health and energy) and less at 70 (when you don''t).',
 'Experience Dividend Allocation',
 'Map experiences to life seasons. Ask: "What experiences must I have before age X?" Allocate money to them NOW, not in retirement.',
 2020, 4.45, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000003-0001-4000-8000-000000000006'::UUID, 'experiences'),
('a0000003-0001-4000-8000-000000000006'::UUID, 'life-planning'),
('a0000003-0001-4000-8000-000000000006'::UUID, 'spending');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000003-0001-4000-8000-000000000006'::UUID, 'The biggest financial risk isn''t running out of money — it''s running out of time. A 75-year-old with $5M has fewer options than a 30-year-old with $50K.', 0),
('a0000003-0001-4000-8000-000000000006'::UUID, '"Memory dividends" — experiences generate returns for the rest of your life through memories. A trip at 25 pays memory dividends for 60 years.', 1),
('a0000003-0001-4000-8000-000000000006'::UUID, 'Give money to your kids when they need it (age 25-35) — not when you die (when they''re 60 and don''t need it).', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000003-0006-4000-8000-000000000001'::UUID, 'a0000003-0001-4000-8000-000000000006'::UUID, 'INTRO', 0, 'The Anti-FIRE Book', 'Bill Perkins is a hedge fund manager who doesn''t want to die rich. His provocative thesis: most people save too much and live too little. Die With Zero is the antidote to extreme frugality — a framework for spending your money while you can still enjoy it.'),
('b0000003-0006-4000-8000-000000000002'::UUID, 'a0000003-0001-4000-8000-000000000006'::UUID, 'CONCEPT', 1, 'Memory Dividends', 'A vacation at age 25 generates "memory dividends" for 60+ years — every time you reminisce, laugh about it, or bond over it with someone. The same vacation at 75 generates dividends for maybe 10 years. Frontload experiences when you have health and energy.'),
('b0000003-0006-4000-8000-000000000003'::UUID, 'a0000003-0001-4000-8000-000000000006'::UUID, 'CONCEPT', 2, 'The Time Bucket List', 'Divide your remaining life into decades. For each decade, list the experiences that MUST happen then (backpacking in your 20s, coaching your kid''s team in your 40s, writing your memoir in your 70s). Then allocate money to each decade''s experiences FIRST, before investing the rest.'),
('b0000003-0006-4000-8000-000000000004'::UUID, 'a0000003-0001-4000-8000-000000000006'::UUID, 'QUOTE', 3, 'Perkins on Time', '"Your life is the sum of your experiences. Not the sum of your bank balance. At the end, no one says ''I wish I''d saved more.'' They say ''I wish I''d lived more.''"'),
('b0000003-0006-4000-8000-000000000005'::UUID, 'a0000003-0001-4000-8000-000000000006'::UUID, 'SUMMARY', 4, 'Spend Intentionally', '1. Create a "Time Bucket List" — experiences for each remaining decade.\n2. Frontload physical experiences (travel, sports) to your 20s-40s.\n3. Give inheritance to kids when they need it (25-35), not when you die.\n4. Balance: enough savings for security, enough spending for a life well-lived.');

-- ── 7. Just Keep Buying ─────────────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000003-0001-4000-8000-000000000007'::UUID, 'Just Keep Buying', 'Nick Maggiulli', 'lw-3', 'Finance & Money', 7, 5, 'BEGINNER',
 'Data-driven investing for the overwhelmed. Maggiulli proves that time in the market beats timing the market — with real data.',
 'Nick Maggiulli, Chief Operating Officer at Ritholtz Wealth, uses data to demolish investing myths. The core message: buying consistently (regardless of market conditions) beats waiting for "the right time" in 92% of historical scenarios.',
 'Dollar-Cost Averaging + Buy the Dip Analysis',
 'Set up an automatic investment every payday. Never try to time the market — the data says you''ll lose.',
 2022, 4.55, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000003-0001-4000-8000-000000000007'::UUID, 'investing'),
('a0000003-0001-4000-8000-000000000007'::UUID, 'data-driven'),
('a0000003-0001-4000-8000-000000000007'::UUID, 'index-funds');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000003-0001-4000-8000-000000000007'::UUID, 'Dollar-cost averaging (buying regularly regardless of price) beats "buying the dip" in 92% of historical scenarios because nobody can predict dips reliably.', 0),
('a0000003-0001-4000-8000-000000000007'::UUID, 'When you''re young and earning, focus on increasing income (not reducing expenses). When you''re wealthy, focus on portfolio management.', 1),
('a0000003-0001-4000-8000-000000000007'::UUID, 'The biggest risk in investing isn''t a market crash — it''s not investing at all. Cash loses ~2-3% annually to inflation.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000003-0007-4000-8000-000000000001'::UUID, 'a0000003-0001-4000-8000-000000000007'::UUID, 'INTRO', 0, 'The Data Says: Just Buy', 'Nick Maggiulli is a data scientist who got tired of financial advice based on opinions. So he ran the numbers. Just Keep Buying is the result — a data-driven guide that settles the biggest investing debates with actual historical evidence.'),
('b0000003-0007-4000-8000-000000000002'::UUID, 'a0000003-0001-4000-8000-000000000007'::UUID, 'CONCEPT', 1, 'Time in Market > Timing the Market', 'Maggiulli tested every "buy the dip" strategy against simple dollar-cost averaging across 100+ years of data. Result: buying consistently on a fixed schedule beat timing strategies 92% of the time. The reason? While you wait for a dip, the market usually goes up.'),
('b0000003-0007-4000-8000-000000000003'::UUID, 'a0000003-0001-4000-8000-000000000007'::UUID, 'CONCEPT', 2, 'The Income vs. Expense Debate', 'When you earn $50K, cutting expenses has huge impact. When you earn $200K, cutting expenses has diminishing returns. Maggiulli''s rule: early career → maximize income growth (skills, job-hopping, side projects). Later career → optimize portfolio allocation and tax efficiency.'),
('b0000003-0007-4000-8000-000000000004'::UUID, 'a0000003-0001-4000-8000-000000000007'::UUID, 'QUOTE', 3, 'Maggiulli on Timing', '"The best time to invest was yesterday. The second best time is today. The worst time is ''when the market looks good'' — because that''s when it''s already expensive."'),
('b0000003-0007-4000-8000-000000000005'::UUID, 'a0000003-0001-4000-8000-000000000007'::UUID, 'SUMMARY', 4, 'Set It and Forget It', '1. Set up automatic investments every payday — same amount, rain or shine.\n2. Invest in broad index funds (total market or S&P 500).\n3. Early career: focus on earning more, not spending less.\n4. Never check your portfolio more than once a quarter — daily checking causes panic selling.');

-- ── 8. The Millionaire Next Door ────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000003-0001-4000-8000-000000000008'::UUID, 'The Millionaire Next Door', 'Thomas J. Stanley & William D. Danko', 'lw-3', 'Finance & Money', 7, 5, 'BEGINNER',
 'The original study of everyday millionaires. Most don''t drive BMWs — they drive Toyotas and live below their means.',
 'Stanley and Danko spent 20 years studying American millionaires and discovered they look nothing like the stereotype. Most are first-generation wealthy, drive used cars, live in modest homes, and built wealth through boring consistency — not flashy investing.',
 'Prodigious Accumulator of Wealth (PAW) Profile',
 'Calculate your "expected net worth" (Age × Income / 10). If your actual net worth is 2x+ that number, you''re a PAW. If less, you''re under-accumulating.',
 1996, 4.40, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000003-0001-4000-8000-000000000008'::UUID, 'millionaires'),
('a0000003-0001-4000-8000-000000000008'::UUID, 'frugality'),
('a0000003-0001-4000-8000-000000000008'::UUID, 'wealth-research');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000003-0001-4000-8000-000000000008'::UUID, 'Most millionaires don''t look rich — they drive ordinary cars, live in middle-class neighborhoods, and never buy a watch that costs more than $300.', 0),
('a0000003-0001-4000-8000-000000000008'::UUID, 'The PAW formula (Age × Pre-tax Income / 10 = Expected Net Worth) reveals whether you''re building wealth or just earning a high income.', 1),
('a0000003-0001-4000-8000-000000000008'::UUID, '80% of American millionaires are first-generation — they didn''t inherit wealth, they built it through high savings rates and modest consumption.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000003-0008-4000-8000-000000000001'::UUID, 'a0000003-0001-4000-8000-000000000008'::UUID, 'INTRO', 0, 'The Boring Path to Millions', 'Thomas Stanley and William Danko surveyed thousands of millionaires and found the exact opposite of what they expected. No Ferraris. No mansions. Just decades of spending less than they earned. The Millionaire Next Door shattered the myth of flashy wealth.'),
('b0000003-0008-4000-8000-000000000002'::UUID, 'a0000003-0001-4000-8000-000000000008'::UUID, 'CONCEPT', 1, 'PAW vs. UAW', 'A Prodigious Accumulator of Wealth (PAW) has a net worth 2x+ the expected amount for their age and income. An Under Accumulator of Wealth (UAW) has less. Most high-income doctors and lawyers are UAWs — they earn a lot but spend it all on status symbols.'),
('b0000003-0008-4000-8000-000000000003'::UUID, 'a0000003-0001-4000-8000-000000000008'::UUID, 'CONCEPT', 2, 'The Status Trap', 'The biggest wealth destroyer is "status spending" — buying things to signal success to others. Millionaires don''t care about looking rich. They care about BEING rich. The gap between these two mindsets is the entire difference between PAW and UAW.'),
('b0000003-0008-4000-8000-000000000004'::UUID, 'a0000003-0001-4000-8000-000000000008'::UUID, 'QUOTE', 3, 'On Appearances', '"Big hat, no cattle. That''s what we call people who look rich but aren''t. Real millionaires don''t need you to know they''re millionaires."'),
('b0000003-0008-4000-8000-000000000005'::UUID, 'a0000003-0001-4000-8000-000000000008'::UUID, 'SUMMARY', 4, 'Are You a PAW?', '1. Calculate: (Your Age × Pre-tax Income) / 10 = Expected Net Worth.\n2. If actual > 2x expected: you''re a PAW. If less: you''re under-accumulating.\n3. Audit "status spending" — what do you buy to impress others?\n4. Redirect status spending to investments.');

-- ── 9. I Will Teach You to Be Rich ──────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000003-0001-4000-8000-000000000009'::UUID, 'I Will Teach You to Be Rich', 'Ramit Sethi', 'lw-3', 'Finance & Money', 8, 5, 'BEGINNER',
 'The personal finance book for people who hate personal finance. Sethi automates everything and focuses on "Big Wins" over small savings.',
 'Ramit Sethi refuses to tell you to cut lattes. Instead, he focuses on "Big Wins" — automating finances, negotiating salary, and choosing the right accounts — then spending guiltlessly on whatever you love. His 6-week program turns financial chaos into an automated system.',
 'Conscious Spending Plan + Automation',
 'Set up the "Automation Flow": paycheck → 401k → savings → investments → bills → guilt-free spending. Touch nothing manually.',
 2009, 4.60, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000003-0001-4000-8000-000000000009'::UUID, 'automation'),
('a0000003-0001-4000-8000-000000000009'::UUID, 'personal-finance'),
('a0000003-0001-4000-8000-000000000009'::UUID, 'systems');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000003-0001-4000-8000-000000000009'::UUID, 'Focus on "Big Wins" (negotiating salary, automating investments, choosing right accounts) over small savings (cutting lattes saves $5/day; negotiating salary adds $5K+/year).', 0),
('a0000003-0001-4000-8000-000000000009'::UUID, 'The "Conscious Spending Plan" replaces budgets: allocate fixed costs (50-60%), investments (10%), savings (5-10%), and guilt-free spending (20-35%).', 1),
('a0000003-0001-4000-8000-000000000009'::UUID, 'Automate everything — the best financial system requires zero willpower because money moves automatically on payday.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000003-0009-4000-8000-000000000001'::UUID, 'a0000003-0001-4000-8000-000000000009'::UUID, 'INTRO', 0, 'Finance for Normal Humans', 'Ramit Sethi wrote this book because he was tired of finance advice that started with "stop buying coffee." His approach: automate the important stuff, negotiate the big things, and then spend freely on whatever you love — guilt-free.'),
('b0000003-0009-4000-8000-000000000002'::UUID, 'a0000003-0001-4000-8000-000000000009'::UUID, 'CONCEPT', 1, 'Big Wins vs. Small Savings', 'Cutting $5 lattes saves $1,825/year. Negotiating your salary once adds $5,000-15,000/year — compounding for your entire career. Choosing the right index fund saves 1-2% fees annually — worth $100K+ over 30 years. Focus on the big things.'),
('b0000003-0009-4000-8000-000000000003'::UUID, 'a0000003-0001-4000-8000-000000000009'::UUID, 'CONCEPT', 2, 'The Automation Flow', 'On payday, money automatically moves: Step 1: 401k contribution (pre-tax). Step 2: Fixed amount to savings account. Step 3: Fixed amount to investment account. Step 4: Bills auto-pay. Step 5: Whatever''s left = guilt-free spending. You never touch it manually.'),
('b0000003-0009-4000-8000-000000000004'::UUID, 'a0000003-0001-4000-8000-000000000009'::UUID, 'QUOTE', 3, 'Sethi on Frugality', '"I''d rather spend extravagantly on the things I love and cut costs mercilessly on the things I don''t, than be mediocre about everything."'),
('b0000003-0009-4000-8000-000000000005'::UUID, 'a0000003-0001-4000-8000-000000000009'::UUID, 'SUMMARY', 4, 'Automate Your Finances', '1. Open a high-yield savings account + a Roth IRA + a brokerage account.\n2. Set up the Automation Flow from paycheck to each account.\n3. Negotiate one "Big Win" this month: salary, rent, insurance, or a recurring bill.\n4. Spend guilt-free on your "money dials" — whatever brings you genuine joy.');

-- ── 10. Your Money or Your Life ─────────────────────────────────────────────
INSERT INTO essentia_books (id, title, author, life_wheel_area_id, category, duration, card_count, difficulty, description, summary_text, core_methodology, app_application, publication_year, rating, completion_count, is_featured, is_published) VALUES
('a0000003-0001-4000-8000-000000000010'::UUID, 'Your Money or Your Life', 'Vicki Robin & Joe Dominguez', 'lw-3', 'Finance & Money', 8, 5, 'INTERMEDIATE',
 'The original FIRE manifesto. Robin''s "Life Energy" concept reframes every purchase as a trade of your irreplaceable hours.',
 'The book that launched the FIRE movement. Robin and Dominguez introduce "Life Energy" — the idea that money represents hours of your life. By calculating your true hourly wage and asking "Is this purchase worth X hours of my life?" you transform spending from autopilot to intentional.',
 'Life Energy Accounting',
 'Calculate your REAL hourly wage (include commute, decompression, work clothes). Then price purchases in hours, not dollars.',
 1992, 4.50, 0, FALSE, TRUE);

INSERT INTO essentia_book_tags (book_id, tag) VALUES
('a0000003-0001-4000-8000-000000000010'::UUID, 'FIRE'),
('a0000003-0001-4000-8000-000000000010'::UUID, 'mindful-spending'),
('a0000003-0001-4000-8000-000000000010'::UUID, 'life-energy');

INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('a0000003-0001-4000-8000-000000000010'::UUID, 'Your real hourly wage isn''t salary ÷ hours. Include commute, decompression, work clothes, and stress eating. Most people earn 30-50% less per hour than they think.', 0),
('a0000003-0001-4000-8000-000000000010'::UUID, 'Framing purchases as "hours of life energy" transforms spending: that $200 dinner costs 8 hours of your life. Is it worth it?', 1),
('a0000003-0001-4000-8000-000000000010'::UUID, 'The "Crossover Point" — when investment income exceeds expenses — is the moment you become financially independent. Track it monthly.', 2);

INSERT INTO essentia_cards (id, book_id, type, sort_order, title, text) VALUES
('b0000003-0010-4000-8000-000000000001'::UUID, 'a0000003-0001-4000-8000-000000000010'::UUID, 'INTRO', 0, 'The Original FIRE Bible', 'Before FIRE was a movement, Vicki Robin and Joe Dominguez published this quiet manifesto in 1992. Their idea was radical: money is not abstract — it represents the hours of your life you traded for it. Once you see spending through this lens, everything changes.'),
('b0000003-0010-4000-8000-000000000002'::UUID, 'a0000003-0001-4000-8000-000000000010'::UUID, 'CONCEPT', 1, 'Life Energy', 'Calculate your REAL hourly wage: Take your salary. Subtract taxes, commute costs, work clothes, decompression time, and stress-related spending. Divide by total hours (work + commute + decompression). For many people, a $100K salary becomes $25/hour in life energy.'),
('b0000003-0010-4000-8000-000000000003'::UUID, 'a0000003-0001-4000-8000-000000000010'::UUID, 'CONCEPT', 2, 'The Crossover Point', 'Track two lines on a graph: Monthly Expenses (going down as you optimize) and Monthly Investment Income (going up as you invest). When the lines cross — investment income exceeds expenses — you are financially independent. Everything before is the journey. Everything after is freedom.'),
('b0000003-0010-4000-8000-000000000004'::UUID, 'a0000003-0001-4000-8000-000000000010'::UUID, 'QUOTE', 3, 'Robin on Money', '"Money is something we choose to trade our life energy for. We sell our life energy for money. The question becomes: how much life energy are we willing to exchange for what we get?"'),
('b0000003-0010-4000-8000-000000000005'::UUID, 'a0000003-0001-4000-8000-000000000010'::UUID, 'SUMMARY', 4, 'Track Your Life Energy', '1. Calculate your real hourly wage (include ALL work-related costs and time).\n2. Before any purchase, ask: "Is this worth X hours of my life?"\n3. Track monthly expenses AND investment income on the same chart.\n4. Work toward the Crossover Point — where passive income > expenses.');
