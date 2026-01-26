import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { ChallengeEntry } from '../../types/models';
import { getDayShort } from '../../utils/localizedDate';

interface ChallengeCalendarProps {
    entries: ChallengeEntry[];
    startDate: string;
    daysToShow?: number;
}

export function ChallengeCalendar({ entries, startDate, daysToShow = 14 }: ChallengeCalendarProps) {
    const start = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Generate last N days
    const days: Date[] = [];
    for (let i = daysToShow - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        if (date >= start) {
            days.push(date);
        }
    }
    
    // Map entries by date
    const entryMap = new Map<string, ChallengeEntry>();
    entries.forEach(entry => {
        const dateKey = entry.date || entry.entryDate || '';
        if (dateKey) entryMap.set(dateKey, entry);
    });
    
    const getDayStatus = (date: Date): 'completed' | 'missed' | 'future' => {
        const dateStr = date.toISOString().split('T')[0];
        const entry = entryMap.get(dateStr);
        
        if (date > today) return 'future';
        if (!entry) return 'missed';
        
        const value = entry.value ?? entry.entryValue;
        if (typeof value === 'boolean') {
            return value ? 'completed' : 'missed';
        } else {
            return (value ?? 0) > 0 ? 'completed' : 'missed';
        }
    };
    
    const getStatusIcon = (status: string): string => {
        switch (status) {
            case 'completed': return '✓';
            case 'missed': return '✗';
            case 'future': return '○';
            default: return '○';
        }
    };
    
    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'completed': return 'bg-green-500';
            case 'missed': return 'bg-red-500';
            case 'future': return 'bg-gray-300';
            default: return 'bg-gray-300';
        }
    };
    
    return (
        <View>
            <Text className="text-sm font-semibold text-gray-700 mb-3">
                Last {daysToShow} Days
            </Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                    {days.map((date, index) => {
                        const status = getDayStatus(date);
                        const statusColor = getStatusColor(status);
                        const dayLabel = getDayShort(date);
                        const dateLabel = date.getDate();
                        
                        return (
                            <View key={index} className="items-center">
                                <Text className="text-xs text-gray-500 mb-1">
                                    {dayLabel}
                                </Text>
                                <View
                                    className={`w-10 h-10 rounded-full ${statusColor} items-center justify-center`}
                                >
                                    <Text className="text-white font-bold">
                                        {getStatusIcon(status)}
                                    </Text>
                                </View>
                                <Text className="text-xs text-gray-600 mt-1">
                                    {dateLabel}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
}
