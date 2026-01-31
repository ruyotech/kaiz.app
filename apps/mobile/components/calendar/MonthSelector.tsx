import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { generateMonthList, MonthItem } from '../../utils/dateHelpers';
import { useRef, useEffect, useCallback } from 'react';

interface MonthSelectorProps {
    currentDate: Date;
    onMonthSelect: (date: Date) => void;
}

export function MonthSelector({ currentDate, onMonthSelect }: MonthSelectorProps) {
    const scrollViewRef = useRef<ScrollView>(null);
    const months = generateMonthList(new Date(), 12); // 12 months before and after current date
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Approximate width of each month item (padding + text + margins)
    const MONTH_ITEM_WIDTH = 70; // px4 (16*2) + text (~30) + mx1 (4*2) ≈ 70
    const YEAR_INDICATOR_WIDTH = 40; // For year labels between Dec-Jan
    
    // Calculate scroll position to center current month
    const scrollToCurrentMonth = useCallback(() => {
        // Find the index of current month (which is at position 12 - the center)
        // Since we generate 12 months before and 12 after, current month is at index 12
        const currentMonthIndex = 12; // Center of the list
        
        // Calculate total width before current month, accounting for year indicators
        let offsetX = 0;
        for (let i = 0; i < currentMonthIndex; i++) {
            offsetX += MONTH_ITEM_WIDTH;
            // Add year indicator width if transitioning from Dec to Jan
            if (i > 0 && months[i - 1]?.month === 11 && months[i]?.month === 0) {
                offsetX += YEAR_INDICATOR_WIDTH;
            }
        }
        
        // Scroll to show current month at the start
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ x: offsetX, animated: false });
        }
    }, [months]);
    
    // Scroll to current month when component mounts
    useEffect(() => {
        // Use a small delay to ensure ScrollView is fully rendered
        const timer = setTimeout(scrollToCurrentMonth, 100);
        return () => clearTimeout(timer);
    }, [scrollToCurrentMonth]);

    const renderYearIndicator = (month: MonthItem, index: number) => {
        // Show year between December and January
        if (index > 0) {
            const prevMonth = months[index - 1];
            if (prevMonth.month === 11 && month.month === 0) {
                return (
                    <View className="items-center justify-center px-3">
                        <Text className="text-xs font-bold text-white">{month.year}</Text>
                    </View>
                );
            }
        }
        return null;
    };

    return (
        <View className="py-3">
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 8 }}
            >
                {months.map((month, index) => {
                    const isSelected = month.month === currentMonth && month.year === currentYear;

                    return (
                        <View key={`${month.year}-${month.month}`} className="flex-row items-center">
                            {renderYearIndicator(month, index)}

                            <TouchableOpacity
                                onPress={() => onMonthSelect(month.date)}
                                className={`px-4 py-2 mx-1 rounded-full ${isSelected
                                        ? 'bg-white'
                                        : 'bg-white/20'
                                    }`}
                            >
                                <Text
                                    className={`text-sm font-semibold ${isSelected
                                            ? 'text-gray-900'
                                            : 'text-white'
                                        }`}
                                >
                                    {month.label}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}
