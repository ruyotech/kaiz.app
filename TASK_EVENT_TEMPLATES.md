# Plan: Task/Event Template System

Build a robust template system under Tasks (accessible via "...more" menu) enabling users to quickly create tasks/events from admin-created global templates or their own custom templates, with community-style ratings, Wheel of Life grouping, and AI-assisted task refinement.

---

## Phase 1: Backend (Java Spring Boot)

### 1.1 Database Schema
Create `task_event_templates` table with all model fields, plus junction tables for favorites and ratings.

### 1.2 Entity & Repository
- `TaskEventTemplate.java` — JPA entity
- `TaskEventTemplateRepository.java` — Spring Data JPA repository
- `TemplateRating.java` — User ratings entity
- `TemplateFavorite.java` — User favorites entity

### 1.3 Service Layer
- `TemplateService.java` — Business logic: CRUD, rating calculations, usage tracking, cloning

### 1.4 REST API Controller
- `TemplateController.java` with endpoints:
  - `GET /api/templates` — List all (filters: type, lifeWheelAreaId, creatorType, search)
  - `GET /api/templates/global` — System templates only
  - `GET /api/templates/user` — Current user's templates
  - `GET /api/templates/favorites` — User's favorited templates
  - `GET /api/templates/{id}` — Single template detail
  - `POST /api/templates` — Create user template
  - `PUT /api/templates/{id}` — Update user template
  - `DELETE /api/templates/{id}` — Delete user template
  - `POST /api/templates/{id}/clone` — Clone global → user template
  - `POST /api/templates/{id}/rate` — Rate template (1-5 stars)
  - `POST /api/templates/{id}/favorite` — Toggle favorite
  - `POST /api/templates/{id}/use` — Increment usage count & create task/event

### 1.5 Admin Endpoints (Web Panel)
- `POST /api/admin/templates` — Create global template
- `PUT /api/admin/templates/{id}` — Update global template
- `DELETE /api/admin/templates/{id}` — Delete global template

### 1.6 DTOs
- `TemplateRequestDto.java` — Create/update request
- `TemplateResponseDto.java` — API response
- `TemplateFilterDto.java` — Query filters

---

## Phase 2: Mobile Frontend (React Native/Expo)

### 2.1 Types
Define `TaskEventTemplate` type in `apps/mobile/types/models.ts` extending existing `TaskTemplate` (line 106) with: `type: 'task' | 'event'`, event fields (duration, location, isAllDay, attendees), recurrence options, `creatorType: 'system' | 'user'`, rating/usageCount, `tags: string[]`, icon/color, `suggestedSprint`, and `isFavorite`.

### 2.2 API Service
Add template endpoints to `apps/mobile/services/api.ts`:
- `templateApi.getAll(filters)`
- `templateApi.getGlobal()`
- `templateApi.getUserTemplates()`
- `templateApi.getFavorites()`
- `templateApi.create(template)`
- `templateApi.update(id, template)`
- `templateApi.delete(id)`
- `templateApi.clone(id)`
- `templateApi.rate(id, stars)`
- `templateApi.toggleFavorite(id)`
- `templateApi.useTemplate(id, options)`

### 2.3 Store
Create `templateStore.ts` in `apps/mobile/store/` following Zustand persist pattern (like `challengeStore.ts`) with: `globalTemplates[]`, `userTemplates[]`, `favorites[]`, CRUD actions, `rateTemplate()`, `toggleFavorite()`, `cloneFromGlobal()`, `createTaskFromTemplate()`, `createEventFromTemplate()`, filtered getters by Wheel of Life and tags.

### 2.4 Components
Build template components in `apps/mobile/components/templates/`:
- `TemplateCard.tsx` — Card with rating stars, Wheel of Life badge, favorite star, usage count (pattern from `ChallengeCard.tsx`)
- `TemplateList.tsx` — Scrollable list with search bar, Wheel of Life filter pills, favorites toggle
- `TemplateDetailModal.tsx` — Full template preview with "Create Task/Event" CTA
- `CreateFromTemplateSheet.tsx` — Bottom sheet for sprint selection (current/next/backlog), recurrence customization, AI refine option

### 2.5 Screen
Add Templates screen at `app/(tabs)/tasks/templates.tsx` accessible from tasks "...more" menu, using `TemplateList` with tab sections: "Global" | "My Templates" | "Favorites".

### 2.6 AI Refinement
Implement AI refinement in `CreateFromTemplateSheet` — Optional "✨ Refine with AI" button that sends task draft to SensAI API, returns improved title/description, user can accept/reject (pattern from command center AI).

### 2.7 i18n
Add i18n keys in `apps/mobile/i18n/locales/` (`en.json`, `ru.json`, `uz.json`) under `templates` namespace: title, filters, empty states, creation prompts, AI refinement labels.

---

## Recommended Creative Features

| Feature | Implementation |
|---------|----------------|
| **Template Variables** | Simple `{{placeholder}}` in title/description, prompt user to fill when creating (e.g., "Prepare for {{meeting_name}}") |
| **Usage Analytics** | Track `usageCount` per template, show "Most Used" badge on top 3 user templates |
| **Template Cloning** | "Use as Base" on global templates → clones to user templates for customization |
| **Quick Preview** | Long-press on template card shows preview tooltip without opening modal |

---

## Data Model

```typescript
interface TaskEventTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  type: 'task' | 'event';
  
  // Task defaults
  defaultStoryPoints: number;
  defaultLifeWheelAreaId: string;
  defaultEisenhowerQuadrantId: string;
  
  // Event defaults  
  defaultDuration: number | null; // minutes
  defaultLocation: string | null;
  isAllDay: boolean;
  defaultAttendees: string[];
  
  // Recurrence
  isRecurring: boolean;
  recurrencePattern: {
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
    interval: number;
    endDate: string | null;
  } | null;
  suggestedSprint: 'current' | 'next' | 'backlog';
  
  // Ownership
  creatorType: 'system' | 'user';
  userId: string | null; // null for system templates
  
  // Community metrics
  rating: number; // 0-5
  ratingCount: number;
  usageCount: number;
  
  // Organization
  lifeWheelAreaId: string;
  tags: string[]; // user custom tags
  isFavorite: boolean;
  
  createdAt: string;
  updatedAt: string;
}
```

---

## Open Questions

1. **Template Variables Complexity** — Simple string replacement (`{{name}}`) or skip for v1 and add later?

2. **Event Attendees** — Store as string[] of names or integrate with contacts/family members?

3. **Rating Scope** — Only global templates ratable, or users can rate their own templates for personal sorting?

---

## Existing Code References

- Task type: `apps/mobile/types/models.ts` (line 66-91)
- TaskTemplate type: `apps/mobile/types/models.ts` (line 106-114)
- ChallengeCard pattern: `apps/mobile/components/challenges/ChallengeCard.tsx`
- Zustand store pattern: `apps/mobile/store/challengeStore.ts`
- Rating UI: Community template star rendering
- EmptyState component: `apps/mobile/components/ui/EmptyState.tsx`
- i18n pattern: `apps/mobile/i18n/locales/en.json`
