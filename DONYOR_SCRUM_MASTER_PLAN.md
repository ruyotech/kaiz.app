# Donyor AI Scrum Master — Implementation Plan

> **Master plan for rebuilding the Command Center into a unified AI scrum master chat experience.**
> Internal packages stay `app.kaiz.*`, DB tables stay `sensai_*` — only user-facing UI rebrands.
> Sessions persist to PostgreSQL. Streaming uses `SseEmitter` on backend; mobile uses `react-native-sse`.
> Voice transcription via **Deepgram** (best accuracy for short mobile recordings, streaming-capable, supports AAC/M4A from expo-audio).

---

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Rebranding scope | UI-only (no Java package rename) | Avoids risky mass-rename across Flyway + every Java import |
| SSE on mobile | `react-native-sse` | `ReadableStream` not supported on Hermes; existing `useStreamingChat.ts` is broken/unused |
| Backend streaming | `SseEmitter` + virtual threads | Already proven in codebase, no WebFlux dependency needed |
| Voice transcription | Deepgram `/v1/listen` REST API | Best accuracy for short clips, supports AAC/M4A natively, streaming-capable |
| Session persistence | PostgreSQL (not Redis) | Sufficient for single-instance Cloud Run; Redis can be added later |
| SSE POST support | Two-step flow if needed | POST message → GET SSE stream by conversation ID (fallback if `react-native-sse` can't POST) |

---

## Phase 1 — Mobile UI: Chat Screen Rebuild (Week 1)

### 1.1 Install `react-native-sse`
- Add to `apps/mobile/package.json`
- Native `EventSource` for Hermes/React Native

### 1.2 Create `store/commandCenterStore.ts`
- Zustand store: `messages`, `activeSessionId`, `currentMode`, `ceremonyContext`, `isStreaming`, `draftQueue`, `error`
- Replaces scattered `useState` in 915-line `index.tsx` and 696-line `chat.tsx`

### 1.3 Consolidate types into single `types/commandCenter.ts`
- Merge `commandCenter.types.ts` (286 lines) + `commandCenter.ts` (357 lines)
- Unify `DraftType` (UPPERCASE only), `ChatMessage`, draft content schemas
- Add: `ChatMode`, `SSEChunk`, `CeremonyContext`
- Delete old `commandCenter.types.ts`

### 1.4 Rebrand `types/sensai.types.ts`
- `SensAISettings` → `CoachSettings`
- `SensAIConversation` → `CoachConversation`
- `SensAIAnalytics` → `CoachAnalytics`
- Remove all "SensAI" string references
- Keep type shapes identical (backend contract unchanged)

### 1.5 Rewrite `app/(tabs)/command-center/index.tsx`
- Replace 915-line monolith with ~300-line screen
- Compose: `CeremonyBanner` + `FlashList` messages + `ChatInputBar`
- Read/write from `commandCenterStore`
- Connect via `useCommandCenter` hook
- Delete `chat.tsx` (redundant duplicate)

### 1.6 Update `app/(tabs)/command-center/_layout.tsx`
- Remove `create-from-sensai` route
- Rename stack titles: "SensAI" → "Scrum Master"
- Keep: `pending`, `pending-task`, `draft-detail`

### 1.7 Update `CustomTabBar.tsx`
- Rename "SensAI" labels/icons → "Coach"
- Remove duplicate AI input pipeline (camera/gallery/voice → smartInput)
- Keep "Create" button routing to command-center

### 1.8 Delete `useStreamingChat.ts`
- Unused, relies on broken `ReadableStream` assumption
- Replaced by `useCommandCenter` hook using `react-native-sse`

---

## Phase 2 — Mobile UI: Chat Components (Week 1–2)

### 2.1 `ChatMessageBubble.tsx`
- Replace 661-line `ChatMessage.tsx`
- Split: `UserBubble` (right), `CoachBubble` (left, coach avatar), `SystemMessage` (center)
- `React.memo` wrapped; all colors from `theme.ts`

### 2.2 `DraftApprovalCard.tsx`
- Inline card in coach bubbles for `draft` SSE chunks
- Draft type icon + title + key fields (points, area, quadrant) + confidence badge
- Three actions: ✅ Approve, ✏️ Edit (→ draft-detail), ❌ Reject

### 2.3 `StreamingTextRenderer.tsx`
- Renders SSE text tokens with typing animation via `react-native-reanimated`
- Appends tokens incrementally; basic markdown formatting

### 2.4 `CeremonyBanner.tsx`
- Top banner for active ceremony (Planning / Standup / Retro)
- Sprint ID, progress indicator, dismiss button
- Reads mode from `commandCenterStore`

### 2.5 `SprintProgressBar.tsx`
- Compact `completedPoints/committedPoints` bar
- Percentage + sprint day indicator

### 2.6 `LifeWheelMiniChart.tsx`
- Small radar chart (8 axes) for life wheel scores
- Inline during planning/retro; animated with `react-native-reanimated`

### 2.7 `VoiceRecordButton.tsx`
- Hold-to-record using `expo-audio` (SDK 54)
- Waveform visualization; sends audio as multipart

### 2.8 `ImagePickerButton.tsx`
- Camera + gallery via `expo-image-picker`
- Preview thumbnail; sends as multipart

### 2.9 `ChatInputBar.tsx`
- Composite bar: text + `VoiceRecordButton` + `ImagePickerButton` + send
- Manages local input state; calls `useCommandCenter.send()`

### 2.10 Refactor `draft-detail.tsx`
- Split 1344-line file into: `TaskDraftForm`, `EventDraftForm`, `EpicDraftForm`, `ChallengeDraftForm`
- Remove "SensAI" references; use consolidated types; screen <400 lines

---

## Phase 3 — Mobile UI: Hooks & API Layer (Week 2)

### 3.1 `hooks/useCommandCenter.ts`
- Uses `react-native-sse` EventSource
- Parses SSE events (text, draft, action, done, error)
- Dispatches to `commandCenterStore`
- Exposes: `send()`, `approveDraft()`, `modifyDraft()`, `rejectDraft()`, `disconnect()`

### 3.2 `hooks/useCeremonyMode.ts`
- Client-side mode suggestion: Sunday→PLANNING, Mon–Fri AM→STANDUP, Saturday→RETRO, else→FREEFORM
- Server authoritative, client pre-renders banner

### 3.3 Rewrite `commandCenterApi` in `api.ts`
- New: `chat()`, `getConversation()`, `getActiveCeremony()`, `approveDraft()`, `modifyDraft()`, `rejectDraft()`, `getPendingDrafts()`
- Keep old endpoints temporarily

### 3.4 Rename `sensaiApi` → `coachApi` in `api.ts`
- Update 30+ method names removing "sensai" prefix
- Endpoint paths unchanged (backend not yet changed)

### 3.5 Rewrite `hooks/queries/useCommandCenter.ts`
- Update query keys to new API shape
- Add `useActiveCeremony`, `useConversationHistory(sessionId)`

### 3.6 Rename sensai hooks in `useSprintCeremonies.ts`
- "sensai" key factories → "coach" in `keys.ts`
- Update all 20 queries + 8 mutations

### 3.7 Update `hooks/queries/index.ts` barrel export

---

## Phase 4 — Web Admin: AI Management Pages ✅ COMPLETE

### 4.1 Types rebrand ✅
- `SENSAI_CHAT` → `COACH_CHAT` in `types/command-center.ts`
- Added `SMART_INPUT` to promptCategory union

### 4.2 `/admin/ai/providers/page.tsx` ✅
- Full CRUD for LlmProvider with create modal + inline edit
- Toggle active, set default, delete with confirmation
- Model, temperature, max tokens, rate limit controls

### 4.3 `/admin/ai/prompts/page.tsx` ✅
- CRUD for SystemPrompt with category filter buttons
- Categories: COACH_CHAT, SMART_INPUT, COMMAND_CENTER, TASK_CREATION, etc.
- Create/edit modal with full-size textarea for prompt content

### 4.4 `/admin/ai/config/page.tsx` ✅
- Combined Settings + Feature Flags with internal tab switcher
- Type-specific inputs (BOOLEAN toggle, NUMBER input, TEXT/SECRET fields)
- Feature flag toggles with rollout percentage bars

### 4.5 `/admin/ai/testing/page.tsx` ✅
- Drag-and-drop file upload zone
- Attachment grid with type icons (IMAGE/AUDIO/FILE)
- Download and delete actions, use cases info box

### 4.6 Admin layout updated ✅
- Added expandable "AI Management" sidebar section (Brain icon) with 4 children
- Kept legacy "Command Center" link → redirects to `/admin/ai/providers`
- Imported Brain, FlaskConical, Flag icons

### 4.7 Old page replaced ✅
- `command-center/page.tsx` → redirect to `/admin/ai/providers`
- `/admin/ai/page.tsx` → redirect to `/admin/ai/providers`

---

## Phase 5 — Backend: Service Refactoring + Orchestration (Week 3–4)

### 5.1 Split `SensAIService.java` (1118 lines)
→ `StandupService` (~150), `InterventionService` (~200), `VelocityService` (~150), `CeremonyService` (~150), `LifeWheelMetricService` (~100), `SensAIFacade` (~100)

### 5.2 `ModeDetector.java`
- explicit override > active ceremony > day/time heuristic > input keywords > FREEFORM

### 5.3 `IntentClassifier.java`
- Keyword/regex patterns (not separate LLM call)

### 5.4 `ContextAssembler.java`
- Per-mode builder: `assembleCapture()`, `assemblePlanning()`, `assembleStandup()`, `assembleRetro()`, `assembleFreeform()`

### 5.5 `PromptAssembler.java`
- Loads via `SystemPromptService`; composes layers; replaces `{{variable}}` placeholders

### 5.6 `DraftExtractor.java`
- Parses `>>>DRAFT...<<<DRAFT` blocks; delegates to `AIResponseParser`

### 5.7 `ConversationManager.java`
- Persists sessions + messages; enforces rules (one planning/Sunday, one standup/day, 20-msg freeform window)

### 5.8 `InputNormalizer.java`
- Text passthrough; voice → Deepgram; image → Claude vision

### 5.9 `CommandCenterOrchestrator.java`
- Pipeline: InputNormalizer → ModeDetector → ContextAssembler → PromptAssembler → LLM → DraftExtractor → SSE

### 5.10 `LlmGateway.java`
- Retry (3×), circuit breaker, token counting, cost tracking

---

## Phase 6 — Backend: Entities, Migrations & Endpoints (Week 4–5)

### Flyway Migrations (V49–V53)
| Migration | Content |
|-----------|---------|
| V49 | `conversation_sessions` table |
| V50 | `conversation_messages` table |
| V51 | `draft_feedback_records` table |
| V52 | `user_coach_preferences` table |
| V53 | Seed 11 system prompts |

### New JPA Entities
- `ConversationSession`, `ConversationMessage`, `DraftFeedbackRecord`, `UserCoachPreference`
- All extend `BaseEntity`, LAZY fetch, `@Enumerated(STRING)`

### New Repositories
- `ConversationSessionRepository`, `ConversationMessageRepository`, `DraftFeedbackRecordRepository`, `UserCoachPreferenceRepository`

### Deepgram Integration
- Add dependency to `pom.xml`; API key via env var `DEEPGRAM_API_KEY`

### New Endpoints
- `POST /api/v1/command-center/chat` (multipart + `SseEmitter`)
- `GET /api/v1/command-center/conversations/{id}`
- `GET /api/v1/command-center/active-ceremony`

---

## Phase 7 — Backend: Interventions & Ceremony Lifecycle (Week 5–6)

### Intervention Triggers
| Trigger | Condition |
|---------|-----------|
| `SprintAtRiskTrigger` | Completion pace behind >20% |
| `OvercommitTrigger` | Points > velocity × 1.15 |
| `DimensionImbalanceTrigger` | Area with 0 tasks for 2+ sprints |
| `BlockerAlertTrigger` | Task blocked >3 days |
| `VelocityDropTrigger` | Velocity dropped >25% vs 4-sprint avg |
| `BurnoutWarningTrigger` | Sustained overcommit + low mood |
| `CelebrationTrigger` | Streaks, milestones, 100% sprint |

### Ceremony Wiring
- `startCeremony()` → creates `ConversationSession` linked to `SprintCeremony`
- `completeCeremony()` → persists action items
- Planning commit → updates `Sprint` + `Task` statuses
- Standup → creates/updates `DailyStandup` from conversation

---

## Phase 8 — Backend: Feedback Loop & Admin APIs (Week 6–7)

### Feedback Collection
- `DraftFeedbackCollector` — captures approve/modify/reject signals
- `UserPreferenceLearner` — detects recurring corrections (≥3 occurrences → inject into `{{userCorrectionPatterns}}`)
- `RuleEvolutionService` — weekly aggregation for admin dashboard

### Admin Controllers
- `AdminPromptController` — version management, A/B testing, rollback
- `AdminAiFeedbackController` — dashboard data endpoints
- `AdminAiConfigController` — global AI settings CRUD

### Admin Services
- `PromptVersioningService` — version increment, activation, A/B split, rollback
- `AiFeedbackDashboardService` — aggregation across feedback + sessions + interventions

---

## System Prompts to Seed (V53)

| Key | Category | Purpose |
|-----|----------|---------|
| `coach_base_persona` | COMMAND_CENTER | Base personality, agile rules, tone |
| `coach_mode_capture` | SMART_INPUT | Quick capture mode |
| `coach_mode_planning` | COMMAND_CENTER | Sprint planning ceremony |
| `coach_mode_standup` | COMMAND_CENTER | Daily standup ceremony |
| `coach_mode_retro` | COMMAND_CENTER | Sprint retrospective ceremony |
| `coach_mode_freeform` | COMMAND_CENTER | General coaching chat |
| `coach_categorization` | SMART_INPUT | Life wheel + Eisenhower + story point rules |
| `coach_draft_rules` | DRAFT_GENERATION | Draft output format specification |
| `coach_image_extract` | IMAGE_ANALYSIS | Image analysis + item extraction |
| `coach_voice_process` | VOICE_TRANSCRIPTION | Voice transcription processing |
| `coach_interventions` | COMMAND_CENTER | Intervention messaging templates |

---

## Testing Strategy

### Prompt Testing
- 10 sample inputs per prompt covering edge cases
- Categorization accuracy, multi-item splitting, confidence calibration
- Tone variations across SUPPORTIVE/DIRECT/CHALLENGING
- Ceremony flow completeness

### Integration Testing
- Full capture flow: input → mode → context → prompt → LLM → draft → approval → entity
- Full standup/planning/retro ceremony flows
- SSE streaming: chunk ordering, done event, error handling

### Load Testing
- Concurrent users on chat endpoint
- Context assembly query performance
- LLM rate limit handling

---

## File Inventory — What Changes

### New Files
| File | Type |
|------|------|
| `store/commandCenterStore.ts` | Zustand store |
| `components/command-center/ChatMessageBubble.tsx` | Component |
| `components/command-center/DraftApprovalCard.tsx` | Component |
| `components/command-center/StreamingTextRenderer.tsx` | Component |
| `components/command-center/CeremonyBanner.tsx` | Component |
| `components/command-center/SprintProgressBar.tsx` | Component |
| `components/command-center/LifeWheelMiniChart.tsx` | Component |
| `components/command-center/VoiceRecordButton.tsx` | Component |
| `components/command-center/ImagePickerButton.tsx` | Component |
| `components/command-center/ChatInputBar.tsx` | Component |
| `hooks/useCommandCenter.ts` | Hook |
| `hooks/useCeremonyMode.ts` | Hook |

### Modified Files
| File | Change |
|------|--------|
| `types/commandCenter.ts` | Consolidated from 2 files |
| `types/sensai.types.ts` | Rebranded SensAI → Coach |
| `app/(tabs)/command-center/index.tsx` | Full rewrite |
| `app/(tabs)/command-center/_layout.tsx` | Remove sensai route, rename |
| `app/(tabs)/command-center/draft-detail.tsx` | Split into sub-components |
| `components/navigation/CustomTabBar.tsx` | Remove SensAI, remove duplicate AI input |
| `hooks/queries/keys.ts` | Rename sensai keys → coach |
| `hooks/queries/useCommandCenter.ts` | Rewrite to new API |
| `hooks/queries/useSprintCeremonies.ts` | Rename sensai → coach |
| `hooks/queries/index.ts` | Update exports |
| `services/api.ts` | Rename sensaiApi → coachApi, new commandCenterApi |
| `constants/theme.ts` | Rename `sensai` → `coach` in moduleColors |

### Deleted Files
| File | Reason |
|------|--------|
| `types/commandCenter.types.ts` | Merged into `commandCenter.ts` |
| `app/(tabs)/command-center/chat.tsx` | Redundant duplicate |
| `hooks/useStreamingChat.ts` | Broken, unused |
| `app/(tabs)/command-center/create-from-sensai.tsx` | SensAI reference removed |
