# Family Plan Integration - Complete Implementation Prompt

## CRITICAL INSTRUCTION
For EVERY file mentioned below: FIRST check if the file/component/function already exists. If it exists, ENHANCE it to support family functionality. DO NOT create duplicates. DO NOT rewrite from scratch. Only ADD the family-specific fields, methods, and logic to existing code.

---

## Overview
Integrate family functionality across ALL existing apps in the Kaiz mobile application. The Family app becomes settings-only. All task/sprint/calendar/reporting features gain family awareness with role-based visibility.

**Key Principles:**
- EXTEND existing code, never duplicate
- Reusable `FamilyScopeSwitcher` component across all apps
- Backend follows existing package patterns (see task/, epic/, sprint/)
- Roles: owner, adult, teen, child
- Notifications: Assignee + parents for kids' tasks, assignee only for adults
- @mention in comments triggers notification to mentioned family member

---

## PHASE 1: Backend (Java/Spring Boot)

### 1.1 Create Family Package
Location: `apps/backend/src/main/java/app/kaiz/family/`

FOLLOW existing patterns from `task/`, `epic/`, `sprint/` packages.

**Create Entities:**
- `Family.java` - id, name, createdBy, createdAt, settings (JSON)
- `FamilyMember.java` - id, familyId, userId, role (enum: OWNER, ADULT, TEEN, CHILD), joinedAt, permissions (JSON)
- `FamilyInvite.java` - id, familyId, email, role, invitedBy, status (PENDING, ACCEPTED, DECLINED), expiresAt

**Create DTOs:**
- `FamilyDTO`, `FamilyMemberDTO`, `FamilyInviteDTO`
- `CreateFamilyRequest`, `InviteMemberRequest`, `UpdateMemberRoleRequest`

**Create Repositories:**
- `FamilyRepository`, `FamilyMemberRepository`, `FamilyInviteRepository`

**Create Service:**
- `FamilyService` - CRUD for family, member management, invite handling, permission checking

**Create Controllers:**
```
FamilyController - /api/v1/families
  POST /                    - Create family
  GET /me                   - Get current user's family
  GET /me/membership        - Get current user's membership
  GET /{id}                 - Get family details
  PUT /{id}                 - Update family settings
  DELETE /{id}              - Delete family (owner only)

FamilyMemberController - /api/v1/families/{familyId}/members
  GET /                     - List members
  POST /invite              - Send invite
  PUT /{memberId}/role      - Update member role
  DELETE /{memberId}        - Remove member
```

### 1.2 EXTEND Existing Entities

FIND existing `Task.java` entity and ADD fields:
- `familyId` (String, nullable) - null means personal task
- `visibility` (enum: PRIVATE, SHARED, ASSIGNED) - default PRIVATE
- `assignedToUserId` (String, nullable) - family member assignment
- `requiresApproval` (boolean) - for kids' tasks
- `approvedByUserId` (String, nullable)
- `approvedAt` (Timestamp, nullable)

FIND existing `Epic.java` entity and ADD fields:
- `familyId` (String, nullable)
- `visibility` (enum: PRIVATE, SHARED)

FIND existing `Sprint.java` entity and ADD fields:
- `familyId` (String, nullable) - null means personal sprint

### 1.3 EXTEND Existing Controllers

FIND existing `TaskController.java` and ADD query parameters:
- `familyId` (optional) - filter by family
- `viewScope` (optional, enum: MINE, FAMILY, CHILD_{userId})

ADD role-based filtering logic:
- MINE: user's own tasks only
- FAMILY: all tasks with visibility=SHARED or ASSIGNED within family
- CHILD_{id}: parent viewing specific child's tasks (all visibilities)
- Kids CANNOT use CHILD_{id} scope for other members

FIND existing `EpicController.java` and ADD same pattern.

FIND existing `SprintController.java` and ADD:
- `familyId` query param
- New endpoint: GET `/api/v1/sprints/family/{familyId}`

### 1.4 Permission Logic

ADD to existing service layer or create `FamilyPermissionService.java`:

```java
public boolean canViewTask(User user, Task task, FamilyMember membership) {
    if (task.getUserId().equals(user.getId())) return true;
    if (task.getFamilyId() == null) return false;
    if (task.getVisibility() == TaskVisibility.PRIVATE) {
        return isParentOf(membership, task.getUserId());
    }
    return task.getVisibility() == TaskVisibility.SHARED || 
           task.getAssignedToUserId().equals(user.getId());
}

public boolean canAssignTo(FamilyMember assigner, FamilyMember assignee) {
    if (assignee.getRole() == FamilyRole.CHILD || assignee.getRole() == FamilyRole.TEEN) {
        return assigner.getRole() == FamilyRole.OWNER || assigner.getRole() == FamilyRole.ADULT;
    }
    return true; // Adults can suggest to other adults
}
```

### 1.5 @Mention Notification - Backend

FIND existing notification service and EXTEND:
- Parse comment text for @mentions pattern: `@{memberName}` or `@{memberId}`
- When comment is created, extract mentions
- Create notification for each mentioned family member
- Notification includes: task reference, comment snippet, mentioner name

---

## PHASE 2: Mobile Foundation (React Native/TypeScript)

### 2.1 EXTEND Types

FIND `apps/mobile/types/index.ts` or `apps/mobile/types/task.ts` and ADD to existing Task interface:
```typescript
// ADD these fields to existing Task interface
familyId?: string;
visibility?: 'private' | 'shared' | 'assigned';
assignedToUserId?: string;
requiresApproval?: boolean;
approvedByUserId?: string;
approvedAt?: string;
```

FIND existing Epic interface and ADD:
```typescript
familyId?: string;
visibility?: 'private' | 'shared';
```

FIND existing Sprint interface and ADD:
```typescript
familyId?: string;
```

ADD new types (check if they exist in `apps/mobile/types/family.ts` first, extend if exists):
```typescript
type FamilyRole = 'owner' | 'adult' | 'teen' | 'child';
type ViewScope = 'mine' | 'family' | `child:${string}`;

interface Family {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  settings: FamilySettings;
}

interface FamilyMember {
  id: string;
  familyId: string;
  userId: string;
  user: User;
  role: FamilyRole;
  joinedAt: string;
}

interface FamilySettings {
  allowKidsToCreateTasks: boolean;
  requireApprovalForKidsTasks: boolean;
  sharedCalendarEnabled: boolean;
}
```

### 2.2 EXTEND API Service

FIND `apps/mobile/services/api.ts` and ADD familyApi section:
```typescript
export const familyApi = {
  createFamily: (data: CreateFamilyRequest) => api.post('/families', data),
  getFamily: (id: string) => api.get(`/families/${id}`),
  getMyFamily: () => api.get('/families/me'),
  getMyMembership: () => api.get('/families/me/membership'),
  updateFamily: (id: string, data: UpdateFamilyRequest) => api.put(`/families/${id}`, data),
  deleteFamily: (id: string) => api.delete(`/families/${id}`),
  getMembers: (familyId: string) => api.get(`/families/${familyId}/members`),
  inviteMember: (familyId: string, data: InviteMemberRequest) => api.post(`/families/${familyId}/members/invite`, data),
  updateMemberRole: (familyId: string, memberId: string, role: FamilyRole) => api.put(`/families/${familyId}/members/${memberId}/role`, { role }),
  removeMember: (familyId: string, memberId: string) => api.delete(`/families/${familyId}/members/${memberId}`),
};
```

FIND existing taskApi and EXTEND methods with viewScope parameter:
```typescript
getTasksBySprint: (sprintId: string, viewScope?: ViewScope) => 
  api.get(`/tasks/sprint/${sprintId}`, { params: { viewScope } }),
getTasksByEpic: (epicId: string, viewScope?: ViewScope) => 
  api.get(`/tasks/epic/${epicId}`, { params: { viewScope } }),
```

EXTEND createTask to accept family fields:
```typescript
createTask: (data: CreateTaskRequest & { familyId?: string; visibility?: string; assignedToUserId?: string }) =>
  api.post('/tasks', data),
```

APPLY same pattern to epicApi and sprintApi.

### 2.3 Create FamilyScopeSwitcher Component

Location: `apps/mobile/components/family/FamilyScopeSwitcher.tsx`

Create reusable component:
- Dropdown/segmented control showing: "My View" / "Family" / "{Kid's Name}" options
- Adults see kids as selectable options
- Kids see only "My View" and "Family"
- Props: `value: ViewScope`, `onChange: (scope: ViewScope) => void`, `variant?: 'compact' | 'full'`
- Use existing UI components from `apps/mobile/components/ui/`

### 2.4 EXTEND Stores

FIND existing `apps/mobile/store/familyStore.ts` and REFACTOR to settings-only (remove mock data, remove task/epic management):

Create or update `familySettingsStore.ts`:
```typescript
interface FamilySettingsState {
  family: Family | null;
  members: FamilyMember[];
  myMembership: FamilyMember | null;
  pendingInvites: FamilyInvite[];
  loading: boolean;
  fetchFamily: () => Promise<void>;
  fetchMembers: () => Promise<void>;
  inviteMember: (email: string, role: FamilyRole) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  updateSettings: (settings: Partial<FamilySettings>) => Promise<void>;
}
```

FIND existing `apps/mobile/store/taskStore.ts` and ADD:
```typescript
currentViewScope: ViewScope;
setViewScope: (scope: ViewScope) => void;
// Update fetchTasks to use viewScope parameter
```

EXTEND `epicStore.ts` and `sprintStore.ts` similarly with viewScope support.

### 2.5 @Mention in Comments - Mobile

FIND existing comment/task-comment components and EXTEND:
- Add @mention autocomplete when user types "@"
- Show family members dropdown filtered by typed text
- Insert mention as `@{memberName}` with stored `memberId`
- Highlight mentions in comment display with different styling
- Link mention to member profile (tappable)

When submitting comment, extract mentions and send to backend.

---

## PHASE 3: App-by-App Integration

### 3.1 SDLC (Sprint Board)

FIND `apps/mobile/app/(tabs)/sdlc/calendar.tsx` and ENHANCE:
- Add `FamilyScopeSwitcher` to header
- Filter tasks based on `currentViewScope` from store
- When creating task, show visibility picker if user has family plan
- When in family/child scope, show assignee badges on task cards
- Update task cards to show assigned member avatar

FIND `apps/mobile/app/(tabs)/sdlc/backlog.tsx` and APPLY same enhancements.

FIND `apps/mobile/app/(tabs)/sdlc/epics/` and APPLY same enhancements.

### 3.2 Templates

FIND `apps/mobile/components/templates/CreateFromTemplateSheet.tsx` and ENHANCE:
- If user has family plan, ADD:
  - Visibility picker (Private / Shared / Assigned)
  - If Assigned selected, show "Assign to" dropdown:
    - Adults see all family members
    - For kids: assignment is mandatory
    - For adults: shows as "Suggest to" (optional)
  - Approval toggle for kids' tasks (when adult assigns to kid)

### 3.3 SensAI

FIND `apps/mobile/components/sensai/` components and ENHANCE:
- Include family context in AI system prompt when user has family
- Add family-related quick actions:
  - "How are my kids doing this sprint?"
  - "Family progress summary"
  - "Suggest tasks for [kid's name]"
- AI responses should be aware of family structure and roles

### 3.4 Challenges

FIND `apps/mobile/components/challenges/` and ENHANCE:
- Add family challenges type
- Family members can create shared challenges
- Family members can compete on same challenge
- Add family leaderboard view
- Add `FamilyScopeSwitcher` to challenge list views

### 3.5 Command Center

FIND `apps/mobile/components/command-center/` and ENHANCE:
- Add `FamilyScopeSwitcher`
- Family scope shows:
  - Aggregated family metrics
  - All family members' upcoming tasks
  - Family velocity overview
  - Kids' tasks needing approval (for parents)

### 3.6 Essentia (Life Wheel)

FIND `apps/mobile/components/essentia/` and ENHANCE:
- Parents can view kids' life wheel (read-only toggle)
- Add `FamilyScopeSwitcher` for scope selection
- Optional: Family aggregate life wheel visualization

### 3.7 Pomodoro

FIND `apps/mobile/components/pomodoro/` and ENHANCE:
- Add shared focus sessions feature:
  - Start a "Family Focus" session
  - Family members can join active session
  - Show who's currently focusing
- Add "Focus Together" notification option

### 3.8 Calendar

FIND calendar components in SDLC and ENHANCE:
- Add `FamilyScopeSwitcher`
- MINE scope: personal events only
- FAMILY scope: all shared events + ceremonies
- CHILD scope: specific child's events (for parents)
- Color-code events by family member

### 3.9 Reporting

FIND reporting/analytics components and ENHANCE:
- Add `FamilyScopeSwitcher`
- Personal reports (keep existing)
- ADD Family reports:
  - Family velocity chart
  - Member comparison (opt-in)
  - Kids' progress reports for parents
  - Sprint completion by member

### 3.10 Ceremonies (Move to SDLC)

FIND `apps/mobile/components/family/FamilyCeremony.tsx` and related components.
MOVE ceremony functionality to `apps/mobile/components/sdlc/ceremonies/` or integrate into existing SDLC components.
- Family Standup: appears in SDLC when family scope selected
- Family Retrospective: sprint retro with family context
- Accessible via SDLC "more" menu when in family scope

---

## PHASE 4: Family App (Settings Only)

### 4.1 Refactor Family Routes

Location: `apps/mobile/app/(tabs)/family/`

KEEP only these routes:
- `index.tsx` - Family dashboard (member list, quick settings, join/create family)
- `members.tsx` - Member management
- `settings.tsx` - Family settings
- `invites.tsx` - Pending invites

REMOVE these routes (functionality moved to SDLC):
- `shared-tasks.tsx` → SDLC with family scope
- `shared-calendar.tsx` → SDLC Calendar with family scope
- `family-standup.tsx` → SDLC Ceremonies

### 4.2 Family Settings Screen

ENSURE settings screen includes:
- Family name & profile editing
- Member management (invite, remove, change roles)
- Permission settings:
  - Kids can create tasks: yes/no
  - Require approval for kids' tasks: yes/no
  - Shared calendar enabled: yes/no
- Notification preferences (integrates with main notification settings):
  - Notify on kids' task completion
  - Notify on family task assignment
  - Notify on @mention in family tasks
  - Daily family summary
- Danger zone: Leave family / Delete family

### 4.3 Update Navigation Config

FIND `apps/mobile/components/navigation/config.ts` and UPDATE family "more" menu:
```typescript
family: [
  { nameKey: 'members', route: '/(tabs)/family/members', icon: 'users' },
  { nameKey: 'settings', route: '/(tabs)/family/settings', icon: 'settings' },
  { nameKey: 'invites', route: '/(tabs)/family/invites', icon: 'mail' },
],
```
REMOVE any task/epic/calendar menu items from family section.

---

## PHASE 5: Notifications

### 5.1 Notification Rules

FIND existing notification service/handler and ADD these rules:
- Task assigned to kid → Notify kid + all adults
- Task assigned to adult → Notify assignee only (suggestive)
- Kid completes task → Notify all adults
- Adult completes shared task → Notify assignee only
- Task needs approval → Notify all adults
- Family ceremony starting → Notify all members
- @mention in comment → Notify mentioned member specifically

### 5.2 Backend Notification Updates

EXTEND existing notification service with family-aware logic.
ADD notification types: FAMILY_TASK_ASSIGNED, FAMILY_TASK_COMPLETED, FAMILY_APPROVAL_NEEDED, FAMILY_MENTION

### 5.3 Mobile Notification Handling

EXTEND existing notification handling to process new family notification types.
Navigate to appropriate task/family view when notification tapped.

---

## PHASE 6: Offline Sync

FOLLOW existing offline sync patterns in the codebase:
- Family data syncs based on user's role visibility
- Adults sync: all family data + kids' data
- Kids sync: own data + family shared data
- Use same conflict resolution strategy as existing task sync
- EXTEND existing sync logic, do not create separate family sync

---

## Migration Notes

1. DEPRECATE `SharedTask`, `SharedEpic` types from `apps/mobile/types/family.ts` - use extended `Task`, `Epic` instead
2. REMOVE mock data generators from familyStore
3. KEEP `FamilyMember`, `FamilyKudos`, `FamilyCeremony` types as they're still needed
4. Clean migration approach - existing family data is mock, no data migration needed

---

## Testing Checklist

After implementation, verify:
- [ ] Adult can see family view with shared tasks
- [ ] Adult can see specific kid's all tasks
- [ ] Kid can only see own + family shared tasks
- [ ] Kid cannot see other members' private tasks
- [ ] Kid cannot use child:{id} scope for other members
- [ ] Task assignment works with role restrictions
- [ ] @mention in comment triggers notification to mentioned member
- [ ] Notifications follow scope rules (kids get adults notified, adults get only assignee)
- [ ] All apps respect FamilyScopeSwitcher selection
- [ ] Family app only shows settings, no task/calendar duplication
- [ ] Ceremonies accessible from SDLC when in family scope
- [ ] Family settings CRUD works via real API
- [ ] Offline sync respects visibility rules
