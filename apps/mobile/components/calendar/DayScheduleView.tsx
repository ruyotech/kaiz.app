import { logger } from '../../utils/logger';
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format, isSameDay, parseISO } from 'date-fns';
import { Task } from '../../types/models';
import { useTranslation } from '../../hooks/useTranslation';
import { useCalendarSyncStore, type ExternalEvent, CALENDAR_PROVIDERS } from '../../store/calendarSyncStore';

// Helper to get friendly account name from email
const getFriendlyAccountName = (email?: string, provider?: string): string => {
    if (!email) return provider ? CALENDAR_PROVIDERS[provider as keyof typeof CALENDAR_PROVIDERS]?.name || provider : 'Calendar';
    
    // Extract username part before @
    const username = email.split('@')[0];
    // Capitalize first letter
    return username.charAt(0).toUpperCase() + username.slice(1);
};

// External Event Detail Modal Component
const ExternalEventDetailModal = ({
    visible,
    event,
    onClose,
}: {
    visible: boolean;
    event: ExternalEvent | null;
    onClose: () => void;
}) => {
    if (!event) return null;
    
    const startTime = new Date(event.startDate);
    const endTime = new Date(event.endDate);
    
    const providerColors: Record<string, string> = {
        apple: '#FF3B30',
        google: '#4285F4',
        microsoft: '#0078D4',
    };
    const color = event.calendarContextColor || providerColors[event.provider] || '#6B7280';
    const accountName = getFriendlyAccountName(event.accountEmail, event.provider);
    const providerName = CALENDAR_PROVIDERS[event.provider as keyof typeof CALENDAR_PROVIDERS]?.name || event.provider;
    
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                className="flex-1 bg-black/50 justify-end"
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                    <View className="bg-white rounded-t-3xl max-h-[80%]">
                        {/* Header */}
                        <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
                            <View className="flex-1">
                                <View className="flex-row items-center">
                                    <View
                                        className="w-3 h-3 rounded-full mr-2"
                                        style={{ backgroundColor: color }}
                                    />
                                    <Text className="text-xs text-gray-500">{providerName} • {accountName}</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={onClose} className="p-2 -mr-2">
                                <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView className="px-5 py-4">
                            {/* Title */}
                            <Text className="text-xl font-bold text-gray-900 mb-4">
                                {event.title}
                            </Text>
                            
                            {/* Date & Time */}
                            <View className="flex-row items-start mb-4">
                                <View className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center mr-3">
                                    <MaterialCommunityIcons name="clock-outline" size={20} color="#6B7280" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-sm font-medium text-gray-900">
                                        {format(startTime, 'EEEE, MMMM d, yyyy')}
                                    </Text>
                                    {event.isAllDay ? (
                                        <Text className="text-sm text-gray-500">All Day</Text>
                                    ) : (
                                        <Text className="text-sm text-gray-500">
                                            {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                                        </Text>
                                    )}
                                </View>
                            </View>
                            
                            {/* Location */}
                            {event.location && (
                                <TouchableOpacity
                                    className="flex-row items-start mb-4"
                                    onPress={() => {
                                        const url = `https://maps.google.com/?q=${encodeURIComponent(event.location!)}`;
                                        Linking.openURL(url);
                                    }}
                                >
                                    <View className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center mr-3">
                                        <MaterialCommunityIcons name="map-marker-outline" size={20} color="#6B7280" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm font-medium text-gray-900">
                                            {event.location}
                                        </Text>
                                        <Text className="text-xs text-blue-500">Tap to open in Maps</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            
                            {/* Description/Notes */}
                            {event.notes && (
                                <View className="flex-row items-start mb-4">
                                    <View className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center mr-3">
                                        <MaterialCommunityIcons name="text" size={20} color="#6B7280" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm text-gray-700 leading-5">
                                            {event.notes}
                                        </Text>
                                    </View>
                                </View>
                            )}
                            
                            {/* Calendar Info */}
                            <View className="flex-row items-start mb-4">
                                <View className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center mr-3">
                                    <MaterialCommunityIcons name="calendar" size={20} color="#6B7280" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-sm font-medium text-gray-900">
                                        {event.calendarAlias || 'External Calendar'}
                                    </Text>
                                    <Text className="text-xs text-gray-500">
                                        {event.accountEmail || providerName}
                                    </Text>
                                </View>
                            </View>
                            
                            {/* Recurrence */}
                            {event.recurrence && (
                                <View className="flex-row items-start mb-4">
                                    <View className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center mr-3">
                                        <MaterialCommunityIcons name="repeat" size={20} color="#6B7280" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm text-gray-700">
                                            Recurring Event
                                        </Text>
                                    </View>
                                </View>
                            )}
                            
                            {/* Read-only notice */}
                            <View className="bg-blue-50 rounded-xl p-3 mt-2 mb-6">
                                <View className="flex-row items-center">
                                    <MaterialCommunityIcons name="shield-check" size={16} color="#3B82F6" />
                                    <Text className="text-xs text-blue-600 ml-2">
                                        This is a read-only event from your {providerName}
                                    </Text>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

// Helper to check if a string is an emoji (not a MaterialCommunityIcons name)
const isEmoji = (str: string): boolean => {
    if (!str) return false;
    // MaterialCommunityIcons names are typically lowercase with dashes (e.g., "heart-pulse")
    // Emojis are unicode characters that don't match this pattern
    const emojiRegex = /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;
    return emojiRegex.test(str) || (str.length <= 2 && !/^[a-z-]+$/.test(str));
};

// Render icon as emoji text or MaterialCommunityIcons
const renderIcon = (icon: string, size: number, color: string) => {
    if (isEmoji(icon)) {
        return <Text style={{ fontSize: size, lineHeight: size + 2 }}>{icon}</Text>;
    }
    return <MaterialCommunityIcons name={icon as any} size={size} color={color} />;
};

interface DayScheduleViewProps {
    currentDate: Date;
    tasks: Task[];
    epics: any[];
    lifeWheelAreas: any[];
    onTaskPress: (taskId: string) => void;
}

// Generate 30-min time slots for 24 hours
const generateTimeSlots = () => {
    const slots: { time: string; hour: number; minute: number }[] = [];
    for (let hour = 0; hour < 24; hour++) {
        slots.push({ time: `${hour.toString().padStart(2, '0')}:00`, hour, minute: 0 });
        slots.push({ time: `${hour.toString().padStart(2, '0')}:30`, hour, minute: 30 });
    }
    return slots;
};

const TIME_SLOTS = generateTimeSlots();
const SLOT_HEIGHT = 60; // Height in pixels for each 30-min slot

// Helper to parse time string "HH:mm:ss" or "HH:mm" to minutes from midnight
const parseTimeToMinutes = (timeStr: string | null | undefined): number | null => {
    if (!timeStr) return null;
    const parts = timeStr.split(':');
    if (parts.length < 2) return null;
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    return hours * 60 + minutes;
};

// Get task position and height based on scheduled time
const getTaskPosition = (task: Task) => {
    const startTime = parseTimeToMinutes(task.recurrence?.scheduledTime);
    const endTime = parseTimeToMinutes(task.recurrence?.scheduledEndTime);

    if (startTime === null) {
        return null; // No scheduled time, will show in "All Day" section
    }

    // Convert minutes to slot position
    const startSlotIndex = Math.floor(startTime / 30);
    const top = startSlotIndex * SLOT_HEIGHT;

    // Default duration is 30 min if no end time
    let height = SLOT_HEIGHT;
    if (endTime !== null && endTime > startTime) {
        const durationSlots = Math.ceil((endTime - startTime) / 30);
        height = durationSlots * SLOT_HEIGHT;
    }

    return { top, height, startTime, endTime };
};

// Get wheel of life info
const getWheelOfLifeInfo = (lifeWheelAreaId: string, lifeWheelAreas: any[]) => {
    const area = lifeWheelAreas.find(a => a.id === lifeWheelAreaId || a.displayId === lifeWheelAreaId);
    if (!area) return { name: 'Unknown', icon: 'help-circle', color: '#6B7280' };
    return {
        name: area.name,
        icon: area.icon || 'help-circle',
        color: area.color || '#6B7280'
    };
};

// Get Eisenhower priority info
const getEisenhowerInfo = (quadrantId: string): { label: string; shortLabel: string; color: string; bgColor: string; icon: string } => {
    const quadrants: Record<string, { label: string; shortLabel: string; color: string; bgColor: string; icon: string }> = {
        'eq-1': { label: 'Urgent & Important', shortLabel: 'P1', color: '#DC2626', bgColor: 'bg-red-100', icon: 'fire' },
        'eq-2': { label: 'Not Urgent & Important', shortLabel: 'P2', color: '#2563EB', bgColor: 'bg-blue-100', icon: 'target' },
        'eq-3': { label: 'Urgent & Not Important', shortLabel: 'P3', color: '#CA8A04', bgColor: 'bg-yellow-100', icon: 'clock-fast' },
        'eq-4': { label: 'Not Urgent & Not Important', shortLabel: 'P4', color: '#6B7280', bgColor: 'bg-gray-100', icon: 'delete-outline' },
    };
    return quadrants[quadrantId] || quadrants['eq-4'];
};

// Get recurrence display label (for weekdaily tasks in day view, don't show tag since we're viewing specific day)
const getRecurrenceDayLabel = (task: Task, currentDate: Date): string | null => {
    if (!task.recurrence?.frequency) return null;
    const freq = task.recurrence.frequency;
    switch (freq) {
        case 'DAILY': return null; // Daily tasks appear every day, no special label needed
        case 'WEEKLY': {
            const dayOfWeek = task.recurrence.dayOfWeek;
            if (dayOfWeek !== null && dayOfWeek !== currentDate.getDay()) {
                return null; // Not scheduled for this day
            }
            return null;
        }
        default: return null;
    }
};

// Check if task is recurring (check both flag and recurrence object)
const isTaskRecurring = (task: Task): boolean => {
    return task.isRecurring === true || (task.recurrence?.frequency != null);
};

// Check if task should appear on this day
const shouldShowOnDay = (task: Task, currentDate: Date): boolean => {
    if (!isTaskRecurring(task) || !task.recurrence) {
        // Non-recurring task - show if matches sprint (default behavior)
        return true;
    }

    const freq = task.recurrence.frequency;
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    switch (freq) {
        case 'DAILY':
            return true;
        case 'WEEKLY':
        case 'BIWEEKLY':
            // Show on the specific day of week
            return task.recurrence.dayOfWeek === dayOfWeek;
        case 'MONTHLY':
            // Show on specific day of month
            return task.recurrence.dayOfMonth === currentDate.getDate();
        case 'YEARLY': {
            // Show on specific month and day
            const yearlyDate = task.recurrence.yearlyDate;
            if (yearlyDate) {
                const yd = new Date(yearlyDate);
                return yd.getMonth() === currentDate.getMonth() && yd.getDate() === currentDate.getDate();
            }
            return false;
        }
        default:
            return true;
    }
};

// Check if task is a weekday recurring task (Mon-Fri)
const isWeekdayRecurring = (task: Task): boolean => {
    // A "weekdays" task is stored as DAILY with startDate being a weekday
    // or we check if it's daily and doesn't have weekend scheduling
    // For now, we'll treat any DAILY recurring task as potentially weekday
    // The backend should ideally store a `daysOfWeek` array
    return task.recurrence?.frequency === 'DAILY';
};

// Get external event position on timeline
const getExternalEventPosition = (event: ExternalEvent, currentDate: Date) => {
    if (event.isAllDay) return null; // All-day events shown separately
    
    try {
        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);
        
        if (!isSameDay(startDate, currentDate)) return null;
        
        const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
        const endMinutes = endDate.getHours() * 60 + endDate.getMinutes();
        
        const startSlotIndex = Math.floor(startMinutes / 30);
        const top = startSlotIndex * SLOT_HEIGHT;
        
        const durationMinutes = endMinutes - startMinutes;
        const height = Math.max((durationMinutes / 30) * SLOT_HEIGHT, SLOT_HEIGHT);
        
        return { top, height, startTime: startMinutes, endTime: endMinutes };
    } catch {
        return null;
    }
};

export function DayScheduleView({
    currentDate,
    tasks,
    epics,
    lifeWheelAreas,
    onTaskPress,
}: DayScheduleViewProps) {
    const { t } = useTranslation();
    
    // State for external event detail modal
    const [selectedExternalEvent, setSelectedExternalEvent] = useState<ExternalEvent | null>(null);
    const [showEventDetailModal, setShowEventDetailModal] = useState(false);
    
    // Get external calendar events from store (correct property name is externalEvents)
    const externalEvents = useCalendarSyncStore((state) => state.externalEvents) || [];
    
    // Debug: Log store state
    logger.log('📅 DayScheduleView - externalEvents count:', externalEvents.length);
    logger.log('📅 DayScheduleView - externalEvents:', JSON.stringify(externalEvents.slice(0, 3)));
    
    // Filter external events for current day
    const dayExternalEvents = externalEvents.filter(event => {
        try {
            // Handle different date formats (ISO string, date string, etc.)
            let eventStart: Date;
            if (event.startDate) {
                // Try parsing as-is first
                eventStart = new Date(event.startDate);
                
                // If invalid, try adding timezone
                if (isNaN(eventStart.getTime())) {
                    // Microsoft sometimes returns dates like "2026-01-31T19:30:00"
                    eventStart = new Date(event.startDate + 'Z');
                }
            } else {
                logger.log('📅 Event has no startDate:', event.title);
                return false;
            }
            
            const isSame = isSameDay(eventStart, currentDate);
            logger.log('📅 Event check:', event.title, 'provider:', event.provider, 'raw:', event.startDate, 'parsed:', eventStart.toISOString(), 'isSameDay:', isSame);
            return isSame;
        } catch (e) {
            logger.log('📅 Event filter error:', event.title, e);
            return false;
        }
    });
    
    // Separate all-day and timed external events
    const allDayExternalEvents = dayExternalEvents.filter(e => e.isAllDay);
    const timedExternalEvents = dayExternalEvents.filter(e => !e.isAllDay);

    // Debug: Log all tasks with recurrence
    logger.log('📅 DayScheduleView - currentDate:', currentDate.toISOString());
    logger.log('📅 External events for day:', dayExternalEvents.length);
    logger.log('📅 All tasks with recurrence:', tasks.filter(t => isTaskRecurring(t)).map(t => ({
        title: t.title,
        isRecurring: t.isRecurring,
        frequency: t.recurrence?.frequency,
        yearlyDate: t.recurrence?.yearlyDate,
    })));

    // Filter tasks for current day
    const dayTasks = tasks.filter(task => {
        const shouldShow = shouldShowOnDay(task, currentDate);
        if (task.recurrence?.frequency === 'YEARLY') {
            logger.log('📅 YEARLY task check:', task.title, 'yearlyDate:', task.recurrence?.yearlyDate, 'shouldShow:', shouldShow);
        }
        return shouldShow;
    });

    // Get special events for this day (birthdays, anniversaries - yearly recurring)
    const specialEvents = dayTasks.filter(task => 
        isTaskRecurring(task) && 
        task.recurrence?.frequency === 'YEARLY'
    );

    // Separate tasks with scheduled times
    const scheduledTasks = dayTasks.filter(task => {
        const pos = getTaskPosition(task);
        return pos !== null;
    });

    // Format current date for display
    const dayName = format(currentDate, 'EEEE');
    const dateStr = format(currentDate, 'MMMM d, yyyy');

    const renderScheduledTask = (task: Task) => {
        const position = getTaskPosition(task);
        if (!position) return null;

        const taskEpic = epics.find(e => e.id === task.epicId);
        const wheelInfo = getWheelOfLifeInfo(task.lifeWheelAreaId, lifeWheelAreas);
        const eisenhowerInfo = getEisenhowerInfo(task.eisenhowerQuadrantId);
        const startTimeStr = task.recurrence?.scheduledTime?.substring(0, 5) || '';
        const endTimeStr = task.recurrence?.scheduledEndTime?.substring(0, 5) || '';

        // Determine status color
        const statusColors: Record<string, { bg: string; text: string }> = {
            'todo': { bg: 'bg-gray-100', text: 'text-gray-700' },
            'in_progress': { bg: 'bg-blue-100', text: 'text-blue-700' },
            'done': { bg: 'bg-green-100', text: 'text-green-700' },
            'blocked': { bg: 'bg-red-100', text: 'text-red-700' },
            'draft': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
        };
        const statusStyle = statusColors[task.status] || statusColors.todo;

        return (
            <TouchableOpacity
                key={task.id}
                onPress={() => onTaskPress(task.id)}
                className="absolute left-16 right-2 bg-white rounded-xl border border-gray-200 overflow-hidden"
                style={{
                    top: position.top + 2,
                    height: Math.max(position.height - 4, 40),
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2,
                }}
            >
                {/* Left colored bar based on Eisenhower priority */}
                <View 
                    className="absolute left-0 top-0 bottom-0 w-1.5"
                    style={{ backgroundColor: eisenhowerInfo.color }}
                />
                
                <View className="flex-1 p-2 pl-3">
                    {/* Header row: Eisenhower priority + title */}
                    <View className="flex-row items-center mb-1">
                        {/* Eisenhower Priority Tag */}
                        <View 
                            className={`px-1.5 py-0.5 rounded mr-2 flex-row items-center ${eisenhowerInfo.bgColor}`}
                        >
                            <MaterialCommunityIcons 
                                name={eisenhowerInfo.icon as any} 
                                size={10} 
                                color={eisenhowerInfo.color} 
                            />
                            <Text 
                                className="text-[10px] font-bold ml-0.5" 
                                style={{ color: eisenhowerInfo.color }}
                            >
                                {eisenhowerInfo.shortLabel}
                            </Text>
                        </View>
                        <Text className="font-semibold text-gray-900 flex-1 mr-2" numberOfLines={1}>
                            {task.title}
                        </Text>
                    </View>

                    {/* Time + Epic row */}
                    <View className="flex-row items-center justify-between mb-1">
                        {(startTimeStr || endTimeStr) && (
                            <View className="flex-row items-center">
                                <MaterialCommunityIcons name="clock-outline" size={10} color="#6B7280" />
                                <Text className="text-xs text-gray-500 ml-1">
                                    {startTimeStr}{endTimeStr ? ` - ${endTimeStr}` : ''}
                                </Text>
                            </View>
                        )}
                        {taskEpic && (
                            <View 
                                className="px-2 py-0.5 rounded-full flex-row items-center"
                                style={{ backgroundColor: taskEpic.color + '20' }}
                            >
                                <MaterialCommunityIcons 
                                    name={taskEpic.icon as any} 
                                    size={10} 
                                    color={taskEpic.color} 
                                />
                                <Text 
                                    className="text-[10px] font-bold ml-0.5" 
                                    style={{ color: taskEpic.color }}
                                    numberOfLines={1}
                                >
                                    {taskEpic.title}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Bottom row: wheel of life, status, points */}
                    <View className="flex-row items-center flex-wrap gap-1">
                        {/* Wheel of Life */}
                        <View 
                            className="flex-row items-center px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: wheelInfo.color + '15' }}
                        >
                            {renderIcon(wheelInfo.icon, 10, wheelInfo.color)}
                            <Text 
                                className="text-[10px] font-medium ml-0.5" 
                                style={{ color: wheelInfo.color }}
                            >
                                {wheelInfo.name}
                            </Text>
                        </View>

                        {/* Status */}
                        <View className={`px-1.5 py-0.5 rounded ${statusStyle.bg}`}>
                            <Text className={`text-[10px] font-medium capitalize ${statusStyle.text}`}>
                                {task.status.replace('_', ' ')}
                            </Text>
                        </View>

                        {/* Story Points */}
                        <View className="bg-gray-100 px-1.5 py-0.5 rounded">
                            <Text className="text-[10px] font-bold text-gray-600">
                                {task.storyPoints || 0}pt
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderAllDayTask = (task: Task) => {
        const taskEpic = epics.find(e => e.id === task.epicId);
        const wheelInfo = getWheelOfLifeInfo(task.lifeWheelAreaId, lifeWheelAreas);
        const eisenhowerInfo = getEisenhowerInfo(task.eisenhowerQuadrantId);

        // Get recurrence label
        const getRecurrenceLabel = () => {
            if (!isTaskRecurring(task) || !task.recurrence) return null;
            const freq = task.recurrence.frequency;
            switch (freq) {
                case 'DAILY': return '📅';
                case 'WEEKLY': return '🔄';
                case 'BIWEEKLY': return '📆';
                case 'MONTHLY': return '🗓️';
                case 'YEARLY': return '🎂';
                default: return '🔁';
            }
        };

        const statusColors: Record<string, { bg: string; text: string; border: string }> = {
            'todo': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
            'in_progress': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
            'done': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
            'blocked': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
            'draft': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
        };
        const statusStyle = statusColors[task.status] || statusColors.todo;

        return (
            <TouchableOpacity
                key={task.id}
                onPress={() => onTaskPress(task.id)}
                className={`bg-white rounded-xl p-3 mb-2 border ${statusStyle.border}`}
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                }}
            >
                {/* Left colored bar based on Eisenhower priority */}
                <View 
                    className="absolute left-0 top-2 bottom-2 w-1.5 rounded-full"
                    style={{ backgroundColor: eisenhowerInfo.color }}
                />

                <View className="pl-2">
                    {/* Priority + Title row */}
                    <View className="flex-row items-center mb-2">
                        {/* Eisenhower Priority Tag */}
                        <View 
                            className={`px-2 py-1 rounded mr-2 flex-row items-center ${eisenhowerInfo.bgColor}`}
                        >
                            <MaterialCommunityIcons 
                                name={eisenhowerInfo.icon as any} 
                                size={12} 
                                color={eisenhowerInfo.color} 
                            />
                            <Text 
                                className="text-xs font-bold ml-1" 
                                style={{ color: eisenhowerInfo.color }}
                            >
                                {eisenhowerInfo.shortLabel}
                            </Text>
                        </View>
                        <View className="flex-row items-center flex-1">
                            {getRecurrenceLabel() && (
                                <Text className="mr-1">{getRecurrenceLabel()}</Text>
                            )}
                            <Text className="font-semibold text-gray-900 flex-1" numberOfLines={1}>
                                {task.title}
                            </Text>
                        </View>
                    </View>

                    {/* Epic row */}
                    {taskEpic && (
                        <View className="mb-2">
                            <View 
                                className="px-2 py-0.5 rounded-full flex-row items-center self-start"
                                style={{ backgroundColor: taskEpic.color + '20' }}
                            >
                                <MaterialCommunityIcons 
                                    name={taskEpic.icon as any} 
                                    size={12} 
                                    color={taskEpic.color} 
                                />
                                <Text 
                                    className="text-xs font-bold ml-1" 
                                    style={{ color: taskEpic.color }}
                                    numberOfLines={1}
                                >
                                    {taskEpic.title}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Description if exists */}
                    {task.description && (
                        <Text className="text-xs text-gray-500 mb-2" numberOfLines={2}>
                            {task.description}
                        </Text>
                    )}

                    {/* Bottom metadata row */}
                    <View className="flex-row items-center flex-wrap gap-2">
                        {/* Wheel of Life */}
                        <View 
                            className="flex-row items-center px-2 py-1 rounded-full"
                            style={{ backgroundColor: wheelInfo.color + '15' }}
                        >
                            {renderIcon(wheelInfo.icon, 12, wheelInfo.color)}
                            <Text 
                                className="text-xs font-medium ml-1" 
                                style={{ color: wheelInfo.color }}
                            >
                                {wheelInfo.name}
                            </Text>
                        </View>

                        {/* Status Badge */}
                        <View className={`px-2 py-1 rounded-full ${statusStyle.bg}`}>
                            <Text className={`text-xs font-semibold capitalize ${statusStyle.text}`}>
                                {task.status.replace('_', ' ')}
                            </Text>
                        </View>

                        {/* Story Points */}
                        <View className="bg-gray-100 px-2 py-1 rounded-full">
                            <Text className="text-xs font-bold text-gray-700">
                                {task.storyPoints || 0} pts
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    // Handle external event tap
    const handleExternalEventPress = (event: ExternalEvent) => {
        setSelectedExternalEvent(event);
        setShowEventDetailModal(true);
    };
    
    // Render external calendar event (blocked time)
    const renderExternalEvent = (event: ExternalEvent) => {
        const position = getExternalEventPosition(event, currentDate);
        if (!position) return null;
        
        const startTime = new Date(event.startDate);
        const endTime = new Date(event.endDate);
        const startTimeStr = format(startTime, 'HH:mm');
        const endTimeStr = format(endTime, 'HH:mm');
        
        // Use context color if available, otherwise provider color
        const providerColors: Record<string, string> = {
            apple: '#FF3B30',
            google: '#4285F4',
            microsoft: '#0078D4',
        };
        const color = event.calendarContextColor || providerColors[event.provider] || '#6B7280';
        // Get friendly account name instead of full email
        const accountName = getFriendlyAccountName(event.accountEmail, event.provider);
        const contextLabel = event.calendarAlias || accountName;
        
        return (
            <TouchableOpacity
                key={event.id}
                className="absolute left-16 right-2 rounded-lg overflow-hidden"
                style={{
                    top: position.top + 2,
                    height: Math.max(position.height - 4, 44),
                    backgroundColor: `${color}15`,
                    borderLeftWidth: 3,
                    borderLeftColor: color,
                }}
                activeOpacity={0.7}
                onPress={() => handleExternalEventPress(event)}
            >
                <View className="flex-1 p-2">
                    {/* Context Tag - show friendly account name */}
                    <View className="flex-row items-center mb-0.5">
                        <View
                            className="px-1.5 py-0.5 rounded mr-1.5"
                            style={{ backgroundColor: `${color}25` }}
                        >
                            <Text className="text-[9px] font-semibold" style={{ color }}>
                                {contextLabel}
                            </Text>
                        </View>
                    </View>
                    
                    <Text 
                        className="text-xs font-semibold flex-1" 
                        style={{ color }}
                        numberOfLines={1}
                    >
                        {event.title}
                    </Text>
                    <Text className="text-[10px] mt-0.5" style={{ color: `${color}99` }}>
                        {startTimeStr} - {endTimeStr}
                    </Text>
                    {event.location && (
                        <View className="flex-row items-center mt-0.5">
                            <MaterialCommunityIcons name="map-marker-outline" size={10} color={`${color}99`} />
                            <Text className="text-[10px] ml-0.5" style={{ color: `${color}99` }} numberOfLines={1}>
                                {event.location}
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };
    
    // Render all-day external event
    const renderAllDayExternalEvent = (event: ExternalEvent) => {
        const providerColors: Record<string, string> = {
            apple: '#FF3B30',
            google: '#4285F4',
            microsoft: '#0078D4',
        };
        const color = event.calendarContextColor || providerColors[event.provider] || '#6B7280';
        // Get friendly account name instead of full email
        const accountName = getFriendlyAccountName(event.accountEmail, event.provider);
        const contextLabel = event.calendarAlias || accountName;
        
        return (
            <TouchableOpacity
                key={event.id}
                className="flex-row items-center rounded-lg px-3 py-2 mt-1"
                style={{ backgroundColor: `${color}15` }}
                activeOpacity={0.7}
                onPress={() => handleExternalEventPress(event)}
            >
                {/* Context Tag */}
                <View
                    className="px-1.5 py-0.5 rounded mr-2"
                    style={{ backgroundColor: `${color}25` }}
                >
                    <Text className="text-[9px] font-semibold" style={{ color }}>
                        {contextLabel}
                    </Text>
                </View>
                <Text className="font-medium flex-1" style={{ color }} numberOfLines={1}>
                    {event.title}
                </Text>
                <Text className="text-xs" style={{ color: `${color}99` }}>All Day</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1">
            {/* Day Header */}
            <View className="px-4 py-3 bg-white border-b border-gray-100">
                <Text className="text-lg font-bold text-gray-900">{dayName}</Text>
                <Text className="text-sm text-gray-500">{dateStr}</Text>
                {/* Special Events (Birthdays, Anniversaries) */}
                {specialEvents.length > 0 && (
                    <View className="mt-2">
                        {specialEvents.map(event => (
                            <View key={event.id} className="flex-row items-center bg-pink-50 rounded-lg px-3 py-2 mt-1">
                                <Text className="text-lg mr-2">🎂</Text>
                                <Text className="text-pink-700 font-medium flex-1">{event.title}</Text>
                                <TouchableOpacity onPress={() => onTaskPress(event.id)}>
                                    <Text className="text-pink-500 text-sm">View →</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
                
                {/* All-day external events */}
                {allDayExternalEvents.length > 0 && (
                    <View className="mt-2">
                        <Text className="text-xs text-gray-500 font-semibold mb-1">EXTERNAL CALENDAR</Text>
                        {allDayExternalEvents.map(renderAllDayExternalEvent)}
                    </View>
                )}
            </View>

            {/* All-day tasks hidden in daily view (timeline only) */}

            {/* Schedule Timeline */}
            <ScrollView className="flex-1 bg-white">
                <View className="relative" style={{ height: TIME_SLOTS.length * SLOT_HEIGHT }}>
                    {/* Time labels and grid lines */}
                    {TIME_SLOTS.map((slot, index) => (
                        <View
                            key={slot.time}
                            className="absolute left-0 right-0 flex-row"
                            style={{ top: index * SLOT_HEIGHT }}
                        >
                            {/* Time label (only show for full hours) */}
                            <View className="w-14 items-end pr-2 pt-0">
                                {slot.minute === 0 && (
                                    <Text className="text-xs text-gray-400 font-medium">
                                        {slot.time}
                                    </Text>
                                )}
                            </View>

                            {/* Grid line */}
                            <View 
                                className={`flex-1 border-t ${slot.minute === 0 ? 'border-gray-200' : 'border-gray-100 border-dashed'}`}
                            />
                        </View>
                    ))}

                    {/* External Calendar Events (blocked time - render first, behind tasks) */}
                    {timedExternalEvents.map(renderExternalEvent)}

                    {/* Scheduled Tasks (positioned absolutely) */}
                    {scheduledTasks.map(renderScheduledTask)}

                    {/* Current time indicator */}
                    {format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && (
                        <View
                            className="absolute left-14 right-0 flex-row items-center"
                            style={{
                                top: (new Date().getHours() * 60 + new Date().getMinutes()) / 30 * SLOT_HEIGHT - 1,
                            }}
                        >
                            <View className="w-2 h-2 bg-red-500 rounded-full" />
                            <View className="flex-1 h-0.5 bg-red-500" />
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Empty state */}
            {dayTasks.length === 0 && timedExternalEvents.length === 0 && (
                <View className="absolute inset-0 items-center justify-center">
                    <MaterialCommunityIcons name="calendar-blank-outline" size={64} color="#D1D5DB" />
                    <Text className="text-gray-400 mt-4 text-center">
                        {t('calendar.noTasksDay')}
                    </Text>
                </View>
            )}
            
            {/* External Event Detail Modal */}
            <ExternalEventDetailModal
                visible={showEventDetailModal}
                event={selectedExternalEvent}
                onClose={() => {
                    setShowEventDetailModal(false);
                    setSelectedExternalEvent(null);
                }}
            />
        </View>
    );
}
