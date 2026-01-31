/**
 * IntegrationsScreen.tsx - External Calendar Integrations for Kaiz LifeOS
 * 
 * A modern, user-friendly screen for managing read-only calendar integrations.
 * Supports Apple Calendar, Google Calendar, and Microsoft Outlook.
 * 
 * Privacy Notice: "Read-only. We never write to your calendars."
 * 
 * Features:
 * - Connect/disconnect calendar providers
 * - Select which calendars to import
 * - Manual "Sync Now" and auto-sync settings
 * - Last sync timestamp display
 * - Sprint capacity adjustment toggle
 * 
 * @author Kaiz Team
 * @version 1.0.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    Modal,
    ActivityIndicator,
    RefreshControl,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Stores
import {
    useCalendarSyncStore,
    CALENDAR_PROVIDERS,
    formatLastSyncTime,
    getSyncFrequencyLabel,
    type CalendarProvider,
    type ExternalCalendar,
} from '../../../store/calendarSyncStore';

// Services
import { calendarSyncService } from '../../../services/calendarSyncService';

// Hooks
import { useTranslation } from '../../../hooks/useTranslation';

// ============================================================================
// Types
// ============================================================================

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Privacy notice banner
 */
function PrivacyBanner() {
    return (
        <View className="mx-4 mb-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3">
                    <MaterialCommunityIcons name="shield-check" size={18} color="#3B82F6" />
                </View>
                <Text className="text-blue-800 font-semibold text-base">Privacy Protected</Text>
            </View>
            <Text className="text-blue-700 text-sm leading-5">
                Read-only access only. We never write to, modify, or share your calendar data.
                Your events are used solely to show blocked time and adjust sprint capacity.
            </Text>
        </View>
    );
}

/**
 * Development build required banner
 */
function DevBuildRequiredBanner() {
    return (
        <View className="mx-4 mb-4 p-4 bg-amber-50 rounded-2xl border border-amber-200">
            <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 rounded-full bg-amber-100 items-center justify-center mr-3">
                    <MaterialCommunityIcons name="alert-outline" size={18} color="#D97706" />
                </View>
                <Text className="text-amber-800 font-semibold text-base">Development Build Required</Text>
            </View>
            <Text className="text-amber-700 text-sm leading-5">
                Calendar integrations require native device access which isn't available in Expo Go.
                {'\n\n'}
                To use this feature, please create a development build:
            </Text>
            <View className="mt-3 p-3 bg-amber-100 rounded-xl">
                <Text className="text-amber-900 text-xs font-mono">npx expo run:ios</Text>
                <Text className="text-amber-600 text-xs mt-1">or</Text>
                <Text className="text-amber-900 text-xs font-mono">npx expo run:android</Text>
            </View>
        </View>
    );
}

/**
 * Provider connection card
 */
function ProviderCard({
    provider,
    onConnect,
    onDisconnect,
    onManageCalendars,
    onSync,
}: {
    provider: CalendarProvider;
    onConnect: () => void;
    onDisconnect: () => void;
    onManageCalendars: () => void;
    onSync: () => void;
}) {
    const config = CALENDAR_PROVIDERS[provider];
    const connection = useCalendarSyncStore((s) => s.connections[provider]);
    const isConnected = connection.status === 'connected';
    const isConnecting = connection.status === 'connecting';
    const isSyncing = connection.syncStatus === 'syncing';
    const hasError = connection.status === 'error';
    
    const selectedCount = connection.calendars.filter((c) => c.isSelected).length;
    const totalCount = connection.calendars.length;
    
    return (
        <View className="bg-white rounded-2xl mb-3 overflow-hidden border border-gray-100 shadow-sm">
            {/* Provider Header */}
            <View className="flex-row items-center p-4 border-b border-gray-50">
                {/* Icon */}
                <View
                    className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: config.bgColor }}
                >
                    <MaterialCommunityIcons
                        name={config.icon as IconName}
                        size={26}
                        color={config.color}
                    />
                </View>
                
                {/* Info */}
                <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">{config.name}</Text>
                    <Text className="text-sm text-gray-500">{config.description}</Text>
                </View>
                
                {/* Status Badge / Connect Button */}
                {isConnected ? (
                    <View className="bg-green-50 px-3 py-1.5 rounded-full flex-row items-center">
                        <View className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
                        <Text className="text-green-700 text-xs font-medium">Connected</Text>
                    </View>
                ) : isConnecting ? (
                    <View className="bg-blue-50 px-3 py-1.5 rounded-full flex-row items-center">
                        <ActivityIndicator size="small" color="#3B82F6" />
                        <Text className="text-blue-700 text-xs font-medium ml-1.5">Connecting...</Text>
                    </View>
                ) : hasError ? (
                    <TouchableOpacity
                        onPress={onConnect}
                        className="bg-red-50 px-3 py-1.5 rounded-full"
                    >
                        <Text className="text-red-700 text-xs font-medium">Retry</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={onConnect}
                        className="bg-blue-500 px-4 py-2 rounded-full"
                        activeOpacity={0.8}
                    >
                        <Text className="text-white text-sm font-semibold">Connect</Text>
                    </TouchableOpacity>
                )}
            </View>
            
            {/* Error Message */}
            {hasError && connection.errorMessage && (
                <View className="px-4 py-3 bg-red-50">
                    <Text className="text-red-600 text-sm">{connection.errorMessage}</Text>
                </View>
            )}
            
            {/* Connected State - Account & Calendars */}
            {isConnected && (
                <>
                    {/* Account Info */}
                    {connection.accountEmail && (
                        <View className="px-4 py-3 flex-row items-center border-b border-gray-50">
                            <MaterialCommunityIcons name="account-circle-outline" size={18} color="#6B7280" />
                            <Text className="ml-2 text-sm text-gray-600 flex-1" numberOfLines={1}>
                                {connection.accountEmail}
                            </Text>
                        </View>
                    )}
                    
                    {/* Calendars Row */}
                    <TouchableOpacity
                        onPress={onManageCalendars}
                        className="px-4 py-3 flex-row items-center justify-between border-b border-gray-50"
                        activeOpacity={0.7}
                    >
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons name="calendar-multiple" size={18} color="#6B7280" />
                            <Text className="ml-2 text-sm text-gray-700">Calendars</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-sm text-gray-500 mr-2">
                                {selectedCount} of {totalCount} selected
                            </Text>
                            <MaterialCommunityIcons name="chevron-right" size={20} color="#C7C7CC" />
                        </View>
                    </TouchableOpacity>
                    
                    {/* Last Sync & Actions Row */}
                    <View className="px-4 py-3 flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons name="sync" size={16} color="#9CA3AF" />
                            <Text className="ml-1.5 text-xs text-gray-500">
                                Last sync: {formatLastSyncTime(connection.lastSyncAt)}
                            </Text>
                        </View>
                        
                        <View className="flex-row items-center">
                            {/* Sync Button */}
                            <TouchableOpacity
                                onPress={onSync}
                                disabled={isSyncing}
                                className="mr-3 flex-row items-center"
                                activeOpacity={0.7}
                            >
                                {isSyncing ? (
                                    <ActivityIndicator size="small" color="#3B82F6" />
                                ) : (
                                    <>
                                        <MaterialCommunityIcons name="refresh" size={16} color="#3B82F6" />
                                        <Text className="ml-1 text-sm text-blue-500 font-medium">Sync</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                            
                            {/* Disconnect Button */}
                            <TouchableOpacity onPress={onDisconnect} activeOpacity={0.7}>
                                <Text className="text-sm text-red-500 font-medium">Disconnect</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
            )}
        </View>
    );
}

/**
 * Calendar selection modal
 */
function CalendarSelectionModal({
    visible,
    onClose,
    provider,
}: {
    visible: boolean;
    onClose: () => void;
    provider: CalendarProvider | null;
}) {
    const connection = useCalendarSyncStore((s) =>
        provider ? s.connections[provider] : null
    );
    const toggleCalendarSelection = useCalendarSyncStore((s) => s.toggleCalendarSelection);
    const selectAllCalendars = useCalendarSyncStore((s) => s.selectAllCalendars);
    
    if (!provider || !connection) return null;
    
    const config = CALENDAR_PROVIDERS[provider];
    const calendars = connection.calendars;
    const allSelected = calendars.every((c) => c.isSelected);
    const someSelected = calendars.some((c) => c.isSelected);
    
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <TouchableOpacity
                className="flex-1 bg-black/50 justify-end"
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                    className="bg-white rounded-t-3xl max-h-[80%]"
                >
                    {/* Handle */}
                    <View className="items-center pt-3 pb-2">
                        <View className="w-10 h-1 bg-gray-300 rounded-full" />
                    </View>
                    
                    {/* Header */}
                    <View className="flex-row justify-between items-center px-5 pb-4 border-b border-gray-100">
                        <View className="flex-row items-center">
                            <View
                                className="w-9 h-9 rounded-lg items-center justify-center mr-3"
                                style={{ backgroundColor: config.bgColor }}
                            >
                                <MaterialCommunityIcons
                                    name={config.icon as IconName}
                                    size={20}
                                    color={config.color}
                                />
                            </View>
                            <View>
                                <Text className="text-lg font-bold text-gray-900">Select Calendars</Text>
                                <Text className="text-xs text-gray-500">{config.name}</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose} className="p-1">
                            <MaterialCommunityIcons name="close" size={24} color="#8E8E93" />
                        </TouchableOpacity>
                    </View>
                    
                    {/* Select All */}
                    <TouchableOpacity
                        onPress={() => selectAllCalendars(provider, !allSelected)}
                        className="flex-row items-center px-5 py-4 border-b border-gray-100"
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons
                            name={allSelected ? 'checkbox-marked' : someSelected ? 'minus-box' : 'checkbox-blank-outline'}
                            size={24}
                            color={allSelected || someSelected ? '#3B82F6' : '#9CA3AF'}
                        />
                        <Text className="ml-3 text-base font-semibold text-gray-900">Select All</Text>
                    </TouchableOpacity>
                    
                    {/* Calendar List */}
                    <ScrollView className="px-5" bounces={false}>
                        {calendars.map((calendar, index) => (
                            <TouchableOpacity
                                key={calendar.id}
                                onPress={() => toggleCalendarSelection(provider, calendar.id)}
                                className={`flex-row items-center py-4 ${
                                    index < calendars.length - 1 ? 'border-b border-gray-100' : ''
                                }`}
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons
                                    name={calendar.isSelected ? 'checkbox-marked' : 'checkbox-blank-outline'}
                                    size={24}
                                    color={calendar.isSelected ? '#3B82F6' : '#9CA3AF'}
                                />
                                <View
                                    className="w-4 h-4 rounded-full mx-3"
                                    style={{ backgroundColor: calendar.color }}
                                />
                                <View className="flex-1">
                                    <Text className="text-base text-gray-900">{calendar.name}</Text>
                                    {calendar.isPrimary && (
                                        <Text className="text-xs text-gray-500">Primary</Text>
                                    )}
                                </View>
                                {calendar.accessLevel === 'owner' && (
                                    <MaterialCommunityIcons name="account" size={16} color="#9CA3AF" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    
                    {/* Done Button */}
                    <View className="px-5 py-4 border-t border-gray-100">
                        <TouchableOpacity
                            onPress={onClose}
                            className="bg-blue-500 rounded-xl py-4 items-center"
                            activeOpacity={0.8}
                        >
                            <Text className="text-white font-semibold text-base">Done</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {/* Safe area bottom padding */}
                    <View className="h-6" />
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

/**
 * Sync settings section
 */
function SyncSettingsSection() {
    const {
        syncSettings,
        updateSyncSettings,
        isGlobalSyncing,
        lastGlobalSyncAt,
    } = useCalendarSyncStore();
    
    const [showFrequencyModal, setShowFrequencyModal] = useState(false);
    
    const frequencyOptions = [
        { value: 15, label: 'Every 15 minutes' },
        { value: 30, label: 'Every 30 minutes' },
        { value: 60, label: 'Hourly' },
        { value: 120, label: 'Every 2 hours' },
        { value: 360, label: 'Every 6 hours' },
        { value: 720, label: 'Every 12 hours' },
        { value: 1440, label: 'Daily' },
    ];
    
    return (
        <View className="mx-4 mb-6">
            <View className="flex-row items-center mb-2.5 px-1">
                <Text className="text-base mr-1.5">⚙️</Text>
                <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Sync Settings
                </Text>
            </View>
            
            <View className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                {/* Auto-sync toggle */}
                <View className="flex-row items-center px-4 py-3.5 border-b border-gray-100">
                    <View className="w-9 h-9 rounded-xl bg-green-50 items-center justify-center mr-3">
                        <MaterialCommunityIcons name="sync-circle" size={20} color="#10B981" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[15px] font-medium text-gray-900">Auto-sync</Text>
                        <Text className="text-xs text-gray-500">Sync calendars in the background</Text>
                    </View>
                    <Switch
                        value={syncSettings.autoSyncEnabled}
                        onValueChange={(value) => updateSyncSettings({ autoSyncEnabled: value })}
                        trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                        thumbColor="#FFFFFF"
                        ios_backgroundColor="#E5E5EA"
                    />
                </View>
                
                {/* Sync frequency */}
                {syncSettings.autoSyncEnabled && (
                    <TouchableOpacity
                        onPress={() => setShowFrequencyModal(true)}
                        className="flex-row items-center px-4 py-3.5 border-b border-gray-100"
                        activeOpacity={0.7}
                    >
                        <View className="w-9 h-9 rounded-xl bg-blue-50 items-center justify-center mr-3">
                            <MaterialCommunityIcons name="timer-outline" size={20} color="#3B82F6" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[15px] font-medium text-gray-900">Sync Frequency</Text>
                        </View>
                        <Text className="text-sm text-gray-500 mr-2">
                            {getSyncFrequencyLabel(syncSettings.syncFrequencyMinutes)}
                        </Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#C7C7CC" />
                    </TouchableOpacity>
                )}
                
                {/* Show as blocked time */}
                <View className="flex-row items-center px-4 py-3.5 border-b border-gray-100">
                    <View className="w-9 h-9 rounded-xl bg-gray-100 items-center justify-center mr-3">
                        <MaterialCommunityIcons name="calendar-blank" size={20} color="#6B7280" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[15px] font-medium text-gray-900">Show as Blocked Time</Text>
                        <Text className="text-xs text-gray-500">Display events with gray overlay</Text>
                    </View>
                    <Switch
                        value={syncSettings.showEventsAsBlockedTime}
                        onValueChange={(value) => updateSyncSettings({ showEventsAsBlockedTime: value })}
                        trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                        thumbColor="#FFFFFF"
                        ios_backgroundColor="#E5E5EA"
                    />
                </View>
                
                {/* Auto-adjust capacity */}
                <View className="flex-row items-center px-4 py-3.5">
                    <View className="w-9 h-9 rounded-xl bg-orange-50 items-center justify-center mr-3">
                        <MaterialCommunityIcons name="chart-line" size={20} color="#F59E0B" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[15px] font-medium text-gray-900">Auto-adjust Capacity</Text>
                        <Text className="text-xs text-gray-500">Adjust sprint capacity based on calendar</Text>
                    </View>
                    <Switch
                        value={syncSettings.autoAdjustCapacity}
                        onValueChange={(value) => updateSyncSettings({ autoAdjustCapacity: value })}
                        trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                        thumbColor="#FFFFFF"
                        ios_backgroundColor="#E5E5EA"
                    />
                </View>
            </View>
            
            {/* Last global sync info */}
            {lastGlobalSyncAt && (
                <View className="flex-row items-center justify-center mt-3 px-4">
                    <MaterialCommunityIcons name="check-circle" size={14} color="#10B981" />
                    <Text className="ml-1.5 text-xs text-gray-500">
                        All calendars synced {formatLastSyncTime(lastGlobalSyncAt)}
                    </Text>
                </View>
            )}
            
            {/* Frequency Selection Modal */}
            <Modal
                visible={showFrequencyModal}
                animationType="slide"
                transparent
                onRequestClose={() => setShowFrequencyModal(false)}
            >
                <TouchableOpacity
                    className="flex-1 bg-black/50 justify-end"
                    activeOpacity={1}
                    onPress={() => setShowFrequencyModal(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                        className="bg-white rounded-t-3xl"
                    >
                        <View className="items-center pt-3 pb-2">
                            <View className="w-10 h-1 bg-gray-300 rounded-full" />
                        </View>
                        
                        <View className="flex-row justify-between items-center px-5 pb-4 border-b border-gray-100">
                            <Text className="text-xl font-bold text-gray-900">Sync Frequency</Text>
                            <TouchableOpacity
                                onPress={() => setShowFrequencyModal(false)}
                                className="p-1"
                            >
                                <MaterialCommunityIcons name="close" size={24} color="#8E8E93" />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView className="px-5 py-4" bounces={false}>
                            {frequencyOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={option.value}
                                    onPress={() => {
                                        updateSyncSettings({ syncFrequencyMinutes: option.value });
                                        setShowFrequencyModal(false);
                                    }}
                                    className={`flex-row items-center py-4 ${
                                        index < frequencyOptions.length - 1 ? 'border-b border-gray-100' : ''
                                    }`}
                                >
                                    <Text className="flex-1 text-base text-gray-900">{option.label}</Text>
                                    {syncSettings.syncFrequencyMinutes === option.value && (
                                        <MaterialCommunityIcons name="check" size={22} color="#007AFF" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        
                        <View className="h-8" />
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

// ============================================================================
// Main Component
// ============================================================================

export default function IntegrationsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { t } = useTranslation();
    
    // Store
    const {
        connections,
        syncSettings,
        isGlobalSyncing,
        initiateConnection,
        completeConnection,
        disconnectProvider,
        setConnectionError,
        setCalendars,
        startSync,
        completeSync,
        clearProviderEvents,
        setExternalEvents,
        addEvents,
    } = useCalendarSyncStore();
    
    // Local state
    const [refreshing, setRefreshing] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<CalendarProvider | null>(null);
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [nativeAvailable, setNativeAvailable] = useState<boolean | null>(null);
    
    // Check if native modules are available
    useEffect(() => {
        calendarSyncService.isAvailable().then(setNativeAvailable);
    }, []);
    
    // ========================================================================
    // Handlers
    // ========================================================================
    
    const handleConnect = useCallback(async (provider: CalendarProvider) => {
        initiateConnection(provider);
        
        try {
            const result = await calendarSyncService.connectProvider(provider);
            
            if (result.success) {
                completeConnection(provider, {
                    accountEmail: result.accountEmail,
                    accountName: result.accountName,
                    calendars: result.calendars || [],
                });
                
                // Auto-sync after connection
                if (result.calendars && result.calendars.length > 0) {
                    handleSyncProvider(provider);
                }
            } else {
                setConnectionError(provider, result.error || 'Connection failed');
            }
        } catch (error) {
            setConnectionError(
                provider,
                error instanceof Error ? error.message : 'Unknown error'
            );
        }
    }, [initiateConnection, completeConnection, setConnectionError]);
    
    const handleDisconnect = useCallback((provider: CalendarProvider) => {
        const config = CALENDAR_PROVIDERS[provider];
        
        Alert.alert(
            `Disconnect ${config.name}?`,
            'Your calendar events will no longer be synced. You can reconnect anytime.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Disconnect',
                    style: 'destructive',
                    onPress: async () => {
                        await calendarSyncService.disconnectProvider(provider);
                        disconnectProvider(provider);
                    },
                },
            ]
        );
    }, [disconnectProvider]);
    
    const handleManageCalendars = useCallback((provider: CalendarProvider) => {
        setSelectedProvider(provider);
        setShowCalendarModal(true);
    }, []);
    
    const handleSyncProvider = useCallback(async (provider: CalendarProvider) => {
        const connection = connections[provider];
        if (connection.status !== 'connected') return;
        
        startSync(provider);
        
        try {
            const selectedCalendarIds = connection.calendars
                .filter((c) => c.isSelected)
                .map((c) => c.id);
            
            if (selectedCalendarIds.length === 0) {
                completeSync(provider, true);
                return;
            }
            
            // Clear old events from this provider
            clearProviderEvents(provider);
            
            // Fetch new events
            const events = await calendarSyncService.syncProviderEvents(
                provider,
                selectedCalendarIds,
                syncSettings.syncRangeDays
            );
            
            addEvents(events);
            completeSync(provider, true);
        } catch (error) {
            completeSync(
                provider,
                false,
                error instanceof Error ? error.message : 'Sync failed'
            );
        }
    }, [connections, syncSettings, startSync, completeSync, clearProviderEvents, addEvents]);
    
    const handleSyncAll = useCallback(async () => {
        setRefreshing(true);
        
        const providers: CalendarProvider[] = ['apple', 'google', 'microsoft'];
        
        for (const provider of providers) {
            if (connections[provider].status === 'connected') {
                await handleSyncProvider(provider);
            }
        }
        
        setRefreshing(false);
    }, [connections, handleSyncProvider]);
    
    const handleRefresh = useCallback(() => {
        handleSyncAll();
    }, [handleSyncAll]);
    
    // ========================================================================
    // Render
    // ========================================================================
    
    const connectedCount = Object.values(connections).filter(
        (c) => c.status === 'connected'
    ).length;
    
    return (
        <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#374151" />
                </TouchableOpacity>
                
                <View className="items-center">
                    <Text className="text-lg font-bold text-gray-900">Calendar Integrations</Text>
                    <Text className="text-xs text-gray-500">
                        {connectedCount > 0 ? `${connectedCount} connected` : 'Connect your calendars'}
                    </Text>
                </View>
                
                {/* Sync All Button */}
                <TouchableOpacity
                    onPress={handleSyncAll}
                    disabled={isGlobalSyncing || connectedCount === 0}
                    className={`w-10 h-10 items-center justify-center rounded-full ${
                        connectedCount > 0 ? 'bg-blue-50' : 'bg-gray-100'
                    }`}
                    activeOpacity={0.7}
                >
                    {isGlobalSyncing ? (
                        <ActivityIndicator size="small" color="#3B82F6" />
                    ) : (
                        <MaterialCommunityIcons
                            name="refresh"
                            size={22}
                            color={connectedCount > 0 ? '#3B82F6' : '#9CA3AF'}
                        />
                    )}
                </TouchableOpacity>
            </View>
            
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor="#3B82F6"
                    />
                }
            >
                {/* Dev Build Required Banner (when native modules unavailable) */}
                {nativeAvailable === false && (
                    <View className="pt-4">
                        <DevBuildRequiredBanner />
                    </View>
                )}
                
                {/* Privacy Banner */}
                <View className={nativeAvailable === false ? '' : 'pt-4'}>
                    <PrivacyBanner />
                </View>
                
                {/* Providers Section */}
                <View className="px-4 mb-6">
                    <View className="flex-row items-center mb-2.5 px-1">
                        <Text className="text-base mr-1.5">📅</Text>
                        <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Calendar Providers
                        </Text>
                    </View>
                    
                    {/* Apple Calendar */}
                    {Platform.OS === 'ios' && (
                        <ProviderCard
                            provider="apple"
                            onConnect={() => handleConnect('apple')}
                            onDisconnect={() => handleDisconnect('apple')}
                            onManageCalendars={() => handleManageCalendars('apple')}
                            onSync={() => handleSyncProvider('apple')}
                        />
                    )}
                    
                    {/* Google Calendar */}
                    <ProviderCard
                        provider="google"
                        onConnect={() => handleConnect('google')}
                        onDisconnect={() => handleDisconnect('google')}
                        onManageCalendars={() => handleManageCalendars('google')}
                        onSync={() => handleSyncProvider('google')}
                    />
                    
                    {/* Microsoft Outlook */}
                    <ProviderCard
                        provider="microsoft"
                        onConnect={() => handleConnect('microsoft')}
                        onDisconnect={() => handleDisconnect('microsoft')}
                        onManageCalendars={() => handleManageCalendars('microsoft')}
                        onSync={() => handleSyncProvider('microsoft')}
                    />
                </View>
                
                {/* Sync Settings */}
                <SyncSettingsSection />
                
                {/* Info Footer */}
                <View className="mx-4 px-4 py-4 bg-gray-100 rounded-2xl">
                    <View className="flex-row items-start">
                        <MaterialCommunityIcons
                            name="information-outline"
                            size={18}
                            color="#6B7280"
                            style={{ marginTop: 2 }}
                        />
                        <View className="flex-1 ml-3">
                            <Text className="text-sm text-gray-700 leading-5">
                                Calendar events are synced {syncSettings.syncRangeDays} days ahead.
                                Events appear as blocked time in your sprint calendar and are used
                                to calculate your available capacity.
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
            
            {/* Calendar Selection Modal */}
            <CalendarSelectionModal
                visible={showCalendarModal}
                onClose={() => {
                    setShowCalendarModal(false);
                    // Trigger sync after calendar selection changes
                    if (selectedProvider) {
                        handleSyncProvider(selectedProvider);
                    }
                }}
                provider={selectedProvider}
            />
        </View>
    );
}
