import { logger } from '../utils/logger';
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTaskStore } from './taskStore';

export interface PomodoroSession {
  id: string;
  taskId: string | null;
  taskTitle: string | null;
  mode: 'focus' | 'shortBreak' | 'longBreak';
  duration: number; // seconds
  completedAt: string;
  interrupted: boolean;
}

interface PomodoroState {
  // Active session
  isActive: boolean;
  isPaused: boolean;
  mode: 'focus' | 'shortBreak' | 'longBreak' | 'idle';
  timeRemaining: number; // seconds
  currentTaskId: string | null;
  currentTaskTitle: string | null;
  sessionsCompleted: number;
  sessionsUntilLongBreak: number;

  // Configuration
  focusDuration: number; // 25 min default (1500s)
  shortBreakDuration: number; // 5 min (300s)
  longBreakDuration: number; // 15 min (900s)
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  longBreakInterval: number; // Every N sessions

  // History
  sessions: PomodoroSession[];
  todaySessions: number;
  weekSessions: number;

  // Timer interval reference
  timerInterval: ReturnType<typeof setInterval> | null;

  // Actions
  startSession: (taskId: string | null, taskTitle: string | null, mode?: 'focus' | 'shortBreak' | 'longBreak') => void;
  pauseSession: () => void;
  resumeSession: () => void;
  completeSession: () => void;
  skipSession: () => void;
  stopSession: () => void;
  tick: () => void;
  reset: () => void;
  updateSettings: (settings: Partial<PomodoroState>) => void;
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;

  // Queries
  getSessionsByTask: (taskId: string) => PomodoroSession[];
  getSessionsByDate: (date: string) => PomodoroSession[];
  getTotalFocusTime: (taskId?: string, dateRange?: { start: string; end: string }) => number;
}

const SETTINGS_KEY = '@pomodoro_settings';
const SESSIONS_KEY = '@pomodoro_sessions';

const DEFAULT_FOCUS_DURATION = 25 * 60; // 25 minutes
const DEFAULT_SHORT_BREAK = 5 * 60; // 5 minutes
const DEFAULT_LONG_BREAK = 15 * 60; // 15 minutes
const DEFAULT_LONG_BREAK_INTERVAL = 4; // Every 4 sessions

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  // Initial state
  isActive: false,
  isPaused: false,
  mode: 'idle',
  timeRemaining: DEFAULT_FOCUS_DURATION,
  currentTaskId: null,
  currentTaskTitle: null,
  sessionsCompleted: 0,
  sessionsUntilLongBreak: DEFAULT_LONG_BREAK_INTERVAL,

  // Configuration defaults
  focusDuration: DEFAULT_FOCUS_DURATION,
  shortBreakDuration: DEFAULT_SHORT_BREAK,
  longBreakDuration: DEFAULT_LONG_BREAK,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  longBreakInterval: DEFAULT_LONG_BREAK_INTERVAL,

  // History
  sessions: [],
  todaySessions: 0,
  weekSessions: 0,

  timerInterval: null,

  // Start a new session
  startSession: (taskId, taskTitle, mode = 'focus') => {
    const state = get();
    
    // Clear any existing timer
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
    }

    let duration: number;
    if (mode === 'focus') {
      duration = state.focusDuration;
    } else if (mode === 'shortBreak') {
      duration = state.shortBreakDuration;
    } else {
      duration = state.longBreakDuration;
    }

    // Add history entry for starting focus session
    if (mode === 'focus' && taskId) {
      const taskStore = useTaskStore.getState();
      taskStore.addTaskHistory(taskId, {
        userId: 'current-user',
        userName: 'You',
        action: 'Started Pomodoro session',
        details: `Started a ${Math.floor(duration / 60)}-minute focus session`,
      });
    }

    // Start the interval timer
    const interval = setInterval(() => {
      get().tick();
    }, 1000);

    set({
      isActive: true,
      isPaused: false,
      mode,
      timeRemaining: duration,
      currentTaskId: taskId,
      currentTaskTitle: taskTitle,
      timerInterval: interval,
    });
  },

  // Pause the current session
  pauseSession: () => {
    const state = get();
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
    }
    set({ isPaused: true, timerInterval: null });
  },

  // Resume a paused session
  resumeSession: () => {
    const state = get();
    if (state.isPaused && state.isActive) {
      const interval = setInterval(() => {
        get().tick();
      }, 1000);
      set({ isPaused: false, timerInterval: interval });
    }
  },

  // Complete the current session
  completeSession: () => {
    const state = get();

    // Clear timer
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
    }

    // Save session to history
    const session: PomodoroSession = {
      id: `session_${Date.now()}`,
      taskId: state.currentTaskId,
      taskTitle: state.currentTaskTitle,
      mode: state.mode as 'focus' | 'shortBreak' | 'longBreak',
      duration:
        state.mode === 'focus'
          ? state.focusDuration
          : state.mode === 'shortBreak'
          ? state.shortBreakDuration
          : state.longBreakDuration,
      completedAt: new Date().toISOString(),
      interrupted: false,
    };

    const newSessions = [...state.sessions, session];
    
    // Update session counters
    let newSessionsCompleted = state.sessionsCompleted;
    let newSessionsUntilLongBreak = state.sessionsUntilLongBreak;
    
    if (state.mode === 'focus') {
      newSessionsCompleted += 1;
      newSessionsUntilLongBreak -= 1;
      
      // Add history entry for completing focus session
      if (state.currentTaskId) {
        const taskStore = useTaskStore.getState();
        const durationMinutes = Math.floor(session.duration / 60);
        taskStore.addTaskHistory(state.currentTaskId, {
          userId: 'current-user',
          userName: 'You',
          action: 'Completed Pomodoro session',
          details: `Completed a ${durationMinutes}-minute focus session`,
        });
      }
    }

    // Save sessions to storage
    AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(newSessions));

    // Determine next mode
    let nextMode: 'focus' | 'shortBreak' | 'longBreak' = 'focus';
    let shouldAutoStart = false;

    if (state.mode === 'focus') {
      if (newSessionsUntilLongBreak <= 0) {
        nextMode = 'longBreak';
        newSessionsUntilLongBreak = state.longBreakInterval;
      } else {
        nextMode = 'shortBreak';
      }
      shouldAutoStart = state.autoStartBreaks;
    } else {
      nextMode = 'focus';
      shouldAutoStart = state.autoStartPomodoros;
    }

    set({
      sessions: newSessions,
      sessionsCompleted: newSessionsCompleted,
      sessionsUntilLongBreak: newSessionsUntilLongBreak,
      isActive: false,
      isPaused: false,
      mode: 'idle',
      timeRemaining: state.focusDuration,
      timerInterval: null,
    });

    // Auto-start next session if enabled
    if (shouldAutoStart) {
      setTimeout(() => {
        get().startSession(state.currentTaskId, state.currentTaskTitle, nextMode);
      }, 2000); // 2 second delay before auto-starting
    }
  },

  // Skip to next mode
  skipSession: () => {
    const state = get();

    // Clear timer
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
    }

    // Save as interrupted session
    const session: PomodoroSession = {
      id: `session_${Date.now()}`,
      taskId: state.currentTaskId,
      taskTitle: state.currentTaskTitle,
      mode: state.mode as 'focus' | 'shortBreak' | 'longBreak',
      duration:
        state.mode === 'focus'
          ? state.focusDuration
          : state.mode === 'shortBreak'
          ? state.shortBreakDuration
          : state.longBreakDuration,
      completedAt: new Date().toISOString(),
      interrupted: true,
    };

    const newSessions = [...state.sessions, session];
    AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(newSessions));

    // Determine next mode without updating counters
    let nextMode: 'focus' | 'shortBreak' | 'longBreak' = 'focus';
    if (state.mode === 'focus') {
      nextMode = state.sessionsUntilLongBreak <= 1 ? 'longBreak' : 'shortBreak';
    }

    set({
      sessions: newSessions,
      isActive: false,
      isPaused: false,
      mode: 'idle',
      timeRemaining: state.focusDuration,
      timerInterval: null,
    });

    // Auto-start next mode
    get().startSession(state.currentTaskId, state.currentTaskTitle, nextMode);
  },

  // Stop session completely
  stopSession: () => {
    const state = get();

    // Clear timer
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
    }

    // Save as interrupted session if was active
    if (state.isActive && state.mode !== 'idle') {
      const session: PomodoroSession = {
        id: `session_${Date.now()}`,
        taskId: state.currentTaskId,
        taskTitle: state.currentTaskTitle,
        mode: state.mode as 'focus' | 'shortBreak' | 'longBreak',
        duration:
          state.mode === 'focus'
            ? state.focusDuration
            : state.mode === 'shortBreak'
            ? state.shortBreakDuration
            : state.longBreakDuration,
        completedAt: new Date().toISOString(),
        interrupted: true,
      };

      const newSessions = [...state.sessions, session];
      AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(newSessions));

      // Add history entry for interrupted focus session
      if (state.mode === 'focus' && state.currentTaskId) {
        const taskStore = useTaskStore.getState();
        const timeSpent = Math.floor((session.duration - state.timeRemaining) / 60);
        taskStore.addTaskHistory(state.currentTaskId, {
          userId: 'current-user',
          userName: 'You',
          action: 'Stopped Pomodoro session',
          details: `Stopped focus session after ${timeSpent} minute${timeSpent !== 1 ? 's' : ''}`,
        });
      }

      set({ sessions: newSessions });
    }

    set({
      isActive: false,
      isPaused: false,
      mode: 'idle',
      timeRemaining: state.focusDuration,
      currentTaskId: null,
      currentTaskTitle: null,
      timerInterval: null,
    });
  },

  // Tick down the timer
  tick: () => {
    const state = get();
    if (state.isActive && !state.isPaused && state.timeRemaining > 0) {
      const newTimeRemaining = state.timeRemaining - 1;

      if (newTimeRemaining <= 0) {
        // Session complete
        get().completeSession();
      } else {
        set({ timeRemaining: newTimeRemaining });
      }
    }
  },

  // Reset everything
  reset: () => {
    const state = get();
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
    }

    set({
      isActive: false,
      isPaused: false,
      mode: 'idle',
      timeRemaining: state.focusDuration,
      currentTaskId: null,
      currentTaskTitle: null,
      sessionsCompleted: 0,
      sessionsUntilLongBreak: state.longBreakInterval,
      timerInterval: null,
    });
  },

  // Update settings
  updateSettings: async (settings) => {
    set(settings);
    await get().saveSettings();
  },

  // Load settings from storage
  loadSettings: async () => {
    try {
      const [settingsJson, sessionsJson] = await Promise.all([
        AsyncStorage.getItem(SETTINGS_KEY),
        AsyncStorage.getItem(SESSIONS_KEY),
      ]);

      if (settingsJson) {
        const settings = JSON.parse(settingsJson);
        set({
          focusDuration: settings.focusDuration ?? DEFAULT_FOCUS_DURATION,
          shortBreakDuration: settings.shortBreakDuration ?? DEFAULT_SHORT_BREAK,
          longBreakDuration: settings.longBreakDuration ?? DEFAULT_LONG_BREAK,
          autoStartBreaks: settings.autoStartBreaks ?? false,
          autoStartPomodoros: settings.autoStartPomodoros ?? false,
          longBreakInterval: settings.longBreakInterval ?? DEFAULT_LONG_BREAK_INTERVAL,
        });
      }

      if (sessionsJson) {
        const sessions = JSON.parse(sessionsJson);
        set({ sessions });

        // Calculate today and week sessions
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const todaySessions = sessions.filter(
          (s: PomodoroSession) =>
            s.completedAt.startsWith(today) && s.mode === 'focus' && !s.interrupted
        ).length;

        const weekSessions = sessions.filter(
          (s: PomodoroSession) =>
            new Date(s.completedAt) >= weekAgo && s.mode === 'focus' && !s.interrupted
        ).length;

        set({ todaySessions, weekSessions });
      }
    } catch (error) {
      logger.error('Failed to load pomodoro settings:', error);
    }
  },

  // Save settings to storage
  saveSettings: async () => {
    try {
      const state = get();
      const settings = {
        focusDuration: state.focusDuration,
        shortBreakDuration: state.shortBreakDuration,
        longBreakDuration: state.longBreakDuration,
        autoStartBreaks: state.autoStartBreaks,
        autoStartPomodoros: state.autoStartPomodoros,
        longBreakInterval: state.longBreakInterval,
      };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      logger.error('Failed to save pomodoro settings:', error);
    }
  },

  // Get sessions by task
  getSessionsByTask: (taskId) => {
    const state = get();
    return state.sessions.filter((s) => s.taskId === taskId);
  },

  // Get sessions by date
  getSessionsByDate: (date) => {
    const state = get();
    return state.sessions.filter((s) => s.completedAt.startsWith(date));
  },

  // Get total focus time
  getTotalFocusTime: (taskId, dateRange) => {
    const state = get();
    let filtered = state.sessions.filter((s) => s.mode === 'focus' && !s.interrupted);

    if (taskId) {
      filtered = filtered.filter((s) => s.taskId === taskId);
    }

    if (dateRange) {
      filtered = filtered.filter((s) => {
        const sessionDate = new Date(s.completedAt);
        return (
          sessionDate >= new Date(dateRange.start) && sessionDate <= new Date(dateRange.end)
        );
      });
    }

    return filtered.reduce((total, session) => total + session.duration, 0);
  },
}));
