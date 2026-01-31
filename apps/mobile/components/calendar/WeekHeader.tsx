import { View, Text, TouchableOpacity } from 'react-native';
import { format, addDays, isSameMonth, addMonths, subMonths, isBefore, isAfter, parseISO } from 'date-fns';
import { getWeekStartDate, getMonthCalendarDays, getSprintStatus } from '../../utils/dateHelpers';
import { useState, useRef } from 'react';
import { MonthSelector } from './MonthSelector';
import { useAuthStore } from '../../store/authStore';
import { useSubscriptionStore } from '../../store/subscriptionStore';

interface WeekHeaderProps {
    currentDate: Date;
    sprintName: string;
    showSwipeHint?: boolean;
    onDatePress?: (date: Date) => void;
    toggleElement?: React.ReactNode;
    isExpanded?: boolean;
    onSprintNamePress?: () => void;
    sprintStartDate?: string;
    sprintEndDate?: string;
    onMonthSelect?: (date: Date) => void;
    viewType?: 'day' | 'week';
}

/**
 * Calendar color coding based on subscription and enrollment status:
 * - Gray (#9CA3AF): Before user enrollment date
 * - Red (#EF4444): Past days (completed sprints, read-only)
 * - Yellow/Gold (#FBBF24): Current day (today's focus)
 * - Green (#10B981): Future days within subscription
 * - Gray (#6B7280): Future days beyond subscription ("Renew to unlock")
 */
type DayColorType = 'pre-enrollment' | 'past' | 'current' | 'future' | 'beyond-subscription';

function getDayColorType(
    date: Date,
    today: Date,
    enrollmentDate: Date | null,
    subscriptionEndDate: Date | null
): DayColorType {
    const dateNorm = new Date(date);
    dateNorm.setHours(0, 0, 0, 0);
    
    const todayNorm = new Date(today);
    todayNorm.setHours(0, 0, 0, 0);
    
    // Before enrollment date - gray out
    if (enrollmentDate && isBefore(dateNorm, enrollmentDate)) {
        return 'pre-enrollment';
    }
    
    // Beyond subscription end date - locked
    if (subscriptionEndDate && isAfter(dateNorm, subscriptionEndDate)) {
        return 'beyond-subscription';
    }
    
    // Current day
    if (dateNorm.getTime() === todayNorm.getTime()) {
        return 'current';
    }
    
    // Past days
    if (isBefore(dateNorm, todayNorm)) {
        return 'past';
    }
    
    // Future days within subscription
    return 'future';
}

function getWeekColorType(
    weekDays: Date[],
    today: Date,
    enrollmentDate: Date | null,
    subscriptionEndDate: Date | null
): DayColorType {
    const todayNorm = new Date(today);
    todayNorm.setHours(0, 0, 0, 0);
    
    const weekStart = new Date(weekDays[0]);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekDays[6]);
    weekEnd.setHours(23, 59, 59, 999);
    
    // If entire week is before enrollment
    if (enrollmentDate && isAfter(enrollmentDate, weekEnd)) {
        return 'pre-enrollment';
    }
    
    // If entire week is beyond subscription
    if (subscriptionEndDate && isAfter(weekStart, subscriptionEndDate)) {
        return 'beyond-subscription';
    }
    
    // Current week
    if (weekStart <= todayNorm && todayNorm <= weekEnd) {
        return 'current';
    }
    
    // Past week
    if (weekEnd < todayNorm) {
        return 'past';
    }
    
    return 'future';
}

const COLOR_MAP: Record<DayColorType, { bg: string; text: string; weekBg: string }> = {
    'pre-enrollment': { bg: '#9CA3AF', text: 'text-gray-400', weekBg: 'bg-gray-400/20' },
    'past': { bg: '#EF4444', text: 'text-red-200', weekBg: 'bg-red-500/20' },
    'current': { bg: '#FBBF24', text: 'text-yellow-100', weekBg: 'bg-yellow-500/30' },
    'future': { bg: '#10B981', text: 'text-green-100', weekBg: 'bg-green-500/20' },
    'beyond-subscription': { bg: '#6B7280', text: 'text-gray-400', weekBg: 'bg-gray-500/20' },
};

export function WeekHeader({
    currentDate,
    sprintName,
    showSwipeHint = true,
    onDatePress,
    toggleElement,
    isExpanded = false,
    onSprintNamePress,
    sprintStartDate,
    sprintEndDate,
    onMonthSelect,
    viewType = 'week',
}: WeekHeaderProps) {
    const [monthViewDate, setMonthViewDate] = useState(currentDate);
    const touchStart = useRef({ x: 0, y: 0 });
    const touchMove = useRef({ x: 0, y: 0 });
    
    // Get enrollment and subscription dates
    const { user } = useAuthStore();
    const { subscription } = useSubscriptionStore();
    
    const enrollmentDate = user?.enrollmentDate 
        ? parseISO(user.enrollmentDate) 
        : user?.createdAt 
            ? parseISO(user.createdAt) 
            : null;
    
    const subscriptionEndDate = subscription.endDate 
        ? parseISO(subscription.endDate) 
        : null;

    // Determine background color based on week timing
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = getWeekStartDate(currentDate);
    const weekEnd = addDays(weekStart, 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    // Get week color type for header background
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const weekColorType = getWeekColorType(weekDays, today, enrollmentDate, subscriptionEndDate);

    // Map to Tailwind classes
    const bgColorMap: Record<DayColorType, string> = {
        'pre-enrollment': 'bg-gray-400',
        'past': 'bg-red-500',
        'current': 'bg-yellow-500',
        'future': 'bg-green-500',
        'beyond-subscription': 'bg-gray-500',
    };
    
    const bgColor = bgColorMap[weekColorType];

    const handleMonthSwipe = (direction: 'left' | 'right') => {
        if (direction === 'left') {
            setMonthViewDate(prev => addMonths(prev, 1));
        } else {
            setMonthViewDate(prev => subMonths(prev, 1));
        }
    };

    const handleTouchStart = (e: any) => {
        const touch = e.nativeEvent.touches[0];
        touchStart.current = { x: touch.pageX, y: touch.pageY };
        touchMove.current = { x: touch.pageX, y: touch.pageY };
    };

    const handleTouchMove = (e: any) => {
        const touch = e.nativeEvent.touches[0];
        touchMove.current = { x: touch.pageX, y: touch.pageY };
    };

    const handleTouchEnd = () => {
        const deltaX = touchMove.current.x - touchStart.current.x;
        const deltaY = touchMove.current.y - touchStart.current.y;

        // Only trigger if horizontal movement is greater than vertical and moved at least 50px
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            if (deltaX > 0) {
                handleMonthSwipe('right'); // Swiped right -> previous month
            } else {
                handleMonthSwipe('left'); // Swiped left -> next month
            }
        }
    };

    const renderWeekView = () => {
        // Only show day indicators in daily mode
        if (viewType === 'week') {
            return null;
        }

        const weekStart = getWeekStartDate(currentDate);
        const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

        return (
            <View className="flex-row justify-around mt-2">
                {weekDays.map((day, index) => {
                    const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                    const isSelected = format(day, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
                    const dayColorType = getDayColorType(day, today, enrollmentDate, subscriptionEndDate);
                    const isLocked = dayColorType === 'pre-enrollment' || dayColorType === 'beyond-subscription';

                    return (
                        <TouchableOpacity
                            key={index}
                            className="items-center"
                            onPress={() => !isLocked && onDatePress?.(day)}
                            disabled={isLocked}
                            style={{ opacity: isLocked ? 0.5 : 1 }}
                        >
                            <Text className="text-white text-xs font-semibold mb-1">
                                {format(day, 'EEE')}
                            </Text>
                            <View
                                className={'w-8 h-8 rounded-full items-center justify-center ' +
                                    (isToday ? 'bg-white' : isSelected ? 'bg-white/40' : '')}
                            >
                                <Text className={isToday ? 'text-gray-900 font-bold' : 'text-white'}>
                                    {format(day, 'd')}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    // Get week status color with subscription awareness
    const getWeekStatusColor = (weekDays: Date[]): string => {
        const colorType = getWeekColorType(weekDays, today, enrollmentDate, subscriptionEndDate);
        return COLOR_MAP[colorType].weekBg;
    };

    const renderMonthView = () => {
        const calendarDays = getMonthCalendarDays(monthViewDate);
        const monthName = format(monthViewDate, 'MMMM yyyy');
        const today = new Date();

        // Create weeks (rows of 7 days)
        const weeks: Date[][] = [];
        for (let i = 0; i < calendarDays.length; i += 7) {
            weeks.push(calendarDays.slice(i, i + 7));
        }

        return (
            <View className="mt-2" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
                {/* Month name at top */}
                <Text className="text-white text-center text-sm font-semibold mb-2">{monthName}</Text>

                {/* Day labels */}
                <View className="flex-row justify-around mb-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <View key={day} className="w-10 items-center">
                            <Text className="text-white text-xs font-semibold">{day}</Text>
                        </View>
                    ))}
                </View>

                {/* Calendar grid with week-level color coding */}
                {weeks.map((week, weekIndex) => {
                    const weekStatusColor = getWeekStatusColor(week);
                    
                    return (
                        <View 
                            key={weekIndex} 
                            className={`flex-row justify-around mb-1 mx-1 rounded-lg ${weekStatusColor}`}
                        >
                            {week.map((day, dayIndex) => {
                                const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
                                const isCurrentMonth = isSameMonth(day, monthViewDate);
                                const isSelected = format(day, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
                                const dayColorType = getDayColorType(day, today, enrollmentDate, subscriptionEndDate);
                                const isLocked = dayColorType === 'pre-enrollment' || dayColorType === 'beyond-subscription';

                                return (
                                    <TouchableOpacity
                                        key={dayIndex}
                                        className="w-10 h-10 items-center justify-center"
                                        disabled={isLocked}
                                        onPress={() => {
                                            if (!isLocked) {
                                                setMonthViewDate(day);
                                                onDatePress?.(day);
                                            }
                                        }}
                                        style={{ opacity: isLocked ? 0.4 : 1 }}
                                    >
                                        <View
                                            className={`w-8 h-8 rounded-full items-center justify-center ${isToday ? 'bg-white' : isSelected ? 'bg-white/40' : ''
                                                }`}
                                        >
                                            <Text
                                                className={`text-sm ${isToday
                                                    ? 'text-gray-900 font-bold'
                                                    : isCurrentMonth
                                                        ? 'text-white font-medium'
                                                        : 'text-white/40'
                                                    }`}
                                            >
                                                {format(day, 'd')}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    );
                })}

                {/* Week Color Legend - Enhanced with subscription states */}
                <View className="flex-row justify-center items-center mt-2 gap-2 flex-wrap">
                    <View className="flex-row items-center">
                        <View className="w-3 h-3 rounded bg-gray-400/60 mr-1" />
                        <Text className="text-white/80 text-[10px]">Pre-enroll</Text>
                    </View>
                    <View className="flex-row items-center">
                        <View className="w-3 h-3 rounded bg-red-500/60 mr-1" />
                        <Text className="text-white/80 text-[10px]">Past</Text>
                    </View>
                    <View className="flex-row items-center">
                        <View className="w-3 h-3 rounded bg-yellow-500/60 mr-1" />
                        <Text className="text-white/80 text-[10px]">Current</Text>
                    </View>
                    <View className="flex-row items-center">
                        <View className="w-3 h-3 rounded bg-green-500/60 mr-1" />
                        <Text className="text-white/80 text-[10px]">Future</Text>
                    </View>
                    {subscriptionEndDate && (
                        <View className="flex-row items-center">
                            <View className="w-3 h-3 rounded bg-gray-500/60 mr-1" />
                            <Text className="text-white/80 text-[10px]">Locked</Text>
                        </View>
                    )}
                </View>

                {/* Month Selector - Right under the calendar */}
                <MonthSelector
                    currentDate={monthViewDate}
                    onMonthSelect={(date) => {
                        setMonthViewDate(date);
                        onMonthSelect?.(date);
                    }}
                />
            </View>
        );
    };

    return (
        <View className={`${bgColor} pt-12 pb-3 px-4`}>
            {/* Header row */}
            <View className="flex-row items-center justify-between mb-1">
                {/* Sprint Name - Left */}
                <TouchableOpacity
                    onPress={onSprintNamePress}
                    className="flex-1"
                >
                    <Text className="text-white font-bold text-lg">
                        {sprintName}
                    </Text>
                </TouchableOpacity>

                {/* Toggle Element */}
                {toggleElement}
            </View>

            {/* Week or Month View */}
            {isExpanded ? renderMonthView() : renderWeekView()}
        </View>
    );
}
