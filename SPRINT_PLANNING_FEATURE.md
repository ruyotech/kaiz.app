# Sprint Planning Guided Flow — Implementation Plan

> **Status**: ✅ Complete  
> **Date**: February 8, 2026  
> **Priority**: Critical — Core feature of KAIZ LifeOS  
> **Completion**: All 14 steps implemented across backend + mobile

---

## Overview

A full sprint planning system with per-user commitment tracking, default 56-point velocity, Sunday ceremony with local push notifications, empty-sprint mid-week guidance, and a 4-step wizard featuring multi-select backlog, template creation, AI-powered suggestions for Life Wheel balance, inline quick-add — with a persistent capacity bar always visible and a mandatory review summary before atomic commit + auto-activation.

---

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Default velocity | 56 points (8 pts/day × 7 days) | User can adjust up/down based on sprints or preference |
| Sprint auto-activation | Yes, on commit if `startDate ≤ today` | User sees summary before committing |
| Template task creation | Immediate on create, then "Add to Sprint" | User can edit task before committing to sprint |
| Sprint commitment tracking | `committed_at` on `VelocityRecord` | Per-user, distinguishes formal commit from manual task adds |
| Capacity bar visibility | Persistent floating bar in ALL wizard steps | User always sees selected vs expected points |
| Notification trigger | Permission requested when user sets planning time | Contextual, not on first launch |
| Sprint pre-generation | Handled by Flyway seed (2025–2027) | Runtime generation deferred |
| AI suggestions context | `PlanningContext` in `SmartInputRequest` | Claude gets Life Wheel gaps + remaining capacity |

---

## Implementation Steps

### Step 1: Backend — Flyway V34 Migration

**File**: `apps/backend/src/main/resources/db/migration/V34__sprint_planning_settings.sql`

Schema changes:
- **Create `sensai_ceremonies` table** — Entity exists but no migration (relies on `ddl-auto: update` in dev)
- **Add to `sensai_settings`**: `target_velocity` (INTEGER DEFAULT 56), `planning_day_of_week` (VARCHAR DEFAULT 'SUNDAY'), `planning_time` (VARCHAR DEFAULT '10:00')
- **Add to `sensai_velocity_records`**: `committed_at` (TIMESTAMP, nullable)

### Step 2: Backend — Update Entities & DTOs

**Files**:
- `SensAISettings.java` — Add 3 new fields
- `VelocityRecord.java` — Add `committedAt` field
- `SensAISettingsDto.java` — Add fields to both read and update DTOs
- `SensAIMapper.java` — Map new fields
- `SmartInputRequest.java` — Add `PlanningContext` inner record

### Step 3: Backend — Sprint Commit Endpoint

**Endpoint**: `POST /api/v1/sprints/{id}/commit`

**Request**: `{ taskIds: List<String>, sprintGoal: String }`

**Logic**:
1. Bulk-set `sprintId` on all referenced tasks for authenticated user
2. Sum `storyPoints` into committed points
3. Upsert `VelocityRecord` with `committedPoints`, `committedAt`, `dimensionDistribution`
4. Auto-set `sprint.status = ACTIVE` if `startDate ≤ today`
5. Call ceremony completion logic
6. Return `SprintCommitResponse`

### Step 4: Fix `create-task.tsx`

- Remove client-generated `task-${Date.now()}` ID
- Use uppercase `'TODO'` status
- Add `TaskScheduler` component for sprint/date selection
- Persist via backend API (store already calls `taskApi.createTask()`)

### Step 5: Fix `intake.tsx` "Add to Backlog"

- Wire "Add to Backlog" button to `taskApi.createTask()` with AI-parsed fields
- Show success feedback and allow adding more

### Step 6: Mobile — Update Types & Hooks

- Update `Sprint` interface with commitment fields
- Add `useCommitSprint` mutation hook
- Update `SensAISettings` type with velocity/planning fields
- Add sprint commit to `sprintApi`

### Step 7: Build `<LifeWheelBalance>` Component

- Reusable ring/donut chart for task balance visualization
- Takes selected tasks, groups by `lifeWheelAreaId`
- Overlays against user's assessment scores
- Neglected areas in red/orange
- Compact (32px for floating bar) and full (200px for review step) variants
- Animated with `react-native-reanimated`

### Step 8: Rewrite `planning.tsx` — 4-Step Wizard

**Step 1 – Capacity**:
- Show `targetVelocity` from settings (default 56)
- Past sprint average from `useVelocityMetrics()`
- Adjustable slider for this sprint
- Mid-week: "X days remaining — recommended ~Y pts"

**Step 2 – Select Tasks** (3 tabs):
- **Backlog tab**: Multi-select checklist with Life Wheel + Eisenhower filters, inline quick-add row
- **Templates tab**: Browse & create from template (immediate creation, auto-selected)
- **Suggestions tab**: Life Wheel gap analysis, template suggestions for neglected areas, "Ask AI" button

**Step 3 – Review & Summary**:
- Tasks grouped by Life Wheel area
- Total points vs capacity bar
- Full-size Life Wheel balance radar
- Sprint goal input
- Overcommit/undercommit warnings

**Step 4 – Commit**:
- Calls batch commit endpoint
- Success animation
- Sprint auto-activates if applicable

**Persistent floating bar** in ALL steps:
- Running points total (e.g., "32 / 56 pts")
- Mini Life Wheel balance ring
- Task count
- "Review (N) →" button

### Step 9: Update `preferences.tsx`

- Add "Sprint Capacity" section with `targetVelocity` stepper (range 20–100, default 56)
- Persist `planningTime` to backend (currently UI-only)
- Trigger notification permission when user sets planning time

### Step 10: Update `calendar.tsx` — Empty Sprint Detection

- **No tasks + no commit**: Hero card — "Your sprint is empty — let's plan!"
- **Tasks exist but not committed**: Banner — "Sprint not committed. Review & commit?"
- **Committed but underloaded** (< 50% velocity): Nudge — "Sprint looks light — add more?"
- Mid-week wizard adapts capacity for remaining days

### Step 11: Install `expo-notifications`

- Register for push permissions contextually
- Schedule weekly Sunday planning reminder at configured time
- Schedule daily standup reminders
- Ceremony cards on calendar for Sundays

### Step 12: Wire Sunday Ceremony to Calendar

- Render `CeremonyCard` every Sunday at configured `planningTime`
- "Start Planning" if not done, "✓ Completed" if done
- Use existing ceremony hooks

---

## Key Files Modified

### Backend
| File | Change |
|------|--------|
| `V34__sprint_planning_settings.sql` | New migration |
| `SensAISettings.java` | +3 fields |
| `VelocityRecord.java` | +`committedAt` |
| `SensAISettingsDto.java` | +fields in read/update DTOs |
| `SensAIMapper.java` | +field mappings |
| `SprintController.java` | +commit endpoint |
| `SprintService.java` | +commit logic |
| `SmartInputRequest.java` | +PlanningContext |

### Mobile
| File | Change |
|------|--------|
| `planning.tsx` | Full rewrite — 4-step wizard with real data |
| `preferences.tsx` | +velocity setting, persist planning time |
| `create-task.tsx` | Fix backend persistence, add missing fields |
| `intake.tsx` | Wire "Add to Backlog" to API |
| `calendar.tsx` | +empty sprint detection, ceremony cards |
| `keys.ts` | +commit key |
| `useSprints.ts` | +useCommitSprint |
| `api.ts` | +commitSprint endpoint |
| `sensai.types.ts` | +settings fields |
| `models.ts` | +Sprint commitment fields |

### New Files
| File | Purpose |
|------|---------|
| `LifeWheelBalance.tsx` | Reusable balance visualization component |
| `SprintCommitRequest.java` | Request DTO for commit endpoint |
| `SprintCommitResponse.java` | Response DTO for commit endpoint |

---

## Testing Checklist

- [ ] V34 migration runs clean on fresh DB
- [ ] V34 migration runs clean on existing DB (GCP)
- [ ] Sprint commit endpoint creates velocity record
- [ ] Sprint auto-activates when start date ≤ today
- [ ] `create-task.tsx` persists to backend (no more local IDs)
- [ ] `intake.tsx` "Add to Backlog" creates real task
- [ ] Planning wizard loads real backlog tasks
- [ ] Template creation in wizard auto-selects task
- [ ] Quick-add in wizard creates and selects task
- [ ] Life Wheel balance updates live as tasks toggled
- [ ] Capacity bar persists across all wizard steps
- [ ] Review step shows accurate summary
- [ ] Commit calls batch endpoint successfully
- [ ] Empty sprint detection shows appropriate card
- [ ] Uncommitted sprint shows banner
- [ ] Notifications permission requested from preferences
- [ ] Sunday planning reminder fires at correct time
- [ ] Ceremony card appears on Sunday in calendar
