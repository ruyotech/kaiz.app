/**
 * SensAI - AI Scrum Master & Life Coach Types
 * 
 * "Not a chatbot. A high-performance athletic coach for your life."
 */

import { LifeWheelDimensionTag } from './models';

// ============================================================================
// CORE ENUMS
// ============================================================================

export type InterventionType = 'alert' | 'warning' | 'nudge' | 'celebration';
export type InterventionUrgency = 'high' | 'medium' | 'low' | 'positive';
export type InterventionCategory = 'capacity' | 'balance' | 'execution' | 'motivation';

export type SprintCeremonyType = 'planning' | 'standup' | 'midcheck' | 'review' | 'retrospective';
export type StandupStatus = 'pending' | 'completed' | 'skipped';

export type CoachTone = 'direct' | 'encouraging' | 'supportive' | 'celebratory' | 'challenging';

export type IntakeType = 'voice' | 'text' | 'image' | 'screenshot' | 'email' | 'url';

// ============================================================================
// VELOCITY & CAPACITY
// ============================================================================

export interface VelocityMetrics {
    userId: string;
    currentVelocity: number;           // Average of last 4 sprints
    velocityHistory: SprintVelocity[];  // Historical data
    projectedCapacity: number;          // Adjusted for calendar
    overcommitBuffer: number;           // 1.0 = strict, 1.2 = 20% stretch
    personalBest: number;
    averageVelocity: number;
    averageCompleted: number;           // Average points completed per sprint
    currentSprintCompleted: number;     // Points completed in current sprint
    velocityTrend: 'up' | 'down' | 'stable';
    lastCalculatedAt: string;
}

export interface SprintVelocity {
    sprintId: string;
    weekNumber: number;
    committedPoints: number;
    completedPoints: number;
    completionRate: number;
    startDate: string;
    endDate: string;
}

export interface CapacityCalculation {
    baseVelocity: number;
    standardHours: number;              // Default 40
    availableHours: number;             // After calendar blocks
    adjustedCapacity: number;
    capacityRatio: number;              // availableHours / standardHours
    blockedHours: number;
    calendarEvents: CalendarBlock[];
}

export interface CalendarBlock {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    durationHours: number;
    type: 'meeting' | 'appointment' | 'travel' | 'event' | 'other';
}

// ============================================================================
// INTERVENTIONS
// ============================================================================

export interface Intervention {
    id: string;
    userId: string;
    type: InterventionType;
    urgency: InterventionUrgency;
    category: InterventionCategory;
    title: string;
    message: string;
    data: InterventionData;
    suggestedActions: SuggestedAction[];
    acknowledged: boolean;
    acknowledgedAt?: string;
    overridden: boolean;
    overrideReason?: string;
    createdAt: string;
    expiresAt?: string;
}

export type InterventionData = 
    | OvercommitData 
    | NeglectData 
    | ChurnData 
    | BlockerData 
    | SprintRiskData 
    | FocusTimeData
    | VelocityMilestoneData
    | BalanceData;

export interface OvercommitData {
    type: 'overcommit';
    plannedPoints: number;
    velocity: number;
    overcommitPercentage: number;
    pointsToRemove: number;
}

export interface NeglectData {
    type: 'neglect';
    dimension: LifeWheelDimensionTag;
    dimensionName: string;
    weeksNeglected: number;
    suggestedTask: string;
    suggestedPoints: number;
}

export interface ChurnData {
    type: 'churn';
    churnRate: number;
    tasksAdded: number;
    originalTasks: number;
}

export interface BlockerData {
    type: 'blocker';
    taskId: string;
    taskTitle: string;
    blockedDays: number;
    blockerDescription: string;
}

export interface SprintRiskData {
    type: 'sprint_risk';
    dayOfSprint: number;
    totalDays: number;
    completionPercentage: number;
    expectedPercentage: number;
    remainingPoints: number;
}

export interface FocusTimeData {
    type: 'focus_time';
    actualHours: number;
    targetHours: number;
    weekNumber: number;
}

export interface VelocityMilestoneData {
    type: 'velocity_milestone';
    newVelocity: number;
    previousBest: number;
    improvementPercentage: number;
}

export interface BalanceData {
    type: 'balance';
    dominantDimension: LifeWheelDimensionTag;
    dominantPercentage: number;
    neglectedDimensions: LifeWheelDimensionTag[];
}

export interface SuggestedAction {
    id: string;
    label: string;
    actionType: 'defer_tasks' | 'reduce_scope' | 'add_task' | 'convert_blocker' | 'schedule_focus' | 'acknowledge' | 'dismiss';
    data?: Record<string, any>;
}

// ============================================================================
// STANDUPS & CEREMONIES
// ============================================================================

export interface DailyStandup {
    id: string;
    userId: string;
    sprintId: string;
    date: string;
    status: StandupStatus;
    
    // Yesterday's completed
    completedYesterday: StandupTask[];
    
    // Today's focus
    focusToday: StandupTask[];
    
    // Blockers reported
    blockers: StandupBlocker[];
    
    // Sprint health at standup time
    sprintHealth: SprintHealth;
    
    // User input
    notes?: string;
    mood?: 'great' | 'good' | 'okay' | 'struggling';
    
    completedAt?: string;
    scheduledTime: string;
}

export interface StandupTask {
    taskId: string;
    title: string;
    points: number;
    status: string;
    priority: number;
}

export interface StandupBlocker {
    id: string;
    description: string;
    taskId?: string;
    convertedToTask: boolean;
    convertedTaskId?: string;
}

export interface SprintHealth {
    sprintId: string;
    dayOfSprint: number;
    totalDays: number;
    committedPoints: number;
    completedPoints: number;
    completionPercentage: number;
    expectedPercentage: number;
    healthStatus: 'on_track' | 'at_risk' | 'behind' | 'ahead';
    remainingPoints: number;
    burndownTrend: 'healthy' | 'concerning' | 'critical';
}

export interface SprintCeremony {
    id: string;
    userId: string;
    sprintId: string;
    type: SprintCeremonyType;
    scheduledFor: string;
    completedAt?: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'skipped';
    notes?: string;
    data?: CeremonyData;
}

export type CeremonyData = 
    | SprintPlanningData 
    | SprintReviewData 
    | RetrospectiveData;

export interface SprintPlanningData {
    type: 'planning';
    selectedTasks: string[];
    totalPoints: number;
    capacityUsed: number;
    lifeWheelDistribution: Record<LifeWheelDimensionTag, number>;
    overcommitWarningShown: boolean;
    finalCommitment: number;
}

export interface SprintReviewData {
    type: 'review';
    committedPoints: number;
    completedPoints: number;
    completionRate: number;
    shippedTasks: string[];
    incompleteTasks: string[];
    velocityBefore: number;
    velocityAfter: number;
    velocityChange: number;
}

export interface RetrospectiveData {
    type: 'retrospective';
    whatWorked: string[];
    whatBlocked: string[];
    keyLearnings: string[];
    actionItems: string[];
}

// ============================================================================
// LIFE WHEEL OVERSIGHT
// ============================================================================

export interface LifeWheelMetrics {
    userId: string;
    sprintId: string;
    dimensions: DimensionMetric[];
    balanceScore: number;              // 0-100
    neglectedDimensions: LifeWheelDimensionTag[];
    dominantDimensions: LifeWheelDimensionTag[];
    calculatedAt: string;
}

export interface DimensionMetric {
    dimension: LifeWheelDimensionTag;
    dimensionId: LifeWheelDimensionTag;  // Alias for dimension
    dimensionName: string;
    pointsThisSprint: number;
    pointsLast4Sprints: number;
    percentageOfTotal: number;
    currentScore: number;              // Score out of 10
    sprintsAtZero: number;
    trend: 'up' | 'down' | 'stable';
    isNeglected: boolean;
    suggestedRecoveryTask?: RecoveryTask;
}

export interface RecoveryTask {
    title: string;
    description: string;
    points: number;
    dimension: LifeWheelDimensionTag;
}

// Life Wheel Dimensions Definition
export interface LifeWheelDimension {
    id: LifeWheelDimensionTag;
    name: string;
    description: string;
    icon: string;
    color: string;
    recoveryTasks: RecoveryTask[];
}

export const LIFE_WHEEL_DIMENSIONS: LifeWheelDimension[] = [
    {
        id: 'lw-1',
        name: 'Health & Fitness',
        description: 'Physical fitness, nutrition, sleep, medical',
        icon: 'heart-pulse',
        color: '#EF4444',
        recoveryTasks: [
            { title: '20-minute walk', description: 'Minimum viable workout', points: 2, dimension: 'lw-1' },
            { title: 'Meal prep basics', description: 'Prepare healthy meals for 2 days', points: 3, dimension: 'lw-1' },
            { title: 'Sleep hygiene check', description: 'Review and improve sleep habits', points: 2, dimension: 'lw-1' },
        ]
    },
    {
        id: 'lw-2',
        name: 'Career & Work',
        description: 'Professional growth, job performance, business goals',
        icon: 'briefcase',
        color: '#3B82F6',
        recoveryTasks: [
            { title: 'Update resume', description: 'Refresh resume with recent accomplishments', points: 3, dimension: 'lw-2' },
            { title: 'Network outreach', description: 'Connect with 2 professional contacts', points: 2, dimension: 'lw-2' },
        ]
    },
    {
        id: 'lw-3',
        name: 'Finance & Money',
        description: 'Money management, investments, financial health',
        icon: 'currency-usd',
        color: '#10B981',
        recoveryTasks: [
            { title: 'Check account balances', description: 'Money review: Check all accounts', points: 2, dimension: 'lw-3' },
            { title: 'Budget review', description: 'Review spending against budget', points: 3, dimension: 'lw-3' },
        ]
    },
    {
        id: 'lw-4',
        name: 'Personal Growth',
        description: 'Learning, skills, self-improvement',
        icon: 'brain',
        color: '#8B5CF6',
        recoveryTasks: [
            { title: 'Read book summary', description: 'Learn: Read one book summary', points: 2, dimension: 'lw-4' },
            { title: 'Online course lesson', description: 'Complete one module of a course', points: 3, dimension: 'lw-4' },
        ]
    },
    {
        id: 'lw-5',
        name: 'Relationships & Family',
        description: 'Family, partner, close friends',
        icon: 'account-heart',
        color: '#EC4899',
        recoveryTasks: [
            { title: 'Plan date night', description: 'Quality time: Plan meaningful time together', points: 3, dimension: 'lw-5' },
            { title: 'Call parents', description: 'Check in with family', points: 2, dimension: 'lw-5' },
        ]
    },
    {
        id: 'lw-6',
        name: 'Social Life',
        description: 'Broader social connections, community',
        icon: 'account-group',
        color: '#F59E0B',
        recoveryTasks: [
            { title: 'Attend meetup', description: 'Join a social or professional event', points: 3, dimension: 'lw-6' },
            { title: 'Reconnect with friend', description: 'Reach out to someone you haven\'t talked to', points: 2, dimension: 'lw-6' },
        ]
    },
    {
        id: 'lw-7',
        name: 'Fun & Recreation',
        description: 'Hobbies, fun, relaxation',
        icon: 'gamepad-variant',
        color: '#06B6D4',
        recoveryTasks: [
            { title: 'Hobby time', description: 'Spend 1 hour on a personal hobby', points: 2, dimension: 'lw-7' },
            { title: 'Watch a movie', description: 'Relax with entertainment', points: 1, dimension: 'lw-7' },
        ]
    },
    {
        id: 'lw-8',
        name: 'Environment & Home',
        description: 'Home, workspace, physical surroundings',
        icon: 'home',
        color: '#64748B',
        recoveryTasks: [
            { title: 'Declutter one drawer', description: 'Quick win: Organize a small space', points: 1, dimension: 'lw-8' },
            { title: 'Deep clean one room', description: 'Thorough cleaning session', points: 3, dimension: 'lw-8' },
        ]
    },
];

// ============================================================================
// UNIVERSAL INTAKE
// ============================================================================

export interface IntakeRequest {
    type: IntakeType;
    content: string;                    // Text, URI, or transcription
    source?: string;                    // camera, gallery, microphone, etc.
    fileName?: string;
    metadata?: Record<string, any>;
}

export interface IntakeResult {
    id: string;
    type: IntakeType;
    success: boolean;
    detectedItems: DetectedItem[];
    suggestedActions: IntakeSuggestion[];
    rawContent?: string;
    processedAt: string;
    // AI-parsed task details
    parsedTask?: ParsedTask;
    suggestedDimension?: LifeWheelDimensionTag;
    suggestedSchedule?: ScheduleSuggestion;
    conflicts?: ScheduleConflict[];
    coachMessage?: string;
}

export interface ParsedTask {
    title: string;
    description?: string;
    estimatedPoints: number;
    priority?: 'high' | 'medium' | 'low';
    dueDate?: string;
    tags?: string[];
}

export interface ScheduleSuggestion {
    optimalTime?: string;
    reasoning?: string;
    alternativeTimes?: string[];
}

export interface ScheduleConflict {
    type: 'overlap' | 'capacity' | 'balance';
    message: string;
    severity: 'warning' | 'error';
}

export interface DetectedItem {
    id: string;
    type: 'task' | 'event' | 'reminder' | 'deadline' | 'contact' | 'shopping';
    title: string;
    description?: string;
    confidence: number;                 // 0-1
    extractedData: ExtractedData;
}

export interface ExtractedData {
    date?: string;
    time?: string;
    location?: string;
    amount?: number;
    currency?: string;
    people?: string[];
    priority?: 'high' | 'medium' | 'low';
    dimension?: LifeWheelDimensionTag;
}

export interface IntakeSuggestion {
    id: string;
    detectedItemId: string;
    actionType: 'create_task' | 'create_event' | 'add_to_shopping' | 'set_reminder';
    label: string;
    payload: Record<string, any>;
    selected: boolean;
}

// ============================================================================
// COACH MESSAGES & CONVERSATIONS
// ============================================================================

export interface CoachMessage {
    id: string;
    type: 'greeting' | 'standup' | 'intervention' | 'celebration' | 'tip' | 'summary';
    tone: CoachTone;
    title?: string;
    message: string;
    data?: Record<string, any>;
    actions?: CoachAction[];
    timestamp: string;
    read: boolean;
}

export interface CoachAction {
    id: string;
    label: string;
    actionType: string;
    primary?: boolean;
}

export interface ConversationScript {
    id: string;
    ceremonyType: SprintCeremonyType;
    steps: ConversationStep[];
}

export interface ConversationStep {
    id: string;
    order: number;
    type: 'message' | 'input' | 'selection' | 'confirmation';
    message: string;
    inputType?: 'text' | 'number' | 'multiselect' | 'confirm';
    options?: string[];
    validation?: string;
    nextStepId?: string;
}

// ============================================================================
// MOTIVATION & KNOWLEDGE HUB INTEGRATION
// ============================================================================

export interface MotivationTrigger {
    id: string;
    condition: TriggerCondition;
    contentType: 'quote' | 'challenge' | 'tip' | 'book_suggestion';
    content: string;
    actionLabel?: string;
    actionRoute?: string;
}

export type TriggerCondition = 
    | { type: 'sprint_failing'; threshold: number }
    | { type: 'dimension_neglected'; dimension: LifeWheelDimensionTag }
    | { type: 'velocity_streak'; minSprints: number }
    | { type: 'first_task_completed' }
    | { type: 'procrastination_detected' }
    | { type: 'pattern_detected'; pattern: string };

export interface KnowledgePrescription {
    id: string;
    patternType: 'high_churn' | 'overcommit' | 'low_focus' | 'imbalance';
    bookTitle: string;
    bookAuthor: string;
    reason: string;
    points: number;
}

export interface MicroChallenge {
    id: string;
    name: string;
    description: string;
    duration: string;                   // "2 minutes", "15 minutes"
    dimension?: LifeWheelDimensionTag;
    points: number;
}

// ============================================================================
// USER SETTINGS & PREFERENCES
// ============================================================================

export interface SensAISettings {
    userId: string;
    
    // Standup preferences
    standupEnabled: boolean;
    standupTime: string;                // "09:00"
    dailyStandupTime: string;           // Alias for standupTime
    standupDays: number[];              // [1,2,3,4,5] = weekdays
    
    // Intervention preferences
    interventionLevel: 'gentle' | 'balanced' | 'strict';
    interventionsEnabled: boolean;       // Master toggle for interventions
    overcommitBuffer: number;           // 1.0 - 1.5
    overcommitThreshold: number;        // Percentage (0.15 = 15%)
    neglectThresholdWeeks: number;      // 2-4
    dimensionAlertThreshold: number;    // Score below which to alert (0-10)
    
    // Capacity settings
    standardHoursPerWeek: number;       // Default 40
    minimumFocusHoursPerWeek: number;   // Default 10
    maxDailyCapacity: number;           // Max points per day
    sprintLengthDays: number;           // Sprint length in days (7 or 14)
    
    // Sprint planning
    targetVelocity: number;             // Default 56 (8 pts × 7 days)
    planningDayOfWeek: string;          // 'SUNDAY' | 'MONDAY' | etc.
    planningTime: string;               // "10:00" HH:mm format
    
    // Calendar integration
    calendarIntegrationEnabled: boolean;
    calendarSources: string[];
    
    // Notifications
    interventionNotifications: boolean;
    celebrationNotifications: boolean;
    standupReminders: boolean;
    
    // Coach personality
    coachName: string;                  // "SensAI" or custom
    preferredTone: CoachTone;
    coachTone: CoachTone;              // Alias for preferredTone
    
    // Dimension priorities
    dimensionPriorities: Record<LifeWheelDimensionTag, number>;
}

// ============================================================================
// ANALYTICS & HISTORY
// ============================================================================

export interface SensAIAnalytics {
    userId: string;
    period: 'week' | 'month' | 'quarter' | 'year';
    
    // Velocity metrics
    averageVelocity: number;
    velocityTrend: number;              // percentage change
    completionRate: number;
    
    // Intervention metrics
    interventionsTriggered: number;
    interventionsAcknowledged: number;
    overridesCount: number;
    successfulInterventions: number;    // Prevented failures
    
    // Life wheel balance
    averageBalanceScore: number;
    mostNeglectedDimension: LifeWheelDimensionTag;
    mostFocusedDimension: LifeWheelDimensionTag;
    
    // Engagement
    standupCompletionRate: number;
    ceremonyCompletionRate: number;
    
    // Patterns
    commonPatterns: PatternInsight[];
}

export interface PatternInsight {
    id: string;
    pattern: string;
    frequency: number;
    impact: 'positive' | 'negative' | 'neutral';
    recommendation?: string;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface GetStandupResponse {
    standup: DailyStandup | null;
    hasCompletedToday: boolean;
    sprintHealth: SprintHealth;
}

export interface CompleteStandupRequest {
    blockers: string[];
    notes?: string;
    mood?: 'great' | 'good' | 'okay' | 'struggling';
}

export interface StartSprintPlanningRequest {
    selectedTaskIds: string[];
}

export interface CompleteSprintPlanningRequest {
    selectedTaskIds: string[];
    notes?: string;
}

export interface AcknowledgeInterventionRequest {
    interventionId: string;
    action: 'acknowledge' | 'override' | 'defer';
    overrideReason?: string;
}

export interface ProcessIntakeRequest {
    type: IntakeType;
    content: string;
    metadata?: Record<string, any>;
}

// ============================================================================
// CEREMONY DATA TYPES (for real data-driven ceremony screens)
// ============================================================================

/** Burndown chart data point — one per day of sprint */
export interface BurndownPoint {
    date: string;
    remainingPoints: number; // -1 = future date (no actual data yet)
    idealRemaining: number;
    completedToday: number;
}

/** Ceremony outcomes — returned by review-data and retro-data endpoints */
export interface CeremonyOutcomes {
    // Planning/shared
    plannedPoints?: number | null;
    tasksSelected?: number | null;
    sprintGoal?: string | null;
    // Review
    pointsDelivered?: number | null;
    tasksCompleted?: number | null;
    highlights?: string[] | null;
    carriedOver?: string[] | null;
    // Retrospective
    wentWell?: string[] | null;
    needsImprovement?: string[] | null;
    tryNextSprint?: string[] | null;
}

/** Velocity history response from GET /sensai/velocity/history */
export interface VelocityHistory {
    sprints: VelocitySprintRecord[];
    averageCommitted: number;
    averageCompleted: number;
    overallCompletionRate: number;
    totalPointsDelivered: number;
    sprintCount: number;
}

/** Individual sprint record within velocity history */
export interface VelocitySprintRecord {
    id: string;
    sprintId: string;
    sprintStartDate: string;
    sprintEndDate: string;
    committedPoints: number;
    completedPoints: number;
    carriedOverPoints: number;
    addedMidSprint: number;
    completionRate: number;
    focusFactor: number;
    isOvercommitted: boolean;
    overcommitPercentage: number;
    dimensionDistribution: Record<string, number>;
}
