import { View, Text, TouchableOpacity } from 'react-native';
import { format, addDays, isSameMonth, addMonths, subMonths } from 'date-fns';
import { getWeekStartDate, getMonthCalendarDays, getSprintStatus } from '../../utils/dateHelpers';
import { useState, useRef } from 'react';
import { MonthSelector } from './MonthSelector';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SettingsDrawer } from '../navigation/SettingsDrawer';

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
    const router = useRouter();
    const [monthViewDate, setMonthViewDate] = useState(currentDate);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const touchStart = useRef({ x: 0, y: 0 });
    const touchMove = useRef({ x: 0, y: 0 });

    // Determine background color based on week timing
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = getWeekStartDate(currentDate);
    const weekEnd = addDays(weekStart, 6);
    weekEnd.setHours(23, 59, 59, 999);

    let bgColor = 'bg-gray-400';

    // Compare week dates with today
    if (weekEnd < today) {
        // Week is completely in the past
        bgColor = 'bg-red-500';
    } else if (weekStart <= today && weekEnd >= today) {
        // Current week (today falls within this week)
        bgColor = 'bg-yellow-500';
    } else if (weekStart > today) {
        // Future week
        bgColor = 'bg-green-500';
    }

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

                    return (
                        <TouchableOpacity
                            key={index}
                            className="items-center"
                            onPress={() => onDatePress?.(day)}
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

                {/* Calendar grid */}
                {weeks.map((week, weekIndex) => (
                    <View key={weekIndex} className="flex-row justify-around mb-1">
                        {week.map((day, dayIndex) => {
                            const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
                            const isCurrentMonth = isSameMonth(day, monthViewDate);
                            const isSelected = format(day, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');

                            return (
                                <TouchableOpacity
                                    key={dayIndex}
                                    className="w-10 h-10 items-center justify-center"
                                    onPress={() => {
                                        setMonthViewDate(day);
                                        onDatePress?.(day);
                                    }}
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
                ))}

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
            <SettingsDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} />

            {/* Header row with icons */}
            <View className="flex-row items-center justify-between mb-1">
                {/* Hamburger Menu - Left */}
                <TouchableOpacity
                    onPress={() => setDrawerVisible(true)}
                    className="p-2 -ml-2"
                >
                    <MaterialCommunityIcons name="menu" size={24} color="white" />
                </TouchableOpacity>

                {/* Sprint Name - Center/Left */}
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

                {/* Notification Icon - Right */}
                <TouchableOpacity
                    onPress={() => router.push('/notifications' as any)}
                    className="p-2 -mr-2"
                >
                    <MaterialCommunityIcons name="bell-outline" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Week or Month View */}
            {isExpanded ? renderMonthView() : renderWeekView()}
        </View>
    );
}
