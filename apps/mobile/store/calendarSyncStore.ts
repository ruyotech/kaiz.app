/**
 * calendarSyncStore.ts - External Calendar Sync Store for Kaiz LifeOS
 * 
 * Manages external calendar integrations (Apple, Google, Microsoft) with
 * read-only sync capabilities. Never writes to user calendars.
 * 
 * Features:
 * - Multiple provider support
 * - Calendar selection per provider
 * - Background sync with configurable frequency
 * - External events as blocked time
 * - Capacity adjustment for sprint planning
 * 
 * @author Kaiz Team
 * @version 1.0.0
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Supported calendar providers
 */
export type CalendarProvider = 'apple' | 'google' | 'microsoft';

/**
 * Connection status for a provider
 */
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * Sync status for tracking sync operations
 */
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

/**
 * Preset life context options for calendars
 */
export const LIFE_CONTEXTS = [
    { label: 'Personal', color: '#10B981', icon: 'account' },
    { label: 'Work', color: '#3B82F6', icon: 'briefcase' },
    { label: 'Family', color: '#EC4899', icon: 'home-heart' },
    { label: 'Side Hustle', color: '#F59E0B', icon: 'rocket-launch' },
    { label: 'Health', color: '#EF4444', icon: 'heart-pulse' },
    { label: 'Education', color: '#8B5CF6', icon: 'school' },
    { label: 'Social', color: '#06B6D4', icon: 'account-group' },
] as const;

/**
 * Individual calendar from a provider
 */
export interface ExternalCalendar {
    id: string;
    name: string;
    color: string;
    provider: CalendarProvider;
    isSelected: boolean;
    isPrimary: boolean;
    accessLevel: 'read' | 'owner' | 'editor' | 'freebusy';
    // Life Context customization
    alias?: string; // Custom name like "Work @ Google", "Personal", "Side Hustle"
    contextColor?: string; // Custom color for the context tag
}

/**
 * External calendar event (read-only)
 */
export interface ExternalEvent {
    id: string;
    calendarId: string;
    provider: CalendarProvider;
    title: string;
    startDate: string; // ISO date string
    endDate: string; // ISO date string
    isAllDay: boolean;
    location?: string;
    notes?: string;
    recurrence?: string;
    // Context info (populated from calendar settings)
    calendarAlias?: string;
    calendarContextColor?: string;
}

/**
 * Provider connection information
 */
export interface ProviderConnection {
    provider: CalendarProvider;
    status: ConnectionStatus;
    accountEmail?: string;
    accountName?: string;
    connectedAt?: string; // ISO date string
    lastSyncAt?: string; // ISO date string
    syncStatus: SyncStatus;
    errorMessage?: string;
    calendars: ExternalCalendar[];
    accessToken?: string; // Stored securely, not persisted in plain store
    refreshToken?: string;
    tokenExpiresAt?: string;
}

/**
 * Sync settings
 */
export interface SyncSettings {
    autoSyncEnabled: boolean;
    syncFrequencyMinutes: number; // Default: 60 (hourly)
    syncRangeDays: number; // Days ahead to sync, default: 30
    autoAdjustCapacity: boolean;
    showEventsAsBlockedTime: boolean;
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
    id: CalendarProvider;
    name: string;
    icon: string;
    color: string;
    bgColor: string;
    description: string;
    scopes: string[];
}

/**
 * Calendar sync store state
 */
interface CalendarSyncState {
    // Provider connections
    connections: Record<CalendarProvider, ProviderConnection>;
    
    // External events cache
    externalEvents: ExternalEvent[];
    
    // Sync settings
    syncSettings: SyncSettings;
    
    // Global sync state
    isGlobalSyncing: boolean;
    lastGlobalSyncAt: string | null;
    
    // Computed values
    getConnectedProviders: () => CalendarProvider[];
    getSelectedCalendars: () => ExternalCalendar[];
    getEventsForDateRange: (startDate: string, endDate: string) => ExternalEvent[];
    getBlockedHoursForDate: (date: string) => number;
    getTotalBlockedHoursForWeek: (weekStartDate: string) => number;
    
    // Connection actions
    initiateConnection: (provider: CalendarProvider) => void;
    completeConnection: (provider: CalendarProvider, data: Partial<ProviderConnection>) => void;
    disconnectProvider: (provider: CalendarProvider) => void;
    setConnectionError: (provider: CalendarProvider, error: string) => void;
    
    // Calendar actions
    setCalendars: (provider: CalendarProvider, calendars: ExternalCalendar[]) => void;
    toggleCalendarSelection: (provider: CalendarProvider, calendarId: string) => void;
    selectAllCalendars: (provider: CalendarProvider, selected: boolean) => void;
    setCalendarAlias: (provider: CalendarProvider, calendarId: string, alias: string, contextColor?: string) => void;
    getCalendarById: (provider: CalendarProvider, calendarId: string) => ExternalCalendar | undefined;
    
    // Event actions
    setExternalEvents: (events: ExternalEvent[]) => void;
    addEvents: (events: ExternalEvent[]) => void;
    clearProviderEvents: (provider: CalendarProvider) => void;
    
    // Sync actions
    startSync: (provider?: CalendarProvider) => void;
    completeSync: (provider: CalendarProvider, success: boolean, error?: string) => void;
    updateLastSyncTime: (provider?: CalendarProvider) => void;
    
    // Settings actions
    updateSyncSettings: (settings: Partial<SyncSettings>) => void;
    
    // Reset
    reset: () => void;
}

// ============================================================================
// Provider Configurations
// ============================================================================

export const CALENDAR_PROVIDERS: Record<CalendarProvider, ProviderConfig> = {
    apple: {
        id: 'apple',
        name: 'Apple Calendar',
        icon: 'apple',
        color: '#000000',
        bgColor: '#F5F5F7',
        description: 'Sync with iCloud and local calendars',
        scopes: ['calendar'], // Native API, no OAuth
    },
    google: {
        id: 'google',
        name: 'Google Calendar',
        icon: 'google',
        color: '#4285F4',
        bgColor: '#E8F0FE',
        description: 'Sync with Google Workspace calendars',
        scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    },
    microsoft: {
        id: 'microsoft',
        name: 'Microsoft Outlook',
        icon: 'microsoft-outlook',
        color: '#0078D4',
        bgColor: '#E5F1FB',
        description: 'Sync with Outlook and Microsoft 365',
        scopes: ['Calendars.Read'],
    },
};

// ============================================================================
// Initial State
// ============================================================================

const createInitialProviderConnection = (provider: CalendarProvider): ProviderConnection => ({
    provider,
    status: 'disconnected',
    syncStatus: 'idle',
    calendars: [],
});

const initialState = {
    connections: {
        apple: createInitialProviderConnection('apple'),
        google: createInitialProviderConnection('google'),
        microsoft: createInitialProviderConnection('microsoft'),
    },
    externalEvents: [],
    syncSettings: {
        autoSyncEnabled: true,
        syncFrequencyMinutes: 60, // Hourly
        syncRangeDays: 30, // 30 days ahead
        autoAdjustCapacity: true,
        showEventsAsBlockedTime: true,
    },
    isGlobalSyncing: false,
    lastGlobalSyncAt: null,
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useCalendarSyncStore = create<CalendarSyncState>()(
    persist(
        (set, get) => ({
            ...initialState,
            
            // ================================================================
            // Computed Values
            // ================================================================
            
            getConnectedProviders: () => {
                const { connections } = get();
                return (Object.keys(connections) as CalendarProvider[]).filter(
                    (provider) => connections[provider].status === 'connected'
                );
            },
            
            getSelectedCalendars: () => {
                const { connections } = get();
                const selectedCalendars: ExternalCalendar[] = [];
                
                (Object.keys(connections) as CalendarProvider[]).forEach((provider) => {
                    const connection = connections[provider];
                    if (connection.status === 'connected') {
                        connection.calendars
                            .filter((cal) => cal.isSelected)
                            .forEach((cal) => selectedCalendars.push(cal));
                    }
                });
                
                return selectedCalendars;
            },
            
            getEventsForDateRange: (startDate: string, endDate: string) => {
                const { externalEvents, connections } = get();
                const start = new Date(startDate);
                const end = new Date(endDate);
                
                // Get selected calendar IDs
                const selectedCalendarIds = new Set<string>();
                (Object.keys(connections) as CalendarProvider[]).forEach((provider) => {
                    connections[provider].calendars
                        .filter((cal) => cal.isSelected)
                        .forEach((cal) => selectedCalendarIds.add(cal.id));
                });
                
                return externalEvents.filter((event) => {
                    if (!selectedCalendarIds.has(event.calendarId)) return false;
                    
                    const eventStart = new Date(event.startDate);
                    const eventEnd = new Date(event.endDate);
                    
                    // Check if event overlaps with date range
                    return eventStart <= end && eventEnd >= start;
                });
            },
            
            getBlockedHoursForDate: (date: string) => {
                const { syncSettings } = get();
                if (!syncSettings.showEventsAsBlockedTime) return 0;
                
                const dayStart = new Date(date);
                dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(date);
                dayEnd.setHours(23, 59, 59, 999);
                
                const events = get().getEventsForDateRange(
                    dayStart.toISOString(),
                    dayEnd.toISOString()
                );
                
                let totalMinutes = 0;
                
                events.forEach((event) => {
                    const eventStart = new Date(event.startDate);
                    const eventEnd = new Date(event.endDate);
                    
                    // Clamp to day boundaries
                    const start = eventStart < dayStart ? dayStart : eventStart;
                    const end = eventEnd > dayEnd ? dayEnd : eventEnd;
                    
                    // Calculate duration in minutes
                    const durationMs = end.getTime() - start.getTime();
                    totalMinutes += durationMs / (1000 * 60);
                });
                
                // Convert to hours, rounded to 0.5
                return Math.round((totalMinutes / 60) * 2) / 2;
            },
            
            getTotalBlockedHoursForWeek: (weekStartDate: string) => {
                const start = new Date(weekStartDate);
                let totalHours = 0;
                
                for (let i = 0; i < 7; i++) {
                    const currentDate = new Date(start);
                    currentDate.setDate(start.getDate() + i);
                    totalHours += get().getBlockedHoursForDate(currentDate.toISOString());
                }
                
                return totalHours;
            },
            
            // ================================================================
            // Connection Actions
            // ================================================================
            
            initiateConnection: (provider: CalendarProvider) => {
                set((state) => ({
                    connections: {
                        ...state.connections,
                        [provider]: {
                            ...state.connections[provider],
                            status: 'connecting',
                            errorMessage: undefined,
                        },
                    },
                }));
            },
            
            completeConnection: (provider: CalendarProvider, data: Partial<ProviderConnection>) => {
                set((state) => ({
                    connections: {
                        ...state.connections,
                        [provider]: {
                            ...state.connections[provider],
                            ...data,
                            status: 'connected',
                            connectedAt: new Date().toISOString(),
                            errorMessage: undefined,
                        },
                    },
                }));
            },
            
            disconnectProvider: (provider: CalendarProvider) => {
                set((state) => {
                    // Clear events from this provider
                    const filteredEvents = state.externalEvents.filter(
                        (event) => event.provider !== provider
                    );
                    
                    return {
                        connections: {
                            ...state.connections,
                            [provider]: createInitialProviderConnection(provider),
                        },
                        externalEvents: filteredEvents,
                    };
                });
            },
            
            setConnectionError: (provider: CalendarProvider, error: string) => {
                set((state) => ({
                    connections: {
                        ...state.connections,
                        [provider]: {
                            ...state.connections[provider],
                            status: 'error',
                            errorMessage: error,
                        },
                    },
                }));
            },
            
            // ================================================================
            // Calendar Actions
            // ================================================================
            
            setCalendars: (provider: CalendarProvider, calendars: ExternalCalendar[]) => {
                set((state) => ({
                    connections: {
                        ...state.connections,
                        [provider]: {
                            ...state.connections[provider],
                            calendars,
                        },
                    },
                }));
            },
            
            toggleCalendarSelection: (provider: CalendarProvider, calendarId: string) => {
                set((state) => ({
                    connections: {
                        ...state.connections,
                        [provider]: {
                            ...state.connections[provider],
                            calendars: state.connections[provider].calendars.map((cal) =>
                                cal.id === calendarId
                                    ? { ...cal, isSelected: !cal.isSelected }
                                    : cal
                            ),
                        },
                    },
                }));
            },
            
            selectAllCalendars: (provider: CalendarProvider, selected: boolean) => {
                set((state) => ({
                    connections: {
                        ...state.connections,
                        [provider]: {
                            ...state.connections[provider],
                            calendars: state.connections[provider].calendars.map((cal) => ({
                                ...cal,
                                isSelected: selected,
                            })),
                        },
                    },
                }));
            },
            
            setCalendarAlias: (provider: CalendarProvider, calendarId: string, alias: string, contextColor?: string) => {
                set((state) => ({
                    connections: {
                        ...state.connections,
                        [provider]: {
                            ...state.connections[provider],
                            calendars: state.connections[provider].calendars.map((cal) =>
                                cal.id === calendarId
                                    ? { ...cal, alias, contextColor: contextColor || cal.contextColor }
                                    : cal
                            ),
                        },
                    },
                }));
            },
            
            getCalendarById: (provider: CalendarProvider, calendarId: string) => {
                return get().connections[provider].calendars.find((cal) => cal.id === calendarId);
            },
            
            // ================================================================
            // Event Actions
            // ================================================================
            
            setExternalEvents: (events: ExternalEvent[]) => {
                set({ externalEvents: events });
            },
            
            addEvents: (events: ExternalEvent[]) => {
                console.log(`[calendarSyncStore] addEvents called with ${events.length} events`);
                set((state) => {
                    // Merge events, avoiding duplicates by ID
                    const existingIds = new Set(state.externalEvents.map((e) => e.id));
                    const newEvents = events.filter((e) => !existingIds.has(e.id));
                    
                    // Enrich events with calendar alias and context color
                    const enrichedEvents = newEvents.map((event) => {
                        const calendar = state.connections[event.provider]?.calendars.find(
                            (cal) => cal.id === event.calendarId
                        );
                        return {
                            ...event,
                            calendarAlias: calendar?.alias || calendar?.name || event.provider,
                            calendarContextColor: calendar?.contextColor || calendar?.color || '#6B7280',
                        };
                    });
                    
                    console.log(`[calendarSyncStore] Adding ${enrichedEvents.length} new events (${existingIds.size} existing)`);
                    const updatedEvents = [...state.externalEvents, ...enrichedEvents];
                    console.log(`[calendarSyncStore] Total events after add:`, updatedEvents.length);
                    
                    return {
                        externalEvents: updatedEvents,
                    };
                });
            },
            
            clearProviderEvents: (provider: CalendarProvider) => {
                set((state) => ({
                    externalEvents: state.externalEvents.filter(
                        (event) => event.provider !== provider
                    ),
                }));
            },
            
            // ================================================================
            // Sync Actions
            // ================================================================
            
            startSync: (provider?: CalendarProvider) => {
                if (provider) {
                    set((state) => ({
                        connections: {
                            ...state.connections,
                            [provider]: {
                                ...state.connections[provider],
                                syncStatus: 'syncing',
                            },
                        },
                    }));
                } else {
                    // Global sync - mark all connected providers as syncing
                    set((state) => {
                        const updatedConnections = { ...state.connections };
                        (Object.keys(updatedConnections) as CalendarProvider[]).forEach((p) => {
                            if (updatedConnections[p].status === 'connected') {
                                updatedConnections[p] = {
                                    ...updatedConnections[p],
                                    syncStatus: 'syncing',
                                };
                            }
                        });
                        
                        return {
                            connections: updatedConnections,
                            isGlobalSyncing: true,
                        };
                    });
                }
            },
            
            completeSync: (provider: CalendarProvider, success: boolean, error?: string) => {
                const now = new Date().toISOString();
                
                set((state) => ({
                    connections: {
                        ...state.connections,
                        [provider]: {
                            ...state.connections[provider],
                            syncStatus: success ? 'success' : 'error',
                            lastSyncAt: success ? now : state.connections[provider].lastSyncAt,
                            errorMessage: error,
                        },
                    },
                }));
                
                // Check if all providers finished syncing
                setTimeout(() => {
                    const { connections } = get();
                    const allFinished = (Object.keys(connections) as CalendarProvider[]).every(
                        (p) =>
                            connections[p].status !== 'connected' ||
                            connections[p].syncStatus !== 'syncing'
                    );
                    
                    if (allFinished) {
                        set({ isGlobalSyncing: false, lastGlobalSyncAt: now });
                    }
                }, 100);
            },
            
            updateLastSyncTime: (provider?: CalendarProvider) => {
                const now = new Date().toISOString();
                
                if (provider) {
                    set((state) => ({
                        connections: {
                            ...state.connections,
                            [provider]: {
                                ...state.connections[provider],
                                lastSyncAt: now,
                            },
                        },
                    }));
                } else {
                    set({ lastGlobalSyncAt: now });
                }
            },
            
            // ================================================================
            // Settings Actions
            // ================================================================
            
            updateSyncSettings: (settings: Partial<SyncSettings>) => {
                set((state) => ({
                    syncSettings: {
                        ...state.syncSettings,
                        ...settings,
                    },
                }));
            },
            
            // ================================================================
            // Reset
            // ================================================================
            
            reset: () => {
                set(initialState);
            },
        }),
        {
            name: 'kaiz-calendar-sync-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                // Only persist non-sensitive data
                connections: Object.fromEntries(
                    Object.entries(state.connections).map(([key, conn]) => [
                        key,
                        {
                            ...conn,
                            // Don't persist tokens
                            accessToken: undefined,
                            refreshToken: undefined,
                        },
                    ])
                ),
                externalEvents: state.externalEvents,
                syncSettings: state.syncSettings,
                lastGlobalSyncAt: state.lastGlobalSyncAt,
            }),
        }
    )
);

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get provider display configuration
 */
export const getProviderConfig = (provider: CalendarProvider): ProviderConfig => {
    return CALENDAR_PROVIDERS[provider];
};

/**
 * Format last sync time for display
 */
export const formatLastSyncTime = (isoDate: string | undefined | null): string => {
    if (!isoDate) return 'Never';
    
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
};

/**
 * Get sync frequency label
 */
export const getSyncFrequencyLabel = (minutes: number): string => {
    if (minutes < 60) return `Every ${minutes} minutes`;
    if (minutes === 60) return 'Hourly';
    if (minutes < 1440) return `Every ${minutes / 60} hours`;
    if (minutes === 1440) return 'Daily';
    return `Every ${minutes / 1440} days`;
};
