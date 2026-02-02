-- ============================================================================
-- V21: Knowledge Hub - Educational Content Management
-- Categories & Items for explaining all KAIZ app features
-- ============================================================================

-- Knowledge Categories (grouping by feature area)
CREATE TABLE knowledge_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    item_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_category_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- Knowledge Items (individual educational content pieces)
CREATE TABLE knowledge_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES knowledge_categories(id) ON DELETE SET NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    content TEXT,
    difficulty VARCHAR(20) DEFAULT 'BEGINNER',
    read_time_minutes INTEGER DEFAULT 2,
    tags JSONB DEFAULT '[]',
    icon VARCHAR(50),
    status VARCHAR(20) DEFAULT 'DRAFT',
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    search_keywords TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT chk_item_status CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    CONSTRAINT chk_item_difficulty CHECK (difficulty IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED'))
);

-- Indexes for performance
CREATE INDEX idx_knowledge_categories_status ON knowledge_categories(status);
CREATE INDEX idx_knowledge_categories_order ON knowledge_categories(display_order);
CREATE INDEX idx_knowledge_items_category ON knowledge_items(category_id);
CREATE INDEX idx_knowledge_items_status ON knowledge_items(status);
CREATE INDEX idx_knowledge_items_slug ON knowledge_items(slug);
CREATE INDEX idx_knowledge_items_featured ON knowledge_items(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_knowledge_items_search ON knowledge_items USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(search_keywords, '')));

-- ============================================================================
-- Seed Data: 17 Categories covering all KAIZ features
-- ============================================================================

INSERT INTO knowledge_categories (slug, name, description, icon, color, display_order, status) VALUES
('agile-methodology', 'Agile Methodology', 'Core Agile principles applied to personal life management', '🏃', 'from-blue-500 to-cyan-500', 1, 'ACTIVE'),
('sprint-planning', 'Sprint Planning', 'Weekly sprint cycles, planning ceremonies, and capacity management', '📅', 'from-purple-500 to-pink-500', 2, 'ACTIVE'),
('task-management', 'Task Management', 'Creating, organizing, and completing tasks effectively', '✅', 'from-green-500 to-emerald-500', 3, 'ACTIVE'),
('eisenhower-matrix', 'Eisenhower Matrix', 'Prioritization framework: Urgent vs Important', '🎯', 'from-red-500 to-orange-500', 4, 'ACTIVE'),
('epics-goals', 'Epics & Long-Term Goals', 'Managing large projects that span multiple sprints', '🏔️', 'from-indigo-500 to-purple-500', 5, 'ACTIVE'),
('calendar-integration', 'Calendar Integration', 'Syncing with Google, Apple, and Outlook calendars', '📆', 'from-teal-500 to-cyan-500', 6, 'ACTIVE'),
('sensai-coach', 'SensAI Coach', 'Your AI Scrum Master: standups, interventions, and coaching', '🤖', 'from-violet-500 to-purple-500', 7, 'ACTIVE'),
('life-wheel', 'Life Wheel Balance', 'Tracking and balancing the 9 dimensions of life', '🎡', 'from-pink-500 to-rose-500', 8, 'ACTIVE'),
('challenges-gamification', 'Challenges & Gamification', 'Streaks, challenges, and turning goals into games', '🏆', 'from-amber-500 to-yellow-500', 9, 'ACTIVE'),
('pomodoro-focus', 'Pomodoro & Focus', 'Focus sessions, deep work, and the Pomodoro technique', '🍅', 'from-red-500 to-pink-500', 10, 'ACTIVE'),
('essentia-library', 'Essentia Library', 'Book summaries and knowledge cards', '📚', 'from-cyan-500 to-blue-500', 11, 'ACTIVE'),
('motivation-engine', 'Motivation Engine', 'Quotes, affirmations, and inspiration content', '💪', 'from-orange-500 to-red-500', 12, 'ACTIVE'),
('community-templates', 'Community & Templates', 'Template marketplace and community features', '🌐', 'from-blue-500 to-indigo-500', 13, 'ACTIVE'),
('family-workspace', 'Family Workspace', 'Shared task management for families', '👨‍👩‍👧‍👦', 'from-pink-500 to-purple-500', 14, 'ACTIVE'),
('command-center', 'Command Center', 'Universal intake and AI-powered task creation', '📥', 'from-yellow-500 to-orange-500', 15, 'ACTIVE'),
('notifications-reminders', 'Notifications & Reminders', 'Smart alerts and escalation system', '🔔', 'from-slate-500 to-zinc-500', 16, 'ACTIVE'),
('settings-security', 'Settings & Security', 'Configuration, privacy, and security features', '🔒', 'from-gray-500 to-slate-500', 17, 'ACTIVE');

-- ============================================================================
-- Seed Data: Sample Knowledge Items (comprehensive coverage)
-- ============================================================================

-- Agile Methodology
INSERT INTO knowledge_items (category_id, slug, title, summary, content, difficulty, read_time_minutes, icon, status, display_order, search_keywords) VALUES
((SELECT id FROM knowledge_categories WHERE slug = 'agile-methodology'), 
'what-is-agile', 'What is Agile?', 
'Agile is a methodology that transformed software development — and now your life.',
'## Agile: The System Behind World-Class Teams

Agile is the methodology that companies like Apple, Google, Spotify, and Amazon use to ship world-class products every week.

### Core Principles:
- **Work in short, focused cycles** (Sprints)
- **Commit only to what you can deliver**
- **Measure everything**
- **Improve continuously**
- **Adapt quickly when things change**

### Why Agile for Life?

Your life is the most important product you''ll ever build. Traditional approaches fail because:
- Endless to-do lists that never end
- Vague annual goals that fade by February
- Reactive firefighting instead of proactive planning

**Kaiz applies Agile to your personal life** — bringing structure, measurement, and continuous improvement to everything you do.',
'BEGINNER', 3, '🏃', 'PUBLISHED', 1, 'agile methodology scrum kanban sprint planning productivity');

INSERT INTO knowledge_items (category_id, slug, title, summary, content, difficulty, read_time_minutes, icon, status, display_order, search_keywords) VALUES
((SELECT id FROM knowledge_categories WHERE slug = 'agile-methodology'), 
'agile-vs-traditional', 'Agile vs Traditional Planning', 
'Why fixed annual goals fail and iterative cycles succeed.',
'## The Problem with Traditional Planning

### Annual Goals Approach:
- Set big goals in January
- Forget them by March
- Feel guilty in December
- Repeat

### The Agile Alternative:
Instead of planning a year ahead, plan one week at a time:

| Approach | Traditional | Agile |
|----------|-------------|-------|
| Planning | Yearly | Weekly |
| Feedback | Annual review | Every sprint |
| Adaptability | Low | High |
| Success rate | ~8% | Much higher |

### The 52-Sprint Year
With weekly sprints, you get **52 opportunities to improve** instead of waiting a full year to see if your plan worked.',
'BEGINNER', 2, '📊', 'PUBLISHED', 2, 'agile traditional waterfall planning goals annual quarterly');

-- Sprint Planning
INSERT INTO knowledge_items (category_id, slug, title, summary, content, difficulty, read_time_minutes, icon, status, display_order, search_keywords) VALUES
((SELECT id FROM knowledge_categories WHERE slug = 'sprint-planning'), 
'what-is-sprint', 'What is a Sprint?', 
'A sprint is a fixed time cycle (usually 1 week) for focused execution.',
'## Sprints: Your Weekly Execution Cycle

A **Sprint** is a fixed time period where you commit to completing a specific set of tasks.

### In Kaiz:
- **Duration**: 1 week (Sunday to Saturday)
- **Start**: Sprint Planning (Sunday)
- **Daily**: Quick standups
- **End**: Review & Retrospective

### Why Weekly Sprints?

- **Short enough** to stay focused
- **Long enough** to accomplish meaningful work
- **Regular enough** to build habits
- **Flexible enough** to adapt quickly

### The Sprint Rhythm:

```
Sunday    → Plan the sprint
Mon-Fri   → Execute with focus
Saturday  → Review what shipped
Sunday    → Reflect and improve
```

This cycle repeats 52 times per year — 52 chances to improve your life.',
'BEGINNER', 2, '📅', 'PUBLISHED', 1, 'sprint week cycle planning execution agile');

INSERT INTO knowledge_items (category_id, slug, title, summary, content, difficulty, read_time_minutes, icon, status, display_order, search_keywords) VALUES
((SELECT id FROM knowledge_categories WHERE slug = 'sprint-planning'), 
'velocity-explained', 'Understanding Velocity', 
'Velocity is your average completed story points — your real capacity.',
'## Velocity: Know Your True Capacity

**Velocity** is the average number of story points you complete per sprint.

### Why It Matters:
- Stops overcommitment
- Enables realistic planning
- Shows improvement over time

### How It''s Calculated:

```
Velocity = (Sprint 1 + Sprint 2 + Sprint 3 + Sprint 4) / 4
```

### Example:
- Sprint 1: 24 points
- Sprint 2: 28 points
- Sprint 3: 26 points
- Sprint 4: 30 points
- **Velocity**: 27 points

### Using Velocity:
When planning next sprint, commit to ~27 points. Going significantly over means you''re overcommitting.

> ⚠️ **SensAI Alert**: "You''ve committed 45 points. Your velocity is 27. That''s 67% over capacity."',
'INTERMEDIATE', 3, '📈', 'PUBLISHED', 2, 'velocity capacity points planning sprint average');

INSERT INTO knowledge_items (category_id, slug, title, summary, content, difficulty, read_time_minutes, icon, status, display_order, search_keywords) VALUES
((SELECT id FROM knowledge_categories WHERE slug = 'sprint-planning'), 
'sprint-planning-ceremony', 'Sprint Planning Ceremony', 
'How to run an effective weekly planning session.',
'## The Sprint Planning Ceremony

Every Sunday, run this 15-minute ceremony:

### Step 1: Review Backlog (3 min)
- Look at all pending tasks
- Check carryover from last sprint
- Note any new priorities

### Step 2: Set Capacity (2 min)
- Check your velocity
- Consider upcoming events/meetings
- Set realistic point target

### Step 3: Select Tasks (8 min)
- Pick tasks from backlog
- Ensure they fit within capacity
- Balance across life dimensions

### Step 4: Commit (2 min)
- Lock in the sprint scope
- Set a sprint goal
- Start the week

### Pro Tips:
- 🎯 Leave 10-20% buffer for surprises
- ⚖️ Include tasks from at least 3 life dimensions
- 🌱 Always include at least one Q2 (growth) task',
'INTERMEDIATE', 4, '📋', 'PUBLISHED', 3, 'planning ceremony sunday weekly backlog capacity');

-- Task Management
INSERT INTO knowledge_items (category_id, slug, title, summary, content, difficulty, read_time_minutes, icon, status, display_order, search_keywords) VALUES
((SELECT id FROM knowledge_categories WHERE slug = 'task-management'), 
'story-points-guide', 'Story Points Guide', 
'Story points measure effort, not time. Here''s how to estimate.',
'## Story Points: Measuring Effort

Story points measure **effort and complexity**, not hours.

### The Fibonacci Scale:
| Points | Effort | Examples |
|--------|--------|----------|
| **1** | Trivial (<15 min) | Send email, make call |
| **2** | Quick (15-30 min) | Review document, short workout |
| **3** | Small (30-60 min) | Write report section, grocery run |
| **5** | Medium (1-2 hours) | Deep work session, family outing |
| **8** | Large (half day) | Major project milestone |
| **13** | Very large (full day) | Workshop, major home task |
| **21** | Massive (multi-day) | Should be broken down |

### Why Fibonacci?
The gaps grow larger because estimation accuracy decreases for bigger tasks.

### Tips:
- If it''s 13+, break it into smaller tasks
- Compare new tasks to ones you''ve done before
- Don''t overthink — rough estimates work fine',
'BEGINNER', 3, '🔢', 'PUBLISHED', 1, 'story points fibonacci estimation effort complexity');

INSERT INTO knowledge_items (category_id, slug, title, summary, content, difficulty, read_time_minutes, icon, status, display_order, search_keywords) VALUES
((SELECT id FROM knowledge_categories WHERE slug = 'task-management'), 
'task-statuses', 'Task Statuses Explained', 
'Track progress with clear status indicators.',
'## Task Statuses

Each task moves through a workflow:

| Status | Icon | Meaning |
|--------|------|---------|
| **Draft** | 📝 | Not ready for sprint |
| **To Do** | ⬜ | Ready to start |
| **In Progress** | 🔵 | Currently working |
| **Done** | ✅ | Completed |
| **Blocked** | 🚫 | Waiting on something |

### Best Practices:

1. **Keep "In Progress" minimal** — Only have 1-2 tasks in progress at once

2. **Use "Blocked" proactively** — Note what you''re waiting for

3. **Move to "Done" immediately** — Celebrate the completion!

### Status Flow:
```
Draft → To Do → In Progress → Done
                    ↓
                 Blocked → In Progress → Done
```',
'BEGINNER', 2, '✅', 'PUBLISHED', 2, 'status workflow progress done blocked todo');

-- Eisenhower Matrix
INSERT INTO knowledge_items (category_id, slug, title, summary, content, difficulty, read_time_minutes, icon, status, display_order, search_keywords) VALUES
((SELECT id FROM knowledge_categories WHERE slug = 'eisenhower-matrix'), 
'eisenhower-overview', 'The Eisenhower Matrix', 
'Prioritize by Urgent vs Important — the framework that changed productivity.',
'## The Eisenhower Matrix

Named after President Eisenhower who said: *"What is important is seldom urgent and what is urgent is seldom important."*

### The Four Quadrants:

|   | **Urgent** | **Not Urgent** |
|---|------------|----------------|
| **Important** | **Q1: DO FIRST** 🔥 | **Q2: SCHEDULE** 🎯 |
| **Not Important** | **Q3: DELEGATE** ⚡ | **Q4: ELIMINATE** 🗑️ |

### Quadrant Breakdown:

**Q1 - Crises & Deadlines**
- Emergencies, pressing problems
- Do immediately

**Q2 - Growth & Strategy** ⭐
- Long-term important work
- WHERE YOUR FUTURE IS BUILT

**Q3 - Interruptions**
- Others'' priorities
- Minimize or delegate

**Q4 - Time Wasters**
- Busy work, distractions
- Eliminate ruthlessly

### The Secret:
Most people live in Q1 (firefighting). The key to a great life is protecting Q2 time.',
'BEGINNER', 3, '🎯', 'PUBLISHED', 1, 'eisenhower matrix priority urgent important quadrant');

INSERT INTO knowledge_items (category_id, slug, title, summary, content, difficulty, read_time_minutes, icon, status, display_order, search_keywords) VALUES
((SELECT id FROM knowledge_categories WHERE slug = 'eisenhower-matrix'), 
'q2-focus', 'The Power of Q2', 
'Quadrant 2 is where life-changing work happens — but it''s the most neglected.',
'## Why Q2 is Everything

**Q2 = Important but Not Urgent**

This is where:
- Strategic planning happens
- Relationships deepen
- Skills develop
- Prevention beats firefighting
- Dreams become reality

### The Q2 Trap:

Because Q2 tasks aren''t urgent, they get pushed aside for Q1 crises. But here''s the truth:

> Most Q1 crises exist because Q2 work was neglected.

### Examples:

| Q1 (Crisis) | Q2 (Prevention) |
|-------------|-----------------|
| Heart attack | Regular exercise |
| Project deadline crunch | Proper planning |
| Relationship crisis | Regular date nights |
| Car breakdown | Scheduled maintenance |

### The Fix:
**Always include at least one Q2 task in every sprint.** Kaiz tracks this and alerts you when Q2 is empty.',
'INTERMEDIATE', 3, '🌱', 'PUBLISHED', 2, 'q2 quadrant important growth strategic prevention');

-- Pomodoro & Focus
INSERT INTO knowledge_items (category_id, slug, title, summary, content, difficulty, read_time_minutes, icon, status, display_order, search_keywords) VALUES
((SELECT id FROM knowledge_categories WHERE slug = 'pomodoro-focus'), 
'pomodoro-technique', 'The Pomodoro Technique', 
'25 minutes of focus, 5-minute break — the proven focus method.',
'## The Pomodoro Technique

A simple but powerful focus method invented by Francesco Cirillo.

### The Basic Cycle:

1. **Choose a task**
2. **Set timer for 25 minutes**
3. **Work with ZERO distractions**
4. **Take 5-minute break**
5. **After 4 pomodoros, take 15-30 minute break**

### Why It Works:

- **Urgency** — The timer creates focus
- **Breaks** — Prevents burnout
- **Counting** — Makes progress visible
- **Rhythm** — Builds deep work habits

### In Kaiz:

- Link pomodoros to specific tasks
- Track focus time per life dimension
- See analytics on deep work distribution
- Get reminded for breaks

### Pro Tips:
- 🎧 Use headphones as a "do not disturb" signal
- 📵 Put phone in another room
- ✍️ Write distracting thoughts on paper, handle later',
'BEGINNER', 3, '🍅', 'PUBLISHED', 1, 'pomodoro focus timer 25 minutes deep work concentration');

-- Life Wheel
INSERT INTO knowledge_items (category_id, slug, title, summary, content, difficulty, read_time_minutes, icon, status, display_order, search_keywords) VALUES
((SELECT id FROM knowledge_categories WHERE slug = 'life-wheel'), 
'nine-dimensions', 'The 9 Life Dimensions', 
'A balanced life covers all 9 dimensions — not just work.',
'## The 9 Dimensions of Life

| # | Dimension | Icon | What It Covers |
|---|-----------|------|----------------|
| 1 | **Health & Fitness** | 💪 | Exercise, nutrition, sleep, medical |
| 2 | **Career & Work** | 💼 | Job, business, professional growth |
| 3 | **Finance & Money** | 💰 | Income, savings, investments, bills |
| 4 | **Personal Growth** | 🧠 | Learning, skills, self-improvement |
| 5 | **Relationships & Family** | ❤️ | Partner, kids, parents, close family |
| 6 | **Social Life** | 👥 | Friends, community, networking |
| 7 | **Fun & Recreation** | 🎨 | Hobbies, entertainment, play |
| 8 | **Environment & Home** | 🏠 | Living space, possessions, organization |
| 9 | **Spirit & Meaning** | 🙏 | Purpose, values, mindfulness |

### Why All 9 Matter:

Neglecting any dimension creates imbalance. Common patterns:
- High Career + Low Health = Burnout
- High Work + Low Relationships = Loneliness
- All Urgent + Zero Growth = Stagnation

**Kaiz tracks your investment across all 9 dimensions** and alerts you when something is neglected.',
'BEGINNER', 3, '🎡', 'PUBLISHED', 1, 'life wheel dimensions balance health career relationships');

-- SensAI Coach
INSERT INTO knowledge_items (category_id, slug, title, summary, content, difficulty, read_time_minutes, icon, status, display_order, search_keywords) VALUES
((SELECT id FROM knowledge_categories WHERE slug = 'sensai-coach'), 
'what-is-sensai', 'What is SensAI?', 
'SensAI is your AI Scrum Master — coaching, protecting, and improving your system.',
'## SensAI: Your AI Scrum Master

In Agile teams, the **Scrum Master** protects the team and coaches continuous improvement. SensAI does this for your life.

### SensAI''s Roles:

🛡️ **Protector** — Prevents overcommitment

💡 **Coach** — Suggests improvements

📊 **Analyst** — Tracks patterns and metrics

🚨 **Alerter** — Intervenes when things go wrong

### Types of Interventions:

| Type | Icon | When |
|------|------|------|
| Alert | 🚨 | Immediate action needed |
| Warning | ⚠️ | Problem forming |
| Nudge | 💡 | Suggestion/opportunity |
| Celebration | 🎉 | Achievement unlocked |

### Example Alerts:

> 🚨 "You''ve committed 52 points. Your velocity is 28. That''s 86% over capacity."

> ⚠️ "Your Health dimension has been 0% for 3 sprints."

> 💡 "Your Q2 is empty. Add one strategic task."

> 🎉 "4-sprint streak at 90%+ completion!"',
'BEGINNER', 3, '🤖', 'PUBLISHED', 1, 'sensai ai coach scrum master alerts interventions');

INSERT INTO knowledge_items (category_id, slug, title, summary, content, difficulty, read_time_minutes, icon, status, display_order, search_keywords) VALUES
((SELECT id FROM knowledge_categories WHERE slug = 'sensai-coach'), 
'daily-standup', 'The Daily Standup', 
'A 2-minute daily check-in to stay on track.',
'## The Daily Standup

A quick daily reflection — takes just 2 minutes.

### The 4 Questions:

**1. Yesterday** — What did you complete?
(Auto-populated from Done tasks)

**2. Today** — What''s the focus?
(Shows today''s planned tasks)

**3. Blockers** — Anything stopping you?
(Log obstacles, SensAI tracks them)

**4. Mood** — How are you feeling?
😄 Great | 🙂 Good | 😐 Okay | 😔 Struggling

### Why Mood Matters:

Mood tracking helps detect:
- Burnout patterns
- Motivation dips
- When to ease up

### Best Time:
Morning — Before starting work. Sets intention for the day.

### The Habit:
Once you''ve done standups for a few weeks, you''ll notice patterns you never saw before. That''s the power of consistent reflection.',
'BEGINNER', 2, '☀️', 'PUBLISHED', 2, 'standup daily morning checkin reflection mood');

-- Challenges & Gamification
INSERT INTO knowledge_items (category_id, slug, title, summary, content, difficulty, read_time_minutes, icon, status, display_order, search_keywords) VALUES
((SELECT id FROM knowledge_categories WHERE slug = 'challenges-gamification'), 
'creating-challenges', 'Creating Effective Challenges', 
'Turn goals into games with streaks, tracking, and accountability.',
'## Challenges: Goals as Games

Challenges transform vague intentions into trackable games.

### Challenge Types:

| Type | How It Works | Example |
|------|--------------|---------|
| **Count** | Track a number | 10,000 steps daily |
| **Yes/No** | Did you do it? | No sugar today |
| **Streak** | Consecutive days | 7-day meditation |
| **Time** | Minutes/hours | 30 min reading |
| **Completion** | Milestones | Finish 10 chapters |

### Creating a Challenge:

1. **Name** — Clear, motivating title
2. **Type** — Pick from above
3. **Target** — The goal number
4. **Duration** — 7, 21, 30, or 90 days
5. **Why** — Your personal motivation

### Streak Power:

Streaks are incredibly motivating:
- Day 1-7: Building the habit
- Day 8-21: Habit forming
- Day 22+: Automatic behavior

> 🔥 Breaking a 45-day streak hurts. That''s the point.',
'BEGINNER', 3, '🏆', 'PUBLISHED', 1, 'challenges goals streaks gamification tracking habits');

-- Epics & Goals
INSERT INTO knowledge_items (category_id, slug, title, summary, content, difficulty, read_time_minutes, icon, status, display_order, search_keywords) VALUES
((SELECT id FROM knowledge_categories WHERE slug = 'epics-goals'), 
'what-is-epic', 'What is an Epic?', 
'An Epic is a large goal spanning multiple sprints, broken into manageable tasks.',
'## Epics: Big Goals, Small Steps

An **Epic** is a goal too large for one sprint. It gets broken into smaller tasks spread across weeks or months.

### Examples of Epics:
- "Learn Spanish" (3 months)
- "Renovate bathroom" (6 weeks)
- "Get AWS certification" (2 months)
- "Plan wedding" (1 year)
- "Write a book" (6 months)

### Epic Structure:

```
Epic: Learn Spanish 🇪🇸
├── Task: Download Duolingo (1 pt) - Sprint 1
├── Task: Complete Basics 1 (3 pts) - Sprint 1
├── Task: Complete Basics 2 (3 pts) - Sprint 2
├── Task: 30-day streak (5 pts) - Sprint 5
├── Task: Have 5-min conversation (8 pts) - Sprint 8
└── Task: Watch movie in Spanish (5 pts) - Sprint 12
```

### Tracking Progress:
- Total points across all tasks
- Completion percentage
- Burndown chart
- Target sprint indicator

The key: **Big dreams, tiny steps, every week.**',
'BEGINNER', 3, '🏔️', 'PUBLISHED', 1, 'epic goal project long-term multi-sprint breakdown');

-- Community & Templates
INSERT INTO knowledge_items (category_id, slug, title, summary, content, difficulty, read_time_minutes, icon, status, display_order, search_keywords) VALUES
((SELECT id FROM knowledge_categories WHERE slug = 'community-templates'), 
'using-templates', 'Using Templates', 
'Download ready-made sprint plans, challenges, and epics from the community.',
'## Templates: Don''t Start from Scratch

The community has built templates for common goals. Download and customize.

### Template Types:

| Type | What It Is | Example |
|------|------------|---------|
| **Sprint Plans** | Weekly task bundles | "Productive Work Week" |
| **Rituals** | Daily/weekly routines | "Morning Power Routine" |
| **Challenges** | Habit challenges | "30-Day Fitness Challenge" |
| **Epics** | Multi-sprint projects | "Home Renovation Project" |
| **Checklists** | Task lists | "Vacation Packing List" |

### How to Use:

1. Browse templates by category
2. Preview before downloading
3. Download to your account
4. Customize for your needs
5. Execute!

### Creating Templates:

Share your successful systems:
1. Build from your own tasks/epics
2. Package with description
3. Set visibility (public/private)
4. Earn reputation points

**Stand on the shoulders of others** — don''t reinvent the wheel.',
'BEGINNER', 2, '📦', 'PUBLISHED', 1, 'templates community download marketplace sharing');

-- Update category item counts
UPDATE knowledge_categories SET item_count = (
    SELECT COUNT(*) FROM knowledge_items WHERE knowledge_items.category_id = knowledge_categories.id AND knowledge_items.status = 'PUBLISHED'
);
