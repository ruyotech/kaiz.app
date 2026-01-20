import { View, Text, TouchableOpacity } from 'react-native';
import { format, addDays } from 'date-fns';
import { getWeekStartDate, getSprintColor } from '../../utils/dateHelpers';

export function WeekHeader({
    currentDate,
    sprintName,
    showSwipeHint = true,
    onDatePress,
    toggleElement
}: {
    currentDate: Date;
    sprintName: string;
    showSwipeHint?: boolean;
    onDatePress?: (date: Date) => void;
    toggleElement?: React.ReactNode;
}) {
    const weekStart = getWeekStartDate(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const monthName = format(currentDate, 'MMMM yyyy');

    // Today should always be yellow
    const today = new Date();
    const isCurrentWeek = format(today, 'yyyy-MM-dd') >= format(weekStart, 'yyyy-MM-dd') &&
        format(today, 'yyyy-MM-dd') <= format(addDays(weekStart, 6), 'yyyy-MM-dd');
    const bgColor = isCurrentWeek ? 'bg-yellow-500' : 'bg-gray-400';

    return (
        <View className={bgColor + ' pt-12 pb-2 px-4'}>
            {/* Sprint Name (left) and Toggle (right) in one row */}
            <View className="flex-row justify-between items-center mb-3">
                <Text className="text-white text-lg font-bold">{sprintName}</Text>
                {toggleElement}
            </View>

            {/* Week Days - Now clickable! */}
            <View className="flex-row justify-around">
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
        </View>
    );
}
