-- V48: Update existing seed books with V39 fields
-- Deep Work was seeded in V8 but missed the V39 field update in V41

-- ── Update Deep Work (lw-2 Career & Work) ───────────────────────────────────
UPDATE essentia_books SET
  summary_text = 'Cal Newport''s Deep Work argues that the ability to perform focused, distraction-free work is becoming increasingly rare AND increasingly valuable. Those who cultivate this skill will thrive. Those who don''t will be left behind in a shallow, distracted world.',
  core_methodology = 'Deep Work vs. Shallow Work',
  app_application = 'Block 90 minutes for "deep work" tomorrow — phone off, notifications silenced, door closed. Work on your most important task. Track how much more you accomplish vs. a normal distracted session.',
  is_featured = TRUE,
  is_published = TRUE
WHERE id = '33333333-3333-3333-3333-333333333302'::UUID;

-- Add takeaways for Deep Work
INSERT INTO essentia_book_takeaways (book_id, takeaway, sort_order) VALUES
('33333333-3333-3333-3333-333333333302'::UUID, 'Deep Work = professional activities performed in a state of distraction-free concentration that push your cognitive capabilities to their limit. This is where breakthroughs happen.', 0),
('33333333-3333-3333-3333-333333333302'::UUID, 'The four disciplines: 1. Work Deeply (schedule it), 2. Embrace Boredom (train focus like a muscle), 3. Quit Social Media (or ruthlessly limit it), 4. Drain the Shallows (minimize admin work).', 1),
('33333333-3333-3333-3333-333333333302'::UUID, 'Attention residue: when you switch from Task A to Task B, part of your attention stays stuck on Task A. This is why multitasking kills productivity — you''re never fully present on anything.', 2);
