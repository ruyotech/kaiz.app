/**
 * Family Shared Calendar Screen
 * 
 * Features:
 * - Combined family calendar view
 * - Events and task deadlines
 * - Color-coded by family member
 * - Month/Week/Day views
 */

import React, { useEffect, useState, useMemo } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    RefreshControl,
    Modal,
    TextInput,
    Pressable,
    Alert,
    Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeContext } from '../../../providers/ThemeProvider';
import { useFamilyStore } from '../../../store/familyStore';
import { FamilyCalendarEvent, FamilyMember } from '../../../types/family.types';

type CalendarView = 'month' | 'week' | 'day';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December'];

const MEMBER_COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'
];

export default function SharedCalendarScreen() {
    const router = useRouter();
    const { colors, isDark } = useThemeContext();
    const {
        calendarEvents,
        members,
        sharedTasks,
        loading,
        hasPermission,
        fetchCalendarEvents,
        createCalendarEvent,
    } = useFamilyStore();
    
    const [refreshing, setRefreshing] = useState(false);
    const [viewMode, setViewMode] = useState<CalendarView>('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedMemberFilter, setSelectedMemberFilter] = useState<string | null>(null);
    
    // New event form
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventDescription, setNewEventDescription] = useState('');
    const [newEventAllDay, setNewEventAllDay] = useState(true);
    
    const screenWidth = Dimensions.get('window').width;
    const dayWidth = (screenWidth - 32) / 7;
    
    useEffect(() => {
        fetchCalendarEvents();
    }, []);
    
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchCalendarEvents();
        setRefreshing(false);
    };
    
    // Get member color by index
    const getMemberColor = (userId: string): string => {
        const memberIndex = members.findIndex(m => m.userId === userId);
        return MEMBER_COLORS[memberIndex % MEMBER_COLORS.length];
    };
    
    // Generate calendar days for month view
    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        const days: { date: Date; isCurrentMonth: boolean }[] = [];
        
        // Previous month days
        const firstDayOfWeek = firstDay.getDay();
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const date = new Date(year, month, -i);
            days.push({ date, isCurrentMonth: false });
        }
        
        // Current month days
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push({ date: new Date(year, month, i), isCurrentMonth: true });
        }
        
        // Next month days to complete grid
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
        }
        
        return days;
    }, [currentDate]);
    
    // Get events for a specific date
    const getEventsForDate = (date: Date): FamilyCalendarEvent[] => {
        return calendarEvents.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate.toDateString() === date.toDateString() &&
                (!selectedMemberFilter || event.participants.includes(selectedMemberFilter));
        });
    };
    
    // Get tasks with due date for a specific date
    const getTasksForDate = (date: Date) => {
        return sharedTasks.filter(task => {
            if (!task.dueDate) return false;
            const taskDate = new Date(task.dueDate);
            return taskDate.toDateString() === date.toDateString() &&
                task.status !== 'done' &&
                (!selectedMemberFilter || task.assignedTo === selectedMemberFilter);
        });
    };
    
    // Navigate months
    const navigateMonth = (direction: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + direction);
        setCurrentDate(newDate);
    };
    
    // Check if date is today
    const isToday = (date: Date): boolean => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };
    
    // Selected date events and tasks
    const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];
    const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];
    
    const handleCreateEvent = async () => {
        if (!newEventTitle.trim() || !selectedDate) {
            Alert.alert('Error', 'Please enter event details');
            return;
        }
        
        try {
            await createCalendarEvent({
                title: newEventTitle.trim(),
                description: newEventDescription.trim(),
                startDate: selectedDate.toISOString(),
                endDate: selectedDate.toISOString(),
                isAllDay: newEventAllDay,
                participants: members.map(m => m.userId),
            });
            
            setShowCreateModal(false);
            setNewEventTitle('');
            setNewEventDescription('');
            setNewEventAllDay(true);
        } catch (error) {
            Alert.alert('Error', 'Failed to create event');
        }
    };
    
    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            {/* Header */}
            <SafeAreaView edges={['top']} className="bg-teal-600">
                <View className="px-4 py-4">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <TouchableOpacity onPress={() => router.back()}>
                                <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                            </TouchableOpacity>
                            <View className="ml-3">
                                <Text className="text-white text-xl font-bold">Family Calendar</Text>
                                <Text className="text-teal-200 text-xs">
                                    {calendarEvents.length} event{calendarEvents.length !== 1 ? 's' : ''} this month
                                </Text>
                            </View>
                        </View>
                        
                        <View className="flex-row items-center">
                            <TouchableOpacity 
                                onPress={() => setCurrentDate(new Date())}
                                className="bg-white/20 px-3 py-1.5 rounded-full mr-2"
                            >
                                <Text className="text-white text-sm font-medium">Today</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
            
            {/* Month Navigation */}
            <View 
                className="flex-row items-center justify-between px-4 py-3"
                style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
            >
                <TouchableOpacity 
                    onPress={() => navigateMonth(-1)}
                    className="p-2"
                >
                    <MaterialCommunityIcons name="chevron-left" size={24} color={colors.text} />
                </TouchableOpacity>
                
                <Text 
                    className="text-lg font-bold"
                    style={{ color: colors.text }}
                >
                    {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                </Text>
                
                <TouchableOpacity 
                    onPress={() => navigateMonth(1)}
                    className="p-2"
                >
                    <MaterialCommunityIcons name="chevron-right" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>
            
            {/* Member Filter */}
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                className="py-2"
                contentContainerStyle={{ paddingHorizontal: 16 }}
            >
                <TouchableOpacity
                    onPress={() => setSelectedMemberFilter(null)}
                    className="mr-2 px-3 py-1.5 rounded-full flex-row items-center"
                    style={{ 
                        backgroundColor: !selectedMemberFilter 
                            ? '#14B8A620' 
                            : isDark ? '#374151' : '#F3F4F6'
                    }}
                >
                    <MaterialCommunityIcons 
                        name="account-group" 
                        size={16} 
                        color={!selectedMemberFilter ? '#14B8A6' : colors.textSecondary}
                    />
                    <Text 
                        className="ml-1 text-sm font-medium"
                        style={{ color: !selectedMemberFilter ? '#14B8A6' : colors.textSecondary }}
                    >
                        Everyone
                    </Text>
                </TouchableOpacity>
                {members.map((member, index) => (
                    <TouchableOpacity
                        key={member.userId}
                        onPress={() => setSelectedMemberFilter(
                            selectedMemberFilter === member.userId ? null : member.userId
                        )}
                        className="mr-2 px-3 py-1.5 rounded-full flex-row items-center"
                        style={{ 
                            backgroundColor: selectedMemberFilter === member.userId 
                                ? `${MEMBER_COLORS[index % MEMBER_COLORS.length]}20` 
                                : isDark ? '#374151' : '#F3F4F6'
                        }}
                    >
                        <Text className="mr-1">{member.avatar}</Text>
                        <Text 
                            className="text-sm font-medium"
                            style={{ 
                                color: selectedMemberFilter === member.userId 
                                    ? MEMBER_COLORS[index % MEMBER_COLORS.length]
                                    : colors.textSecondary 
                            }}
                        >
                            {member.displayName.split(' ')[0]}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            
            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Calendar Grid */}
                <View className="px-4">
                    {/* Day Headers */}
                    <View className="flex-row mb-2">
                        {DAYS.map(day => (
                            <View 
                                key={day} 
                                style={{ width: dayWidth }}
                                className="items-center py-2"
                            >
                                <Text 
                                    className="text-xs font-medium"
                                    style={{ color: colors.textSecondary }}
                                >
                                    {day}
                                </Text>
                            </View>
                        ))}
                    </View>
                    
                    {/* Calendar Days Grid */}
                    <View className="flex-row flex-wrap">
                        {calendarDays.map((day, index) => {
                            const events = getEventsForDate(day.date);
                            const tasks = getTasksForDate(day.date);
                            const hasItems = events.length > 0 || tasks.length > 0;
                            const isSelected = selectedDate?.toDateString() === day.date.toDateString();
                            
                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => setSelectedDate(day.date)}
                                    style={{ 
                                        width: dayWidth,
                                        height: dayWidth * 1.2,
                                    }}
                                    className="p-1"
                                >
                                    <View 
                                        className="flex-1 rounded-lg items-center py-1"
                                        style={{ 
                                            backgroundColor: isSelected 
                                                ? '#14B8A6' 
                                                : isToday(day.date) 
                                                    ? isDark ? '#374151' : '#F3F4F6'
                                                    : 'transparent',
                                        }}
                                    >
                                        <Text 
                                            className="text-sm font-medium"
                                            style={{ 
                                                color: isSelected 
                                                    ? '#fff' 
                                                    : !day.isCurrentMonth 
                                                        ? colors.textSecondary + '60' 
                                                        : colors.text 
                                            }}
                                        >
                                            {day.date.getDate()}
                                        </Text>
                                        
                                        {/* Event/Task Dots */}
                                        {hasItems && (
                                            <View className="flex-row mt-1 flex-wrap justify-center">
                                                {events.slice(0, 3).map((event, i) => (
                                                    <View 
                                                        key={`e${i}`}
                                                        className="w-1.5 h-1.5 rounded-full mx-0.5"
                                                        style={{ 
                                                            backgroundColor: event.color || '#14B8A6'
                                                        }}
                                                    />
                                                ))}
                                                {tasks.slice(0, 2).map((_, i) => (
                                                    <View 
                                                        key={`t${i}`}
                                                        className="w-1.5 h-1.5 rounded-full mx-0.5"
                                                        style={{ backgroundColor: '#F59E0B' }}
                                                    />
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
                
                {/* Selected Date Details */}
                {selectedDate && (
                    <View className="px-4 mt-4 mb-8">
                        <View className="flex-row items-center justify-between mb-3">
                            <Text 
                                className="text-lg font-bold"
                                style={{ color: colors.text }}
                            >
                                {selectedDate.toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    month: 'short', 
                                    day: 'numeric' 
                                })}
                            </Text>
                            {hasPermission('manage_calendar') && (
                                <TouchableOpacity
                                    onPress={() => setShowCreateModal(true)}
                                    className="flex-row items-center px-3 py-1.5 rounded-full bg-teal-500"
                                >
                                    <MaterialCommunityIcons name="plus" size={16} color="#fff" />
                                    <Text className="text-white text-sm font-medium ml-1">Add</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        
                        {selectedDateEvents.length === 0 && selectedDateTasks.length === 0 ? (
                            <View 
                                className="items-center py-8 rounded-2xl"
                                style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6' }}
                            >
                                <MaterialCommunityIcons 
                                    name="calendar-blank" 
                                    size={40} 
                                    color={colors.textSecondary}
                                />
                                <Text 
                                    className="text-sm mt-2"
                                    style={{ color: colors.textSecondary }}
                                >
                                    No events or tasks
                                </Text>
                            </View>
                        ) : (
                            <View>
                                {/* Events */}
                                {selectedDateEvents.map(event => (
                                    <View
                                        key={event.id}
                                        className="p-4 rounded-xl mb-2 flex-row items-start"
                                        style={{ 
                                            backgroundColor: isDark ? '#374151' : '#F3F4F6',
                                            borderLeftWidth: 4,
                                            borderLeftColor: event.color || '#14B8A6',
                                        }}
                                    >
                                        <View 
                                            className="w-10 h-10 rounded-full items-center justify-center mr-3"
                                            style={{ backgroundColor: `${event.color || '#14B8A6'}20` }}
                                        >
                                            <MaterialCommunityIcons 
                                                name="calendar-star" 
                                                size={20} 
                                                color={event.color || '#14B8A6'}
                                            />
                                        </View>
                                        <View className="flex-1">
                                            <Text 
                                                className="font-semibold"
                                                style={{ color: colors.text }}
                                            >
                                                {event.title}
                                            </Text>
                                            {event.description && (
                                                <Text 
                                                    className="text-sm mt-1"
                                                    style={{ color: colors.textSecondary }}
                                                >
                                                    {event.description}
                                                </Text>
                                            )}
                                            <View className="flex-row items-center mt-2">
                                                <MaterialCommunityIcons 
                                                    name="clock-outline" 
                                                    size={14} 
                                                    color={colors.textSecondary}
                                                />
                                                <Text 
                                                    className="text-xs ml-1"
                                                    style={{ color: colors.textSecondary }}
                                                >
                                                    {event.isAllDay ? 'All Day' : 'Time TBD'}
                                                </Text>
                                                <View className="flex-row ml-3">
                                                    {event.participants.slice(0, 3).map(pId => {
                                                        const member = members.find(m => m.userId === pId);
                                                        return member ? (
                                                            <Text key={pId} className="text-xs">
                                                                {member.avatar}
                                                            </Text>
                                                        ) : null;
                                                    })}
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                                
                                {/* Tasks */}
                                {selectedDateTasks.map(task => (
                                    <TouchableOpacity
                                        key={task.id}
                                        onPress={() => router.push(`/family/task/${task.id}` as any)}
                                        className="p-4 rounded-xl mb-2 flex-row items-start"
                                        style={{ 
                                            backgroundColor: isDark ? '#374151' : '#F3F4F6',
                                            borderLeftWidth: 4,
                                            borderLeftColor: '#F59E0B',
                                        }}
                                    >
                                        <View 
                                            className="w-10 h-10 rounded-full items-center justify-center mr-3"
                                            style={{ backgroundColor: '#F59E0B20' }}
                                        >
                                            <MaterialCommunityIcons 
                                                name="checkbox-marked-circle-outline" 
                                                size={20} 
                                                color="#F59E0B"
                                            />
                                        </View>
                                        <View className="flex-1">
                                            <Text 
                                                className="font-semibold"
                                                style={{ color: colors.text }}
                                            >
                                                {task.title}
                                            </Text>
                                            <View className="flex-row items-center mt-2">
                                                <View 
                                                    className="px-2 py-0.5 rounded-full mr-2"
                                                    style={{ 
                                                        backgroundColor: task.status === 'in_progress' 
                                                            ? '#3B82F620' 
                                                            : '#6B728020'
                                                    }}
                                                >
                                                    <Text 
                                                        className="text-xs font-medium"
                                                        style={{ 
                                                            color: task.status === 'in_progress' 
                                                                ? '#3B82F6' 
                                                                : '#6B7280'
                                                        }}
                                                    >
                                                        {task.status === 'in_progress' ? 'In Progress' : 'To Do'}
                                                    </Text>
                                                </View>
                                                {task.assignedTo && (
                                                    <Text className="text-xs">
                                                        {members.find(m => m.userId === task.assignedTo)?.avatar}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                        <MaterialCommunityIcons 
                                            name="chevron-right" 
                                            size={20} 
                                            color={colors.textSecondary}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                )}
                
                {/* Legend */}
                <View className="px-4 pb-8">
                    <Text 
                        className="text-sm font-semibold mb-2"
                        style={{ color: colors.textSecondary }}
                    >
                        Legend
                    </Text>
                    <View className="flex-row flex-wrap">
                        <View className="flex-row items-center mr-4 mb-2">
                            <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#14B8A6' }} />
                            <Text className="text-xs" style={{ color: colors.textSecondary }}>Event</Text>
                        </View>
                        <View className="flex-row items-center mr-4 mb-2">
                            <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#F59E0B' }} />
                            <Text className="text-xs" style={{ color: colors.textSecondary }}>Task Due</Text>
                        </View>
                        {members.map((member, index) => (
                            <View key={member.userId} className="flex-row items-center mr-4 mb-2">
                                <View 
                                    className="w-3 h-3 rounded-full mr-2" 
                                    style={{ backgroundColor: MEMBER_COLORS[index % MEMBER_COLORS.length] }} 
                                />
                                <Text className="text-xs" style={{ color: colors.textSecondary }}>
                                    {member.displayName.split(' ')[0]}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
            
            {/* Create Event Modal */}
            <Modal
                visible={showCreateModal}
                animationType="slide"
                transparent
                onRequestClose={() => setShowCreateModal(false)}
            >
                <Pressable 
                    className="flex-1 justify-end"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onPress={() => setShowCreateModal(false)}
                >
                    <Pressable 
                        className="rounded-t-3xl p-6"
                        style={{ backgroundColor: colors.background }}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <Text 
                            className="text-xl font-bold mb-4"
                            style={{ color: colors.text }}
                        >
                            New Family Event
                        </Text>
                        
                        <Text 
                            className="text-sm font-medium mb-2"
                            style={{ color: colors.textSecondary }}
                        >
                            {selectedDate?.toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </Text>
                        
                        <TextInput
                            value={newEventTitle}
                            onChangeText={setNewEventTitle}
                            placeholder="Event title"
                            placeholderTextColor={colors.textSecondary}
                            className="p-4 rounded-xl mb-3"
                            style={{ 
                                backgroundColor: isDark ? '#374151' : '#F3F4F6',
                                color: colors.text,
                            }}
                        />
                        
                        <TextInput
                            value={newEventDescription}
                            onChangeText={setNewEventDescription}
                            placeholder="Description (optional)"
                            placeholderTextColor={colors.textSecondary}
                            multiline
                            numberOfLines={2}
                            className="p-4 rounded-xl mb-3"
                            style={{ 
                                backgroundColor: isDark ? '#374151' : '#F3F4F6',
                                color: colors.text,
                                minHeight: 60,
                            }}
                        />
                        
                        <TouchableOpacity
                            onPress={() => setNewEventAllDay(!newEventAllDay)}
                            className="flex-row items-center p-4 rounded-xl mb-4"
                            style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6' }}
                        >
                            <MaterialCommunityIcons 
                                name={newEventAllDay ? 'checkbox-marked' : 'checkbox-blank-outline'} 
                                size={24} 
                                color={newEventAllDay ? '#14B8A6' : colors.textSecondary}
                            />
                            <Text 
                                className="ml-3 font-medium"
                                style={{ color: colors.text }}
                            >
                                All Day Event
                            </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            onPress={handleCreateEvent}
                            className="bg-teal-500 py-4 rounded-xl items-center"
                        >
                            <Text className="text-white font-bold text-lg">Create Event</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}
