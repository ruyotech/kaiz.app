# Kaiz LifeOS - Agile Personal Growth Enhancement TODO

> Brainstormed: January 30, 2026  
> Sprint: Weekly (Sunday–Saturday, non-negotiable)

---

## 1. 🎯 Agile Ceremonies Enhancement

### Daily Standup (DSU)
- [ ] Add streak tracking for consecutive standups
- [ ] Implement mood emoji picker
- [ ] Add voice input option for quick capture
- [ ] Create "Quick Standup" (30-sec) vs "Deep Standup" (5-min) modes
- [ ] Add ceremony countdown timer on home dashboard

### Sprint Planning (Sunday)
- [ ] Drag-drop capacity bar visualization
- [ ] Life wheel dimension color distribution picker
- [ ] "Story poker" for personal point estimation
- [ ] Show overcommit/undercommit warnings inline

### Sprint Review (Saturday)
- [ ] Confetti animation for completed sprints
- [ ] Velocity graph animation
- [ ] "Sprint MVP Task" highlight
- [ ] Completion rate celebration tiers

### Retrospective (Post-Review)
- [ ] Swipeable cards for Keep/Stop/Try
- [ ] AI-generated insight bubbles from SensAI
- [ ] Exportable PDF summary
- [ ] Action items → auto-create tasks for next sprint

### General Ceremony UX
- [ ] Full-screen "Ceremony Mode" with calming backgrounds
- [ ] Reminder cards on home with countdown timers
- [ ] Skip/defer ceremony with reason capture

---

## 2. 📊 Sprint Velocity & Warnings

### Velocity Calculation
- [ ] Base formula: `(weeklyCommitmentHours × 0.7)` = recommended SP
- [ ] Default: 1 SP = 1 hour (user configurable after 2 sprints)
- [ ] Rolling 4-sprint average for baseline
- [ ] Adjust capacity based on synced calendar blocked time

### SensAI Warning System
- [ ] `OVERCOMMIT`: Planned > 1.5× rolling average
- [ ] `UNDERCOMMIT`: Planned < 0.5× rolling average  
- [ ] `VELOCITY_DECLINE`: Dropping 3+ consecutive sprints
- [ ] `DIMENSION_IMBALANCE`: Life wheel area = 0 for 2+ sprints
- [ ] Show warnings during sprint planning ceremony
- [ ] Push notification for critical interventions

### Velocity UI
- [ ] Recommended range indicator in planning screen
- [ ] "SensAI says..." tooltip with personalized advice
- [ ] Historical velocity trend chart

---

## 3. 🎨 Progressive Agile Onboarding

### User Levels (Progressive Disclosure)
- [ ] **Seedling** (Week 1-2): Simple tasks, basic "How do you feel?" standup
- [ ] **Sprout** (Week 3-4): Introduce story points, weekly view, first retro
- [ ] **Growing** (Month 2+): Full ceremonies, velocity charts, dimension balancing
- [ ] **Thriving** (Month 3+): Advanced analytics, export features

### Onboarding Flow
- [ ] "Agile Coach Tour" - 5-screen interactive story
- [ ] Relatable personal examples (not corporate jargon)
- [ ] Skip option for experienced users
- [ ] Contextual tooltips that appear once per feature

---

## 4. 🗓️ Subscription & Sprint Period

### Subscription Tiers
- [ ] **Free**: 2 active sprints max, basic ceremonies
- [ ] **Pro Monthly**: Unlimited sprints, all ceremonies, analytics
- [ ] **Pro Annual**: + custom sprint names, advanced exports
- [ ] **Family**: + shared workspace, family ceremonies

### Sprint-Subscription Alignment
- [ ] Track sprint count within billing period (e.g., "Week 3 of 4")
- [ ] Grace period: Complete current sprint if subscription lapses
- [ ] Lock future planning when subscription expired

---

## 5. ⚙️ Subscription Settings Screen

### New Screen: `app/(tabs)/settings/subscription.tsx`
- [ ] Current plan display with tier badge
- [ ] Renewal/expiration date
- [ ] Sprint period indicator ("Week 5 of 52 in 2026")
- [ ] [Manage Plan] → App Store / Play Store
- [ ] [View Invoice History] (if applicable)
- [ ] [Family Members] section (for family plan)

### Quick Access
- [ ] Subscription badge on profile header
- [ ] "Upgrade" prompt for free users in locked features

---

## 6. 🎨 Calendar Color Coding

### Implementation in `CalendarDayView.tsx`
- [ ] **Gray** (`#9CA3AF`): Before user enrollment date
- [ ] **Red tint** (`#EF4444`): Past days (completed sprints, read-only)
- [ ] **Yellow/Gold** (`#FBBF24`): Current day (today's focus)
- [ ] **Green** (`#10B981`): Future days within subscription
- [ ] **Gray** (`#6B7280`): Future days beyond subscription ("Renew to unlock")

### Data Requirements
- [ ] Store `enrollmentDate` in user profile
- [ ] Fetch `subscriptionEndDate` from billing system
- [ ] Pass dates to calendar component for rendering

---

## 7. 📱 External Calendar Sync (Read-Only)

### New Screen: `app/(tabs)/settings/integrations.tsx`

### Supported Providers
- [ ] **Apple Calendar**: Use `expo-calendar` native API
- [ ] **Google Calendar**: OAuth2 with `Calendars.ReadOnly` scope
- [ ] **Microsoft Outlook**: OAuth2 with `Calendars.Read` scope

### Sync Features
- [ ] Select which calendars to import (work, personal, etc.)
- [ ] Display external events as "blocked time" (gray overlay)
- [ ] Auto-adjust `CapacityCalculation.availableHours`
- [ ] Sync frequency: Hourly background + manual "Sync Now"
- [ ] Clear privacy notice: "Read-only. We never write to your calendars."

### UI
- [ ] Connected accounts list with disconnect option
- [ ] Last sync timestamp
- [ ] Toggle: "Auto-adjust sprint capacity based on calendar"

---

## 8. 🔐 Data Encryption & Security

### Local (Device)
- [ ] Use `expo-secure-store` for sensitive credentials
- [ ] Implement SQLCipher for local SQLite encryption
- [ ] User-derived encryption key (device-bound)

### In Transit
- [ ] TLS 1.3 for all API calls
- [ ] Certificate pinning to prevent MITM attacks

### At Rest (Server)
- [ ] AES-256 encryption for PII fields in PostgreSQL
- [ ] Encrypt: email, full name, notes content, standup entries

### Authentication Enhancements
- [ ] Optional 2FA (TOTP authenticator app)
- [ ] App lock PIN (backup for biometrics)
- [ ] Auto-lock after X minutes of inactivity

### New Screen: `app/(tabs)/settings/security.tsx`
- [ ] Biometric unlock toggle (existing)
- [ ] App lock PIN setup
- [ ] 2FA enrollment
- [ ] Auto-lock timeout setting
- [ ] [Export My Data] (GDPR compliance)
- [ ] [Delete My Account] with confirmation

---

## 9. 👨‍👩‍👧‍👦 Family Membership

### New Store: `familyStore.ts`
```typescript
interface FamilyWorkspace {
  id: string;
  name: string;
  ownerId: string; // billing adult
  members: FamilyMember[];
  sharedEpics: string[];
  sharedTasks: string[];
  sprintSync: 'aligned'; // all Sunday starts
}

interface FamilyMember {
  userId: string;
  role: 'owner' | 'adult' | 'teen' | 'child';
  permissions: Permission[];
  joinedAt: string;
}
```

### New Screens: `app/(tabs)/family/`
- [ ] `index.tsx` - Family dashboard
- [ ] `members.tsx` - Manage members, invite codes
- [ ] `shared-tasks.tsx` - Family backlog
- [ ] `shared-calendar.tsx` - Combined family view
- [ ] `family-standup.tsx` - "How's everyone doing?" ceremony

### Task Visibility Modes
- [ ] **Private** (default): Only creator sees it
- [ ] **Shared**: All family members see it
- [ ] **Assigned**: Visible to assignee + adults only

### Family Features
- [ ] Shared epics (e.g., "Family Vacation", "Home Renovation")
- [ ] Family sprint planning ceremony (Sunday morning?)
- [ ] Combined velocity view (optional)
- [ ] Kudos/encouragement between members

---

## 10. 🎓 Child Account Independence Transition

### Trigger Conditions
- [ ] Manual trigger by parent (any time)
- [ ] Auto-prompt at age 18 (requires parent approval)

### Data Migration Rules
| Data Type | On Independence |
|-----------|-----------------|
| Personal tasks/epics | **Moves** to new account |
| Shared family tasks | **Copied** as read-only archive |
| Life wheel history | **Moves** (continuous journey) |
| Velocity metrics | **Reset** (new era baseline) |
| Family ceremonies | **Archived** as memories |

### Implementation
- [ ] Add `accountTransition` flow in `authStore.ts`
- [ ] Create migration API endpoint in backend
- [ ] "Independence Day" celebration screen 🎉
- [ ] Option: "Family Alumni" connection (view-only access)
- [ ] New user can start their own family workspace later

### UI Flow
```
Child Account (under family)
    ↓ [Trigger: Age 18 or parent approval]
Independence Wizard (data review + consent)
    ↓ [Confirm migration]
New Independent Account
    ↓ [Fresh velocity, new era]
"Welcome to your new chapter!" celebration
```

---

## 📋 Open Questions / Decisions Needed

1. **Velocity calibration**: Use `weeklyCommitmentHours` from onboarding, or let user calibrate after 2 sprints?
   - [ ] Decision: _______________

2. **Subscription grace period**: If lapses mid-sprint, complete current sprint or lock immediately?
   - [ ] Decision: _______________

3. **Family sprint alignment**: All members same Sunday–Saturday, or independent child sprints?
   - [ ] Decision: _______________

4. **Child independence age**: Auto-prompt at 18, or fully parent-controlled?
   - [ ] Decision: _______________

5. **Encryption key recovery**: Device-bound only, or optional recovery passphrase for Pro?
   - [ ] Decision: _______________

---

## 🏗️ Implementation Priority

### Phase 1 (MVP)
- [ ] Velocity warnings in sprint planning
- [ ] Calendar color coding
- [ ] Subscription settings screen
- [ ] Basic security enhancements

### Phase 2
- [ ] External calendar sync (Apple first)
- [ ] Progressive onboarding levels
- [ ] Enhanced ceremony UX

### Phase 3
- [ ] Family workspace
- [ ] Google/Microsoft calendar sync
- [ ] 2FA and advanced security

### Phase 4
- [ ] Child independence flow
- [ ] Family ceremonies
- [ ] Advanced analytics

---

*Last updated: January 30, 2026*
