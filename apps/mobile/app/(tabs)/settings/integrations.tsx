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

// Components
import { CalendarAliasModal } from '../../../components/calendar/CalendarAliasModal';

// Stores
import {
    useCalendarSyncStore,
    CALENDAR_PROVIDERS,
    formatLastSyncTime,
    getSyncFrequencyLabel,
    type CalendarProvider,
    type ExternalCalendar,
    type ProviderAccount,
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
 * Provider connection card - Multi-account version
 */
function ProviderCard({
    provider,
    onConnect,
    onDisconnect,
    onManageCalendars,
    onSync,
}: {
    provider: CalendarProvider;
    onConnect: (accountId?: string) => void;
    onDisconnect: (accountId?: string) => void;
    onManageCalendars: (accountId?: string) => void;
    onSync: (accountId?: string) => void;
}) {
    const config = CALENDAR_PROVIDERS[provider];
    // Use stable selector to avoid infinite re-renders
    const allAccounts = useCalendarSyncStore((s) => s.accounts);
    const accounts = React.useMemo(
        () => allAccounts.filter(a => a.provider === provider),
        [allAccounts, provider]
    );
    
    // Memoize all computed values to prevent unnecessary re-renders
    const { connectedAccounts, connectingAccounts, hasError, isConnected, isConnecting, isSyncing, totalCalendars, selectedCalendars } = React.useMemo(() => {
        const connected = accounts.filter(a => a.status === 'connected');
        const connecting = accounts.filter(a => a.status === 'connecting');
        return {
            connectedAccounts: connected,
            connectingAccounts: connecting,
            hasError: accounts.some(a => a.status === 'error'),
            isConnected: connected.length > 0,
            isConnecting: connecting.length > 0,
            isSyncing: accounts.some(a => a.syncStatus === 'syncing'),
            totalCalendars: accounts.reduce((sum, a) => sum + a.calendars.length, 0),
            selectedCalendars: accounts.reduce((sum, a) => sum + a.calendars.filter(c => c.isSelected).length, 0),
        };
    }, [accounts]);
    
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
                        <Text className="text-green-700 text-xs font-medium">
                            {connectedAccounts.length} {connectedAccounts.length === 1 ? 'account' : 'accounts'}
                        </Text>
                    </View>
                ) : isConnecting ? (
                    <View className="bg-blue-50 px-3 py-1.5 rounded-full flex-row items-center">
                        <ActivityIndicator size="small" color="#3B82F6" />
                        <Text className="text-blue-700 text-xs font-medium ml-1.5">Connecting...</Text>
                    </View>
                ) : hasError ? (
                    <TouchableOpacity
                        onPress={() => onConnect()}
                        className="bg-red-50 px-3 py-1.5 rounded-full"
                    >
                        <Text className="text-red-700 text-xs font-medium">Retry</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={() => onConnect()}
                        className="bg-blue-500 px-4 py-2 rounded-full"
                        activeOpacity={0.8}
                    >
                        <Text className="text-white text-sm font-semibold">Connect</Text>
                    </TouchableOpacity>
                )}
            </View>
            
            {/* Error Message from any account */}
            {hasError && accounts.find(a => a.errorMessage)?.errorMessage && (
                <View className="px-4 py-3 bg-red-50">
                    <Text className="text-red-600 text-sm">
                        {accounts.find(a => a.errorMessage)?.errorMessage}
                    </Text>
                </View>
            )}
            
            {/* Connected Accounts List */}
            {isConnected && (
                <>
                    {/* Account List */}
                    {connectedAccounts.map((account, index) => (
                        <View key={account.id} className={index > 0 ? 'border-t border-gray-100' : ''}>
                            {/* Account Email */}
                            <View className="px-4 py-3 flex-row items-center border-b border-gray-50 bg-gray-50/50">
                                <MaterialCommunityIcons name="account-circle-outline" size={18} color="#6B7280" />
                                <Text className="ml-2 text-sm text-gray-700 flex-1 font-medium" numberOfLines={1}>
                                    {account.accountEmail || account.accountName || 'Connected Account'}
                                </Text>
                                <TouchableOpacity 
                                    onPress={() => onDisconnect(account.id)} 
                                    activeOpacity={0.7}
                                    className="px-2 py-1"
                                >
                                    <Text className="text-xs text-red-500">Remove</Text>
                                </TouchableOpacity>
                            </View>
                            
                            {/* Calendars for this account */}
                            <TouchableOpacity
                                onPress={() => onManageCalendars(account.id)}
                                className="px-4 py-3 flex-row items-center justify-between border-b border-gray-50"
                                activeOpacity={0.7}
                            >
                                <View className="flex-row items-center pl-6">
                                    <MaterialCommunityIcons name="calendar-multiple" size={16} color="#9CA3AF" />
                                    <Text className="ml-2 text-sm text-gray-600">Calendars</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <Text className="text-sm text-gray-500 mr-2">
                                        {account.calendars.filter(c => c.isSelected).length} of {account.calendars.length}
                                    </Text>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color="#C7C7CC" />
                                </View>
                            </TouchableOpacity>
                            
                            {/* Last Sync for this account */}
                            <View className="px-4 py-2 flex-row items-center justify-between">
                                <View className="flex-row items-center pl-6">
                                    <MaterialCommunityIcons name="sync" size={14} color="#9CA3AF" />
                                    <Text className="ml-1.5 text-xs text-gray-500">
                                        Synced: {formatLastSyncTime(account.lastSyncAt)}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => onSync(account.id)}
                                    disabled={account.syncStatus === 'syncing'}
                                    className="flex-row items-center px-2 py-1"
                                    activeOpacity={0.7}
                                >
                                    {account.syncStatus === 'syncing' ? (
                                        <ActivityIndicator size="small" color="#3B82F6" />
                                    ) : (
                                        <>
                                            <MaterialCommunityIcons name="refresh" size={14} color="#3B82F6" />
                                            <Text className="ml-1 text-xs text-blue-500 font-medium">Sync</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                    
                    {/* Add Another Account Button */}
                    <TouchableOpacity
                        onPress={() => onConnect()}
                        className="px-4 py-3 flex-row items-center justify-center border-t border-gray-100"
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons name="plus-circle-outline" size={18} color="#3B82F6" />
                        <Text className="ml-2 text-sm text-blue-500 font-medium">Add Another Account</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
}

/**
 * Calendar selection modal with Life Context settings (multi-account support)
 */
function CalendarSelectionModal({
    visible,
    onClose,
    provider,
    accountId,
}: {
    visible: boolean;
    onClose: () => void;
    provider: CalendarProvider | null;
    accountId?: string;
}) {
    // Use stable selector to avoid infinite re-renders
    const allAccounts = useCalendarSyncStore((s) => s.accounts);
    const accounts = React.useMemo(
        () => provider ? allAccounts.filter(a => a.provider === provider) : [],
        [allAccounts, provider]
    );
    const toggleCalendarSelection = useCalendarSyncStore((s) => s.toggleCalendarSelection);
    const selectAllCalendars = useCalendarSyncStore((s) => s.selectAllCalendars);
    
    // If accountId is provided, show only that account's calendars
    // Otherwise show all accounts' calendars grouped
    const targetAccounts = React.useMemo(
        () => accountId 
            ? accounts.filter(a => a.id === accountId)
            : accounts.filter(a => a.status === 'connected'),
        [accounts, accountId]
    );
    
    // State for alias modal
    const [aliasModalVisible, setAliasModalVisible] = useState(false);
    const [selectedCalendar, setSelectedCalendar] = useState<ExternalCalendar | null>(null);
    const [selectedCalendarAccountId, setSelectedCalendarAccountId] = useState<string | undefined>(undefined);
    
    const handleOpenAliasModal = (calendar: ExternalCalendar, calAccountId?: string) => {
        setSelectedCalendar(calendar);
        setSelectedCalendarAccountId(calAccountId);
        setAliasModalVisible(true);
    };
    
    if (!provider || targetAccounts.length === 0) return null;
    
    const config = CALENDAR_PROVIDERS[provider];
    const allCalendars = targetAccounts.flatMap(a => a.calendars);
    const allSelected = allCalendars.every((c) => c.isSelected);
    const someSelected = allCalendars.some((c) => c.isSelected);
    
    return (
        <>
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
                        
                        {/* Life Context Tip */}
                        <View className="mx-5 mt-3 mb-2 p-3 bg-indigo-50 rounded-xl flex-row items-center">
                            <MaterialCommunityIcons name="lightbulb-outline" size={18} color="#6366F1" />
                            <Text className="ml-2 text-xs text-indigo-700 flex-1">
                                Tap the ⚙️ to set a Life Context (Personal, Work, etc.) for each calendar
                            </Text>
                        </View>
                        
                        <ScrollView className="px-5" bounces={false}>
                            {targetAccounts.map((account) => (
                                <View key={account.id}>
                                    {/* Account Header (if multiple accounts) */}
                                    {targetAccounts.length > 1 && (
                                        <View className="flex-row items-center py-3 mt-2 border-b border-gray-200">
                                            <MaterialCommunityIcons name="account-circle" size={20} color="#6B7280" />
                                            <Text className="ml-2 text-sm font-semibold text-gray-700">
                                                {account.accountEmail || 'Account'}
                                            </Text>
                                        </View>
                                    )}
                                    
                                    {/* Select All for this account */}
                                    <TouchableOpacity
                                        onPress={() => {
                                            const accountCalendars = account.calendars;
                                            const allAccountSelected = accountCalendars.every((c) => c.isSelected);
                                            selectAllCalendars(provider, !allAccountSelected, account.id);
                                        }}
                                        className="flex-row items-center py-4 border-b border-gray-100"
                                        activeOpacity={0.7}
                                    >
                                        {(() => {
                                            const accountCalendars = account.calendars;
                                            const allAccountSelected = accountCalendars.every((c) => c.isSelected);
                                            const someAccountSelected = accountCalendars.some((c) => c.isSelected);
                                            return (
                                                <MaterialCommunityIcons
                                                    name={allAccountSelected ? 'checkbox-marked' : someAccountSelected ? 'minus-box' : 'checkbox-blank-outline'}
                                                    size={24}
                                                    color={allAccountSelected || someAccountSelected ? '#3B82F6' : '#9CA3AF'}
                                                />
                                            );
                                        })()}
                                        <Text className="ml-3 text-base font-semibold text-gray-900">
                                            {targetAccounts.length > 1 ? 'Select All' : 'Select All Calendars'}
                                        </Text>
                                    </TouchableOpacity>
                                    
                                    {/* Calendar List for this account */}
                                    {account.calendars.map((calendar, index) => (
                                        <View
                                            key={calendar.id}
                                            className={`flex-row items-center py-3 ${
                                                index < account.calendars.length - 1 ? 'border-b border-gray-100' : ''
                                            }`}
                                        >
                                            {/* Checkbox */}
                                            <TouchableOpacity
                                                onPress={() => toggleCalendarSelection(provider, calendar.id, account.id)}
                                                className="flex-row items-center flex-1"
                                                activeOpacity={0.7}
                                            >
                                                <MaterialCommunityIcons
                                                    name={calendar.isSelected ? 'checkbox-marked' : 'checkbox-blank-outline'}
                                                    size={24}
                                                    color={calendar.isSelected ? '#3B82F6' : '#9CA3AF'}
                                                />
                                                <View
                                                    className="w-4 h-4 rounded-full mx-3"
                                                    style={{ backgroundColor: calendar.contextColor || calendar.color }}
                                                />
                                                <View className="flex-1">
                                                    <View className="flex-row items-center">
                                                        <Text className="text-base text-gray-900">
                                                            {calendar.alias || calendar.name}
                                                        </Text>
                                                    </View>
                                                    {calendar.alias && calendar.alias !== calendar.name && (
                                                        <Text className="text-xs text-gray-400">was: {calendar.name}</Text>
                                                    )}
                                                    {!calendar.alias && calendar.isPrimary && (
                                                        <Text className="text-xs text-gray-500">Primary</Text>
                                                    )}
                                                </View>
                                            </TouchableOpacity>
                                            
                                            {/* Settings button for Life Context */}
                                            <TouchableOpacity
                                                onPress={() => handleOpenAliasModal(calendar, account.id)}
                                                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                                                className="p-3 -mr-2"
                                                activeOpacity={0.5}
                                            >
                                                <MaterialCommunityIcons
                                                    name="cog"
                                                    size={22}
                                                    color={calendar.alias ? (calendar.contextColor || '#6366F1') : '#6B7280'}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
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
            
            {/* Alias Modal */}
            <CalendarAliasModal
                visible={aliasModalVisible}
                onClose={() => {
                    setAliasModalVisible(false);
                    setSelectedCalendar(null);
                    setSelectedCalendarAccountId(undefined);
                }}
                calendar={selectedCalendar}
                provider={provider}
                accountId={selectedCalendarAccountId}
            />
        </>
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
    const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>(undefined);
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [nativeAvailable, setNativeAvailable] = useState<boolean | null>(null);
    
    // Check if native modules are available
    useEffect(() => {
        calendarSyncService.isAvailable().then(setNativeAvailable);
    }, []);
    
    // Auto-reset stuck "connecting" states on mount
    // This fixes the case where OAuth was cancelled but state remained "connecting"
    useEffect(() => {
        (['apple', 'google', 'microsoft'] as CalendarProvider[]).forEach((provider) => {
            if (connections[provider].status === 'connecting') {
                console.log(`[Integrations] Resetting stuck connecting state for ${provider}`);
                disconnectProvider(provider);
            }
        });
    }, []); // Only run on mount
    
    // ========================================================================
    // Handlers
    // ========================================================================
    
    const handleConnect = useCallback(async (provider: CalendarProvider, accountId?: string) => {
        initiateConnection(provider, accountId);
        
        try {
            const result = await calendarSyncService.connectProvider(provider);
            
            if (result.success) {
                completeConnection(provider, {
                    accountEmail: result.accountEmail,
                    accountName: result.accountName,
                    calendars: result.calendars || [],
                }, result.accountEmail); // Use email as account ID
                
                // Auto-sync after connection
                if (result.calendars && result.calendars.length > 0) {
                    handleSyncProvider(provider, result.accountEmail);
                }
            } else {
                setConnectionError(provider, result.error || 'Connection failed', accountId);
            }
        } catch (error) {
            setConnectionError(
                provider,
                error instanceof Error ? error.message : 'Unknown error',
                accountId
            );
        }
    }, [initiateConnection, completeConnection, setConnectionError]);
    
    const handleDisconnect = useCallback((provider: CalendarProvider, accountId?: string) => {
        const config = CALENDAR_PROVIDERS[provider];
        const accounts = useCalendarSyncStore.getState().getAccountsForProvider(provider);
        const account = accountId ? accounts.find(a => a.id === accountId) : accounts[0];
        const accountLabel = account?.accountEmail || config.name;
        
        Alert.alert(
            `Disconnect ${accountLabel}?`,
            'Your calendar events from this account will no longer be synced. You can reconnect anytime.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Disconnect',
                    style: 'destructive',
                    onPress: async () => {
                        await calendarSyncService.disconnectProvider(provider, accountId);
                        disconnectProvider(provider, accountId);
                    },
                },
            ]
        );
    }, [disconnectProvider]);
    
    const handleManageCalendars = useCallback((provider: CalendarProvider, accountId?: string) => {
        setSelectedProvider(provider);
        setSelectedAccountId(accountId);
        setShowCalendarModal(true);
    }, []);
    
    const handleSyncProvider = useCallback(async (provider: CalendarProvider, accountId?: string) => {
        const accounts = useCalendarSyncStore.getState().getAccountsForProvider(provider);
        const accountsToSync = accountId 
            ? accounts.filter(a => a.id === accountId)
            : accounts.filter(a => a.status === 'connected');
        
        if (accountsToSync.length === 0) return;
        
        for (const account of accountsToSync) {
            startSync(provider, account.id);
            
            try {
                const selectedCalendarIds = account.calendars
                    .filter((c) => c.isSelected)
                    .map((c) => c.id);
                
                if (selectedCalendarIds.length === 0) {
                    completeSync(provider, true, undefined, account.id);
                    continue;
                }
                
                // Clear old events from this account
                clearProviderEvents(provider, account.id);
                
                // Fetch new events
                const events = await calendarSyncService.syncProviderEvents(
                    provider,
                    selectedCalendarIds,
                    syncSettings.syncRangeDays,
                    account.accountEmail
                );
                
                // Tag events with account info
                const taggedEvents = events.map(e => ({
                    ...e,
                    accountId: account.id,
                    accountEmail: account.accountEmail,
                }));
                
                addEvents(taggedEvents);
                completeSync(provider, true, undefined, account.id);
            } catch (error) {
                completeSync(
                    provider,
                    false,
                    error instanceof Error ? error.message : 'Sync failed',
                    account.id
                );
            }
        }
    }, [syncSettings, startSync, completeSync, clearProviderEvents, addEvents]);
    
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
                            onConnect={(accountId) => handleConnect('apple', accountId)}
                            onDisconnect={(accountId) => handleDisconnect('apple', accountId)}
                            onManageCalendars={(accountId) => handleManageCalendars('apple', accountId)}
                            onSync={(accountId) => handleSyncProvider('apple', accountId)}
                        />
                    )}
                    
                    {/* Google Calendar */}
                    <ProviderCard
                        provider="google"
                        onConnect={(accountId) => handleConnect('google', accountId)}
                        onDisconnect={(accountId) => handleDisconnect('google', accountId)}
                        onManageCalendars={(accountId) => handleManageCalendars('google', accountId)}
                        onSync={(accountId) => handleSyncProvider('google', accountId)}
                    />
                    
                    {/* Microsoft Outlook */}
                    <ProviderCard
                        provider="microsoft"
                        onConnect={(accountId) => handleConnect('microsoft', accountId)}
                        onDisconnect={(accountId) => handleDisconnect('microsoft', accountId)}
                        onManageCalendars={(accountId) => handleManageCalendars('microsoft', accountId)}
                        onSync={(accountId) => handleSyncProvider('microsoft', accountId)}
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
                        handleSyncProvider(selectedProvider, selectedAccountId);
                    }
                    setSelectedAccountId(undefined);
                }}
                provider={selectedProvider}
                accountId={selectedAccountId}
            />
        </View>
    );
}
