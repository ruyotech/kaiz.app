import { logger } from '../utils/logger';
/**
 * useCalendarSync.ts - Calendar Sync Custom Hook for Kaiz 
 * 
 * Provides a clean interface for calendar sync operations including:
 * - Connect/disconnect providers
 * - Manual and auto sync
 * - Capacity calculations
 * - Background sync scheduling
 * 
 * Privacy: Read-only access only. Never writes to external calendars.
 * 
 * @author Kaiz Team
 * @version 1.0.0
 */

import { useCallback, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useCalendarSyncStore, type CalendarProvider } from '../store/calendarSyncStore';
import { calendarSyncService } from '../services/calendarSyncService';

// ============================================================================
// Types
// ============================================================================

interface UseCalendarSyncReturn {
    // State
    isConnected: (provider: CalendarProvider) => boolean;
    isSyncing: boolean;
    connectedProviders: CalendarProvider[];
    lastSyncTime: string | null;
    blockedHoursForDate: (date: string) => number;
    blockedHoursForWeek: (weekStartDate: string) => number;
    
    // Actions
    connectProvider: (provider: CalendarProvider) => Promise<boolean>;
    disconnectProvider: (provider: CalendarProvider) => Promise<void>;
    syncProvider: (provider: CalendarProvider) => Promise<boolean>;
    syncAll: () => Promise<void>;
    refreshCalendars: (provider: CalendarProvider) => Promise<void>;
    
    // Capacity
    getAdjustedCapacity: (baseCapacity: number, weekStartDate: string) => number;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useCalendarSync(): UseCalendarSyncReturn {
    const {
        connections,
        syncSettings,
        isGlobalSyncing,
        lastGlobalSyncAt,
        getConnectedProviders,
        getBlockedHoursForDate,
        getTotalBlockedHoursForWeek,
        initiateConnection,
        completeConnection,
        disconnectProvider: storeDisconnectProvider,
        setConnectionError,
        setCalendars,
        startSync,
        completeSync,
        clearProviderEvents,
        addEvents,
    } = useCalendarSyncStore();
    
    // Background sync interval ref
    const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
    
    // ========================================================================
    // State Selectors
    // ========================================================================
    
    const isConnected = useCallback(
        (provider: CalendarProvider) => connections[provider].status === 'connected',
        [connections]
    );
    
    const connectedProviders = getConnectedProviders();
    
    // ========================================================================
    // Provider Actions
    // ========================================================================
    
    const connectProvider = useCallback(
        async (provider: CalendarProvider): Promise<boolean> => {
            initiateConnection(provider);
            
            try {
                const result = await calendarSyncService.connectProvider(provider);
                
                if (result.success) {
                    completeConnection(provider, {
                        accountEmail: result.accountEmail,
                        accountName: result.accountName,
                        calendars: result.calendars || [],
                    });
                    
                    // Auto-sync after successful connection
                    if (result.calendars && result.calendars.length > 0) {
                        await syncProviderInternal(provider);
                    }
                    
                    return true;
                } else {
                    setConnectionError(provider, result.error || 'Connection failed');
                    return false;
                }
            } catch (error) {
                setConnectionError(
                    provider,
                    error instanceof Error ? error.message : 'Unknown error'
                );
                return false;
            }
        },
        [initiateConnection, completeConnection, setConnectionError]
    );
    
    const disconnectProvider = useCallback(
        async (provider: CalendarProvider): Promise<void> => {
            await calendarSyncService.disconnectProvider(provider);
            storeDisconnectProvider(provider);
        },
        [storeDisconnectProvider]
    );
    
    // ========================================================================
    // Sync Actions
    // ========================================================================
    
    const syncProviderInternal = async (provider: CalendarProvider): Promise<boolean> => {
        const connection = connections[provider];
        logger.log(`[useCalendarSync] syncProviderInternal called for ${provider}`);
        logger.log(`[useCalendarSync] Connection status:`, connection.status);
        
        if (connection.status !== 'connected') return false;
        
        startSync(provider);
        
        try {
            const selectedCalendarIds = connection.calendars
                .filter((c) => c.isSelected)
                .map((c) => c.id);
            
            logger.log(`[useCalendarSync] Selected calendar IDs:`, selectedCalendarIds);
            
            if (selectedCalendarIds.length === 0) {
                logger.log(`[useCalendarSync] No calendars selected, skipping sync`);
                completeSync(provider, true);
                return true;
            }
            
            // Clear old events from this provider
            clearProviderEvents(provider);
            
            // Fetch new events
            logger.log(`[useCalendarSync] Fetching events for range: ${syncSettings.syncRangeDays} days`);
            const events = await calendarSyncService.syncProviderEvents(
                provider,
                selectedCalendarIds,
                syncSettings.syncRangeDays
            );
            
            logger.log(`[useCalendarSync] Fetched ${events.length} events:`, events);
            
            addEvents(events);
            logger.log(`[useCalendarSync] Events added to store`);
            completeSync(provider, true);
            return true;
        } catch (error) {
            completeSync(
                provider,
                false,
                error instanceof Error ? error.message : 'Sync failed'
            );
            return false;
        }
    };
    
    const syncProvider = useCallback(
        async (provider: CalendarProvider): Promise<boolean> => {
            return syncProviderInternal(provider);
        },
        [connections, syncSettings, startSync, completeSync, clearProviderEvents, addEvents]
    );
    
    const syncAll = useCallback(async (): Promise<void> => {
        const providers: CalendarProvider[] = ['apple', 'google', 'microsoft'];
        
        for (const provider of providers) {
            if (connections[provider].status === 'connected') {
                await syncProviderInternal(provider);
            }
        }
    }, [connections]);
    
    const refreshCalendars = useCallback(
        async (provider: CalendarProvider): Promise<void> => {
            try {
                let calendars;
                
                switch (provider) {
                    case 'apple':
                        const appleResult = await calendarSyncService.connectAppleCalendar();
                        calendars = appleResult.calendars;
                        break;
                    case 'google':
                        calendars = await calendarSyncService.fetchGoogleCalendars();
                        break;
                    case 'microsoft':
                        calendars = await calendarSyncService.fetchMicrosoftCalendars();
                        break;
                }
                
                if (calendars) {
                    // Preserve selection state for existing calendars
                    const existingCalendars = connections[provider].calendars;
                    const updatedCalendars = calendars.map((cal) => {
                        const existing = existingCalendars.find((e) => e.id === cal.id);
                        return existing ? { ...cal, isSelected: existing.isSelected } : cal;
                    });
                    
                    setCalendars(provider, updatedCalendars);
                }
            } catch (error) {
                logger.error(`Error refreshing calendars for ${provider}:`, error);
            }
        },
        [connections, setCalendars]
    );
    
    // ========================================================================
    // Capacity Calculations
    // ========================================================================
    
    const blockedHoursForDate = useCallback(
        (date: string) => getBlockedHoursForDate(date),
        [getBlockedHoursForDate]
    );
    
    const blockedHoursForWeek = useCallback(
        (weekStartDate: string) => getTotalBlockedHoursForWeek(weekStartDate),
        [getTotalBlockedHoursForWeek]
    );
    
    const getAdjustedCapacity = useCallback(
        (baseCapacity: number, weekStartDate: string): number => {
            if (!syncSettings.autoAdjustCapacity) {
                return baseCapacity;
            }
            
            const blockedHours = getTotalBlockedHoursForWeek(weekStartDate);
            const adjustedCapacity = Math.max(0, baseCapacity - blockedHours);
            
            return adjustedCapacity;
        },
        [syncSettings.autoAdjustCapacity, getTotalBlockedHoursForWeek]
    );
    
    // ========================================================================
    // Background Sync
    // ========================================================================
    
    useEffect(() => {
        if (!syncSettings.autoSyncEnabled || connectedProviders.length === 0) {
            // Clear existing interval if auto-sync disabled
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
                syncIntervalRef.current = null;
            }
            return;
        }
        
        // Set up background sync interval
        const intervalMs = syncSettings.syncFrequencyMinutes * 60 * 1000;
        
        syncIntervalRef.current = setInterval(() => {
            syncAll();
        }, intervalMs) as unknown as NodeJS.Timeout;
        
        return () => {
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
                syncIntervalRef.current = null;
            }
        };
    }, [
        syncSettings.autoSyncEnabled,
        syncSettings.syncFrequencyMinutes,
        connectedProviders.length,
        syncAll,
    ]);
    
    // Sync on app foreground
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (
                nextAppState === 'active' &&
                syncSettings.autoSyncEnabled &&
                connectedProviders.length > 0
            ) {
                // Check if enough time has passed since last sync
                if (lastGlobalSyncAt) {
                    const lastSync = new Date(lastGlobalSyncAt);
                    const minSyncInterval = Math.min(syncSettings.syncFrequencyMinutes, 15) * 60 * 1000;
                    
                    if (Date.now() - lastSync.getTime() > minSyncInterval) {
                        syncAll();
                    }
                } else {
                    syncAll();
                }
            }
        };
        
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        
        return () => {
            subscription.remove();
        };
    }, [
        syncSettings.autoSyncEnabled,
        syncSettings.syncFrequencyMinutes,
        connectedProviders.length,
        lastGlobalSyncAt,
        syncAll,
    ]);
    
    // ========================================================================
    // Return
    // ========================================================================
    
    return {
        // State
        isConnected,
        isSyncing: isGlobalSyncing,
        connectedProviders,
        lastSyncTime: lastGlobalSyncAt,
        blockedHoursForDate,
        blockedHoursForWeek,
        
        // Actions
        connectProvider,
        disconnectProvider,
        syncProvider,
        syncAll,
        refreshCalendars,
        
        // Capacity
        getAdjustedCapacity,
    };
}

export default useCalendarSync;
