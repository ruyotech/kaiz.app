/**
 * Task Scheduler Types — Shared types for the unified task scheduling system.
 *
 * These types align with the backend enums: TaskType, AlertBefore, RecurrenceFrequency.
 */

// ============================================================================
// Task Type (matches backend TaskType enum)
// ============================================================================

export type TaskType = 'TASK' | 'EVENT' | 'BIRTHDAY';

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  TASK: 'Task',
  EVENT: 'Event',
  BIRTHDAY: 'Birthday',
};

export const TASK_TYPE_ICONS: Record<TaskType, string> = {
  TASK: 'checkbox-marked-outline',
  EVENT: 'calendar-clock',
  BIRTHDAY: 'cake-variant',
};

export const TASK_TYPE_COLORS: Record<TaskType, string> = {
  TASK: '#3B82F6', // blue
  EVENT: '#8B5CF6', // violet
  BIRTHDAY: '#EC4899', // pink
};

// ============================================================================
// Alert Before (matches backend AlertBefore enum)
// ============================================================================

export type AlertBefore =
  | 'NONE'
  | 'AT_TIME'
  | 'MINUTES_5'
  | 'MINUTES_10'
  | 'MINUTES_15'
  | 'MINUTES_30'
  | 'HOURS_1'
  | 'HOURS_2'
  | 'DAYS_1'
  | 'DAYS_2'
  | 'WEEKS_1';

export const ALERT_BEFORE_LABELS: Record<AlertBefore, string> = {
  NONE: 'None',
  AT_TIME: 'At time of event',
  MINUTES_5: '5 minutes before',
  MINUTES_10: '10 minutes before',
  MINUTES_15: '15 minutes before',
  MINUTES_30: '30 minutes before',
  HOURS_1: '1 hour before',
  HOURS_2: '2 hours before',
  DAYS_1: '1 day before',
  DAYS_2: '2 days before',
  WEEKS_1: '1 week before',
};

export const ALERT_OPTIONS: AlertBefore[] = [
  'NONE',
  'AT_TIME',
  'MINUTES_5',
  'MINUTES_10',
  'MINUTES_15',
  'MINUTES_30',
  'HOURS_1',
  'HOURS_2',
  'DAYS_1',
  'DAYS_2',
  'WEEKS_1',
];

// ============================================================================
// Recurrence Types
// ============================================================================

export type RecurrencePreset =
  | 'NONE'
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'YEARLY'
  | 'CUSTOM';

export const RECURRENCE_PRESET_LABELS: Record<RecurrencePreset, string> = {
  NONE: 'Does not repeat',
  DAILY: 'Every day',
  WEEKLY: 'Every week',
  MONTHLY: 'Every month',
  YEARLY: 'Every year',
  CUSTOM: 'Custom...',
};

export type RecurrenceUnit = 'day' | 'week' | 'month' | 'year';

export const RECURRENCE_UNIT_LABELS: Record<RecurrenceUnit, string> = {
  day: 'day',
  week: 'week',
  month: 'month',
  year: 'year',
};

export interface CustomRecurrence {
  interval: number;
  unit: RecurrenceUnit;
  endDate: Date | null; // null = does not end
}

// ============================================================================
// Date Mode — Sprint assignment vs specific calendar day
// ============================================================================

export type DateMode = 'sprint' | 'backlog' | 'specific';

export const DATE_MODE_LABELS: Record<DateMode, string> = {
  sprint: 'Sprint',
  backlog: 'Backlog',
  specific: 'Specific Day',
};

// ============================================================================
// Sprint (shared lightweight interface for schedule pickers)
// ============================================================================

export interface ScheduleSprint {
  id: string;
  name: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
}

// ============================================================================
// Task Schedule State (composite state for TaskScheduler component)
// ============================================================================

export interface TaskScheduleState {
  taskType: TaskType;
  dateMode: DateMode;
  sprintId: string | null; // null = backlog
  allDay: boolean;
  date: Date;
  time: Date; // time portion only
  endTime: Date | null; // optional end time
  recurrence: RecurrencePreset;
  customRecurrence: CustomRecurrence | null;
  alertBefore: AlertBefore;
  location: string;
}

/**
 * Creates a default TaskScheduleState for the given task type.
 */
export function createDefaultScheduleState(
  taskType: TaskType = 'TASK',
): TaskScheduleState {
  const now = new Date();
  const roundedTime = new Date(now);
  // Round to next 15-minute interval
  const minutes = roundedTime.getMinutes();
  const roundedMinutes = Math.ceil(minutes / 15) * 15;
  roundedTime.setMinutes(roundedMinutes, 0, 0);

  switch (taskType) {
    case 'BIRTHDAY':
      return {
        taskType: 'BIRTHDAY',
        dateMode: 'specific',
        sprintId: null,
        allDay: true,
        date: now,
        time: roundedTime,
        endTime: null,
        recurrence: 'YEARLY',
        customRecurrence: null,
        alertBefore: 'DAYS_1',
        location: '',
      };
    case 'EVENT':
      return {
        taskType: 'EVENT',
        dateMode: 'specific',
        sprintId: null,
        allDay: false,
        date: now,
        time: roundedTime,
        endTime: null,
        recurrence: 'NONE',
        customRecurrence: null,
        alertBefore: 'MINUTES_30',
        location: '',
      };
    case 'TASK':
    default:
      return {
        taskType: 'TASK',
        dateMode: 'sprint',
        sprintId: null,
        allDay: false,
        date: now,
        time: roundedTime,
        endTime: null,
        recurrence: 'NONE',
        customRecurrence: null,
        alertBefore: 'NONE',
        location: '',
      };
  }
}
// ============================================================================
// Ceremony Events — Virtual calendar entries for sprint rituals
// ============================================================================

export type CeremonyType = 'planning' | 'retrospective' | 'standup' | 'review';

export interface CeremonyEvent {
  id: string;
  type: CeremonyType;
  title: string;
  /** ISO time string e.g. "10:00" */
  startTime: string;
  /** Duration in minutes */
  durationMinutes: number;
  /** Day of week (0=Sun, 6=Sat) */
  dayOfWeek: number;
  /** Color for timeline rendering */
  color: string;
  /** Icon name */
  icon: string;
}

export const CEREMONY_DEFAULTS: Record<CeremonyType, Omit<CeremonyEvent, 'id' | 'startTime'>> = {
  planning: {
    type: 'planning',
    title: 'Sprint Planning',
    durationMinutes: 30,
    dayOfWeek: 0, // Sunday
    color: '#8B5CF6',
    icon: 'rocket-launch',
  },
  retrospective: {
    type: 'retrospective',
    title: 'Sprint Retro',
    durationMinutes: 20,
    dayOfWeek: 6, // Saturday
    color: '#EC4899',
    icon: 'chart-timeline-variant',
  },
  standup: {
    type: 'standup',
    title: 'Daily Standup',
    durationMinutes: 10,
    dayOfWeek: -1, // Every day
    color: '#10B981',
    icon: 'account-voice',
  },
  review: {
    type: 'review',
    title: 'Sprint Review',
    durationMinutes: 15,
    dayOfWeek: 6, // Saturday
    color: '#F59E0B',
    icon: 'eye-check',
  },
};