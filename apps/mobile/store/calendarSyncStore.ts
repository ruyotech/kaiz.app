/**
 * calendarSyncStore.ts - External Calendar Sync Store for Kaiz 
 * 
 * Manages external calendar integrations (Apple, Google, Microsoft) with
 * read-only sync capabilities. Never writes to user calendars.
 * 
 * Features:
 * - Multiple ACCOUNTS per provider (e.g., multiple Google accounts)
 * - Calendar selection per account
 * - Background sync with configurable frequency
 * - External events as blocked time
 * - Capacity adjustment for sprint planning
 * - Life Context system for calendar aliases
 * 
 * @author Kaiz Team
 * @version 2.0.0 - Multi-account support
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
 * Individual calendar from a provider account
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
    // Multi-account support
    accountId?: string; // Links to parent ProviderAccount
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
    // Multi-account support
    accountId?: string;
    accountEmail?: string;
}

/**
 * A connected account for a provider
 * Multiple accounts can exist per provider (e.g., multiple Google accounts)
 */
export interface ProviderAccount {
    id: string; // Unique ID (email for OAuth providers, 'local' for Apple local)
    provider: CalendarProvider;
    status: ConnectionStatus;
    accountEmail?: string;
    accountName?: string;
    connectedAt?: string; // ISO date string
    lastSyncAt?: string; // ISO date string
    syncStatus: SyncStatus;
    errorMessage?: string;
    calendars: ExternalCalendar[];
    accessToken?: string;
    refreshToken?: string;
    tokenExpiresAt?: string;
}

/**
 * @deprecated Use ProviderAccount instead. Kept for backwards compatibility.
 */
export interface ProviderConnection {
    provider: CalendarProvider;
    status: ConnectionStatus;
    accountEmail?: string;
    accountName?: string;
    connectedAt?: string;
    lastSyncAt?: string;
    syncStatus: SyncStatus;
    errorMessage?: string;
    calendars: ExternalCalendar[];
    accessToken?: string;
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
 * Calendar sync store state - Multi-account version
 */
interface CalendarSyncState {
    // Multi-account storage: array of all connected accounts
    accounts: ProviderAccount[];
    
    // Legacy support: computed connections object for backward compatibility
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
    getAccountsForProvider: (provider: CalendarProvider) => ProviderAccount[];
    getSelectedCalendars: () => ExternalCalendar[];
    getEventsForDateRange: (startDate: string, endDate: string) => ExternalEvent[];
    getBlockedHoursForDate: (date: string) => number;
    getTotalBlockedHoursForWeek: (weekStartDate: string) => number;
    getTotalConnectedAccounts: () => number;
    
    // Multi-account actions
    addAccount: (account: ProviderAccount) => void;
    updateAccount: (accountId: string, data: Partial<ProviderAccount>) => void;
    removeAccount: (accountId: string) => void;
    getAccountById: (accountId: string) => ProviderAccount | undefined;
    
    // Connection actions (legacy + multi-account)
    initiateConnection: (provider: CalendarProvider, accountId?: string) => void;
    completeConnection: (provider: CalendarProvider, data: Partial<ProviderAccount>, accountId?: string) => void;
    disconnectProvider: (provider: CalendarProvider, accountId?: string) => void;
    setConnectionError: (provider: CalendarProvider, error: string, accountId?: string) => void;
    
    // Calendar actions
    setCalendars: (provider: CalendarProvider, calendars: ExternalCalendar[], accountId?: string) => void;
    toggleCalendarSelection: (provider: CalendarProvider, calendarId: string, accountId?: string) => void;
    selectAllCalendars: (provider: CalendarProvider, selected: boolean, accountId?: string) => void;
    setCalendarAlias: (provider: CalendarProvider, calendarId: string, alias: string, contextColor?: string, accountId?: string) => void;
    getCalendarById: (provider: CalendarProvider, calendarId: string, accountId?: string) => ExternalCalendar | undefined;
    
    // Event actions
    setExternalEvents: (events: ExternalEvent[]) => void;
    addEvents: (events: ExternalEvent[]) => void;
    clearProviderEvents: (provider: CalendarProvider, accountId?: string) => void;
    
    // Sync actions
    startSync: (provider?: CalendarProvider, accountId?: string) => void;
    completeSync: (provider: CalendarProvider, success: boolean, error?: string, accountId?: string) => void;
    updateLastSyncTime: (provider?: CalendarProvider, accountId?: string) => void;
    
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

/**
 * Build legacy connections object from accounts array
 * Returns aggregated status per provider for backwards compatibility
 */
const buildConnectionsFromAccounts = (accounts: ProviderAccount[]): Record<CalendarProvider, ProviderConnection> => {
    const connections: Record<CalendarProvider, ProviderConnection> = {
        apple: createInitialProviderConnection('apple'),
        google: createInitialProviderConnection('google'),
        microsoft: createInitialProviderConnection('microsoft'),
    };
    
    // For each provider, aggregate accounts
    (['apple', 'google', 'microsoft'] as CalendarProvider[]).forEach(provider => {
        const providerAccounts = accounts.filter(a => a.provider === provider);
        if (providerAccounts.length > 0) {
            // Check if ANY account is connected
            const connectedAccount = providerAccounts.find(a => a.status === 'connected');
            const primaryAccount = connectedAccount || providerAccounts[0];
            
            connections[provider] = {
                provider: primaryAccount.provider,
                status: connectedAccount ? 'connected' : primaryAccount.status,
                accountEmail: primaryAccount.accountEmail,
                accountName: primaryAccount.accountName,
                connectedAt: primaryAccount.connectedAt,
                lastSyncAt: primaryAccount.lastSyncAt,
                syncStatus: primaryAccount.syncStatus,
                errorMessage: primaryAccount.errorMessage,
                // Merge all calendars from all accounts for this provider
                calendars: providerAccounts.flatMap(a => a.calendars),
                accessToken: primaryAccount.accessToken,
                refreshToken: primaryAccount.refreshToken,
                tokenExpiresAt: primaryAccount.tokenExpiresAt,
            };
        }
    });
    
    return connections;
};

const initialState = {
    accounts: [] as ProviderAccount[],
    connections: {
        apple: createInitialProviderConnection('apple'),
        google: createInitialProviderConnection('google'),
        microsoft: createInitialProviderConnection('microsoft'),
    },
    externalEvents: [] as ExternalEvent[],
    syncSettings: {
        autoSyncEnabled: true,
        syncFrequencyMinutes: 60, // Hourly
        syncRangeDays: 30, // 30 days ahead
        autoAdjustCapacity: true,
        showEventsAsBlockedTime: true,
    },
    isGlobalSyncing: false,
    lastGlobalSyncAt: null as string | null,
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
                const { accounts } = get();
                const providers = new Set<CalendarProvider>();
                accounts.forEach(account => {
                    if (account.status === 'connected') {
                        providers.add(account.provider);
                    }
                });
                return Array.from(providers);
            },
            
            getAccountsForProvider: (provider: CalendarProvider) => {
                return get().accounts.filter(a => a.provider === provider);
            },
            
            getSelectedCalendars: () => {
                const { accounts } = get();
                const selectedCalendars: ExternalCalendar[] = [];
                
                accounts.forEach((account) => {
                    if (account.status === 'connected') {
                        account.calendars
                            .filter((cal) => cal.isSelected)
                            .forEach((cal) => selectedCalendars.push({
                                ...cal,
                                accountId: account.id,
                            }));
                    }
                });
                
                return selectedCalendars;
            },
            
            getEventsForDateRange: (startDate: string, endDate: string) => {
                const { externalEvents, accounts } = get();
                const start = new Date(startDate);
                const end = new Date(endDate);
                
                // Get selected calendar IDs from all accounts
                const selectedCalendarIds = new Set<string>();
                accounts.forEach((account) => {
                    account.calendars
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
                    const startClamped = eventStart < dayStart ? dayStart : eventStart;
                    const endClamped = eventEnd > dayEnd ? dayEnd : eventEnd;
                    
                    // Calculate duration in minutes
                    const durationMs = endClamped.getTime() - startClamped.getTime();
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
            
            getTotalConnectedAccounts: () => {
                return get().accounts.filter(a => a.status === 'connected').length;
            },
            
            // ================================================================
            // Multi-Account Actions
            // ================================================================
            
            addAccount: (account: ProviderAccount) => {
                set((state) => {
                    // Check if account already exists
                    const existingIndex = state.accounts.findIndex(a => a.id === account.id);
                    if (existingIndex >= 0) {
                        // Update existing account
                        const newAccounts = [...state.accounts];
                        newAccounts[existingIndex] = { ...newAccounts[existingIndex], ...account };
                        return {
                            accounts: newAccounts,
                            connections: buildConnectionsFromAccounts(newAccounts),
                        };
                    }
                    
                    // Add new account
                    const newAccounts = [...state.accounts, account];
                    return {
                        accounts: newAccounts,
                        connections: buildConnectionsFromAccounts(newAccounts),
                    };
                });
            },
            
            updateAccount: (accountId: string, data: Partial<ProviderAccount>) => {
                set((state) => {
                    const newAccounts = state.accounts.map(account =>
                        account.id === accountId
                            ? { ...account, ...data }
                            : account
                    );
                    return {
                        accounts: newAccounts,
                        connections: buildConnectionsFromAccounts(newAccounts),
                    };
                });
            },
            
            removeAccount: (accountId: string) => {
                set((state) => {
                    const accountToRemove = state.accounts.find(a => a.id === accountId);
                    const newAccounts = state.accounts.filter(a => a.id !== accountId);
                    
                    // Also remove events from this account
                    const newEvents = accountToRemove
                        ? state.externalEvents.filter(e => e.accountId !== accountId)
                        : state.externalEvents;
                    
                    return {
                        accounts: newAccounts,
                        connections: buildConnectionsFromAccounts(newAccounts),
                        externalEvents: newEvents,
                    };
                });
            },
            
            getAccountById: (accountId: string) => {
                return get().accounts.find(a => a.id === accountId);
            },
            
            // ================================================================
            // Connection Actions (backwards compatible + multi-account)
            // ================================================================
            
            initiateConnection: (provider: CalendarProvider, accountId?: string) => {
                if (accountId) {
                    // Multi-account: update specific account
                    set((state) => {
                        const existingAccount = state.accounts.find(a => a.id === accountId);
                        if (existingAccount) {
                            const newAccounts = state.accounts.map(a =>
                                a.id === accountId
                                    ? { ...a, status: 'connecting' as ConnectionStatus, errorMessage: undefined }
                                    : a
                            );
                            return {
                                accounts: newAccounts,
                                connections: buildConnectionsFromAccounts(newAccounts),
                            };
                        }
                        
                        // Create new account in connecting state
                        const newAccount: ProviderAccount = {
                            id: accountId,
                            provider,
                            status: 'connecting',
                            syncStatus: 'idle',
                            calendars: [],
                        };
                        const newAccounts = [...state.accounts, newAccount];
                        return {
                            accounts: newAccounts,
                            connections: buildConnectionsFromAccounts(newAccounts),
                        };
                    });
                } else {
                    // Legacy: create a temporary account or update first account for provider
                    const tempId = `${provider}_connecting_${Date.now()}`;
                    set((state) => {
                        const existingAccounts = state.accounts.filter(a => a.provider === provider);
                        if (existingAccounts.length === 0) {
                            // Create new temporary account
                            const newAccount: ProviderAccount = {
                                id: tempId,
                                provider,
                                status: 'connecting',
                                syncStatus: 'idle',
                                calendars: [],
                            };
                            const newAccounts = [...state.accounts, newAccount];
                            return {
                                accounts: newAccounts,
                                connections: buildConnectionsFromAccounts(newAccounts),
                            };
                        }
                        
                        // Update legacy connections for backwards compatibility
                        return {
                            connections: {
                                ...state.connections,
                                [provider]: {
                                    ...state.connections[provider],
                                    status: 'connecting',
                                    errorMessage: undefined,
                                },
                            },
                        };
                    });
                }
            },
            
            completeConnection: (provider: CalendarProvider, data: Partial<ProviderAccount>, accountId?: string) => {
                const now = new Date().toISOString();
                
                set((state) => {
                    // Find the account to update
                    let targetAccountId = accountId;
                    
                    if (!targetAccountId && data.accountEmail) {
                        // Try to find by email
                        targetAccountId = data.accountEmail;
                    }
                    
                    if (!targetAccountId) {
                        // Find first connecting account for this provider
                        const connectingAccount = state.accounts.find(
                            a => a.provider === provider && a.status === 'connecting'
                        );
                        targetAccountId = connectingAccount?.id;
                    }
                    
                    if (targetAccountId) {
                        // Check if this account already exists with different ID (e.g., temp ID)
                        const existingByEmail = data.accountEmail 
                            ? state.accounts.find(a => a.accountEmail === data.accountEmail && a.provider === provider)
                            : null;
                        
                        let newAccounts: ProviderAccount[];
                        
                        if (existingByEmail && existingByEmail.id !== targetAccountId) {
                            // Merge: remove temp account, update existing
                            newAccounts = state.accounts
                                .filter(a => a.id !== targetAccountId)
                                .map(a => a.id === existingByEmail.id
                                    ? {
                                        ...a,
                                        ...data,
                                        status: 'connected' as ConnectionStatus,
                                        connectedAt: now,
                                        errorMessage: undefined,
                                    }
                                    : a
                                );
                        } else if (state.accounts.find(a => a.id === targetAccountId)) {
                            // Update existing account
                            newAccounts = state.accounts.map(a =>
                                a.id === targetAccountId
                                    ? {
                                        ...a,
                                        ...data,
                                        id: data.accountEmail || a.id, // Update ID to email if available
                                        status: 'connected' as ConnectionStatus,
                                        connectedAt: now,
                                        errorMessage: undefined,
                                    }
                                    : a
                            );
                        } else {
                            // Create new account
                            const newAccount: ProviderAccount = {
                                id: data.accountEmail || targetAccountId,
                                provider,
                                status: 'connected',
                                syncStatus: 'idle',
                                connectedAt: now,
                                calendars: [],
                                ...data,
                            };
                            newAccounts = [...state.accounts, newAccount];
                        }
                        
                        return {
                            accounts: newAccounts,
                            connections: buildConnectionsFromAccounts(newAccounts),
                        };
                    }
                    
                    // Fallback: create new account
                    const newAccount: ProviderAccount = {
                        id: data.accountEmail || `${provider}_${Date.now()}`,
                        provider,
                        status: 'connected',
                        syncStatus: 'idle',
                        connectedAt: now,
                        calendars: [],
                        ...data,
                    };
                    const newAccounts = [...state.accounts, newAccount];
                    
                    return {
                        accounts: newAccounts,
                        connections: buildConnectionsFromAccounts(newAccounts),
                    };
                });
            },
            
            disconnectProvider: (provider: CalendarProvider, accountId?: string) => {
                set((state) => {
                    if (accountId) {
                        // Remove specific account
                        const newAccounts = state.accounts.filter(a => a.id !== accountId);
                        const newEvents = state.externalEvents.filter(e => e.accountId !== accountId);
                        
                        return {
                            accounts: newAccounts,
                            connections: buildConnectionsFromAccounts(newAccounts),
                            externalEvents: newEvents,
                        };
                    }
                    
                    // Remove ALL accounts for this provider
                    const newAccounts = state.accounts.filter(a => a.provider !== provider);
                    const newEvents = state.externalEvents.filter(e => e.provider !== provider);
                    
                    return {
                        accounts: newAccounts,
                        connections: buildConnectionsFromAccounts(newAccounts),
                        externalEvents: newEvents,
                    };
                });
            },
            
            setConnectionError: (provider: CalendarProvider, error: string, accountId?: string) => {
                set((state) => {
                    if (accountId) {
                        const newAccounts = state.accounts.map(a =>
                            a.id === accountId
                                ? { ...a, status: 'error' as ConnectionStatus, errorMessage: error }
                                : a
                        );
                        return {
                            accounts: newAccounts,
                            connections: buildConnectionsFromAccounts(newAccounts),
                        };
                    }
                    
                    // Find first account for provider (usually connecting one)
                    const firstAccount = state.accounts.find(
                        a => a.provider === provider && (a.status === 'connecting' || a.status === 'connected')
                    );
                    if (firstAccount) {
                        const newAccounts = state.accounts.map(a =>
                            a.id === firstAccount.id
                                ? { ...a, status: 'error' as ConnectionStatus, errorMessage: error }
                                : a
                        );
                        return {
                            accounts: newAccounts,
                            connections: buildConnectionsFromAccounts(newAccounts),
                        };
                    }
                    
                    // Legacy fallback
                    return {
                        connections: {
                            ...state.connections,
                            [provider]: {
                                ...state.connections[provider],
                                status: 'error',
                                errorMessage: error,
                            },
                        },
                    };
                });
            },
            
            // ================================================================
            // Calendar Actions
            // ================================================================
            
            setCalendars: (provider: CalendarProvider, calendars: ExternalCalendar[], accountId?: string) => {
                set((state) => {
                    const targetAccountId = accountId || state.accounts.find(a => a.provider === provider && a.status === 'connected')?.id;
                    
                    if (targetAccountId) {
                        const newAccounts = state.accounts.map(a =>
                            a.id === targetAccountId
                                ? { ...a, calendars: calendars.map(c => ({ ...c, accountId: targetAccountId })) }
                                : a
                        );
                        return {
                            accounts: newAccounts,
                            connections: buildConnectionsFromAccounts(newAccounts),
                        };
                    }
                    
                    // Legacy fallback
                    return {
                        connections: {
                            ...state.connections,
                            [provider]: {
                                ...state.connections[provider],
                                calendars,
                            },
                        },
                    };
                });
            },
            
            toggleCalendarSelection: (provider: CalendarProvider, calendarId: string, accountId?: string) => {
                set((state) => {
                    // Search in all accounts
                    const newAccounts = state.accounts.map(account => {
                        if (account.provider !== provider) return account;
                        if (accountId && account.id !== accountId) return account;
                        
                        const hasCalendar = account.calendars.some(c => c.id === calendarId);
                        if (!hasCalendar) return account;
                        
                        return {
                            ...account,
                            calendars: account.calendars.map(cal =>
                                cal.id === calendarId
                                    ? { ...cal, isSelected: !cal.isSelected }
                                    : cal
                            ),
                        };
                    });
                    
                    return {
                        accounts: newAccounts,
                        connections: buildConnectionsFromAccounts(newAccounts),
                    };
                });
            },
            
            selectAllCalendars: (provider: CalendarProvider, selected: boolean, accountId?: string) => {
                set((state) => {
                    const newAccounts = state.accounts.map(account => {
                        if (account.provider !== provider) return account;
                        if (accountId && account.id !== accountId) return account;
                        
                        return {
                            ...account,
                            calendars: account.calendars.map(cal => ({
                                ...cal,
                                isSelected: selected,
                            })),
                        };
                    });
                    
                    return {
                        accounts: newAccounts,
                        connections: buildConnectionsFromAccounts(newAccounts),
                    };
                });
            },
            
            setCalendarAlias: (provider: CalendarProvider, calendarId: string, alias: string, contextColor?: string, accountId?: string) => {
                set((state) => {
                    const newAccounts = state.accounts.map(account => {
                        if (account.provider !== provider) return account;
                        if (accountId && account.id !== accountId) return account;
                        
                        const hasCalendar = account.calendars.some(c => c.id === calendarId);
                        if (!hasCalendar) return account;
                        
                        return {
                            ...account,
                            calendars: account.calendars.map(cal =>
                                cal.id === calendarId
                                    ? { ...cal, alias, contextColor: contextColor || cal.contextColor }
                                    : cal
                            ),
                        };
                    });
                    
                    return {
                        accounts: newAccounts,
                        connections: buildConnectionsFromAccounts(newAccounts),
                    };
                });
            },
            
            getCalendarById: (provider: CalendarProvider, calendarId: string, accountId?: string) => {
                const { accounts } = get();
                for (const account of accounts) {
                    if (account.provider !== provider) continue;
                    if (accountId && account.id !== accountId) continue;
                    
                    const calendar = account.calendars.find(c => c.id === calendarId);
                    if (calendar) return calendar;
                }
                return undefined;
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
                        // Find calendar in accounts
                        let calendar: ExternalCalendar | undefined;
                        for (const account of state.accounts) {
                            if (account.provider === event.provider) {
                                calendar = account.calendars.find(c => c.id === event.calendarId);
                                if (calendar) break;
                            }
                        }
                        
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
            
            clearProviderEvents: (provider: CalendarProvider, accountId?: string) => {
                set((state) => ({
                    externalEvents: state.externalEvents.filter((event) => {
                        if (accountId) {
                            return event.accountId !== accountId;
                        }
                        return event.provider !== provider;
                    }),
                }));
            },
            
            // ================================================================
            // Sync Actions
            // ================================================================
            
            startSync: (provider?: CalendarProvider, accountId?: string) => {
                set((state) => {
                    if (accountId) {
                        // Sync specific account
                        const newAccounts = state.accounts.map(a =>
                            a.id === accountId
                                ? { ...a, syncStatus: 'syncing' as SyncStatus }
                                : a
                        );
                        return {
                            accounts: newAccounts,
                            connections: buildConnectionsFromAccounts(newAccounts),
                        };
                    }
                    
                    if (provider) {
                        // Sync all accounts for provider
                        const newAccounts = state.accounts.map(a =>
                            a.provider === provider && a.status === 'connected'
                                ? { ...a, syncStatus: 'syncing' as SyncStatus }
                                : a
                        );
                        return {
                            accounts: newAccounts,
                            connections: buildConnectionsFromAccounts(newAccounts),
                        };
                    }
                    
                    // Global sync - all connected accounts
                    const newAccounts = state.accounts.map(a =>
                        a.status === 'connected'
                            ? { ...a, syncStatus: 'syncing' as SyncStatus }
                            : a
                    );
                    
                    return {
                        accounts: newAccounts,
                        connections: buildConnectionsFromAccounts(newAccounts),
                        isGlobalSyncing: true,
                    };
                });
            },
            
            completeSync: (provider: CalendarProvider, success: boolean, error?: string, accountId?: string) => {
                const now = new Date().toISOString();
                
                set((state) => {
                    const newAccounts = state.accounts.map(a => {
                        if (accountId && a.id !== accountId) return a;
                        if (!accountId && a.provider !== provider) return a;
                        
                        return {
                            ...a,
                            syncStatus: (success ? 'success' : 'error') as SyncStatus,
                            lastSyncAt: success ? now : a.lastSyncAt,
                            errorMessage: error,
                        };
                    });
                    
                    return {
                        accounts: newAccounts,
                        connections: buildConnectionsFromAccounts(newAccounts),
                    };
                });
                
                // Check if all accounts finished syncing
                setTimeout(() => {
                    const { accounts } = get();
                    const allFinished = accounts.every(
                        (a) => a.status !== 'connected' || a.syncStatus !== 'syncing'
                    );
                    
                    if (allFinished) {
                        set({ isGlobalSyncing: false, lastGlobalSyncAt: now });
                    }
                }, 100);
            },
            
            updateLastSyncTime: (provider?: CalendarProvider, accountId?: string) => {
                const now = new Date().toISOString();
                
                set((state) => {
                    if (accountId) {
                        const newAccounts = state.accounts.map(a =>
                            a.id === accountId
                                ? { ...a, lastSyncAt: now }
                                : a
                        );
                        return {
                            accounts: newAccounts,
                            connections: buildConnectionsFromAccounts(newAccounts),
                        };
                    }
                    
                    if (provider) {
                        const newAccounts = state.accounts.map(a =>
                            a.provider === provider
                                ? { ...a, lastSyncAt: now }
                                : a
                        );
                        return {
                            accounts: newAccounts,
                            connections: buildConnectionsFromAccounts(newAccounts),
                        };
                    }
                    
                    return { lastGlobalSyncAt: now };
                });
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
            name: 'kaiz-calendar-sync-storage-v2',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                // Persist accounts (without tokens)
                accounts: state.accounts.map(account => ({
                    ...account,
                    accessToken: undefined,
                    refreshToken: undefined,
                })),
                externalEvents: state.externalEvents,
                syncSettings: state.syncSettings,
                lastGlobalSyncAt: state.lastGlobalSyncAt,
            }),
            // Migration from v1 to v2
            migrate: (persistedState: any, version: number) => {
                if (version === 0 || !persistedState.accounts) {
                    // Migrate from old connections-based storage to accounts-based
                    const oldConnections = persistedState.connections as Record<CalendarProvider, ProviderConnection> | undefined;
                    if (oldConnections) {
                        const migratedAccounts: ProviderAccount[] = [];
                        
                        (['apple', 'google', 'microsoft'] as CalendarProvider[]).forEach(provider => {
                            const conn = oldConnections[provider];
                            if (conn && conn.status === 'connected') {
                                migratedAccounts.push({
                                    id: conn.accountEmail || provider,
                                    provider,
                                    status: conn.status,
                                    accountEmail: conn.accountEmail,
                                    accountName: conn.accountName,
                                    connectedAt: conn.connectedAt,
                                    lastSyncAt: conn.lastSyncAt,
                                    syncStatus: conn.syncStatus,
                                    errorMessage: conn.errorMessage,
                                    calendars: conn.calendars.map(c => ({ ...c, accountId: conn.accountEmail || provider })),
                                });
                            }
                        });
                        
                        return {
                            ...persistedState,
                            accounts: migratedAccounts,
                        };
                    }
                }
                return persistedState;
            },
            version: 1,
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
