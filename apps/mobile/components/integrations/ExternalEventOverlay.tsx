/**
 * ExternalEventOverlay.tsx - External Calendar Event Overlay Component
 * 
 * Displays external calendar events as blocked time overlays in the calendar view.
 * Shows events from connected Apple, Google, and Microsoft calendars.
 * 
 * Privacy: Read-only display only. Never modifies external calendars.
 * 
 * @author Kaiz Team
 * @version 1.0.0
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format, parseISO, isSameDay, differenceInMinutes } from 'date-fns';

// Store
import {
    useCalendarSyncStore,
    CALENDAR_PROVIDERS,
    type ExternalEvent,
    type CalendarProvider,
} from '../../store/calendarSyncStore';

// ============================================================================
// Types
// ============================================================================

interface ExternalEventOverlayProps {
    date: string; // ISO date string
    onEventPress?: (event: ExternalEvent) => void;
    compact?: boolean;
    maxVisible?: number;
}

interface EventItemProps {
    event: ExternalEvent;
    onPress?: () => void;
    compact?: boolean;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format event time for display
 */
const formatEventTime = (startDate: string, endDate: string, isAllDay: boolean): string => {
    if (isAllDay) return 'All day';
    
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
};

/**
 * Get event duration in hours
 */
const getEventDurationHours = (startDate: string, endDate: string): number => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const minutes = differenceInMinutes(end, start);
    return Math.round((minutes / 60) * 10) / 10; // Round to 1 decimal
};

/**
 * Get provider icon and color
 */
const getProviderStyle = (provider: CalendarProvider) => {
    const config = CALENDAR_PROVIDERS[provider];
    return {
        icon: config.icon,
        color: config.color,
        bgColor: config.bgColor,
    };
};

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Single external event item
 */
function EventItem({ event, onPress, compact = false }: EventItemProps) {
    const providerStyle = getProviderStyle(event.provider);
    const calendar = useCalendarSyncStore((s) =>
        s.connections[event.provider].calendars.find((c) => c.id === event.calendarId)
    );
    
    if (compact) {
        return (
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.7}
                className="flex-row items-center py-1.5"
            >
                <View
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: calendar?.color || providerStyle.color }}
                />
                <Text
                    className="flex-1 text-xs text-gray-600"
                    numberOfLines={1}
                >
                    {event.title}
                </Text>
                {event.isAllDay && (
                    <View className="bg-gray-100 px-1.5 py-0.5 rounded">
                        <Text className="text-[10px] text-gray-500">All day</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    }
    
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="flex-row p-3 bg-gray-50 rounded-xl mb-2 border border-gray-100"
        >
            {/* Color indicator */}
            <View
                className="w-1 rounded-full mr-3"
                style={{ backgroundColor: calendar?.color || providerStyle.color }}
            />
            
            {/* Event content */}
            <View className="flex-1">
                <Text className="text-sm font-medium text-gray-800" numberOfLines={2}>
                    {event.title}
                </Text>
                
                <View className="flex-row items-center mt-1">
                    <MaterialCommunityIcons
                        name="clock-outline"
                        size={12}
                        color="#9CA3AF"
                    />
                    <Text className="text-xs text-gray-500 ml-1">
                        {formatEventTime(event.startDate, event.endDate, event.isAllDay)}
                    </Text>
                </View>
                
                {event.location && (
                    <View className="flex-row items-center mt-1">
                        <MaterialCommunityIcons
                            name="map-marker-outline"
                            size={12}
                            color="#9CA3AF"
                        />
                        <Text
                            className="text-xs text-gray-500 ml-1 flex-1"
                            numberOfLines={1}
                        >
                            {event.location}
                        </Text>
                    </View>
                )}
            </View>
            
            {/* Provider icon */}
            <View className="items-end justify-between">
                <MaterialCommunityIcons
                    name={providerStyle.icon as any}
                    size={14}
                    color={providerStyle.color}
                />
                {!event.isAllDay && (
                    <Text className="text-[10px] text-gray-400 mt-1">
                        {getEventDurationHours(event.startDate, event.endDate)}h
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
}

/**
 * "More events" indicator
 */
function MoreEventsIndicator({
    count,
    onPress,
}: {
    count: number;
    onPress?: () => void;
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="flex-row items-center justify-center py-2 mt-1"
        >
            <MaterialCommunityIcons name="plus-circle-outline" size={14} color="#6B7280" />
            <Text className="text-xs text-gray-500 ml-1">
                +{count} more event{count !== 1 ? 's' : ''}
            </Text>
        </TouchableOpacity>
    );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * External event overlay for calendar views
 */
export function ExternalEventOverlay({
    date,
    onEventPress,
    compact = false,
    maxVisible = 3,
}: ExternalEventOverlayProps) {
    const { syncSettings, getEventsForDateRange, getBlockedHoursForDate } = useCalendarSyncStore();
    
    // Get events for this date
    const events = useMemo(() => {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        
        return getEventsForDateRange(dayStart.toISOString(), dayEnd.toISOString());
    }, [date, getEventsForDateRange]);
    
    // Get blocked hours
    const blockedHours = useMemo(
        () => getBlockedHoursForDate(date),
        [date, getBlockedHoursForDate]
    );
    
    // Don't render if no events or blocked time display is disabled
    if (!syncSettings.showEventsAsBlockedTime || events.length === 0) {
        return null;
    }
    
    // Sort events: all-day first, then by start time
    const sortedEvents = [...events].sort((a, b) => {
        if (a.isAllDay && !b.isAllDay) return -1;
        if (!a.isAllDay && b.isAllDay) return 1;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
    
    const visibleEvents = sortedEvents.slice(0, maxVisible);
    const hiddenCount = sortedEvents.length - maxVisible;
    
    return (
        <View className="mt-2">
            {/* Header with blocked hours */}
            <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                    <View className="w-6 h-6 rounded-lg bg-gray-100 items-center justify-center mr-2">
                        <MaterialCommunityIcons name="calendar-clock" size={14} color="#6B7280" />
                    </View>
                    <Text className="text-xs font-medium text-gray-500">External Events</Text>
                </View>
                {syncSettings.autoAdjustCapacity && blockedHours > 0 && (
                    <View className="bg-orange-50 px-2 py-1 rounded-full">
                        <Text className="text-[10px] font-medium text-orange-600">
                            -{blockedHours}h capacity
                        </Text>
                    </View>
                )}
            </View>
            
            {/* Events list */}
            {visibleEvents.map((event) => (
                <EventItem
                    key={event.id}
                    event={event}
                    onPress={() => onEventPress?.(event)}
                    compact={compact}
                />
            ))}
            
            {/* More events indicator */}
            {hiddenCount > 0 && (
                <MoreEventsIndicator
                    count={hiddenCount}
                    onPress={() => {
                        // Could expand to show all events
                    }}
                />
            )}
        </View>
    );
}

// ============================================================================
// Blocked Time Summary Component
// ============================================================================

interface BlockedTimeSummaryProps {
    weekStartDate: string; // ISO date string
}

/**
 * Weekly blocked time summary for sprint planning
 */
export function BlockedTimeSummary({ weekStartDate }: BlockedTimeSummaryProps) {
    const { syncSettings, getTotalBlockedHoursForWeek, getConnectedProviders } =
        useCalendarSyncStore();
    
    const connectedProviders = getConnectedProviders();
    const blockedHours = getTotalBlockedHoursForWeek(weekStartDate);
    
    // Don't render if no integrations or capacity adjustment disabled
    if (connectedProviders.length === 0 || !syncSettings.autoAdjustCapacity) {
        return null;
    }
    
    return (
        <View className="bg-orange-50 rounded-xl p-3 mb-4">
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <MaterialCommunityIcons
                        name="calendar-alert"
                        size={18}
                        color="#F59E0B"
                    />
                    <Text className="ml-2 text-sm font-medium text-orange-800">
                        Calendar Blocked Time
                    </Text>
                </View>
                <Text className="text-lg font-bold text-orange-600">
                    {blockedHours}h
                </Text>
            </View>
            <Text className="text-xs text-orange-600 mt-1">
                Automatically deducted from your sprint capacity based on {connectedProviders.length} connected calendar{connectedProviders.length !== 1 ? 's' : ''}.
            </Text>
        </View>
    );
}

// ============================================================================
// Event Details Modal Content
// ============================================================================

interface EventDetailsProps {
    event: ExternalEvent | null;
    onClose: () => void;
}

/**
 * Event details view for modal display
 */
export function EventDetails({ event, onClose }: EventDetailsProps) {
    if (!event) return null;
    
    const providerStyle = getProviderStyle(event.provider);
    const calendar = useCalendarSyncStore((s) =>
        s.connections[event.provider].calendars.find((c) => c.id === event.calendarId)
    );
    const providerConfig = CALENDAR_PROVIDERS[event.provider];
    
    const startDate = parseISO(event.startDate);
    const endDate = parseISO(event.endDate);
    
    return (
        <View className="p-5">
            {/* Header */}
            <View className="flex-row items-start mb-4">
                <View
                    className="w-3 rounded-full mr-4 h-16"
                    style={{ backgroundColor: calendar?.color || providerStyle.color }}
                />
                <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-900 mb-1">
                        {event.title}
                    </Text>
                    <View className="flex-row items-center">
                        <MaterialCommunityIcons
                            name={providerStyle.icon as any}
                            size={14}
                            color={providerStyle.color}
                        />
                        <Text className="text-sm text-gray-500 ml-1.5">
                            {providerConfig.name}
                        </Text>
                        {calendar && (
                            <>
                                <Text className="text-gray-300 mx-2">•</Text>
                                <Text className="text-sm text-gray-500">{calendar.name}</Text>
                            </>
                        )}
                    </View>
                </View>
            </View>
            
            {/* Date & Time */}
            <View className="bg-gray-50 rounded-xl p-4 mb-4">
                <View className="flex-row items-center mb-3">
                    <MaterialCommunityIcons name="calendar" size={20} color="#6B7280" />
                    <Text className="ml-3 text-base text-gray-700">
                        {format(startDate, 'EEEE, MMMM d, yyyy')}
                    </Text>
                </View>
                <View className="flex-row items-center">
                    <MaterialCommunityIcons name="clock-outline" size={20} color="#6B7280" />
                    <Text className="ml-3 text-base text-gray-700">
                        {event.isAllDay
                            ? 'All day'
                            : `${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`}
                    </Text>
                </View>
            </View>
            
            {/* Location */}
            {event.location && (
                <View className="flex-row items-start mb-4">
                    <MaterialCommunityIcons name="map-marker" size={20} color="#6B7280" />
                    <Text className="ml-3 text-base text-gray-700 flex-1">
                        {event.location}
                    </Text>
                </View>
            )}
            
            {/* Notes */}
            {event.notes && (
                <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-500 mb-2">Notes</Text>
                    <Text className="text-base text-gray-700">{event.notes}</Text>
                </View>
            )}
            
            {/* Privacy notice */}
            <View className="bg-blue-50 rounded-xl p-3 flex-row items-center">
                <MaterialCommunityIcons name="shield-check-outline" size={16} color="#3B82F6" />
                <Text className="ml-2 text-xs text-blue-600 flex-1">
                    This is a read-only view from your {providerConfig.name}. Kaiz cannot modify this event.
                </Text>
            </View>
        </View>
    );
}

export default ExternalEventOverlay;
