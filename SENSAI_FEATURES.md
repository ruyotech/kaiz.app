# SensAI - AI Scrum Master & Life Coach

> "Not a chatbot. A high-performance athletic coach for your life."

SensAI is an AI-powered Scrum Master and life coach that helps users manage their personal productivity through the lens of agile methodology and life balance. It's the 2nd icon in the bottom navigation bar.

---

## 🎯 Core Philosophy

### The Three Prime Directives
1. **Protect Capacity** - Prevent overcommitment and burnout
2. **Enforce Balance** - Ensure attention across all life dimensions
3. **Remove Friction** - Streamline task capture and execution

### Coach Personality
SensAI operates as a **high-performance athletic coach**, not a chatbot:
- Proactive interventions, not reactive responses
- Data-driven insights based on user's actual performance
- Configurable tone: Supportive, Direct, Encouraging, Challenging, or Celebratory

---

## 📱 Mobile Features

### Navigation Structure
```
/(tabs)/sensai/
├── index.tsx          # Main dashboard
├── standup.tsx        # Daily standup ceremony
├── planning.tsx       # Sprint planning ceremony
├── review.tsx         # Sprint review ceremony
├── retrospective.tsx  # Sprint retrospective
├── interventions.tsx  # Active coach alerts
├── lifewheel.tsx      # Life wheel balance view
├── velocity.tsx       # Velocity tracking
├── intake.tsx         # Universal quick capture
├── analytics.tsx      # Performance analytics
└── settings.tsx       # Coach preferences
```

### 1. Daily Standup (`/standup`)
Quick daily check-in to maintain momentum:
- **Mood tracking** - How are you feeling? (Great/Good/Okay/Struggling)
- **Energy level** - Current energy state
- **Blocker identification** - What's in your way?
- **Yesterday's wins** - Celebrate completions
- **Today's focus** - Top priorities
- **Streak tracking** - Consecutive standup days

### 2. Sprint Planning (`/planning`)
Multi-step ceremony for sprint commitment:
- **Step 1: Capacity** - Set available hours/points for the sprint
- **Step 2: Select** - Choose tasks from backlog
- **Step 3: Review** - AI analysis of selections
- **Step 4: Commit** - Finalize sprint backlog

**AI Features:**
- Overcommit warnings based on historical velocity
- Dimension balance suggestions
- Automatic capacity adjustment for calendar blocks

### 3. Sprint Review (`/review`)
End-of-sprint celebration and analysis:
- Completed vs. committed comparison
- Achievement highlights
- Demo/showcase of completed work
- Velocity impact visualization
- Success celebrations

### 4. Retrospective (`/retrospective`)
Three-step improvement cycle:
- **Collect** - What worked? What blocked? What to try?
- **Discuss** - AI-facilitated analysis
- **Actions** - Concrete improvement items

### 5. Interventions (`/interventions`)
Proactive coach alerts:

| Type | Description | Urgency |
|------|-------------|---------|
| `OVERCOMMIT` | Sprint capacity exceeded | High |
| `SPRINT_AT_RISK` | Completion rate falling | High |
| `DIMENSION_IMBALANCE` | Life area neglected | Medium |
| `FOCUS_TIME_LOW` | Deep work time insufficient | Medium |
| `BLOCKER_AGING` | Unresolved blockers | Medium |
| `VELOCITY_DECLINE` | Performance trending down | Low |
| `MILESTONE_ACHIEVED` | Celebration trigger | Positive |

**User Actions:**
- Acknowledge (accept advice)
- Override (proceed anyway with reason)
- Defer (snooze for later)
- Dismiss (not relevant)

### 6. Life Wheel (`/lifewheel`)
8-dimension balance tracking:

| ID | Dimension | Color | Icon |
|----|-----------|-------|------|
| `lw-1` | Health & Fitness | Red | heart-pulse |
| `lw-2` | Career & Work | Blue | briefcase |
| `lw-3` | Finance & Money | Green | currency-usd |
| `lw-4` | Personal Growth | Purple | brain |
| `lw-5` | Relationships & Family | Pink | account-heart |
| `lw-6` | Social Life | Orange | account-group |
| `lw-7` | Fun & Recreation | Cyan | gamepad-variant |
| `lw-8` | Environment & Home | Gray | home |

**Features:**
- Visual radar chart of current balance
- Neglect alerts (2+ sprints at zero)
- Recovery task suggestions per dimension
- Historical trend analysis

### 7. Universal Intake (`/intake`)
Quick capture from any source:
- **Text input** - Type naturally
- **Voice input** - Speak your task (coming soon)
- **Image capture** - Photo of notes/receipts
- **Screenshot** - Capture from other apps

**AI Processing:**
- Natural language parsing
- Auto-categorization (dimension, priority, points)
- Schedule suggestion with conflict detection
- Coach feedback on task fit

### 8. Velocity Tracking (`/velocity`)
Performance metrics dashboard:
- Current velocity (rolling 4-sprint average)
- Velocity trend (up/down/stable)
- Sprint-by-sprint history
- Personal best tracking
- Burndown visualization

### 9. Analytics (`/analytics`)
Tabbed analytics views:
- **Overview** - Key metrics at a glance
- **Velocity** - Detailed performance trends
- **Dimensions** - Life wheel over time
- **Patterns** - Behavioral insights

### 10. Settings (`/settings`)
Coach customization:
- **Tone** - Supportive / Direct / Challenging
- **Standup time** - Daily reminder schedule
- **Sprint length** - 7 or 14 days
- **Capacity limits** - Max daily points
- **Intervention thresholds** - Sensitivity levels
- **Dimension priorities** - Personal focus areas

---

## 🔧 Mobile Implementation

### State Management (Zustand Store)

```typescript
// store/sensaiStore.ts
interface SensAIState {
    // Core state
    isInitialized: boolean;
    loading: boolean;
    error: string | null;

    // Velocity & Capacity
    velocityMetrics: VelocityMetrics | null;
    currentSprintHealth: SprintHealth | null;

    // Daily Operations
    todayStandup: DailyStandup | null;
    recentStandups: DailyStandup[];

    // Interventions
    activeInterventions: Intervention[];
    interventionHistory: Intervention[];

    // Ceremonies
    upcomingCeremonies: SprintCeremony[];
    pastCeremonies: SprintCeremony[];

    // Life Wheel
    lifeWheelMetrics: LifeWheelMetrics | null;

    // Coach Messages
    coachMessages: CoachMessage[];
    unreadMessageCount: number;

    // Settings
    settings: SensAISettings | null;

    // Analytics
    analytics: SensAIAnalytics | null;
}
```

### Key Components

| Component | Purpose |
|-----------|---------|
| `CoachMessage` | Displays coach communications with tone styling |
| `InterventionCard` | Actionable alert cards |
| `SprintHealthCard` | At-a-glance sprint status |
| `VelocityCard` | Performance metrics display |
| `LifeWheelChart` | Radar chart visualization |
| `StandupCard` | Quick standup status/action |
| `CeremonyCard` | Ceremony scheduling/status |
| `QuickActionsBar` | Fast navigation shortcuts |

### API Integration

```typescript
// services/api.ts - sensaiApi
const sensaiApi = {
    // Velocity
    getVelocityMetrics: () => GET('/sensai/velocity'),
    getSprintHealth: (sprintId) => GET(`/sensai/sprint/${sprintId}/health`),
    
    // Standup
    getTodayStandup: () => GET('/sensai/standup/today'),
    completeStandup: (data) => POST('/sensai/standup/complete', data),
    skipStandup: (reason) => POST('/sensai/standup/skip', { reason }),
    
    // Interventions
    getActiveInterventions: () => GET('/sensai/interventions/active'),
    acknowledgeIntervention: (data) => POST('/sensai/interventions/acknowledge', data),
    
    // Ceremonies
    startCeremony: (type) => POST(`/sensai/ceremonies/${type}/start`),
    completeCeremony: (type, data) => POST(`/sensai/ceremonies/${type}/complete`, data),
    
    // Life Wheel
    getLifeWheelMetrics: () => GET('/sensai/lifewheel'),
    
    // Intake
    processIntake: (data) => POST('/sensai/intake/process', data),
    
    // Settings
    getSettings: () => GET('/sensai/settings'),
    updateSettings: (data) => PUT('/sensai/settings', data),
    
    // Analytics
    getAnalytics: (period) => GET(`/sensai/analytics?period=${period}`),
};
```

---

## ⚙️ Backend Implementation

### Package Structure

```
com.kaiz..sensai/
├── api/
│   └── SensAIController.java        # REST endpoints
├── application/
│   ├── SensAIService.java           # Business logic
│   ├── SensAIMapper.java            # DTO conversions
│   └── dto/
│       ├── SensAISettingsDto.java
│       ├── DailyStandupDto.java
│       ├── InterventionDto.java
│       ├── VelocityDto.java
│       ├── SprintCeremonyDto.java
│       ├── LifeWheelDto.java
│       └── IntakeDto.java
├── domain/
│   ├── DailyStandup.java
│   ├── Intervention.java
│   ├── InterventionType.java
│   ├── InterventionUrgency.java
│   ├── SprintCeremony.java
│   ├── CeremonyType.java
│   ├── CeremonyStatus.java
│   ├── VelocityRecord.java
│   ├── SensAISettings.java
│   └── CoachTone.java
└── infrastructure/
    ├── DailyStandupRepository.java
    ├── InterventionRepository.java
    ├── SprintCeremonyRepository.java
    ├── VelocityRecordRepository.java
    └── SensAISettingsRepository.java
```

### REST API Endpoints

#### Settings
```
GET  /api/v1/sensai/settings          - Get user settings
PUT  /api/v1/sensai/settings          - Update settings
```

#### Velocity
```
GET  /api/v1/sensai/velocity          - Get velocity metrics
GET  /api/v1/sensai/velocity/history  - Get velocity history
GET  /api/v1/sensai/sprint/{id}/health - Get sprint health
```

#### Standup
```
GET  /api/v1/sensai/standup/today     - Get today's standup
POST /api/v1/sensai/standup/complete  - Complete standup
POST /api/v1/sensai/standup/skip      - Skip standup
GET  /api/v1/sensai/standup/summary   - Get standup streak/summary
```

#### Interventions
```
GET  /api/v1/sensai/interventions/active     - Get active interventions
POST /api/v1/sensai/interventions/acknowledge - Acknowledge intervention
POST /api/v1/sensai/interventions/dismiss    - Dismiss intervention
GET  /api/v1/sensai/interventions/history    - Get intervention history
```

#### Ceremonies
```
POST /api/v1/sensai/ceremonies/{type}/start    - Start ceremony
POST /api/v1/sensai/ceremonies/{type}/complete - Complete ceremony
GET  /api/v1/sensai/ceremonies/upcoming        - Get upcoming ceremonies
GET  /api/v1/sensai/ceremonies/history         - Get past ceremonies
```

#### Life Wheel
```
GET  /api/v1/sensai/lifewheel          - Get current metrics
GET  /api/v1/sensai/lifewheel/history  - Get historical balance
GET  /api/v1/sensai/lifewheel/recovery - Get recovery suggestions
```

#### Intake
```
POST /api/v1/sensai/intake/process     - Process intake input
GET  /api/v1/sensai/intake/recent      - Get recent intakes
```

#### Analytics
```
GET  /api/v1/sensai/analytics          - Get analytics (period: week/month/quarter/year)
GET  /api/v1/sensai/analytics/patterns - Get detected patterns
```

### Domain Entities

#### DailyStandup
```java
@Entity
public class DailyStandup {
    private UUID id;
    private UUID userId;
    private LocalDate date;
    private String mood;           // great, good, okay, struggling
    private Integer energyLevel;   // 1-10
    private String blockers;       // JSON array
    private String notes;
    private String status;         // pending, completed, skipped
    private Instant completedAt;
}
```

#### Intervention
```java
@Entity
public class Intervention {
    private UUID id;
    private UUID userId;
    private InterventionType type;
    private InterventionUrgency urgency;
    private String title;
    private String message;
    private String dataContext;    // JSON with contextual data
    private Boolean acknowledged;
    private Instant acknowledgedAt;
    private Boolean overridden;
    private String overrideReason;
    private Instant expiresAt;
}
```

#### SprintCeremony
```java
@Entity
public class SprintCeremony {
    private UUID id;
    private UUID userId;
    private String sprintId;
    private CeremonyType type;     // PLANNING, STANDUP, REVIEW, RETROSPECTIVE
    private CeremonyStatus status; // SCHEDULED, IN_PROGRESS, COMPLETED, SKIPPED
    private Instant scheduledAt;
    private Instant startedAt;
    private Instant completedAt;
    private String outcomes;       // JSON
    private String actionItems;    // JSON
}
```

#### VelocityRecord
```java
@Entity
public class VelocityRecord {
    private UUID id;
    private UUID userId;
    private String sprintId;
    private Integer weekNumber;
    private Integer committedPoints;
    private Integer completedPoints;
    private BigDecimal completionRate;
    private LocalDate startDate;
    private LocalDate endDate;
}
```

#### SensAISettings
```java
@Entity
public class SensAISettings {
    private UUID id;
    private UUID userId;
    
    // Standup
    private Boolean standupEnabled;
    private String standupTime;        // "09:00"
    private String standupDays;        // JSON array [1,2,3,4,5]
    
    // Interventions
    private String interventionLevel;  // gentle, balanced, strict
    private BigDecimal overcommitBuffer;
    private Integer neglectThresholdWeeks;
    
    // Capacity
    private Integer standardHoursPerWeek;
    private Integer sprintLengthDays;
    
    // Coach
    private CoachTone coachTone;
    private String dimensionPriorities; // JSON
}
```

### Service Layer Highlights

```java
@Service
public class SensAIService {
    
    // Velocity Calculation
    public VelocityDto.VelocityMetrics calculateVelocity(UUID userId) {
        // Rolling 4-sprint average
        // Trend detection (up/down/stable)
        // Personal best tracking
    }
    
    // Intervention Detection (runs on task changes)
    public void checkAndCreateInterventions(UUID userId) {
        checkOvercommit(userId);
        checkDimensionBalance(userId);
        checkSprintHealth(userId);
        checkBlockerAging(userId);
        checkMilestones(userId);
    }
    
    // Life Wheel Analysis
    public LifeWheelDto.LifeWheelMetrics analyzeLifeWheel(UUID userId) {
        // Calculate points per dimension
        // Detect neglected areas (2+ sprints at 0)
        // Generate recovery suggestions
    }
    
    // AI Intake Processing
    public IntakeDto.IntakeResult processIntake(UUID userId, IntakeDto.ProcessIntakeRequest request) {
        // Parse natural language
        // Extract task details
        // Suggest dimension and schedule
        // Check for conflicts
    }
}
```

---

## 🗄️ Database Tables

```sql
-- Daily standups
CREATE TABLE sensai_daily_standups (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    date DATE NOT NULL,
    mood VARCHAR(20),
    energy_level INTEGER,
    blockers JSONB,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Interventions
CREATE TABLE sensai_interventions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    urgency VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data_context JSONB,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMPTZ,
    overridden BOOLEAN DEFAULT FALSE,
    override_reason TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sprint ceremonies
CREATE TABLE sensai_sprint_ceremonies (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    sprint_id VARCHAR(50) NOT NULL,
    type VARCHAR(30) NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled',
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    outcomes JSONB,
    action_items JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Velocity records
CREATE TABLE sensai_velocity_records (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    sprint_id VARCHAR(50) NOT NULL,
    week_number INTEGER NOT NULL,
    committed_points INTEGER DEFAULT 0,
    completed_points INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, sprint_id)
);

-- User settings
CREATE TABLE sensai_settings (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
    standup_enabled BOOLEAN DEFAULT TRUE,
    standup_time VARCHAR(5) DEFAULT '09:00',
    standup_days JSONB DEFAULT '[1,2,3,4,5]',
    intervention_level VARCHAR(20) DEFAULT 'balanced',
    overcommit_buffer DECIMAL(3,2) DEFAULT 1.15,
    neglect_threshold_weeks INTEGER DEFAULT 2,
    standard_hours_per_week INTEGER DEFAULT 40,
    sprint_length_days INTEGER DEFAULT 14,
    coach_tone VARCHAR(20) DEFAULT 'encouraging',
    dimension_priorities JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_standups_user_date ON sensai_daily_standups(user_id, date);
CREATE INDEX idx_interventions_user_active ON sensai_interventions(user_id, acknowledged, expires_at);
CREATE INDEX idx_ceremonies_user_sprint ON sensai_sprint_ceremonies(user_id, sprint_id);
CREATE INDEX idx_velocity_user ON sensai_velocity_records(user_id);
```

---

## 🚀 Future Enhancements

### Phase 2
- [ ] Voice input for standup and intake
- [ ] Calendar integration for automatic capacity adjustment
- [ ] Team SensAI for shared sprints
- [ ] Export retrospective insights

### Phase 3
- [ ] Machine learning for personalized intervention timing
- [ ] Integration with Knowledge Hub for contextual book suggestions
- [ ] Gamification: Coach badges and achievements
- [ ] Weekly/monthly AI-generated performance reports

### Phase 4
- [ ] Multi-user family/household mode
- [ ] Integration with health apps (sleep, exercise data)
- [ ] Predictive burnout detection
- [ ] Custom ceremony templates

---

## 📊 Metrics & Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Standup completion rate | >80% | Daily active users completing standups |
| Intervention acknowledgment | >70% | Users engaging with coach alerts |
| Velocity stability | ±10% | Week-over-week velocity variance |
| Dimension balance | >6/8 active | Dimensions with activity per sprint |
| User retention | >60% weekly | Users returning to SensAI weekly |

---

## 🔗 Related Documentation

- [Task Management](./EPIC_TASK_MANAGEMENT.md)
- [Challenge System](./CHALLENGE_SYSTEM_COMPLETE.md)
- [Command Center AI](./COMMAND_CENTER_AI.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)
